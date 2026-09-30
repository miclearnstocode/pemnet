import os
import traceback
from dotenv import load_dotenv
from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from werkzeug.exceptions import UnprocessableEntity
from models import db
from gmail_service import GmailService
from email_service import gmail_service as _default_gmail_service  # noqa: F401
from cpanel_email_service import CPanelEmailService

# Route blueprints
from routes import (
    auth_bp,
    submission_bp,
    email_submission_bp,
    evaluator_bp,
    master_approver_bp,
    payment_bp,
    password_reset_bp,
    register_news_routes,
    register_about_routes,
)
from routes import auth_routes, password_reset_routes


# ---------------------------------------------------------------------------
# Application factory
# ---------------------------------------------------------------------------
def create_app() -> Flask:
    load_dotenv()

    app = Flask(__name__)

    _configure_app(app)
    _configure_extensions(app)
    _configure_cors(app)

    # Register blueprints
    _register_blueprints(app)

    # Initialize the database
    with app.app_context():
        try:
            db.create_all()
            print("Database connection established")
        except Exception as database_error:
            db.session.rollback()
            print(f"Database unavailable; start-up will continue: {database_error}")

    # Register global error handlers
    _register_error_handlers(app)

    # Wire up shared dependencies for password reset
    _wire_password_reset(app)

    return app


# ---------------------------------------------------------------------------
# Configuration helpers
# ---------------------------------------------------------------------------
def _configure_app(app: Flask) -> None:
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'your_super_secret_key_here')
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv(
        'DATABASE_URL', 'mysql+pymysql://root:@127.0.0.1:3306/pemnet'
    )
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['MAX_CONTENT_LENGTH'] = 64 * 1024 * 1024
    app.config['SQLALCHEMY_ENGINE_OPTIONS'] = {
        'connect_args': {
            'connect_timeout': 5,
            'read_timeout': 5,
            'write_timeout': 5,
        },
        'pool_pre_ping': True,
    }


def _configure_extensions(app: Flask) -> None:
    db.init_app(app)

    # Bcrypt needs to be shared with auth_routes and password_reset_routes
    bcrypt = Bcrypt(app)
    auth_routes.bcrypt = bcrypt
    app.extensions['bcrypt'] = bcrypt


def _configure_cors(app: Flask) -> None:
    default_origins = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
        "https://pemnet.capsu.edu.ph",
        r"http://192\.168\..*",
        r"http://10\..*",
        r"http://172\..*",
        r"http://localhost:\d+",
        r"http://127\.0\.0\.1:\d+",
    ]
    env_origins = [
        o.strip() for o in os.getenv("CORS_ORIGINS", "").split(",") if o.strip()
    ]
    allowed_origins = list(set(default_origins + env_origins))

    CORS(
        app,
        origins=allowed_origins,
        supports_credentials=True,
        allow_headers=["Content-Type", "Authorization", "Accept", "X-Requested-With"],
        expose_headers=["Content-Type", "Authorization"],
        methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        max_age=3600,
    )


def _register_blueprints(app: Flask) -> None:
    app.register_blueprint(auth_bp)
    app.register_blueprint(submission_bp)
    app.register_blueprint(email_submission_bp)
    app.register_blueprint(evaluator_bp)
    app.register_blueprint(master_approver_bp)
    app.register_blueprint(payment_bp)
    app.register_blueprint(password_reset_bp)
    register_news_routes(app)
    register_about_routes(app)


def _register_error_handlers(app: Flask) -> None:
    @app.errorhandler(Exception)
    def handle_exception(e):
        print("=" * 50)
        print("ERROR OCCURRED:")
        print(f"Type: {type(e).__name__}")
        print(f"Message: {str(e)}")
        print("Traceback:")
        traceback.print_exc()
        print("=" * 50)

        if isinstance(e, UnprocessableEntity):
            return jsonify({"msg": str(e.description or "Unprocessable Entity")}), 422

        if hasattr(e, 'code') and e.code:
            return jsonify({"msg": str(e.description or "Error")}), e.code

        return jsonify({"error": str(e), "type": type(e).__name__}), 500

    @app.errorhandler(422)
    def handle_unprocessable_entity(e):
        print("=" * 50)
        print("422 UNPROCESSABLE ENTITY ERROR:")
        print(f"Description: {e.description}")
        print("=" * 50)

        if e.description and 'form' in str(e.description).lower():
            return jsonify({
                "detail": (
                    "Form data could not be processed. The file names may contain "
                    "special characters or spaces. Please rename your files "
                    "without spaces."
                ),
                "error": str(e.description),
            }), 422

        return jsonify({"msg": str(e.description or "Unprocessable Entity")}), 422


def _wire_password_reset(app: Flask) -> None:
    """Provide the password-reset blueprint with shared services."""
    bcrypt = app.extensions['bcrypt']

    cpanel_service = None
    try:
        cpanel_service = CPanelEmailService()
        print("✅ cPanel SMTP service initialized successfully")
    except Exception as e:
        print(f"❌ cPanel SMTP service initialization failed: {e}")

    gmail_service = None
    try:
        gmail_service = GmailService(target_email='pemnet26@gmail.com')
        print("✅ Gmail service initialized successfully for: pemnet26@gmail.com")
    except Exception as e:
        print(f"❌ Gmail service initialization failed: {e}")

    password_reset_routes.init_password_reset(bcrypt, cpanel_service, gmail_service)


def _register_app_routes(app: Flask) -> None:
    @app.route('/')
    def home():
        return jsonify({"message": "PEMNet Flask Backend is running!"})

    @app.route('/api/test-cors', methods=['GET', 'OPTIONS'])
    def test_cors():
        if request.method == 'OPTIONS':
            return jsonify({})
        return jsonify({"message": "CORS is working!"})

    @app.route('/api/health', methods=['GET'])
    def health_check():
        from datetime import datetime
        return jsonify({"status": "ok", "timestamp": datetime.now().isoformat()}), 200


app = create_app()
_register_app_routes(app)


if __name__ == '__main__':
    app.run(debug=False, port=5000, host='0.0.0.0')