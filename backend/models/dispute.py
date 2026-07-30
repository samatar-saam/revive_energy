# models/dispute.py
from database import db
from datetime import datetime

class Dispute(db.Model):
    __tablename__ = 'disputes'
    # ... (your existing Dispute fields, keep them)
    id = db.Column(db.Integer, primary_key=True)
    payment_id = db.Column(db.Integer, db.ForeignKey('payments.id'))
    producer_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    supplier_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    transporter_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    amount = db.Column(db.Numeric(10,2), default=0.0)
    amount_held = db.Column(db.Numeric(10,2), default=0.0)
    platform_fee = db.Column(db.Numeric(10,2), default=0.0)
    transport_fee = db.Column(db.Numeric(10,2), default=0.0)
    supplier_amount = db.Column(db.Numeric(10,2), default=0.0)
    reason = db.Column(db.Text)
    description = db.Column(db.Text)
    priority = db.Column(db.String(20), default='medium')
    status = db.Column(db.String(50), default='open')
    escrow_status = db.Column(db.String(50), default='held')
    timeline = db.Column(db.Text)
    evidence = db.Column(db.Text)
    chat = db.Column(db.Text)
    resolution_notes = db.Column(db.Text)
    resolution_decision = db.Column(db.String(50))
    refund_amount = db.Column(db.Numeric(10,2))
    released_amount = db.Column(db.Numeric(10,2))
    resolution_final_status = db.Column(db.String(50))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        # ... keep your existing method
        pass


class DisputeMessage(db.Model):
    __tablename__ = 'dispute_messages'
    id = db.Column(db.Integer, primary_key=True)
    dispute_id = db.Column(db.Integer, db.ForeignKey('disputes.id'), nullable=False)
    sender_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    message = db.Column(db.Text, nullable=False)
    is_admin = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    dispute = db.relationship('Dispute', backref=db.backref('messages', lazy='dynamic'))
    sender = db.relationship('User')

    def to_dict(self):
        return {
            'id': self.id,
            'dispute_id': self.dispute_id,
            'sender_id': self.sender_id,
            'sender_name': self.sender.full_name if self.sender else 'Unknown',
            'message': self.message,
            'is_admin': self.is_admin,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }