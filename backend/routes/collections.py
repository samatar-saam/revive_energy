# backend/routes/collections.py
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from database import db
from models.collection import Collection
from datetime import datetime

collections_bp = Blueprint('collections', __name__)

# ========== REQUEST PICKUP (CREATE) ==========
@collections_bp.route('/api/collections', methods=['POST'])
@jwt_required()
def create_collection():
    user_id = get_jwt_identity()
    data = request.get_json()
    
    required = ['wasteType', 'quantity', 'pickupDate', 'pickupTime', 'location']
    for field in required:
        if not data.get(field):
            return jsonify({'message': f'{field} is required'}), 400
    
    try:
        pickup_datetime = datetime.strptime(
            f"{data['pickupDate']} {data['pickupTime']}",
            '%Y-%m-%d %H:%M'
        )
    except:
        return jsonify({'message': 'Invalid date/time format'}), 400

    collection = Collection(
        supplier_id=user_id,
        waste_type=data['wasteType'],
        quantity=float(data['quantity']),
        unit=data.get('unit', 'kg'),
        location=data['location'],
        address=data.get('address', ''),
        pickup_datetime=pickup_datetime,
        special_instructions=data.get('specialInstructions', ''),
        contact_name=data.get('contactName', ''),
        contact_phone=data.get('contactPhone', ''),
        status='pending'
    )
    
    db.session.add(collection)
    db.session.commit()
    
    return jsonify({
        'message': 'Pickup scheduled successfully',
        'id': collection.id
    }), 201

# ========== GET ALL COLLECTIONS (READ) ==========
@collections_bp.route('/api/collections', methods=['GET'])
@jwt_required()
def get_collections():
    user_id = get_jwt_identity()
    collections = Collection.query.filter_by(supplier_id=user_id).order_by(Collection.created_at.desc()).all()
    
    return jsonify([{
        'id': c.id,
        'waste_type': c.waste_type,
        'quantity': c.quantity,
        'unit': c.unit,
        'location': c.location,
        'address': c.address,
        'pickup_datetime': c.pickup_datetime.isoformat() if c.pickup_datetime else None,
        'created_at': c.created_at.isoformat() if c.created_at else None,
        'status': c.status,
        'special_instructions': c.special_instructions,
        'contact_name': c.contact_name,
        'contact_phone': c.contact_phone
    } for c in collections]), 200