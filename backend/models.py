from datetime import datetime
from database import db
from flask_bcrypt import Bcrypt
from flask_jwt_extended import create_access_token
import re

bcrypt = Bcrypt()

# ========== USER ==========
class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    full_name = db.Column(db.String(100), nullable=False)
    business_name = db.Column(db.String(100))
    business_type = db.Column(db.String(50))
    email = db.Column(db.String(100), unique=True, nullable=False)
    phone = db.Column(db.String(20), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)  # hashed password
    role = db.Column(db.String(20), nullable=False)      # supplier, producer, transporter, admin
    location = db.Column(db.String(100))
    waste_types = db.Column(db.String(200))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # ─── NEW FIELDS ──────────────────────────────────────────
    email_verified = db.Column(db.Boolean, default=False)
    phone_verified = db.Column(db.Boolean, default=False)
    account_status = db.Column(db.String(20), default='pending')   # pending, verified, rejected, suspended, disabled
    verification_status = db.Column(db.String(20), default='pending')  # pending, approved, rejected (admin review)
    last_login = db.Column(db.DateTime)

    # Business verification documents (for producers and transporters)
    business_license = db.Column(db.String(200))
    government_registration = db.Column(db.String(200))
    environmental_permit = db.Column(db.String(200))
    transport_permit = db.Column(db.String(200))
    national_id = db.Column(db.String(200))

    # Role‑specific fields (stored as comma‑separated strings)
    energy_types = db.Column(db.String(200))      # for producers
    vehicle_types = db.Column(db.String(200))     # for transporters
    capacity = db.Column(db.String(50))           # for producers
    fleet_size = db.Column(db.String(50))         # for transporters
    coverage_area = db.Column(db.String(100))     # for transporters
    license_number = db.Column(db.String(50))     # for transporters

    # ─── RELATIONSHIPS ──────────────────────────────────────
    waste_listings = db.relationship('WasteListing', backref='supplier', lazy=True)
    waste_requests_as_producer = db.relationship('WasteRequest', foreign_keys='WasteRequest.producer_id', backref='producer', lazy=True)
    transport_jobs_as_transporter = db.relationship('TransportJob', foreign_keys='TransportJob.transporter_id', backref='transporter', lazy=True)
    payments_as_payer = db.relationship('Payment', foreign_keys='Payment.payer_id', backref='payer', lazy=True)
    payments_as_supplier = db.relationship('Payment', foreign_keys='Payment.supplier_id', backref='supplier_payment', lazy=True)
    notifications = db.relationship('Notification', backref='user', lazy=True)

    # Conversations & Messages
    conversations_as_supplier = db.relationship('Conversation', foreign_keys='Conversation.supplier_id', backref='supplier_user', lazy=True)
    conversations_as_producer = db.relationship('Conversation', foreign_keys='Conversation.producer_id', backref='producer_user', lazy=True)
    conversations_as_transporter = db.relationship('Conversation', foreign_keys='Conversation.transporter_id', backref='transporter_user', lazy=True)
    messages_sent = db.relationship('Message', foreign_keys='Message.sender_id', backref='sender_user', lazy=True)
    messages_received = db.relationship('Message', foreign_keys='Message.receiver_id', backref='receiver_user', lazy=True)

    # Devices
    devices = db.relationship('UserDevice', backref='user', lazy=True)

    # ─── METHODS ─────────────────────────────────────────────
    def set_password(self, plain_password):
        self.password = bcrypt.generate_password_hash(plain_password).decode('utf-8')

    def check_password(self, plain_password):
        return bcrypt.check_password_hash(self.password, plain_password)

    def generate_jwt(self):
        return create_access_token(identity=self.id, additional_claims={'role': self.role})

    @staticmethod
    def validate_email(email):
        return re.match(r"^[^@]+@[^@]+\.[^@]+$", email)

    @staticmethod
    def validate_phone(phone):
        # Accept +2547... or 07... etc.
        return re.match(r"^\+?[0-9]{10,15}$", phone)

    def to_dict(self):
        return {
            'id': self.id,
            'full_name': self.full_name,
            'business_name': self.business_name,
            'business_type': self.business_type,
            'email': self.email,
            'phone': self.phone,
            'role': self.role,
            'location': self.location,
            'waste_types': self.waste_types,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'email_verified': self.email_verified,
            'phone_verified': self.phone_verified,
            'account_status': self.account_status,
            'verification_status': self.verification_status,
            'last_login': self.last_login.isoformat() if self.last_login else None,
            'energy_types': self.energy_types,
            'vehicle_types': self.vehicle_types,
            'capacity': self.capacity,
            'fleet_size': self.fleet_size,
            'coverage_area': self.coverage_area,
            'license_number': self.license_number,
        }


# ========== USER DEVICE ==========
class UserDevice(db.Model):
    __tablename__ = 'user_devices'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    device_name = db.Column(db.String(100))
    browser = db.Column(db.String(100))
    ip_address = db.Column(db.String(45))
    country = db.Column(db.String(50))
    login_time = db.Column(db.DateTime, default=datetime.utcnow)
    is_active = db.Column(db.Boolean, default=True)

    def to_dict(self):
        return {
            'id': self.id,
            'device_name': self.device_name,
            'browser': self.browser,
            'ip_address': self.ip_address,
            'country': self.country,
            'login_time': self.login_time.isoformat() if self.login_time else None,
            'is_active': self.is_active,
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


# ========== COLLECTION (legacy, kept for backward compatibility) ==========
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


# ========== PROCESSING PLANT (NEW) ==========
class ProcessingPlant(db.Model):
    __tablename__ = 'processing_plants'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    location = db.Column(db.String(200), nullable=False)
    capacity = db.Column(db.Float, nullable=False, default=0.0)
    unit = db.Column(db.String(50), default='tonnes/day')
    type = db.Column(db.String(100), nullable=False)
    status = db.Column(db.String(50), default='active')
    contact_person = db.Column(db.String(100))
    contact_phone = db.Column(db.String(50))
    contact_email = db.Column(db.String(100))
    description = db.Column(db.Text)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'location': self.location,
            'capacity': self.capacity,
            'unit': self.unit,
            'type': self.type,
            'status': self.status,
            'contact_person': self.contact_person,
            'contact_phone': self.contact_phone,
            'contact_email': self.contact_email,
            'description': self.description,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
        }


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

    # Old fields for compatibility
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


# ========== DISPUTE ==========
class Dispute(db.Model):
    __tablename__ = 'disputes'

    id = db.Column(db.Integer, primary_key=True)
    raised_by_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)

    payment_id = db.Column(db.Integer, db.ForeignKey('payments.id'), nullable=True)
    request_id = db.Column(db.Integer, db.ForeignKey('waste_requests.id'), nullable=True)
    transport_job_id = db.Column(db.Integer, db.ForeignKey('transport_jobs.id'), nullable=True)

    title = db.Column(db.String(150), nullable=False)
    reason = db.Column(db.Text, nullable=False)
    status = db.Column(db.String(30), default='open')
    resolution = db.Column(db.Text, nullable=True)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


# ========== PRICING SETTINGS ==========
class PricingSetting(db.Model):
    __tablename__ = 'pricing_settings'

    id = db.Column(db.Integer, primary_key=True)
    waste_type = db.Column(db.String(100), nullable=False, unique=True)

    price_per_kg = db.Column(db.Float, default=0.0)
    fixed_transport_fee = db.Column(db.Float, default=700.0)
    fixed_platform_fee = db.Column(db.Float, default=500.0)

    is_active = db.Column(db.Boolean, default=True)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


# ========== ADMIN SETTINGS ==========
class AdminSetting(db.Model):
    __tablename__ = 'admin_settings'

    id = db.Column(db.Integer, primary_key=True)
    key = db.Column(db.String(100), nullable=False, unique=True)
    value = db.Column(db.Text, nullable=True)
    description = db.Column(db.Text, nullable=True)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


# ========== AUDIT LOG ==========
class AuditLog(db.Model):
    __tablename__ = 'audit_logs'

    id = db.Column(db.Integer, primary_key=True)

    admin_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    action = db.Column(db.String(150), nullable=False)

    table_name = db.Column(db.String(100), nullable=True)
    record_id = db.Column(db.Integer, nullable=True)
    details = db.Column(db.Text, nullable=True)
    ip_address = db.Column(db.String(100), nullable=True)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    # models.py (add this class alongside others)

class CarbonCredit(db.Model):
    __tablename__ = 'carbon_credits'

    id = db.Column(db.Integer, primary_key=True)
    project_name = db.Column(db.String(200), nullable=False)
    amount = db.Column(db.Float, nullable=False, default=0)
    status = db.Column(db.String(20), default='issued')
    serial_number = db.Column(db.String(50), unique=True)
    description = db.Column(db.Text)
    issuance_date = db.Column(db.DateTime, default=datetime.utcnow)
    expiry_date = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'project_name': self.project_name,
            'amount': self.amount,
            'status': self.status,
            'serial_number': self.serial_number,
            'description': self.description,
            'issuance_date': self.issuance_date.isoformat() if self.issuance_date else None,
            'expiry_date': self.expiry_date.isoformat() if self.expiry_date else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
        }