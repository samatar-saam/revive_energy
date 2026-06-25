from datetime import datetime
from database import db


class Receipt(db.Model):
    __tablename__ = "receipts"

    id = db.Column(db.Integer, primary_key=True)

    payment_id = db.Column(
        db.Integer,
        db.ForeignKey("payments.id"),
        nullable=False
    )

    receipt_number = db.Column(db.String(50), unique=True, nullable=False)
    qr_code_path = db.Column(db.String(255), nullable=True)

    generated_at = db.Column(db.DateTime, default=datetime.utcnow)

    payment = db.relationship("Payment", back_populates="receipt")

    def to_dict(self):
        return {
            "id": self.id,
            "payment_id": self.payment_id,
            "receipt_number": self.receipt_number,
            "qr_code_path": self.qr_code_path,
            "generated_at": self.generated_at.isoformat() if self.generated_at else None,
        }