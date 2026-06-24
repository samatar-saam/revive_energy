# backend/services/email_service.py

import logging
from flask import current_app
from flask_mail import Message

logger = logging.getLogger(__name__)

def send_email(to, subject, html_body, text_body=None):
    """
    Send an email using Flask-Mail.
    
    Args:
        to (str): Recipient email address.
        subject (str): Email subject.
        html_body (str): HTML content of the email.
        text_body (str, optional): Plain text version (auto-generated if not provided).
    
    Returns:
        bool: True if sent successfully, False otherwise.
    """
    try:
        mail = current_app.extensions.get('mail')
        if not mail:
            logger.error("Flask-Mail extension not initialized.")
            return False

        msg = Message(
            subject=subject,
            recipients=[to],
            html=html_body,
            body=text_body or "Please enable HTML to view this email."
        )
        mail.send(msg)
        logger.info(f"Email sent to {to}")
        return True
    except Exception as e:
        logger.error(f"Failed to send email to {to}: {e}")
        return False