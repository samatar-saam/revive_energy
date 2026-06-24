# backend/services/sms_service.py

import logging
from flask import current_app

logger = logging.getLogger(__name__)

def send_sms(phone, message):
    """
    Send an SMS message using a configured provider (Africa's Talking, Twilio, etc.).
    
    Args:
        phone (str): Recipient phone number in international format (e.g., +2547xxxxxxxx).
        message (str): SMS text (max 160 characters for standard SMS).
    
    Returns:
        bool: True if sent successfully, False otherwise.
    """
    # Default implementation: log the message
    logger.info(f"SMS to {phone}: {message}")

    # Check if a provider is configured and use it
    provider = current_app.config.get('SMS_PROVIDER', 'log')

    if provider == 'africastalking':
        return _send_via_africastalking(phone, message)
    elif provider == 'twilio':
        return _send_via_twilio(phone, message)
    elif provider == 'log':
        # Already logged; return True as a fallback for development
        return True
    else:
        logger.warning(f"Unknown SMS provider: {provider}. Message logged only.")
        return False

def _send_via_africastalking(phone, message):
    """
    Send SMS using Africa's Talking API.
    Requires configuration: AFRICASTALKING_USERNAME, AFRICASTALKING_API_KEY.
    """
    try:
        # Ensure Africa's Talking SDK is installed: pip install africastalking
        import africastalking
        username = current_app.config.get('AFRICASTALKING_USERNAME')
        api_key = current_app.config.get('AFRICASTALKING_API_KEY')
        if not username or not api_key:
            logger.error("Africa's Talking credentials not configured.")
            return False

        africastalking.initialize(username, api_key)
        sms = africastalking.SMS
        response = sms.send(message, [phone])
        # Check response: usually response['SMSMessageData']['Recipients'][0]['status'] == 'Success'
        if response and 'SMSMessageData' in response:
            recipients = response['SMSMessageData'].get('Recipients', [])
            if recipients and recipients[0].get('status') == 'Success':
                logger.info(f"SMS sent via Africa's Talking to {phone}")
                return True
        logger.error(f"Africa's Talking send failed: {response}")
        return False
    except Exception as e:
        logger.error(f"Africa's Talking SMS error: {e}")
        return False

def _send_via_twilio(phone, message):
    """
    Send SMS using Twilio API.
    Requires configuration: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER.
    """
    try:
        from twilio.rest import Client
        account_sid = current_app.config.get('TWILIO_ACCOUNT_SID')
        auth_token = current_app.config.get('TWILIO_AUTH_TOKEN')
        from_number = current_app.config.get('TWILIO_PHONE_NUMBER')
        if not account_sid or not auth_token or not from_number:
            logger.error("Twilio credentials not configured.")
            return False

        client = Client(account_sid, auth_token)
        message_obj = client.messages.create(
            body=message,
            from_=from_number,
            to=phone
        )
        if message_obj.sid:
            logger.info(f"SMS sent via Twilio to {phone}, SID: {message_obj.sid}")
            return True
        return False
    except Exception as e:
        logger.error(f"Twilio SMS error: {e}")
        return False