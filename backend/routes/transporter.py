from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from utils.decorators import role_required
from database import db   # ✅ import db from database, not models
from models import (
    TransportJob,
    Notification,
    Payment,
    WasteListing,
    WasteRequest,
    Conversation,
)

transporter_bp = Blueprint("transporter", __name__)


def job_to_dict(job):
    return {
        "id": job.id,
        "request_id": job.request_id,
        "listing_id": job.listing_id,
        "supplier_id": job.supplier_id,
        "producer_id": job.producer_id,
        "transporter_id": job.transporter_id,
        "waste_type": job.waste_type,
        "quantity": job.quantity,
        "pickup_location": job.pickup_location,
        "delivery_location": job.delivery_location,
        "status": job.status,
        "created_at": job.created_at.isoformat() if job.created_at else None,
    }


def notification_to_dict(notification):
    return {
        "id": notification.id,
        "title": notification.title,
        "message": notification.message,
        "type": notification.type,
        "is_read": notification.is_read,
        "created_at": notification.created_at.isoformat() if notification.created_at else None,
    }


def payment_to_dict(payment):
    return {
        "id": payment.id,
        "reference": payment.receipt_number or payment.transaction_id or f"PAY-{payment.id}",
        "amount": payment.transporter_amount or payment.transport_fee or payment.amount or 0,
        "status": payment.status or payment.payment_status,
        "payment_method": payment.payment_method,
        "created_at": payment.created_at.isoformat() if payment.created_at else None,
    }


def create_notification(user_id, title, message, notification_type="transport"):
    notification = Notification(
        user_id=user_id,
        title=title,
        message=message,
        type=notification_type,
        is_read=False,
    )
    db.session.add(notification)


@transporter_bp.route("/transporter/dashboard", methods=["GET"])
@jwt_required()
@role_required("transporter")
def transporter_dashboard():
    current_user_id = int(get_jwt_identity())

    open_jobs = TransportJob.query.filter_by(status="open").order_by(
        TransportJob.created_at.desc()
    ).all()

    accepted_jobs = TransportJob.query.filter_by(
        transporter_id=current_user_id,
        status="accepted",
    ).order_by(TransportJob.created_at.desc()).all()

    active_deliveries = TransportJob.query.filter(
        TransportJob.transporter_id == current_user_id,
        TransportJob.status.in_(["accepted", "picked_up", "in_transit"]),
    ).order_by(TransportJob.created_at.desc()).all()

    completed_deliveries_count = TransportJob.query.filter(
        TransportJob.transporter_id == current_user_id,
        TransportJob.status.in_(["delivered", "completed"]),
    ).count()

    notifications = Notification.query.filter_by(
        user_id=current_user_id
    ).order_by(Notification.created_at.desc()).limit(5).all()

    return jsonify({
        "open_jobs_count": len(open_jobs),
        "accepted_jobs_count": len(accepted_jobs),
        "active_deliveries_count": len(active_deliveries),
        "completed_deliveries_count": completed_deliveries_count,
        "open_jobs": [job_to_dict(job) for job in open_jobs],
        "accepted_jobs": [job_to_dict(job) for job in accepted_jobs],
        "active_deliveries": [job_to_dict(job) for job in active_deliveries],
        "notifications": [notification_to_dict(n) for n in notifications],
    }), 200


@transporter_bp.route("/transporter/jobs", methods=["GET"])
@jwt_required()
@role_required("transporter")
def get_open_jobs():
    jobs = TransportJob.query.filter_by(status="open").order_by(
        TransportJob.created_at.desc()
    ).all()

    return jsonify({"jobs": [job_to_dict(job) for job in jobs]}), 200


@transporter_bp.route("/transporter/jobs/<int:job_id>/accept", methods=["PATCH"])
@jwt_required()
@role_required("transporter")
def accept_job(job_id):
    current_user_id = int(get_jwt_identity())

    job = TransportJob.query.get(job_id)

    if not job:
        return jsonify({"message": "Transport job not found"}), 404

    if job.status != "open":
        return jsonify({"message": "This job is not available"}), 400

    job.transporter_id = current_user_id
    job.status = "accepted"

    request = WasteRequest.query.get(job.request_id)
    listing = WasteListing.query.get(job.listing_id)

    if request:
        request.status = "assigned"

    if listing:
        listing.status = "assigned"

    # Create conversation if not exists
    existing_conversation = Conversation.query.filter_by(transport_job_id=job.id).first()
    if not existing_conversation:
        conversation = Conversation(
            supplier_id=job.supplier_id,
            producer_id=job.producer_id,
            transporter_id=current_user_id,
            listing_id=job.listing_id,
            request_id=job.request_id,
            transport_job_id=job.id,
        )
        db.session.add(conversation)

    create_notification(
        job.supplier_id,
        "Transport Partner Assigned",
        f"A transporter accepted the job for {job.waste_type}.",
    )

    create_notification(
        job.producer_id,
        "Delivery Assigned",
        f"A transporter has accepted delivery for {job.waste_type}.",
    )

    db.session.commit()

    return jsonify({
        "message": "Job accepted successfully",
        "job": job_to_dict(job),
    }), 200


@transporter_bp.route("/transporter/accepted-jobs", methods=["GET"])
@jwt_required()
@role_required("transporter")
def get_accepted_jobs():
    current_user_id = int(get_jwt_identity())

    jobs = TransportJob.query.filter(
        TransportJob.transporter_id == current_user_id,
        TransportJob.status.in_(["accepted", "picked_up", "in_transit", "delivered"]),
    ).order_by(TransportJob.created_at.desc()).all()

    return jsonify({"jobs": [job_to_dict(job) for job in jobs]}), 200


@transporter_bp.route("/transporter/jobs/<int:job_id>/picked-up", methods=["PATCH"])
@jwt_required()
@role_required("transporter")
def mark_picked_up(job_id):
    current_user_id = int(get_jwt_identity())

    job = TransportJob.query.get(job_id)

    if not job:
        return jsonify({"message": "Transport job not found"}), 404

    if job.transporter_id != current_user_id:
        return jsonify({"message": "You are not assigned to this job"}), 403

    if job.status != "accepted":
        return jsonify({"message": "Job must be accepted first"}), 400

    job.status = "picked_up"

    listing = WasteListing.query.get(job.listing_id)
    request = WasteRequest.query.get(job.request_id)

    if listing:
        listing.status = "collected"

    if request:
        request.status = "in_transit"

    create_notification(
        job.supplier_id,
        "Waste Collected",
        f"{job.waste_type} has been picked up by the transporter.",
    )

    create_notification(
        job.producer_id,
        "Waste Picked Up",
        f"{job.waste_type} is now on the way to your facility.",
    )

    db.session.commit()

    return jsonify({
        "message": "Job marked as picked up",
        "job": job_to_dict(job),
    }), 200


@transporter_bp.route("/transporter/jobs/<int:job_id>/in-transit", methods=["PATCH"])
@jwt_required()
@role_required("transporter")
def mark_in_transit(job_id):
    current_user_id = int(get_jwt_identity())

    job = TransportJob.query.get(job_id)

    if not job:
        return jsonify({"message": "Transport job not found"}), 404

    if job.transporter_id != current_user_id:
        return jsonify({"message": "You are not assigned to this job"}), 403

    if job.status != "picked_up":
        return jsonify({"message": "Job must be picked up first"}), 400

    job.status = "in_transit"

    request = WasteRequest.query.get(job.request_id)
    if request:
        request.status = "in_transit"

    create_notification(
        job.producer_id,
        "Waste In Transit",
        f"{job.waste_type} is currently in transit.",
    )

    db.session.commit()

    return jsonify({
        "message": "Job marked as in transit",
        "job": job_to_dict(job),
    }), 200


@transporter_bp.route("/transporter/jobs/<int:job_id>/delivered", methods=["PATCH"])
@jwt_required()
@role_required("transporter")
def mark_delivered(job_id):
    current_user_id = int(get_jwt_identity())

    job = TransportJob.query.get(job_id)

    if not job:
        return jsonify({"message": "Transport job not found"}), 404

    if job.transporter_id != current_user_id:
        return jsonify({"message": "You are not assigned to this job"}), 403

    if job.status != "in_transit":
        return jsonify({"message": "Job must be in transit first"}), 400

    job.status = "delivered"

    listing = WasteListing.query.get(job.listing_id)
    request = WasteRequest.query.get(job.request_id)

    if listing:
        listing.status = "delivered"

    if request:
        request.status = "delivered"

    create_notification(
        job.supplier_id,
        "Delivery Completed",
        f"{job.waste_type} has been delivered successfully.",
    )

    create_notification(
        job.producer_id,
        "Waste Delivered",
        f"{job.waste_type} has arrived at your facility.",
    )

    db.session.commit()

    return jsonify({
        "message": "Job marked as delivered",
        "job": job_to_dict(job),
    }), 200


@transporter_bp.route("/transporter/earnings", methods=["GET"])
@jwt_required()
@role_required("transporter")
def transporter_earnings():
    current_user_id = int(get_jwt_identity())

    payments = Payment.query.filter_by(
        transporter_id=current_user_id
    ).order_by(Payment.created_at.desc()).all()

    completed_jobs_count = TransportJob.query.filter(
        TransportJob.transporter_id == current_user_id,
        TransportJob.status.in_(["delivered", "completed"]),
    ).count()

    total_earnings = sum((p.transporter_amount or p.transport_fee or p.amount or 0) for p in payments)

    released_earnings = sum(
        (p.transporter_amount or p.transport_fee or p.amount or 0)
        for p in payments
        if (p.status == "paid" or p.status == "released" or p.payment_status == "paid")
    )

    pending_earnings = sum(
        (p.transporter_amount or p.transport_fee or p.amount or 0)
        for p in payments
        if (p.status == "pending" or p.payment_status == "pending")
    )

    return jsonify({
        "total_earnings": total_earnings,
        "pending_earnings": pending_earnings,
        "released_earnings": released_earnings,
        "completed_jobs_count": completed_jobs_count,
        "payments": [payment_to_dict(payment) for payment in payments],
    }), 200