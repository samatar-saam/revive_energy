# backend/models/__init__.py

from .user import User
from .login_history import UserDevice
from .business_verification import BusinessVerification
from .processing_plant import ProcessingPlant   # <-- NEW IMPORT

# Legacy models
from .legacy import (
    Collection,
    Waste,
    WasteListing,
    WasteRequest,
    Invoice,
    Notification,
    SupportTicket,
    EmailVerification,
    PhoneVerification,
    Conversation,
    Message,
)

# New models
from .payment import Payment
from .receipt import Receipt
from .transport_job import TransportJob
from .escrow_transaction import EscrowTransaction

__all__ = [
    "User",
    "UserDevice",
    "BusinessVerification",
    "ProcessingPlant",          # <-- ADDED

    # Legacy
    "Collection",
    "Waste",
    "WasteListing",
    "WasteRequest",
    "Invoice",
    "Notification",
    "SupportTicket",
    "EmailVerification",
    "PhoneVerification",
    "Conversation",
    "Message",

    # New
    "Payment",
    "Receipt",
    "TransportJob",
    "EscrowTransaction",
]