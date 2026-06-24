from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from utils.decorators import role_required
from models import User, WasteListing, WasteRequest, TransportJob, Notification
from database import db

producer_bp = Blueprint('producer', __name__)


# ─── PRODUCER DASHBOARD ──────────────────────────────────────
@producer_bp.route('/producer/dashboard', methods=['GET'])
@jwt_required()
@role_required('producer', 'energy-producer')
def producer_dashboard():
    user_id = get_jwt_identity()

    # Counts
    available_waste_count = WasteListing.query.filter_by(status='available').count()
    my_requests_count = WasteRequest.query.filter_by(producer_id=user_id).count()
    incoming_deliveries_count = TransportJob.query.filter_by(producer_id=user_id).filter(
        TransportJob.status.in_(['open', 'accepted', 'picked_up', 'in_transit'])
    ).count()
    completed_transactions_count = TransportJob.query.filter_by(producer_id=user_id, status='completed').count()

    # Recent data
    available_waste = WasteListing.query.filter_by(status='available').order_by(WasteListing.created_at.desc()).limit(5).all()
    recent_requests = WasteRequest.query.filter_by(producer_id=user_id).order_by(WasteRequest.created_at.desc()).limit(5).all()
    incoming_deliveries = TransportJob.query.filter_by(producer_id=user_id).filter(
        TransportJob.status.in_(['open', 'accepted', 'picked_up', 'in_transit'])
    ).order_by(TransportJob.created_at.desc()).limit(5).all()
    notifications = Notification.query.filter_by(user_id=user_id, is_read=False).order_by(Notification.created_at.desc()).limit(5).all()

    return jsonify({
        'available_waste_count': available_waste_count,
        'my_requests_count': my_requests_count,
        'incoming_deliveries_count': incoming_deliveries_count,
        'completed_transactions_count': completed_transactions_count,
        'available_waste': [{
            'id': w.id,
            'waste_type': w.waste_type,
            'quantity': w.quantity,
            'unit': w.unit,
            'location': w.location,
            'supplier_name': w.supplier.full_name,
        } for w in available_waste],
        'recent_requests': [{
            'id': r.id,
            'waste_type': r.listing.waste_type,
            'supplier_name': r.supplier.full_name,
            'status': r.status,
            'created_at': r.created_at.isoformat()
        } for r in recent_requests],
        'incoming_deliveries': [{
            'id': j.id,
            'waste_type': j.waste_type,
            'quantity': j.quantity,
            'supplier_name': j.supplier.full_name,
            'status': j.status,
            'created_at': j.created_at.isoformat()
        } for j in incoming_deliveries],
        'notifications': [{
            'id': n.id,
            'title': n.title,
            'message': n.message,
            'created_at': n.created_at.isoformat()
        } for n in notifications]
    }), 200


# ─── GET AVAILABLE WASTE LISTINGS ──────────────────────────
@producer_bp.route('/producer/available-waste', methods=['GET'])
@jwt_required()
@role_required('producer', 'energy-producer')
def get_available_waste():
    listings = WasteListing.query.filter_by(status='available').order_by(WasteListing.created_at.desc()).all()
    return jsonify([{
        'id': l.id,
        'waste_type': l.waste_type,
        'quantity': l.quantity,
        'unit': l.unit,
        'location': l.location,
        'supplier_name': l.supplier.full_name,
        'status': l.status,
        'created_at': l.created_at.isoformat()
    } for l in listings]), 200


# ─── REQUEST WASTE ──────────────────────────────────────────
@producer_bp.route('/producer/request-waste/<int:listing_id>', methods=['POST'])
@jwt_required()
@role_required('producer', 'energy-producer')
def request_waste(listing_id):
    user_id = get_jwt_identity()
    listing = WasteListing.query.get_or_404(listing_id)

    if listing.status != 'available':
        return jsonify({'message': 'This waste is no longer available'}), 400

    # Check for existing pending request
    existing = WasteRequest.query.filter_by(listing_id=listing_id, producer_id=user_id, status='pending').first()
    if existing:
        return jsonify({'message': 'You already have a pending request for this listing'}), 409

    data = request.get_json() or {}
    req = WasteRequest(
        producer_id=user_id,
        listing_id=listing_id,
        supplier_id=listing.supplier_id,
        status='pending',
        message=data.get('message', '')
    )
    db.session.add(req)

    # Notify supplier
    notify = Notification(
        user_id=listing.supplier_id,
        title='New Waste Request',
        message=f'An energy producer has requested your {listing.waste_type}.',
        type='new_request'
    )
    db.session.add(notify)
    db.session.commit()

    return jsonify({'message': 'Request sent successfully', 'request_id': req.id}), 201


# ─── GET MY REQUESTS (SAFE & EXPLICIT) ──────────────────────
@producer_bp.route('/producer/requests', methods=['GET'])
@jwt_required()
@role_required('producer', 'energy-producer')
def get_my_requests():
    try:
        user_id = get_jwt_identity()
        requests = WasteRequest.query.filter_by(producer_id=user_id).order_by(WasteRequest.created_at.desc()).all()
        result = []
        for r in requests:
            # Fetch the listing and supplier explicitly to avoid lazy loading issues
            listing = db.session.get(WasteListing, r.listing_id)
            supplier = db.session.get(User, r.supplier_id)

            result.append({
                'id': r.id,
                'listing_id': r.listing_id,
                'waste_type': listing.waste_type if listing else 'Unknown',
                'quantity': listing.quantity if listing else 0,
                'unit': listing.unit if listing else 'kg',
                'supplier_name': supplier.full_name if supplier else 'Unknown',
                'supplier_location': supplier.location if supplier else '',
                'status': r.status,
                'message': r.message,
                'created_at': r.created_at.isoformat()
            })
        return jsonify(result), 200
    except Exception as e:
        # Log the error and also print to console
        current_app.logger.error(f"Error in get_my_requests: {e}", exc_info=True)
        print(f"❌ Error in /producer/requests: {e}")  # This will show in terminal
        return jsonify({'message': 'Internal server error'}), 500


# ─── CANCEL REQUEST ──────────────────────────────────────────
@producer_bp.route('/producer/requests/<int:request_id>/cancel', methods=['PATCH'])
@jwt_required()
@role_required('producer', 'energy-producer')
def cancel_request(request_id):
    try:
        user_id = get_jwt_identity()
        req = WasteRequest.query.get_or_404(request_id)
        if req.producer_id != user_id:
            return jsonify({'message': 'Unauthorized'}), 403
        if req.status not in ['pending', 'approved']:
            return jsonify({'message': 'Cannot cancel request in its current state'}), 400
        req.status = 'cancelled'
        db.session.commit()
        return jsonify({'message': 'Request cancelled'}), 200
    except Exception as e:
        current_app.logger.error(f"Error in cancel_request: {e}", exc_info=True)
        return jsonify({'message': 'Internal server error'}), 500
        # ─── INCOMING DELIVERIES ─────────────────────────────────────
@producer_bp.route('/producer/incoming-deliveries', methods=['GET'])
@jwt_required()
@role_required('producer', 'energy-producer')
def get_incoming_deliveries():
    try:
        user_id = get_jwt_identity()
        # Get all transport jobs where the producer is the producer_id
        deliveries = TransportJob.query.filter_by(producer_id=user_id).order_by(TransportJob.created_at.desc()).all()
        result = []
        for j in deliveries:
            supplier = db.session.get(User, j.supplier_id)
            transporter = db.session.get(User, j.transporter_id)
            result.append({
                'id': j.id,
                'waste_type': j.waste_type,
                'quantity': j.quantity,
                'pickup_location': j.pickup_location,
                'delivery_location': j.delivery_location,
                'status': j.status,
                'supplier_name': supplier.full_name if supplier else 'Unknown',
                'transporter_name': transporter.full_name if transporter else 'Not assigned',
                'created_at': j.created_at.isoformat()
            })
        return jsonify(result), 200
    except Exception as e:
        current_app.logger.error(f"Error in get_incoming_deliveries: {e}", exc_info=True)
        return jsonify({'message': 'Internal server error'}), 500