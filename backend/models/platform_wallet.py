# models/platform_wallet.py
from database import db
from datetime import datetime

class PlatformWallet(db.Model):
    __tablename__ = 'platform_wallet'
    id = db.Column(db.Integer, primary_key=True)
    balance = db.Column(db.Float, default=0.0)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'balance': self.balance,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }