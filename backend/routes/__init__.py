from .auth_routes import auth_bp
from .submission_routes import submission_bp
from .email_submission_routes import email_submission_bp
from .evaluator_routes import evaluator_bp
from .master_approver_routes import master_approver_bp
from .payment_routes import payment_bp
from .password_reset_routes import password_reset_bp
from .news_routes import register_news_routes
from .about_routes import register_about_routes
from .full_paper_routes import full_paper_bp

__all__ = [
    'auth_bp',
    'submission_bp',
    'full_paper_bp',
    'email_submission_bp',
    'evaluator_bp',
    'master_approver_bp',
    'payment_bp',
    'password_reset_bp',
    'register_news_routes',
    'register_about_routes',
]