from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from database import db
from models import User, WasteListing, WasteRequest, Payment
from datetime import datetime

payments_bp = Blueprint("payments", __name__, url_prefix="/api/payments")


def current_user_id():
    return int(get_jwt_identity())


def safe_float(value, default=0):
    try:
        if value is None or value == "":
            return default
        return float(value)
    except Exception:
        return default


def safe_int(value, default=0):
    try:
        if value is None or value == "":
            return default
        return int(value)
    except Exception:
        return default


# ==============================
# CREATE PAYMENT RECORD ONLY
# ==============================
@payments_bp.route("/", methods=["POST"])
@jwt_required()
def create_payment():
    try:
        user_id = current_user_id()
        data = request.get_json() or {}

        supplier_id = data.get("supplier_id")
        amount = data.get("amount")

        if not supplier_id:
            return jsonify({"message": "supplier_id is required"}), 400

        if not amount:
            return jsonify({"message": "amount is required"}), 400

        payment = Payment(
            payer_id=user_id,
            producer_id=user_id,
            supplier_id=safe_int(supplier_id),

            listing_id=safe_int(data.get("listing_id"), 0),
            request_id=safe_int(data.get("request_id"), 0),
            transport_job_id=safe_int(data.get("transport_job_id"), 0),
            transporter_id=safe_int(data.get("transporter_id"), None),

            amount=safe_float(amount),
            total_amount=safe_float(data.get("total_amount"), safe_float(amount)),
            waste_amount=safe_float(data.get("waste_amount"), safe_float(amount)),
            transport_fee=safe_float(data.get("transport_fee"), 0),
            platform_fee=safe_float(data.get("platform_fee"), 0),
            commission=safe_float(data.get("commission"), 0),
            supplier_amount=safe_float(data.get("supplier_amount"), 0),
            transporter_amount=safe_float(data.get("transporter_amount"), 0),

            payment_method=data.get("payment_method", "mpesa"),
            payment_status="pending",
            status="pending",
            escrow_status="waiting",
            phone_number=data.get("phone_number") or data.get("phone"),
        )

        db.session.add(payment)
        db.session.commit()

        return jsonify({
            "message": "Payment created successfully.",
            "payment": payment.to_dict(),
        }), 201

    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"create_payment error: {e}", exc_info=True)
        return jsonify({"message": str(e)}), 500


# ==============================
# INITIATE PAYMENT / MOCK M-PESA
# ==============================
@payments_bp.route("/initiate", methods=["POST"])
@jwt_required()
def initiate_payment():
    try:
        user_id = current_user_id()
        data = request.get_json() or {}

        supplier_id = data.get("supplier_id")
        amount = data.get("amount")
        phone = data.get("phone") or data.get("phone_number")

        if not supplier_id:
            return jsonify({"message": "supplier_id is required"}), 400

        if not amount:
            return jsonify({"message": "amount is required"}), 400

        if not phone:
            return jsonify({"message": "M-Pesa phone number is required"}), 400

        waste_amount = safe_float(data.get("waste_amount"), safe_float(amount))
        transport_fee = safe_float(data.get("transport_fee"), 0)
        platform_fee = safe_float(data.get("platform_fee"), 0)
        total_amount = safe_float(data.get("total_amount"), safe_float(amount))

        commission = platform_fee
        supplier_amount = waste_amount
        transporter_amount = transport_fee

        payment = Payment(
            payer_id=user_id,
            producer_id=user_id,
            supplier_id=safe_int(supplier_id),

            # Your current DB has these as NOT NULL, so never pass None
            listing_id=safe_int(data.get("listing_id"), 0),
            request_id=safe_int(data.get("request_id"), 0),
            transport_job_id=safe_int(data.get("transport_job_id"), 0),
            transporter_id=safe_int(data.get("transporter_id"), None),

            amount=total_amount,
            total_amount=total_amount,
            waste_amount=waste_amount,
            transport_fee=transport_fee,
            platform_fee=platform_fee,
            commission=commission,
            supplier_amount=supplier_amount,
            transporter_amount=transporter_amount,

            phone_number=phone,
            payment_method="mpesa",
            payment_status="pending",
            status="pending",
            escrow_status="waiting",
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
        )

        db.session.add(payment)
        db.session.flush()

        # MOCK PAYMENT SUCCESS FOR LOCAL DEVELOPMENT
        payment.payment_status = "paid"
        payment.status = "paid"
        payment.escrow_status = "held"
        payment.paid_at = datetime.utcnow()
        payment.completed_at = datetime.utcnow()
        payment.mpesa_receipt = f"MOCK{payment.id:06d}"
        payment.transaction_id = f"TXN{payment.id:06d}"
        payment.receipt_number = f"REV-{payment.id:06d}"
        payment.checkout_request_id = f"CHECKOUT-{payment.id:06d}"
        payment.merchant_request_id = f"MERCHANT-{payment.id:06d}"

        request_id = safe_int(data.get("request_id"), 0)

        if request_id:
            waste_request = db.session.get(WasteRequest, request_id)
            if waste_request:
                waste_request.status = "paid"

        db.session.commit()

        return jsonify({
            "message": "Payment successful. Money is now held in escrow.",
            "payment_id": payment.id,
            "checkout_request_id": payment.checkout_request_id,
            "mpesa_receipt": payment.mpesa_receipt,
            "status": payment.status,
            "payment_status": payment.payment_status,
            "escrow_status": payment.escrow_status,
            "payment": payment.to_dict(),
        }), 200

    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"initiate_payment error: {e}", exc_info=True)
        return jsonify({"message": str(e)}), 500


# ==============================
# GET MY PAYMENTS
# ==============================
@payments_bp.route("/my-payments", methods=["GET"])
@jwt_required()
def my_payments():
    try:
        user_id = current_user_id()

        payments = Payment.query.filter(
            (Payment.producer_id == user_id) |
            (Payment.supplier_id == user_id) |
            (Payment.payer_id == user_id) |
            (Payment.transporter_id == user_id)
        ).order_by(Payment.created_at.desc()).all()

        return jsonify([payment.to_dict() for payment in payments]), 200

    except Exception as e:
        current_app.logger.error(f"my_payments error: {e}", exc_info=True)
        return jsonify({"message": str(e)}), 500


# ==============================
# PAYMENT DETAILS
# ==============================
@payments_bp.route("/<int:payment_id>", methods=["GET"])
@jwt_required()
def payment_details(payment_id):
    user_id = current_user_id()
    payment = Payment.query.get_or_404(payment_id)

    allowed_users = [
        payment.payer_id,
        payment.producer_id,
        payment.supplier_id,
        payment.transporter_id,
    ]

    if user_id not in allowed_users:
        return jsonify({"message": "Unauthorized"}), 403

    return jsonify(payment.to_dict()), 200


# ==============================
# UPDATE PAYMENT STATUS
# ==============================
@payments_bp.route("/<int:payment_id>/status", methods=["PUT"])
@jwt_required()
def update_payment_status(payment_id):
    try:
        payment = Payment.query.get_or_404(payment_id)
        data = request.get_json() or {}

        payment.payment_status = data.get("payment_status", payment.payment_status)
        payment.status = data.get("status", payment.status)
        payment.escrow_status = data.get("escrow_status", payment.escrow_status)
        payment.updated_at = datetime.utcnow()

        db.session.commit()

        return jsonify({
            "message": "Payment updated successfully.",
            "payment": payment.to_dict(),
        }), 200

    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"update_payment_status error: {e}", exc_info=True)
        return jsonify({"message": str(e)}), 500


# ==============================
# DELETE PAYMENT
# ==============================
@payments_bp.route("/<int:payment_id>", methods=["DELETE"])
@jwt_required()
def delete_payment(payment_id):
    try:
        payment = Payment.query.get_or_404(payment_id)

        db.session.delete(payment)
        db.session.commit()

        return jsonify({"message": "Payment deleted successfully."}), 200

    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"delete_payment error: {e}", exc_info=True)
        return jsonify({"message": str(e)}), 500