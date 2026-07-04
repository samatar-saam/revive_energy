# backend/models/dispute.py
import json
from database import db
from datetime import datetime

class Dispute(db.Model):
    __tablename__ = 'disputes'

    id = db.Column(db.Integer, primary_key=True)
    payment_id = db.Column(db.Integer, db.ForeignKey('payments.id'), nullable=False)
    producer_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    supplier_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    transporter_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)

    reason = db.Column(db.Text, nullable=False)
    status = db.Column(db.String(30), default='open')
    escrow_status = db.Column(db.String(30), default='held')
    evidence = db.Column(db.Text)
    timeline = db.Column(db.Text)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    payment = db.relationship('Payment', backref='disputes')
    producer = db.relationship('User', foreign_keys=[producer_id])
    supplier = db.relationship('User', foreign_keys=[supplier_id])
    transporter = db.relationship('User', foreign_keys=[transporter_id])

    def to_dict(self):
        return {
            'id': self.id,
            'payment_id': self.payment_id,
            'producer_id': self.producer_id,
            'producer_name': self.producer.full_name if self.producer else None,
            'supplier_id': self.supplier_id,
            'supplier_name': self.supplier.full_name if self.supplier else None,
            'transporter_id': self.transporter_id,
            'transporter_name': self.transporter.full_name if self.transporter else None,
            'reason': self.reason,
            'status': self.status,
            'escrow_status': self.escrow_status,
            'evidence': json.loads(self.evidence) if self.evidence else [],
            'timeline': json.loads(self.timeline) if self.timeline else [],
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'amount': self.payment.amount if self.payment else 0,
            'waste_type': self.payment.waste_type if self.payment else None,
        }