# models/partnership_application.py
from datetime import datetime
from database import db

class PartnershipApplication(db.Model):
    __tablename__ = 'partnership_applications'

    id = db.Column(db.Integer, primary_key=True)
    organization_name = db.Column(db.String(200), nullable=False)
    contact_name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), nullable=False)
    phone = db.Column(db.String(20), nullable=False)
    organization_type = db.Column(db.String(100), nullable=False)
    waste_types = db.Column(db.String(200))
    message = db.Column(db.Text)
    status = db.Column(db.String(20), default='pending')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'organization_name': self.organization_name,
            'contact_name': self.contact_name,
            'email': self.email,
            'phone': self.phone,
            'organization_type': self.organization_type,
            'waste_types': self.waste_types.split(',') if self.waste_types else [],
            'message': self.message,
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
        }