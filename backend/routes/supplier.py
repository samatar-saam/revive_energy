from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from flask_mail import Message
from database import db
from models import User, WasteListing, WasteRequest, TransportJob, Notification, Collection
from utils.decorators import role_required
import logging
import threading

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

        pending_requests = WasteRequest.query.join(WasteListing).filter(
            WasteListing.supplier_id == user_id,
            WasteRequest.status == "pending"
        ).count()
        approved_requests = WasteRequest.query.join(WasteListing).filter(
            WasteListing.supplier_id == user_id,
            WasteRequest.status == "approved"
        ).count()

        all_transport_jobs = TransportJob.query.filter_by(supplier_id=user_id).count()
        pending_collections = TransportJob.query.filter(
            TransportJob.supplier_id == user_id,
            TransportJob.status.in_(["open", "accepted"])
        ).count()
        in_progress_collections = TransportJob.query.filter(
            TransportJob.supplier_id == user_id,
            TransportJob.status.in_(["picked_up", "in_transit"])
        ).count()
        completed_collections = TransportJob.query.filter(
            TransportJob.supplier_id == user_id,
            TransportJob.status.in_(["delivered", "completed"])
        ).count()

        recent_listings = WasteListing.query.filter_by(
            supplier_id=user_id
        ).order_by(WasteListing.created_at.desc()).limit(5).all()

        upcoming_pickups = TransportJob.query.filter(
            TransportJob.supplier_id == user_id,
            TransportJob.status.in_(["open", "accepted", "picked_up", "in_transit"])
        ).order_by(TransportJob.created_at.asc()).limit(5).all()

        notifications = Notification.query.filter_by(
            user_id=user_id,
            is_read=False
        ).order_by(Notification.created_at.desc()).limit(5).all()

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
            price_per_unit=0.0,
            transport_rate_per_unit=0.0,
            waste_value=0.0,
            collection_fee=0.0,
            platform_fee=0.0,
            total_amount=0.0,
        )

        db.session.add(listing)
        db.session.commit()

        # ─── Send email notifications to all producers ──────
        app = current_app._get_current_object()

        def send_emails():
            with app.app_context():
                try:
                    mail = app.extensions.get('mail')
                    if not mail:
                        app.logger.error("❌ Mail extension not found in app.extensions!")
                        return

                    producers = User.query.filter_by(
                        role='producer',
                        account_status='verified'
                    ).all()
                    app.logger.info(f"📧 Found {len(producers)} active producers.")

                    if not producers:
                        app.logger.info("No producers to notify.")
                        return

                    marketplace_url = "http://localhost:5173/dashboard/marketplace"
                    subject = f"New Waste Available: {listing.waste_type}"

                    # ─── HTML email content (professional template) ───
                    html_content = f"""
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <title>New Waste Listing</title>
                    </head>
                    <body style="font-family: Arial, sans-serif; background: #f8fafc; margin: 0; padding: 0;">
                        <table width="100%" cellpadding="0" cellspacing="0" style="background: #f8fafc; padding: 20px;">
                            <tr>
                                <td align="center">
                                    <table width="600" cellpadding="0" cellspacing="0" style="background: white; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                                        <!-- Header -->
                                        <tr>
                                            <td style="background: #11402D; padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
                                                <h1 style="color: white; margin: 0; font-size: 28px;">♻️ ReVive Energy</h1>
                                                <p style="color: #a7f3d0; margin: 5px 0;">Waste‑to‑Energy Marketplace</p>
                                            </td>
                                        </tr>
                                        <!-- Content -->
                                        <tr>
                                            <td style="padding: 30px;">
                                                <h2 style="color: #11402D; margin-top: 0;">New Waste Listing Available</h2>
                                                <p style="color: #4b5563;">A supplier has posted a new waste listing that may interest you:</p>
                                                <ul style="color: #4b5563; font-size: 15px; line-height: 1.8;">
                                                    <li><strong>Type:</strong> {listing.waste_type}</li>
                                                    <li><strong>Quantity:</strong> {listing.quantity} {listing.unit}</li>
                                                    <li><strong>Location:</strong> {listing.location}</li>
                                                    <li><strong>Pickup Address:</strong> {listing.pickup_address or "Not specified"}</li>
                                                    <li><strong>Description:</strong> {listing.description or "No description provided"}</li>
                                                </ul>
                                                <div style="text-align: center; margin: 30px 0;">
                                                    <a href="{marketplace_url}" style="background: #11402D; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: bold;">View in Marketplace</a>
                                                </div>
                                                <p style="color: #6b7280; font-size: 14px;">Don't miss out – request this waste before it's gone!</p>
                                            </td>
                                        </tr>
                                        <!-- Footer -->
                                        <tr>
                                            <td style="padding: 20px; text-align: center; color: #9ca3af; font-size: 12px; border-top: 1px solid #e5e7eb;">
                                                <p>&copy; 2026 ReVive Energy. All rights reserved.</p>
                                                <p style="font-size: 11px; color: #d1d5db;">You received this because you are a registered producer.</p>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                        </table>
                    </body>
                    </html>
                    """

                    # ─── Plain‑text version ──────────────────────────
                    plain_text = f"""
                    ReVive Energy – New Waste Listing

                    A supplier has posted a new waste listing:

                    Type: {listing.waste_type}
                    Quantity: {listing.quantity} {listing.unit}
                    Location: {listing.location}
                    Pickup Address: {listing.pickup_address or "Not specified"}
                    Description: {listing.description or "No description provided"}

                    View it here: {marketplace_url}

                    © 2026 ReVive Energy
                    """

                    # ─── Build and send message ─────────────────────
                    for producer in producers:
                        if not producer.email:
                            app.logger.warning(f"Producer {producer.id} has no email, skipping.")
                            continue

                        msg = Message(
                            subject=subject,
                            recipients=[producer.email],
                            html=html_content,
                            body=plain_text,
                            sender=('ReVive Energy', app.config.get('MAIL_DEFAULT_SENDER')),
                            reply_to=app.config.get('MAIL_DEFAULT_SENDER'),
                            extra_headers={
                                'List-Unsubscribe': f'<mailto:{app.config.get("MAIL_DEFAULT_SENDER")}?subject=unsubscribe>',
                                'X-Mailer': 'ReVive Energy Platform',
                                'X-Priority': '3 (Normal)',
                                'X-MSMail-Priority': 'Normal',
                                'Importance': 'Normal',
                                'X-Auto-Response-Suppress': 'OOF, DR, RN, NRN, AutoReply',
                                'X-Report-Abuse': f'Please report abuse to {app.config.get("MAIL_DEFAULT_SENDER")}'
                            }
                        )
                        mail.send(msg)
                        app.logger.info(f"✅ Email sent to {producer.email}")

                except Exception as e:
                    app.logger.error(f"❌ Email sending error: {e}", exc_info=True)

        thread = threading.Thread(target=send_emails)
        thread.start()

        return jsonify({
            "message": "Listing created successfully. Producers will be notified via email.",
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