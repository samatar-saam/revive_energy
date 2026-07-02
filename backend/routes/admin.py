# backend/routes/admin.py
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash
from sqlalchemy import or_, func
from datetime import datetime, timedelta
from models import (
    User,
    WasteListing,
    Payment,
    ProcessingPlant,
    Collection,
    CarbonCredit,
    Review,
    Conversation,   # <-- ADDED
    Message,         # <-- ADDED
)
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
    """Update user details."""
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
            supplier_id=data.get('supplier_id') or 1,
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

        total_revenue = db.session.query(func.sum(Payment.amount)).filter(
            Payment.status == 'paid'
        ).scalar() or 0

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
        return jsonify({'message': 'Processing plant created successfully', 'id': plant.id}), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'message': str(e)}), 500


@admin_bp.route('/processing-plants/<int:plant_id>', methods=['PUT'])
@jwt_required()
@role_required('admin')
def update_processing_plant(plant_id):
    try:
        plant = ProcessingPlant.query.get(plant_id)
        if not plant:
            return jsonify({'message': 'Plant not found'}), 404

        data = request.get_json()
        if not data:
            return jsonify({'message': 'No data provided'}), 400

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
        return jsonify({'message': 'Collection created successfully', 'id': new_collection.id}), 201

    except Exception as e:
        db.session.rollback()
        print(f"❌ Error in create_collection: {e}")
        return jsonify({'message': str(e)}), 500


@admin_bp.route('/collections/<int:collection_id>', methods=['PUT'])
@jwt_required()
@role_required('admin')
def update_collection(collection_id):
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


# ─── PAYMENTS (ADMIN) ────────────────────────────────────────────

@admin_bp.route('/payments', methods=['GET'])
@jwt_required()
@role_required('admin')
def get_all_payments():
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 50, type=int)
        search = request.args.get('search')
        status = request.args.get('status')

        query = Payment.query

        if search:
            term = f"%{search}%"
            query = query.filter(
                or_(
                    Payment.transaction_id.ilike(term),
                    Payment.receipt_number.ilike(term),
                    Payment.mpesa_receipt.ilike(term),
                )
            )

        if status:
            query = query.filter(Payment.status == status)

        query = query.order_by(Payment.created_at.desc())
        payments, total = paginate_query(query, page, per_page)

        result = []
        for p in payments:
            payer = User.query.get(p.payer_id)
            supplier = User.query.get(p.supplier_id)
            producer = User.query.get(p.producer_id)
            transporter = User.query.get(p.transporter_id)

            result.append({
                'id': p.id,
                'amount': p.amount,
                'status': p.status,
                'payment_status': p.payment_status,
                'payer_id': p.payer_id,
                'payer_name': payer.full_name if payer else None,
                'payer_email': payer.email if payer else None,
                'supplier_id': p.supplier_id,
                'supplier_name': supplier.full_name if supplier else None,
                'producer_id': p.producer_id,
                'producer_name': producer.full_name if producer else None,
                'transporter_id': p.transporter_id,
                'transporter_name': transporter.full_name if transporter else None,
                'transaction_id': p.transaction_id,
                'receipt_number': p.receipt_number,
                'mpesa_receipt': p.mpesa_receipt,
                'payment_method': p.payment_method,
                'created_at': p.created_at.isoformat() if p.created_at else None,
                'completed_at': p.completed_at.isoformat() if p.completed_at else None,
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
        print(f"❌ Error in get_all_payments: {e}")
        return jsonify({'message': str(e)}), 500


# ─── ANALYTICS ───────────────────────────────────────────────────

@admin_bp.route('/analytics', methods=['GET'])
@jwt_required()
@role_required('admin')
def get_analytics():
    """
    Return comprehensive analytics data for admin dashboard.
    Query param: range = 7days | 30days | 90days (default 30days)
    """
    try:
        range_param = request.args.get('range', '30days')
        days = int(range_param.replace('days', ''))

        # ─── Summary stats ──────────────────────────────────────
        total_users = User.query.count()
        total_listings = WasteListing.query.count()
        total_collections = Collection.query.count()

        total_revenue = db.session.query(func.sum(Payment.amount)).filter(
            Payment.status.in_(['completed', 'paid'])
        ).scalar() or 0

        # ─── Revenue trend (last N days) ──────────────────────
        cutoff = datetime.utcnow() - timedelta(days=days)
        revenue_by_day = db.session.query(
            func.date(Payment.created_at).label('date'),
            func.sum(Payment.amount).label('amount')
        ).filter(
            Payment.created_at >= cutoff,
            Payment.status.in_(['completed', 'paid'])
        ).group_by(func.date(Payment.created_at)).order_by('date').all()

        # Build revenue trend data (fill missing days with 0)
        revenue_trend_data = []
        current_date = cutoff.date()
        while current_date <= datetime.utcnow().date():
            found = False
            for r in revenue_by_day:
                if r.date == current_date:
                    revenue_trend_data.append({
                        'date': r.date.isoformat(),
                        'amount': float(r.amount)
                    })
                    found = True
                    break
            if not found:
                revenue_trend_data.append({
                    'date': current_date.isoformat(),
                    'amount': 0
                })
            current_date += timedelta(days=1)

        # ─── User growth (last N days) ────────────────────────
        users_by_day = db.session.query(
            func.date(User.created_at).label('date'),
            func.count(User.id).label('count')
        ).filter(
            User.created_at >= cutoff
        ).group_by(func.date(User.created_at)).order_by('date').all()

        user_growth_data = []
        current_date = cutoff.date()
        cumulative = 0
        while current_date <= datetime.utcnow().date():
            found = False
            for r in users_by_day:
                if r.date == current_date:
                    cumulative += r.count
                    found = True
                    break
            user_growth_data.append({
                'date': current_date.isoformat(),
                'count': cumulative
            })
            current_date += timedelta(days=1)

        # ─── Waste by category ──────────────────────────────────
        waste_categories = db.session.query(
            WasteListing.category,
            func.sum(WasteListing.quantity).label('total')
        ).filter(
            WasteListing.category.isnot(None)
        ).group_by(WasteListing.category).all()

        waste_by_category = [
            {'name': c.category or 'Other', 'value': float(c.total)}
            for c in waste_categories
        ]
        if not waste_by_category:
            waste_by_category = [{'name': 'No Data', 'value': 1}]

        # ─── Payment status distribution ──────────────────────
        status_counts = db.session.query(
            Payment.status,
            func.count(Payment.id).label('count')
        ).group_by(Payment.status).all()

        payment_status = [
            {'name': s.status or 'Unknown', 'value': s.count}
            for s in status_counts
        ]
        if not payment_status:
            payment_status = [{'name': 'No Data', 'value': 1}]

        # ─── Recent activity ────────────────────────────────────
        recent_payments = Payment.query.order_by(
            Payment.created_at.desc()
        ).limit(10).all()

        recent_activity = []
        for p in recent_payments:
            payer = User.query.get(p.payer_id)
            recent_activity.append({
                'event': 'payment',
                'user_name': payer.full_name if payer else 'Unknown',
                'details': f'Payment of {p.amount} KES',
                'created_at': p.created_at.isoformat() if p.created_at else None,
            })

        recent_listings = WasteListing.query.order_by(
            WasteListing.created_at.desc()
        ).limit(5).all()

        for l in recent_listings:
            supplier = User.query.get(l.supplier_id)
            recent_activity.append({
                'event': 'listing',
                'user_name': supplier.full_name if supplier else 'Unknown',
                'details': f'New waste listing: {l.waste_type} ({l.quantity} {l.unit})',
                'created_at': l.created_at.isoformat() if l.created_at else None,
            })

        recent_activity.sort(key=lambda x: x['created_at'], reverse=True)
        recent_activity = recent_activity[:20]

        # ─── Trends (for stats cards) ──────────────────────────
        revenue_trend_pct = 0
        if len(revenue_by_day) >= 2:
            total_prev = sum(float(r.amount) for r in revenue_by_day[:-1])
            total_curr = float(revenue_by_day[-1].amount)
            if total_prev > 0:
                revenue_trend_pct = round(((total_curr - total_prev) / total_prev) * 100, 1)

        user_trend_pct = 0
        if len(users_by_day) >= 2:
            prev_count = sum(r.count for r in users_by_day[:-1])
            curr_count = users_by_day[-1].count
            if prev_count > 0:
                user_trend_pct = round(((curr_count - prev_count) / prev_count) * 100, 1)

        return jsonify({
            'summary': {
                'totalRevenue': float(total_revenue),
                'totalUsers': total_users,
                'totalListings': total_listings,
                'totalCollections': total_collections,
                'revenueTrend': revenue_trend_pct,
                'userTrend': user_trend_pct,
            },
            'revenueTrend': revenue_trend_data,
            'userGrowth': user_growth_data,
            'wasteByCategory': waste_by_category,
            'paymentStatus': payment_status,
            'recentActivity': recent_activity,
        }), 200

    except Exception as e:
        print(f"❌ Error in get_analytics: {e}")
        return jsonify({'message': str(e)}), 500


# ─── IMPACT REPORTS ──────────────────────────────────────────────

@admin_bp.route('/impact', methods=['GET'])
@jwt_required()
@role_required('admin')
def get_impact_data():
    """
    Return environmental impact metrics for the admin dashboard.
    Query param: range = 7days | 30days | 90days (default 30days)
    """
    try:
        range_param = request.args.get('range', '30days')
        days = int(range_param.replace('days', ''))

        # ─── Summary stats ──────────────────────────────────────
        total_collections = Collection.query.count()
        total_waste = db.session.query(func.sum(Collection.quantity)).scalar() or 0
        total_energy = db.session.query(func.sum(Collection.energy_generated)).scalar() or 0
        total_carbon = db.session.query(func.sum(Collection.carbon_offset)).scalar() or 0

        # ─── Energy trend (last N days) ──────────────────────
        cutoff = datetime.utcnow() - timedelta(days=days)
        energy_by_day = db.session.query(
            func.date(Collection.pickup_datetime).label('date'),
            func.sum(Collection.energy_generated).label('value')
        ).filter(
            Collection.pickup_datetime >= cutoff,
            Collection.status == 'completed'
        ).group_by(func.date(Collection.pickup_datetime)).order_by('date').all()

        energy_trend = []
        current_date = cutoff.date()
        while current_date <= datetime.utcnow().date():
            found = False
            for r in energy_by_day:
                if r.date == current_date:
                    energy_trend.append({
                        'date': current_date.isoformat(),
                        'value': float(r.value) if r.value else 0
                    })
                    found = True
                    break
            if not found:
                energy_trend.append({
                    'date': current_date.isoformat(),
                    'value': 0
                })
            current_date += timedelta(days=1)

        # ─── Carbon trend ──────────────────────────────────────
        carbon_by_day = db.session.query(
            func.date(Collection.pickup_datetime).label('date'),
            func.sum(Collection.carbon_offset).label('value')
        ).filter(
            Collection.pickup_datetime >= cutoff,
            Collection.status == 'completed'
        ).group_by(func.date(Collection.pickup_datetime)).order_by('date').all()

        carbon_trend = []
        current_date = cutoff.date()
        while current_date <= datetime.utcnow().date():
            found = False
            for r in carbon_by_day:
                if r.date == current_date:
                    carbon_trend.append({
                        'date': current_date.isoformat(),
                        'value': float(r.value) if r.value else 0
                    })
                    found = True
                    break
            if not found:
                carbon_trend.append({
                    'date': current_date.isoformat(),
                    'value': 0
                })
            current_date += timedelta(days=1)

        # ─── Waste by type ──────────────────────────────────────
        waste_types = db.session.query(
            Collection.waste_type,
            func.sum(Collection.quantity).label('total')
        ).filter(
            Collection.waste_type.isnot(None)
        ).group_by(Collection.waste_type).all()

        waste_by_type = [
            {'name': w.waste_type or 'Other', 'value': float(w.total)}
            for w in waste_types
        ]
        if not waste_by_type:
            waste_by_type = [{'name': 'No Data', 'value': 1}]

        # ─── Recent activity ────────────────────────────────────
        recent_collections = Collection.query.order_by(
            Collection.created_at.desc()
        ).limit(15).all()

        recent_activity = []
        for c in recent_collections:
            supplier = User.query.get(c.supplier_id)
            recent_activity.append({
                'type': 'collection',
                'details': f'{c.waste_type} - {c.quantity} {c.unit} collected',
                'date': c.created_at.isoformat() if c.created_at else None,
            })

        return jsonify({
            'summary': {
                'totalWaste': float(total_waste),
                'totalEnergy': float(total_energy),
                'totalCarbon': float(total_carbon),
                'totalCollections': total_collections,
            },
            'energyTrend': energy_trend,
            'carbonTrend': carbon_trend,
            'wasteByType': waste_by_type,
            'recentActivity': recent_activity,
        }), 200

    except Exception as e:
        print(f"❌ Error in get_impact_data: {e}")
        return jsonify({'message': str(e)}), 500


# ─── CARBON CREDITS CRUD ─────────────────────────────────────────

@admin_bp.route('/carbon-credits', methods=['GET'])
@jwt_required()
@role_required('admin')
def get_carbon_credits():
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 50, type=int)
        search = request.args.get('search')
        status = request.args.get('status')

        query = CarbonCredit.query

        if search:
            term = f"%{search}%"
            query = query.filter(
                or_(
                    CarbonCredit.project_name.ilike(term),
                    CarbonCredit.serial_number.ilike(term),
                )
            )

        if status:
            query = query.filter(CarbonCredit.status == status)

        query = query.order_by(CarbonCredit.created_at.desc())
        credits, total = paginate_query(query, page, per_page)

        return jsonify({
            'data': [c.to_dict() for c in credits],
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': total,
                'pages': (total + per_page - 1) // per_page
            }
        }), 200

    except Exception as e:
        print(f"❌ Error in get_carbon_credits: {e}")
        return jsonify({'message': str(e)}), 500


@admin_bp.route('/carbon-credits', methods=['POST'])
@jwt_required()
@role_required('admin')
def create_carbon_credit():
    try:
        data = request.get_json()
        if not data:
            return jsonify({'message': 'No data provided'}), 400

        required = ['project_name', 'amount']
        for field in required:
            if not data.get(field):
                return jsonify({'message': f'{field} is required'}), 400

        # Generate serial number
        import random, string
        serial = ''.join(random.choices(string.ascii_uppercase + string.digits, k=12))

        credit = CarbonCredit(
            project_name=data['project_name'],
            amount=float(data['amount']),
            status=data.get('status', 'issued'),
            serial_number=serial,
            description=data.get('description', ''),
            expiry_date=datetime.utcnow() + timedelta(days=365)  # 1 year validity
        )

        db.session.add(credit)
        db.session.commit()

        return jsonify({
            'message': 'Carbon credit created successfully',
            'id': credit.id
        }), 201

    except Exception as e:
        db.session.rollback()
        print(f"❌ Error in create_carbon_credit: {e}")
        return jsonify({'message': str(e)}), 500


@admin_bp.route('/carbon-credits/<int:credit_id>', methods=['PUT'])
@jwt_required()
@role_required('admin')
def update_carbon_credit(credit_id):
    try:
        credit = CarbonCredit.query.get(credit_id)
        if not credit:
            return jsonify({'message': 'Carbon credit not found'}), 404

        data = request.get_json()
        if not data:
            return jsonify({'message': 'No data provided'}), 400

        allowed = ['project_name', 'amount', 'status', 'description']
        for field in allowed:
            if field in data:
                if field == 'amount':
                    setattr(credit, field, float(data[field]))
                else:
                    setattr(credit, field, data[field])

        db.session.commit()
        return jsonify({'message': 'Carbon credit updated successfully'}), 200

    except Exception as e:
        db.session.rollback()
        print(f"❌ Error in update_carbon_credit: {e}")
        return jsonify({'message': str(e)}), 500


@admin_bp.route('/carbon-credits/<int:credit_id>', methods=['DELETE'])
@jwt_required()
@role_required('admin')
def delete_carbon_credit(credit_id):
    try:
        credit = CarbonCredit.query.get(credit_id)
        if not credit:
            return jsonify({'message': 'Carbon credit not found'}), 404

        db.session.delete(credit)
        db.session.commit()
        return jsonify({'message': 'Carbon credit deleted successfully'}), 200

    except Exception as e:
        db.session.rollback()
        print(f"❌ Error in delete_carbon_credit: {e}")
        return jsonify({'message': str(e)}), 500


# ─── REVIEWS (ADMIN) ────────────────────────────────────────────

@admin_bp.route('/reviews', methods=['GET'])
@jwt_required()
@role_required('admin')
def get_reviews():
    """List all reviews with optional search, status, and rating filters."""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 50, type=int)
        search = request.args.get('search')
        status = request.args.get('status')
        rating = request.args.get('rating')

        query = Review.query

        if search:
            term = f"%{search}%"
            reviewer_names = db.session.query(User.id).filter(User.full_name.ilike(term))
            reviewee_names = db.session.query(User.id).filter(User.full_name.ilike(term))
            query = query.filter(
                or_(
                    Review.comment.ilike(term),
                    Review.reviewer_id.in_(reviewer_names),
                    Review.reviewee_id.in_(reviewee_names)
                )
            )

        if status:
            query = query.filter(Review.status == status)

        if rating:
            query = query.filter(Review.rating == int(rating))

        query = query.order_by(Review.created_at.desc())
        reviews, total = paginate_query(query, page, per_page)

        return jsonify({
            'data': [r.to_dict() for r in reviews],
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': total,
                'pages': (total + per_page - 1) // per_page
            }
        }), 200

    except Exception as e:
        print(f"❌ Error in get_reviews: {e}")
        return jsonify({'message': str(e)}), 500


@admin_bp.route('/reviews/<int:review_id>/status', methods=['PATCH'])
@jwt_required()
@role_required('admin')
def update_review_status(review_id):
    """Update review status (approve or reject)."""
    try:
        review = Review.query.get(review_id)
        if not review:
            return jsonify({'message': 'Review not found'}), 404

        data = request.get_json()
        new_status = data.get('status')
        if new_status not in ['approved', 'rejected']:
            return jsonify({'message': 'Invalid status. Allowed: approved, rejected'}), 400

        review.status = new_status
        db.session.commit()

        return jsonify({'message': f'Review {new_status} successfully'}), 200

    except Exception as e:
        db.session.rollback()
        print(f"❌ Error in update_review_status: {e}")
        return jsonify({'message': str(e)}), 500


@admin_bp.route('/reviews/<int:review_id>', methods=['DELETE'])
@jwt_required()
@role_required('admin')
def delete_review(review_id):
    """Delete a review permanently."""
    try:
        review = Review.query.get(review_id)
        if not review:
            return jsonify({'message': 'Review not found'}), 404

        db.session.delete(review)
        db.session.commit()
        return jsonify({'message': 'Review deleted successfully'}), 200

    except Exception as e:
        db.session.rollback()
        print(f"❌ Error in delete_review: {e}")
        return jsonify({'message': str(e)}), 500


# ─── ADMIN MESSAGES ──────────────────────────────────────────────

@admin_bp.route('/messages/conversations', methods=['GET'])
@jwt_required()
@role_required('admin')
def admin_get_conversations():
    """Get all conversations for admin view."""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 50, type=int)
        search = request.args.get('search')

        query = Conversation.query

        if search:
            term = f"%{search}%"
            participant_ids = db.session.query(User.id).filter(User.full_name.ilike(term))
            query = query.filter(
                or_(
                    Conversation.supplier_id.in_(participant_ids),
                    Conversation.producer_id.in_(participant_ids),
                    Conversation.transporter_id.in_(participant_ids),
                )
            )

        query = query.order_by(Conversation.created_at.desc())
        conversations, total = paginate_query(query, page, per_page)

        result = []
        for conv in conversations:
            participant = None
            for user_id in [conv.supplier_id, conv.producer_id, conv.transporter_id]:
                if user_id:
                    user = User.query.get(user_id)
                    if user:
                        participant = user
                        break

            if not participant:
                continue

            last_msg = conv.messages.order_by(Message.created_at.desc()).first()

            result.append({
                'id': conv.id,
                'participant': {
                    'id': participant.id,
                    'name': participant.full_name,
                    'email': participant.email,
                    'role': participant.role,
                },
                'last_message': last_msg.message if last_msg else None,
                'timestamp': last_msg.created_at.isoformat() if last_msg else conv.created_at.isoformat(),
                'unread_count': 0,  # Admin has no unread counts
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
        print(f"❌ Error in admin_get_conversations: {e}")
        return jsonify({'message': str(e)}), 500


@admin_bp.route('/messages/conversations/<int:conversation_id>', methods=['GET'])
@jwt_required()
@role_required('admin')
def admin_get_conversation_messages(conversation_id):
    """Get all messages for a specific conversation."""
    try:
        conv = Conversation.query.get(conversation_id)
        if not conv:
            return jsonify({'message': 'Conversation not found'}), 404

        messages = conv.messages.order_by(Message.created_at.asc()).all()

        result = []
        for msg in messages:
            sender = User.query.get(msg.sender_id)
            result.append({
                'id': msg.id,
                'sender_id': msg.sender_id,
                'sender_name': sender.full_name if sender else 'Unknown',
                'sender_role': sender.role if sender else 'unknown',
                'receiver_id': msg.receiver_id,
                'message': msg.message,
                'created_at': msg.created_at.isoformat() if msg.created_at else None,
                'is_read': msg.is_read,
            })

        return jsonify({
            'conversation_id': conv.id,
            'messages': result,
        }), 200

    except Exception as e:
        print(f"❌ Error in admin_get_conversation_messages: {e}")
        return jsonify({'message': str(e)}), 500


@admin_bp.route('/messages/send', methods=['POST'])
@jwt_required()
@role_required('admin')
def admin_send_message():
    """Admin sends a message to a user in a conversation."""
    try:
        data = request.get_json()
        if not data:
            return jsonify({'message': 'No data provided'}), 400

        conversation_id = data.get('conversation_id')
        receiver_id = data.get('receiver_id')
        message_text = data.get('message', '').strip()

        if not conversation_id or not receiver_id or not message_text:
            return jsonify({'message': 'conversation_id, receiver_id, and message are required'}), 400

        conv = Conversation.query.get(conversation_id)
        if not conv:
            return jsonify({'message': 'Conversation not found'}), 404

        receiver = User.query.get(receiver_id)
        if not receiver:
            return jsonify({'message': 'Receiver not found'}), 404

        admin_id = int(get_jwt_identity())
        admin_user = User.query.get(admin_id)
        if not admin_user or admin_user.role != 'admin':
            return jsonify({'message': 'Admin only'}), 403

        # Create message
        new_msg = Message(
            conversation_id=conversation_id,
            sender_id=admin_id,
            receiver_id=receiver_id,
            message=message_text,
            is_read=False,
        )
        db.session.add(new_msg)
        db.session.commit()

        return jsonify({
            'message': 'Message sent successfully',
            'id': new_msg.id,
        }), 201

    except Exception as e:
        db.session.rollback()
        print(f"❌ Error in admin_send_message: {e}")
        return jsonify({'message': str(e)}), 500