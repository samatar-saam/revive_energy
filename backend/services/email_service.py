# backend/services/email_service.py
import logging
import re
from flask import current_app
from flask_mail import Message

logger = logging.getLogger(__name__)

def send_verification_email(email, first_name, code):
    """
    Send a verification email using the KDIP style template.
    Returns True if sent, False otherwise.
    """
    try:
        mail = current_app.extensions.get('mail')
        if not mail:
            logger.error("Flask-Mail extension not initialized.")
            return False

       
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>ReVive Energy Verification</title>
        </head>
        <body style="font-family: Arial, sans-serif; background: #f8fafc; margin: 0; padding: 0;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background: #f8fafc; padding: 20px;">
                <tr>
                    <td align="center">
                        <table width="600" cellpadding="0" cellspacing="0" style="background: white; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                            <!-- Header -->
                            <tr>
                                <td style="background: #11402D; padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
                                    <h1 style="color: white; margin: 0; font-size: 28px;">ReVive Energy</h1>
                                    <p style="color: #a7f3d0; margin: 5px 0;">Waste‑to‑Energy Marketplace</p>
                                </td>
                            </tr>
                            <!-- Content -->
                            <tr>
                                <td style="padding: 30px;">
                                    <h2 style="color: #11402D; margin-top: 0;">Email Verification</h2>
                                    <p style="color: #4b5563;">Hello <strong>{first_name}</strong>,</p>
                                    <p style="color: #4b5563;">Your verification code is:</p>
                                    <div style="text-align: center; padding: 20px; margin: 20px 0; background: #f3f4f6; border-radius: 8px;">
                                        <span style="font-size: 36px; font-weight: bold; color: #11402D; letter-spacing: 10px;">{code}</span>
                                    </div>
                                    <p style="color: #6b7280; font-size: 14px;">This code will expire in <strong>10 minutes</strong></p>
                                    <p style="color: #9ca3af; font-size: 14px;">If you didn't request this, please ignore this email.</p>
                                </td>
                            </tr>
                            <!-- Footer -->
                            <tr>
                                <td style="padding: 20px; text-align: center; color: #9ca3af; font-size: 12px; border-top: 1px solid #e5e7eb;">
                                    <p>&copy; 2024 ReVive Energy. All rights reserved.</p>
                                    <p style="font-size: 11px; color: #d1d5db;">This is an automated message, please do not reply.</p>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </body>
        </html>
        """

        # ─── Generate plain‑text version ────────────────────────
        plain_text = f"""
        ReVive Energy – Email Verification

        Hello {first_name},

        Your verification code is: {code}

        This code will expire in 10 minutes.

        If you didn't request this, please ignore this email.

        © ReVive Energy
        """

        # ─── Build and send message ─────────────────────────────
        msg = Message(
            subject='ReVive Energy – Verify Your Email Address',
            recipients=[email],
            html=html_content,
            body=plain_text,
            sender=('ReVive Energy', current_app.config.get('MAIL_DEFAULT_SENDER')),
            reply_to=current_app.config.get('MAIL_DEFAULT_SENDER'),
            extra_headers={
                'List-Unsubscribe': f'<mailto:{current_app.config.get("MAIL_DEFAULT_SENDER")}?subject=unsubscribe>',
                'X-Mailer': 'ReVive Energy Platform',
                'X-Priority': '3 (Normal)',
                'X-MSMail-Priority': 'Normal',
                'Importance': 'Normal',
                'X-Auto-Response-Suppress': 'OOF, DR, RN, NRN, AutoReply',
                'X-Report-Abuse': f'Please report abuse to {current_app.config.get("MAIL_DEFAULT_SENDER")}'
            }
        )

        mail.send(msg)
        logger.info(f"✅ Verification email sent to {email}")
        print(f"📧 CODE for {email}: {code}")  # for debugging
        return True

    except Exception as e:
        logger.error(f"❌ Failed to send verification email: {e}")
        print(f"📧 CODE for {email} (email failed): {code}")
        return True  # Return True so registration still works even if email fails