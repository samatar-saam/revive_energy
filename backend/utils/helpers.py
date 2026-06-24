# backend/utils/helpers.py

import random
import string
from datetime import datetime
from database import db          # ✅ import db from database
from models import Notification   # ✅ import models only

# ─── Number generators ───────────────────────────────────────────────

def generate_receipt_number():
    """Generate a unique receipt number: REC-YYYYMMDD-XXXX"""
    date_str = datetime.utcnow().strftime('%Y%m%d')
    random_suffix = ''.join(random.choices(string.digits, k=6))
    return f"REC-{date_str}-{random_suffix}"

def generate_invoice_number():
    """Generate a unique invoice number: INV-YYYYMMDD-XXXX"""
    date_str = datetime.utcnow().strftime('%Y%m%d')
    random_suffix = ''.join(random.choices(string.digits, k=6))
    return f"INV-{date_str}-{random_suffix}"

# ─── Distribution calculation ────────────────────────────────────────

def calculate_distribution(amount, platform_fee_percent=0.05, transport_fee=1500):
    """
    Calculate how the payment is split.
    Returns: (platform_fee, supplier_amount, transporter_amount)
    """
    platform_fee = amount * platform_fee_percent
    supplier_amount = amount - platform_fee - transport_fee
    transporter_amount = transport_fee
    return platform_fee, supplier_amount, transporter_amount

# ─── Notification helper ─────────────────────────────────────────────

def create_notification(user_id, title, message, type, reference_id=None):
    """
    Create a notification record in the database.
    """
    notif = Notification(
        user_id=user_id,
        title=title,
        message=message,
        type=type,
        reference_id=reference_id,
        is_read=False,
        created_at=datetime.utcnow()
    )
    db.session.add(notif)
    db.session.commit()
    return notif