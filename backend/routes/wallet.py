# backend/routes/wallet.py
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import desc
from datetime import datetime
from models import User, Wallet, WalletTransaction, WithdrawalRequest
from database import db

wallet_bp = Blueprint('wallet', __name__, url_prefix='/api')


def get_or_create_wallet(user_id):
    """Get the user's wallet, create one if it doesn't exist."""
    wallet = Wallet.query.filter_by(user_id=user_id).first()
    if not wallet:
        wallet = Wallet(user_id=user_id, balance=0.0)
        db.session.add(wallet)
        db.session.commit()
    return wallet


@wallet_bp.route('/wallet', methods=['GET'])
@jwt_required()
def get_wallet():
    """Get the current user's wallet balance."""
    user_id = int(get_jwt_identity())
    wallet = get_or_create_wallet(user_id)
    return jsonify({
        'balance': wallet.balance,
        'user_id': wallet.user_id,
        'updated_at': wallet.updated_at.isoformat() if wallet.updated_at else None,
    }), 200


@wallet_bp.route('/wallet/transactions', methods=['GET'])
@jwt_required()
def get_transactions():
    """Get the user's wallet transactions (latest first)."""
    user_id = int(get_jwt_identity())
    wallet = get_or_create_wallet(user_id)
    # Optional pagination
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    query = WalletTransaction.query.filter_by(wallet_id=wallet.id).order_by(desc(WalletTransaction.created_at))
    paginated = query.paginate(page=page, per_page=per_page, error_out=False)
    transactions = [t.to_dict() for t in paginated.items]
    return jsonify({
        'data': transactions,
        'pagination': {
            'page': page,
            'per_page': per_page,
            'total': paginated.total,
            'pages': paginated.pages,
        }
    }), 200


@wallet_bp.route('/wallet/withdraw', methods=['POST'])
@jwt_required()
def request_withdrawal():
    """Submit a withdrawal request."""
    user_id = int(get_jwt_identity())
    data = request.get_json() or {}
    amount = data.get('amount')
    payment_method = data.get('payment_method', 'mpesa')
    account_details = data.get('account_details', '').strip()

    if not amount or amount <= 0:
        return jsonify({'message': 'Valid amount is required'}), 400
    if not account_details:
        return jsonify({'message': 'Account details are required'}), 400

    wallet = get_or_create_wallet(user_id)
    if wallet.balance < amount:
        return jsonify({'message': 'Insufficient balance'}), 400

    # Create withdrawal request (status pending)
    withdrawal = WithdrawalRequest(
        user_id=user_id,
        amount=amount,
        payment_method=payment_method,
        account_details=account_details,
        status='pending',
        admin_notes='',
    )
    db.session.add(withdrawal)

    # Optionally, you could deduct immediately, but we want admin approval first.
    # So we do NOT deduct here – approval will deduct.
    db.session.commit()

    return jsonify({
        'message': 'Withdrawal request submitted successfully',
        'id': withdrawal.id,
        'status': withdrawal.status,
    }), 201


@wallet_bp.route('/wallet/withdrawals', methods=['GET'])
@jwt_required()
def get_withdrawals():
    """Get the user's withdrawal requests (latest first)."""
    user_id = int(get_jwt_identity())
    withdrawals = WithdrawalRequest.query.filter_by(user_id=user_id).order_by(desc(WithdrawalRequest.created_at)).all()
    return jsonify([w.to_dict() for w in withdrawals]), 200