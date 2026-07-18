# routes/platform_wallet.py
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from database import db
from models import PlatformWallet, PlatformTransaction, PlatformWithdrawal, User
from datetime import datetime
from utils.decorators import role_required

platform_wallet_bp = Blueprint('platform_wallet', __name__, url_prefix='/api/platform-wallet')

# ─── Helper ────────────────────────────────────────────────
def get_or_create_platform_wallet():
    wallet = PlatformWallet.query.first()
    if not wallet:
        wallet = PlatformWallet(balance=0.0)
        db.session.add(wallet)
        db.session.commit()
    return wallet

# ─── GET /api/platform-wallet/balance ──────────────────────
@platform_wallet_bp.route('/balance', methods=['GET'])
@jwt_required()
@role_required('admin')
def get_balance():
    wallet = get_or_create_platform_wallet()
    return jsonify(wallet.to_dict()), 200

# ─── GET /api/platform-wallet/transactions ─────────────────
@platform_wallet_bp.route('/transactions', methods=['GET'])
@jwt_required()
@role_required('admin')
def get_transactions():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)

    query = PlatformTransaction.query.order_by(PlatformTransaction.created_at.desc())
    total = query.count()
    transactions = query.offset((page - 1) * per_page).limit(per_page).all()

    return jsonify({
        'transactions': [t.to_dict() for t in transactions],
        'pagination': {
            'page': page,
            'per_page': per_page,
            'total': total,
            'pages': (total + per_page - 1) // per_page
        }
    }), 200

# ─── GET /api/platform-wallet/withdrawals ──────────────────
@platform_wallet_bp.route('/withdrawals', methods=['GET'])
@jwt_required()
@role_required('admin')
def get_withdrawals():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)

    query = PlatformWithdrawal.query.order_by(PlatformWithdrawal.created_at.desc())
    total = query.count()
    withdrawals = query.offset((page - 1) * per_page).limit(per_page).all()

    return jsonify({
        'withdrawals': [w.to_dict() for w in withdrawals],
        'pagination': {
            'page': page,
            'per_page': per_page,
            'total': total,
            'pages': (total + per_page - 1) // per_page
        }
    }), 200

# ─── POST /api/platform-wallet/withdrawals ─────────────────
@platform_wallet_bp.route('/withdrawals', methods=['POST'])
@jwt_required()
@role_required('admin')
def create_withdrawal():
    data = request.get_json() or {}
    amount = data.get('amount')
    bank_name = data.get('bank_name')
    account_number = data.get('account_number')
    account_name = data.get('account_name')

    if not all([amount, bank_name, account_number, account_name]):
        return jsonify({'message': 'All fields are required'}), 400

    try:
        amount = float(amount)
    except ValueError:
        return jsonify({'message': 'Invalid amount'}), 400

    if amount <= 0:
        return jsonify({'message': 'Amount must be greater than zero'}), 400

    wallet = get_or_create_platform_wallet()
    if wallet.balance < amount:
        return jsonify({'message': 'Insufficient platform balance'}), 400

    # Create withdrawal request (status is pending, admin will approve later)
    withdrawal = PlatformWithdrawal(
        amount=amount,
        bank_name=bank_name,
        account_number=account_number,
        account_name=account_name,
        status='pending'
    )
    db.session.add(withdrawal)
    db.session.commit()

    return jsonify({
        'message': 'Withdrawal request created successfully',
        'withdrawal': withdrawal.to_dict()
    }), 201

# ─── (Optional) PATCH /api/platform-wallet/withdrawals/<id> ─
# For admin to approve/reject/complete the withdrawal.
# Not strictly required for the frontend but useful.
@platform_wallet_bp.route('/withdrawals/<int:withdrawal_id>', methods=['PATCH'])
@jwt_required()
@role_required('admin')
def update_withdrawal_status(withdrawal_id):
    withdrawal = PlatformWithdrawal.query.get(withdrawal_id)
    if not withdrawal:
        return jsonify({'message': 'Withdrawal not found'}), 404

    data = request.get_json() or {}
    new_status = data.get('status')
    if new_status not in ['pending', 'approved', 'completed', 'failed']:
        return jsonify({'message': 'Invalid status'}), 400

    # If approving or completing, we might need to deduct from wallet
    if new_status in ['approved', 'completed'] and withdrawal.status == 'pending':
        wallet = get_or_create_platform_wallet()
        if wallet.balance < withdrawal.amount:
            return jsonify({'message': 'Insufficient balance'}), 400
        wallet.balance -= withdrawal.amount
        # Record a debit transaction
        platform_tx = PlatformTransaction(
            amount=withdrawal.amount,
            type='debit',
            description=f'Withdrawal #{withdrawal.id} - {withdrawal.bank_name}',
            payment_id=None
        )
        db.session.add(platform_tx)

    if new_status == 'failed' and withdrawal.status == 'pending':
        # If failed, we don't deduct anything
        pass

    withdrawal.status = new_status
    withdrawal.updated_at = datetime.utcnow()
    db.session.commit()

    return jsonify({
        'message': f'Withdrawal status updated to {new_status}',
        'withdrawal': withdrawal.to_dict()
    }), 200