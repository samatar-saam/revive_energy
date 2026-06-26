from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from database import db
from models import User, WasteListing, WasteRequest, TransportJob, Payment, Notification
from services.mpesa import MpesaService
from datetime import datetime
import time
import uuid

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


def now():
    return datetime.utcnow()


def make_unique_code(prefix):
    return f"{prefix}-{int(time.time() * 1000)}-{uuid.uuid4().hex[:6].upper()}"


def create_notification(user_id, title, message, notification_type="payment", reference_id=None):
    if not user_id:
        return

    try:
        notification_data = {
            "user_id": user_id,
            "title": title,
            "message": message,
            "type": notification_type,
            "is_read": False,
        }

        if hasattr(Notification, "reference_id"):
            notification_data["reference_id"] = reference_id

        db.session.add(Notification(**notification_data))

    except Exception as e:
        current_app.logger.warning(f"Notification skipped: {e}")


def payment_to_dict(payment):
    if hasattr(payment, "to_dict"):
        return payment.to_dict()

    return {
        "id": payment.id,
        "payer_id": payment.payer_id,
        "supplier_id": payment.supplier_id,
        "producer_id": payment.producer_id,
        "transporter_id": payment.transporter_id,
        "listing_id": payment.listing_id,
        "request_id": payment.request_id,
        "transport_job_id": payment.transport_job_id,
        "amount": payment.amount,
        "total_amount": payment.total_amount,
        "waste_amount": payment.waste_amount,
        "transport_fee": payment.transport_fee,
        "platform_fee": payment.platform_fee,
        "commission": payment.commission,
        "supplier_amount": payment.supplier_amount,
        "transporter_amount": payment.transporter_amount,
        "phone_number": payment.phone_number,
        "mpesa_receipt": payment.mpesa_receipt,
        "transaction_id": payment.transaction_id,
        "receipt_number": payment.receipt_number,
        "checkout_request_id": payment.checkout_request_id,
        "merchant_request_id": payment.merchant_request_id,
        "payment_method": payment.payment_method,
        "status": payment.status,
        "payment_status": payment.payment_status,
        "escrow_status": payment.escrow_status,
        "delivery_confirmed": payment.delivery_confirmed,
        "created_at": payment.created_at.isoformat() if payment.created_at else None,
        "updated_at": payment.updated_at.isoformat() if payment.updated_at else None,
        "paid_at": payment.paid_at.isoformat() if payment.paid_at else None,
        "completed_at": payment.completed_at.isoformat() if payment.completed_at else None,
    }


def normalize_phone(phone):
    phone = str(phone or "").strip().replace(" ", "").replace("-", "").replace("+", "")

    if phone.startswith("07") or phone.startswith("01"):
        phone = "254" + phone[1:]
    elif phone.startswith("7") or phone.startswith("1"):
        phone = "254" + phone

    return phone


def validate_payment_payload(data):
    supplier_id = safe_int(data.get("supplier_id"), 0)
    amount = safe_float(data.get("amount"), 0)
    phone = normalize_phone(data.get("phone") or data.get("phone_number"))

    if supplier_id <= 0:
        return "supplier_id is required"

    if amount <= 0:
        return "amount must be greater than 0"

    if not phone:
        return "M-Pesa phone number is required"

    if not phone.startswith("254") or len(phone) != 12:
        return "Invalid phone number. Use format 2547XXXXXXXX"

    return None


def _create_transport_job(payment):
    try:
        if not payment.request_id or not payment.listing_id:
            current_app.logger.warning("Transport job skipped: missing request_id or listing_id")
            return None

        listing = db.session.get(WasteListing, payment.listing_id)
        request_obj = db.session.get(WasteRequest, payment.request_id)

        if not listing or not request_obj:
            current_app.logger.warning("Transport job skipped: listing/request not found")
            return None

        existing_job = TransportJob.query.filter_by(request_id=payment.request_id).first()
        if existing_job:
            payment.transport_job_id = existing_job.id
            return existing_job

        producer = db.session.get(User, payment.producer_id)

        transport_job = TransportJob(
            request_id=payment.request_id,
            listing_id=payment.listing_id,
            supplier_id=payment.supplier_id,
            producer_id=payment.producer_id,
            pickup_location=listing.location or listing.address or "Supplier location",
            delivery_location=(producer.location if producer else None) or "Producer location",
            waste_type=listing.waste_type,
            quantity=listing.quantity,
            status="open",
        )

        db.session.add(transport_job)
        db.session.flush()

        payment.transport_job_id = transport_job.id
        listing.status = "assigned"
        request_obj.status = "paid"

        create_notification(
            payment.supplier_id,
            "Payment Secured",
            f"A producer has paid for {listing.waste_type}. Money is held in escrow.",
            "payment_secured",
            payment.id,
        )

        create_notification(
            payment.producer_id,
            "Transport Job Created",
            "Your payment is secured. A transporter can now accept the delivery job.",
            "transport_job_created",
            payment.id,
        )

        transporters = User.query.filter_by(role="transporter").all()
        for transporter in transporters:
            create_notification(
                transporter.id,
                "New Transport Job Available",
                f"A new transport job for {listing.waste_type} is available.",
                "new_transport_job",
                transport_job.id,
            )

        return transport_job

    except Exception as e:
        current_app.logger.error(f"_create_transport_job error: {e}", exc_info=True)
        return None


@payments_bp.route("/", methods=["POST"])
@jwt_required()
def create_payment():
    try:
        user_id = current_user_id()
        data = request.get_json() or {}

        error = validate_payment_payload(data)
        if error:
            return jsonify({"message": error}), 400

        supplier_id = safe_int(data.get("supplier_id"))
        amount = safe_float(data.get("amount"))
        phone = normalize_phone(data.get("phone") or data.get("phone_number"))

        payment = Payment(
            payer_id=user_id,
            producer_id=user_id,
            supplier_id=supplier_id,
            listing_id=safe_int(data.get("listing_id"), 0),
            request_id=safe_int(data.get("request_id"), 0),
            transport_job_id=safe_int(data.get("transport_job_id"), 0),
            transporter_id=safe_int(data.get("transporter_id"), None),
            amount=amount,
            total_amount=safe_float(data.get("total_amount"), amount),
            waste_amount=safe_float(data.get("waste_amount"), amount),
            transport_fee=safe_float(data.get("transport_fee"), 0),
            platform_fee=safe_float(data.get("platform_fee"), 0),
            commission=safe_float(data.get("platform_fee"), 0),
            supplier_amount=safe_float(data.get("waste_amount"), amount),
            transporter_amount=safe_float(data.get("transport_fee"), 0),
            payment_method=data.get("payment_method", "mpesa"),
            payment_status="pending",
            status="pending",
            escrow_status="waiting",
            phone_number=phone,
            created_at=now(),
            updated_at=now(),
        )

        db.session.add(payment)
        db.session.commit()

        return jsonify({
            "message": "Payment created successfully.",
            "payment": payment_to_dict(payment),
        }), 201

    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"create_payment error: {e}", exc_info=True)
        return jsonify({"message": str(e)}), 500


@payments_bp.route("/initiate", methods=["POST"])
@jwt_required()
def initiate_payment():
    try:
        user_id = current_user_id()
        data = request.get_json() or {}

        current_app.logger.info(f"Initiate payment data: {data}")

        error = validate_payment_payload(data)
        if error:
            return jsonify({"message": error}), 422

        supplier_id = safe_int(data.get("supplier_id"))
        phone = normalize_phone(data.get("phone") or data.get("phone_number"))

        amount = safe_float(data.get("amount"), 0)
        waste_amount = safe_float(data.get("waste_amount"), amount)
        transport_fee = safe_float(data.get("transport_fee"), 0)
        platform_fee = safe_float(data.get("platform_fee"), 0)
        total_amount = safe_float(data.get("total_amount"), amount)

        request_id = safe_int(data.get("request_id"), 0)
        listing_id = safe_int(data.get("listing_id"), 0)

        supplier = db.session.get(User, supplier_id)
        if not supplier:
            return jsonify({"message": "Supplier not found"}), 422

        if request_id:
            waste_request = db.session.get(WasteRequest, request_id)
            if not waste_request:
                return jsonify({"message": "Waste request not found"}), 422

            if waste_request.producer_id != user_id:
                return jsonify({"message": "Unauthorized request"}), 403

            if waste_request.status not in ["approved", "pending", "paid"]:
                return jsonify({"message": f"Request cannot be paid while status is {waste_request.status}"}), 422

        if listing_id:
            listing = db.session.get(WasteListing, listing_id)
            if not listing:
                return jsonify({"message": "Waste listing not found"}), 422

        payment = Payment(
            payer_id=user_id,
            producer_id=user_id,
            supplier_id=supplier_id,
            listing_id=listing_id,
            request_id=request_id,
            transport_job_id=safe_int(data.get("transport_job_id"), 0),
            transporter_id=safe_int(data.get("transporter_id"), None),
            amount=total_amount,
            total_amount=total_amount,
            waste_amount=waste_amount,
            transport_fee=transport_fee,
            platform_fee=platform_fee,
            commission=platform_fee,
            supplier_amount=waste_amount,
            transporter_amount=transport_fee,
            phone_number=phone,
            payment_method="mpesa",
            payment_status="pending",
            status="pending",
            escrow_status="waiting",
            created_at=now(),
            updated_at=now(),
        )

        db.session.add(payment)
        db.session.flush()

        if current_app.config.get("MPESA_MOCK_MODE", False):
            payment.payment_status = "paid"
            payment.status = "paid"
            payment.escrow_status = "held"
            payment.mpesa_receipt = make_unique_code("MOCK")
            payment.transaction_id = make_unique_code("TXN")
            payment.receipt_number = make_unique_code("REV")
            payment.paid_at = now()
            payment.completed_at = now()
            payment.updated_at = now()

            _create_transport_job(payment)

            db.session.commit()

            return jsonify({
                "message": "Mock payment successful. Money is held in escrow.",
                "payment_id": payment.id,
                "payment_status": payment.payment_status,
                "escrow_status": payment.escrow_status,
                "payment": payment_to_dict(payment),
            }), 200

        description = data.get("description") or f"ReVive Energy payment #{payment.id}"

        mpesa_response = MpesaService.stk_push(
            phone=phone,
            amount=total_amount,
            description=description,
            payment_id=payment.id,
        )

        checkout_request_id = mpesa_response.get("CheckoutRequestID")
        merchant_request_id = mpesa_response.get("MerchantRequestID")
        response_code = mpesa_response.get("ResponseCode")

        if str(response_code) != "0" or not checkout_request_id:
            payment.payment_status = "failed"
            payment.status = "failed"
            payment.updated_at = now()
            db.session.commit()

            return jsonify({
                "message": mpesa_response.get("errorMessage")
                or mpesa_response.get("ResponseDescription")
                or "Failed to send M-Pesa prompt",
                "mpesa_response": mpesa_response,
            }), 400

        payment.checkout_request_id = checkout_request_id
        payment.merchant_request_id = merchant_request_id
        payment.updated_at = now()

        db.session.commit()

        return jsonify({
            "message": "M-Pesa prompt sent. Check your phone and enter your PIN.",
            "payment_id": payment.id,
            "checkout_request_id": checkout_request_id,
            "merchant_request_id": merchant_request_id,
            "payment_status": payment.payment_status,
            "escrow_status": payment.escrow_status,
            "payment": payment_to_dict(payment),
            "mpesa_response": mpesa_response,
        }), 200

    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"initiate_payment error: {e}", exc_info=True)
        return jsonify({"message": str(e)}), 500


@payments_bp.route("/callback", methods=["POST"])
def mpesa_callback():
    try:
        data = request.get_json() or {}
        current_app.logger.info(f"M-Pesa callback received: {data}")

        parsed = MpesaService.parse_callback(data)

        checkout_request_id = parsed.get("checkout_request_id")
        merchant_request_id = parsed.get("merchant_request_id")
        result_code = parsed.get("result_code")

        payment = None

        if checkout_request_id:
            payment = Payment.query.filter_by(checkout_request_id=checkout_request_id).first()

        if not payment and merchant_request_id:
            payment = Payment.query.filter_by(merchant_request_id=merchant_request_id).first()

        if not payment:
            current_app.logger.warning("Payment not found for M-Pesa callback")
            return jsonify({"ResultCode": 0, "ResultDesc": "Callback received"}), 200

        if int(result_code or 1) == 0:
            payment.payment_status = "paid"
            payment.status = "paid"
            payment.escrow_status = "held"
            payment.mpesa_receipt = parsed.get("mpesa_receipt") or make_unique_code("MPESA")
            payment.transaction_id = parsed.get("mpesa_receipt") or make_unique_code("TXN")
            payment.receipt_number = make_unique_code("REV")
            payment.paid_at = now()
            payment.completed_at = now()
            payment.updated_at = now()

            if parsed.get("amount"):
                payment.amount = safe_float(parsed.get("amount"), payment.amount)

            if parsed.get("phone_number"):
                payment.phone_number = str(parsed.get("phone_number"))

            _create_transport_job(payment)

            create_notification(
                payment.producer_id,
                "Payment Successful",
                f"Your payment of KES {payment.amount:,.2f} was successful and is held in escrow.",
                "payment_success",
                payment.id,
            )

            create_notification(
                payment.supplier_id,
                "Payment Secured",
                f"A producer has paid KES {payment.amount:,.2f}. Money is held in escrow.",
                "payment_secured",
                payment.id,
            )

        else:
            payment.payment_status = "failed"
            payment.status = "failed"
            payment.escrow_status = "waiting"
            payment.updated_at = now()

            create_notification(
                payment.producer_id,
                "Payment Failed",
                parsed.get("result_desc") or "M-Pesa payment was not completed.",
                "payment_failed",
                payment.id,
            )

        db.session.commit()

        return jsonify({
            "ResultCode": 0,
            "ResultDesc": "Callback processed successfully",
        }), 200

    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"mpesa_callback error: {e}", exc_info=True)

        return jsonify({
            "ResultCode": 0,
            "ResultDesc": "Callback received",
        }), 200


@payments_bp.route("/status/<int:payment_id>", methods=["GET"])
@jwt_required()
def check_payment_status(payment_id):
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

    return jsonify({
        "payment_id": payment.id,
        "status": payment.status,
        "payment_status": payment.payment_status,
        "escrow_status": payment.escrow_status,
        "mpesa_receipt": payment.mpesa_receipt,
        "receipt_number": payment.receipt_number,
        "amount": payment.amount,
        "paid_at": payment.paid_at.isoformat() if payment.paid_at else None,
    }), 200


@payments_bp.route("/my-payments", methods=["GET"])
@jwt_required()
def my_payments():
    try:
        user_id = current_user_id()

        payments = Payment.query.filter(
            (Payment.producer_id == user_id)
            | (Payment.supplier_id == user_id)
            | (Payment.payer_id == user_id)
            | (Payment.transporter_id == user_id)
        ).order_by(Payment.created_at.desc()).all()

        return jsonify([payment_to_dict(payment) for payment in payments]), 200

    except Exception as e:
        current_app.logger.error(f"my_payments error: {e}", exc_info=True)
        return jsonify({"message": str(e)}), 500


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

    return jsonify(payment_to_dict(payment)), 200


@payments_bp.route("/<int:payment_id>/status", methods=["PUT"])
@jwt_required()
def update_payment_status(payment_id):
    try:
        payment = Payment.query.get_or_404(payment_id)
        data = request.get_json() or {}

        payment.payment_status = data.get("payment_status", payment.payment_status)
        payment.status = data.get("status", payment.status)
        payment.escrow_status = data.get("escrow_status", payment.escrow_status)
        payment.updated_at = now()

        db.session.commit()

        return jsonify({
            "message": "Payment updated successfully.",
            "payment": payment_to_dict(payment),
        }), 200

    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"update_payment_status error: {e}", exc_info=True)
        return jsonify({"message": str(e)}), 500


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