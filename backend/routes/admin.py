# backend/routes/admin.py
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import or_
from models import User, WasteListing
from database import db
from utils.decorators import role_required

admin_bp = Blueprint('admin', __name__, url_prefix='/api/admin')


@admin_bp.route('/waste-sources', methods=['GET'])
@jwt_required()
@role_required('admin')
def get_waste_sources():
    """Get all waste listings with full details."""
    try:
        query = WasteListing.query

        # ─── Filters ──────────────────────────────────────────
        search = request.args.get('search', '')
        status = request.args.get('status', '')
        category = request.args.get('category', '')

        if search:
            query = query.filter(
                or_(
                    WasteListing.waste_type.ilike(f'%{search}%'),
                    WasteListing.location.ilike(f'%{search}%')
                )
            )

        if status:
            query = query.filter(WasteListing.status == status)

        if category:
            query = query.filter(WasteListing.category == category)

        sources = query.order_by(WasteListing.created_at.desc()).all()

        # ─── Build response with full fields ────────────────
        result = []
        for s in sources:
            supplier = User.query.get(s.supplier_id)
            result.append({
                'id': s.id,
                'name': s.waste_type,
                'type': s.category or 'other',
                'quantity': s.quantity,
                'unit': s.unit,
                'location': s.location,
                'pickup_address': s.pickup_address or '',
                'description': s.description or '',
                'status': s.status,
                'supplier_id': s.supplier_id,
                'supplier_name': supplier.full_name if supplier else 'Unknown',
                'created_at': s.created_at.isoformat() if s.created_at else None,
                'updated_at': s.updated_at.isoformat() if hasattr(s, 'updated_at') and s.updated_at else None,
            })

        return jsonify(result), 200

    except Exception as e:
        return jsonify({'message': str(e)}), 500


@admin_bp.route('/waste-sources', methods=['POST'])
@jwt_required()
@role_required('admin')
def create_waste_source():
    """Create a new waste listing."""
    try:
        data = request.get_json()
        if not data:
            return jsonify({'message': 'No data provided'}), 400

        required = ['name', 'location', 'quantity']
        for field in required:
            if not data.get(field):
                return jsonify({'message': f'{field} is required'}), 400

        source = WasteListing(
            waste_type=data['name'],
            category=data.get('type', 'other'),
            quantity=float(data['quantity']),
            unit=data.get('unit', 'kg'),
            location=data['location'],
            pickup_address=data.get('pickup_address', ''),
            description=data.get('description', ''),
            status=data.get('status', 'available'),
            supplier_id=data.get('supplier_id') or 1,  # default to admin if not provided
            image_url=data.get('image_url', ''),
        )

        db.session.add(source)
        db.session.commit()

        return jsonify({
            'message': 'Waste listing created successfully',
            'id': source.id,
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'message': str(e)}), 500


@admin_bp.route('/waste-sources/<int:source_id>', methods=['PUT'])
@jwt_required()
@role_required('admin')
def update_waste_source(source_id):
    """Update an existing waste listing."""
    try:
        source = WasteListing.query.get(source_id)
        if not source:
            return jsonify({'message': 'Waste listing not found'}), 404

        data = request.get_json()
        if not data:
            return jsonify({'message': 'No data provided'}), 400

        # Allowed fields to update
        allowed = ['name', 'type', 'location', 'pickup_address', 'description', 'status', 'quantity', 'unit']
        for field in allowed:
            if field in data:
                if field == 'name':
                    source.waste_type = data[field]
                elif field == 'type':
                    source.category = data[field]
                elif field == 'quantity':
                    source.quantity = float(data[field])
                elif field == 'unit':
                    source.unit = data[field]
                elif field == 'location':
                    source.location = data[field]
                elif field == 'pickup_address':
                    source.pickup_address = data[field]
                elif field == 'description':
                    source.description = data[field]
                elif field == 'status':
                    source.status = data[field]

        db.session.commit()

        return jsonify({'message': 'Waste listing updated successfully'}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'message': str(e)}), 500


@admin_bp.route('/waste-sources/<int:source_id>', methods=['DELETE'])
@jwt_required()
@role_required('admin')
def delete_waste_source(source_id):
    """Delete a waste listing."""
    try:
        source = WasteListing.query.get(source_id)
        if not source:
            return jsonify({'message': 'Waste listing not found'}), 404

        db.session.delete(source)
        db.session.commit()

        return jsonify({'message': 'Waste listing deleted successfully'}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'message': str(e)}), 500