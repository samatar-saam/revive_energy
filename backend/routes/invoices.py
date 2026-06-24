from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import Invoice

invoices_bp = Blueprint('invoices', __name__)

@invoices_bp.route('/invoices', methods=['GET'])
@jwt_required()
def get_invoices():
    user_id = get_jwt_identity()
    invoices = Invoice.query.filter_by(user_id=user_id).order_by(Invoice.created_at.desc()).all()
    return jsonify([{
        'id': inv.id,
        'invoice_number': inv.invoice_number,
        'total_amount': inv.total_amount,
        'status': inv.status,
        'created_at': inv.created_at.isoformat()
    } for inv in invoices]), 200