# models/platform_transaction.py
from database import db
from datetime import datetime

class PlatformTransaction(db.Model):
    __tablename__ = 'platform_transactions'
    id = db.Column(db.Integer, primary_key=True)
    amount = db.Column(db.Float, nullable=False)
    type = db.Column(db.String(50), nullable=False)  # 'credit' or 'debit'
    description = db.Column(db.String(255))
    payment_id = db.Column(db.Integer, db.ForeignKey('payments.id'), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'amount': self.amount,
            'type': self.type,
            'description': self.description,
            'payment_id': self.payment_id,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }