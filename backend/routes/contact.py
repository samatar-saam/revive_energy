# backend/routes/contact.py
from flask import Blueprint, request, jsonify
from database import db
from models import SupportTicket
from datetime import datetime

contact_bp = Blueprint('contact', __name__, url_prefix='/api/contact')

@contact_bp.route('/submit', methods=['POST', 'OPTIONS'])
def submit_contact():
    # Handle preflight
    if request.method == 'OPTIONS':
        return '', 200

    data = request.get_json() or {}
    name = data.get('name', '').strip()
    email = data.get('email', '').strip().lower()
    phone = data.get('phone', '')
    subject = data.get('subject', '')
    message_body = data.get('message', '').strip()

    if not name or not email or not message_body:
        return jsonify({'error': 'Name, email, and message are required'}), 400

    # Create a support ticket (guest user, no user_id)
    ticket = SupportTicket(
        user_id=None,                     # guest
        name=name,
        email=email,
        subject=subject,
        message=message_body,
        status='open',
        created_at=datetime.utcnow()
    )
    db.session.add(ticket)
    db.session.commit()

    return jsonify({
        'success': True,
        'message': 'Your message has been sent. We will get back to you shortly.',
        'ticket_id': ticket.id
    }), 201