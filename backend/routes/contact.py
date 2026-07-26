from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from flask_mail import Message
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


# ─── Partnership Application endpoints ──────────────────────

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
        current_app.logger.error(f"❌ Partnership application error: {e}")
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


# ─── ★ NEW: Approve and Reject with Email Notifications ★ ──

def send_partnership_status_email(application, status, admin_notes=None):
    """
    Send an email to the applicant about their partnership application status.
    """
    try:
        if status == 'approved':
            subject = "✅ Partnership Application Approved – ReVive Energy"
            body = f"""
Dear {application.contact_name},

Congratulations! Your partnership application for **{application.organization_name}** has been **approved** by ReVive Energy.

We're excited to welcome you to our ecosystem. A member of our partnerships team will contact you shortly to discuss next steps.

If you have any questions, please don't hesitate to reach out:
📞 Phone: +254 727 568 271
📧 Email: partnerships@revive-energy.com

We look forward to building a sustainable future together.

Best regards,
The ReVive Energy Team
"""
        else:  # rejected
            subject = "📄 Partnership Application Update – ReVive Energy"
            body = f"""
Dear {application.contact_name},

Thank you for your interest in partnering with ReVive Energy.

After careful review, we regret to inform you that your application for **{application.organization_name}** has not been approved at this time.

We appreciate your interest and encourage you to stay connected with us. If you have any questions, please contact us:

📞 Phone: +254 727 568 271
📧 Email: partnerships@revive-energy.com

We wish you all the best in your sustainability journey.

Yours sincerely,
The ReVive Energy Team
"""

        # Add admin notes if provided
        if admin_notes:
            body += f"\n\nNotes from admin:\n{admin_notes}"

        msg = Message(
            subject=subject,
            recipients=[application.email],
            body=body
        )

        mail = current_app.extensions['mail']
        mail.send(msg)
        current_app.logger.info(f"Partnership status email sent to {application.email} ({status})")
        return True

    except Exception as e:
        current_app.logger.error(f"Failed to send partnership email: {e}")
        return False


@contact_bp.route('/partnership/<int:app_id>/approve', methods=['POST'])
@jwt_required()
def approve_partnership(app_id):
    """
    Approve a partnership application (admin only).
    Sends a welcome email to the applicant.
    """
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)

    if not user or user.role != 'admin':
        return jsonify({'message': 'Unauthorized'}), 403

    application = PartnershipApplication.query.get(app_id)
    if not application:
        return jsonify({'message': 'Application not found'}), 404

    if application.status != 'pending':
        return jsonify({'message': f'Application is already {application.status}'}), 400

    data = request.get_json() or {}
    admin_notes = data.get('admin_notes', '')

    # Update status
    application.status = 'approved'
    application.updated_at = datetime.utcnow()
    application.admin_notes = admin_notes
    db.session.commit()

    # Send email
    email_sent = send_partnership_status_email(application, 'approved', admin_notes)

    return jsonify({
        'message': 'Application approved successfully',
        'application': application.to_dict(),
        'email_sent': email_sent
    }), 200


@contact_bp.route('/partnership/<int:app_id>/reject', methods=['POST'])
@jwt_required()
def reject_partnership(app_id):
    """
    Reject a partnership application (admin only).
    Sends a polite rejection email to the applicant.
    """
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)

    if not user or user.role != 'admin':
        return jsonify({'message': 'Unauthorized'}), 403

    application = PartnershipApplication.query.get(app_id)
    if not application:
        return jsonify({'message': 'Application not found'}), 404

    if application.status != 'pending':
        return jsonify({'message': f'Application is already {application.status}'}), 400

    data = request.get_json() or {}
    admin_notes = data.get('admin_notes', '')

    # Update status
    application.status = 'rejected'
    application.updated_at = datetime.utcnow()
    application.admin_notes = admin_notes
    db.session.commit()

    # Send email
    email_sent = send_partnership_status_email(application, 'rejected', admin_notes)

    return jsonify({
        'message': 'Application rejected successfully',
        'application': application.to_dict(),
        'email_sent': email_sent
    }), 200


# ─── (Optional) Keep the old status update endpoint if needed ──

@contact_bp.route('/partnership/<int:app_id>/status', methods=['PATCH'])
@jwt_required()
def update_partnership_status(app_id):
    """
    Update application status (admin only).
    Allowed statuses: pending, reviewed, contacted, rejected.
    (Deprecated – use /approve or /reject instead)
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

    if new_status not in ['pending', 'reviewed', 'contacted', 'rejected', 'approved']:
        return jsonify({'message': 'Invalid status'}), 400

    application.status = new_status
    application.updated_at = datetime.utcnow()
    db.session.commit()

    return jsonify({
        'message': f'Status updated to {new_status}',
        'application': application.to_dict()
    }), 200