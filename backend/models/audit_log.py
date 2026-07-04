# backend/models/audit_log.py
import json
from database import db
from datetime import datetime

class AuditLog(db.Model):
    __tablename__ = 'audit_logs'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    event = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=False)
    ip_address = db.Column(db.String(45))
    device = db.Column(db.String(100))
    browser = db.Column(db.String(100))
    location = db.Column(db.String(100))
    status = db.Column(db.String(20), default='info')
    request_payload = db.Column(db.Text)
    response_payload = db.Column(db.Text)
    previous_values = db.Column(db.Text)
    new_values = db.Column(db.Text)
    admin_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    user = db.relationship('User', foreign_keys=[user_id])
    admin = db.relationship('User', foreign_keys=[admin_id])

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'user_name': self.user.full_name if self.user else None,
            'user_role': self.user.role if self.user else None,
            'event': self.event,
            'description': self.description,
            'ip_address': self.ip_address,
            'device': self.device,
            'browser': self.browser,
            'location': self.location,
            'status': self.status,
            'request_payload': json.loads(self.request_payload) if self.request_payload else None,
            'response_payload': json.loads(self.response_payload) if self.response_payload else None,
            'previous_values': json.loads(self.previous_values) if self.previous_values else None,
            'new_values': json.loads(self.new_values) if self.new_values else None,
            'admin_name': self.admin.full_name if self.admin else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }