# backend/models/legacy.py

from datetime import datetime
from database import db

# ========== COLLECTION (legacy) ==========
class Collection(db.Model):
    __tablename__ = 'collections'
    id = db.Column(db.Integer, primary_key=True)
    supplier_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    processor_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    transporter_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    waste_type = db.Column(db.String(100), nullable=False)
    quantity = db.Column(db.Float, nullable=False)
    unit = db.Column(db.String(20), default='kg')
    location = db.Column(db.String(100), nullable=False)
    address = db.Column(db.String(200))
    pickup_datetime = db.Column(db.DateTime, nullable=False)
    special_instructions = db.Column(db.Text)
    contact_name = db.Column(db.String(100))
    contact_phone = db.Column(db.String(20))
    status = db.Column(db.String(50), default='pending')
    energy_generated = db.Column(db.Float, default=0)
    carbon_offset = db.Column(db.Float, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'waste_type': self.waste_type,
            'quantity': self.quantity,
            'unit': self.unit,
            'location': self.location,
            'address': self.address,
            'pickup_datetime': self.pickup_datetime.isoformat() if self.pickup_datetime else None,
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

# ========== WASTE (legacy) ==========
class Waste(db.Model):
    __tablename__ = 'waste'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    waste_type = db.Column(db.String(100), nullable=False)
    quantity = db.Column(db.Float, nullable=False)
    unit = db.Column(db.String(20), default='kg')
    description = db.Column(db.Text)
    location = db.Column(db.String(100), nullable=False)
    address = db.Column(db.String(200))
    date_generated = db.Column(db.Date, default=datetime.utcnow)
    status = db.Column(db.String(50), default='available')
    energy_generated = db.Column(db.Float, default=0.0)
    carbon_offset = db.Column(db.Float, default=0.0)
    contact_name = db.Column(db.String(100))
    contact_phone = db.Column(db.String(20))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'waste_type': self.waste_type,
            'quantity': self.quantity,
            'unit': self.unit,
            'description': self.description,
            'location': self.location,
            'address': self.address,
            'date_generated': self.date_generated.isoformat() if self.date_generated else None,
            'status': self.status,
            'energy_generated': self.energy_generated,
            'carbon_offset': self.carbon_offset,
            'contact_name': self.contact_name,
            'contact_phone': self.contact_phone,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

# ========== WASTE LISTING ==========
class WasteListing(db.Model):
    __tablename__ = 'waste_listings'
    id = db.Column(db.Integer, primary_key=True)
    supplier_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    waste_type = db.Column(db.String(100), nullable=False)
    category = db.Column(db.String(50))
    quantity = db.Column(db.Float, nullable=False)
    unit = db.Column(db.String(20), default='kg')
    location = db.Column(db.String(100), nullable=False)
    pickup_address = db.Column(db.String(200))
    description = db.Column(db.Text)
    image_url = db.Column(db.String(255))
    status = db.Column(db.String(20), default='available')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    requests = db.relationship('WasteRequest', backref='listing', lazy=True)
    transport_jobs = db.relationship('TransportJob', backref='listing', lazy=True)

# ========== WASTE REQUEST ==========
class WasteRequest(db.Model):
    __tablename__ = 'waste_requests'
    id = db.Column(db.Integer, primary_key=True)
    producer_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    listing_id = db.Column(db.Integer, db.ForeignKey('waste_listings.id'), nullable=False)
    supplier_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    status = db.Column(db.String(20), default='pending')
    message = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    transport_job = db.relationship('TransportJob', backref='request', uselist=False)

# ========== TRANSPORT JOB ==========
class TransportJob(db.Model):
    __tablename__ = 'transport_jobs'
    id = db.Column(db.Integer, primary_key=True)
    request_id = db.Column(db.Integer, db.ForeignKey('waste_requests.id'), nullable=False)
    listing_id = db.Column(db.Integer, db.ForeignKey('waste_listings.id'), nullable=False)
    supplier_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    producer_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    transporter_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    pickup_location = db.Column(db.String(100), nullable=False)
    delivery_location = db.Column(db.String(100), nullable=False)
    waste_type = db.Column(db.String(100), nullable=False)
    quantity = db.Column(db.Float, nullable=False)
    status = db.Column(db.String(20), default='open')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

# ========== PAYMENT ==========
class Payment(db.Model):
    __tablename__ = 'payments'
    id = db.Column(db.Integer, primary_key=True)
    payer_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    supplier_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    producer_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    transporter_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    listing_id = db.Column(db.Integer, db.ForeignKey('waste_listings.id'), nullable=False)
    request_id = db.Column(db.Integer, db.ForeignKey('waste_requests.id'), nullable=False)
    transport_job_id = db.Column(db.Integer, db.ForeignKey('transport_jobs.id'), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    platform_fee = db.Column(db.Float, default=0.0)
    transport_fee = db.Column(db.Float, default=0.0)
    payment_method = db.Column(db.String(50), default='mpesa')
    mpesa_receipt = db.Column(db.String(50))
    status = db.Column(db.String(20), default='pending')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    transaction_id = db.Column(db.String(50), unique=True)
    receipt_number = db.Column(db.String(20), unique=True)
    commission = db.Column(db.Float, default=0.0)
    supplier_amount = db.Column(db.Float, default=0.0)
    transporter_amount = db.Column(db.Float, default=0.0)
    checkout_request_id = db.Column(db.String(50))
    merchant_request_id = db.Column(db.String(50))
    payment_status = db.Column(db.String(20), default='pending')
    delivery_confirmed = db.Column(db.Boolean, default=False)
    completed_at = db.Column(db.DateTime)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    receipt = db.relationship('Receipt', backref='payment', uselist=False)

    def to_dict(self):
        return {
            'id': self.id,
            'amount': self.amount,
            'status': self.status,
            'payer_id': self.payer_id,
            'supplier_id': self.supplier_id,
            'producer_id': self.producer_id,
            'transporter_id': self.transporter_id,
            'transaction_id': self.transaction_id,
            'receipt_number': self.receipt_number,
            'mpesa_receipt': self.mpesa_receipt,
            'payment_status': self.payment_status,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'completed_at': self.completed_at.isoformat() if self.completed_at else None
        }

    def generate_receipt(self):
        receipt = Receipt(payment_id=self.id)
        db.session.add(receipt)
        db.session.commit()
        return receipt

# ========== RECEIPT ==========
class Receipt(db.Model):
    __tablename__ = 'receipts'
    id = db.Column(db.Integer, primary_key=True)
    payment_id = db.Column(db.Integer, db.ForeignKey('payments.id'), nullable=False)
    receipt_number = db.Column(db.String(20), nullable=False)
    qr_code_path = db.Column(db.String(255))
    generated_at = db.Column(db.DateTime, default=datetime.utcnow)

    def __init__(self, **kwargs):
        if 'receipt_number' not in kwargs:
            payment = Payment.query.get(kwargs['payment_id'])
            kwargs['receipt_number'] = payment.receipt_number
        super().__init__(**kwargs)

    def to_dict(self):
        return {
            'id': self.id,
            'payment_id': self.payment_id,
            'receipt_number': self.receipt_number,
            'qr_code_path': self.qr_code_path,
            'generated_at': self.generated_at.isoformat() if self.generated_at else None
        }

# ========== INVOICE ==========
class Invoice(db.Model):
    __tablename__ = 'invoices'
    id = db.Column(db.Integer, primary_key=True)
    invoice_number = db.Column(db.String(50), unique=True, nullable=False)
    payment_id = db.Column(db.Integer, db.ForeignKey('payments.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    listing_id = db.Column(db.Integer, db.ForeignKey('waste_listings.id'), nullable=False)
    request_id = db.Column(db.Integer, db.ForeignKey('waste_requests.id'), nullable=False)
    transport_job_id = db.Column(db.Integer, db.ForeignKey('transport_jobs.id'), nullable=False)
    total_amount = db.Column(db.Float, nullable=False)
    qr_code_path = db.Column(db.String(255))
    status = db.Column(db.String(20), default='unpaid')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

# ========== NOTIFICATION ==========
class Notification(db.Model):
    __tablename__ = 'notifications'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    title = db.Column(db.String(100), nullable=False)
    message = db.Column(db.Text, nullable=False)
    type = db.Column(db.String(50))
    is_read = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

# ========== SUPPORT TICKET ==========
class SupportTicket(db.Model):
    __tablename__ = 'support_tickets'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    subject = db.Column(db.String(200), nullable=False)
    message = db.Column(db.Text, nullable=False)
    email = db.Column(db.String(100))
    name = db.Column(db.String(100))
    status = db.Column(db.String(20), default='open')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'subject': self.subject,
            'message': self.message,
            'email': self.email,
            'name': self.name,
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
        # ========== EMAIL VERIFICATION ==========
class EmailVerification(db.Model):
    __tablename__ = 'email_verifications'

    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(100), nullable=False)
    code = db.Column(db.String(6), nullable=False)
    expires_at = db.Column(db.DateTime, nullable=False)
    used = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)


# ========== PHONE VERIFICATION ==========
class PhoneVerification(db.Model):
    __tablename__ = 'phone_verifications'

    id = db.Column(db.Integer, primary_key=True)
    phone = db.Column(db.String(20), nullable=False)
    otp = db.Column(db.String(6), nullable=False)
    expires_at = db.Column(db.DateTime, nullable=False)
    used = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

# ========== CONVERSATION ==========
class Conversation(db.Model):
    __tablename__ = 'conversations'
    id = db.Column(db.Integer, primary_key=True)

    supplier_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    producer_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    transporter_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)

    listing_id = db.Column(db.Integer, db.ForeignKey('waste_listings.id'), nullable=True)
    request_id = db.Column(db.Integer, db.ForeignKey('waste_requests.id'), nullable=True)
    transport_job_id = db.Column(db.Integer, db.ForeignKey('transport_jobs.id'), nullable=True)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    messages = db.relationship('Message', backref='conversation_ref', lazy='dynamic', cascade='all, delete-orphan')

    def to_dict(self, user_id):
        # Determine the other participant
        if self.supplier_id and self.supplier_id != user_id:
            participant = self.supplier_user
            if participant:
                participant_dict = {
                    'id': participant.id,
                    'name': participant.full_name,
                    'role': participant.role
                }
            else:
                participant_dict = None
        elif self.producer_id and self.producer_id != user_id:
            participant = self.producer_user
            if participant:
                participant_dict = {
                    'id': participant.id,
                    'name': participant.full_name,
                    'role': participant.role
                }
            else:
                participant_dict = None
        elif self.transporter_id and self.transporter_id != user_id:
            participant = self.transporter_user
            if participant:
                participant_dict = {
                    'id': participant.id,
                    'name': participant.full_name,
                    'role': participant.role
                }
            else:
                participant_dict = None
        else:
            if self.supplier_id:
                participant = self.supplier_user
                participant_dict = {
                    'id': participant.id,
                    'name': participant.full_name,
                    'role': participant.role
                } if participant else None
            elif self.producer_id:
                participant = self.producer_user
                participant_dict = {
                    'id': participant.id,
                    'name': participant.full_name,
                    'role': participant.role
                } if participant else None
            elif self.transporter_id:
                participant = self.transporter_user
                participant_dict = {
                    'id': participant.id,
                    'name': participant.full_name,
                    'role': participant.role
                } if participant else None
            else:
                participant_dict = None

        last_msg = self.messages.order_by(Message.created_at.desc()).first()
        unread_count = self.messages.filter_by(receiver_id=user_id, is_read=False).count()

        return {
            'id': self.id,
            'participant': participant_dict,
            'last_message': last_msg.message if last_msg else None,
            'unread_count': unread_count,
            'timestamp': last_msg.created_at.isoformat() if last_msg else self.created_at.isoformat()
        }

# ========== MESSAGE ==========
class Message(db.Model):
    __tablename__ = 'messages'
    id = db.Column(db.Integer, primary_key=True)

    conversation_id = db.Column(db.Integer, db.ForeignKey('conversations.id'), nullable=False)
    sender_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    receiver_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)

    message = db.Column(db.Text, nullable=False)
    attachment_url = db.Column(db.String(255), nullable=True)

    is_read = db.Column(db.Boolean, default=False)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'sender_id': self.sender_id,
            'receiver_id': self.receiver_id,
            'message': self.message,
            'attachment_url': self.attachment_url,
            'is_read': self.is_read,
            'created_at': self.created_at.isoformat()
        }