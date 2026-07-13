from flask import Blueprint, request, jsonify, current_app, redirect, session
from flask_bcrypt import Bcrypt
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from database import db
from models import User, EmailVerification, PhoneVerification
from services.email_service import send_verification_email
from datetime import datetime, timedelta
import random
import string
import secrets
import os
import json
import urllib.parse
from requests_oauthlib import OAuth2Session


auth_bp = Blueprint("auth", __name__)
bcrypt = Bcrypt()


def generate_code():
    """Generate a 6‑digit verification code."""
    length = current_app.config.get("VERIFICATION_CODE_LENGTH", 6)
    return "".join(random.choices(string.digits, k=length))


def create_token_response(user):
    """Create JWT token and user response."""
    token = create_access_token(
        identity=str(user.id),
        additional_claims={"role": user.role}
    )
    return {"token": token, "user": user.to_dict()}


# ─── REGISTER START ─────────────────────────────────────────────
@auth_bp.route("/register/start", methods=["POST"])
def register_start():
    """
    Step 1: Send verification code to email.
    """
    data = request.get_json() or {}

    email = data.get("email", "").strip().lower()
    phone = data.get("phone", "").strip()
    full_name = data.get("full_name", "User").strip()

    if not User.validate_email(email):
        return jsonify({"message": "Invalid email format"}), 400

    if not User.validate_phone(phone):
        return jsonify({"message": "Invalid phone format"}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({"message": "This email is already registered."}), 409

    if User.query.filter_by(phone=phone).first():
        return jsonify({"message": "This phone number is already registered."}), 409

    # Remove any old verification records
    EmailVerification.query.filter_by(email=email).delete()

    code = generate_code()
    expiry = current_app.config.get("VERIFICATION_CODE_EXPIRY_MINUTES", 10)
    expires_at = datetime.utcnow() + timedelta(minutes=expiry)

    email_verification = EmailVerification(
        email=email,
        code=code,
        expires_at=expires_at
    )

    db.session.add(email_verification)
    db.session.commit()

    # ─── Send verification email using KDIP-style template ────
    try:
        send_verification_email(email, full_name, code)
        current_app.logger.info(f"Verification email sent to {email}")
    except Exception as e:
        current_app.logger.error(f"Email sending failed: {e}")
        print(f"⚠️ Email failed. Code for {email}: {code}")

    return jsonify({
        "message": "Verification code sent to your email",
        "email": email
    }), 200


# ─── VERIFY EMAIL ──────────────────────────────────────────────
@auth_bp.route("/register/verify-email", methods=["POST"])
def verify_email():
    """
    Step 2: Verify the code entered by the user.
    """
    data = request.get_json() or {}

    email = data.get("email", "").strip().lower()
    code = data.get("code", "").strip()

    if not email or not code:
        return jsonify({"message": "Email and code are required"}), 400

    email_verification = EmailVerification.query.filter_by(
        email=email,
        code=code,
        used=False
    ).first()

    if not email_verification:
        return jsonify({"message": "Invalid verification code"}), 400

    if email_verification.expires_at < datetime.utcnow():
        return jsonify({"message": "Verification code has expired. Please request a new one."}), 400

    email_verification.used = True
    db.session.commit()

    return jsonify({"message": "Email verified successfully"}), 200


# ─── RESEND CODE ──────────────────────────────────────────────
@auth_bp.route("/register/resend-code", methods=["POST"])
def resend_code():
    """
    Resend verification code if the previous one expired.
    """
    data = request.get_json() or {}

    email = data.get("email", "").strip().lower()

    if not email:
        return jsonify({"message": "Email is required"}), 400

    # Check if user already exists (if they've already completed registration)
    if User.query.filter_by(email=email).first():
        return jsonify({"message": "This email is already registered. Please login."}), 409

    # Remove old verification records
    EmailVerification.query.filter_by(email=email).delete()

    code = generate_code()
    expiry = current_app.config.get("VERIFICATION_CODE_EXPIRY_MINUTES", 10)
    expires_at = datetime.utcnow() + timedelta(minutes=expiry)

    email_verification = EmailVerification(
        email=email,
        code=code,
        expires_at=expires_at
    )

    db.session.add(email_verification)
    db.session.commit()

    # Send new code
    try:
        send_verification_email(email, "User", code)
        current_app.logger.info(f"Resent verification email to {email}")
    except Exception as e:
        current_app.logger.error(f"Email resend failed: {e}")
        print(f"⚠️ Email failed. Code for {email}: {code}")

    return jsonify({
        "message": "New verification code sent to your email",
        "email": email
    }), 200


# ─── REGISTER COMPLETE ─────────────────────────────────────────
@auth_bp.route("/register/complete", methods=["POST"])
def register_complete():
    """
    Step 3: Complete registration after email verification.
    """
    data = request.get_json() or {}

    required = [
        "full_name",
        "email",
        "phone",
        "password",
        "role",
        "business_name",
        "business_type",
    ]

    for field in required:
        if not data.get(field):
            return jsonify({"message": f"{field} is required"}), 400

    email = data["email"].strip().lower()
    phone = data["phone"].strip()

    # Check if user already exists
    if User.query.filter_by(email=email).first():
        return jsonify({"message": "This email is already registered."}), 409

    if User.query.filter_by(phone=phone).first():
        return jsonify({"message": "This phone number is already registered."}), 409

    # Verify email was verified
    email_verified = EmailVerification.query.filter_by(
        email=email,
        used=True
    ).first()

    if not email_verified:
        return jsonify({"message": "Email must be verified first"}), 400

    # Role mapping
    role_mapping = {
        "waste-supplier": "supplier",
        "energy-producer": "producer",
        "transport-partner": "transporter",
        "supplier": "supplier",
        "producer": "producer",
        "transporter": "transporter",
        "admin": "admin",
    }

    role = role_mapping.get(data.get("role"), "supplier")

    # Create user
    user = User(
        full_name=data["full_name"].strip(),
        email=email,
        phone=phone,
        role=role,
        business_name=data["business_name"].strip(),
        business_type=data["business_type"].strip(),
        location=data.get("location", ""),
        email_verified=True,
        phone_verified=True,
        account_status="verified",
        verification_status="pending",
    )

    user.set_password(data["password"])

    # Role-specific fields
    user.waste_types = data.get("waste_types", "")
    user.energy_types = data.get("energy_types", "")
    user.capacity = data.get("capacity", "")
    user.vehicle_types = data.get("vehicle_types", "")
    user.fleet_size = data.get("fleet_size", "")
    user.coverage_area = data.get("coverage_area", "")
    user.license_number = data.get("license_number", "")

    db.session.add(user)
    db.session.commit()

    # Clean up verification records
    EmailVerification.query.filter_by(email=email).delete()
    PhoneVerification.query.filter_by(phone=phone).delete()
    db.session.commit()

    return jsonify({
        "message": "Account created successfully. Your profile is pending admin verification.",
        "user": user.to_dict(),
    }), 201


# ─── LOGIN ─────────────────────────────────────────────────────
@auth_bp.route("/login", methods=["POST"])
def login():
    """
    Login with email and password.
    """
    data = request.get_json() or {}

    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    if not email or not password:
        return jsonify({"message": "Email and password are required"}), 400

    user = User.query.filter_by(email=email).first()

    if not user or not user.check_password(password):
        return jsonify({"message": "Invalid email or password"}), 401

    if not user.email_verified:
        return jsonify({
            "message": "Email not verified. Please verify your email.",
            "requiresVerification": True,
            "email": user.email
        }), 403

    if user.account_status in ["suspended", "disabled", "rejected"]:
        return jsonify({"message": f"Account is {user.account_status}."}), 403

    user.last_login = datetime.utcnow()
    db.session.commit()

    response = create_token_response(user)

    return jsonify({
        "message": "Login successful",
        **response
    }), 200


# ─── GOOGLE LOGIN ──────────────────────────────────────────────
@auth_bp.route("/google-auth", methods=["GET"])
def google_login():
    """
    Redirect to Google OAuth.
    """
    os.environ["OAUTHLIB_INSECURE_TRANSPORT"] = "1"

    client_id = current_app.config.get("GOOGLE_CLIENT_ID")
    redirect_uri = current_app.config.get(
        "GOOGLE_REDIRECT_URI",
        "http://localhost:5000/api/google-auth/callback"
    )

    if not client_id:
        return jsonify({
            "message": "Google OAuth not configured",
            "missing": "GOOGLE_CLIENT_ID"
        }), 500

    oauth = OAuth2Session(
        client_id,
        redirect_uri=redirect_uri,
        scope=[
            "openid",
            "https://www.googleapis.com/auth/userinfo.email",
            "https://www.googleapis.com/auth/userinfo.profile",
        ],
    )

    auth_url, state = oauth.authorization_url(
        "https://accounts.google.com/o/oauth2/auth",
        access_type="offline",
        prompt="select_account",
    )

    session["oauth_state"] = state
    return redirect(auth_url)


@auth_bp.route("/google-auth/callback", methods=["GET"])
def google_callback():
    """
    Handle Google OAuth callback.
    """
    os.environ["OAUTHLIB_INSECURE_TRANSPORT"] = "1"

    client_id = current_app.config.get("GOOGLE_CLIENT_ID")
    client_secret = current_app.config.get("GOOGLE_CLIENT_SECRET")
    redirect_uri = current_app.config.get(
        "GOOGLE_REDIRECT_URI",
        "http://localhost:5000/api/google-auth/callback"
    )
    frontend_url = current_app.config.get("FRONTEND_URL", "http://localhost:5173")

    if not client_id or not client_secret:
        return jsonify({
            "message": "Google OAuth not configured",
            "missing": {
                "GOOGLE_CLIENT_ID": not bool(client_id),
                "GOOGLE_CLIENT_SECRET": not bool(client_secret),
            }
        }), 500

    oauth = OAuth2Session(
        client_id,
        redirect_uri=redirect_uri,
        state=session.get("oauth_state")
    )

    try:
        oauth.fetch_token(
            "https://oauth2.googleapis.com/token",
            client_secret=client_secret,
            authorization_response=request.url,
        )

        google_user = oauth.get(
            "https://www.googleapis.com/oauth2/v2/userinfo"
        ).json()

    except Exception as e:
        current_app.logger.error(f"Google OAuth error: {e}")
        error = urllib.parse.quote("Google authentication failed")
        return redirect(f"{frontend_url}/login?google_error={error}")

    email = google_user.get("email", "").strip().lower()
    full_name = google_user.get("name", "Google User")
    profile_photo = google_user.get("picture", "")
    google_id = google_user.get("id", "")

    if not email:
        error = urllib.parse.quote("Google did not return an email")
        return redirect(f"{frontend_url}/login?google_error={error}")

    user = User.query.filter_by(email=email).first()

    if not user:
        user = User(
            full_name=full_name,
            email=email,
            phone=f"google-{google_id}",
            role="supplier",
            business_name="",
            business_type="",
            location="",
            email_verified=True,
            phone_verified=True,
            account_status="pending",
            verification_status="pending",
        )
        user.set_password(secrets.token_urlsafe(32))
        db.session.add(user)

    user.email_verified = True
    user.phone_verified = True

    if hasattr(user, "google_id"):
        user.google_id = google_id

    if hasattr(user, "auth_provider"):
        user.auth_provider = "google"

    if hasattr(user, "profile_photo"):
        user.profile_photo = profile_photo

    user.last_login = datetime.utcnow()
    db.session.commit()

    response = create_token_response(user)

    token = urllib.parse.quote(response["token"])
    user_data = urllib.parse.quote(json.dumps(response["user"]))

    return redirect(
        f"{frontend_url}/auth/google-callback?token={token}&user={user_data}"
    )


# ─── PROFILE ────────────────────────────────────────────────────
@auth_bp.route("/profile", methods=["GET"])
@jwt_required()
def get_profile():
    """
    Get current user profile.
    """
    try:
        user_id = get_jwt_identity()
        user = User.query.get(int(user_id))

        if not user:
            return jsonify({"error": "User not found"}), 404

        return jsonify({"user": user.to_dict()}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ─── SEED ADMIN ─────────────────────────────────────────────────
def seed_admin():
    """
    Create the default admin user if it doesn't exist.
    """
    admin_email = "samatar@gmail.com"
    admin = User.query.filter_by(email=admin_email).first()

    if not admin:
        # Try to use the default phone, but if it's taken, find an available one
        base_phone = "+254700000000"
        phone_to_use = base_phone
        counter = 0
        max_attempts = 100

        while User.query.filter_by(phone=phone_to_use).first() and counter < max_attempts:
            counter += 1
            phone_to_use = f"+25470000000{counter}"

        if counter >= max_attempts:
            print("❌ Could not find an available phone number for admin after 100 attempts.")
            return

        admin = User(
            full_name="Admin",
            email=admin_email,
            phone=phone_to_use,
            role="admin",
            business_name="ReVive Energy",
            business_type="Platform",
            email_verified=True,
            phone_verified=True,
            account_status="verified",
            verification_status="verified",
        )

        admin.set_password("2839")
        db.session.add(admin)
        db.session.commit()
        print(f"✅ Admin user created: {admin_email} with phone {phone_to_use}")
    else:
        print(f"ℹ️ Admin user already exists: {admin_email}")