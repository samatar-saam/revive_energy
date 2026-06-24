# backend/models/login_history.py

from datetime import datetime
from database import db

class UserDevice(db.Model):
    __tablename__ = 'user_devices'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    device_name = db.Column(db.String(100))
    browser = db.Column(db.String(100))
    ip_address = db.Column(db.String(45))
    country = db.Column(db.String(50))
    login_time = db.Column(db.DateTime, default=datetime.utcnow)
    is_active = db.Column(db.Boolean, default=True)

    def to_dict(self):
        return {
            'id': self.id,
            'device_name': self.device_name,
            'browser': self.browser,
            'ip_address': self.ip_address,
            'country': self.country,
            'login_time': self.login_time.isoformat() if self.login_time else None,
            'is_active': self.is_active,
        }