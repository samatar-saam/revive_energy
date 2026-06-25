from database import db
from datetime import datetime


class EscrowTransaction(db.Model):
    __tablename__ = "escrow_transactions"

    id = db.Column(db.Integer, primary_key=True)

    # Linked payment
    payment_id = db.Column(
        db.Integer,
        db.ForeignKey("payments.id"),
        nullable=False
    )

    supplier_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id"),
        nullable=False
    )

    producer_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id"),
        nullable=False
    )

    transporter_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id"),
        nullable=True
    )

    # Escrow amounts
    total_amount = db.Column(db.Float, nullable=False)

    supplier_amount = db.Column(db.Float, default=0.0)

    transporter_amount = db.Column(db.Float, default=0.0)

    platform_commission = db.Column(db.Float, default=0.0)

    # Escrow status
    status = db.Column(
        db.String(30),
        default="held"
    )
    # held
    # released
    # refunded
    # cancelled

    released_at = db.Column(db.DateTime)

    created_at = db.Column(
        db.DateTime,
        default=datetime.utcnow
    )

    updated_at = db.Column(
        db.DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow
    )

    # Relationships
    payment = db.relationship(
        "Payment",
        backref="escrow_transaction"
    )

    supplier = db.relationship(
        "User",
        foreign_keys=[supplier_id]
    )

    producer = db.relationship(
        "User",
        foreign_keys=[producer_id]
    )

    transporter = db.relationship(
        "User",
        foreign_keys=[transporter_id]
    )

    def release(self):
        self.status = "released"
        self.released_at = datetime.utcnow()

    def refund(self):
        self.status = "refunded"

    def to_dict(self):
        return {
            "id": self.id,
            "payment_id": self.payment_id,
            "supplier_id": self.supplier_id,
            "producer_id": self.producer_id,
            "transporter_id": self.transporter_id,

            "total_amount": self.total_amount,
            "supplier_amount": self.supplier_amount,
            "transporter_amount": self.transporter_amount,
            "platform_commission": self.platform_commission,

            "status": self.status,

            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
            "released_at": self.released_at.isoformat() if self.released_at else None,
        }