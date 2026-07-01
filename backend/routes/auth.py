from flask import Blueprint, request, jsonify, current_app, redirect, session
from flask_bcrypt import Bcrypt
from flask_jwt_extended import create_access_token
from database import db
from models import User, EmailVerification, PhoneVerification
from services.email_service import send_email
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
    length = current_app.config.get("VERIFICATION_CODE_LENGTH", 6)
    return "".join(random.choices(string.digits, k=length))


def create_token_response(user):
    token = create_access_token(
        identity=str(user.id),
        additional_claims={"role": user.role}
    )
    return {"token": token, "user": user.to_dict()}


def verification_email_template(code, expiry):
    return f"""
    <!DOCTYPE html>
    <html>
    <body style="margin:0;padding:0;background:#f8fafc;font-family:Arial,sans-serif;">
        <div style="max-width:600px;margin:40px auto;background:white;border-radius:16px;overflow:hidden;border:1px solid #e2e8f0;">
            <div style="background:#11402D;padding:30px;text-align:center;">
                <h1 style="color:white;margin:0;">ReVive Energy</h1>
                <p style="color:#d1fae5;margin-top:8px;">Waste-to-Energy Marketplace</p>
            </div>

            <div style="padding:40px;">
                <h2 style="color:#0f172a;margin-top:0;">Verify Your Account</h2>

                <p style="color:#475569;font-size:16px;line-height:1.7;">
                    Welcome to ReVive Energy. Use the verification code below to complete your registration.
                </p>

                <div style="
                    background:#11402D;
                    color:white;
                    text-align:center;
                    padding:20px;
                    border-radius:12px;
                    font-size:36px;
                    font-weight:bold;
                    letter-spacing:8px;
                    margin:30px 0;
                ">
                    {code}
                </div>

                <p style="color:#475569;font-size:15px;">
                    This verification code will expire in <strong>{expiry} minutes</strong>.
                </p>

                <p style="color:#475569;font-size:15px;">
                    If you did not request this account, you can safely ignore this email.
                </p>

                <hr style="border:none;border-top:1px solid #e2e8f0;margin:30px 0;">

                <p style="font-size:13px;color:#94a3b8;">
                    © ReVive Energy Platform
                </p>
            </div>
        </div>
    </body>
    </html>
    """


@auth_bp.route("/register/start", methods=["POST"])
def register_start():
    data = request.get_json() or {}

    email = data.get("email", "").strip().lower()
    phone = data.get("phone", "").strip()

    if not User.validate_email(email):
        return jsonify({"message": "Invalid email format"}), 400

    if not User.validate_phone(phone):
        return jsonify({"message": "Invalid phone format"}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({"message": "This email is already registered."}), 409

    if User.query.filter_by(phone=phone).first():
        return jsonify({"message": "This phone number is already registered."}), 409

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

    subject = f"Your ReVive Energy verification code is {code}"
    body = verification_email_template(code, expiry)

    try:
        send_email(email, subject, body)
        current_app.logger.info(f"Email sent to {email}")
    except Exception as e:
        current_app.logger.error(f"Email sending failed: {e}")
        return jsonify({"message": "Failed to send verification email"}), 500

    return jsonify({"message": "Verification code sent to email"}), 200


@auth_bp.route("/register/verify-email", methods=["POST"])
def verify_email():
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
        return jsonify({"message": "Verification code expired"}), 400

    email_verification.used = True
    db.session.commit()

    return jsonify({"message": "Email verified successfully"}), 200


@auth_bp.route("/register/complete", methods=["POST"])
def register_complete():
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

    if User.query.filter_by(email=email).first():
        return jsonify({"message": "This email is already registered."}), 409

    if User.query.filter_by(phone=phone).first():
        return jsonify({"message": "This phone number is already registered."}), 409

    email_verified = EmailVerification.query.filter_by(
        email=email,
        used=True
    ).first()

    if not email_verified:
        return jsonify({"message": "Email must be verified first"}), 400

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

    user.waste_types = data.get("waste_types", "")
    user.energy_types = data.get("energy_types", "")
    user.capacity = data.get("capacity", "")
    user.vehicle_types = data.get("vehicle_types", "")
    user.fleet_size = data.get("fleet_size", "")
    user.coverage_area = data.get("coverage_area", "")
    user.license_number = data.get("license_number", "")

    db.session.add(user)
    db.session.commit()

    EmailVerification.query.filter_by(email=email).delete()
    PhoneVerification.query.filter_by(phone=phone).delete()
    db.session.commit()

    return jsonify({
        "message": "Account created successfully. Your profile is pending admin verification.",
        "user": user.to_dict(),
    }), 201


@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json() or {}

    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    if not email or not password:
        return jsonify({"message": "Email and password are required"}), 400

    user = User.query.filter_by(email=email).first()

    if not user or not user.check_password(password):
        return jsonify({"message": "Invalid email or password"}), 401

    if not user.email_verified:
        return jsonify({"message": "Email not verified. Please verify your email."}), 403

    if user.account_status in ["suspended", "disabled", "rejected"]:
        return jsonify({"message": f"Account is {user.account_status}."}), 403

    user.last_login = datetime.utcnow()
    db.session.commit()

    response = create_token_response(user)

    return jsonify({
        "message": "Login successful",
        **response
    }), 200


@auth_bp.route("/google-auth", methods=["GET"])
def google_login():
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


def seed_admin():
    """
    Create the default admin user if it doesn't exist.
    If the default phone is already taken, it will find the next available one.
    """
    admin_email = "samatar@gmail.com"
    admin = User.query.filter_by(email=admin_email).first()

    if not admin:
        # Try to use the default phone, but if it's taken, find an available one
        base_phone = "+254700000000"
        phone_to_use = base_phone
        counter = 0
        max_attempts = 100

        # Find an unused phone number
        while User.query.filter_by(phone=phone_to_use).first() and counter < max_attempts:
            counter += 1
            # Generate a new phone by incrementing the last digit(s)
            # e.g., +254700000001, +254700000002, ...
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