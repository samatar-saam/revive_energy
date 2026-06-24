# backend/models/__init__.py

from .user import User
from .login_history import UserDevice
from .business_verification import BusinessVerification
from .legacy import (
    Collection,
    Waste,
    WasteListing,
    WasteRequest,
    TransportJob,
    Payment,
    Receipt,
    Invoice,
    Notification,
    SupportTicket,
    EmailVerification,
    PhoneVerification,
    Conversation,
    Message,
)

# Optionally expose all models for convenience
__all__ = [
    'User',
    'UserDevice',
    'BusinessVerification',
    'Collection',
    'Waste',
    'WasteListing',
    'WasteRequest',
    'TransportJob',
    'Payment',
    'Receipt',
    'Invoice',
    'Notification',
    'SupportTicket',
    'EmailVerification',
    'PhoneVerification',
    'Conversation',
    'Message',
]