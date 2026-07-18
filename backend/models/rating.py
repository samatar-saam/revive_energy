# models/rating.py
from database import db
from datetime import datetime

class Rating(db.Model):
    __tablename__ = 'ratings'

    id = db.Column(db.Integer, primary_key=True)
    producer_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    supplier_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    delivery_id = db.Column(db.Integer, db.ForeignKey('transport_jobs.id'), nullable=True)
    rating = db.Column(db.Integer, nullable=False)  # 1-5
    review = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # relationships
    producer = db.relationship('User', foreign_keys=[producer_id])
    supplier = db.relationship('User', foreign_keys=[supplier_id])
    delivery = db.relationship('TransportJob', foreign_keys=[delivery_id])