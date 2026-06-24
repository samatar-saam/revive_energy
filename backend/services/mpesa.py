# backend/services/mpesa.py

import requests
import base64
import json
from datetime import datetime
from flask import current_app
from database import db                      # ✅ correct import
from models import Payment, Notification     # ✅ models only
from utils.helpers import create_notification

class MpesaService:
    """Service class for M‑Pesa Daraja API operations."""

    @staticmethod
    def get_access_token():
        """Get OAuth token from M‑Pesa."""
        consumer_key = current_app.config['MPESA_CONSUMER_KEY']
        consumer_secret = current_app.config['MPESA_CONSUMER_SECRET']
        url = "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials"
        response = requests.get(url, auth=(consumer_key, consumer_secret))
        if response.status_code == 200:
            return response.json().get('access_token')
        else:
            raise Exception("Failed to get access token")

    @staticmethod
    def stk_push(phone, amount, description, payment_id):
        """Initiate STK Push."""
        access_token = MpesaService.get_access_token()
        url = "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest"
        timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
        password = base64.b64encode(
            (current_app.config['MPESA_SHORTCODE'] + 
             current_app.config['MPESA_PASSKEY'] + 
             timestamp).encode()
        ).decode('utf-8')

        payload = {
            "BusinessShortCode": current_app.config['MPESA_SHORTCODE'],
            "Password": password,
            "Timestamp": timestamp,
            "TransactionType": "CustomerPayBillOnline",
            "Amount": amount,
            "PartyA": phone,
            "PartyB": current_app.config['MPESA_SHORTCODE'],
            "PhoneNumber": phone,
            "CallBackURL": current_app.config['MPESA_CALLBACK_URL'],
            "AccountReference": f"REVIVE{payment_id}",
            "TransactionDesc": description
        }

        headers = {
            'Authorization': f'Bearer {access_token}',
            'Content-Type': 'application/json'
        }

        response = requests.post(url, json=payload, headers=headers)
        response_data = response.json()
        return response_data

    @staticmethod
    def handle_callback(data):
        """
        Process the callback from M‑Pesa.
        Returns a dict with success flag and payment_id / mpesa_receipt.
        """
        try:
            result_code = data['Body']['stkCallback']['ResultCode']
            if result_code == 0:
                # Success
                merchant_request_id = data['Body']['stkCallback']['MerchantRequestID']
                checkout_request_id = data['Body']['stkCallback']['CheckoutRequestID']
                mpesa_receipt = data['Body']['stkCallback']['CallbackMetadata']['Item'][1]['Value']
                amount = data['Body']['stkCallback']['CallbackMetadata']['Item'][0]['Value']
                # Find payment using checkout_request_id or merchant_request_id
                payment = Payment.query.filter_by(checkout_request_id=checkout_request_id).first()
                if not payment:
                    payment = Payment.query.filter_by(merchant_request_id=merchant_request_id).first()
                if payment:
                    # Update payment
                    payment.status = 'paid'
                    payment.mpesa_receipt = mpesa_receipt
                    payment.completed_at = datetime.utcnow()
                    db.session.commit()

                    # Create notifications using the helper
                    if hasattr(create_notification, '__call__'):
                        create_notification(
                            user_id=payment.supplier_id,
                            title='Payment Received',
                            message=f'Producer has paid KES {payment.amount:,.2f} for your waste listing.',
                            type='payment_received',
                            reference_id=payment.id
                        )
                        create_notification(
                            user_id=payment.transporter_id,
                            title='Payment Secured',
                            message=f'Payment of KES {payment.amount:,.2f} is now in escrow for delivery job #{payment.transport_job_id}.',
                            type='payment_secured',
                            reference_id=payment.id
                        )
                        create_notification(
                            user_id=payment.producer_id,
                            title='Payment Successful',
                            message=f'Your payment of KES {payment.amount:,.2f} was successful.',
                            type='payment_success',
                            reference_id=payment.id
                        )

                    return {
                        'success': True,
                        'payment_id': payment.id,
                        'mpesa_receipt': mpesa_receipt,
                        'amount': amount
                    }
                else:
                    return {'success': False, 'error': 'Payment not found'}
            else:
                # Failure
                error_code = data['Body']['stkCallback']['ResultCode']
                error_desc = data['Body']['stkCallback']['ResultDesc']
                return {'success': False, 'error': f'{error_code}: {error_desc}'}
        except KeyError as e:
            return {'success': False, 'error': f'Invalid callback data: {str(e)}'}


# ─── Legacy function exports (for compatibility) ───
def get_access_token():
    return MpesaService.get_access_token()

def stk_push(phone, amount, description, payment_id):
    return MpesaService.stk_push(phone, amount, description, payment_id)

def mpesa_callback_handler(data):
    return MpesaService.handle_callback(data)