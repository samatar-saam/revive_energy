# backend/models/processing_plant.py
from database import db
from datetime import datetime

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