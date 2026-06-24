# backend/models/user.py

from datetime import datetime
from database import db
from flask_bcrypt import Bcrypt
from flask_jwt_extended import create_access_token
import re

bcrypt = Bcrypt()

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
    waste_types = db.Column(db.String(200))  # legacy, kept for backward compatibility
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # ─── NEW FIELDS ──────────────────────────────────────────
    email_verified = db.Column(db.Boolean, default=False)
    phone_verified = db.Column(db.Boolean, default=False)
    account_status = db.Column(db.String(20), default='pending')   # pending, verified, rejected, suspended, disabled
    verification_status = db.Column(db.String(20), default='pending')  # pending, approved, rejected (admin review)
    last_login = db.Column(db.DateTime)

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

    # Devices (login history)
    devices = db.relationship('UserDevice', backref='user', lazy=True)

    # Business verification documents (separate model)
    business_verifications = db.relationship('BusinessVerification', backref='user', lazy=True)

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