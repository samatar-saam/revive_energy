# models/dispute.py
from datetime import datetime
from database import db
import json

class Dispute(db.Model):
    __tablename__ = 'disputes'

    id = db.Column(db.Integer, primary_key=True)
    payment_id = db.Column(db.Integer, db.ForeignKey('payments.id'), nullable=False)
    producer_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    supplier_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    transporter_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)

    reason = db.Column(db.Text, nullable=False)
    description = db.Column(db.Text)
    priority = db.Column(db.String(20), default='medium')
    status = db.Column(db.String(30), default='open')
    escrow_status = db.Column(db.String(30), default='held')

    amount = db.Column(db.Float, default=0.0)
    amount_held = db.Column(db.Float, default=0.0)
    platform_fee = db.Column(db.Float, default=0.0)
    transport_fee = db.Column(db.Float, default=0.0)
    supplier_amount = db.Column(db.Float, default=0.0)

    resolution_notes = db.Column(db.Text)
    resolution_decision = db.Column(db.String(50))
    refund_amount = db.Column(db.Float)
    released_amount = db.Column(db.Float)
    resolution_final_status = db.Column(db.String(50))

    chat = db.Column(db.Text, default='[]')
    evidence = db.Column(db.Text, default='[]')
    timeline = db.Column(db.Text, default='[]')

    opened_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    dispute_type = db.Column(db.String(50))
    admin_decision = db.Column(db.Text)
    resolution = db.Column(db.Text)
    resolved_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    resolved_at = db.Column(db.DateTime)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    payment = db.relationship('Payment', backref='disputes')
    producer = db.relationship('User', foreign_keys=[producer_id])
    supplier = db.relationship('User', foreign_keys=[supplier_id])
    transporter = db.relationship('User', foreign_keys=[transporter_id])
    resolver = db.relationship('User', foreign_keys=[resolved_by])
    opener = db.relationship('User', foreign_keys=[opened_by])

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
            'description': self.description,
            'priority': self.priority,
            'status': self.status,
            'escrow_status': self.escrow_status,
            'amount': self.amount or 0,
            'amount_held': self.amount_held or 0,
            'platform_fee': self.platform_fee or 0,
            'transport_fee': self.transport_fee or 0,
            'supplier_amount': self.supplier_amount or 0,
            'resolution_notes': self.resolution_notes,
            'resolution_decision': self.resolution_decision,
            'refund_amount': self.refund_amount,
            'released_amount': self.released_amount,
            'resolution_final_status': self.resolution_final_status,
            'chat': json.loads(self.chat) if self.chat else [],
            'evidence': json.loads(self.evidence) if self.evidence else [],
            'timeline': json.loads(self.timeline) if self.timeline else [],
            'opened_by': self.opened_by,
            'dispute_type': self.dispute_type,
            'admin_decision': self.admin_decision,
            'resolution': self.resolution,
            'resolved_by': self.resolved_by,
            'resolved_at': self.resolved_at.isoformat() if self.resolved_at else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
        }