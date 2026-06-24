# backend/routes/waste.py
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from database import db
from models.waste import Waste
from datetime import datetime

waste_bp = Blueprint('waste', __name__)

# ========== REPORT NEW WASTE (POST) ==========
@waste_bp.route('/api/waste/report', methods=['POST'])
@jwt_required()
def report_waste():
    user_id = get_jwt_identity()
    data = request.get_json()
    
    required = ['wasteType', 'quantity', 'location']
    for field in required:
        if not data.get(field):
            return jsonify({'message': f'{field} is required'}), 400
    
    try:
        date_generated = datetime.strptime(
            data.get('dateGenerated', datetime.utcnow().date().isoformat()),
            '%Y-%m-%d'
        )
    except:
        date_generated = datetime.utcnow().date()
    
    waste = Waste(
        user_id=user_id,
        waste_type=data['wasteType'],
        quantity=float(data['quantity']),
        unit=data.get('unit', 'kg'),
        description=data.get('description', ''),
        location=data['location'],
        address=data.get('address', ''),
        date_generated=date_generated,
        status=data.get('wasteStatus', 'available'),
        contact_name=data.get('contactName', ''),
        contact_phone=data.get('contactPhone', '')
    )
    
    db.session.add(waste)
    db.session.commit()
    
    return jsonify({'message': 'Waste reported successfully', 'id': waste.id}), 201


# ========== GET ALL WASTE HISTORY (GET) ==========
@waste_bp.route('/api/waste', methods=['GET'])   # <-- THIS WAS MISSING
@jwt_required()
def get_waste():
    user_id = get_jwt_identity()
    waste_entries = Waste.query.filter_by(user_id=user_id).order_by(Waste.created_at.desc()).all()
    return jsonify([w.to_dict() for w in waste_entries]), 200