# backend/routes/admin.py
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash
from sqlalchemy import or_, func
from datetime import datetime                     # <-- ADDED
from models import User, WasteListing, Payment, ProcessingPlant, Collection   # <-- ADDED Collection
from database import db
from utils.decorators import role_required

admin_bp = Blueprint('admin', __name__, url_prefix='/api/admin')


# ─── HELPER: paginate ────────────────────────────────────────────
def paginate_query(query, page, per_page):
    total = query.count()
    items = query.offset((page - 1) * per_page).limit(per_page).all()
    return items, total


# ─── USER MANAGEMENT ─────────────────────────────────────────────

@admin_bp.route('/users', methods=['GET'])
@jwt_required()
@role_required('admin')
def get_users():
    """
    Get all users with optional filters, search, and pagination.
    Query params: role, status, search, page, per_page
    """
    try:
        role = request.args.get('role')
        status = request.args.get('status')
        search = request.args.get('search')
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 50, type=int)

        query = User.query

        # Role filter (supports comma-separated: ?role=supplier,admin)
        if role:
            roles = [r.strip() for r in role.split(',')]
            query = query.filter(User.role.in_(roles))

        if status:
            query = query.filter(User.account_status == status)

        if search:
            term = f"%{search}%"
            query = query.filter(
                or_(
                    User.full_name.ilike(term),
                    User.email.ilike(term),
                    User.phone.ilike(term),
                    User.business_name.ilike(term),
                    User.location.ilike(term),
                )
            )

        query = query.order_by(User.created_at.desc())
        users, total = paginate_query(query, page, per_page)

        return jsonify({
            'data': [u.to_dict() for u in users],
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': total,
                'pages': (total + per_page - 1) // per_page
            }
        }), 200

    except Exception as e:
        return jsonify({'message': str(e)}), 500


@admin_bp.route('/users/<int:user_id>', methods=['GET'])
@jwt_required()
@role_required('admin')
def get_user(user_id):
    """Get a single user by ID."""
    try:
        user = User.query.get(user_id)
        if not user:
            return jsonify({'message': 'User not found'}), 404
        return jsonify(user.to_dict()), 200
    except Exception as e:
        return jsonify({'message': str(e)}), 500


@admin_bp.route('/users', methods=['POST'])
@jwt_required()
@role_required('admin')
def create_user():
    """Create a new user (admin only)."""
    try:
        data = request.get_json()
        if not data:
            return jsonify({'message': 'No data provided'}), 400

        required = ['full_name', 'email', 'password', 'phone']
        for field in required:
            if not data.get(field):
                return jsonify({'message': f'{field} is required'}), 400

        # Check email uniqueness
        if User.query.filter_by(email=data['email']).first():
            return jsonify({'message': 'Email already registered'}), 409

        new_user = User(
            full_name=data['full_name'],
            email=data['email'],
            phone=data['phone'],
            business_name=data.get('business_name', ''),
            location=data.get('location', ''),
            role=data.get('role', 'supplier'),
            account_status=data.get('account_status', 'active'),
            password_hash=generate_password_hash(data['password'])
        )

        db.session.add(new_user)
        db.session.commit()
        return jsonify({'message': 'User created successfully', 'id': new_user.id}), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'message': str(e)}), 500


@admin_bp.route('/users/<int:user_id>', methods=['PUT'])
@jwt_required()
@role_required('admin')
def update_user(user_id):
    """
    Update user details.
    Accepts: full_name, business_name, phone, location, role, account_status, (optionally password)
    """
    try:
        user = User.query.get(user_id)
        if not user:
            return jsonify({'message': 'User not found'}), 404

        data = request.get_json()
        if not data:
            return jsonify({'message': 'No data provided'}), 400

        allowed_fields = ['full_name', 'business_name', 'phone', 'location', 'role', 'account_status']
        for field in allowed_fields:
            if field in data:
                setattr(user, field, data[field])

        # Optional password update
        if 'password' in data and data['password']:
            user.password_hash = generate_password_hash(data['password'])

        db.session.commit()
        return jsonify({'message': 'User updated successfully'}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'message': str(e)}), 500


@admin_bp.route('/users/<int:user_id>', methods=['DELETE'])
@jwt_required()
@role_required('admin')
def delete_user(user_id):
    """Delete a user. Admin cannot delete themselves."""
    try:
        current_user_id = int(get_jwt_identity())
        if user_id == current_user_id:
            return jsonify({'message': 'You cannot delete your own account'}), 400

        user = User.query.get(user_id)
        if not user:
            return jsonify({'message': 'User not found'}), 404

        db.session.delete(user)
        db.session.commit()
        return jsonify({'message': 'User deleted successfully'}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'message': str(e)}), 500


# ─── WASTE SOURCES / LISTINGS CRUD ──────────────────────────────

@admin_bp.route('/waste-sources', methods=['GET'])
@jwt_required()
@role_required('admin')
def get_waste_sources():
    """Get all waste listings with full details, supports filtering."""
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
            supplier_id=data.get('supplier_id') or 1,  # default to admin user
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


# ─── ADMIN STATS ──────────────────────────────────────────────────

@admin_bp.route('/stats', methods=['GET'])
@jwt_required()
@role_required('admin')
def get_admin_stats():
    """Return key metrics for the admin dashboard."""
    try:
        total_users = User.query.count()
        total_listings = WasteListing.query.count()
        total_payments = Payment.query.count()

        # Revenue (sum of completed payment amounts)
        total_revenue = db.session.query(func.sum(Payment.amount)).filter(
            Payment.status == 'paid'
        ).scalar() or 0

        # Active listings (available, requested, assigned, collected)
        active_listings = WasteListing.query.filter(
            WasteListing.status.in_(['available', 'requested', 'assigned', 'collected'])
        ).count()

        return jsonify({
            'total_users': total_users,
            'total_listings': total_listings,
            'total_payments': total_payments,
            'total_revenue': total_revenue,
            'active_listings': active_listings,
            'pending_listings': WasteListing.query.filter_by(status='requested').count(),
            'completed_listings': WasteListing.query.filter_by(status='completed').count(),
        }), 200

    except Exception as e:
        return jsonify({'message': str(e)}), 500


# ─── PROCESSING PLANTS CRUD ──────────────────────────────────────

@admin_bp.route('/processing-plants', methods=['GET'])
@jwt_required()
@role_required('admin')
def get_processing_plants():
    """List all processing plants (with optional pagination)."""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 50, type=int)
        search = request.args.get('search')
        status = request.args.get('status')

        query = ProcessingPlant.query

        if search:
            term = f"%{search}%"
            query = query.filter(
                or_(
                    ProcessingPlant.name.ilike(term),
                    ProcessingPlant.location.ilike(term),
                    ProcessingPlant.type.ilike(term)
                )
            )

        if status:
            query = query.filter(ProcessingPlant.status == status)

        query = query.order_by(ProcessingPlant.created_at.desc())

        # Paginate
        plants, total = paginate_query(query, page, per_page)

        return jsonify({
            'data': [p.to_dict() for p in plants],
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': total,
                'pages': (total + per_page - 1) // per_page
            }
        }), 200

    except Exception as e:
        return jsonify({'message': str(e)}), 500


@admin_bp.route('/processing-plants', methods=['POST'])
@jwt_required()
@role_required('admin')
def create_processing_plant():
    """Create a new processing plant."""
    try:
        data = request.get_json()
        if not data:
            return jsonify({'message': 'No data provided'}), 400

        required = ['name', 'location', 'capacity', 'type']
        for field in required:
            if not data.get(field):
                return jsonify({'message': f'{field} is required'}), 400

        plant = ProcessingPlant(
            name=data['name'],
            location=data['location'],
            capacity=float(data['capacity']),
            unit=data.get('unit', 'tonnes/day'),
            type=data['type'],
            status=data.get('status', 'active'),
            contact_person=data.get('contact_person', ''),
            contact_phone=data.get('contact_phone', ''),
            contact_email=data.get('contact_email', ''),
            description=data.get('description', ''),
        )

        db.session.add(plant)
        db.session.commit()

        return jsonify({
            'message': 'Processing plant created successfully',
            'id': plant.id
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'message': str(e)}), 500


@admin_bp.route('/processing-plants/<int:plant_id>', methods=['PUT'])
@jwt_required()
@role_required('admin')
def update_processing_plant(plant_id):
    """Update an existing processing plant."""
    try:
        plant = ProcessingPlant.query.get(plant_id)
        if not plant:
            return jsonify({'message': 'Plant not found'}), 404

        data = request.get_json()
        if not data:
            return jsonify({'message': 'No data provided'}), 400

        # Allowed fields
        allowed = ['name', 'location', 'capacity', 'unit', 'type', 'status',
                   'contact_person', 'contact_phone', 'contact_email', 'description']
        for field in allowed:
            if field in data:
                if field == 'capacity':
                    setattr(plant, field, float(data[field]))
                else:
                    setattr(plant, field, data[field])

        db.session.commit()
        return jsonify({'message': 'Plant updated successfully'}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'message': str(e)}), 500


@admin_bp.route('/processing-plants/<int:plant_id>', methods=['DELETE'])
@jwt_required()
@role_required('admin')
def delete_processing_plant(plant_id):
    """Delete a processing plant."""
    try:
        plant = ProcessingPlant.query.get(plant_id)
        if not plant:
            return jsonify({'message': 'Plant not found'}), 404

        db.session.delete(plant)
        db.session.commit()
        return jsonify({'message': 'Plant deleted successfully'}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'message': str(e)}), 500


# ─── COLLECTIONS CRUD ────────────────────────────────────────────

@admin_bp.route('/collections', methods=['GET'])
@jwt_required()
@role_required('admin')
def get_collections():
    """List all collections with supplier details."""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 50, type=int)
        search = request.args.get('search')
        status = request.args.get('status')

        query = Collection.query

        if search:
            term = f"%{search}%"
            query = query.filter(
                or_(
                    Collection.waste_type.ilike(term),
                    Collection.location.ilike(term),
                    Collection.address.ilike(term),
                )
            )

        if status:
            query = query.filter(Collection.status == status)

        query = query.order_by(Collection.created_at.desc())
        collections, total = paginate_query(query, page, per_page)

        # Build response with supplier names
        result = []
        for c in collections:
            supplier = User.query.get(c.supplier_id)
            result.append({
                'id': c.id,
                'waste_type': c.waste_type,
                'quantity': c.quantity,
                'unit': c.unit,
                'location': c.location,
                'address': c.address,
                'pickup_datetime': c.pickup_datetime.isoformat() if c.pickup_datetime else None,
                'status': c.status,
                'supplier_id': c.supplier_id,
                'supplier_name': supplier.full_name if supplier else 'Unknown',
                'contact_name': c.contact_name,
                'contact_phone': c.contact_phone,
                'special_instructions': c.special_instructions,
                'created_at': c.created_at.isoformat() if c.created_at else None,
                'updated_at': c.updated_at.isoformat() if hasattr(c, 'updated_at') and c.updated_at else None,
            })

        return jsonify({
            'data': result,
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': total,
                'pages': (total + per_page - 1) // per_page
            }
        }), 200

    except Exception as e:
        print(f"❌ Error in get_collections: {e}")
        return jsonify({'message': str(e)}), 500


@admin_bp.route('/collections', methods=['POST'])
@jwt_required()
@role_required('admin')
def create_collection():
    """Create a new collection."""
    try:
        data = request.get_json()
        if not data:
            return jsonify({'message': 'No data provided'}), 400

        required = ['waste_type', 'quantity', 'location', 'pickup_datetime', 'supplier_id']
        for field in required:
            if not data.get(field):
                return jsonify({'message': f'{field} is required'}), 400

        supplier = User.query.get(data['supplier_id'])
        if not supplier:
            return jsonify({'message': 'Supplier not found'}), 404

        new_collection = Collection(
            supplier_id=data['supplier_id'],
            waste_type=data['waste_type'],
            quantity=float(data['quantity']),
            unit=data.get('unit', 'kg'),
            location=data['location'],
            address=data.get('address', ''),
            pickup_datetime=datetime.fromisoformat(data['pickup_datetime']),
            status=data.get('status', 'pending'),
            contact_name=data.get('contact_name', ''),
            contact_phone=data.get('contact_phone', ''),
            special_instructions=data.get('special_instructions', ''),
        )

        db.session.add(new_collection)
        db.session.commit()

        return jsonify({
            'message': 'Collection created successfully',
            'id': new_collection.id
        }), 201

    except Exception as e:
        db.session.rollback()
        print(f"❌ Error in create_collection: {e}")
        return jsonify({'message': str(e)}), 500


@admin_bp.route('/collections/<int:collection_id>', methods=['PUT'])
@jwt_required()
@role_required('admin')
def update_collection(collection_id):
    """Update an existing collection."""
    try:
        collection = Collection.query.get(collection_id)
        if not collection:
            return jsonify({'message': 'Collection not found'}), 404

        data = request.get_json()
        if not data:
            return jsonify({'message': 'No data provided'}), 400

        allowed = ['waste_type', 'quantity', 'unit', 'location', 'address',
                   'pickup_datetime', 'status', 'contact_name', 'contact_phone',
                   'special_instructions']
        for field in allowed:
            if field in data:
                if field == 'quantity':
                    setattr(collection, field, float(data[field]))
                elif field == 'pickup_datetime':
                    setattr(collection, field, datetime.fromisoformat(data[field]))
                else:
                    setattr(collection, field, data[field])

        db.session.commit()
        return jsonify({'message': 'Collection updated successfully'}), 200

    except Exception as e:
        db.session.rollback()
        print(f"❌ Error in update_collection: {e}")
        return jsonify({'message': str(e)}), 500


@admin_bp.route('/collections/<int:collection_id>', methods=['DELETE'])
@jwt_required()
@role_required('admin')
def delete_collection(collection_id):
    """Delete a collection."""
    try:
        collection = Collection.query.get(collection_id)
        if not collection:
            return jsonify({'message': 'Collection not found'}), 404

        db.session.delete(collection)
        db.session.commit()
        return jsonify({'message': 'Collection deleted successfully'}), 200

    except Exception as e:
        db.session.rollback()
        print(f"❌ Error in delete_collection: {e}")
        return jsonify({'message': str(e)}), 500