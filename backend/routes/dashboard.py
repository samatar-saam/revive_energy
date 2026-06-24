from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from database import db
from models import Collection, User
from datetime import datetime

dashboard_bp = Blueprint('dashboard', __name__)

@dashboard_bp.route('/dashboard/test', methods=['GET'])
def test_dashboard():
    return jsonify({'message': '✅ Dashboard blueprint is working!'}), 200

@dashboard_bp.route('/dashboard/activity', methods=['GET'])
@jwt_required()
def get_recent_activity():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify([]), 200
    try:
        if user.role == 'supplier':
            collections = Collection.query.filter_by(supplier_id=user_id).order_by(Collection.created_at.desc()).limit(5).all()
        elif user.role == 'producer':
            collections = Collection.query.filter_by(processor_id=user_id).order_by(Collection.created_at.desc()).limit(5).all()
        elif user.role == 'transporter':
            collections = Collection.query.filter_by(transporter_id=user_id).order_by(Collection.created_at.desc()).limit(5).all()
        else:
            collections = []
        return jsonify([{
            'id': c.id,
            'waste_type': c.waste_type,
            'quantity': c.quantity,
            'unit': c.unit,
            'location': c.location,
            'status': c.status,
            'created_at': c.created_at.isoformat() if c.created_at else None
        } for c in collections]), 200
    except Exception as e:
        print(f"Activity error: {e}")
        return jsonify([]), 200