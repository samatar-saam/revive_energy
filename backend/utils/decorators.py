# utils/decorators.py
from functools import wraps
from flask import jsonify
from flask_jwt_extended import get_jwt_identity
from models import User

def role_required(*allowed_roles):
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            user_id = get_jwt_identity()
            user = User.query.get(user_id)
            if not user or user.role not in allowed_roles:
                return jsonify({'message': 'Access denied for this role'}), 403
            return fn(*args, **kwargs)
        return wrapper
    return decorator