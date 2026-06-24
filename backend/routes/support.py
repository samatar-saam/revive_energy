# backend/routes/support.py
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from database import db
from models.support import SupportTicket

support_bp = Blueprint('support', __name__)

# ========== GET ALL SUPPORT TICKETS ==========
@support_bp.route('/api/support', methods=['GET'])
@jwt_required()
def get_tickets():
    user_id = get_jwt_identity()
    tickets = SupportTicket.query.filter_by(user_id=user_id).order_by(SupportTicket.created_at.desc()).all()
    return jsonify([t.to_dict() for t in tickets]), 200

# ========== SUBMIT NEW SUPPORT TICKET ==========
@support_bp.route('/api/support', methods=['POST'])
@jwt_required()
def submit_ticket():
    user_id = get_jwt_identity()
    data = request.get_json()
    
    if not data.get('subject') or not data.get('message'):
        return jsonify({'message': 'Subject and message are required'}), 400
    
    ticket = SupportTicket(
        user_id=user_id,
        subject=data['subject'],
        message=data['message'],
        email=data.get('email', ''),
        name=data.get('name', ''),
        status='open'
    )
    
    db.session.add(ticket)
    db.session.commit()
    
    return jsonify({
        'message': 'Support ticket submitted successfully. We\'ll respond within 24 hours.',
        'id': ticket.id
    }), 201