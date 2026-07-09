# backend/services/email_service.py
import logging
from flask import current_app
from flask_mail import Message

logger = logging.getLogger(__name__)

def send_email(to, subject, html_body, text_body=None):
    """
    Send an email using Flask-Mail.
    Returns True if sent successfully, False otherwise.
    """
    try:
        mail = current_app.extensions.get('mail')
        if not mail:
            logger.error("Flask-Mail extension not initialized.")
            return False

        # If no plain text provided, generate a minimal one
        if text_body is None:
            # Strip HTML tags for a simple plain text fallback
            import re
            plain = re.sub(r'<[^>]+>', '', html_body)
            # Remove extra whitespace
            plain = re.sub(r'\s+', ' ', plain).strip()
        else:
            plain = text_body

        msg = Message(
            subject=subject,
            recipients=[to],
            html=html_body,
            body=plain,
            reply_to=current_app.config.get('MAIL_DEFAULT_SENDER'),
            extra_headers={
                'List-Unsubscribe': f'<mailto:{current_app.config.get("MAIL_DEFAULT_SENDER")}?subject=unsubscribe>'
            }
        )
        mail.send(msg)
        logger.info(f"Email sent to {to}")
        return True
    except Exception as e:
        logger.error(f"Failed to send email to {to}: {e}")
        return False