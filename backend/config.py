import os
from datetime import timedelta


class Config:
    # ========== FLASK ==========
    SECRET_KEY = os.environ.get("SECRET_KEY") or "dev-secret-key-change-in-production"

    # ========== DATABASE ==========
    SQLALCHEMY_DATABASE_URI = os.environ.get("DATABASE_URL") or "sqlite:///revive_energy.db"
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # ========== JWT ==========
    JWT_SECRET_KEY = os.environ.get("JWT_SECRET_KEY") or "jwt-secret-key-change-in-production"
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(days=1)
    JWT_IDENTITY_CLAIM = "sub"

    # ========== CORS ==========
    default_origins = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
        "http://localhost:5175",
        "http://127.0.0.1:5175",
    ]

    cors_env = os.environ.get("CORS_ORIGINS")
    if cors_env:
        CORS_ORIGINS = [origin.strip() for origin in cors_env.split(",")]
    else:
        CORS_ORIGINS = default_origins

    # ========== EMAIL ==========
    MAIL_SERVER = os.environ.get("MAIL_SERVER", "smtp.gmail.com")
    MAIL_PORT = int(os.environ.get("MAIL_PORT", 587))
    MAIL_USE_TLS = os.environ.get("MAIL_USE_TLS", "true").lower() == "true"
    MAIL_USE_SSL = os.environ.get("MAIL_USE_SSL", "false").lower() == "true"
    MAIL_USERNAME = os.environ.get("MAIL_USERNAME")
    MAIL_PASSWORD = os.environ.get("MAIL_PASSWORD")
    MAIL_DEFAULT_SENDER = os.environ.get("MAIL_DEFAULT_SENDER") or MAIL_USERNAME
    MAIL_ASCII_ATTACHMENTS = False

    # ========== GOOGLE OAUTH ==========
    GOOGLE_CLIENT_ID = os.environ.get("GOOGLE_CLIENT_ID")
    GOOGLE_CLIENT_SECRET = os.environ.get("GOOGLE_CLIENT_SECRET")

    GOOGLE_REDIRECT_URI = os.environ.get(
        "GOOGLE_REDIRECT_URI",
        "http://localhost:5000/api/google-auth/callback"
    )

    FRONTEND_URL = os.environ.get(
        "FRONTEND_URL",
        "http://localhost:5173"
    )

    # ========== SMS PROVIDER ==========
    SMS_PROVIDER = os.environ.get("SMS_PROVIDER", "log")

    AFRICASTALKING_USERNAME = os.environ.get("AFRICASTALKING_USERNAME")
    AFRICASTALKING_API_KEY = os.environ.get("AFRICASTALKING_API_KEY")

    TWILIO_ACCOUNT_SID = os.environ.get("TWILIO_ACCOUNT_SID")
    TWILIO_AUTH_TOKEN = os.environ.get("TWILIO_AUTH_TOKEN")
    TWILIO_PHONE_NUMBER = os.environ.get("TWILIO_PHONE_NUMBER")

    # ========== VERIFICATION SETTINGS ==========
    VERIFICATION_CODE_EXPIRY_MINUTES = int(
        os.environ.get("VERIFICATION_CODE_EXPIRY_MINUTES", 10)
    )
    VERIFICATION_CODE_LENGTH = 6

    # ========== ACCOUNT DEFAULTS ==========
    ACCOUNT_STATUS_DEFAULT = "pending"
    VERIFICATION_STATUS_DEFAULT = "pending"

    # ========== BASE URL ==========
    BASE_URL = os.environ.get("BASE_URL", "http://localhost:5000")

    # ========== SAFARICOM DARAJA M-PESA ==========
    MPESA_CONSUMER_KEY = os.environ.get("MPESA_CONSUMER_KEY")
    MPESA_CONSUMER_SECRET = os.environ.get("MPESA_CONSUMER_SECRET")

    MPESA_PASSKEY = os.environ.get("MPESA_PASSKEY")
    MPESA_SHORTCODE = os.environ.get("MPESA_SHORTCODE")
    MPESA_INITIATOR_NAME = os.environ.get("MPESA_INITIATOR_NAME")
    MPESA_INITIATOR_PASSWORD = os.environ.get("MPESA_INITIATOR_PASSWORD")

    MPESA_ENVIRONMENT = os.environ.get("MPESA_ENVIRONMENT", "sandbox")

    MPESA_CALLBACK_URL = os.environ.get("MPESA_CALLBACK_URL")
    if not MPESA_CALLBACK_URL:
        MPESA_CALLBACK_URL = f"{BASE_URL}/api/payments/mpesa-callback"

    MPESA_RESULT_URL = os.environ.get("MPESA_RESULT_URL")
    if not MPESA_RESULT_URL:
        MPESA_RESULT_URL = f"{BASE_URL}/api/payments/mpesa-result"

    # ========== MOCK MODE ==========
    MPESA_MOCK_MODE = os.environ.get("MPESA_MOCK_MODE", "false").lower() == "true"

    # ========== PLATFORM FEES ==========
    PLATFORM_COMMISSION_RATE = float(
        os.environ.get("PLATFORM_COMMISSION_RATE", 0.05)
    )

    # ========== OTHER ==========
    QR_CODE_DIR = "qrcodes"
    RECEIPT_PREFIX = "REV"

    @classmethod
    def init_app(cls, app):
        """Initialize app with config and warn about missing credentials."""

        # Check Google OAuth credentials
        if not cls.GOOGLE_CLIENT_ID:
            app.logger.warning(
                "⚠️ GOOGLE_CLIENT_ID not set. Google Sign-In will not work."
            )

        if not cls.GOOGLE_CLIENT_SECRET:
            app.logger.warning(
                "⚠️ GOOGLE_CLIENT_SECRET not set. Google Sign-In will not work."
            )

        # Check M-Pesa credentials
        required_mpesa = [
            "MPESA_CONSUMER_KEY",
            "MPESA_CONSUMER_SECRET",
            "MPESA_PASSKEY",
            "MPESA_SHORTCODE",
        ]

        for var in required_mpesa:
            if not getattr(cls, var):
                app.logger.warning(
                    f"⚠️ {var} not set. M-Pesa payments will fail."
                )

        # Check email credentials
        if not cls.MAIL_USERNAME or not cls.MAIL_PASSWORD:
            app.logger.warning(
                "⚠️ MAIL_USERNAME or MAIL_PASSWORD not set. Email sending will fail."
            )

        # Check SMS provider credentials
        if cls.SMS_PROVIDER == "africastalking":
            if not cls.AFRICASTALKING_USERNAME or not cls.AFRICASTALKING_API_KEY:
                app.logger.warning(
                    "⚠️ Africa's Talking credentials not set. SMS will fail."
                )

        elif cls.SMS_PROVIDER == "twilio":
            if (
                not cls.TWILIO_ACCOUNT_SID
                or not cls.TWILIO_AUTH_TOKEN
                or not cls.TWILIO_PHONE_NUMBER
            ):
                app.logger.warning(
                    "⚠️ Twilio credentials not set. SMS will fail."
                )

        else:
            app.logger.info(
                "SMS provider set to 'log' – SMS will be logged, not actually sent."
            )