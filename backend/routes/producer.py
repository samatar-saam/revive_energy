from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from utils.decorators import role_required
from models import User, WasteListing, WasteRequest, TransportJob, Notification
from database import db

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


def calculate_amounts(listing):
    """
    Return fixed pricing amounts regardless of the listing.
    """
    # ─── FIXED VALUES ──────────────────────────────────────────
    waste_value = 1000.00
    transport_fee = 500.00
    platform_fee = 500.00
    total_amount = waste_value + transport_fee + platform_fee  # 2000.00

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
        # ─── Fixed pricing ──────────────────────────────────
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

            result.append({
                "id": r.id,
                "listing_id": r.listing_id,
                "supplier_id": r.supplier_id,
                "waste_type": listing.waste_type if listing else "Unknown",
                "quantity": listing.quantity if listing else 0,
                "unit": listing.unit if listing else "kg",
                "supplier_name": supplier.full_name if supplier else "Unknown Supplier",
                "supplier_location": supplier.location if supplier else "",
                "status": r.status,
                "message": r.message,
                "created_at": iso(r.created_at),
                # ─── Fixed pricing ──────────────────────────
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


# ─── INCOMING DELIVERIES ────────────────────────────────────
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
            supplier_name = get_user_name(getattr(j, "supplier_id", None), "Unknown Supplier")
            transporter_name = get_user_name(getattr(j, "transporter_id", None), "Not assigned")

            result.append({
                "id": j.id,
                "waste_type": j.waste_type,
                "quantity": j.quantity,
                "unit": getattr(j, "unit", "kg"),
                "pickup_location": getattr(j, "pickup_location", ""),
                "delivery_location": getattr(j, "delivery_location", ""),
                "status": j.status,
                "supplier_id": getattr(j, "supplier_id", None),
                "supplier_name": supplier_name,
                "transporter_id": getattr(j, "transporter_id", None),
                "transporter_name": transporter_name,
                "transport_fee": getattr(j, "transport_fee", 0),
                "created_at": iso(j.created_at),
            })

        return jsonify(result), 200

    except Exception as e:
        current_app.logger.error(f"Error in get_incoming_deliveries: {e}", exc_info=True)
        return jsonify({"message": "Internal server error"}), 500