# utils/notifications.py

from models import Notification, db
from datetime import datetime

def create_notification(user_id, title, message, type, reference_id=None):
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