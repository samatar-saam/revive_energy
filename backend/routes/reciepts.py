from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from database import db

from models.receipt import Receipt


receipts_bp = Blueprint("receipts", __name__, url_prefix="/api/receipts")


@receipts_bp.route("/", methods=["GET"])
@jwt_required()
def get_my_receipts():
    user_id = int(get_jwt_identity())

    receipts = Receipt.query.filter(
        (Receipt.producer_id == user_id) |
        (Receipt.supplier_id == user_id) |
        (Receipt.transporter_id == user_id)
    ).order_by(Receipt.created_at.desc()).all()

    return jsonify([receipt.to_dict() for receipt in receipts]), 200


@receipts_bp.route("/<int:receipt_id>", methods=["GET"])
@jwt_required()
def get_receipt(receipt_id):
    user_id = int(get_jwt_identity())

    receipt = Receipt.query.get_or_404(receipt_id)

    if (
        receipt.producer_id != user_id
        and receipt.supplier_id != user_id
        and receipt.transporter_id != user_id
    ):
        return jsonify({"message": "Unauthorized"}), 403

    return jsonify(receipt.to_dict()), 200


@receipts_bp.route("/payment/<int:payment_id>", methods=["GET"])
@jwt_required()
def get_receipt_by_payment(payment_id):
    user_id = int(get_jwt_identity())

    receipt = Receipt.query.filter_by(payment_id=payment_id).first()

    if not receipt:
        return jsonify({"message": "Receipt not found"}), 404

    if (
        receipt.producer_id != user_id
        and receipt.supplier_id != user_id
        and receipt.transporter_id != user_id
    ):
        return jsonify({"message": "Unauthorized"}), 403

    return jsonify(receipt.to_dict()), 200