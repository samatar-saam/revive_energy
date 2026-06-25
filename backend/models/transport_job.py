from datetime import datetime
from database import db


class TransportJob(db.Model):
    __tablename__ = "transport_jobs"

    id = db.Column(db.Integer, primary_key=True)

    request_id = db.Column(db.Integer, db.ForeignKey("waste_requests.id"), nullable=False)
    listing_id = db.Column(db.Integer, db.ForeignKey("waste_listings.id"), nullable=False)

    supplier_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    producer_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    transporter_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=True)

    pickup_location = db.Column(db.String(100), nullable=False)
    delivery_location = db.Column(db.String(100), nullable=False)

    waste_type = db.Column(db.String(100), nullable=False)
    quantity = db.Column(db.Float, nullable=False)

    status = db.Column(db.String(20), default="open")

    created_at = db.Column(db.DateTime, default=datetime.utcnow)