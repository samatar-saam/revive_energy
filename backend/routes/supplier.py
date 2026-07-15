from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from database import db
from models import User, WasteListing, WasteRequest, TransportJob, Notification, Collection
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
    try:
        user_id = current_user_id()
        current_app.logger.info(f"📊 Supplier dashboard requested for user_id: {user_id}")

        # ─── Listings Stats ──────────────────────────────────────
        total_listings = WasteListing.query.filter_by(supplier_id=user_id).count()
        
        active_statuses = ["available", "requested", "assigned", "collected"]
        active_listings = WasteListing.query.filter(
            WasteListing.supplier_id == user_id,
            WasteListing.status.in_(active_statuses)
        ).count()
        
        completed_listings = WasteListing.query.filter(
            WasteListing.supplier_id == user_id,
            WasteListing.status == "completed"
        ).count()

        # ─── Collection Requests (WasteRequest) ─────────────────
        pending_requests = WasteRequest.query.join(WasteListing).filter(
            WasteListing.supplier_id == user_id,
            WasteRequest.status == "pending"
        ).count()
        
        approved_requests = WasteRequest.query.join(WasteListing).filter(
            WasteListing.supplier_id == user_id,
            WasteRequest.status == "approved"
        ).count()

        # ─── Transport Jobs (Collections) ────────────────────────
        # All transport jobs for this supplier
        all_transport_jobs = TransportJob.query.filter_by(supplier_id=user_id).count()
        
        # Pending collections (open or accepted)
        pending_collections = TransportJob.query.filter(
            TransportJob.supplier_id == user_id,
            TransportJob.status.in_(["open", "accepted"])
        ).count()
        
        # In progress collections (picked_up, in_transit)
        in_progress_collections = TransportJob.query.filter(
            TransportJob.supplier_id == user_id,
            TransportJob.status.in_(["picked_up", "in_transit"])
        ).count()
        
        # Completed collections
        completed_collections = TransportJob.query.filter(
            TransportJob.supplier_id == user_id,
            TransportJob.status.in_(["delivered", "completed"])
        ).count()

        # ─── Recent Data ──────────────────────────────────────────
        recent_listings = WasteListing.query.filter_by(
            supplier_id=user_id
        ).order_by(
            WasteListing.created_at.desc()
        ).limit(5).all()

        upcoming_pickups = TransportJob.query.filter(
            TransportJob.supplier_id == user_id,
            TransportJob.status.in_(["open", "accepted", "picked_up", "in_transit"])
        ).order_by(
            TransportJob.created_at.asc()
        ).limit(5).all()

        notifications = Notification.query.filter_by(
            user_id=user_id,
            is_read=False
        ).order_by(
            Notification.created_at.desc()
        ).limit(5).all()

        # ─── Logging ──────────────────────────────────────────────
        current_app.logger.info(f"📋 Total listings: {total_listings}")
        current_app.logger.info(f"📋 Active listings: {active_listings}")
        current_app.logger.info(f"📩 Pending requests: {pending_requests}")
        current_app.logger.info(f"🚚 All transport jobs: {all_transport_jobs}")
        current_app.logger.info(f"🚚 Pending collections: {pending_collections}")
        current_app.logger.info(f"🚚 Completed collections: {completed_collections}")

        return jsonify({
            "stats": {
                "myListings": active_listings,
                "totalListings": total_listings,
                "collectionRequests": all_transport_jobs,
                "pendingCollections": pending_collections,
                "completedCollections": completed_collections,
                "inProgressCollections": in_progress_collections,
                "pendingRequests": pending_requests,
                "approvedRequests": approved_requests,
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
                    "unit": getattr(job, "unit", "kg"),
                    "location": job.pickup_location,
                    "pickup_date": job.created_at.strftime("%Y-%m-%d") if job.created_at else None,
                    "pickup_time": job.created_at.strftime("%I:%M %p") if job.created_at else None,
                    "status": job.status,
                    "transporter": job.transporter.full_name if job.transporter else "Not assigned",
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

    except Exception as e:
        current_app.logger.error(f"❌ Supplier dashboard error: {e}", exc_info=True)
        return jsonify({"message": f"Internal server error: {str(e)}"}), 500


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

    result = []
    for job in jobs:
        transporter = job.transporter if job.transporter_id else None

        # ─── Extract transporter details ──────────────────────────
        transporter_name = transporter.full_name if transporter else None
        transporter_phone = transporter.phone if transporter else None
        vehicle_type = transporter.vehicle_types if transporter else None
        vehicle_number = transporter.license_number if transporter else None
        coverage_area = transporter.coverage_area if transporter else None

        result.append({
            "id": job.id,
            "waste_type": job.waste_type,
            "quantity": job.quantity,
            "unit": getattr(job, "unit", "kg"),
            "pickup_location": job.pickup_location,
            "delivery_location": job.delivery_location,
            "status": job.status,
            "transporter_id": job.transporter_id,
            "transporter_name": transporter_name,
            "transporter_phone": transporter_phone,
            "vehicle_type": vehicle_type,
            "vehicle_number": vehicle_number,
            "coverage_area": coverage_area,
            "created_at": job.created_at.isoformat() if job.created_at else None,
        })

    return jsonify(result), 200


# ─── NEW: Approve Pickup for Transport Job ──────────────────────
@supplier_bp.route('/supplier/transport-jobs/<int:job_id>/approve-pickup', methods=['PATCH'])
@jwt_required()
@role_required('supplier')
def approve_pickup(job_id):
    try:
        user_id = current_user_id()
        job = TransportJob.query.get_or_404(job_id)

        if job.supplier_id != user_id:
            return jsonify({'message': 'Unauthorized: this job does not belong to you'}), 403

        if job.status != 'accepted':
            return jsonify({'message': 'Only accepted jobs can be approved for pickup'}), 400

        job.status = 'approved_for_pickup'
        db.session.commit()

        # Notify transporter that pickup is approved
        if job.transporter_id:
            notification = Notification(
                user_id=job.transporter_id,
                title='Pickup Approved',
                message=f'Your pickup for {job.waste_type} has been approved by the supplier.',
                type='pickup_approved'
            )
            db.session.add(notification)
            db.session.commit()

        return jsonify({
            'message': 'Pickup approved successfully',
            'job': {
                'id': job.id,
                'status': job.status,
                'waste_type': job.waste_type,
                'quantity': job.quantity,
                'pickup_location': job.pickup_location,
                'delivery_location': job.delivery_location,
            }
        }), 200

    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error in approve_pickup: {e}", exc_info=True)
        return jsonify({'message': f'Internal server error: {str(e)}'}), 500