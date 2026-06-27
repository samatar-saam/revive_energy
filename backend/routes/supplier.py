from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from database import db
from models import User, WasteListing, WasteRequest, TransportJob, Notification
from utils.decorators import role_required
import logging

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

supplier_bp = Blueprint("supplier", __name__)


def current_user_id():
    return int(get_jwt_identity())


@supplier_bp.route("/supplier/dashboard", methods=["GET"])
@jwt_required()
@role_required("supplier")
def supplier_dashboard():
    user_id = current_user_id()
    current_app.logger.info(f"📊 Supplier dashboard requested for user_id: {user_id}")

    listings_query = WasteListing.query.filter_by(supplier_id=user_id)
    total_listings = listings_query.count()
    current_app.logger.info(f"📋 Total listings for user {user_id}: {total_listings}")

    active_statuses = ["available", "requested", "assigned", "collected"]
    active_listings = listings_query.filter(WasteListing.status.in_(active_statuses)).count()
    current_app.logger.info(f"📋 Active listings: {active_listings}")

    completed_listings = listings_query.filter(WasteListing.status == "completed").count()

    pending_requests = WasteRequest.query.join(WasteListing).filter(
        WasteListing.supplier_id == user_id,
        WasteRequest.status == "pending"
    ).count()
    current_app.logger.info(f"📩 Pending requests: {pending_requests}")

    recent_listings = listings_query.order_by(
        WasteListing.created_at.desc()
    ).limit(5).all()

    upcoming_pickups = TransportJob.query.filter_by(
        supplier_id=user_id
    ).filter(
        TransportJob.status.in_(["open", "accepted", "picked_up", "in_transit"])
    ).order_by(TransportJob.created_at.desc()).limit(5).all()

    notifications = Notification.query.filter_by(
        user_id=user_id,
        is_read=False
    ).order_by(Notification.created_at.desc()).limit(5).all()

    return jsonify({
        "stats": {
            "totalListings": total_listings,
            "myListings": active_listings,
            "collectionRequests": pending_requests,
            "pendingCollections": pending_requests,
            "completedCollections": completed_listings,
        },
        "recentListings": [
            {
                "id": item.id,
                "waste_type": item.waste_type,
                "quantity": item.quantity,
                "unit": item.unit,
                "location": item.location,
                "status": item.status,
                "created_at": item.created_at.isoformat() if item.created_at else None,
            }
            for item in recent_listings
        ],
        "upcomingPickups": [
            {
                "id": job.id,
                "waste_type": job.waste_type,
                "quantity": job.quantity,
                "location": job.pickup_location,
                "pickup_date": job.created_at.strftime("%Y-%m-%d") if job.created_at else None,
                "pickup_time": job.created_at.strftime("%I:%M %p") if job.created_at else None,
            }
            for job in upcoming_pickups
        ],
        "notifications": [
            {
                "id": item.id,
                "title": item.title,
                "message": item.message,
                "is_read": item.is_read,
                "created_at": item.created_at.isoformat() if item.created_at else None,
            }
            for item in notifications
        ],
    }), 200


@supplier_bp.route("/supplier/listings", methods=["POST"])
@jwt_required()
@role_required("supplier")
def create_listing():
    try:
        user_id = current_user_id()
        data = request.get_json() or {}

        # ─── Required fields ──────────────────────────────────
        required_fields = ["waste_type", "quantity", "location"]

        for field in required_fields:
            if not data.get(field):
                return jsonify({"message": f"Missing required field: {field}"}), 400

        listing = WasteListing(
            supplier_id=user_id,
            waste_type=data["waste_type"],
            category=data.get("category"),
            quantity=float(data["quantity"]),
            unit=data.get("unit", "kg"),
            location=data["location"],
            pickup_address=data.get("pickup_address"),
            description=data.get("description"),
            image_url=data.get("image_url"),
            status="available",
            # ─── Auto-pricing will be set by the platform ──
            price_per_unit=0.0,
            transport_rate_per_unit=0.0,
            waste_value=0.0,
            collection_fee=0.0,
            platform_fee=0.0,
            total_amount=0.0,
        )

        db.session.add(listing)
        db.session.commit()

        return jsonify({
            "message": "Listing created successfully",
            "id": listing.id,
            "listing": {
                "id": listing.id,
                "waste_type": listing.waste_type,
                "quantity": listing.quantity,
                "unit": listing.unit,
                "location": listing.location,
                "status": listing.status,
            },
        }), 201

    except Exception as error:
        db.session.rollback()
        logger.error(f"Create listing error: {error}")
        return jsonify({"message": f"Server error: {str(error)}"}), 500


@supplier_bp.route("/supplier/listings", methods=["GET"])
@jwt_required()
@role_required("supplier")
def get_listings():
    user_id = current_user_id()

    listings = WasteListing.query.filter_by(
        supplier_id=user_id
    ).order_by(WasteListing.created_at.desc()).all()

    return jsonify([
        {
            "id": item.id,
            "waste_type": item.waste_type,
            "category": item.category,
            "quantity": item.quantity,
            "unit": item.unit,
            "location": item.location,
            "pickup_address": item.pickup_address,
            "description": item.description,
            "image_url": item.image_url,
            "status": item.status,
            "created_at": item.created_at.isoformat() if item.created_at else None,
        }
        for item in listings
    ]), 200


@supplier_bp.route("/supplier/listings/<int:listing_id>", methods=["PATCH"])
@jwt_required()
@role_required("supplier")
def update_listing(listing_id):
    user_id = current_user_id()

    listing = WasteListing.query.get_or_404(listing_id)

    if int(listing.supplier_id) != user_id:
        return jsonify({"message": "Unauthorized"}), 403

    data = request.get_json() or {}

    allowed_fields = [
        "waste_type",
        "quantity",
        "unit",
        "location",
        "pickup_address",
        "description",
        "image_url",
    ]

    for field in allowed_fields:
        if field in data:
            if field == "quantity":
                setattr(listing, field, float(data[field]))
            else:
                setattr(listing, field, data[field])

    db.session.commit()

    return jsonify({
        "message": "Listing updated successfully",
        "listing": {
            "id": listing.id,
            "waste_type": listing.waste_type,
            "quantity": listing.quantity,
            "unit": listing.unit,
            "location": listing.location,
            "status": listing.status,
        }
    }), 200


@supplier_bp.route("/supplier/listings/<int:listing_id>", methods=["DELETE"])
@jwt_required()
@role_required("supplier")
def delete_listing(listing_id):
    user_id = current_user_id()

    listing = WasteListing.query.get_or_404(listing_id)

    if int(listing.supplier_id) != user_id:
        return jsonify({"message": "Unauthorized"}), 403

    if listing.status not in ["available", "cancelled"]:
        return jsonify({"message": "Cannot delete listing in its current state"}), 400

    db.session.delete(listing)
    db.session.commit()

    return jsonify({"message": "Listing deleted successfully"}), 200


@supplier_bp.route("/supplier/requests", methods=["GET"])
@jwt_required()
@role_required("supplier")
def get_requests():
    user_id = current_user_id()

    requests = WasteRequest.query.join(WasteListing).filter(
        WasteListing.supplier_id == user_id
    ).order_by(WasteRequest.created_at.desc()).all()

    result = []
    for item in requests:
        listing = item.listing
        result.append({
            "id": item.id,
            "listing_id": item.listing_id,
            "waste_type": listing.waste_type if listing else None,
            "producer_name": item.producer.full_name if item.producer else "Unknown Producer",
            "producer_id": item.producer_id,
            "status": item.status,
            "message": item.message,
            "created_at": item.created_at.isoformat() if item.created_at else None,
        })
    return jsonify(result), 200


@supplier_bp.route("/supplier/requests/<int:request_id>/approve", methods=["PATCH"])
@jwt_required()
@role_required("supplier")
def approve_request(request_id):
    user_id = current_user_id()

    waste_request = WasteRequest.query.get_or_404(request_id)
    listing = WasteListing.query.get_or_404(waste_request.listing_id)

    if int(listing.supplier_id) != user_id:
        return jsonify({
            "message": "Unauthorized: this request does not belong to you",
            "listing_supplier_id": listing.supplier_id,
            "logged_in_user_id": user_id,
        }), 403

    if waste_request.status != "pending":
        return jsonify({"message": "Request already processed"}), 400

    waste_request.status = "approved"
    listing.status = "approved"

    notification = Notification(
        user_id=waste_request.producer_id,
        title="Waste Request Approved",
        message=f"Your request for {listing.waste_type} has been approved. Please proceed to payment.",
        type="request_approved",
    )

    db.session.add(notification)
    db.session.commit()

    return jsonify({
        "message": "Request approved successfully. Waiting for producer payment.",
        "request": {
            "id": waste_request.id,
            "status": waste_request.status,
            "listing_id": listing.id,
            "listing_status": listing.status,
        },
    }), 200


@supplier_bp.route("/supplier/requests/<int:request_id>/reject", methods=["PATCH"])
@jwt_required()
@role_required("supplier")
def reject_request(request_id):
    user_id = current_user_id()

    waste_request = WasteRequest.query.get_or_404(request_id)
    listing = WasteListing.query.get_or_404(waste_request.listing_id)

    if int(listing.supplier_id) != user_id:
        return jsonify({
            "message": "Unauthorized: this request does not belong to you",
            "listing_supplier_id": listing.supplier_id,
            "logged_in_user_id": user_id,
        }), 403

    if waste_request.status != "pending":
        return jsonify({"message": "Request already processed"}), 400

    waste_request.status = "rejected"

    notification = Notification(
        user_id=waste_request.producer_id,
        title="Waste Request Rejected",
        message=f"Your request for {listing.waste_type} was rejected.",
        type="request_rejected",
    )

    db.session.add(notification)
    db.session.commit()

    return jsonify({
        "message": "Request rejected successfully",
        "request": {
            "id": waste_request.id,
            "status": waste_request.status,
        },
    }), 200


@supplier_bp.route("/supplier/collections", methods=["GET"])
@jwt_required()
@role_required("supplier")
def get_supplier_collections():
    user_id = current_user_id()

    jobs = TransportJob.query.filter_by(
        supplier_id=user_id
    ).order_by(TransportJob.created_at.desc()).all()

    return jsonify([
        {
            "id": job.id,
            "waste_type": job.waste_type,
            "quantity": job.quantity,
            "pickup_location": job.pickup_location,
            "delivery_location": job.delivery_location,
            "status": job.status,
            "transporter_name": job.transporter.full_name if job.transporter else None,
            "created_at": job.created_at.isoformat() if job.created_at else None,
        }
        for job in jobs
    ]), 200