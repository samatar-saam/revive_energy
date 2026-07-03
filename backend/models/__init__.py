# backend/models/__init__.py

from .user import User
from .login_history import UserDevice
from .business_verification import BusinessVerification
from .processing_plant import ProcessingPlant
from .carbon_credit import CarbonCredit
from .review import Review

# Legacy models (does NOT include AdminSetting)
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
    # AdminSetting is NOT here
)

# New models
from .payment import Payment
from .receipt import Receipt
from .transport_job import TransportJob
from .escrow_transaction import EscrowTransaction
from .ticket_reply import TicketReply

# AdminSetting is in its own file
from .admin_settings import AdminSetting   # <-- IMPORT FROM HERE

__all__ = [
    "User",
    "UserDevice",
    "BusinessVerification",
    "ProcessingPlant",
    "CarbonCredit",
    "Review",
    "AdminSetting",      # <-- ADDED

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