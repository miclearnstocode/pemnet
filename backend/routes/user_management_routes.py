from flask import Blueprint, request, jsonify
from flask_bcrypt import Bcrypt
from models import db, User
from datetime import datetime
import re

user_mgmt_bp = Blueprint('user_mgmt', __name__)
_bcrypt = None


def init_user_management(bcrypt_instance):
    """Wire the shared Bcrypt instance."""
    global _bcrypt
    _bcrypt = bcrypt_instance


def _require_admin():
    """Simple role check — replace with JWT/session check if you have one."""
    # If you have auth middleware, swap this for `g.current_user`.
    # For now, allow if role header is passed (frontend will pass it)
    role = request.headers.get('X-User-Role', '').lower()
    if role not in ('admin', 'master_approver'):
        return False
    return True


# ==================== LIST ====================

@user_mgmt_bp.route('/api/admin/users', methods=['GET'])
def list_users():
    """Return all users. Supports ?role=, ?search=, ?active= filters."""
    if not _require_admin():
        return jsonify({'error': 'Unauthorized'}), 403

    query = User.query

    role_filter = request.args.get('role')
    if role_filter and role_filter != 'all':
        query = query.filter(User.role == role_filter)

    search = request.args.get('search', '').strip()
    if search:
        like = f'%{search}%'
        query = query.filter(
            db.or_(
                User.full_name.ilike(like),
                User.email.ilike(like),
            )
        )

    active_filter = request.args.get('active')
    if active_filter == 'true':
        query = query.filter(User.is_active == True)
    elif active_filter == 'false':
        query = query.filter(User.is_active == False)

    users = query.order_by(User.created_at.desc()).all()
    return jsonify([u.to_dict() for u in users]), 200


@user_mgmt_bp.route('/api/admin/users/stats', methods=['GET'])
def user_stats():
    """Counts by role + active/inactive."""
    if not _require_admin():
        return jsonify({'error': 'Unauthorized'}), 403

    total = User.query.count()
    active = User.query.filter_by(is_active=True).count()
    inactive = User.query.filter_by(is_active=False).count()

    by_role = {}
    for role in ['user', 'staff', 'evaluator', 'admin', 'master_approver', 'treasurer']:
        by_role[role] = User.query.filter_by(role=role).count()

    return jsonify({
        'total': total,
        'active': active,
        'inactive': inactive,
        'by_role': by_role,
    }), 200


@user_mgmt_bp.route('/api/admin/users/<int:user_id>', methods=['GET'])
def get_user(user_id):
    if not _require_admin():
        return jsonify({'error': 'Unauthorized'}), 403
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    return jsonify(user.to_dict()), 200


# ==================== CREATE ====================

@user_mgmt_bp.route('/api/admin/users', methods=['POST'])
def create_user():
    if not _require_admin():
        return jsonify({'error': 'Unauthorized'}), 403

    data = request.get_json() or {}
    full_name = data.get('full_name', '').strip()
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')
    role = data.get('role', 'user')

    if not full_name:
        return jsonify({'error': 'Full name is required'}), 400
    if not email or not re.match(r'^[^@]+@[^@]+\.[^@]+$', email):
        return jsonify({'error': 'Valid email is required'}), 400
    if not password or len(password) < 6:
        return jsonify({'error': 'Password must be at least 6 characters'}), 400
    if role not in ('user', 'staff', 'evaluator', 'admin', 'master_approver', 'treasurer'):
        return jsonify({'error': 'Invalid role'}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({'error': 'Email already exists'}), 400

    user = User(
        full_name=full_name,
        email=email,
        hashed_password=_bcrypt.generate_password_hash(password).decode('utf-8'),
        role=role,
        is_active=data.get('is_active', True),
    )
    db.session.add(user)
    db.session.commit()
    return jsonify(user.to_dict()), 201


# ==================== UPDATE ====================

@user_mgmt_bp.route('/api/admin/users/<int:user_id>', methods=['PUT'])
def update_user(user_id):
    if not _require_admin():
        return jsonify({'error': 'Unauthorized'}), 403

    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    data = request.get_json() or {}

    if 'full_name' in data:
        user.full_name = data['full_name'].strip()

    if 'email' in data:
        new_email = data['email'].strip().lower()
        if new_email != user.email:
            if User.query.filter(User.email == new_email, User.id != user_id).first():
                return jsonify({'error': 'Email already in use'}), 400
            user.email = new_email

    if 'role' in data:
        if data['role'] not in ('user', 'staff', 'evaluator', 'admin', 'master_approver', 'treasurer'):
            return jsonify({'error': 'Invalid role'}), 400
        user.role = data['role']

    if 'is_active' in data:
        user.is_active = data['is_active']

    db.session.commit()
    return jsonify(user.to_dict()), 200


# ==================== CHANGE PASSWORD ====================

@user_mgmt_bp.route('/api/admin/users/<int:user_id>/password', methods=['PUT'])
def change_password(user_id):
    """Admin sets a new password for a user — no old password required."""
    if not _require_admin():
        return jsonify({'error': 'Unauthorized'}), 403

    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    data = request.get_json() or {}
    new_password = data.get('password', '')

    if not new_password or len(new_password) < 6:
        return jsonify({'error': 'Password must be at least 6 characters'}), 400

    user.hashed_password = _bcrypt.generate_password_hash(new_password).decode('utf-8')
    db.session.commit()
    return jsonify({'message': 'Password updated successfully'}), 200


# ==================== DELETE ====================

@user_mgmt_bp.route('/api/admin/users/<int:user_id>', methods=['DELETE'])
def delete_user(user_id):
    if not _require_admin():
        return jsonify({'error': 'Unauthorized'}), 403

    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    # Safety: don't let admin delete themselves
    self_id = request.headers.get('X-User-Id')
    if self_id and int(self_id) == user_id:
        return jsonify({'error': 'You cannot delete your own account'}), 400

    db.session.delete(user)
    db.session.commit()
    return jsonify({'message': 'User deleted successfully'}), 200


def register_user_management_routes(app):
    app.register_blueprint(user_mgmt_bp)
    print("✅ User management routes registered")