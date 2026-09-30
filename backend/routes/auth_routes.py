"""Authentication & user account routes."""

import re
import base64
import secrets
import traceback
from datetime import datetime

from flask import Blueprint, jsonify, request
from flask_bcrypt import Bcrypt

from models import db, User, EmailSubmission

auth_bp = Blueprint('auth', __name__)
bcrypt = Bcrypt()


def init_bcrypt(app):
    """Attach the Bcrypt instance to the app (called from app.py)."""
    bcrypt.init_app(app)


@auth_bp.route('/api/validate-email', methods=['GET', 'OPTIONS'])
def validate_email():
    if request.method == 'OPTIONS':
        return jsonify({})

    try:
        email = request.args.get('email')
        if not email:
            return jsonify({"valid": False, "detail": "Email parameter required"}), 400

        exists = db.session.query(
            EmailSubmission.query.filter_by(sender_email=email).exists()
        ).scalar()

        return jsonify({"valid": exists, "email": email, "exists": exists}), 200

    except Exception as e:
        print(f"Error validating email: {e}")
        traceback.print_exc()
        return jsonify({"valid": False, "detail": str(e)}), 500


@auth_bp.route('/api/register', methods=['POST', 'OPTIONS'])
def register():
    if request.method == 'OPTIONS':
        return jsonify({})

    try:
        data = request.get_json()

        if not data.get('full_name') or not data.get('email') or not data.get('password'):
            return jsonify({"detail": "All fields are required"}), 400

        email_exists = db.session.query(
            EmailSubmission.query.filter_by(sender_email=data['email']).exists()
        ).scalar()

        if not email_exists:
            return jsonify({
                "detail": "This email is not registered in our system. "
                          "Please use the email you used to submit your abstract."
            }), 403

        existing_user = User.query.filter_by(email=data['email']).first()
        if existing_user:
            return jsonify({"detail": "Email already registered"}), 400

        hashed_password = bcrypt.generate_password_hash(data['password']).decode('utf-8')

        new_user = User(
            full_name=data['full_name'],
            email=data['email'],
            hashed_password=hashed_password,
            role='user',
        )

        db.session.add(new_user)
        db.session.commit()

        return jsonify({
            "message": "User created successfully",
            "id": new_user.id,
            "full_name": new_user.full_name,
            "email": new_user.email,
            "role": new_user.role,
        }), 201

    except Exception as e:
        db.session.rollback()
        print(f"Registration error: {e}")
        traceback.print_exc()
        return jsonify({"detail": str(e)}), 500


@auth_bp.route('/api/login', methods=['POST', 'OPTIONS'])
def login():
    if request.method == 'OPTIONS':
        return jsonify({})

    try:
        data = request.get_json()

        if not data.get('email') or not data.get('password'):
            return jsonify({"detail": "Email and password are required"}), 400

        email = data['email'].strip().lower()
        password = data['password']

        if not re.match(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$', email):
            return jsonify({"detail": "Invalid credentials"}), 401

        if len(password) < 8:
            return jsonify({"detail": "Invalid credentials"}), 401

        user = User.query.filter_by(email=email).first()
        if not user:
            return jsonify({"detail": "Invalid credentials"}), 401

        if not user.is_active:
            return jsonify({"detail": "Account is deactivated. Please contact support."}), 403

        if not bcrypt.check_password_hash(user.hashed_password, password):
            return jsonify({"detail": "Invalid credentials"}), 401

        token_data = f"{user.email}|{secrets.token_urlsafe(32)}"
        token = base64.b64encode(token_data.encode('utf-8')).decode('utf-8')

        print(f"✅ User logged in: {user.email} at {datetime.now()}")

        return jsonify({
            "message": "Login successful",
            "user": {
                "id": user.id,
                "full_name": user.full_name,
                "email": user.email,
                "role": user.role,
            },
            "token": token,
        }), 200

    except Exception as e:
        print(f"Login error: {e}")
        traceback.print_exc()
        return jsonify({"detail": "An error occurred during login"}), 500


@auth_bp.route('/api/current-user', methods=['GET', 'OPTIONS'])
def get_current_user():
    if request.method == 'OPTIONS':
        return jsonify({})

    try:
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return jsonify({"detail": "Authorization header required"}), 401

        if auth_header.startswith('Bearer '):
            token = auth_header[7:]
            user_data = verify_token(token)
            if not user_data:
                return jsonify({"detail": "Invalid token"}), 401

            return jsonify({
                "id": user_data['id'],
                "full_name": user_data['full_name'],
                "email": user_data['email'],
                "role": user_data['role'],
            }), 200

        return jsonify({"detail": "Invalid authorization format"}), 401

    except Exception as e:
        print(f"Error getting current user: {e}")
        return jsonify({"detail": str(e)}), 500


@auth_bp.route('/api/users', methods=['GET', 'OPTIONS'])
def get_all_users():
    if request.method == 'OPTIONS':
        return jsonify({})

    try:
        users = User.query.all()
        return jsonify([{
            'id': user.id,
            'full_name': user.full_name,
            'email': user.email,
            'role': user.role,
        } for user in users]), 200
    except Exception as e:
        print(f"Error fetching users: {e}")
        return jsonify({"detail": str(e)}), 500


def verify_token(token: str):
    """Demo token decoder — token is base64-encoded 'email|random'."""
    try:
        decoded = base64.b64decode(token).decode('utf-8')
        email = decoded.split('|')[0]
        if '@' in email:
            user = User.query.filter_by(email=email).first()
            if user:
                return {
                    "id": user.id,
                    "full_name": user.full_name,
                    "email": user.email,
                    "role": user.role,
                }
    except Exception:
        pass
    return None