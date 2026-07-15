from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from database import db
from models import SupportTicket, PartnershipApplication, User
from datetime import datetime

contact_bp = Blueprint('contact', __name__, url_prefix='/api/contact')


# ─── Existing contact form endpoint ──────────────────────────────
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


# ─── NEW: Partnership Application endpoints ──────────────────────

@contact_bp.route('/partnership', methods=['POST'])
def submit_partnership():
    """
    Submit a partnership application (public endpoint).
    """
    try:
        data = request.get_json()

        # ─── Validate required fields ──────────────────────────
        required = ['organizationName', 'contactName', 'email', 'phone', 'organizationType']
        for field in required:
            if not data.get(field):
                return jsonify({'message': f'{field} is required'}), 400

        # ─── Create application ────────────────────────────────
        application = PartnershipApplication(
            organization_name=data['organizationName'].strip(),
            contact_name=data['contactName'].strip(),
            email=data['email'].strip().lower(),
            phone=data['phone'].strip(),
            organization_type=data['organizationType'].strip(),
            waste_types=','.join(data.get('wasteTypes', [])),
            message=data.get('message', '').strip(),
            status='pending',
            created_at=datetime.utcnow()
        )

        db.session.add(application)
        db.session.commit()

        return jsonify({
            'message': 'Application submitted successfully',
            'application_id': application.id,
            'status': 'pending'
        }), 201

    except Exception as e:
        db.session.rollback()
        print(f"❌ Partnership application error: {e}")
        return jsonify({'message': str(e)}), 500


@contact_bp.route('/partnerships', methods=['GET'])
@jwt_required()
def get_partnership_applications():
    """
    Get all partnership applications (admin only).
    """
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)

    if not user or user.role != 'admin':
        return jsonify({'message': 'Unauthorized'}), 403

    status = request.args.get('status')
    query = PartnershipApplication.query

    if status:
        query = query.filter_by(status=status)

    applications = query.order_by(PartnershipApplication.created_at.desc()).all()

    return jsonify({
        'applications': [app.to_dict() for app in applications],
        'count': len(applications)
    }), 200


@contact_bp.route('/partnership/<int:app_id>', methods=['GET'])
@jwt_required()
def get_partnership_application(app_id):
    """
    Get a specific partnership application (admin only).
    """
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)

    if not user or user.role != 'admin':
        return jsonify({'message': 'Unauthorized'}), 403

    application = PartnershipApplication.query.get(app_id)
    if not application:
        return jsonify({'message': 'Application not found'}), 404

    return jsonify(application.to_dict()), 200


@contact_bp.route('/partnership/<int:app_id>/status', methods=['PATCH'])
@jwt_required()
def update_partnership_status(app_id):
    """
    Update application status (admin only).
    Allowed statuses: pending, reviewed, contacted, rejected.
    """
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)

    if not user or user.role != 'admin':
        return jsonify({'message': 'Unauthorized'}), 403

    application = PartnershipApplication.query.get(app_id)
    if not application:
        return jsonify({'message': 'Application not found'}), 404

    data = request.get_json()
    new_status = data.get('status')

    if new_status not in ['pending', 'reviewed', 'contacted', 'rejected']:
        return jsonify({'message': 'Invalid status'}), 400

    application.status = new_status
    application.updated_at = datetime.utcnow()
    db.session.commit()

    return jsonify({
        'message': f'Status updated to {new_status}',
        'application': application.to_dict()
    }), 200