from flask_mail import Message
from flask import current_app

def send_email(to, subject, body):
    try:
        msg = Message(
            subject=subject,
            recipients=[to],
            body=body,
            html=body
        )
        current_app.extensions['mail'].send(msg)
        current_app.logger.info(f"Email sent to {to}")
        return True
    except Exception as e:
        current_app.logger.error(f"Failed to send email to {to}: {e}")
        return False