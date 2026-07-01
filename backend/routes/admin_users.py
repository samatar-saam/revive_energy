from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash
from database import db
from models import User
from sqlalchemy import or_

admin_users_bp = Blueprint("admin_users", __name__, url_prefix="/api/admin")


def is_admin():
    user_id = int(get_jwt_identity())
    user = db.session.get(User, user_id)
    return user and user.role == "admin"


# ---------- Helper: paginate query ----------
def paginate_query(query, page, per_page):
    """Return paginated results and total count."""
    total = query.count()
    items = query.offset((page - 1) * per_page).limit(per_page).all()
    return items, total


# ---------- GET all users (with optional filters + pagination) ----------
@admin_users_bp.route("/users", methods=["GET"])
@jwt_required()
def get_users():
    if not is_admin():
        return jsonify({"message": "Admin only"}), 403

    # Query parameters
    role = request.args.get("role")          # single role or comma-separated
    status = request.args.get("status")
    search = request.args.get("search")
    page = request.args.get("page", 1, type=int)
    per_page = request.args.get("per_page", 50, type=int)  # default 50

    query = User.query

    # Role filter (support multiple roles: ?role=transporter,admin)
    if role:
        roles = [r.strip() for r in role.split(",")]
        query = query.filter(User.role.in_(roles))

    if status:
        query = query.filter(User.account_status == status)

    if search:
        term = f"%{search}%"
        query = query.filter(
            or_(
                User.full_name.ilike(term),
                User.email.ilike(term),
                User.phone.ilike(term),
                User.business_name.ilike(term),
                User.location.ilike(term),
            )
        )

    # Order by newest first
    query = query.order_by(User.created_at.desc())

    # Paginate
    users, total = paginate_query(query, page, per_page)

    return jsonify({
        "data": [user.to_dict() for user in users],
        "pagination": {
            "page": page,
            "per_page": per_page,
            "total": total,
            "pages": (total + per_page - 1) // per_page
        }
    }), 200


# ---------- GET transporters only (convenience endpoint) ----------
@admin_users_bp.route("/transporters", methods=["GET"])
@jwt_required()
def get_transporters():
    """Return all users with role 'transporter' or 'transport-partner'."""
    if not is_admin():
        return jsonify({"message": "Admin only"}), 403

    page = request.args.get("page", 1, type=int)
    per_page = request.args.get("per_page", 50, type=int)
    status = request.args.get("status")
    search = request.args.get("search")

    query = User.query.filter(
        User.role.in_(["transporter", "transport-partner"])
    )

    if status:
        query = query.filter(User.account_status == status)

    if search:
        term = f"%{search}%"
        query = query.filter(
            or_(
                User.full_name.ilike(term),
                User.email.ilike(term),
                User.phone.ilike(term),
                User.business_name.ilike(term),
                User.location.ilike(term),
            )
        )

    query = query.order_by(User.created_at.desc())
    users, total = paginate_query(query, page, per_page)

    return jsonify({
        "data": [user.to_dict() for user in users],
        "pagination": {
            "page": page,
            "per_page": per_page,
            "total": total,
            "pages": (total + per_page - 1) // per_page
        }
    }), 200


# ---------- GET single user ----------
@admin_users_bp.route("/users/<int:user_id>", methods=["GET"])
@jwt_required()
def get_user(user_id):
    if not is_admin():
        return jsonify({"message": "Admin only"}), 403

    user = db.session.get(User, user_id)
    if not user:
        return jsonify({"message": "User not found"}), 404

    return jsonify(user.to_dict()), 200


# ---------- POST create user ----------
@admin_users_bp.route("/users", methods=["POST"])
@jwt_required()
def create_user():
    if not is_admin():
        return jsonify({"message": "Admin only"}), 403

    data = request.get_json()
    if not data:
        return jsonify({"message": "Missing JSON payload"}), 400

    print("📥 CREATE payload:", data)   # debug

    required = ["full_name", "email", "password", "phone"]
    for field in required:
        if not data.get(field):
            return jsonify({"message": f"Missing field: {field}"}), 400

    # Check for duplicate email
    if User.query.filter_by(email=data["email"]).first():
        return jsonify({"message": "Email already registered"}), 409

    new_user = User(
        full_name=data["full_name"],
        email=data["email"],
        phone=data["phone"],
        business_name=data.get("business_name", ""),
        location=data.get("location", ""),
        role=data.get("role", "supplier"),
        account_status=data.get("account_status", "active"),
        password_hash=generate_password_hash(data["password"])
    )

    try:
        db.session.add(new_user)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": f"Database error: {str(e)}"}), 500

    return jsonify({"message": "User created successfully", "id": new_user.id}), 201


# ---------- PUT update user (full details) ----------
@admin_users_bp.route("/users/<int:user_id>", methods=["PUT"])
@jwt_required()
def update_user(user_id):
    if not is_admin():
        return jsonify({"message": "Admin only"}), 403

    user = db.session.get(User, user_id)
    if not user:
        return jsonify({"message": "User not found"}), 404

    data = request.get_json()
    if not data:
        return jsonify({"message": "Missing JSON payload"}), 400

    print("📥 UPDATE payload:", data)   # debug

    allowed_fields = ["full_name", "business_name", "phone", "location", "role", "account_status"]
    for field in allowed_fields:
        if field in data:
            setattr(user, field, data[field])

    # Optional password update
    if "password" in data and data["password"]:
        user.password_hash = generate_password_hash(data["password"])

    try:
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": f"Database error: {str(e)}"}), 500

    return jsonify({"message": "User updated successfully"}), 200


# ---------- PATCH update account status ----------
@admin_users_bp.route("/users/<int:user_id>/status", methods=["PATCH"])
@jwt_required()
def update_user_status(user_id):
    if not is_admin():
        return jsonify({"message": "Admin only"}), 403

    data = request.get_json() or {}
    status = data.get("account_status")
    allowed = ["pending", "verified", "rejected", "suspended", "disabled", "active", "inactive"]

    if status not in allowed:
        return jsonify({"message": "Invalid account status"}), 400

    user = db.session.get(User, user_id)
    if not user:
        return jsonify({"message": "User not found"}), 404

    user.account_status = status
    db.session.commit()

    return jsonify({"message": "User status updated", "user": user.to_dict()}), 200


# ---------- PATCH update verification status ----------
@admin_users_bp.route("/users/<int:user_id>/verification", methods=["PATCH"])
@jwt_required()
def update_user_verification(user_id):
    if not is_admin():
        return jsonify({"message": "Admin only"}), 403

    data = request.get_json() or {}
    verification_status = data.get("verification_status")
    allowed = ["pending", "approved", "rejected"]

    if verification_status not in allowed:
        return jsonify({"message": "Invalid verification status"}), 400

    user = db.session.get(User, user_id)
    if not user:
        return jsonify({"message": "User not found"}), 404

    user.verification_status = verification_status
    if verification_status == "approved":
        user.account_status = "verified"

    db.session.commit()

    return jsonify({"message": "Verification updated", "user": user.to_dict()}), 200


# ---------- DELETE user ----------
@admin_users_bp.route("/users/<int:user_id>", methods=["DELETE"])
@jwt_required()
def delete_user(user_id):
    if not is_admin():
        return jsonify({"message": "Admin only"}), 403

    current_admin_id = int(get_jwt_identity())
    if user_id == current_admin_id:
        return jsonify({"message": "You cannot delete your own account"}), 400

    user = db.session.get(User, user_id)
    if not user:
        return jsonify({"message": "User not found"}), 404

    db.session.delete(user)
    db.session.commit()

    return jsonify({"message": "User deleted successfully"}), 200