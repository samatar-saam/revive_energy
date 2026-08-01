from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from flask_cors import CORS
from database import db
from models import Dispute, DisputeMessage, User, Payment
from datetime import datetime
import json

disputes_bp = Blueprint('disputes', __name__, url_prefix='/api/disputes')

# ─── ★ CORS – apply to this blueprint ★ ──────────────────────────
CORS(disputes_bp, origins=["http://localhost:5173"], supports_credentials=True)

# ─── Helpers ──────────────────────────────────────────────────────
def get_current_user():
    user_id = get_jwt_identity()
    return User.query.get(int(user_id))

def user_involved_in_dispute(dispute, user_id):
    return (dispute.producer_id == user_id or
            dispute.supplier_id == user_id or
            dispute.transporter_id == user_id)

# ─── GET all disputes (with pagination & filters) ──────────────
@disputes_bp.route('', methods=['GET'])
@jwt_required()
def get_disputes():
    user = get_current_user()
    if not user:
        return jsonify({'message': 'User not found'}), 404

    status = request.args.get('status')
    escrow = request.args.get('escrow')
    role = request.args.get('role')
    search = request.args.get('search')
    page = int(request.args.get('page', 1))
    limit = int(request.args.get('limit', 10))
    sort = request.args.get('sort', 'created_at')
    order = request.args.get('order', 'desc')

    if user.role == 'admin':
        query = Dispute.query
    else:
        query = Dispute.query.filter(
            (Dispute.producer_id == user.id) |
            (Dispute.supplier_id == user.id) |
            (Dispute.transporter_id == user.id)
        )

    if status:
        query = query.filter(Dispute.status == status)
    if escrow:
        query = query.filter(Dispute.escrow_status == escrow)
    if role:
        if role == 'producer':
            query = query.filter(Dispute.producer_id == user.id)
        elif role == 'supplier':
            query = query.filter(Dispute.supplier_id == user.id)
        elif role == 'transporter':
            query = query.filter(Dispute.transporter_id == user.id)

    if search:
        term = f"%{search}%"
        query = query.filter(
            db.or_(
                Dispute.payment_id.ilike(term),
                Dispute.reason.ilike(term),
                Dispute.description.ilike(term)
            )
        )

    sort_column = getattr(Dispute, sort, Dispute.created_at)
    if order == 'desc':
        query = query.order_by(sort_column.desc())
    else:
        query = query.order_by(sort_column.asc())

    total = query.count()
    disputes = query.offset((page - 1) * limit).limit(limit).all()

    result = []
    for d in disputes:
        producer = User.query.get(d.producer_id)
        supplier = User.query.get(d.supplier_id)
        transporter = User.query.get(d.transporter_id) if d.transporter_id else None
        result.append({
            'id': d.id,
            'paymentId': d.payment_id,
            'amount': float(d.amount) if d.amount else 0,
            'status': d.status,
            'escrowStatus': d.escrow_status,
            'createdAt': d.created_at.isoformat() if d.created_at else None,
            'producer': {'id': producer.id, 'name': producer.full_name} if producer else None,
            'supplier': {'id': supplier.id, 'name': supplier.full_name} if supplier else None,
            'transporter': {'id': transporter.id, 'name': transporter.full_name} if transporter else None,
        })

    stats = {
        'total': Dispute.query.count(),
        'open': Dispute.query.filter_by(status='open').count(),
        'underReview': Dispute.query.filter_by(status='under_review').count(),
        'resolved': Dispute.query.filter_by(status='resolved').count(),
        'escrowHeld': Dispute.query.filter_by(escrow_status='held').count(),
        'closed': Dispute.query.filter_by(status='closed').count(),
    }

    return jsonify({
        'disputes': result,
        'stats': stats,
        'page': page,
        'limit': limit,
        'total': total
    }), 200

# ─── GET single dispute ──────────────────────────────────────────
@disputes_bp.route('/<int:dispute_id>', methods=['GET'])
@jwt_required()
def get_dispute(dispute_id):
    user = get_current_user()
    dispute = Dispute.query.get(dispute_id)
    if not dispute:
        return jsonify({'message': 'Dispute not found'}), 404
    if user.role != 'admin' and not user_involved_in_dispute(dispute, user.id):
        return jsonify({'message': 'Unauthorized'}), 403

    producer = User.query.get(dispute.producer_id)
    supplier = User.query.get(dispute.supplier_id)
    transporter = User.query.get(dispute.transporter_id) if dispute.transporter_id else None

    return jsonify({
        'id': dispute.id,
        'paymentId': dispute.payment_id,
        'amount': float(dispute.amount) if dispute.amount else 0,
        'status': dispute.status,
        'escrowStatus': dispute.escrow_status,
        'createdAt': dispute.created_at.isoformat() if dispute.created_at else None,
        'updatedAt': dispute.updated_at.isoformat() if dispute.updated_at else None,
        'producer': {'id': producer.id, 'name': producer.full_name} if producer else None,
        'supplier': {'id': supplier.id, 'name': supplier.full_name} if supplier else None,
        'transporter': {'id': transporter.id, 'name': transporter.full_name} if transporter else None,
        'chat': json.loads(dispute.chat) if dispute.chat else [],
        'evidence': json.loads(dispute.evidence) if dispute.evidence else [],
        'timeline': json.loads(dispute.timeline) if dispute.timeline else [],
        'escrow': {
            'amountHeld': float(dispute.amount_held) if dispute.amount_held else 0,
            'platformFee': float(dispute.platform_fee) if dispute.platform_fee else 0,
            'transportFee': float(dispute.transport_fee) if dispute.transport_fee else 0,
            'supplierAmount': float(dispute.supplier_amount) if dispute.supplier_amount else 0,
            'status': dispute.escrow_status,
        },
        'resolution': {
            'notes': dispute.resolution_notes,
            'decision': dispute.resolution_decision,
            'refundAmount': float(dispute.refund_amount) if dispute.refund_amount else None,
            'releasedAmount': float(dispute.released_amount) if dispute.released_amount else None,
            'finalStatus': dispute.resolution_final_status,
        },
        'adminControls': {
            'canApprove': user.role == 'admin',
            'canReject': user.role == 'admin',
            'canEscalate': user.role == 'admin',
            'canAssignModerator': user.role == 'admin',
            'canFreeze': user.role == 'admin',
            'canClose': user.role == 'admin',
        }
    }), 200

# ─── POST create dispute ─────────────────────────────────────────
@disputes_bp.route('', methods=['POST'])
@jwt_required()
def create_dispute():
    user = get_current_user()
    if not user:
        return jsonify({'message': 'User not found'}), 404

    data = request.get_json() or {}
    payment_id = data.get('paymentId')
    reason = data.get('reason')
    description = data.get('description', '')
    priority = data.get('priority', 'medium')

    if not payment_id or not reason:
        return jsonify({'message': 'Payment ID and Reason are required'}), 400

    payment = Payment.query.get(payment_id)
    if not payment:
        return jsonify({'message': 'Payment not found'}), 404

    timeline_entry = [{
        'description': 'Dispute created',
        'user': user.full_name,
        'timestamp': datetime.utcnow().isoformat(),
        'icon': '📝'
    }]

    dispute = Dispute(
        payment_id=payment_id,
        reason=reason,
        description=description,
        priority=priority,
        status='open',
        escrow_status='held',
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
        producer_id=payment.producer_id,
        supplier_id=payment.supplier_id,
        transporter_id=payment.transporter_id,
        amount=payment.amount,
        amount_held=payment.amount,
        platform_fee=payment.commission or 0,
        transport_fee=payment.transport_fee or 0,
        supplier_amount=payment.supplier_amount or 0,
        evidence=json.dumps([]),
        chat=json.dumps([]),
        timeline=json.dumps(timeline_entry)
    )

    db.session.add(dispute)
    db.session.commit()

    payment.status = 'disputed'
    db.session.commit()

    return jsonify({'message': 'Dispute created', 'id': dispute.id}), 201

# ─── PUT update dispute ──────────────────────────────────────────
@disputes_bp.route('/<int:dispute_id>', methods=['PUT'])
@jwt_required()
def update_dispute(dispute_id):
    user = get_current_user()
    if user.role != 'admin':
        return jsonify({'message': 'Only admins can update disputes'}), 403

    dispute = Dispute.query.get(dispute_id)
    if not dispute:
        return jsonify({'message': 'Dispute not found'}), 404

    data = request.get_json() or {}
    allowed = ['status', 'escrow_status', 'reason', 'description', 'priority']
    for field in allowed:
        if field in data:
            setattr(dispute, field, data[field])
    dispute.updated_at = datetime.utcnow()
    db.session.commit()
    return jsonify({'message': 'Dispute updated'}), 200

# ─── DELETE dispute ──────────────────────────────────────────────
@disputes_bp.route('/<int:dispute_id>', methods=['DELETE'])
@jwt_required()
def delete_dispute(dispute_id):
    user = get_current_user()
    if user.role != 'admin':
        return jsonify({'message': 'Unauthorized'}), 403

    dispute = Dispute.query.get(dispute_id)
    if not dispute:
        return jsonify({'message': 'Dispute not found'}), 404

    db.session.delete(dispute)
    db.session.commit()
    return jsonify({'message': 'Dispute deleted'}), 200

# ─── POST chat message (legacy, using the `chat` field) ─────────
@disputes_bp.route('/<int:dispute_id>/chat', methods=['POST'])
@jwt_required()
def add_chat_message(dispute_id):
    user = get_current_user()
    dispute = Dispute.query.get(dispute_id)
    if not dispute:
        return jsonify({'message': 'Dispute not found'}), 404
    if user.role != 'admin' and not user_involved_in_dispute(dispute, user.id):
        return jsonify({'message': 'Unauthorized'}), 403

    data = request.get_json() or {}
    message = data.get('message')
    if not message:
        return jsonify({'message': 'Message is required'}), 400

    chat_list = json.loads(dispute.chat) if dispute.chat else []
    chat_list.append({
        'sender': user.full_name,
        'sender_id': user.id,
        'message': message,
        'timestamp': datetime.utcnow().isoformat(),
        'sender_role': user.role,
    })
    dispute.chat = json.dumps(chat_list)
    dispute.updated_at = datetime.utcnow()
    db.session.commit()

    return jsonify({
        'id': len(chat_list) - 1,
        'sender': user.full_name,
        'message': message,
        'timestamp': datetime.utcnow().isoformat(),
        'sender_role': user.role,
    }), 201

# ─── POST upload evidence ────────────────────────────────────────
@disputes_bp.route('/<int:dispute_id>/evidence', methods=['POST'])
@jwt_required()
def upload_evidence(dispute_id):
    user = get_current_user()
    dispute = Dispute.query.get(dispute_id)
    if not dispute:
        return jsonify({'message': 'Dispute not found'}), 404
    if user.role != 'admin' and not user_involved_in_dispute(dispute, user.id):
        return jsonify({'message': 'Unauthorized'}), 403

    if 'evidence' not in request.files:
        return jsonify({'message': 'No evidence file provided'}), 400

    files = request.files.getlist('evidence')
    if not files:
        return jsonify({'message': 'No files selected'}), 400

    evidence_list = json.loads(dispute.evidence) if dispute.evidence else []
    for file in files:
        evidence_list.append({
            'name': file.filename,
            'type': file.content_type,
            'size': 0,
            'url': f'/uploads/{file.filename}'
        })
    dispute.evidence = json.dumps(evidence_list)
    dispute.updated_at = datetime.utcnow()
    db.session.commit()

    return jsonify({'files': evidence_list}), 201

# ─── POST resolve dispute ────────────────────────────────────────
@disputes_bp.route('/<int:dispute_id>/resolve', methods=['POST'])
@jwt_required()
def resolve_dispute(dispute_id):
    user = get_current_user()
    if user.role != 'admin':
        return jsonify({'message': 'Only admins can resolve disputes'}), 403

    dispute = Dispute.query.get(dispute_id)
    if not dispute:
        return jsonify({'message': 'Dispute not found'}), 404

    data = request.get_json() or {}
    notes = data.get('notes')
    decision = data.get('decision')
    refund_amount = data.get('refundAmount')
    released_amount = data.get('releasedAmount')
    final_status = data.get('finalStatus')

    if not decision:
        return jsonify({'message': 'Decision is required'}), 400

    dispute.status = 'resolved'
    dispute.resolution_notes = notes
    dispute.resolution_decision = decision
    dispute.refund_amount = refund_amount
    dispute.released_amount = released_amount
    dispute.resolution_final_status = final_status or 'resolved'
    dispute.updated_at = datetime.utcnow()

    if decision == 'refund':
        dispute.escrow_status = 'refunded'
    elif decision == 'release':
        dispute.escrow_status = 'released'
    elif decision == 'partial':
        dispute.escrow_status = 'released'

    timeline = json.loads(dispute.timeline) if dispute.timeline else []
    timeline.append({
        'description': f'Dispute resolved by {user.full_name}',
        'user': user.full_name,
        'timestamp': datetime.utcnow().isoformat(),
        'icon': '✅'
    })
    dispute.timeline = json.dumps(timeline)
    db.session.commit()

    return jsonify({'message': 'Dispute resolved'}), 200

# ─── POST release escrow ─────────────────────────────────────────
@disputes_bp.route('/<int:dispute_id>/release', methods=['POST'])
@jwt_required()
def release_escrow(dispute_id):
    user = get_current_user()
    if user.role != 'admin':
        return jsonify({'message': 'Only admins can release escrow'}), 403

    dispute = Dispute.query.get(dispute_id)
    if not dispute:
        return jsonify({'message': 'Dispute not found'}), 404
    if dispute.escrow_status != 'held':
        return jsonify({'message': 'Escrow is not held'}), 400

    dispute.escrow_status = 'released'
    dispute.updated_at = datetime.utcnow()
    timeline = json.loads(dispute.timeline) if dispute.timeline else []
    timeline.append({
        'description': f'Escrow released by {user.full_name}',
        'user': user.full_name,
        'timestamp': datetime.utcnow().isoformat(),
        'icon': '💰'
    })
    dispute.timeline = json.dumps(timeline)
    db.session.commit()
    return jsonify({'message': 'Escrow released'}), 200

# ─── POST refund producer ────────────────────────────────────────
@disputes_bp.route('/<int:dispute_id>/refund', methods=['POST'])
@jwt_required()
def refund_dispute(dispute_id):
    user = get_current_user()
    if user.role != 'admin':
        return jsonify({'message': 'Only admins can refund'}), 403

    dispute = Dispute.query.get(dispute_id)
    if not dispute:
        return jsonify({'message': 'Dispute not found'}), 404
    if dispute.escrow_status != 'held':
        return jsonify({'message': 'Escrow is not held'}), 400

    dispute.escrow_status = 'refunded'
    dispute.status = 'refunded'
    dispute.updated_at = datetime.utcnow()
    timeline = json.loads(dispute.timeline) if dispute.timeline else []
    timeline.append({
        'description': f'Refund processed by {user.full_name}',
        'user': user.full_name,
        'timestamp': datetime.utcnow().isoformat(),
        'icon': '↩️'
    })
    dispute.timeline = json.dumps(timeline)
    db.session.commit()
    return jsonify({'message': 'Refund processed'}), 200

# ─── GET messages (new, using `DisputeMessage` table) ───────────
@disputes_bp.route('/<int:dispute_id>/messages', methods=['GET'])
@jwt_required()
def get_dispute_messages(dispute_id):
    user_id = int(get_jwt_identity())
    dispute = Dispute.query.get(dispute_id)
    if not dispute:
        return jsonify({'message': 'Dispute not found'}), 404

    user = User.query.get(user_id)
    if not (user.role == 'admin' or user.id in [dispute.producer_id, dispute.supplier_id, dispute.transporter_id]):
        return jsonify({'message': 'Unauthorized'}), 403

    messages = dispute.messages.filter(DisputeMessage.deleted == False).order_by(DisputeMessage.created_at.asc()).all()
    return jsonify([m.to_dict() for m in messages]), 200

# ─── POST message (new, using `DisputeMessage` table) ───────────
@disputes_bp.route('/<int:dispute_id>/messages', methods=['POST'])
@jwt_required()
def send_dispute_message(dispute_id):
    user_id = int(get_jwt_identity())
    data = request.get_json() or {}
    message_text = data.get('message', '').strip()
    if not message_text:
        return jsonify({'message': 'Message is required'}), 400

    dispute = Dispute.query.get(dispute_id)
    if not dispute:
        return jsonify({'message': 'Dispute not found'}), 404

    user = User.query.get(user_id)
    if not (user.role == 'admin' or user.id in [dispute.producer_id, dispute.supplier_id, dispute.transporter_id]):
        return jsonify({'message': 'Unauthorized'}), 403

    new_msg = DisputeMessage(
        dispute_id=dispute.id,
        sender_id=user_id,
        message=message_text,
        is_admin=(user.role == 'admin')
    )
    db.session.add(new_msg)
    db.session.commit()

    return jsonify(new_msg.to_dict()), 201

# ─── DELETE message (soft‑delete) ───────────────────────────────
@disputes_bp.route('/<int:dispute_id>/messages/<int:message_id>', methods=['DELETE'])
@jwt_required()
def delete_dispute_message(dispute_id, message_id):
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    message = DisputeMessage.query.get(message_id)
    if not message:
        return jsonify({'message': 'Message not found'}), 404
    if message.dispute_id != dispute_id:
        return jsonify({'message': 'Message does not belong to this dispute'}), 400
    # Allow sender or admin to delete
    if user.role != 'admin' and message.sender_id != user_id:
        return jsonify({'message': 'Unauthorized'}), 403
    # Soft delete
    message.deleted = True
    db.session.commit()
    return jsonify({'message': 'Message deleted'}), 200