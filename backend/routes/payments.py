from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from database import db  # ✅ import db from database
from models import Payment, Receipt, Invoice, User, WasteListing, WasteRequest, TransportJob, Notification
from services.mpesa import stk_push, mpesa_callback_handler
from utils.helpers import generate_receipt_number, generate_invoice_number, calculate_distribution
from datetime import datetime

payments_bp = Blueprint('payments', __name__, url_prefix='/api/payments')


@payments_bp.route('/initiate', methods=['POST'])
@jwt_required()
def initiate_payment():
    current_user_id = get_jwt_identity()
    data = request.get_json()

    # Validate required fields
    required = ['listing_id', 'request_id', 'transport_job_id', 'amount', 'phone']
    if not all(k in data for k in required):
        return jsonify({'error': 'Missing required fields'}), 400

    # Fetch related objects
    listing = WasteListing.query.get(data['listing_id'])
    if not listing:
        return jsonify({'error': 'Listing not found'}), 404

    request_obj = WasteRequest.query.get(data['request_id'])
    if not request_obj or request_obj.status != 'approved':
        return jsonify({'error': 'Request must be approved'}), 400

    transport_job = TransportJob.query.get(data['transport_job_id'])
    if not transport_job or transport_job.status != 'accepted':
        return jsonify({'error': 'Transport job must be accepted'}), 400

    # Ensure current user is the producer
    if request_obj.producer_id != current_user_id:
        return jsonify({'error': 'You are not the producer for this request'}), 403

    # Check for existing payment
    existing = Payment.query.filter_by(transport_job_id=data['transport_job_id']).first()
    if existing and existing.status not in ('failed', 'refunded'):
        return jsonify({'error': 'Payment already initiated for this job'}), 409

    # Create payment record
    payment = Payment(
        payer_id=current_user_id,
        supplier_id=listing.supplier_id,
        producer_id=request_obj.producer_id,
        transporter_id=transport_job.transporter_id,
        listing_id=data['listing_id'],
        request_id=data['request_id'],
        transport_job_id=data['transport_job_id'],
        amount=data['amount'],
        payment_method='mpesa',
        status='pending'
    )
    db.session.add(payment)
    db.session.flush()  # get payment.id

    # Initiate M-Pesa STK Push
    phone = data['phone']
    if phone.startswith('0'):
        phone = '254' + phone[1:]
    elif phone.startswith('+'):
        phone = phone[1:]
    if not phone.startswith('254'):
        phone = '254' + phone

    description = f"Payment for waste listing #{listing.id}"
    try:
        mpesa_response = stk_push(
            phone=phone,
            amount=data['amount'],
            description=description,
            payment_id=payment.id
        )
        payment.checkout_request_id = mpesa_response.get('CheckoutRequestID')
        payment.merchant_request_id = mpesa_response.get('MerchantRequestID')
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'STK Push failed: {str(e)}'}), 500

    return jsonify({
        'message': 'STK Push Sent',
        'payment_id': payment.id,
        'status': 'pending'
    }), 200


@payments_bp.route('', methods=['GET'])
@jwt_required()
def get_payments():
    current_user_id = get_jwt_identity()
    payments = Payment.query.filter(
        (Payment.payer_id == current_user_id) |
        (Payment.supplier_id == current_user_id) |
        (Payment.producer_id == current_user_id) |
        (Payment.transporter_id == current_user_id)
    ).order_by(Payment.created_at.desc()).all()

    result = []
    for p in payments:
        result.append({
            'id': p.id,
            'amount': p.amount,
            'status': p.status,
            'delivery_confirmed': p.delivery_confirmed,
            'payment_method': p.payment_method,
            'mpesa_receipt': p.mpesa_receipt,
            'created_at': p.created_at.isoformat(),
            'supplier_amount': p.supplier_amount,
            'transporter_amount': p.transporter_amount,
            'platform_fee': p.platform_fee,
            'listing_id': p.listing_id,
            'request_id': p.request_id,
            'transport_job_id': p.transport_job_id
        })
    return jsonify(result), 200


@payments_bp.route('/<int:payment_id>', methods=['GET'])
@jwt_required()
def get_payment(payment_id):
    current_user_id = get_jwt_identity()
    payment = Payment.query.get(payment_id)
    if not payment:
        return jsonify({'error': 'Payment not found'}), 404

    if current_user_id not in (payment.payer_id, payment.supplier_id, payment.producer_id, payment.transporter_id):
        return jsonify({'error': 'Not authorized'}), 403

    return jsonify({
        'id': payment.id,
        'amount': payment.amount,
        'status': payment.status,
        'delivery_confirmed': payment.delivery_confirmed,
        'payment_method': payment.payment_method,
        'mpesa_receipt': payment.mpesa_receipt,
        'created_at': payment.created_at.isoformat(),
        'completed_at': payment.completed_at.isoformat() if payment.completed_at else None,
        'supplier_amount': payment.supplier_amount,
        'transporter_amount': payment.transporter_amount,
        'platform_fee': payment.platform_fee,
        'commission': payment.commission,
        'supplier': {
            'id': payment.supplier.id,
            'name': payment.supplier.full_name,
            'email': payment.supplier.email
        } if payment.supplier else None,
        'producer': {
            'id': payment.producer.id,
            'name': payment.producer.full_name,
            'email': payment.producer.email
        } if payment.producer else None,
        'transporter': {
            'id': payment.transporter.id,
            'name': payment.transporter.full_name,
            'email': payment.transporter.email
        } if payment.transporter else None,
        'listing_id': payment.listing_id,
        'request_id': payment.request_id,
        'transport_job_id': payment.transport_job_id
    }), 200


@payments_bp.route('/confirm-delivery/<int:payment_id>', methods=['POST'])
@jwt_required()
def confirm_delivery(payment_id):
    current_user_id = get_jwt_identity()
    payment = Payment.query.get(payment_id)
    if not payment:
        return jsonify({'error': 'Payment not found'}), 404

    if payment.producer_id != current_user_id:
        return jsonify({'error': 'Only the producer can confirm delivery'}), 403

    if payment.delivery_confirmed:
        return jsonify({'error': 'Delivery already confirmed'}), 400

    if payment.status not in ('paid', 'in_escrow'):
        return jsonify({'error': 'Payment must be completed before confirming delivery'}), 400

    # Calculate distribution
    platform_fee_percent = current_app.config.get('PLATFORM_COMMISSION_RATE', 0.05)
    transport_fee = 1500  # Should come from transport_job or be set earlier
    platform_fee, supplier_amount, transporter_amount = calculate_distribution(
        payment.amount, platform_fee_percent, transport_fee
    )

    payment.delivery_confirmed = True
    payment.status = 'released'
    payment.platform_fee = platform_fee
    payment.transport_fee = transport_fee
    payment.supplier_amount = supplier_amount
    payment.transporter_amount = transporter_amount
    payment.commission = platform_fee
    payment.completed_at = datetime.utcnow()

    # Generate receipt and invoices
    receipt_number = generate_receipt_number()
    receipt = Receipt(
        payment_id=payment.id,
        receipt_number=receipt_number,
        qr_code_path=None
    )
    db.session.add(receipt)

    invoice_supplier = Invoice(
        invoice_number=generate_invoice_number(),
        payment_id=payment.id,
        user_id=payment.supplier_id,
        listing_id=payment.listing_id,
        request_id=payment.request_id,
        transport_job_id=payment.transport_job_id,
        total_amount=supplier_amount,
        status='generated'
    )
    invoice_transporter = Invoice(
        invoice_number=generate_invoice_number(),
        payment_id=payment.id,
        user_id=payment.transporter_id,
        listing_id=payment.listing_id,
        request_id=payment.request_id,
        transport_job_id=payment.transport_job_id,
        total_amount=transporter_amount,
        status='generated'
    )
    db.session.add(invoice_supplier)
    db.session.add(invoice_transporter)

    # Notifications
    from utils.helpers import create_notification
    create_notification(
        payment.supplier_id,
        'Payment Released',
        f'Payment of KES {supplier_amount:,.2f} for listing #{payment.listing_id} has been released.',
        'payment_released',
        payment.id
    )
    create_notification(
        payment.transporter_id,
        'Payment Released',
        f'Payment of KES {transporter_amount:,.2f} for delivery job #{payment.transport_job_id} has been released.',
        'payment_released',
        payment.id
    )
    create_notification(
        payment.producer_id,
        'Delivery Confirmed',
        f'You confirmed delivery for listing #{payment.listing_id}. Payment of KES {payment.amount:,.2f} has been released.',
        'delivery_confirmed',
        payment.id
    )

    db.session.commit()

    return jsonify({
        'message': 'Delivery confirmed and payment distributed',
        'payment_id': payment.id,
        'status': payment.status,
        'supplier_amount': supplier_amount,
        'transporter_amount': transporter_amount,
        'platform_fee': platform_fee
    }), 200


@payments_bp.route('/receipt/<int:payment_id>', methods=['GET'])
@jwt_required()
def get_receipt(payment_id):
    current_user_id = get_jwt_identity()
    payment = Payment.query.get(payment_id)
    if not payment:
        return jsonify({'error': 'Payment not found'}), 404

    if current_user_id not in (payment.payer_id, payment.supplier_id, payment.producer_id, payment.transporter_id):
        return jsonify({'error': 'Not authorized'}), 403

    receipt = Receipt.query.filter_by(payment_id=payment_id).first()
    if not receipt:
        return jsonify({'error': 'Receipt not generated yet'}), 404

    return jsonify({
        'payment': {
            'id': payment.id,
            'amount': payment.amount,
            'status': payment.status,
            'mpesa_receipt': payment.mpesa_receipt,
            'created_at': payment.created_at.isoformat(),
            'supplier_amount': payment.supplier_amount,
            'transporter_amount': payment.transporter_amount,
            'platform_fee': payment.platform_fee,
        },
        'receipt': {
            'receipt_number': receipt.receipt_number,
            'qr_code_path': receipt.qr_code_path,
            'generated_at': receipt.generated_at.isoformat()
        }
    }), 200


@payments_bp.route('/mpesa-callback', methods=['POST'])
def mpesa_callback():
    data = request.get_json()
    result = mpesa_callback_handler(data)
    if result.get('success'):
        payment_id = result.get('payment_id')
        mpesa_receipt = result.get('mpesa_receipt')
        payment = Payment.query.get(payment_id)
        if payment:
            payment.status = 'paid'
            payment.mpesa_receipt = mpesa_receipt
            payment.completed_at = datetime.utcnow()
            db.session.commit()
        return jsonify({'ResultCode': 0, 'ResultDesc': 'Success'}), 200
    else:
        return jsonify({'ResultCode': 1, 'ResultDesc': 'Failed'}), 400