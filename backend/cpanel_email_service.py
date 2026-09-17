import os
import smtplib
import ssl
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.application import MIMEApplication


class CPanelEmailService:
    """
    Minimal SMTP client for cPanel email accounts.

    Usage:
        svc = CPanelEmailService()   # reads .env
        svc.send_email("user@x.com", "Subject", "Body", is_html=True)
    """

    def __init__(
        self,
        host: str = None,
        port: int = None,
        username: str = None,
        password: str = None,
        from_email: str = None,
        from_name: str = None,
    ):
        # Prefer explicit args, else fall back to .env
        self.host = host or os.getenv('CPANEL_SMTP_HOST', 'pemnet.capsu.edu.ph')
        self.port = int(port or os.getenv('CPANEL_SMTP_PORT', 465))
        self.username = username or os.getenv('CPANEL_SMTP_USER', 'pemnetreply@pemnet.capsu.edu.ph')
        self.password = password or os.getenv('CPANEL_SMTP_PASS', 'PEMnet@2026')
        self.from_email = from_email or os.getenv('CPANEL_FROM_EMAIL', self.username)
        self.from_name = from_name or os.getenv('CPANEL_FROM_NAME', 'PEMNet 2026 Conference')

        if not self.password:
            raise ValueError(
                "CPANEL_SMTP_PASS is not set. Add it to your .env file "
                "or cPanel's Python App environment variables."
            )

    # -----------------------------------------------------------------
    # Public API — matches the same shape as GmailService.send_email()
    # so existing callers keep working without modifications.
    # -----------------------------------------------------------------
    def send_email(self, to, subject, body, attachments=None, is_html=False, cc=None):
        """
        Send an email through cPanel's SMTP server.

        Args:
            to: recipient email (str)
            subject: email subject
            body: plain text OR HTML (see is_html)
            attachments: list of dicts with 'data' (bytes) and 'filename'
            is_html: whether `body` is HTML
            cc: str or list of str

        Returns:
            dict {'id': 'smtp_success'} on success, None on failure
        """
        if not to or '@' not in to:
            print(f"❌ Invalid recipient email: {to}")
            return None

        try:
            # ---- Build MIME message ----
            message = MIMEMultipart('alternative') if is_html else MIMEMultipart()
            message['From'] = f"{self.from_name} <{self.from_email}>"
            message['To'] = to
            message['Subject'] = subject

            cc_list = []
            if cc:
                cc_list = cc if isinstance(cc, list) else [c.strip() for c in str(cc).split(',') if c.strip()]
                if cc_list:
                    message['Cc'] = ', '.join(cc_list)

            if is_html:
                # Plain text fallback
                plain_text = self._html_to_text(body)
                message.attach(MIMEText(plain_text, 'plain', 'utf-8'))
                message.attach(MIMEText(body, 'html', 'utf-8'))
            else:
                message.attach(MIMEText(body, 'plain', 'utf-8'))

            if attachments:
                for attachment in attachments:
                    part = MIMEApplication(attachment['data'])
                    part['Content-Disposition'] = f'attachment; filename="{attachment["filename"]}"'
                    message.attach(part)

            # ---- Recipients include CC ----
            recipients = [to] + cc_list

            # ---- Connect & send ----
            print(f"📨 Sending via cPanel SMTP ({self.host}:{self.port}) → {to}")
            context = ssl.create_default_context()

            if self.port == 465:
                # SSL (typical cPanel default)
                with smtplib.SMTP_SSL(self.host, self.port, context=context, timeout=30) as server:
                    server.login(self.username, self.password)
                    server.send_message(message, from_addr=self.from_email, to_addrs=recipients)
            else:
                # STARTTLS (port 587)
                with smtplib.SMTP(self.host, self.port, timeout=30) as server:
                    server.ehlo()
                    server.starttls(context=context)
                    server.ehlo()
                    server.login(self.username, self.password)
                    server.send_message(message, from_addr=self.from_email, to_addrs=recipients)

            print(f"✅ Email sent via cPanel SMTP → {to}")
            return {'id': 'cpanel_smtp_success'}

        except smtplib.SMTPAuthenticationError as e:
            print(f"❌ cPanel SMTP auth failed: {e}")
            print("   → Check CPANEL_SMTP_USER and CPANEL_SMTP_PASS in .env")
            return None
        except smtplib.SMTPException as e:
            print(f"❌ cPanel SMTP error: {e}")
            return None
        except Exception as e:
            print(f"❌ cPanel SMTP send failed: {e}")
            return None

    def _html_to_text(self, html: str) -> str:
        try:
            from bs4 import BeautifulSoup
            return BeautifulSoup(html, 'html.parser').get_text(separator='\n', strip=True)
        except Exception:
            return html  # graceful degradation