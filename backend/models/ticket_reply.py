# backend/models/ticket_reply.py
from database import db
from datetime import datetime

class TicketReply(db.Model):
    __tablename__ = 'ticket_replies'

    id = db.Column(db.Integer, primary_key=True)
    ticket_id = db.Column(db.Integer, db.ForeignKey('support_tickets.id'), nullable=False)
    sender_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    message = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    ticket = db.relationship('SupportTicket', backref='replies', lazy=True)
    sender = db.relationship('User', backref='ticket_replies', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'ticket_id': self.ticket_id,
            'sender_id': self.sender_id,
            'sender_name': self.sender.full_name if self.sender else 'Unknown',
            'sender_role': self.sender.role if self.sender else 'unknown',
            'message': self.message,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }