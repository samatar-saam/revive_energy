from datetime import datetime
from math import radians, sin, cos, sqrt, atan2

from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity

from database import db
from models import (
    User,
    TransportJob,
    TransportLocation,
    WasteListing,
    WasteRequest,
)

tracking_bp = Blueprint(
    "tracking",
    __name__,
    url_prefix="/api/tracking",
)


ALLOWED_TRACKING_STATUSES = [
    "accepted",
    "heading_to_pickup",
    "arrived_at_pickup",
    "picked_up",
    "in_transit",
    "arrived_at_destination",
    "awaiting_confirmation",
]


def current_user_id():
    return int(get_jwt_identity())


def now():
    return datetime.utcnow()


def iso(value):
    return value.isoformat() if value else None


def get_user(user_id):
    if not user_id:
        return None
    return db.session.get(User, int(user_id))


def haversine_distance(lat1, lon1, lat2, lon2):
    """
    Return distance between two coordinates in kilometres.
    """
    try:
        earth_radius = 6371.0

        lat1 = radians(float(lat1))
        lon1 = radians(float(lon1))
        lat2 = radians(float(lat2))
        lon2 = radians(float(lon2))

        delta_lat = lat2 - lat1
        delta_lon = lon2 - lon1

        a = (
            sin(delta_lat / 2) ** 2
            + cos(lat1)
            * cos(lat2)
            * sin(delta_lon / 2) ** 2
        )

        c = 2 * atan2(sqrt(a), sqrt(1 - a))

        return earth_radius * c

    except Exception:
        return 0


def calculate_eta_minutes(distance_km, speed_kmh):
    try:
        speed = float(speed_kmh or 0)

        if speed < 5:
            speed = 30

        minutes = (float(distance_km) / speed) * 60

        return max(1, round(minutes))

    except Exception:
        return None


def user_can_view_job(user, job):
    if not user or not job:
        return False

    if user.role == "admin":
        return True

    allowed_ids = [
        job.transporter_id,
        job.supplier_id,
        job.producer_id,
    ]

    return user.id in allowed_ids


def user_can_send_location(user, job):
    if not user or not job:
        return False

    return (
        user.role in ["transporter", "transport-partner"]
        and job.transporter_id == user.id
    )


def location_to_dict(location):
    if not location:
        return None

    return {
        "latitude": location.latitude,
        "longitude": location.longitude,
        "speed": location.speed or 0,
        "heading": location.heading or 0,
        "accuracy": location.accuracy or 0,
        "updated_at": iso(location.created_at),
    }


def job_to_tracking_dict(job):
    transporter = get_user(job.transporter_id)
    supplier = get_user(job.supplier_id)
    producer = get_user(job.producer_id)

    latest_location = (
        TransportLocation.query.filter_by(
            transport_job_id=job.id
        )
        .order_by(TransportLocation.created_at.desc())
        .first()
    )

    destination_latitude = None
    destination_longitude = None

    if job.status in [
        "accepted",
        "heading_to_pickup",
        "arrived_at_pickup",
    ]:
        destination_latitude = getattr(
            job,
            "pickup_latitude",
            None,
        )
        destination_longitude = getattr(
            job,
            "pickup_longitude",
            None,
        )
    else:
        destination_latitude = getattr(
            job,
            "delivery_latitude",
            None,
        )
        destination_longitude = getattr(
            job,
            "delivery_longitude",
            None,
        )

    distance_remaining = None
    eta_minutes = None

    if (
        latest_location
        and destination_latitude is not None
        and destination_longitude is not None
    ):
        distance_remaining = haversine_distance(
            latest_location.latitude,
            latest_location.longitude,
            destination_latitude,
            destination_longitude,
        )

        eta_minutes = calculate_eta_minutes(
            distance_remaining,
            latest_location.speed,
        )

    return {
        "job_id": job.id,
        "request_id": getattr(job, "request_id", None),
        "listing_id": getattr(job, "listing_id", None),
        "status": job.status,
        "waste_type": job.waste_type,
        "quantity": job.quantity,
        "unit": getattr(job, "unit", "kg"),
        "pickup_location": {
            "name": getattr(
                job,
                "pickup_location",
                "Pickup location",
            ),
            "latitude": getattr(
                job,
                "pickup_latitude",
                None,
            ),
            "longitude": getattr(
                job,
                "pickup_longitude",
                None,
            ),
        },
        "delivery_location": {
            "name": getattr(
                job,
                "delivery_location",
                "Delivery location",
            ),
            "latitude": getattr(
                job,
                "delivery_latitude",
                None,
            ),
            "longitude": getattr(
                job,
                "delivery_longitude",
                None,
            ),
        },
        "current_location": location_to_dict(
            latest_location
        ),
        "distance_remaining_km": (
            round(distance_remaining, 2)
            if distance_remaining is not None
            else None
        ),
        "eta_minutes": eta_minutes,
        "transporter": {
            "id": transporter.id if transporter else None,
            "name": (
                transporter.full_name
                if transporter
                else "Not assigned"
            ),
            "phone": (
                transporter.phone
                if transporter
                else None
            ),
            "profile_photo": (
                getattr(
                    transporter,
                    "profile_photo",
                    None,
                )
                if transporter
                else None
            ),
            "vehicle_type": (
                getattr(
                    transporter,
                    "vehicle_types",
                    None,
                )
                if transporter
                else None
            ),
            "vehicle_number": (
                getattr(
                    transporter,
                    "license_number",
                    None,
                )
                if transporter
                else None
            ),
        },
        "supplier": {
            "id": supplier.id if supplier else None,
            "name": (
                supplier.full_name
                if supplier
                else "Unknown supplier"
            ),
            "phone": supplier.phone if supplier else None,
        },
        "producer": {
            "id": producer.id if producer else None,
            "name": (
                producer.full_name
                if producer
                else "Unknown producer"
            ),
            "phone": producer.phone if producer else None,
        },
        "timeline": {
            "tracking_started_at": iso(
                getattr(
                    job,
                    "tracking_started_at",
                    None,
                )
            ),
            "arrived_pickup_at": iso(
                getattr(
                    job,
                    "arrived_pickup_at",
                    None,
                )
            ),
            "picked_up_at": iso(
                getattr(
                    job,
                    "picked_up_at",
                    None,
                )
            ),
            "arrived_destination_at": iso(
                getattr(
                    job,
                    "arrived_destination_at",
                    None,
                )
            ),
            "delivered_at": iso(
                getattr(
                    job,
                    "delivered_at",
                    None,
                )
            ),
            "tracking_ended_at": iso(
                getattr(
                    job,
                    "tracking_ended_at",
                    None,
                )
            ),
        },
        "created_at": iso(job.created_at),
    }


# ─── GET ALL ACTIVE JOBS FOR THE CURRENT USER ───────────────────
@tracking_bp.route("/jobs", methods=["GET"])
@jwt_required()
def get_active_jobs():
    """
    Return all active tracking jobs for the current user.
    For transporters: shows their assigned jobs.
    For producers/suppliers: shows jobs they are involved in.
    """
    try:
        user_id = current_user_id()
        user = db.session.get(User, user_id)

        if not user:
            return jsonify({"message": "User not found"}), 404

        # Query jobs based on user role
        if user.role in ["transporter", "transport-partner"]:
            jobs = TransportJob.query.filter(
                TransportJob.transporter_id == user_id,
                TransportJob.status.in_(ALLOWED_TRACKING_STATUSES + ["delivered", "completed"])
            ).order_by(TransportJob.created_at.desc()).all()
        elif user.role in ["producer", "energy-producer"]:
            jobs = TransportJob.query.filter(
                TransportJob.producer_id == user_id,
                TransportJob.status.in_(ALLOWED_TRACKING_STATUSES + ["delivered", "completed"])
            ).order_by(TransportJob.created_at.desc()).all()
        elif user.role in ["supplier", "waste-supplier"]:
            jobs = TransportJob.query.filter(
                TransportJob.supplier_id == user_id,
                TransportJob.status.in_(ALLOWED_TRACKING_STATUSES + ["delivered", "completed"])
            ).order_by(TransportJob.created_at.desc()).all()
        else:
            jobs = []

        return jsonify({
            "jobs": [job_to_tracking_dict(job) for job in jobs]
        }), 200

    except Exception as error:
        current_app.logger.error(f"get_active_jobs error: {error}", exc_info=True)
        return jsonify({"message": "Unable to load active jobs"}), 500


@tracking_bp.route(
    "/jobs/<int:job_id>",
    methods=["GET"],
)
@jwt_required()
def get_tracking(job_id):
    try:
        user = db.session.get(
            User,
            current_user_id(),
        )

        job = db.session.get(
            TransportJob,
            job_id,
        )

        if not job:
            return jsonify({
                "message": "Transport job not found"
            }), 404

        if not user_can_view_job(user, job):
            return jsonify({
                "message": "You are not allowed to track this delivery"
            }), 403

        return jsonify(
            job_to_tracking_dict(job)
        ), 200

    except Exception as error:
        current_app.logger.error(
            f"get_tracking error: {error}",
            exc_info=True,
        )

        return jsonify({
            "message": "Unable to load tracking information"
        }), 500


# ─── GET CURRENT LOCATION FOR A JOB ──────────────────────────
@tracking_bp.route(
    "/jobs/<int:job_id>/location",
    methods=["GET"],
)
@jwt_required()
def get_job_location(job_id):
    """
    Get the current location of a transport job.
    """
    try:
        user = db.session.get(User, current_user_id())
        job = db.session.get(TransportJob, job_id)

        if not job:
            return jsonify({"message": "Job not found"}), 404

        if not user_can_view_job(user, job):
            return jsonify({"message": "Unauthorized"}), 403

        latest_location = (
            TransportLocation.query.filter_by(transport_job_id=job.id)
            .order_by(TransportLocation.created_at.desc())
            .first()
        )

        if not latest_location:
            return jsonify({
                "message": "No location data available",
                "has_location": False
            }), 200

        return jsonify({
            "job_id": job.id,
            "status": job.status,
            "location": location_to_dict(latest_location),
            "has_location": True
        }), 200

    except Exception as error:
        current_app.logger.error(f"get_job_location error: {error}", exc_info=True)
        return jsonify({"message": "Unable to get location"}), 500


@tracking_bp.route(
    "/jobs/<int:job_id>/location",
    methods=["POST"],
)
@jwt_required()
def update_location(job_id):
    try:
        user = db.session.get(
            User,
            current_user_id(),
        )

        job = db.session.get(
            TransportJob,
            job_id,
        )

        if not job:
            return jsonify({
                "message": "Transport job not found"
            }), 404

        if not user_can_send_location(user, job):
            return jsonify({
                "message": "Only the assigned transporter can update location"
            }), 403

        if job.status not in ALLOWED_TRACKING_STATUSES:
            return jsonify({
                "message": (
                    f"Location cannot be shared while "
                    f"job status is {job.status}"
                )
            }), 400

        data = request.get_json() or {}

        latitude = data.get("latitude")
        longitude = data.get("longitude")

        if latitude is None or longitude is None:
            return jsonify({
                "message": "Latitude and longitude are required"
            }), 400

        try:
            latitude = float(latitude)
            longitude = float(longitude)
            speed = float(data.get("speed") or 0)
            heading = float(data.get("heading") or 0)
            accuracy = float(data.get("accuracy") or 0)

        except (TypeError, ValueError):
            return jsonify({
                "message": "Invalid location data"
            }), 400

        if not -90 <= latitude <= 90:
            return jsonify({
                "message": "Invalid latitude"
            }), 400

        if not -180 <= longitude <= 180:
            return jsonify({
                "message": "Invalid longitude"
            }), 400

        location = TransportLocation(
            transport_job_id=job.id,
            transporter_id=user.id,
            latitude=latitude,
            longitude=longitude,
            speed=speed,
            heading=heading,
            accuracy=accuracy,
        )

        db.session.add(location)

        if not getattr(
            job,
            "tracking_started_at",
            None,
        ):
            job.tracking_started_at = now()

        db.session.commit()

        return jsonify({
            "message": "Location updated successfully",
            "location": location.to_dict(),
        }), 201

    except Exception as error:
        db.session.rollback()

        current_app.logger.error(
            f"update_location error: {error}",
            exc_info=True,
        )

        return jsonify({
            "message": "Unable to update location"
        }), 500


@tracking_bp.route(
    "/jobs/<int:job_id>/history",
    methods=["GET"],
)
@jwt_required()
def get_location_history(job_id):
    try:
        user = db.session.get(
            User,
            current_user_id(),
        )

        job = db.session.get(
            TransportJob,
            job_id,
        )

        if not job:
            return jsonify({
                "message": "Transport job not found"
            }), 404

        if not user_can_view_job(user, job):
            return jsonify({
                "message": "Unauthorized"
            }), 403

        locations = (
            TransportLocation.query.filter_by(
                transport_job_id=job.id
            )
            .order_by(
                TransportLocation.created_at.asc()
            )
            .limit(500)
            .all()
        )

        return jsonify([
            location.to_dict()
            for location in locations
        ]), 200

    except Exception as error:
        current_app.logger.error(
            f"get_location_history error: {error}",
            exc_info=True,
        )

        return jsonify({
            "message": "Unable to load route history"
        }), 500


@tracking_bp.route(
    "/jobs/<int:job_id>/status",
    methods=["PATCH"],
)
@jwt_required()
def update_job_status(job_id):
    try:
        user = db.session.get(
            User,
            current_user_id(),
        )

        job = db.session.get(
            TransportJob,
            job_id,
        )

        if not job:
            return jsonify({
                "message": "Transport job not found"
            }), 404

        if not user_can_send_location(user, job):
            return jsonify({
                "message": "Only the assigned transporter can update this job"
            }), 403

        data = request.get_json() or {}
        new_status = data.get("status")

        transitions = {
            "accepted": ["heading_to_pickup"],
            "heading_to_pickup": [
                "arrived_at_pickup"
            ],
            "arrived_at_pickup": ["picked_up"],
            "picked_up": ["in_transit"],
            "in_transit": [
                "arrived_at_destination"
            ],
            "arrived_at_destination": [
                "awaiting_confirmation"
            ],
        }

        allowed_next = transitions.get(
            job.status,
            [],
        )

        if new_status not in allowed_next:
            return jsonify({
                "message": (
                    f"Cannot change status from "
                    f"{job.status} to {new_status}"
                )
            }), 400

        job.status = new_status

        if new_status == "heading_to_pickup":
            job.tracking_started_at = (
                job.tracking_started_at
                or now()
            )

        elif new_status == "arrived_at_pickup":
            job.arrived_pickup_at = now()

        elif new_status == "picked_up":
            job.picked_up_at = now()

        elif new_status == "arrived_at_destination":
            job.arrived_destination_at = now()

        db.session.commit()

        return jsonify({
            "message": "Job status updated",
            "job": job_to_tracking_dict(job),
        }), 200

    except Exception as error:
        db.session.rollback()

        current_app.logger.error(
            f"update_job_status error: {error}",
            exc_info=True,
        )

        return jsonify({
            "message": "Unable to update job status"
        }), 500