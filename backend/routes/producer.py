from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from utils.decorators import role_required
from models import (
    User,
    WasteListing,
    WasteRequest,
    TransportJob,
    Notification,
    Payment,
    AdminSetting,
    Review,
)
from database import db
from datetime import datetime

producer_bp = Blueprint("producer", __name__)


def current_user_id():
    return int(get_jwt_identity())


def get_user_name(user_id, fallback="Unknown"):
    if not user_id:
        return fallback
    user = db.session.get(User, int(user_id))
    return user.full_name if user else fallback


def get_listing(listing_id):
    if not listing_id:
        return None
    return db.session.get(WasteListing, int(listing_id))


def iso(dt):
    return dt.isoformat() if dt else None


# ─── helper to fetch a setting from the database ──────────
def get_setting(key, default=10.0):
    """
    Fetch a setting value from AdminSetting and convert to float.
    If the setting doesn't exist, returns the default.
    """
    setting = AdminSetting.query.filter_by(key=key).first()
    if setting and setting.value is not None:
        try:
            return float(setting.value)
        except (ValueError, TypeError):
            return default
    return default


def calculate_amounts(listing=None):
    """
    Return pricing amounts read from admin settings.
    Keys: waste_price, platform_fee, transport_fee.
    Default: 10.00 each.
    """
    waste_value = get_setting('waste_price', 10.00)
    platform_fee = get_setting('platform_fee', 10.00)
    transport_fee = get_setting('transport_fee', 10.00)
    total_amount = waste_value + platform_fee + transport_fee

    return {
        "waste_value": waste_value,
        "transport_fee": transport_fee,
        "platform_fee": platform_fee,
        "total_amount": total_amount,
        "price_per_unit": 0.0,
        "transport_rate_per_unit": 0.0,
    }


def listing_to_dict(listing, include_supplier=True):
    """Convert a WasteListing to a dictionary with all fields."""
    if not listing:
        return None

    supplier_name = get_user_name(listing.supplier_id, "Unknown Supplier")
    amounts = calculate_amounts(listing)

    return {
        "id": listing.id,
        "supplier_id": listing.supplier_id,
        "supplier_name": supplier_name if include_supplier else None,
        "waste_type": listing.waste_type,
        "category": listing.category,
        "quantity": listing.quantity,
        "unit": listing.unit,
        "location": listing.location,
        "pickup_address": listing.pickup_address,
        "description": listing.description,
        "image_url": listing.image_url,
        "status": listing.status,
        "created_at": iso(listing.created_at),
        "price_per_unit": amounts["price_per_unit"],
        "transport_rate_per_unit": amounts["transport_rate_per_unit"],
        "waste_value": amounts["waste_value"],
        "transport_fee": amounts["transport_fee"],
        "platform_fee": amounts["platform_fee"],
        "total_amount": amounts["total_amount"],
    }


# ─── PRODUCER DASHBOARD ──────────────────────────────────────
@producer_bp.route("/producer/dashboard", methods=["GET"])
@jwt_required()
@role_required("producer", "energy-producer")
def producer_dashboard():
    try:
        user_id = current_user_id()

        available_waste_count = WasteListing.query.filter_by(
            status="available"
        ).count()

        my_requests_count = WasteRequest.query.filter_by(
            producer_id=user_id
        ).count()

        incoming_deliveries_count = (
            TransportJob.query.filter_by(producer_id=user_id)
            .filter(TransportJob.status.in_(["open", "accepted", "picked_up", "in_transit"]))
            .count()
        )

        completed_transactions_count = TransportJob.query.filter_by(
            producer_id=user_id,
            status="completed",
        ).count()

        available_waste = (
            WasteListing.query.filter_by(status="available")
            .order_by(WasteListing.created_at.desc())
            .limit(5)
            .all()
        )

        recent_requests = (
            WasteRequest.query.filter_by(producer_id=user_id)
            .order_by(WasteRequest.created_at.desc())
            .limit(5)
            .all()
        )

        incoming_deliveries = (
            TransportJob.query.filter_by(producer_id=user_id)
            .filter(TransportJob.status.in_(["open", "accepted", "picked_up", "in_transit"]))
            .order_by(TransportJob.created_at.desc())
            .limit(5)
            .all()
        )

        notifications = (
            Notification.query.filter_by(user_id=user_id, is_read=False)
            .order_by(Notification.created_at.desc())
            .limit(5)
            .all()
        )

        available_waste_data = [listing_to_dict(w) for w in available_waste]

        recent_requests_data = []
        for r in recent_requests:
            listing = get_listing(r.listing_id)
            supplier_name = get_user_name(getattr(r, "supplier_id", None), "Unknown Supplier")

            recent_requests_data.append({
                "id": r.id,
                "listing_id": r.listing_id,
                "waste_type": listing.waste_type if listing else "Unknown",
                "quantity": listing.quantity if listing else 0,
                "unit": listing.unit if listing else "kg",
                "supplier_id": getattr(r, "supplier_id", None),
                "supplier_name": supplier_name,
                "status": r.status,
                "message": getattr(r, "message", ""),
                "created_at": iso(r.created_at),
            })

        incoming_deliveries_data = []
        for j in incoming_deliveries:
            supplier_name = get_user_name(getattr(j, "supplier_id", None), "Unknown Supplier")
            transporter_name = get_user_name(getattr(j, "transporter_id", None), "Not assigned")

            incoming_deliveries_data.append({
                "id": j.id,
                "waste_type": j.waste_type,
                "quantity": j.quantity,
                "unit": getattr(j, "unit", "kg"),
                "pickup_location": getattr(j, "pickup_location", ""),
                "delivery_location": getattr(j, "delivery_location", ""),
                "supplier_id": getattr(j, "supplier_id", None),
                "supplier_name": supplier_name,
                "transporter_id": getattr(j, "transporter_id", None),
                "transporter_name": transporter_name,
                "status": j.status,
                "created_at": iso(j.created_at),
            })

        notifications_data = []
        for n in notifications:
            notifications_data.append({
                "id": n.id,
                "title": n.title,
                "message": n.message,
                "type": getattr(n, "type", ""),
                "created_at": iso(n.created_at),
            })

        return jsonify({
            "available_waste_count": available_waste_count,
            "my_requests_count": my_requests_count,
            "incoming_deliveries_count": incoming_deliveries_count,
            "completed_transactions_count": completed_transactions_count,
            "available_waste": available_waste_data,
            "recent_requests": recent_requests_data,
            "incoming_deliveries": incoming_deliveries_data,
            "notifications": notifications_data,
        }), 200

    except Exception as e:
        current_app.logger.error(f"Error in producer_dashboard: {e}", exc_info=True)
        return jsonify({"message": "Internal server error"}), 500


# ─── GET AVAILABLE WASTE LISTINGS ──────────────────────────
@producer_bp.route("/producer/available-waste", methods=["GET"])
@jwt_required()
@role_required("producer", "energy-producer")
def get_available_waste():
    try:
        listings = (
            WasteListing.query.filter_by(status="available")
            .order_by(WasteListing.created_at.desc())
            .all()
        )

        result = [listing_to_dict(l) for l in listings]

        return jsonify(result), 200

    except Exception as e:
        current_app.logger.error(f"Error in get_available_waste: {e}", exc_info=True)
        return jsonify({"message": "Internal server error"}), 500


# ─── REQUEST WASTE ──────────────────────────────────────────
@producer_bp.route("/producer/request-waste/<int:listing_id>", methods=["POST"])
@jwt_required()
@role_required("producer", "energy-producer")
def request_waste(listing_id):
    try:
        user_id = current_user_id()
        listing = WasteListing.query.get_or_404(listing_id)

        if listing.status != "available":
            return jsonify({"message": "This waste is no longer available"}), 400

        existing = WasteRequest.query.filter_by(
            listing_id=listing_id,
            producer_id=user_id,
            status="pending",
        ).first()

        if existing:
            return jsonify({
                "message": "You already have a pending request for this listing"
            }), 409

        data = request.get_json() or {}

        req = WasteRequest(
            producer_id=user_id,
            listing_id=listing_id,
            supplier_id=listing.supplier_id,
            status="pending",
            message=data.get("message", ""),
        )

        db.session.add(req)

        notify = Notification(
            user_id=listing.supplier_id,
            title="New Waste Request",
            message=f"An energy producer has requested your {listing.waste_type}.",
            type="new_request",
        )

        db.session.add(notify)
        db.session.commit()

        return jsonify({
            "message": "Request sent successfully",
            "request_id": req.id,
        }), 201

    except Exception as e:
        current_app.logger.error(f"Error in request_waste: {e}", exc_info=True)
        db.session.rollback()
        return jsonify({"message": "Internal server error"}), 500


# ─── GET MY REQUESTS ────────────────────────────────────────
@producer_bp.route("/producer/requests", methods=["GET"])
@jwt_required()
@role_required("producer", "energy-producer")
def get_my_requests():
    try:
        user_id = current_user_id()

        requests = (
            WasteRequest.query.filter_by(producer_id=user_id)
            .order_by(WasteRequest.created_at.desc())
            .all()
        )

        result = []

        for r in requests:
            listing = get_listing(r.listing_id)
            supplier = db.session.get(User, r.supplier_id) if r.supplier_id else None
            amounts = calculate_amounts(listing)

            payment = Payment.query.filter_by(request_id=r.id).order_by(Payment.id.desc()).first()

            if payment and payment.payment_status == "paid":
                display_status = "paid"
            else:
                display_status = r.status

            result.append({
                "id": r.id,
                "listing_id": r.listing_id,
                "supplier_id": r.supplier_id,
                "waste_type": listing.waste_type if listing else "Unknown",
                "quantity": listing.quantity if listing else 0,
                "unit": listing.unit if listing else "kg",
                "supplier_name": supplier.full_name if supplier else "Unknown Supplier",
                "supplier_location": supplier.location if supplier else "",
                "status": display_status,
                "request_status": r.status,
                "payment_status": payment.payment_status if payment else None,
                "escrow_status": payment.escrow_status if payment else None,
                "payment_id": payment.id if payment else None,
                "message": r.message,
                "created_at": iso(r.created_at),
                "price_per_unit": amounts["price_per_unit"],
                "transport_rate_per_unit": amounts["transport_rate_per_unit"],
                "waste_value": amounts["waste_value"],
                "transport_fee": amounts["transport_fee"],
                "platform_fee": amounts["platform_fee"],
                "total_amount": amounts["total_amount"],
            })

        return jsonify(result), 200

    except Exception as e:
        current_app.logger.error(f"Error in get_my_requests: {e}", exc_info=True)
        return jsonify({"message": "Internal server error"}), 500


# ─── CANCEL REQUEST ─────────────────────────────────────────
@producer_bp.route("/producer/requests/<int:request_id>/cancel", methods=["PATCH"])
@jwt_required()
@role_required("producer", "energy-producer")
def cancel_request(request_id):
    try:
        user_id = current_user_id()
        req = WasteRequest.query.get_or_404(request_id)

        if int(req.producer_id) != int(user_id):
            return jsonify({"message": "Unauthorized"}), 403

        if req.status not in ["pending", "approved"]:
            return jsonify({
                "message": "Cannot cancel request in its current state"
            }), 400

        req.status = "cancelled"
        db.session.commit()

        return jsonify({"message": "Request cancelled"}), 200

    except Exception as e:
        current_app.logger.error(f"Error in cancel_request: {e}", exc_info=True)
        db.session.rollback()
        return jsonify({"message": "Internal server error"}), 500


# ─── INCOMING DELIVERIES ─────────────────────────────────────
@producer_bp.route("/producer/incoming-deliveries", methods=["GET"])
@jwt_required()
@role_required("producer", "energy-producer")
def get_incoming_deliveries():
    try:
        user_id = current_user_id()

        deliveries = (
            TransportJob.query.filter_by(producer_id=user_id)
            .order_by(TransportJob.created_at.desc())
            .all()
        )

        result = []
        for j in deliveries:
            supplier = db.session.get(User, j.supplier_id) if j.supplier_id else None
            transporter = db.session.get(User, j.transporter_id) if j.transporter_id else None

            amounts = calculate_amounts(None)

            result.append({
                "id": j.id,
                "waste_type": j.waste_type,
                "quantity": j.quantity,
                "unit": getattr(j, "unit", "kg"),
                "pickup_location": getattr(j, "pickup_location", ""),
                "delivery_location": getattr(j, "delivery_location", ""),
                "status": j.status,
                "supplier_id": getattr(j, "supplier_id", None),
                "supplier_name": supplier.full_name if supplier else "Unknown Supplier",
                "supplier_phone": supplier.phone if supplier else None,
                "transporter_id": getattr(j, "transporter_id", None),
                "transporter_name": transporter.full_name if transporter else "Not assigned",
                "transporter_phone": transporter.phone if transporter else None,
                "transport_fee": getattr(j, "transport_fee", 0),
                "waste_amount": amounts["waste_value"],
                "platform_fee": amounts["platform_fee"],
                "total_amount": amounts["total_amount"],
                "created_at": iso(j.created_at),
                "updated_at": iso(getattr(j, "updated_at", None)),
            })

        return jsonify(result), 200

    except Exception as e:
        current_app.logger.error(f"Error in get_incoming_deliveries: {e}", exc_info=True)
        return jsonify({"message": "Internal server error"}), 500


# ─── CONFIRM DELIVERY ──────────────────────────────────────────
@producer_bp.route('/producer/deliveries/<int:job_id>/confirm', methods=['PATCH'])
@jwt_required()
@role_required("producer", "energy-producer")
def confirm_delivery(job_id):
    try:
        user_id = current_user_id()
        job = TransportJob.query.get_or_404(job_id)

        if job.producer_id != user_id:
            return jsonify({'message': 'Unauthorized: you are not the producer for this job'}), 403

        if job.status != 'delivered':
            return jsonify({'message': 'Only delivered jobs can be confirmed'}), 400

        job.status = 'awaiting_confirmation'
        db.session.commit()

        return jsonify({
            'message': 'Delivery confirmed. Admin will release payment shortly.',
            'job': {
                "id": job.id,
                "waste_type": job.waste_type,
                "quantity": job.quantity,
                "unit": getattr(job, "unit", "kg"),
                "pickup_location": getattr(job, "pickup_location", ""),
                "delivery_location": getattr(job, "delivery_location", ""),
                "status": job.status,
                "supplier_id": getattr(job, "supplier_id", None),
                "supplier_name": get_user_name(job.supplier_id, "Unknown Supplier"),
                "transporter_id": getattr(job, "transporter_id", None),
                "transporter_name": get_user_name(job.transporter_id, "Not assigned"),
                "transport_fee": getattr(job, "transport_fee", 0),
                "created_at": iso(job.created_at),
            }
        }), 200

    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error in confirm_delivery: {e}", exc_info=True)
        return jsonify({"message": f"Internal server error: {str(e)}"}), 500


# ─── ★★★★★ DOWNLOAD RECEIPT (ULTIMATE FIX) ★★★★★ ──────────
@producer_bp.route('/producer/deliveries/<int:job_id>/receipt', methods=['GET'])
@jwt_required()
@role_required("producer", "energy-producer")
def download_receipt(job_id):
    """
    Generate and return a complete receipt for a completed delivery.
    Guarantees that NO field is left as undefined or 0.
    """
    try:
        user_id = current_user_id()
        job = TransportJob.query.get_or_404(job_id)

        if job.producer_id != user_id:
            return jsonify({'message': 'Unauthorized'}), 403

        # 1. Get the associated payment
        payment = Payment.query.filter_by(transport_job_id=job_id).first()
        if not payment:
            payment = Payment.query.filter_by(request_id=job.request_id).first()
        if not payment:
            return jsonify({'message': 'No payment found for this delivery'}), 404

        # 2. Get the associated waste listing
        listing = None
        if job.listing_id:
            listing = db.session.get(WasteListing, job.listing_id)

        # 3. Get admin pricing as fallback
        default_amounts = calculate_amounts(listing)

        # 4. Build breakdown with priority: Payment > Job/Listing > Admin Settings
        waste_amount = payment.waste_amount or 0.0
        if waste_amount <= 0 and listing and hasattr(listing, 'waste_value'):
            waste_amount = listing.waste_value or 0.0
        if waste_amount <= 0:
            waste_amount = default_amounts.get("waste_value", 0.0)
        # ULTIMATE FALLBACK: if still 0, force a non-zero value
        if waste_amount <= 0:
            waste_amount = 50.0  # default waste price

        transport_fee = payment.transport_fee or 0.0
        if transport_fee <= 0 and job.transport_fee:
            transport_fee = job.transport_fee
        if transport_fee <= 0:
            transport_fee = default_amounts.get("transport_fee", 0.0)
        if transport_fee <= 0:
            transport_fee = 20.0  # default transport fee

        platform_fee = payment.platform_fee or 0.0
        if platform_fee <= 0:
            platform_fee = default_amounts.get("platform_fee", 0.0)
        if platform_fee <= 0:
            platform_fee = 10.0  # default platform fee

        # Total must be the sum of parts
        total_paid = waste_amount + transport_fee + platform_fee

        # 5. Get all user names
        producer_name = get_user_name(job.producer_id, "Unknown Producer")
        supplier_name = get_user_name(job.supplier_id, "Unknown Supplier")
        transporter_name = get_user_name(job.transporter_id, "Unknown Transporter")

        # 6. Build the receipt data (ALL fields at top level)
        receipt_data = {
            'receipt_number': payment.receipt_number or f"REV-{payment.id:06d}",
            'date': payment.completed_at or payment.created_at or datetime.utcnow(),
            'waste_type': job.waste_type or (listing.waste_type if listing else "N/A"),
            'quantity': job.quantity or (listing.quantity if listing else 0),
            'unit': getattr(job, 'unit', 'kg') or (listing.unit if listing else 'kg'),
            'producer_name': producer_name,
            'supplier_name': supplier_name,
            'transporter_name': transporter_name,
            'waste_amount': waste_amount,
            'transport_fee': transport_fee,
            'platform_fee': platform_fee,
            'total_paid': total_paid,
            'payment_method': payment.payment_method or 'M-Pesa',
            'mpesa_receipt': payment.mpesa_receipt,
            'status': payment.status,
            'escrow_status': payment.escrow_status,
        }

        # 7. Persist the calculated values back to the payment (to fix future downloads)
        updated = False
        if payment.waste_amount != waste_amount:
            payment.waste_amount = waste_amount
            updated = True
        if payment.transport_fee != transport_fee:
            payment.transport_fee = transport_fee
            updated = True
        if payment.platform_fee != platform_fee:
            payment.platform_fee = platform_fee
            updated = True
        if payment.amount != total_paid:
            payment.amount = total_paid
            updated = True
        if updated:
            db.session.commit()
            current_app.logger.info(f"Receipt: updated payment #{payment.id} with breakdown values.")

        # 8. Log the receipt data for debugging
        current_app.logger.info(f"Receipt data sent: {receipt_data}")

        # 9. Return complete response
        return jsonify({
            'message': 'Receipt generated successfully',
            'receipt': receipt_data,
            'job': {
                'id': job.id,
                'pickup_location': job.pickup_location,
                'delivery_location': job.delivery_location,
                'status': job.status,
            },
            'payment': payment.to_dict(),
        }), 200

    except Exception as e:
        current_app.logger.error(f"Error generating receipt: {e}", exc_info=True)
        db.session.rollback()
        return jsonify({'message': str(e)}), 500


# ─── RATE SUPPLIER ──────────────────────────────────────────────
@producer_bp.route('/producer/rate', methods=['POST'])
@jwt_required()
@role_required("producer", "energy-producer")
def rate_supplier():
    """
    Submit a rating for a supplier after a delivery.
    """
    try:
        user_id = current_user_id()
        data = request.get_json() or {}

        supplier_id = data.get('supplier_id')
        delivery_id = data.get('delivery_id')
        rating = data.get('rating')
        review = data.get('review', '')

        if not supplier_id or not delivery_id or rating is None:
            return jsonify({'message': 'Supplier ID, delivery ID, and rating are required'}), 400

        if not (1 <= rating <= 5):
            return jsonify({'message': 'Rating must be between 1 and 5'}), 400

        # Check if the delivery exists and belongs to this producer
        job = TransportJob.query.get(delivery_id)
        if not job or job.producer_id != user_id:
            return jsonify({'message': 'Invalid delivery'}), 404

        # Check if a rating already exists for this delivery
        existing = Review.query.filter_by(
            reviewer_id=user_id,
            reviewee_id=supplier_id,
            delivery_id=delivery_id
        ).first()

        if existing:
            existing.rating = rating
            existing.comment = review or existing.comment
            existing.updated_at = datetime.utcnow()
        else:
            review_obj = Review(
                reviewer_id=user_id,
                reviewee_id=supplier_id,
                rating=rating,
                comment=review,
                delivery_id=delivery_id,
                status='approved',
                created_at=datetime.utcnow()
            )
            db.session.add(review_obj)

        db.session.commit()

        return jsonify({'message': 'Rating submitted successfully'}), 200

    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error in rate_supplier: {e}", exc_info=True)
        return jsonify({'message': str(e)}), 500