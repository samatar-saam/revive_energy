# backend/models/business_verification.py

from datetime import datetime
from database import db

class BusinessVerification(db.Model):
    __tablename__ = 'business_verifications'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)

    # Document type: 'business_license', 'government_registration', 'environmental_permit', 'transport_permit', 'national_id'
    document_type = db.Column(db.String(50), nullable=False)
    document_path = db.Column(db.String(200), nullable=False)  # path or URL to stored file
    status = db.Column(db.String(20), default='pending')       # pending, approved, rejected
    submitted_at = db.Column(db.DateTime, default=datetime.utcnow)
    reviewed_at = db.Column(db.DateTime)
    review_notes = db.Column(db.Text)

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'document_type': self.document_type,
            'document_path': self.document_path,
            'status': self.status,
            'submitted_at': self.submitted_at.isoformat() if self.submitted_at else None,
            'reviewed_at': self.reviewed_at.isoformat() if self.reviewed_at else None,
            'review_notes': self.review_notes,
        }