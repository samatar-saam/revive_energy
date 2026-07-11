# models/transport_location.py

from datetime import datetime
from database import db

class TransportLocation(db.Model):
    __tablename__ = "transport_locations"

    id = db.Column(db.Integer, primary_key=True)

    transport_job_id = db.Column(
        db.Integer,
        db.ForeignKey("transport_jobs.id"),
        nullable=False,
        index=True,
    )

    transporter_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id"),
        nullable=False,
        index=True,
    )

    latitude = db.Column(db.Float, nullable=False)
    longitude = db.Column(db.Float, nullable=False)

    speed = db.Column(db.Float, default=0)
    heading = db.Column(db.Float, default=0)
    accuracy = db.Column(db.Float, default=0)

    created_at = db.Column(
        db.DateTime,
        default=datetime.utcnow,
        nullable=False,
        index=True,
    )

    def to_dict(self):
        return {
            "id": self.id,
            "transport_job_id": self.transport_job_id,
            "transporter_id": self.transporter_id,
            "latitude": self.latitude,
            "longitude": self.longitude,
            "speed": self.speed or 0,
            "heading": self.heading or 0,
            "accuracy": self.accuracy or 0,
            "created_at": (
                self.created_at.isoformat()
                if self.created_at
                else None
            ),
        }