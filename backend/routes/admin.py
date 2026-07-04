# backend/routes/admin.py
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash
from sqlalchemy import or_, func, cast, String
from datetime import datetime, timedelta
import json
from models import (
    User,
    WasteListing,
    Payment,
    ProcessingPlant,
    Collection,
    CarbonCredit,
    Review,
    Conversation,
    Message,
    AdminSetting,
    SupportTicket,
    TicketReply,
    WasteRequest,
    TransportJob,
    Wallet,
    WalletTransaction,
    WithdrawalRequest,
    Dispute,          # <-- ADDED
    AuditLog,         # <-- ADDED
)
from database import db
from utils.decorators import role_required

admin_bp = Blueprint('admin', __name__, url_prefix='/api/admin')


# ─── HELPER: paginate ────────────────────────────────────────────
def paginate_query(query, page, per_page):
    total = query.count()
    items = query.offset((page - 1) * per_page).limit(per_page).all()
    return items, total


# ─── HELPER: log audit ──────────────────────────────────────────
def log_audit(user_id=None, event=None, description=None, status='info',
              ip_address=None, device=None, browser=None, location=None,
              request_payload=None, response_payload=None,
              previous_values=None, new_values=None, admin_id=None):
    try:
        # If no IP, get from request context if available
        if ip_address is None:
            try:
                ip_address = request.remote_addr
            except RuntimeError:
                ip_address = None
        log = AuditLog(
            user_id=user_id,
            event=event,
            description=description,
            status=status,
            ip_address=ip_address,
            device=device,
            browser=browser,
            location=location,
            request_payload=json.dumps(request_payload) if request_payload else None,
            response_payload=json.dumps(response_payload) if response_payload else None,
            previous_values=json.dumps(previous_values) if previous_values else None,
            new_values=json.dumps(new_values) if new_values else None,
            admin_id=admin_id,
        )
        db.session.add(log)
        db.session.commit()
    except Exception as e:
        print(f"Audit log error: {e}")


# ─── USER MANAGEMENT ─────────────────────────────────────────────

@admin_bp.route('/users', methods=['GET'])
@jwt_required()
@role_required('admin')
def get_users():
    """Get all users with optional filters, search, and pagination."""
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
    try:
        data = request.get_json() or {}
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
    try:
        user = User.query.get(user_id)
        if not user:
            return jsonify({'message': 'User not found'}), 404
        data = request.get_json() or {}
        allowed = ['full_name', 'business_name', 'phone', 'location', 'role', 'account_status']
        for field in allowed:
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


# ─── WASTE SOURCES / LISTINGS ────────────────────────────────────

@admin_bp.route('/waste-sources', methods=['GET'])
@jwt_required()
@role_required('admin')
def get_waste_sources():
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
    try:
        data = request.get_json() or {}
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
        return jsonify({'message': 'Waste listing created successfully', 'id': source.id}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': str(e)}), 500


@admin_bp.route('/waste-sources/<int:source_id>', methods=['PUT'])
@jwt_required()
@role_required('admin')
def update_waste_source(source_id):
    try:
        source = WasteListing.query.get(source_id)
        if not source:
            return jsonify({'message': 'Waste listing not found'}), 404
        data = request.get_json() or {}
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
    try:
        total_users = User.query.count()
        total_listings = WasteListing.query.count()
        total_payments = Payment.query.count()
        total_revenue = db.session.query(func.sum(Payment.amount)).filter(Payment.status == 'paid').scalar() or 0
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


# ─── PROCESSING PLANTS ────────────────────────────────────────────

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
        data = request.get_json() or {}
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
        data = request.get_json() or {}
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


# ─── COLLECTIONS ──────────────────────────────────────────────────

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
        data = request.get_json() or {}
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
        return jsonify({'message': str(e)}), 500


@admin_bp.route('/collections/<int:collection_id>', methods=['PUT'])
@jwt_required()
@role_required('admin')
def update_collection(collection_id):
    try:
        collection = Collection.query.get(collection_id)
        if not collection:
            return jsonify({'message': 'Collection not found'}), 404
        data = request.get_json() or {}
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
        return jsonify({'message': str(e)}), 500


# ─── PAYMENTS (ADMIN) ────────────────────────────────────────────

@admin_bp.route('/payments', methods=['GET'])
@jwt_required()
@role_required('admin')
def get_all_payments():
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        search = request.args.get('search', '')
        status = request.args.get('status')
        escrow_status = request.args.get('escrow_status')
        date_from = request.args.get('date_from')
        date_to = request.args.get('date_to')
        sort_field = request.args.get('sort_field', 'created_at')
        sort_order = request.args.get('sort_order', 'desc')

        query = Payment.query

        if search:
            term = f"%{search}%"
            user_ids = db.session.query(User.id).filter(
                or_(
                    User.full_name.ilike(term),
                    User.email.ilike(term),
                    User.business_name.ilike(term),
                    User.phone.ilike(term),
                )
            )
            query = query.filter(
                or_(
                    cast(Payment.id, String).ilike(term),
                    Payment.transaction_id.ilike(term),
                    Payment.receipt_number.ilike(term),
                    Payment.mpesa_receipt.ilike(term),
                    Payment.producer_id.in_(user_ids),
                    Payment.supplier_id.in_(user_ids),
                    Payment.transporter_id.in_(user_ids),
                )
            )

        if status and status != 'all':
            query = query.filter(Payment.status == status)

        if escrow_status and escrow_status != 'all':
            query = query.filter(Payment.escrow_status == escrow_status)

        if date_from:
            query = query.filter(Payment.created_at >= datetime.fromisoformat(date_from))

        if date_to:
            query = query.filter(Payment.created_at <= datetime.fromisoformat(date_to))

        if hasattr(Payment, sort_field):
            column = getattr(Payment, sort_field)
            query = query.order_by(column.desc() if sort_order == 'desc' else column.asc())
        else:
            query = query.order_by(Payment.created_at.desc())

        payments, total = paginate_query(query, page, per_page)

        result = []
        for p in payments:
            producer = db.session.get(User, p.producer_id)
            supplier = db.session.get(User, p.supplier_id)
            transporter = db.session.get(User, p.transporter_id) if p.transporter_id else None
            listing = db.session.get(WasteListing, p.listing_id) if p.listing_id else None

            result.append({
                'id': p.id,
                'producer_id': p.producer_id,
                'producer_name': producer.business_name or producer.full_name if producer else "N/A",
                'supplier_id': p.supplier_id,
                'supplier_name': supplier.business_name or supplier.full_name if supplier else "N/A",
                'transporter_id': p.transporter_id,
                'transporter_name': transporter.business_name or transporter.full_name if transporter else "Not assigned",
                'listing_id': p.listing_id,
                'request_id': p.request_id,
                'transport_job_id': p.transport_job_id,
                'waste_type': listing.waste_type if listing else "N/A",
                'quantity': listing.quantity if listing else 0,
                'unit': listing.unit if listing else "kg",
                'waste_amount': p.waste_amount or 0,
                'transport_fee': p.transport_fee or 0,
                'platform_fee': p.platform_fee or 0,
                'supplier_amount': p.supplier_amount or 0,
                'transporter_amount': p.transporter_amount or 0,
                'amount': p.amount or 0,
                'payment_method': p.payment_method or "mpesa",
                'mpesa_receipt': p.mpesa_receipt,
                'transaction_id': p.transaction_id,
                'receipt_number': p.receipt_number,
                'status': p.status,
                'payment_status': p.payment_status,
                'escrow_status': p.escrow_status or "waiting",
                'created_at': p.created_at.isoformat() if p.created_at else None,
                'updated_at': p.updated_at.isoformat() if p.updated_at else None,
                'completed_at': p.completed_at.isoformat() if p.completed_at else None,
            })

        return jsonify({
            "data": result,
            "pagination": {
                "page": page,
                "per_page": per_page,
                "total": total,
                "pages": (total + per_page - 1) // per_page,
            }
        }), 200

    except Exception as e:
        print("Admin payments error:", e)
        return jsonify({"message": str(e)}), 500


@admin_bp.route('/payments/escrow-stats', methods=['GET'])
@jwt_required()
@role_required('admin')
def get_escrow_stats():
    try:
        held = db.session.query(func.sum(Payment.amount)).filter(Payment.escrow_status == "held").scalar() or 0
        released = db.session.query(func.sum(Payment.amount)).filter(Payment.escrow_status == "released").scalar() or 0
        refunded = db.session.query(func.sum(Payment.amount)).filter(Payment.escrow_status == "refunded").scalar() or 0
        platform_fees = db.session.query(func.sum(Payment.platform_fee)).filter(
            Payment.status.in_(["paid", "completed", "released"])
        ).scalar() or 0

        return jsonify({
            "held": float(held),
            "released": float(released),
            "refunded": float(refunded),
            "platform_fees": float(platform_fees),
        }), 200

    except Exception as e:
        return jsonify({"message": str(e)}), 500


@admin_bp.route('/payments/activity', methods=['GET'])
@jwt_required()
@role_required('admin')
def get_payment_activity():
    try:
        payments = Payment.query.order_by(Payment.created_at.desc()).limit(10).all()
        activity = []
        for p in payments:
            producer = db.session.get(User, p.producer_id)
            activity.append({
                "event": "Payment received" if p.status in ["paid", "completed"] else "Payment pending",
                "description": f"{producer.business_name or producer.full_name if producer else 'Producer'} paid KES {p.amount}",
                "timestamp": p.created_at.isoformat() if p.created_at else None,
            })
        return jsonify(activity), 200
    except Exception:
        return jsonify([]), 200


@admin_bp.route('/payments/<int:payment_id>/release', methods=['POST'])
@jwt_required()
@role_required('admin')
def release_payment(payment_id):
    try:
        payment = db.session.get(Payment, payment_id)
        if not payment:
            return jsonify({"message": "Payment not found"}), 404

        if payment.escrow_status != "held":
            return jsonify({"message": "Payment is not held in escrow"}), 400

        if payment.status not in ["paid", "completed"]:
            return jsonify({"message": "Only paid payments can be released"}), 400

        # ─── Credit supplier wallet ──────────────────────────────
        supplier = User.query.get(payment.supplier_id)
        if supplier:
            supplier_wallet = Wallet.query.filter_by(user_id=supplier.id).first()
            if not supplier_wallet:
                supplier_wallet = Wallet(user_id=supplier.id, balance=0.0)
                db.session.add(supplier_wallet)

            amount_to_supplier = payment.supplier_amount or payment.waste_amount or 0
            if amount_to_supplier > 0:
                supplier_wallet.balance += amount_to_supplier
                tx_supplier = WalletTransaction(
                    wallet_id=supplier_wallet.id,
                    amount=amount_to_supplier,
                    type='payment_release',
                    description=f'Payment #{payment.id} released – waste payment',
                    status='completed'
                )
                db.session.add(tx_supplier)

        # ─── Credit transporter wallet ────────────────────────────
        if payment.transporter_id and payment.transporter_amount and payment.transporter_amount > 0:
            transporter = User.query.get(payment.transporter_id)
            if transporter:
                transporter_wallet = Wallet.query.filter_by(user_id=transporter.id).first()
                if not transporter_wallet:
                    transporter_wallet = Wallet(user_id=transporter.id, balance=0.0)
                    db.session.add(transporter_wallet)

                transporter_wallet.balance += payment.transporter_amount
                tx_transporter = WalletTransaction(
                    wallet_id=transporter_wallet.id,
                    amount=payment.transporter_amount,
                    type='payment_release',
                    description=f'Payment #{payment.id} released – transport fee',
                    status='completed'
                )
                db.session.add(tx_transporter)

        # ─── Update payment status ────────────────────────────────
        payment.escrow_status = "released"
        payment.status = "released"
        payment.payment_status = "released"
        payment.updated_at = datetime.utcnow()
        payment.completed_at = datetime.utcnow()

        db.session.commit()

        # ─── Log the action ────────────────────────────────────────
        admin_id = int(get_jwt_identity())
        admin_user = db.session.get(User, admin_id)
        log_audit(
            user_id=admin_id,
            event='payment_released',
            description=f'Admin {admin_user.full_name} released payment #{payment.id}',
            status='success',
            admin_id=admin_id
        )

        return jsonify({
            "message": "Payment released successfully – wallets credited.",
            "payment": payment.to_dict(),
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"message": str(e)}), 500


@admin_bp.route('/payments/<int:payment_id>/refund', methods=['POST'])
@jwt_required()
@role_required('admin')
def refund_payment(payment_id):
    try:
        payment = db.session.get(Payment, payment_id)
        if not payment:
            return jsonify({"message": "Payment not found"}), 404

        if payment.escrow_status != "held":
            return jsonify({"message": "Only held escrow payments can be refunded"}), 400

        payment.escrow_status = "refunded"
        payment.status = "refunded"
        payment.payment_status = "refunded"
        payment.updated_at = datetime.utcnow()
        db.session.commit()

        # ─── Log the action ────────────────────────────────────────
        admin_id = int(get_jwt_identity())
        admin_user = db.session.get(User, admin_id)
        log_audit(
            user_id=admin_id,
            event='payment_refunded',
            description=f'Admin {admin_user.full_name} refunded payment #{payment.id}',
            status='success',
            admin_id=admin_id
        )

        return jsonify({
            "message": "Payment refunded successfully",
            "payment": payment.to_dict(),
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"message": str(e)}), 500


@admin_bp.route('/payments/<int:payment_id>/receipt', methods=['GET'])
@jwt_required()
@role_required('admin')
def download_receipt(payment_id):
    payment = db.session.get(Payment, payment_id)
    if not payment:
        return jsonify({"message": "Payment not found"}), 404

    return jsonify({
        "receipt_number": payment.receipt_number,
        "mpesa_receipt": payment.mpesa_receipt,
        "amount": payment.amount,
        "status": payment.status,
        "escrow_status": payment.escrow_status,
        "created_at": payment.created_at.isoformat() if payment.created_at else None,
    }), 200


@admin_bp.route('/payments/<int:payment_id>/invoice', methods=['GET'])
@jwt_required()
@role_required('admin')
def download_invoice(payment_id):
    payment = db.session.get(Payment, payment_id)
    if not payment:
        return jsonify({"message": "Payment not found"}), 404

    producer = db.session.get(User, payment.producer_id)
    supplier = db.session.get(User, payment.supplier_id)

    return jsonify({
        "invoice_number": payment.receipt_number or f"INV-{payment.id}",
        "producer": producer.business_name or producer.full_name if producer else "N/A",
        "supplier": supplier.business_name or supplier.full_name if supplier else "N/A",
        "amount": payment.amount,
        "platform_fee": payment.platform_fee,
        "transport_fee": payment.transport_fee,
        "status": payment.status,
        "created_at": payment.created_at.isoformat() if payment.created_at else None,
    }), 200


# ─── ANALYTICS ───────────────────────────────────────────────────

@admin_bp.route('/analytics', methods=['GET'])
@jwt_required()
@role_required('admin')
def get_analytics():
    try:
        range_param = request.args.get('range', '30days')
        days = int(range_param.replace('days', ''))
        cutoff = datetime.utcnow() - timedelta(days=days)

        total_users = User.query.count()
        total_listings = WasteListing.query.count()
        total_collections = Collection.query.count()
        total_revenue = db.session.query(func.sum(Payment.amount)).filter(
            Payment.status.in_(['completed', 'paid'])
        ).scalar() or 0

        # Revenue trend
        revenue_by_day = db.session.query(
            func.date(Payment.created_at).label('date'),
            func.sum(Payment.amount).label('amount')
        ).filter(
            Payment.created_at >= cutoff,
            Payment.status.in_(['completed', 'paid'])
        ).group_by(func.date(Payment.created_at)).order_by('date').all()

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
                revenue_trend_data.append({'date': current_date.isoformat(), 'amount': 0})
            current_date += timedelta(days=1)

        # User growth
        users_by_day = db.session.query(
            func.date(User.created_at).label('date'),
            func.count(User.id).label('count')
        ).filter(User.created_at >= cutoff).group_by(func.date(User.created_at)).order_by('date').all()

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
            user_growth_data.append({'date': current_date.isoformat(), 'count': cumulative})
            current_date += timedelta(days=1)

        # Waste by category
        waste_categories = db.session.query(
            WasteListing.category,
            func.sum(WasteListing.quantity).label('total')
        ).filter(WasteListing.category.isnot(None)).group_by(WasteListing.category).all()
        waste_by_category = [{'name': c.category or 'Other', 'value': float(c.total)} for c in waste_categories]
        if not waste_by_category:
            waste_by_category = [{'name': 'No Data', 'value': 1}]

        # Payment status distribution
        status_counts = db.session.query(
            Payment.status,
            func.count(Payment.id).label('count')
        ).group_by(Payment.status).all()
        payment_status = [{'name': s.status or 'Unknown', 'value': s.count} for s in status_counts]
        if not payment_status:
            payment_status = [{'name': 'No Data', 'value': 1}]

        # Recent activity
        recent_payments = Payment.query.order_by(Payment.created_at.desc()).limit(10).all()
        recent_activity = []
        for p in recent_payments:
            payer = User.query.get(p.payer_id)
            recent_activity.append({
                'event': 'payment',
                'user_name': payer.full_name if payer else 'Unknown',
                'details': f'Payment of {p.amount} KES',
                'created_at': p.created_at.isoformat() if p.created_at else None,
            })
        recent_listings = WasteListing.query.order_by(WasteListing.created_at.desc()).limit(5).all()
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

        # Trends
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
    try:
        range_param = request.args.get('range', '30days')
        days = int(range_param.replace('days', ''))
        cutoff = datetime.utcnow() - timedelta(days=days)

        total_collections = Collection.query.count()
        total_waste = db.session.query(func.sum(Collection.quantity)).scalar() or 0
        total_energy = db.session.query(func.sum(Collection.energy_generated)).scalar() or 0
        total_carbon = db.session.query(func.sum(Collection.carbon_offset)).scalar() or 0

        # Energy trend
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
                    energy_trend.append({'date': current_date.isoformat(), 'value': float(r.value) if r.value else 0})
                    found = True
                    break
            if not found:
                energy_trend.append({'date': current_date.isoformat(), 'value': 0})
            current_date += timedelta(days=1)

        # Carbon trend
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
                    carbon_trend.append({'date': current_date.isoformat(), 'value': float(r.value) if r.value else 0})
                    found = True
                    break
            if not found:
                carbon_trend.append({'date': current_date.isoformat(), 'value': 0})
            current_date += timedelta(days=1)

        # Waste by type
        waste_types = db.session.query(
            Collection.waste_type,
            func.sum(Collection.quantity).label('total')
        ).filter(Collection.waste_type.isnot(None)).group_by(Collection.waste_type).all()
        waste_by_type = [{'name': w.waste_type or 'Other', 'value': float(w.total)} for w in waste_types]
        if not waste_by_type:
            waste_by_type = [{'name': 'No Data', 'value': 1}]

        # Recent activity
        recent_collections = Collection.query.order_by(Collection.created_at.desc()).limit(15).all()
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
        data = request.get_json() or {}
        required = ['project_name', 'amount']
        for field in required:
            if not data.get(field):
                return jsonify({'message': f'{field} is required'}), 400
        import random, string
        serial = ''.join(random.choices(string.ascii_uppercase + string.digits, k=12))
        credit = CarbonCredit(
            project_name=data['project_name'],
            amount=float(data['amount']),
            status=data.get('status', 'issued'),
            serial_number=serial,
            description=data.get('description', ''),
            expiry_date=datetime.utcnow() + timedelta(days=365)
        )
        db.session.add(credit)
        db.session.commit()
        return jsonify({'message': 'Carbon credit created successfully', 'id': credit.id}), 201
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
        data = request.get_json() or {}
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
    try:
        review = Review.query.get(review_id)
        if not review:
            return jsonify({'message': 'Review not found'}), 404
        data = request.get_json() or {}
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
                'unread_count': 0,
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
    try:
        data = request.get_json() or {}
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
        new_msg = Message(
            conversation_id=conversation_id,
            sender_id=admin_id,
            receiver_id=receiver_id,
            message=message_text,
            is_read=False,
        )
        db.session.add(new_msg)
        db.session.commit()
        return jsonify({'message': 'Message sent successfully', 'id': new_msg.id}), 201
    except Exception as e:
        db.session.rollback()
        print(f"❌ Error in admin_send_message: {e}")
        return jsonify({'message': str(e)}), 500


# ─── ADMIN SETTINGS ──────────────────────────────────────────────

@admin_bp.route('/settings', methods=['GET'])
@jwt_required()
@role_required('admin')
def get_settings():
    try:
        settings = AdminSetting.query.all()
        result = {s.key: s.value for s in settings}
        return jsonify(result), 200
    except Exception as e:
        print(f"❌ Error in get_settings: {e}")
        return jsonify({'message': str(e)}), 500


@admin_bp.route('/settings', methods=['PUT'])
@jwt_required()
@role_required('admin')
def update_settings():
    try:
        data = request.get_json() or {}
        admin_id = int(get_jwt_identity())
        admin_user = db.session.get(User, admin_id)

        # Get old values for audit log
        old_settings = {}
        for key in data.keys():
            setting = AdminSetting.query.filter_by(key=key).first()
            if setting:
                old_settings[key] = setting.value

        # Update or create settings
        for key, value in data.items():
            setting = AdminSetting.query.filter_by(key=key).first()
            if setting:
                setting.value = str(value) if value is not None else ''
            else:
                setting = AdminSetting(key=key, value=str(value) if value is not None else '')
                db.session.add(setting)

        db.session.commit()

        # ─── Log changes ──────────────────────────────────────────
        log_audit(
            user_id=admin_id,
            event='settings_updated',
            description=f'Admin {admin_user.full_name} updated platform settings',
            status='success',
            admin_id=admin_id,
            previous_values=old_settings,
            new_values=data
        )

        return jsonify({'message': 'Settings updated successfully'}), 200
    except Exception as e:
        db.session.rollback()
        print(f"❌ Error in update_settings: {e}")
        return jsonify({'message': str(e)}), 500


# ─── ADMIN SUPPORT ───────────────────────────────────────────────

@admin_bp.route('/support/tickets', methods=['GET'])
@jwt_required()
@role_required('admin')
def admin_get_tickets():
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 50, type=int)
        search = request.args.get('search')
        status = request.args.get('status')
        query = SupportTicket.query
        if search:
            term = f"%{search}%"
            query = query.filter(
                or_(
                    SupportTicket.subject.ilike(term),
                    SupportTicket.message.ilike(term),
                    SupportTicket.name.ilike(term),
                    SupportTicket.email.ilike(term),
                )
            )
        if status:
            query = query.filter(SupportTicket.status == status)
        query = query.order_by(SupportTicket.created_at.desc())
        tickets, total = paginate_query(query, page, per_page)

        result = []
        for ticket in tickets:
            ticket_dict = ticket.to_dict()
            replies = TicketReply.query.filter_by(ticket_id=ticket.id).order_by(TicketReply.created_at.asc()).all()
            ticket_dict['replies'] = [r.to_dict() for r in replies]
            result.append(ticket_dict)
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
        print(f"❌ Error in admin_get_tickets: {e}")
        return jsonify({'message': str(e)}), 500


@admin_bp.route('/support/tickets/<int:ticket_id>/status', methods=['PATCH'])
@jwt_required()
@role_required('admin')
def admin_update_ticket_status(ticket_id):
    try:
        ticket = SupportTicket.query.get(ticket_id)
        if not ticket:
            return jsonify({'message': 'Ticket not found'}), 404
        data = request.get_json() or {}
        new_status = data.get('status')
        if new_status not in ['open', 'in_progress', 'resolved', 'closed']:
            return jsonify({'message': 'Invalid status'}), 400
        ticket.status = new_status
        db.session.commit()
        return jsonify({'message': f'Status updated to {new_status}'}), 200
    except Exception as e:
        db.session.rollback()
        print(f"❌ Error in admin_update_ticket_status: {e}")
        return jsonify({'message': str(e)}), 500


@admin_bp.route('/support/tickets/<int:ticket_id>/reply', methods=['POST'])
@jwt_required()
@role_required('admin')
def admin_reply_ticket(ticket_id):
    try:
        ticket = SupportTicket.query.get(ticket_id)
        if not ticket:
            return jsonify({'message': 'Ticket not found'}), 404
        data = request.get_json() or {}
        reply = data.get('reply', '').strip()
        if not reply:
            return jsonify({'message': 'Reply message is required'}), 400
        admin_id = int(get_jwt_identity())
        admin_user = User.query.get(admin_id)
        if not admin_user or admin_user.role != 'admin':
            return jsonify({'message': 'Admin only'}), 403
        new_reply = TicketReply(
            ticket_id=ticket_id,
            sender_id=admin_id,
            message=reply
        )
        db.session.add(new_reply)
        if ticket.status == 'open':
            ticket.status = 'in_progress'
        db.session.commit()
        return jsonify({
            'message': 'Reply sent successfully',
            'reply': new_reply.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        print(f"❌ Error in admin_reply_ticket: {e}")
        return jsonify({'message': str(e)}), 500


@admin_bp.route('/support/tickets/<int:ticket_id>', methods=['DELETE'])
@jwt_required()
@role_required('admin')
def admin_delete_ticket(ticket_id):
    try:
        ticket = SupportTicket.query.get(ticket_id)
        if not ticket:
            return jsonify({'message': 'Ticket not found'}), 404
        db.session.delete(ticket)
        db.session.commit()
        return jsonify({'message': 'Ticket deleted successfully'}), 200
    except Exception as e:
        db.session.rollback()
        print(f"❌ Error in admin_delete_ticket: {e}")
        return jsonify({'message': str(e)}), 500


# ─── WALLET MANAGEMENT ──────────────────────────────────────────

@admin_bp.route('/wallets', methods=['GET'])
@jwt_required()
@role_required('admin')
def get_all_wallets():
    """Get all user wallets (suppliers & transporters)."""
    try:
        users = User.query.filter(User.role.in_(['supplier', 'transporter'])).all()
        result = []
        for u in users:
            wallet = Wallet.query.filter_by(user_id=u.id).first()
            if not wallet:
                wallet = Wallet(user_id=u.id, balance=0.0)
                db.session.add(wallet)
                db.session.commit()
            result.append({
                'user_id': u.id,
                'user_name': u.full_name,
                'business_name': u.business_name,
                'email': u.email,
                'role': u.role,
                'balance': wallet.balance,
            })
        return jsonify({'data': result}), 200
    except Exception as e:
        return jsonify({'message': str(e)}), 500


@admin_bp.route('/wallets/<int:user_id>/transactions', methods=['GET'])
@jwt_required()
@role_required('admin')
def get_wallet_transactions(user_id):
    try:
        wallet = Wallet.query.filter_by(user_id=user_id).first()
        if not wallet:
            return jsonify([]), 200
        transactions = WalletTransaction.query.filter_by(wallet_id=wallet.id).order_by(
            WalletTransaction.created_at.desc()
        ).all()
        return jsonify([t.to_dict() for t in transactions]), 200
    except Exception as e:
        return jsonify({'message': str(e)}), 500


# ─── WITHDRAWAL REQUESTS ─────────────────────────────────────────

@admin_bp.route('/withdrawals', methods=['GET'])
@jwt_required()
@role_required('admin')
def get_withdrawal_requests():
    try:
        requests = WithdrawalRequest.query.order_by(WithdrawalRequest.created_at.desc()).all()
        result = []
        for r in requests:
            user = User.query.get(r.user_id)
            result.append({
                'id': r.id,
                'user_id': r.user_id,
                'user_name': user.full_name if user else 'Unknown',
                'business_name': user.business_name if user else '',
                'email': user.email if user else '',
                'amount': r.amount,
                'payment_method': r.payment_method,
                'account_details': r.account_details,
                'status': r.status,
                'created_at': r.created_at.isoformat() if r.created_at else None,
                'updated_at': r.updated_at.isoformat() if r.updated_at else None,
                'admin_notes': r.admin_notes,
            })
        return jsonify({'data': result}), 200
    except Exception as e:
        return jsonify({'message': str(e)}), 500


@admin_bp.route('/withdrawals/<int:withdrawal_id>/approve', methods=['POST'])
@jwt_required()
@role_required('admin')
def approve_withdrawal(withdrawal_id):
    """Approve a withdrawal request: deduct from wallet, mark as approved."""
    try:
        req = WithdrawalRequest.query.get(withdrawal_id)
        if not req:
            return jsonify({'message': 'Withdrawal request not found'}), 404
        if req.status != 'pending':
            return jsonify({'message': 'Withdrawal is not pending'}), 400

        wallet = Wallet.query.filter_by(user_id=req.user_id).first()
        if not wallet:
            return jsonify({'message': 'User wallet not found'}), 404
        if wallet.balance < req.amount:
            return jsonify({'message': 'Insufficient balance'}), 400

        # Deduct from wallet
        wallet.balance -= req.amount
        wallet.updated_at = datetime.utcnow()

        # Create transaction
        tx = WalletTransaction(
            wallet_id=wallet.id,
            amount=-req.amount,
            type='withdrawal',
            description=f'Withdrawal request #{req.id} approved',
            status='completed'
        )
        db.session.add(tx)

        req.status = 'approved'
        req.updated_at = datetime.utcnow()
        db.session.commit()

        # ─── Log the action ────────────────────────────────────────
        admin_id = int(get_jwt_identity())
        admin_user = db.session.get(User, admin_id)
        log_audit(
            user_id=req.user_id,
            event='withdrawal_approved',
            description=f'Admin {admin_user.full_name} approved withdrawal #{req.id}',
            status='success',
            admin_id=admin_id
        )

        return jsonify({'message': 'Withdrawal approved successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': str(e)}), 500


@admin_bp.route('/withdrawals/<int:withdrawal_id>/reject', methods=['POST'])
@jwt_required()
@role_required('admin')
def reject_withdrawal(withdrawal_id):
    """Reject a withdrawal request: mark as rejected."""
    try:
        req = WithdrawalRequest.query.get(withdrawal_id)
        if not req:
            return jsonify({'message': 'Withdrawal request not found'}), 404
        if req.status != 'pending':
            return jsonify({'message': 'Withdrawal is not pending'}), 400

        req.status = 'rejected'
        req.updated_at = datetime.utcnow()
        db.session.commit()

        # ─── Log the action ────────────────────────────────────────
        admin_id = int(get_jwt_identity())
        admin_user = db.session.get(User, admin_id)
        log_audit(
            user_id=req.user_id,
            event='withdrawal_rejected',
            description=f'Admin {admin_user.full_name} rejected withdrawal #{req.id}',
            status='success',
            admin_id=admin_id
        )

        return jsonify({'message': 'Withdrawal rejected'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': str(e)}), 500


@admin_bp.route('/withdrawals/<int:withdrawal_id>/complete', methods=['POST'])
@jwt_required()
@role_required('admin')
def complete_withdrawal(withdrawal_id):
    """Mark a withdrawal as completed (money sent)."""
    try:
        req = WithdrawalRequest.query.get(withdrawal_id)
        if not req:
            return jsonify({'message': 'Withdrawal request not found'}), 404
        if req.status != 'approved':
            return jsonify({'message': 'Withdrawal must be approved first'}), 400

        req.status = 'completed'
        req.updated_at = datetime.utcnow()
        db.session.commit()

        # ─── Log the action ────────────────────────────────────────
        admin_id = int(get_jwt_identity())
        admin_user = db.session.get(User, admin_id)
        log_audit(
            user_id=req.user_id,
            event='withdrawal_completed',
            description=f'Admin {admin_user.full_name} completed withdrawal #{req.id}',
            status='success',
            admin_id=admin_id
        )

        return jsonify({'message': 'Withdrawal marked as completed'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': str(e)}), 500


# ─── DISPUTES ─────────────────────────────────────────────────────

@admin_bp.route('/disputes/stats', methods=['GET'])
@jwt_required()
@role_required('admin')
def get_dispute_stats():
    try:
        total = Dispute.query.count()
        open_ = Dispute.query.filter_by(status='open').count()
        under_investigation = Dispute.query.filter_by(status='under_investigation').count()
        awaiting_response = Dispute.query.filter_by(status='awaiting_response').count()
        resolved = Dispute.query.filter_by(status='resolved').count()
        closed = Dispute.query.filter_by(status='closed').count()
        refunded = Dispute.query.filter_by(status='refunded').count()
        frozen_escrow = Dispute.query.filter_by(escrow_status='frozen').count()

        return jsonify({
            'total': total,
            'open': open_,
            'under_investigation': under_investigation,
            'awaiting_response': awaiting_response,
            'resolved': resolved,
            'closed': closed,
            'refunded': refunded,
            'frozen_escrow': frozen_escrow,
        }), 200
    except Exception as e:
        return jsonify({'message': str(e)}), 500


@admin_bp.route('/disputes', methods=['GET'])
@jwt_required()
@role_required('admin')
def get_disputes():
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        search = request.args.get('search', '')
        status = request.args.get('status')

        query = Dispute.query
        if search:
            term = f"%{search}%"
            producer_ids = db.session.query(User.id).filter(User.full_name.ilike(term) | User.email.ilike(term))
            supplier_ids = db.session.query(User.id).filter(User.full_name.ilike(term) | User.email.ilike(term))
            transporter_ids = db.session.query(User.id).filter(User.full_name.ilike(term) | User.email.ilike(term))
            query = query.filter(
                or_(
                    cast(Dispute.id, String).ilike(term),
                    cast(Dispute.payment_id, String).ilike(term),
                    Dispute.producer_id.in_(producer_ids),
                    Dispute.supplier_id.in_(supplier_ids),
                    Dispute.transporter_id.in_(transporter_ids),
                )
            )
        if status and status != 'all':
            query = query.filter(Dispute.status == status)

        query = query.order_by(Dispute.created_at.desc())
        disputes, total = paginate_query(query, page, per_page)

        result = []
        for d in disputes:
            payment = db.session.get(Payment, d.payment_id)
            producer = db.session.get(User, d.producer_id)
            supplier = db.session.get(User, d.supplier_id)
            transporter = db.session.get(User, d.transporter_id) if d.transporter_id else None
            result.append({
                'id': d.id,
                'payment_id': d.payment_id,
                'producer_name': producer.full_name if producer else None,
                'supplier_name': supplier.full_name if supplier else None,
                'transporter_name': transporter.full_name if transporter else None,
                'waste_type': payment.waste_type if payment else None,
                'reason': d.reason,
                'status': d.status,
                'escrow_status': d.escrow_status,
                'created_at': d.created_at.isoformat() if d.created_at else None,
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
        return jsonify({'message': str(e)}), 500


@admin_bp.route('/disputes/<int:dispute_id>/action', methods=['POST'])
@jwt_required()
@role_required('admin')
def dispute_action(dispute_id):
    try:
        dispute = db.session.get(Dispute, dispute_id)
        if not dispute:
            return jsonify({'message': 'Dispute not found'}), 404

        data = request.get_json() or {}
        action = data.get('action')
        if not action:
            return jsonify({'message': 'Action is required'}), 400

        admin_id = int(get_jwt_identity())
        admin_user = db.session.get(User, admin_id)
        if not admin_user or admin_user.role != 'admin':
            return jsonify({'message': 'Admin only'}), 403

        # Map actions to status changes
        status_map = {
            'request_more_info': 'awaiting_response',
            'freeze_escrow': 'under_investigation',
            'release_escrow': 'open',
            'refund_producer': 'refunded',
            'reject': 'closed',
            'resolve': 'resolved',
            'close': 'closed',
        }

        escrow_map = {
            'freeze_escrow': 'frozen',
            'release_escrow': 'released',
            'refund_producer': 'refunded',
            'resolve': 'released',
        }

        if action in status_map:
            dispute.status = status_map[action]

        if action in escrow_map:
            dispute.escrow_status = escrow_map[action]
            if action == 'refund_producer':
                payment = db.session.get(Payment, dispute.payment_id)
                if payment:
                    payment.status = 'refunded'
                    payment.escrow_status = 'refunded'

        # Add to timeline
        timeline = json.loads(dispute.timeline) if dispute.timeline else []
        timeline.append({
            'description': f'Admin {admin_user.full_name} performed "{action}" on dispute #{dispute.id}',
            'timestamp': datetime.utcnow().isoformat()
        })
        dispute.timeline = json.dumps(timeline)
        dispute.updated_at = datetime.utcnow()

        db.session.commit()

        # ─── Log the action ────────────────────────────────────────
        log_audit(
            user_id=admin_id,
            event='dispute_action',
            description=f'Admin {admin_user.full_name} performed {action} on dispute #{dispute.id}',
            status='success',
            admin_id=admin_id
        )

        return jsonify({'message': f'Action "{action}" completed successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': str(e)}), 500


# ─── SETTINGS HISTORY ────────────────────────────────────────────

@admin_bp.route('/settings/history', methods=['GET'])
@jwt_required()
@role_required('admin')
def get_settings_history():
    try:
        logs = AuditLog.query.filter(
            AuditLog.event == 'settings_updated'
        ).order_by(AuditLog.created_at.desc()).limit(50).all()

        result = []
        for log in logs:
            prev = json.loads(log.previous_values) if log.previous_values else {}
            new = json.loads(log.new_values) if log.new_values else {}
            result.append({
                'user_name': log.user.full_name if log.user else 'System',
                'field': 'Multiple' if len(prev) > 1 else list(prev.keys())[0] if prev else 'N/A',
                'old_value': ', '.join([f'{k}: {v}' for k, v in prev.items()]),
                'new_value': ', '.join([f'{k}: {v}' for k, v in new.items()]),
                'created_at': log.created_at.isoformat() if log.created_at else None,
            })
        return jsonify(result), 200
    except Exception as e:
        return jsonify({'message': str(e)}), 500


# ─── AUDIT LOGS ───────────────────────────────────────────────────

@admin_bp.route('/audit-logs/stats', methods=['GET'])
@jwt_required()
@role_required('admin')
def get_audit_stats():
    try:
        total = AuditLog.query.count()
        login_events = AuditLog.query.filter(AuditLog.event.like('%login%')).count()
        payment_actions = AuditLog.query.filter(AuditLog.event.like('payment%')).count()
        user_actions = AuditLog.query.filter(AuditLog.event.like('user%')).count()
        admin_actions = AuditLog.query.filter(AuditLog.event.like('admin%')).count()
        security_events = AuditLog.query.filter(
            AuditLog.event.in_(['failed_login', 'unauthorized_access', 'suspicious_activity'])
        ).count()

        return jsonify({
            'total': total,
            'login_events': login_events,
            'payment_actions': payment_actions,
            'user_actions': user_actions,
            'admin_actions': admin_actions,
            'security_events': security_events,
        }), 200
    except Exception as e:
        return jsonify({'message': str(e)}), 500


@admin_bp.route('/audit-logs', methods=['GET'])
@jwt_required()
@role_required('admin')
def get_audit_logs():
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        search = request.args.get('search', '')
        event_type = request.args.get('event_type')
        date_from = request.args.get('date_from')
        date_to = request.args.get('date_to')

        query = AuditLog.query

        if search:
            term = f"%{search}%"
            query = query.filter(
                or_(
                    AuditLog.description.ilike(term),
                    AuditLog.ip_address.ilike(term),
                    AuditLog.user_id.in_(db.session.query(User.id).filter(User.full_name.ilike(term) | User.email.ilike(term))),
                )
            )

        if event_type and event_type != 'all':
            query = query.filter(AuditLog.event == event_type)

        if date_from:
            query = query.filter(AuditLog.created_at >= datetime.fromisoformat(date_from))
        if date_to:
            query = query.filter(AuditLog.created_at <= datetime.fromisoformat(date_to))

        query = query.order_by(AuditLog.created_at.desc())
        logs, total = paginate_query(query, page, per_page)

        return jsonify({
            'data': [log.to_dict() for log in logs],
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': total,
                'pages': (total + per_page - 1) // per_page
            }
        }), 200
    except Exception as e:
        return jsonify({'message': str(e)}), 500