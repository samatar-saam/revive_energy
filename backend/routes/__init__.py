# backend/routes/__init__.py
# Just import auth_bp here
from .auth import auth_bp

# Simple export
__all__ = ['auth_bp']