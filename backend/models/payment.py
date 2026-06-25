from database import db
from datetime import datetime


class Payment(db.Model):
    __tablename__ = "payments"

    id = db.Column(db.Integer, primary_key=True)

    payer_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    supplier_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    producer_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    transporter_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=True)

    listing_id = db.Column(db.Integer, db.ForeignKey("waste_listings.id"), nullable=True)
    request_id = db.Column(db.Integer, db.ForeignKey("waste_requests.id"), nullable=True)
    transport_job_id = db.Column(db.Integer, db.ForeignKey("transport_jobs.id"), nullable=True)

    waste_amount = db.Column(db.Float, default=0.0)
    transport_fee = db.Column(db.Float, default=0.0)
    platform_fee = db.Column(db.Float, default=0.0)
    commission = db.Column(db.Float, default=0.0)

    supplier_amount = db.Column(db.Float, default=0.0)
    transporter_amount = db.Column(db.Float, default=0.0)
    amount = db.Column(db.Float, default=0.0)
    total_amount = db.Column(db.Float, default=0.0)

    phone_number = db.Column(db.String(20))
    mpesa_receipt = db.Column(db.String(100), unique=True)
    transaction_id = db.Column(db.String(100), unique=True)
    receipt_number = db.Column(db.String(50), unique=True)

    checkout_request_id = db.Column(db.String(255))
    merchant_request_id = db.Column(db.String(255))

    payment_method = db.Column(db.String(50), default="mpesa")
    status = db.Column(db.String(30), default="pending")
    payment_status = db.Column(db.String(30), default="pending")
    escrow_status = db.Column(db.String(30), default="waiting")
    delivery_confirmed = db.Column(db.Boolean, default=False)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    paid_at = db.Column(db.DateTime)
    completed_at = db.Column(db.DateTime)

    receipt = db.relationship("Receipt", back_populates="payment", uselist=False)

    def to_dict(self):
        return {
            "id": self.id,
            "payer_id": self.payer_id,
            "supplier_id": self.supplier_id,
            "producer_id": self.producer_id,
            "transporter_id": self.transporter_id,
            "listing_id": self.listing_id,
            "request_id": self.request_id,
            "transport_job_id": self.transport_job_id,
            "waste_amount": self.waste_amount,
            "transport_fee": self.transport_fee,
            "platform_fee": self.platform_fee,
            "commission": self.commission,
            "supplier_amount": self.supplier_amount,
            "transporter_amount": self.transporter_amount,
            "amount": self.amount,
            "total_amount": self.total_amount,
            "payment_method": self.payment_method,
            "status": self.status,
            "payment_status": self.payment_status,
            "escrow_status": self.escrow_status,
            "phone_number": self.phone_number,
            "mpesa_receipt": self.mpesa_receipt,
            "transaction_id": self.transaction_id,
            "receipt_number": self.receipt_number,
            "checkout_request_id": self.checkout_request_id,
            "merchant_request_id": self.merchant_request_id,
            "delivery_confirmed": self.delivery_confirmed,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
            "paid_at": self.paid_at.isoformat() if self.paid_at else None,
            "completed_at": self.completed_at.isoformat() if self.completed_at else None,
        }