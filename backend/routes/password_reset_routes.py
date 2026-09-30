"""Password reset routes: forgot-password, verify-otp, reset-password."""

import traceback

from flask import Blueprint, jsonify, request

from models import db
from password_reset_service import (
    PasswordResetService, PasswordResetRepository,
    GmailNotifier, NumericOTPGenerator, SecureTokenGenerator,
)

password_reset_bp = Blueprint('password_reset', __name__)


# These are injected by app.py at startup so we can share the bcrypt + email services
_bcrypt = None
_cpanel_email_service = None
_gmail_service = None


def init_password_reset(bcrypt, cpanel_email_service, gmail_service):
    """Wire the shared dependencies into the password-reset module."""
    global _bcrypt, _cpanel_email_service, _gmail_service
    _bcrypt = bcrypt
    _cpanel_email_service = cpanel_email_service
    _gmail_service = gmail_service


def _build_service() -> PasswordResetService:
    if _cpanel_email_service:
        notifier = GmailNotifier(_cpanel_email_service)
        print("📧 Password reset: using cPanel SMTP")
    elif _gmail_service:
        notifier = GmailNotifier(_gmail_service)
        print("📧 Password reset: falling back to Gmail")
    else:
        notifier = GmailNotifier(None)
        print("⚠️  Password reset: no email backend configured")

    return PasswordResetService(
        bcrypt=_bcrypt,
        repository=PasswordResetRepository(db.session),
        notifier=notifier,
        otp_generator=NumericOTPGenerator(),
        token_generator=SecureTokenGenerator(),
    )


@password_reset_bp.route('/api/auth/forgot-password', methods=['POST', 'OPTIONS'])
def forgot_password():
    if request.method == 'OPTIONS':
        return jsonify({})

    try:
        data = request.get_json() or {}
        email = data.get('email', '')
        ip = request.headers.get('X-Forwarded-For', request.remote_addr or '')[:64]
        ua = request.headers.get('User-Agent', '')

        service = _build_service()
        result = service.request_reset(email, ip, ua)

        status_code = 200 if result.get('success') else 400
        return jsonify(result), status_code

    except Exception as e:
        print(f"❌ forgot_password error: {e}")
        traceback.print_exc()
        return jsonify({
            "success": False,
            "detail": "An unexpected error occurred. Please try again.",
        }), 500


@password_reset_bp.route('/api/auth/verify-otp', methods=['POST', 'OPTIONS'])
def verify_otp():
    if request.method == 'OPTIONS':
        return jsonify({})

    try:
        data = request.get_json() or {}
        email = data.get('email', '')
        otp = data.get('otp', '')

        service = _build_service()
        result = service.verify_otp(email, otp)
        return jsonify(result), 200 if result.get('success') else 400

    except Exception as e:
        print(f"❌ verify_otp error: {e}")
        traceback.print_exc()
        return jsonify({"success": False, "detail": "Server error"}), 500


@password_reset_bp.route('/api/auth/reset-password', methods=['POST', 'OPTIONS'])
def reset_password():
    if request.method == 'OPTIONS':
        return jsonify({})

    try:
        data = request.get_json() or {}
        token = data.get('reset_token', '')
        new_password = data.get('new_password', '')

        service = _build_service()
        result = service.reset_password(token, new_password)
        return jsonify(result), 200 if result.get('success') else 400

    except Exception as e:
        print(f"❌ reset_password error: {e}")
        traceback.print_exc()
        return jsonify({"success": False, "detail": "Server error"}), 500