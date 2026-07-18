# models/password_reset_otp.py
from database import db
from datetime import datetime, timedelta

class PasswordResetOTP(db.Model):
    __tablename__ = 'password_reset_otps'

    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(100), nullable=False, index=True)
    otp = db.Column(db.String(6), nullable=False)
    expires_at = db.Column(db.DateTime, nullable=False)
    used = db.Column(db.Boolean, default=False)
    attempts = db.Column(db.Integer, default=0)
    locked_until = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def is_expired(self):
        return datetime.utcnow() > self.expires_at

    def is_locked(self):
        if not self.locked_until:
            return False
        return datetime.utcnow() < self.locked_until

    def increment_attempts(self):
        self.attempts += 1
        if self.attempts >= 5:
            self.locked_until = datetime.utcnow() + timedelta(minutes=30)
        db.session.commit()

    @classmethod
    def delete_expired(cls):
        expired = cls.query.filter(cls.expires_at < datetime.utcnow()).all()
        for record in expired:
            db.session.delete(record)
        db.session.commit()