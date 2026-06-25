from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_jwt_extended import JWTManager, jwt_required, get_jwt_identity
from flask_mail import Mail
from config import Config
from database import db
from sqlalchemy import func
from datetime import datetime
import qrcode
import os
import json
from dotenv import load_dotenv

load_dotenv()

from models import (
    User,
    Collection,
    Waste,
    SupportTicket,
    Payment,
    Receipt,
    WasteListing,
    WasteRequest,
    TransportJob,
    Invoice,
    Notification,
    Conversation,
    Message,
)

from routes.auth import auth_bp
from routes.dashboard import dashboard_bp
from routes.supplier import supplier_bp
from routes.producer import producer_bp
from routes.transporter import transporter_bp
from routes.notifications import notifications_bp
from routes.payments import payments_bp
from routes.invoices import invoices_bp
from routes.messages import messages_bp

from services.mpesa import MpesaService

mpesa = MpesaService()


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    CORS(app, resources={r"/api/*": {"origins": "*"}})

    db.init_app(app)
    JWTManager(app)

    mail = Mail(app)
    app.extensions["mail"] = mail

    app.register_blueprint(auth_bp, url_prefix="/api")
    app.register_blueprint(dashboard_bp, url_prefix="/api")
    app.register_blueprint(supplier_bp, url_prefix="/api")
    app.register_blueprint(producer_bp, url_prefix="/api")
    app.register_blueprint(transporter_bp, url_prefix="/api")
    app.register_blueprint(notifications_bp, url_prefix="/api")

    # ✅ IMPORTANT:
    # routes/payments.py already has url_prefix="/api/payments"
    # so do NOT add url_prefix="/api" here.
    app.register_blueprint(payments_bp)

    app.register_blueprint(invoices_bp, url_prefix="/api")
    app.register_blueprint(messages_bp, url_prefix="/api")

    def generate_qr_code(payment):
        receipt_data = {
            "receipt_number": payment.receipt_number,
            "transaction_id": payment.transaction_id,
            "amount": payment.amount,
            "date": payment.completed_at.isoformat()
            if payment.completed_at
            else datetime.utcnow().isoformat(),
            "status": payment.payment_status,
        }

        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_L,
            box_size=10,
            border=4,
        )

        qr.add_data(json.dumps(receipt_data))
        qr.make(fit=True)

        img = qr.make_image(fill_color="black", back_color="white")

        qr_dir = os.path.join(app.root_path, "static", "qrcodes")
        os.makedirs(qr_dir, exist_ok=True)

        filename = f"{payment.receipt_number}.png"
        filepath = os.path.join(qr_dir, filename)

        img.save(filepath)

        receipt = Receipt.query.filter_by(payment_id=payment.id).first()

        if receipt:
            receipt.qr_code_path = f"/static/qrcodes/{filename}"
            db.session.commit()

    @app.route("/api/collections", methods=["GET"])
    @jwt_required()
    def get_collections():
        user_id = int(get_jwt_identity())

        try:
            collections = Collection.query.filter_by(
                supplier_id=user_id
            ).order_by(Collection.created_at.desc()).all()

            return jsonify([
                {
                    "id": c.id,
                    "waste_type": c.waste_type,
                    "quantity": c.quantity,
                    "unit": c.unit,
                    "location": c.location,
                    "address": c.address,
                    "pickup_datetime": c.pickup_datetime.isoformat()
                    if c.pickup_datetime
                    else None,
                    "created_at": c.created_at.isoformat()
                    if c.created_at
                    else None,
                    "status": c.status,
                    "special_instructions": c.special_instructions,
                    "contact_name": c.contact_name,
                    "contact_phone": c.contact_phone,
                }
                for c in collections
            ]), 200

        except Exception as e:
            print(f"Collections error: {e}")
            return jsonify([]), 200

    @app.route("/api/waste", methods=["GET"])
    @jwt_required()
    def get_waste():
        user_id = int(get_jwt_identity())

        try:
            waste = Waste.query.filter_by(
                user_id=user_id
            ).order_by(Waste.created_at.desc()).all()

            return jsonify([w.to_dict() for w in waste]), 200

        except Exception as e:
            print(f"Waste error: {e}")
            return jsonify([]), 200

    @app.route("/api/payments", methods=["GET"])
    @jwt_required()
    def get_payments():
        user_id = int(get_jwt_identity())

        try:
            payments = Payment.query.filter(
                (Payment.payer_id == user_id)
                | (Payment.supplier_id == user_id)
                | (Payment.producer_id == user_id)
                | (Payment.transporter_id == user_id)
            ).order_by(Payment.created_at.desc()).all()

            return jsonify([p.to_dict() for p in payments]), 200

        except Exception as e:
            print(f"Payments error: {e}")
            return jsonify([]), 200

    @app.route("/api/payments/summary", methods=["GET"])
    @jwt_required()
    def get_payments_summary():
        user_id = int(get_jwt_identity())

        try:
            total_earned = (
                db.session.query(func.sum(Payment.supplier_amount))
                .filter(
                    Payment.supplier_id == user_id,
                    Payment.payment_status == "completed",
                )
                .scalar()
                or 0
            )

            total_pending = (
                db.session.query(func.sum(Payment.amount))
                .filter(
                    Payment.payer_id == user_id,
                    Payment.payment_status == "pending",
                )
                .scalar()
                or 0
            )

            total_owed = (
                db.session.query(func.sum(Payment.supplier_amount))
                .filter(
                    Payment.supplier_id == user_id,
                    Payment.payment_status == "completed",
                    Payment.delivery_confirmed == False,
                )
                .scalar()
                or 0
            )

            return jsonify({
                "totalEarned": total_earned,
                "totalPending": total_pending,
                "totalOwed": total_owed,
                "currency": "KES",
            }), 200

        except Exception as e:
            print(f"Payments summary error: {e}")
            return jsonify({
                "totalEarned": 0,
                "totalPending": 0,
                "totalOwed": 0,
                "currency": "KES",
            }), 200

    @app.route("/api/payments/initiate", methods=["POST"])
    @jwt_required()
    def initiate_payment():
        user_id = int(get_jwt_identity())
        data = request.get_json() or {}

        supplier_id = data.get("supplier_id")
        amount = data.get("amount")
        phone = data.get("phone")
        description = data.get("description", "Waste collection payment")

        if not all([supplier_id, amount, phone]):
            return jsonify({"message": "Missing required fields"}), 400

        supplier = User.query.get(supplier_id)

        if not supplier:
            return jsonify({"message": "Supplier not found"}), 404

        payment = Payment(
            payer_id=user_id,
            supplier_id=supplier_id,
            producer_id=user_id,
            amount=amount,
            total_amount=amount,
            payment_status="pending",
            status="pending",
            escrow_status="waiting",
            phone_number=phone,
        )

        db.session.add(payment)
        db.session.commit()

        if app.config.get("MPESA_MOCK_MODE", False):
            payment.checkout_request_id = f"MOCK-{payment.id}"
            payment.merchant_request_id = f"MOCK-MERCHANT-{payment.id}"
            payment.payment_status = "completed"
            payment.status = "paid"
            payment.escrow_status = "held"
            payment.completed_at = datetime.utcnow()
            payment.mpesa_receipt = f"MOCK-RECEIPT-{payment.id}"
            payment.transaction_id = f"TXN-{payment.id}"
            payment.receipt_number = f"REV-{payment.id}"

            commission_rate = app.config.get("PLATFORM_COMMISSION_RATE", 0.05)
            payment.commission = round(payment.amount * commission_rate, 2)
            payment.supplier_amount = payment.amount - payment.commission

            db.session.commit()

            if hasattr(payment, "generate_receipt"):
                payment.generate_receipt()

            generate_qr_code(payment)

            return jsonify({
                "message": "Mock payment successful",
                "payment_id": payment.id,
                "checkout_request_id": payment.checkout_request_id,
                "status": "completed",
            }), 200

        try:
            response = mpesa.stk_push(
                phone=phone,
                amount=amount,
                transaction_id=payment.transaction_id,
                description=description,
            )

            if response.get("CheckoutRequestID"):
                payment.checkout_request_id = response["CheckoutRequestID"]
                payment.merchant_request_id = response.get("MerchantRequestID")
                db.session.commit()

                return jsonify({
                    "message": "STK Push sent. Please check your phone.",
                    "payment_id": payment.id,
                    "checkout_request_id": payment.checkout_request_id,
                    "status": "pending",
                }), 200

            payment.payment_status = "failed"
            payment.status = "failed"
            db.session.commit()

            return jsonify({
                "message": "Failed to initiate payment",
                "error": response.get("errorMessage", "Unknown error"),
            }), 400

        except Exception as e:
            payment.payment_status = "failed"
            payment.status = "failed"
            db.session.commit()

            return jsonify({
                "message": f"Payment initiation failed: {str(e)}"
            }), 500

    @app.route("/api/payments/receipt/<int:payment_id>", methods=["GET"])
    @jwt_required()
    def get_receipt(payment_id):
        user_id = int(get_jwt_identity())

        payment = Payment.query.get(payment_id)

        if not payment:
            return jsonify({"message": "Payment not found"}), 404

        if (
            payment.payer_id != user_id
            and payment.supplier_id != user_id
            and payment.transporter_id != user_id
            and payment.producer_id != user_id
        ):
            return jsonify({"message": "Unauthorized"}), 403

        receipt = Receipt.query.filter_by(payment_id=payment.id).first()

        if not receipt:
            return jsonify({"message": "Receipt not found"}), 404

        return jsonify({
            "payment": payment.to_dict(),
            "receipt": receipt.to_dict(),
        }), 200

    @app.route("/api/support", methods=["GET"])
    @jwt_required()
    def get_support():
        user_id = int(get_jwt_identity())

        try:
            tickets = SupportTicket.query.filter_by(
                user_id=user_id
            ).order_by(SupportTicket.created_at.desc()).all()

            return jsonify([t.to_dict() for t in tickets]), 200

        except Exception as e:
            print(f"Support error: {e}")
            return jsonify([]), 200

    @app.route("/api/user", methods=["GET"])
    @jwt_required()
    def get_user():
        user_id = int(get_jwt_identity())
        user = User.query.get(user_id)

        if not user:
            return jsonify({"message": "User not found"}), 404

        return jsonify(user.to_dict()), 200

    @app.route("/api/user", methods=["PUT"])
    @jwt_required()
    def update_user():
        user_id = int(get_jwt_identity())
        user = User.query.get(user_id)

        if not user:
            return jsonify({"message": "User not found"}), 404

        data = request.get_json() or {}

        updatable_fields = [
            "full_name",
            "phone",
            "business_name",
            "business_type",
            "location",
            "waste_types",
        ]

        for field in updatable_fields:
            if field in data:
                setattr(user, field, data[field])

        db.session.commit()

        return jsonify({
            "message": "Profile updated successfully",
            "user": user.to_dict(),
        }), 200

    @app.route("/api/dashboard/test", methods=["GET"])
    def test_route():
        return jsonify({"message": "App is running!"}), 200

    with app.app_context():
        db.create_all()

        print("✅ Database tables created")

        inspector = db.inspect(db.engine)

        print("📋 Existing tables:", inspector.get_table_names())

        print("\n📋 Registered Routes:")

        for rule in app.url_map.iter_rules():
            methods = ",".join(sorted(rule.methods))
            print(f"   {rule.rule:55} [{methods}]")

        print()

    return app


if __name__ == "__main__":
    app = create_app()
    print("\n🚀 Server running on http://localhost:5000")
    app.run(debug=True, port=5000)