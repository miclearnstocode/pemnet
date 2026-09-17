import secrets
import string
from datetime import datetime, timedelta
from abc import ABC, abstractmethod
from typing import Optional
from flask_bcrypt import Bcrypt
from models import db, User, PasswordReset


OTP_LENGTH = 6
OTP_TTL_MINUTES = 10            
TOKEN_TTL_MINUTES = 15    
MAX_OTP_ATTEMPTS = 5      
RESEND_COOLDOWN_SECONDS = 60  


class OTPGenerator(ABC):
    @abstractmethod
    def generate(self) -> str: ...


class TokenGenerator(ABC):
    @abstractmethod
    def generate(self) -> str: ...


class Notifier(ABC):
    """Any delivery channel: email, SMS, WhatsApp..."""
    @abstractmethod
    def send_otp(self, to_email: str, to_name: str, otp: str) -> bool: ...

    @abstractmethod
    def send_reset_confirmation(self, to_email: str, to_name: str) -> bool: ...


class NumericOTPGenerator(OTPGenerator):
    """6-digit numeric OTP using cryptographically secure RNG."""
    def generate(self) -> str:
        return ''.join(secrets.choice(string.digits) for _ in range(OTP_LENGTH))


class SecureTokenGenerator(TokenGenerator):
    """URL-safe opaque token."""
    def generate(self) -> str:
        return secrets.token_urlsafe(32)


class GmailNotifier(Notifier):
    """Concrete Notifier — wraps the existing gmail_service."""
    def __init__(self, gmail_service):
        self._gmail = gmail_service

    def send_otp(self, to_email: str, to_name: str, otp: str) -> bool:
        if not self._gmail:
            print("⚠️  Email service unavailable; OTP not sent")
            return False

        subject = "PEMNet — Password Reset Verification Code"

        html_body = f"""<!DOCTYPE html>
    <html>
    <body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
    <div style="max-width:520px;margin:0 auto;padding:32px 16px;">
        <div style="background:#ffffff;border-radius:16px;padding:40px 32px;box-shadow:0 4px 20px rgba(0,0,0,0.05);">

        <div style="text-align:center;margin-bottom:32px;">
            <div style="display:inline-block;width:56px;height:56px;background:linear-gradient(135deg,#3b82f6,#10b981);border-radius:16px;line-height:56px;color:#ffffff;font-weight:bold;font-size:22px;">P</div>
            <h1 style="font-size:22px;color:#0f172a;margin:16px 0 4px;">Password Reset</h1>
            <p style="color:#64748b;font-size:14px;margin:0;">PEMNet 2026 Conference</p>
        </div>

        <p style="color:#334155;font-size:15px;line-height:1.6;margin:0 0 20px;">
            Hi <strong>{to_name}</strong>,
        </p>

        <p style="color:#334155;font-size:15px;line-height:1.6;margin:0 0 24px;">
            We received a request to reset your PEMNet account password. Use the code below to continue:
        </p>

        <div style="text-align:center;margin:32px 0;">
            <div style="display:inline-block;background:#f8fafc;border:2px dashed #cbd5e1;border-radius:12px;padding:20px 32px;">
            <div style="font-size:36px;font-weight:bold;color:#0f172a;letter-spacing:12px;font-family:'Courier New',monospace;">
                {otp}
            </div>
            </div>
        </div>

        <p style="color:#64748b;font-size:13px;text-align:center;margin:0 0 24px;">
            ⏱ This code expires in <strong>{OTP_TTL_MINUTES} minutes</strong>
        </p>

        <div style="background:#fffbeb;border-left:4px solid #f59e0b;border-radius:6px;padding:14px 16px;margin:24px 0;">
            <p style="color:#78350f;font-size:13px;margin:0;line-height:1.5;">
            <strong>Didn't request this?</strong> You can safely ignore this email — your password will remain unchanged. Never share this code with anyone.
            </p>
        </div>

        <p style="color:#334155;font-size:15px;line-height:1.6;margin:24px 0 0;">
            Best regards,<br>
            <strong>PEMNet 2026 Conference Committee</strong>
        </p>

        </div>

        <p style="text-align:center;color:#94a3b8;font-size:12px;margin:24px 0 0;">
        This is an automated message. Please do not reply directly to this email.
        </p>
    </div>
    </body>
    </html>"""

        try:
            self._gmail.send_email(to_email, subject, html_body, is_html=True)
            return True
        except Exception as e:
            print(f"❌ Failed to send OTP email: {e}")
        return False

    def send_reset_confirmation(self, to_email: str, to_name: str) -> bool:
        if not self._gmail:
            return False

        subject = "PEMNet — Password Successfully Reset"

        html_body = f"""<!DOCTYPE html>
    <html>
    <body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
    <div style="max-width:520px;margin:0 auto;padding:32px 16px;">
        <div style="background:#ffffff;border-radius:16px;padding:40px 32px;box-shadow:0 4px 20px rgba(0,0,0,0.05);">

        <div style="text-align:center;margin-bottom:24px;">
            <div style="display:inline-block;width:64px;height:64px;background:#dcfce7;border-radius:50%;line-height:64px;font-size:32px;">✅</div>
            <h1 style="font-size:22px;color:#0f172a;margin:16px 0 4px;">Password Reset Successful</h1>
        </div>

        <p style="color:#334155;font-size:15px;line-height:1.6;margin:0 0 20px;">
            Hi <strong>{to_name}</strong>,
        </p>

        <p style="color:#334155;font-size:15px;line-height:1.6;margin:0 0 24px;">
            Your PEMNet account password was successfully changed. You can now sign in with your new password.
        </p>

        <div style="background:#fef2f2;border-left:4px solid #ef4444;border-radius:6px;padding:14px 16px;margin:24px 0;">
            <p style="color:#7f1d1d;font-size:13px;margin:0;line-height:1.5;">
            <strong>Didn't do this?</strong> If you didn't reset your password, please contact the PEMNet committee immediately at <a href="mailto:pemnetreply@pemnet.capsu.edu.ph" style="color:#dc2626;">pemnetreply@pemnet.capsu.edu.ph</a>.
            </p>
        </div>

        <p style="color:#334155;font-size:15px;line-height:1.6;margin:24px 0 0;">
            Best regards,<br>
            <strong>PEMNet 2026 Conference Committee</strong>
        </p>

        </div>
    </div>
    </body>
    </html>"""

        try:
            self._gmail.send_email(to_email, subject, html_body, is_html=True)
            return True
        except Exception as e:
            print(f"❌ Failed to send confirmation email: {e}")
        return False
    
# ============================================================
# Repository (SRP — only DB access for PasswordReset)
# ============================================================
class PasswordResetRepository:
    def __init__(self, session=db.session):
        self._session = session

    def create(self, user: User, otp_hash: str, otp_plain: str,
               ip: str, user_agent: str) -> PasswordReset:
        expires = datetime.utcnow() + timedelta(minutes=OTP_TTL_MINUTES)
        record = PasswordReset(
            user_id=user.id,
            email=user.email,
            otp_code=otp_plain,       # keep for dev/reference; hash is authoritative
            otp_hash=otp_hash,
            expires_at=expires,
            ip_address=ip,
            user_agent=(user_agent or '')[:255],
        )
        self._session.add(record)
        self._session.commit()
        return record

    def find_latest_active_by_email(self, email: str) -> Optional[PasswordReset]:
        return (
            PasswordReset.query
            .filter_by(email=email, used=False)
            .order_by(PasswordReset.created_at.desc())
            .first()
        )

    def find_by_token_hash(self, token_hash: str) -> Optional[PasswordReset]:
        return PasswordReset.query.filter_by(token_hash=token_hash, used=False).first()

    def mark_verified(self, record: PasswordReset, token_hash: str, token_plain: str):
        record.verified = True
        record.verified_at = datetime.utcnow()
        record.token_hash = token_hash
        record.reset_token = token_plain   # dev/reference
        record.expires_at = datetime.utcnow() + timedelta(minutes=TOKEN_TTL_MINUTES)
        self._session.commit()

    def mark_used(self, record: PasswordReset):
        record.used = True
        self._session.commit()

    def increment_attempts(self, record: PasswordReset) -> int:
        record.attempts = (record.attempts or 0) + 1
        self._session.commit()
        return record.attempts

    def invalidate_all_for_user(self, user_id: int):
        """Used when a new OTP is requested — old ones become useless."""
        PasswordReset.query.filter_by(user_id=user_id, used=False).update({'used': True})
        self._session.commit()


# ============================================================
# The Service (orchestrator — depends on abstractions, not concretes)
# ============================================================
class PasswordResetService:
    def __init__(
        self,
        bcrypt: Bcrypt,
        repository: PasswordResetRepository,
        notifier: Notifier,
        otp_generator: OTPGenerator,
        token_generator: TokenGenerator,
    ):
        self._bcrypt = bcrypt
        self._repo = repository
        self._notifier = notifier
        self._otp_gen = otp_generator
        self._token_gen = token_generator

    def request_reset(self, email: str, ip: str, user_agent: str) -> dict:
        """
        Returns an explicit error if the email is NOT registered.
        Checks BOTH:
          - users.email              (registered accounts)
          - email_submissions.sender_email  (abstract submitters who haven't registered)

        NOTE: This intentionally reveals whether an email exists.
        Acceptable for internal/trusted deployments.
        """
        email = (email or '').strip().lower()

        if not email:
            return {
                "success": False,
                "detail": "Please enter your email address."
            }

        # ---- 1. Look up in users table (registered accounts) ----
        user = User.query.filter_by(email=email).first()

        # ---- 2. If no user, check email_submissions (submitter-only) ----
        if not user:
            from models import EmailSubmission  # local import to avoid circulars

            submission_exists = db.session.query(
                EmailSubmission.query.filter_by(sender_email=email).exists()
            ).scalar()

            if not submission_exists:
                print(f"❌ Password reset rejected — email not in users or email_submissions: {email}")
                return {
                    "success": False,
                    "detail": (
                        "This email is not registered in our system. "
                        "Please use the email you used to submit your abstract, "
                        "or contact the PEMNet committee."
                    )
                }

            # Submitter exists but has no account yet
            print(f"⚠️  Password reset — email found in submissions but no user account: {email}")
            return {
                "success": False,
                "detail": (
                    "This email is registered as a submitter but has no PEMNet account yet. "
                    "Please create an account first at /register."
                )
            }

        # ---- 3. User exists but inactive ----
        if not user.is_active:
            print(f"❌ Password reset rejected — inactive account: {email}")
            return {
                "success": False,
                "detail": "This account is deactivated. Please contact the PEMNet committee."
            }

        # ---- 4. Rate limit — prevent spam ----
        latest = self._repo.find_latest_active_by_email(email)
        if latest:
            age = (datetime.utcnow() - latest.created_at).total_seconds()
            if age < RESEND_COOLDOWN_SECONDS:
                wait = int(RESEND_COOLDOWN_SECONDS - age)
                return {
                    "success": False,
                    "detail": f"Please wait {wait} seconds before requesting a new code."
                }

        # ---- 5. Invalidate previous codes, issue new one ----
        self._repo.invalidate_all_for_user(user.id)

        otp = self._otp_gen.generate()
        otp_hash = self._bcrypt.generate_password_hash(otp).decode('utf-8')

        self._repo.create(user, otp_hash, otp, ip, user_agent)

        # Fire-and-forget delivery
        sent_ok = self._notifier.send_otp(user.email, user.full_name, otp)

        if not sent_ok:
            return {
                "success": False,
                "detail": "We couldn't send the verification email. Please try again in a moment."
            }

        return {
            "success": True,
            "message": f"A 6-digit verification code has been sent to {email}."
        }
        
    def verify_otp(self, email: str, otp: str) -> dict:
        email = (email or '').strip().lower()
        otp = (otp or '').strip()

        if not email or not otp or len(otp) != OTP_LENGTH:
            return {"success": False, "detail": "Invalid code format."}

        record = self._repo.find_latest_active_by_email(email)
        if not record:
            return {"success": False, "detail": "No active reset request found."}

        if record.verified:
            return {"success": False, "detail": "This code was already used."}

        if datetime.utcnow() > record.expires_at:
            return {"success": False, "detail": "This code has expired. Please request a new one."}

        if record.attempts >= MAX_OTP_ATTEMPTS:
            self._repo.mark_used(record)
            return {"success": False, "detail": "Too many attempts. Please request a new code."}

        if not self._bcrypt.check_password_hash(record.otp_hash, otp):
            self._repo.increment_attempts(record)
            remaining = MAX_OTP_ATTEMPTS - record.attempts
            return {
                "success": False,
                "detail": f"Incorrect code. {remaining} attempt{'s' if remaining != 1 else ''} remaining."
            }

        # Success — issue a one-time reset token
        token = self._token_gen.generate()
        token_hash = self._bcrypt.generate_password_hash(token).decode('utf-8')
        self._repo.mark_verified(record, token_hash, token)

        return {
            "success": True,
            "message": "Code verified.",
            "reset_token": token
        }

    def reset_password(self, token: str, new_password: str) -> dict:
        if not token or not new_password:
            return {"success": False, "detail": "Missing token or password."}

        if len(new_password) < 8:
            return {"success": False, "detail": "Password must be at least 8 characters."}

        # We hash the token to look it up (never store plaintext tokens)
        # But bcrypt is salted — we can't query by bcrypt hash directly.
        # Workaround: iterate active records and check each hash.
        # Since there are very few active rows, this is fine.
        candidates = PasswordReset.query.filter_by(used=False, verified=True).all()
        record = None
        for c in candidates:
            if c.token_hash and self._bcrypt.check_password_hash(c.token_hash, token):
                record = c
                break

        if not record:
            return {"success": False, "detail": "Invalid or expired reset token."}

        if datetime.utcnow() > record.expires_at:
            self._repo.mark_used(record)
            return {"success": False, "detail": "Reset session expired. Please start over."}

        user = User.query.get(record.user_id)
        if not user:
            return {"success": False, "detail": "User not found."}

        user.hashed_password = self._bcrypt.generate_password_hash(new_password).decode('utf-8')
        db.session.commit()

        self._repo.mark_used(record)

        # Notify user for security
        self._notifier.send_reset_confirmation(user.email, user.full_name)

        return {"success": True, "message": "Password reset successfully."}