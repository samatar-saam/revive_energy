from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from database import db
from models import User, WasteListing, WasteRequest, TransportJob, Notification
from utils.decorators import role_required
from datetime import datetime
import logging

# Set up logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

supplier_bp = Blueprint('supplier', __name__)

# =============================================================
# DASHBOARD
# =============================================================
@supplier_bp.route('/supplier/dashboard', methods=['GET'])
@jwt_required()
@role_required('supplier')
def supplier_dashboard():
    user_id = get_jwt_identity()
    listings = WasteListing.query.filter_by(supplier_id=user_id)
    requests = WasteRequest.query.join(WasteListing).filter(WasteListing.supplier_id == user_id)

    active_listings = listings.filter(WasteListing.status.in_(['available', 'requested', 'assigned', 'collected'])).count()
    pending_requests = requests.filter(WasteRequest.status == 'pending').count()
    completed_collections = listings.filter(WasteListing.status == 'completed').count()

    recent_listings = listings.order_by(WasteListing.created_at.desc()).limit(5).all()
    recent_requests = requests.order_by(WasteRequest.created_at.desc()).limit(5).all()
    upcoming_pickups = TransportJob.query.filter_by(supplier_id=user_id).filter(
        TransportJob.status.in_(['open', 'accepted', 'picked_up'])
    ).order_by(TransportJob.created_at.desc()).limit(5).all()
    notifications = Notification.query.filter_by(user_id=user_id, is_read=False).order_by(Notification.created_at.desc()).limit(5).all()

    return jsonify({
        'stats': {
            'myListings': active_listings,
            'collectionRequests': pending_requests,
            'pendingCollections': pending_requests,
            'completedCollections': completed_collections,
        },
        'recentListings': [{
            'id': l.id,
            'waste_type': l.waste_type,
            'quantity': l.quantity,
            'unit': l.unit,
            'location': l.location,
            'status': l.status,
        } for l in recent_listings],
        'upcomingPickups': [{
            'id': j.id,
            'waste_type': j.waste_type,
            'quantity': j.quantity,
            'location': j.pickup_location,
            'pickup_date': j.created_at.strftime('%Y-%m-%d'),
            'pickup_time': j.created_at.strftime('%I:%M %p'),
        } for j in upcoming_pickups],
        'notifications': [{
            'id': n.id,
            'title': n.title,
            'message': n.message,
            'is_read': n.is_read,
            'created_at': n.created_at.isoformat()
        } for n in notifications]
    }), 200


# =============================================================
# CREATE LISTING (POST)
# =============================================================
@supplier_bp.route('/supplier/listings', methods=['POST'])
@jwt_required()
@role_required('supplier')
def create_listing():
    try:
        user_id = get_jwt_identity()
        logger.debug(f"Creating listing for user_id: {user_id}")

        data = request.get_json()
        logger.debug(f"Received data: {data}")

        # Validate required fields
        required = ['waste_type', 'quantity', 'location']
        if not data:
            return jsonify({'message': 'No JSON data provided'}), 400

        for field in required:
            if field not in data or not data.get(field):
                return jsonify({'message': f'Missing required field: {field}'}), 400

        # Create listing
        listing = WasteListing(
            supplier_id=user_id,
            waste_type=data['waste_type'],
            category=data.get('category'),
            quantity=float(data['quantity']),
            unit=data.get('unit', 'kg'),
            location=data['location'],
            pickup_address=data.get('pickup_address'),
            description=data.get('description'),
            image_url=data.get('image_url'),
            status='available'
        )

        db.session.add(listing)
        db.session.commit()
        logger.info(f"✅ Listing created successfully with ID: {listing.id}")

        return jsonify({
            'message': 'Listing created',
            'id': listing.id,
            'listing': {
                'id': listing.id,
                'waste_type': listing.waste_type,
                'quantity': listing.quantity,
                'location': listing.location,
                'status': listing.status
            }
        }), 201

    except Exception as e:
        db.session.rollback()
        logger.error(f"❌ Error creating listing: {str(e)}")
        return jsonify({'message': f'Server error: {str(e)}'}), 500


# =============================================================
# GET LISTINGS
# =============================================================
@supplier_bp.route('/supplier/listings', methods=['GET'])
@jwt_required()
@role_required('supplier')
def get_listings():
    user_id = get_jwt_identity()
    listings = WasteListing.query.filter_by(supplier_id=user_id).order_by(WasteListing.created_at.desc()).all()
    return jsonify([{
        'id': l.id,
        'waste_type': l.waste_type,
        'quantity': l.quantity,
        'unit': l.unit,
        'location': l.location,
        'status': l.status,
        'created_at': l.created_at.isoformat()
    } for l in listings]), 200


# =============================================================
# UPDATE LISTING
# =============================================================
@supplier_bp.route('/supplier/listings/<int:listing_id>', methods=['PATCH'])
@jwt_required()
@role_required('supplier')
def update_listing(listing_id):
    user_id = get_jwt_identity()
    listing = WasteListing.query.get_or_404(listing_id)
    if listing.supplier_id != user_id:
        return jsonify({'message': 'Unauthorized'}), 403

    data = request.get_json()
    allowed = ['waste_type', 'quantity', 'unit', 'location', 'pickup_address', 'description', 'image_url']
    for field in allowed:
        if field in data:
            setattr(listing, field, data[field])
    db.session.commit()
    return jsonify({'message': 'Listing updated'}), 200


# =============================================================
# DELETE LISTING
# =============================================================
@supplier_bp.route('/supplier/listings/<int:listing_id>', methods=['DELETE'])
@jwt_required()
@role_required('supplier')
def delete_listing(listing_id):
    user_id = get_jwt_identity()
    listing = WasteListing.query.get_or_404(listing_id)
    if listing.supplier_id != user_id:
        return jsonify({'message': 'Unauthorized'}), 403
    if listing.status not in ['available', 'cancelled']:
        return jsonify({'message': 'Cannot delete listing in its current state'}), 400
    db.session.delete(listing)
    db.session.commit()
    return jsonify({'message': 'Listing deleted'}), 200


# =============================================================
# GET REQUESTS
# =============================================================
@supplier_bp.route('/supplier/requests', methods=['GET'])
@jwt_required()
@role_required('supplier')
def get_requests():
    user_id = get_jwt_identity()
    requests = WasteRequest.query.join(WasteListing).filter(WasteListing.supplier_id == user_id).order_by(WasteRequest.created_at.desc()).all()
    return jsonify([{
        'id': r.id,
        'listing_id': r.listing_id,
        'waste_type': r.listing.waste_type,
        'producer_name': r.producer.full_name,
        'status': r.status,
        'message': r.message,
        'created_at': r.created_at.isoformat()
    } for r in requests]), 200


# =============================================================
# APPROVE REQUEST
# =============================================================
@supplier_bp.route('/supplier/requests/<int:request_id>/approve', methods=['PATCH'])
@jwt_required()
@role_required('supplier')
def approve_request(request_id):
    user_id = get_jwt_identity()
    req = WasteRequest.query.get_or_404(request_id)
    listing = WasteListing.query.get(req.listing_id)
    if listing.supplier_id != user_id:
        return jsonify({'message': 'Unauthorized'}), 403
    if req.status != 'pending':
        return jsonify({'message': 'Request already processed'}), 400

    req.status = 'approved'
    listing.status = 'requested'

    job = TransportJob(
        request_id=req.id,
        listing_id=listing.id,
        supplier_id=listing.supplier_id,
        producer_id=req.producer_id,
        pickup_location=listing.location,
        delivery_location=req.producer.location or listing.location,
        waste_type=listing.waste_type,
        quantity=listing.quantity,
        status='open'
    )
    db.session.add(job)

    notify = Notification(
        user_id=req.producer_id,
        title='Request Approved',
        message=f'Your request for {listing.waste_type} has been approved.',
        type='request_approved'
    )
    db.session.add(notify)
    db.session.commit()
    return jsonify({'message': 'Request approved, transport job created'}), 200


# =============================================================
# REJECT REQUEST
# =============================================================
@supplier_bp.route('/supplier/requests/<int:request_id>/reject', methods=['PATCH'])
@jwt_required()
@role_required('supplier')
def reject_request(request_id):
    user_id = get_jwt_identity()
    req = WasteRequest.query.get_or_404(request_id)
    listing = WasteListing.query.get(req.listing_id)
    if listing.supplier_id != user_id:
        return jsonify({'message': 'Unauthorized'}), 403
    if req.status != 'pending':
        return jsonify({'message': 'Request already processed'}), 400

    req.status = 'rejected'
    notify = Notification(
        user_id=req.producer_id,
        title='Request Rejected',
        message=f'Your request for {listing.waste_type} was rejected.',
        type='request_rejected'
    )
    db.session.add(notify)
    db.session.commit()
    return jsonify({'message': 'Request rejected'}), 200


# =============================================================
# COLLECTION TRACKING
# =============================================================
@supplier_bp.route('/supplier/collections', methods=['GET'])
@jwt_required()
@role_required('supplier')
def get_supplier_collections():
    user_id = get_jwt_identity()
    jobs = TransportJob.query.filter_by(supplier_id=user_id).order_by(TransportJob.created_at.desc()).all()
    return jsonify([{
        'id': j.id,
        'waste_type': j.waste_type,
        'quantity': j.quantity,
        'pickup_location': j.pickup_location,
        'delivery_location': j.delivery_location,
        'status': j.status,
        'transporter_name': j.transporter.full_name if j.transporter else None,
        'created_at': j.created_at.isoformat()
    } for j in jobs]), 200