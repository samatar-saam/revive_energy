from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from database import db
from models import Conversation, Message, User
from utils.decorators import role_required

messages_bp = Blueprint('messages', __name__)


# ─── GET ALL CONVERSATIONS ──────────────────────────────────
@messages_bp.route('/messages/conversations', methods=['GET'])
@jwt_required()
def get_conversations():
    user_id = get_jwt_identity()
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
    user_id = get_jwt_identity()
    conv = Conversation.query.get_or_404(conversation_id)
    
    # Check user belongs to this conversation
    if conv.supplier_id != user_id and conv.producer_id != user_id and conv.transporter_id != user_id:
        return jsonify({'message': 'Unauthorized'}), 403

    # Mark incoming messages as read for this user
    unread_messages = conv.messages.filter(
        Message.receiver_id == user_id,
        Message.is_read == False
    ).all()
    for msg in unread_messages:
        msg.is_read = True
    db.session.commit()

    # Return all messages
    all_msgs = conv.messages.order_by(Message.created_at.asc()).all()
    return jsonify([m.to_dict() for m in all_msgs]), 200


# ─── SEND A NEW MESSAGE ──────────────────────────────────────
@messages_bp.route('/messages/send', methods=['POST'])
@jwt_required()
def send_message():
    data = request.get_json()
    if not data:
        return jsonify({'message': 'No data provided'}), 400

    conversation_id = data.get('conversation_id')
    message_text = data.get('message')
    if not conversation_id or not message_text:
        return jsonify({'message': 'Missing required fields'}), 400

    conv = Conversation.query.get_or_404(conversation_id)
    sender_id = get_jwt_identity()

    # Determine receiver (the other participant that is not the sender)
    receiver_id = None
    if conv.supplier_id and conv.supplier_id != sender_id:
        receiver_id = conv.supplier_id
    elif conv.producer_id and conv.producer_id != sender_id:
        receiver_id = conv.producer_id
    elif conv.transporter_id and conv.transporter_id != sender_id:
        receiver_id = conv.transporter_id

    if not receiver_id:
        return jsonify({'message': 'No valid receiver found in this conversation'}), 400

    # Create message
    msg = Message(
        conversation_id=conversation_id,
        sender_id=sender_id,
        receiver_id=receiver_id,
        message=message_text
    )
    db.session.add(msg)
    db.session.commit()

    return jsonify(msg.to_dict()), 201


# ─── MARK A MESSAGE AS READ ─────────────────────────────────
@messages_bp.route('/messages/read/<int:message_id>', methods=['PATCH'])
@jwt_required()
def mark_read(message_id):
    user_id = get_jwt_identity()
    msg = Message.query.get_or_404(message_id)
    if msg.receiver_id != user_id:
        return jsonify({'message': 'Unauthorized'}), 403
    msg.is_read = True
    db.session.commit()
    return jsonify({'message': 'Marked as read'}), 200