import os
import uuid
from werkzeug.utils import secure_filename
from flask import Blueprint, request, jsonify, current_app, url_for
from flask_jwt_extended import jwt_required, get_jwt_identity
from database import db
from models import Conversation, Message, User
from utils.decorators import role_required

messages_bp = Blueprint('messages', __name__)

ALLOWED_ATTACHMENT_EXTENSIONS = {
    'png', 'jpg', 'jpeg', 'gif', 'webp',
    'pdf', 'doc', 'docx', 'xls', 'xlsx', 'csv', 'txt',
    'webm', 'mp3', 'wav', 'm4a', 'ogg'
}


def _current_user_id():
    """get_jwt_identity() returns whatever type the token was minted with
    (usually a string). DB foreign keys are ints, so comparisons like
    `conv.supplier_id != user_id` silently fail ("23" != 23) and return
    403 for legitimate participants. Normalize once, here, and use this
    everywhere instead of calling get_jwt_identity() directly."""
    identity = get_jwt_identity()
    try:
        return int(identity)
    except (TypeError, ValueError):
        return identity


def _is_participant(conv, user_id):
    return user_id in {conv.supplier_id, conv.producer_id, conv.transporter_id}


def _other_participant_id(conv, user_id):
    """The conversation's other participant relative to user_id, or None."""
    if conv.supplier_id and conv.supplier_id != user_id:
        return conv.supplier_id
    if conv.producer_id and conv.producer_id != user_id:
        return conv.producer_id
    if conv.transporter_id and conv.transporter_id != user_id:
        return conv.transporter_id
    return None


def _allowed_attachment(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_ATTACHMENT_EXTENSIONS


def _save_attachment(file_storage):
    """Persists an uploaded attachment under /static/uploads/messages and
    returns (url, original_name, mime_type). Raises ValueError on a
    disallowed extension."""
    original_name = secure_filename(file_storage.filename or 'attachment')
    if not _allowed_attachment(original_name):
        raise ValueError('File type not allowed')

    upload_dir = os.path.join(current_app.root_path, 'static', 'uploads', 'messages')
    os.makedirs(upload_dir, exist_ok=True)

    ext = original_name.rsplit('.', 1)[1].lower()
    stored_name = f"{uuid.uuid4().hex}.{ext}"
    file_storage.save(os.path.join(upload_dir, stored_name))

    attachment_url = url_for('static', filename=f'uploads/messages/{stored_name}', _external=True)
    return attachment_url, original_name, file_storage.mimetype


# ─── GET ALL CONVERSATIONS ──────────────────────────────────
@messages_bp.route('/messages/conversations', methods=['GET'])
@jwt_required()
def get_conversations():
    user_id = _current_user_id()
    conversations = Conversation.query.filter(
        (Conversation.supplier_id == user_id) |
        (Conversation.producer_id == user_id) |
        (Conversation.transporter_id == user_id)
    ).order_by(Conversation.created_at.desc()).all()

    result = []
    for conv in conversations:
        conv_dict = conv.to_dict(user_id)
        # Only include conversations where a participant is identified
        if conv_dict.get('participant') is not None:
            result.append(conv_dict)

    return jsonify(result), 200


# ─── GET MESSAGES FOR A CONVERSATION ────────────────────────
@messages_bp.route('/messages/conversations/<int:conversation_id>', methods=['GET'])
@jwt_required()
def get_messages(conversation_id):
    user_id = _current_user_id()
    conv = Conversation.query.get_or_404(conversation_id)

    if not _is_participant(conv, user_id):
        return jsonify({'message': 'Unauthorized'}), 403

    # Mark incoming messages as read for this user
    unread_messages = conv.messages.filter(
        Message.receiver_id == user_id,
        Message.is_read == False
    ).all()
    for msg in unread_messages:
        msg.is_read = True
    db.session.commit()

    all_msgs = conv.messages.order_by(Message.created_at.asc()).all()
    return jsonify([m.to_dict() for m in all_msgs]), 200


# ─── MARK AN ENTIRE CONVERSATION AS READ ────────────────────
# Called when a conversation is opened in the UI.
@messages_bp.route('/messages/conversations/<int:conversation_id>/read', methods=['PUT'])
@jwt_required()
def mark_conversation_read(conversation_id):
    user_id = _current_user_id()
    conv = Conversation.query.get_or_404(conversation_id)

    if not _is_participant(conv, user_id):
        return jsonify({'message': 'Unauthorized'}), 403

    unread_messages = conv.messages.filter(
        Message.receiver_id == user_id,
        Message.is_read == False
    ).all()
    for msg in unread_messages:
        msg.is_read = True
    db.session.commit()

    return jsonify({'message': 'Conversation marked as read', 'updated': len(unread_messages)}), 200


# ─── SEND A NEW MESSAGE (text and/or attachment) ─────────────
@messages_bp.route('/messages/send', methods=['POST'])
@jwt_required()
def send_message():
    sender_id = _current_user_id()
    is_multipart = request.content_type and 'multipart/form-data' in request.content_type

    if is_multipart:
        conversation_id = request.form.get('conversation_id')
        message_text = request.form.get('message', '')
        attachment_file = request.files.get('attachment')
    else:
        data = request.get_json()
        if not data:
            return jsonify({'message': 'No data provided'}), 400
        conversation_id = data.get('conversation_id')
        message_text = data.get('message', '')
        attachment_file = None

    if not conversation_id:
        return jsonify({'message': 'Missing required fields'}), 400
    if not message_text and not attachment_file:
        return jsonify({'message': 'Message must include text or an attachment'}), 400

    conv = Conversation.query.get_or_404(conversation_id)
    if not _is_participant(conv, sender_id):
        return jsonify({'message': 'Unauthorized'}), 403

    receiver_id = _other_participant_id(conv, sender_id)
    if not receiver_id:
        return jsonify({'message': 'No valid receiver found in this conversation'}), 400

    msg = Message(
        conversation_id=conversation_id,
        sender_id=sender_id,
        receiver_id=receiver_id,
        message=message_text
    )

    if attachment_file and attachment_file.filename:
        try:
            attachment_url, attachment_name, attachment_type = _save_attachment(attachment_file)
        except ValueError as e:
            return jsonify({'message': str(e)}), 400
        # NOTE: Message model needs attachment_url / attachment_name /
        # attachment_type columns — see migration note below.
        msg.attachment_url = attachment_url
        msg.attachment_name = attachment_name
        msg.attachment_type = attachment_type

    db.session.add(msg)
    db.session.commit()

    return jsonify(msg.to_dict()), 201


# ─── LOG A CALL OUTCOME (missed / completed / declined) ──────
# The frontend calls this when a call ends: after the ring timeout with
# no answer, when the caller hangs up before it connects (also treated
# as missed), or when an ongoing call ends normally (completed, with
# duration). It's persisted as a message so the other participant sees
# "Missed voice call" etc. in the thread next time they open it — that's
# what makes the missed call something they actually "receive".
@messages_bp.route('/messages/conversations/<int:conversation_id>/call-log', methods=['POST'])
@jwt_required()
def log_call(conversation_id):
    caller_id = _current_user_id()
    conv = Conversation.query.get_or_404(conversation_id)

    if not _is_participant(conv, caller_id):
        return jsonify({'message': 'Unauthorized'}), 403

    data = request.get_json() or {}
    call_type = data.get('call_type')
    call_status = data.get('call_status', 'missed')
    duration = int(data.get('duration') or 0)

    if call_type not in ('audio', 'video'):
        return jsonify({'message': 'call_type must be "audio" or "video"'}), 400
    if call_status not in ('missed', 'completed', 'declined'):
        return jsonify({'message': 'Invalid call_status'}), 400

    receiver_id = _other_participant_id(conv, caller_id)
    if not receiver_id:
        return jsonify({'message': 'No valid receiver found in this conversation'}), 400

    label = 'Video call' if call_type == 'video' else 'Voice call'
    if call_status == 'missed':
        text = f'Missed {label.lower()}'
    elif call_status == 'declined':
        text = f'{label} declined'
    else:
        mins, secs = divmod(duration, 60)
        text = f'{label} · {mins}:{secs:02d}'

    # NOTE: Message model needs message_type / call_type / call_status
    # columns — see migration note below.
    msg = Message(
        conversation_id=conversation_id,
        sender_id=caller_id,
        receiver_id=receiver_id,
        message=text,
        message_type='call',
        call_type=call_type,
        call_status=call_status
    )
    db.session.add(msg)
    db.session.commit()

    return jsonify(msg.to_dict()), 201
@messages_bp.route('/messages/read/<int:message_id>', methods=['PATCH'])
@jwt_required()
def mark_read(message_id):
    user_id = _current_user_id()
    msg = Message.query.get_or_404(message_id)
    if msg.receiver_id != user_id:
        return jsonify({'message': 'Unauthorized'}), 403
    msg.is_read = True
    db.session.commit()
    return jsonify({'message': 'Marked as read'}), 200


# ─── DELETE A SINGLE MESSAGE ("delete for everyone") ─────────
# "Delete for me" is handled entirely client-side (hidden locally per
# viewer), so it never hits this route. This route only covers the
# sender redacting a message for both participants.
@messages_bp.route('/messages/<int:message_id>', methods=['DELETE'])
@jwt_required()
def delete_message(message_id):
    user_id = _current_user_id()
    msg = Message.query.get_or_404(message_id)

    data = request.get_json(silent=True) or {}
    scope = data.get('scope', 'everyone')

    if scope == 'everyone' and msg.sender_id != user_id:
        return jsonify({'message': 'Only the sender can delete a message for everyone'}), 403

    conv = Conversation.query.get_or_404(msg.conversation_id)
    if not _is_participant(conv, user_id):
        return jsonify({'message': 'Unauthorized'}), 403

    # Redact rather than hard-delete, so both sides can render
    # "This message was deleted" instead of the row simply vanishing.
    msg.message = ''
    msg.is_deleted = True
    if hasattr(msg, 'attachment_url'):
        msg.attachment_url = None
    db.session.commit()

    return jsonify(msg.to_dict()), 200


# ─── CLEAR ALL MESSAGES IN A CONVERSATION ────────────────────
@messages_bp.route('/messages/conversations/<int:conversation_id>/messages', methods=['DELETE'])
@jwt_required()
def clear_chat(conversation_id):
    user_id = _current_user_id()
    conv = Conversation.query.get_or_404(conversation_id)

    if not _is_participant(conv, user_id):
        return jsonify({'message': 'Unauthorized'}), 403

    deleted = conv.messages.delete()
    db.session.commit()

    return jsonify({'message': 'Chat cleared', 'deleted': deleted}), 200


# ─── DELETE AN ENTIRE CONVERSATION ────────────────────────────
@messages_bp.route('/messages/conversations/<int:conversation_id>', methods=['DELETE'])
@jwt_required()
def delete_conversation(conversation_id):
    user_id = _current_user_id()
    conv = Conversation.query.get_or_404(conversation_id)

    if not _is_participant(conv, user_id):
        return jsonify({'message': 'Unauthorized'}), 403

    conv.messages.delete()
    db.session.delete(conv)
    db.session.commit()

    return jsonify({'message': 'Conversation deleted'}), 200