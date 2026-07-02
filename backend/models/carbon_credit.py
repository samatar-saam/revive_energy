# backend/models/carbon_credit.py
from database import db
from datetime import datetime

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