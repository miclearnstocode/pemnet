from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from datetime import timedelta, datetime
import os, json
import tempfile, re
import traceback
import base64
from werkzeug.utils import secure_filename
from werkzeug.exceptions import UnprocessableEntity
from dotenv import load_dotenv
from google_drive import upload_file_to_drive
from functools import wraps
from gmail_service import GmailService

load_dotenv()

app = Flask(__name__)
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'your_super_secret_key_here')
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'mysql+pymysql://root:@127.0.0.1:3306/pemnet')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['MAX_CONTENT_LENGTH'] = 64 * 1024 * 1024  # 64MB max file size

# Initialize extensions
db = SQLAlchemy(app)
bcrypt = Bcrypt(app)

# CORS configuration
CORS(app, 
     origins=["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:3001", "http://127.0.0.1:3001"],
     supports_credentials=True,
     allow_headers=["Content-Type", "Authorization", "Accept", "X-Requested-With"],
     expose_headers=["Content-Type", "Authorization"],
     methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
     max_age=3600)

# Add after_request handler to ensure CORS headers are always added
@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', 'http://localhost:3000')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, X-Requested-With')
    response.headers.add('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    response.headers.add('Access-Control-Allow-Credentials', 'true')
    response.headers.add('Access-Control-Max-Age', '3600')
    return response

# Models
class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    full_name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False, index=True)
    hashed_password = db.Column(db.String(255), nullable=False)
    is_active = db.Column(db.Boolean, default=True)
    role = db.Column(db.Enum('user', 'staff'), nullable=False, default='user')
    created_at = db.Column(db.DateTime, server_default=db.func.now())
    updated_at = db.Column(db.DateTime, server_default=db.func.now(), onupdate=db.func.now())

class Submission(db.Model):
    __tablename__ = 'submissions'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, nullable=False, default=0)
    paper_trail_no = db.Column(db.String(50), nullable=True) 
    submission_type = db.Column(db.String(50), nullable=True, default='abstract')  
    extension_project_title = db.Column(db.String(255), nullable=False)
    thematic_area = db.Column(db.String(255), nullable=False)
    paper_category = db.Column(db.String(255), nullable=False)
    suc_agencies = db.Column(db.String(255), nullable=True)
    author = db.Column(db.String(255), nullable=False)
    presenter = db.Column(db.String(255), nullable=False)
    status = db.Column(db.Enum('pending', 'accepted', 'rejected'), nullable=False, default='pending')
    co_authors = db.Column(db.Text, nullable=True)
    abstract_view_url = db.Column(db.String(500), nullable=True)
    abstract_download_url = db.Column(db.String(500), nullable=True)
    endorsement_view_url = db.Column(db.String(500), nullable=True)
    endorsement_download_url = db.Column(db.String(500), nullable=True)
    compextproj_drive_view_url = db.Column(db.String(500), nullable=True)
    compextproj_drive_download_url = db.Column(db.String(500), nullable=True)
    created_at = db.Column(db.DateTime, server_default=db.func.now())

class EmailSubmission(db.Model):
    __tablename__ = 'email_submissions'
    id = db.Column(db.Integer, primary_key=True)
    email_message_id = db.Column(db.String(255), unique=True, nullable=False, index=True)
    sender_email = db.Column(db.String(255), nullable=False)
    sender_name = db.Column(db.String(255), nullable=True)
    project_leader_name = db.Column(db.String(255), nullable=True)
    subject = db.Column(db.String(500), nullable=False)
    body = db.Column(db.Text, nullable=True)
    attachment_filename = db.Column(db.String(255), nullable=True)
    attachment_view_url = db.Column(db.String(500), nullable=True)
    attachment_download_url = db.Column(db.String(500), nullable=True)
    status = db.Column(db.Enum('pending', 'accepted', 'rejected', 'processed'), nullable=False, default='pending')
    processed_submission_id = db.Column(db.Integer, db.ForeignKey('submissions.id'), nullable=True)  # Fixed: Added ForeignKey
    email_received_at = db.Column(db.DateTime, nullable=False)
    created_at = db.Column(db.DateTime, server_default=db.func.now())
    updated_at = db.Column(db.DateTime, server_default=db.func.now(), onupdate=db.func.now())

    # Relationship to submission - fixed with proper foreign_keys
    submission = db.relationship('Submission', foreign_keys=[processed_submission_id], backref='email_submissions')
    
class ExtractedAbstractData(db.Model):
    __tablename__ = 'extracted_abstract_data'
    id = db.Column(db.Integer, primary_key=True)
    email_submission_id = db.Column(db.Integer, db.ForeignKey('email_submissions.id'), nullable=False, index=True)
    
    # Extracted fields from PDF
    title = db.Column(db.String(500), nullable=True)
    title_english = db.Column(db.String(500), nullable=True)
    authors = db.Column(db.Text, nullable=True)
    authors_list = db.Column(db.Text, nullable=True)  # JSON array of authors
    project_leader = db.Column(db.String(255), nullable=True)
    corresponding_author_name = db.Column(db.String(255), nullable=True)
    corresponding_author_email = db.Column(db.String(255), nullable=True)
    paper_category = db.Column(db.String(255), nullable=True)
    thematic_area = db.Column(db.String(255), nullable=True)
    theme = db.Column(db.String(500), nullable=True)
    extraction_status = db.Column(db.Enum('pending', 'extracted', 'failed'), nullable=False, default='pending')
    extraction_error = db.Column(db.Text, nullable=True)
    extracted_at = db.Column(db.DateTime, server_default=db.func.now())
    
    email_submission = db.relationship('EmailSubmission', foreign_keys=[email_submission_id], backref='extracted_data')
    
    
class SUC(db.Model):
    __tablename__ = 'sucs'
    id = db.Column(db.Integer, primary_key=True)
    region = db.Column(db.String(100), nullable=False)
    name = db.Column(db.String(255), nullable=False, unique=True)
    abbreviation = db.Column(db.String(50), nullable=True)
    type = db.Column(db.String(50), nullable=True)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, server_default=db.func.now())
    updated_at = db.Column(db.DateTime, server_default=db.func.now(), onupdate=db.func.now())


# Create tables
with app.app_context():
    db.create_all()

# Staff required decorator
def staff_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        # Simple check - for now, staff can be identified by role in request
        # You can add proper authentication later
        return f(*args, **kwargs)
    return decorated_function

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

@app.route('/')
def home():
    return jsonify({"message": "PEMNet Flask Backend is running!"})

@app.route('/api/test-cors', methods=['GET', 'OPTIONS'])
def test_cors():
    if request.method == 'OPTIONS':
        return jsonify({})
    return jsonify({"message": "CORS is working!"})

@app.route('/api/register', methods=['POST', 'OPTIONS'])
def register():
    if request.method == 'OPTIONS':
        return jsonify({})
    
    try:
        data = request.get_json()
        
        if not data.get('full_name') or not data.get('email') or not data.get('password'):
            return jsonify({"detail": "All fields are required"}), 400
        
        existing_user = User.query.filter_by(email=data['email']).first()
        if existing_user:
            return jsonify({"detail": "Email already registered"}), 400
        
        hashed_password = bcrypt.generate_password_hash(data['password']).decode('utf-8')
        
        new_user = User(
            full_name=data['full_name'],
            email=data['email'],
            hashed_password=hashed_password,
            role='user'  # Default role is user
        )
        
        db.session.add(new_user)
        db.session.commit()
        
        return jsonify({
            "message": "User created successfully",
            "id": new_user.id,
            "full_name": new_user.full_name,
            "email": new_user.email,
            "role": new_user.role
        }), 201
        
    except Exception as e:
        db.session.rollback()
        print(f"Registration error: {e}")
        traceback.print_exc()
        return jsonify({"detail": str(e)}), 500

@app.route('/api/login', methods=['POST', 'OPTIONS'])
def login():
    if request.method == 'OPTIONS':
        return jsonify({})
    
    try:
        data = request.get_json()
        
        if not data.get('email') or not data.get('password'):
            return jsonify({"detail": "Email and password are required"}), 400
        
        user = User.query.filter_by(email=data['email']).first()
        if not user:
            return jsonify({"detail": "Invalid email or password"}), 401
        
        if not bcrypt.check_password_hash(user.hashed_password, data['password']):
            return jsonify({"detail": "Invalid email or password"}), 401
        
        return jsonify({
            "message": "Login successful",
            "user": {
                "id": user.id,
                "full_name": user.full_name,
                "email": user.email,
                "role": user.role
            }
        }), 200
        
    except Exception as e:
        print(f"Login error: {e}")
        traceback.print_exc()
        return jsonify({"detail": str(e)}), 500

@app.route('/api/submit', methods=['POST', 'OPTIONS'])
def submit():
    if request.method == 'OPTIONS':
        return jsonify({})
    
    temp_files = []
    temp_dir = None
    
    try:
        print(f"Received submission")
        print(f"Content-Type: {request.content_type}")
        print(f"Content-Length: {request.content_length}")
        
        # Get form data
        extension_project_title = request.form.get('extension_project_title', '')
        thematic_area = request.form.get('thematic_area', '')
        paper_category = request.form.get('paper_category', '')
        suc_agencies = request.form.get('suc_agencies', '')
        author = request.form.get('author', '')
        presenter = request.form.get('presenter', '')
        co_authors = request.form.get('co_authors', '')
        
        # Debug print all form fields
        print("Form fields received:")
        for key in request.form.keys():
            print(f"  {key}: {request.form.get(key)}")
        
        # Validate required fields
        missing_fields = []
        if not extension_project_title:
            missing_fields.append('extension_project_title')
        if not thematic_area:
            missing_fields.append('thematic_area')
        if not paper_category:
            missing_fields.append('paper_category')
        if not author:
            missing_fields.append('author')
        if not presenter:
            missing_fields.append('presenter')
        
        if missing_fields:
            return jsonify({
                "detail": f"Missing required fields: {', '.join(missing_fields)}"
            }), 400
        
        # Handle co_authors
        if co_authors:
            co_authors = str(co_authors)
            if co_authors.strip() == '' or co_authors.strip() == '[]':
                co_authors = None
        else:
            co_authors = None
        
        # Handle files
        abstract_file = request.files.get('abstract_file')
        endorsement_file = request.files.get('endorsement_file')
        
        if not abstract_file or not abstract_file.filename:
            return jsonify({"detail": "Abstract file is required"}), 400
        if not endorsement_file or not endorsement_file.filename:
            return jsonify({"detail": "Endorsement file is required"}), 400
        
        # Check file types
        if not abstract_file.filename.lower().endswith('.pdf'):
            return jsonify({"detail": "Abstract file must be a PDF"}), 400
        if not endorsement_file.filename.lower().endswith('.pdf'):
            return jsonify({"detail": "Endorsement file must be a PDF"}), 400
        
        # Sanitize filenames - replace spaces with underscores
        safe_abstract_name = secure_filename(abstract_file.filename.replace(' ', '_'))
        safe_endorsement_name = secure_filename(endorsement_file.filename.replace(' ', '_'))
        
        print(f"Safe abstract filename: {safe_abstract_name}")
        print(f"Safe endorsement filename: {safe_endorsement_name}")
        
        # Create temp directory
        temp_dir = tempfile.mkdtemp()
        
        # Save abstract file
        abstract_path = os.path.join(temp_dir, safe_abstract_name)
        abstract_file.save(abstract_path)
        temp_files.append(abstract_path)
        
        # Save endorsement file
        endorsement_path = os.path.join(temp_dir, safe_endorsement_name)
        endorsement_file.save(endorsement_path)
        temp_files.append(endorsement_path)
        
        # Upload to Google Drive
        try:
            print(f"Uploading abstract with project title: {extension_project_title}")
            abstract_view_url, abstract_download_url = upload_file_to_drive(
                abstract_path, 
                f"abstract_{safe_abstract_name}",
                project_title=extension_project_title
            )
            print(f"Abstract uploaded to Drive: {abstract_view_url}")
        except Exception as drive_error:
            print(f"Google Drive upload error (abstract): {drive_error}")
            traceback.print_exc()
            return jsonify({"detail": f"Failed to upload abstract to Google Drive: {str(drive_error)}"}), 500
        
        # Upload endorsement to Google Drive
        try:
            print(f"Uploading endorsement with project title: {extension_project_title}")
            endorsement_view_url, endorsement_download_url = upload_file_to_drive(
                endorsement_path,
                f"endorsement_{safe_endorsement_name}",
                project_title=extension_project_title
            )
            print(f"Endorsement uploaded to Drive: {endorsement_view_url}")
        except Exception as drive_error:
            print(f"Google Drive upload error (endorsement): {drive_error}")
            traceback.print_exc()
            return jsonify({"detail": f"Failed to upload endorsement to Google Drive: {str(drive_error)}"}), 500
        
        # Create submission record
        new_submission = Submission(
            user_id=0,
            extension_project_title=extension_project_title,
            thematic_area=thematic_area,
            paper_category=paper_category,
            suc_agencies=suc_agencies,
            author=author,
            presenter=presenter,
            status='pending',
            co_authors=co_authors,
            abstract_view_url=abstract_view_url,
            abstract_download_url=abstract_download_url,
            endorsement_view_url=endorsement_view_url,
            endorsement_download_url=endorsement_download_url,
            compextproj_drive_view_url=None,
            compextproj_drive_download_url=None
        )
        
        db.session.add(new_submission)
        db.session.commit()
        print(f"Submission saved to database with ID: {new_submission.id}")
        
        return jsonify({
            "message": "Submission successful",
            "submission_id": new_submission.id,
            "status": "pending",
            "abstract_view_url": abstract_view_url,
            "abstract_download_url": abstract_download_url,
            "endorsement_view_url": endorsement_view_url,
            "endorsement_download_url": endorsement_download_url
        }), 200
        
    except Exception as e:
        db.session.rollback()
        error_msg = str(e)
        error_type = type(e).__name__
        print(f"Submission error: {error_msg}")
        print(f"Error type: {error_type}")
        traceback.print_exc()
        
        # Clean up temp files
        for file_path in temp_files:
            try:
                if os.path.exists(file_path):
                    os.remove(file_path)
            except Exception:
                pass
        
        if temp_dir and os.path.exists(temp_dir):
            try:
                os.rmdir(temp_dir)
            except Exception:
                pass
        
        return jsonify({
            "detail": f"{error_type}: {error_msg}",
            "error_type": error_type
        }), 500

# Get all submissions for staff review
@app.route('/api/submissions', methods=['GET', 'OPTIONS'])
def get_submissions():
    if request.method == 'OPTIONS':
        return jsonify({})
    
    try:
        submissions = Submission.query.order_by(Submission.created_at.desc()).all()
        
        result = [{
            'id': s.id,
            'user_id': s.user_id,
            'extension_project_title': s.extension_project_title,
            'thematic_area': s.thematic_area,
            'paper_category': s.paper_category,
            'suc_agencies': s.suc_agencies,
            'author': s.author,
            'presenter': s.presenter,
            'status': s.status,
            'co_authors': s.co_authors,
            'abstract_view_url': s.abstract_view_url,
            'abstract_download_url': s.abstract_download_url,
            'endorsement_view_url': s.endorsement_view_url,
            'endorsement_download_url': s.endorsement_download_url,
            'compextproj_drive_view_url': s.compextproj_drive_view_url,
            'compextproj_drive_download_url': s.compextproj_drive_download_url,
            'created_at': s.created_at.strftime('%Y-%m-%d %H:%M:%S') if s.created_at else None
        } for s in submissions]
        
        return jsonify(result), 200
        
    except Exception as e:
        print(f"Error fetching submissions: {e}")
        traceback.print_exc()
        return jsonify({"detail": str(e)}), 500

# Update submission status (accept/reject)
@app.route('/api/submissions/<int:submission_id>/status', methods=['PUT', 'OPTIONS'])
def update_submission_status(submission_id):
    if request.method == 'OPTIONS':
        return jsonify({})
    
    try:
        data = request.get_json()
        new_status = data.get('status')
        
        if new_status not in ['pending', 'accepted', 'rejected']:
            return jsonify({"detail": "Invalid status. Must be pending, accepted, or rejected."}), 400
        
        submission = Submission.query.get(submission_id)
        if not submission:
            return jsonify({"detail": "Submission not found"}), 404
        
        submission.status = new_status
        db.session.commit()
        
        return jsonify({
            "message": "Status updated successfully",
            "id": submission.id,
            "status": submission.status
        }), 200
        
    except Exception as e:
        db.session.rollback()
        print(f"Error updating status: {e}")
        traceback.print_exc()
        return jsonify({"detail": str(e)}), 500

# Update comp ext project drive URLs
@app.route('/api/submissions/<int:submission_id>/compextproj', methods=['PUT', 'OPTIONS'])
def update_compextproj_urls(submission_id):
    if request.method == 'OPTIONS':
        return jsonify({})
    
    try:
        data = request.get_json()
        view_url = data.get('compextproj_drive_view_url')
        download_url = data.get('compextproj_drive_download_url')
        
        submission = Submission.query.get(submission_id)
        if not submission:
            return jsonify({"detail": "Submission not found"}), 404
        
        if view_url:
            submission.compextproj_drive_view_url = view_url
        if download_url:
            submission.compextproj_drive_download_url = download_url
        
        db.session.commit()
        
        return jsonify({
            "message": "Comp Ext Project URLs updated successfully",
            "id": submission.id,
            "compextproj_drive_view_url": submission.compextproj_drive_view_url,
            "compextproj_drive_download_url": submission.compextproj_drive_download_url
        }), 200
        
    except Exception as e:
        db.session.rollback()
        print(f"Error updating URLs: {e}")
        traceback.print_exc()
        return jsonify({"detail": str(e)}), 500

# SUC endpoints
@app.route('/api/sucs', methods=['GET', 'OPTIONS'])
def get_sucs():
    if request.method == 'OPTIONS':
        return jsonify({})
    
    try:
        search = request.args.get('search')
        query = SUC.query.filter_by(is_active=True)
        
        if search:
            query = query.filter(
                db.or_(
                    SUC.name.like(f'%{search}%'),
                    SUC.abbreviation.like(f'%{search}%'),
                    SUC.region.like(f'%{search}%')
                )
            )
        
        sucs = query.order_by(SUC.name).all()
        
        result = [{
            'id': s.id,
            'region': s.region,
            'name': s.name,
            'abbreviation': s.abbreviation,
            'type': s.type
        } for s in sucs]
        
        return jsonify(result), 200
        
    except Exception as e:
        print(f"Error fetching SUCs: {e}")
        traceback.print_exc()
        return jsonify({"detail": str(e)}), 500

@app.route('/api/sucs', methods=['POST', 'OPTIONS'])
def add_suc():
    if request.method == 'OPTIONS':
        return jsonify({})
    
    try:
        data = request.get_json()
        
        if not data.get('name'):
            return jsonify({"detail": "SUC name is required"}), 400
        
        existing = SUC.query.filter_by(name=data['name']).first()
        if existing:
            return jsonify({"detail": "SUC already exists"}), 400
        
        new_suc = SUC(
            name=data['name'],
            region=data.get('region', 'Other'),
            abbreviation=data.get('abbreviation', ''),
            type=data.get('type', 'Other')
        )
        
        db.session.add(new_suc)
        db.session.commit()
        
        return jsonify({
            'id': new_suc.id,
            'region': new_suc.region,
            'name': new_suc.name,
            'abbreviation': new_suc.abbreviation,
            'type': new_suc.type
        }), 201
        
    except Exception as e:
        db.session.rollback()
        print(f"Error adding SUC: {e}")
        traceback.print_exc()
        return jsonify({"detail": str(e)}), 500

@app.route('/api/test-upload', methods=['POST'])
def test_upload():
    """Test endpoint to debug uploads."""
    try:
        # Create a test PDF in memory
        test_pdf = b'%PDF-1.4\n1 0 obj\n<</Type/Catalog/Pages 2 0 R>>\nendobj\n2 0 obj\n<</Type/Pages/Kids[3 0 R]/Count 1>>\nendobj\n3 0 obj\n<</Type/Page/MediaBox[0 0 612 792]/Contents 4 0 R>>\nendobj\n4 0 obj\n<</Length 44>>\nstream\nBT/F1 12 Tf 100 700 Td(Test)Tj ET\nendstream\nendobj\nxref\n0 5\n0000000000 65535 f\n0000000010 00000 n\n0000000050 00000 n\n0000000100 00000 n\n0000000200 00000 n\ntrailer\n<</Size 5/Root 1 0 R>>\nstartxref\n300\n%%EOF\n'
        
        # Save to temp file
        temp_dir = tempfile.mkdtemp()
        test_path = os.path.join(temp_dir, "test.pdf")
        with open(test_path, 'wb') as f:
            f.write(test_pdf)
        
        # Upload to Drive
        view_url, download_url = upload_file_to_drive(
            test_path,
            "test_from_flask.pdf",
            project_title="Flask Test"
        )
        
        # Cleanup
        os.remove(test_path)
        os.rmdir(temp_dir)
        
        return jsonify({
            "message": "Test upload successful",
            "view_url": view_url,
            "download_url": download_url
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.errorhandler(422)
def handle_unprocessable_entity(e):
    print("=" * 50)
    print("422 UNPROCESSABLE ENTITY ERROR:")
    print(f"Description: {e.description}")
    print(f"Data: {e.data if hasattr(e, 'data') else 'No data'}")
    print(f"Headers: {dict(e.get_response().headers) if e.get_response() else 'No response'}")
    print("=" * 50)
    
    if e.description and 'form' in str(e.description).lower():
        return jsonify({
            "detail": "Form data could not be processed. The file names may contain special characters or spaces. Please rename your files without spaces.",
            "error": str(e.description)
        }), 422
    
    return jsonify({"msg": str(e.description or "Unprocessable Entity")}), 422

try:
    # This is the account that RECEIVES the emails
    gmail_service = GmailService(target_email='pemnet26@gmail.com')
    print("✅ Gmail service initialized successfully for: pemnet26@gmail.com")
except Exception as e:
    print(f"❌ Gmail service initialization failed: {e}")
    gmail_service = None

def process_email_submission(email_data):
    """Process an email and create an email submission record."""
    try:
        # Extract data
        sender_name = email_data['sender_name']
        sender_email = email_data['sender_email']
        subject = email_data['subject']
        body = email_data['body'] if email_data['body'] else ''
        
        # Check if email should be skipped
        should_skip, skip_reason = should_skip_email(subject, body, sender_email)
        if should_skip:
            print(f"⏭️  Skipping email ({skip_reason}): {subject}")
            return None
        
        # Check if it's an invitation email
        if is_invitation_email(subject, body):
            print(f"⏭️  Skipping invitation email: {subject}")
            return None
        
        # Check if sender is pemnet26@gmail.com (skip self-emails)
        if 'pemnet26@gmail.com' in sender_email:
            print(f"⏭️  Skipping email from self (pemnet26@gmail.com): {subject}")
            return None
        
        # Get first attachment
        attachment = email_data['attachments'][0] if email_data['attachments'] else None
        
        # Skip if no attachment
        if not attachment:
            print(f"⏭️  Skipping email with no attachment: {subject}")
            return None
        
        # Try to extract project leader name from body
        project_leader_name = extract_project_leader(body)
        if not project_leader_name:
            project_leader_name = sender_name
        
        attachment_view_url = None
        attachment_download_url = None
        extracted_data = None
        temp_path = None
        
        # Process the attachment
        if attachment and attachment.get('data'):
            try:
                original_filename = attachment.get('filename', 'attachment.pdf')
                if not original_filename.lower().endswith('.pdf'):
                    original_filename = original_filename + '.pdf'
                
                # Step 1: Create temporary file
                with tempfile.NamedTemporaryFile(delete=False, suffix='.pdf') as temp_file:
                    temp_file.write(attachment['data'])
                    temp_path = temp_file.name
                
                print(f"📄 Temporary file created: {temp_path} ({os.path.getsize(temp_path)} bytes)")
                
                # Step 2: Read the attachment (PDF extraction)
                try:
                    from pdf_extracted import PDFExtractor
                    print("📄 Reading and extracting data from PDF attachment...")
                    
                    # Read the PDF file for extraction
                    with open(temp_path, 'rb') as f:
                        pdf_buffer = f.read()
                    
                    # Extract data using PDFExtractor
                    extractor = PDFExtractor(pdf_buffer)
                    extracted_data = extractor.extract_all()
                    
                    if extracted_data:
                        print(f"✅ PDF extraction successful!")
                        if extracted_data.get('title'):
                            print(f"   📝 Title: {extracted_data.get('title')}")
                        if extracted_data.get('authors_data'):
                            print(f"   👤 Authors: {extracted_data.get('authors_data', {}).get('list', [])}")
                        if extracted_data.get('paper_category'):
                            print(f"   📂 Category: {extracted_data.get('paper_category')}")
                        if extracted_data.get('thematic_area'):
                            print(f"   🎯 Thematic Area: {extracted_data.get('thematic_area')}")
                    else:
                        print("⚠️  No data extracted from PDF")
                        
                except ImportError:
                    print("⚠️  pdf_extracted module not found, skipping extraction")
                except Exception as e:
                    print(f"⚠️  Error extracting PDF data: {e}")
                    import traceback
                    traceback.print_exc()
                
                # Step 3: Extract project title (from email first, then PDF)
                project_title = subject.replace('ABSTRACT-', '').strip()
                if not project_title or len(project_title) < 5:
                    # Try from extracted data
                    if extracted_data and extracted_data.get('title'):
                        project_title = extracted_data.get('title')
                    else:
                        # Try from body
                        lines = body.split('\n') if body else []
                        for line in lines:
                            if 'ABSTRACT' in line.upper() or 'TITLE' in line.upper():
                                project_title = line.strip()
                                break
                        if not project_title:
                            project_title = subject
                
                # Step 4: Upload to Google Drive
                print(f"📤 Uploading attachment to Google Drive...")
                view_url, download_url = upload_file_to_drive(
                    temp_path,
                    f"abstract_{original_filename}",
                    project_title=project_title,
                    sender_name=sender_name
                )
                attachment_view_url = view_url
                attachment_download_url = download_url
                print(f"📎 Uploaded attachment to Drive: {view_url} (Sender: {sender_name})")
                
            except Exception as e:
                print(f"❌ Error processing attachment: {e}")
                import traceback
                traceback.print_exc()
            finally:
                # Clean up temp file
                if temp_path and os.path.exists(temp_path):
                    try:
                        os.unlink(temp_path)
                        print(f"🧹 Cleaned up temp file: {temp_path}")
                    except:
                        pass
        
        # Step 5: Store in Database (Email Data)
        email_submission = EmailSubmission(
            email_message_id=email_data['id'],
            sender_email=sender_email,
            sender_name=sender_name,
            project_leader_name=project_leader_name,
            subject=subject,
            body=body[:5000] if body else '',
            attachment_filename=attachment.get('filename') if attachment else None,
            attachment_view_url=attachment_view_url,
            attachment_download_url=attachment_download_url,
            status='pending',
            email_received_at=email_data['received_date']
        )
        
        db.session.add(email_submission)
        db.session.flush()  # Get the ID for the relationship
        
        # Step 6: Store Extracted Data in Database
        if extracted_data:
            try:
                # Prepare authors data
                authors_data = extracted_data.get('authors_data')
                authors_list_json = None
                if authors_data and authors_data.get('list'):
                    import json
                    authors_list_json = json.dumps(authors_data.get('list'))
                
                corresponding_author = extracted_data.get('corresponding_author')
                
                extracted_record = ExtractedAbstractData(
                    email_submission_id=email_submission.id,
                    title=extracted_data.get('title'),
                    title_english=extracted_data.get('title_english'),
                    authors=authors_data.get('full_text') if authors_data else None,
                    authors_list=authors_list_json,
                    project_leader=authors_data.get('project_leader') if authors_data else None,
                    corresponding_author_name=corresponding_author.get('name') if corresponding_author else None,
                    corresponding_author_email=corresponding_author.get('email') if corresponding_author else None,
                    paper_category=extracted_data.get('paper_category'),
                    thematic_area=extracted_data.get('thematic_area'),
                    theme=extracted_data.get('theme'),
                    extraction_status='extracted' if extracted_data else 'failed'
                )
                db.session.add(extracted_record)
                print(f"✅ Extracted data saved to database")
                
            except Exception as e:
                print(f"⚠️  Error saving extracted data: {e}")
                import traceback
                traceback.print_exc()
        
        db.session.commit()
        
        print(f"✅ Successfully processed email: {subject}")
        print(f"   📧 Email stored in database (ID: {email_submission.id})")
        if extracted_data:
            print(f"   📄 PDF data extracted and stored")
        print(f"   📎 Attachment uploaded to Google Drive")
        
        return email_submission
        
    except Exception as e:
        db.session.rollback()
        print(f"❌ Error processing email submission: {e}")
        import traceback
        traceback.print_exc()
        return None

def extract_project_leader(body):
    """Extract project leader name from email body."""
    if not body:
        return None
    
    # Common patterns for project leader/author
    patterns = [
        r'(?:Project Leader|Principal Investigator|Author|Proponent|Presenter)[\s:]+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)',
        r'(?:Sincerely|Respectfully|Best regards)[\s,]*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)',
        r'(?:Submitted by|Presented by)[\s:]+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)',
        r'\n([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)\s*\n(?:Project Leader|Project Proponent|Author)'
    ]
    
    for pattern in patterns:
        match = re.search(pattern, body, re.IGNORECASE | re.MULTILINE)
        if match:
            return match.group(1).strip()
    
    return None

def is_abstract_submission(subject, body, sender_email):
    """
    Check if an email is a valid abstract submission.
    
    Args:
        subject (str): Email subject
        body (str): Email body content
        sender_email (str): Sender email address
    
    Returns:
        bool: True if it's a valid abstract submission, False otherwise
    """
    subject_lower = subject.lower() if subject else ''
    body_lower = body.lower() if body else ''
    sender_lower = sender_email.lower() if sender_email else ''
    
    # Skip delivery status notifications
    if 'delivery status notification' in subject_lower or 'mail delivery subsystem' in sender_lower:
        return False
    
    # Skip failure notifications
    if 'failure' in subject_lower or 'undelivered' in subject_lower:
        return False
    
    # Skip meeting/planning requests
    meeting_keywords = [
        'request to allow',
        'planning meeting',
        'courtesy visit',
        'board member',
        'meeting request',
        'planning/meeting'
    ]
    for keyword in meeting_keywords:
        if keyword in subject_lower:
            return False
    
    # Skip interested participant (not abstract submission)
    if 'interested participant' in subject_lower:
        return False
    
    # Check for abstract-related keywords
    abstract_keywords = [
        'abstract',
        'abstract_',
        'extension project',
        'research paper',
        'submission',
        'submitting',
        'papers',
        'conference paper',
        'presentation',
        'paper for',
        'manuscript'
    ]
    
    # Check subject
    for keyword in abstract_keywords:
        if keyword in subject_lower:
            # If it has abstract keywords AND doesn't have failure/delivery keywords
            if not any(x in subject_lower for x in ['delivery', 'failure', 'undelivered']):
                return True
    
    # Check body for abstract indicators
    abstract_body_keywords = [
        'abstract submission',
        'submit abstract',
        'abstract entitled',
        'my abstract',
        'our abstract',
        'extension project abstract',
        'research abstract',
        'attached is our abstract',
        'please find attached',
        'here is our abstract',
        'enclosed is our abstract',
        'submitted for presentation',
        'for presentation at the',
        'i am pleased to submit',
        'we are pleased to submit',
        'abstract for review',
        'consideration',
        'presentation during the conference',
        'present this research',
        'conference committee',
        'extension project',
        'research project',
        'project abstract'
    ]
    
    for keyword in abstract_body_keywords:
        if keyword in body_lower:
            return True
    
    return False

def is_invitation_email(subject, body):
    subject_lower = subject.lower() if subject else ''
    body_lower = body.lower() if body else ''
    
    # High-confidence invitation indicators
    invitation_phrases = [
        'invitation to',
        'you are invited',
        'you have been invited',
        'you\'re invited',
        'cordially invite',
        'pleasure to invite',
        'please join us',
        'welcome to the',
        'register now for',
        'registration is now open',
        'conference registration',
        'registration link',
        'confirm your attendance',
        'rsvp for',
        'reserve your seat',
        'early bird registration',
        'pemnet 1st national extension conference',
        'invitation to the pemnet'
    ]
    
    # Check for invitation phrases
    for phrase in invitation_phrases:
        if phrase in subject_lower or phrase in body_lower:
            return True
    
    # Check if it has abstract submission keywords (NOT an invitation)
    abstract_keywords = [
        'abstract submission',
        'submit abstract',
        'abstract entitled',
        'my abstract',
        'our abstract',
        'extension project abstract',
        'research abstract',
        'attached is our abstract',
        'please find attached',
        'here is our abstract',
        'enclosed is our abstract',
        'submitted for presentation',
        'for presentation at the'
    ]
    
    for keyword in abstract_keywords:
        if keyword in body_lower:
            return False
    
    return False

def should_skip_email(subject, body, sender_email):
    """
    Determine if an email should be skipped (not a valid abstract submission).
    
    Args:
        subject (str): Email subject
        body (str): Email body content
        sender_email (str): Sender email address
    
    Returns:
        tuple: (should_skip, reason)
    """
    subject_lower = subject.lower() if subject else ''
    body_lower = body.lower() if body else ''
    sender_lower = sender_email.lower() if sender_email else ''
    
    # 1. Skip delivery status notifications
    if 'delivery status notification' in subject_lower:
        return True, "Delivery Status Notification"
    
    if 'mailer-daemon' in sender_lower or 'mail delivery subsystem' in sender_lower:
        return True, "Mail Delivery Subsystem"
    
    if 'failure' in subject_lower:
        return True, "Delivery Failure"
    
    # 2. Skip meeting/planning requests
    meeting_keywords = [
        'request to allow',
        'planning meeting',
        'courtesy visit',
        'board member',
        'meeting request',
        'planning/meeting',
        'pemnet officer'
    ]
    for keyword in meeting_keywords:
        if keyword in subject_lower:
            return True, "Meeting/Planning Request"
    
    # 3. Skip non-abstract inquiries
    if 'interested participant' in subject_lower:
        return True, "Interested Participant (Not Abstract)"
    
    # 4. Skip auto-replies
    if 'auto-reply' in subject_lower or 'out of office' in subject_lower:
        return True, "Auto-Reply"
    
    # 5. Skip if it doesn't have abstract indicators
    if not is_abstract_submission(subject, body, sender_email):
        return True, "Not an Abstract Submission"
    
    return False, None

@app.route('/api/email-submissions/check', methods=['POST', 'OPTIONS'])
def check_email_submissions():
    """Check for new email submissions from Gmail."""
    if request.method == 'OPTIONS':
        return jsonify({})
    
    try:
        if not gmail_service:
            return jsonify({"detail": "Gmail service not configured."}), 503
        
        # Get existing email IDs from database
        existing_ids = set()
        all_existing = EmailSubmission.query.with_entities(EmailSubmission.email_message_id).all()
        for record in all_existing:
            existing_ids.add(record[0])
        
        print(f"📧 Reading emails from inbox of: pemnet26@gmail.com")
        print(f"Found {len(existing_ids)} existing email records in database")
        
        # Simple query - just get emails with attachments, exclude self
        query = 'has:attachment -from:pemnet26@gmail.com'
        
        emails = gmail_service.get_emails_with_attachments(
            query=query,
            max_results=50
        )
        
        processed_count = 0
        errors = []
        skipped_count = 0
        invitation_skipped = 0
        non_abstract_skipped = 0
        
        for email in emails:
            # Check if already processed in database
            if email['id'] in existing_ids:
                skipped_count += 1
                continue
            
            subject = email['subject']
            body = email['body'] if email['body'] else ''
            sender_email = email['sender_email']
            
            # Check if it's an invitation - just skip
            if is_invitation_email(subject, body):
                invitation_skipped += 1
                print(f"⏭️  Skipping invitation email: {subject}")
                # NO modification to the email
                continue
            
            # Check if it's a valid abstract submission
            if not is_abstract_submission(subject, body, sender_email):
                non_abstract_skipped += 1
                print(f"⏭️  Skipping non-abstract email: {subject}")
                # NO modification to the email
                continue
            
            # Process the email - copy attachment and upload to Drive
            result = process_email_submission(email)
            if result:
                processed_count += 1
                print(f"✅ Processed email from: {email['sender_email']} - {email['subject']}")
            else:
                errors.append(email['subject'])
        
        return jsonify({
            "message": f"Checked {len(emails)} emails from pemnet26@gmail.com",
            "processed": processed_count,
            "skipped": skipped_count,
            "invitation_skipped": invitation_skipped,
            "non_abstract_skipped": non_abstract_skipped,
            "errors": errors
        }), 200
        
    except Exception as e:
        print(f"❌ Error checking email submissions: {e}")
        traceback.print_exc()
        return jsonify({"detail": str(e)}), 500
    
@app.route('/api/email-submissions', methods=['GET', 'OPTIONS'])
def get_email_submissions():
    """Get all email submissions for review."""
    if request.method == 'OPTIONS':
        return jsonify({})
    
    try:
        status_filter = request.args.get('status', 'all')
        
        query = EmailSubmission.query
        
        if status_filter != 'all':
            query = query.filter_by(status=status_filter)
        
        submissions = query.order_by(EmailSubmission.email_received_at.desc()).all()
        
        result = [{
            'id': s.id,
            'sender_email': s.sender_email,
            'sender_name': s.sender_name,
            'project_leader_name': s.project_leader_name,
            'subject': s.subject,
            'body': s.body[:500] if s.body else '',  # Truncate for display
            'attachment_filename': s.attachment_filename,
            'attachment_view_url': s.attachment_view_url,
            'attachment_download_url': s.attachment_download_url,
            'status': s.status,
            'processed_submission_id': s.processed_submission_id,
            'email_received_at': s.email_received_at.strftime('%Y-%m-%d %H:%M:%S') if s.email_received_at else None,
            'created_at': s.created_at.strftime('%Y-%m-%d %H:%M:%S') if s.created_at else None
        } for s in submissions]
        
        return jsonify(result), 200
        
    except Exception as e:
        print(f"Error fetching email submissions: {e}")
        traceback.print_exc()
        return jsonify({"detail": str(e)}), 500

@app.route('/api/email-submissions/<int:email_submission_id>/review', methods=['POST', 'OPTIONS'])
def review_email_submission(email_submission_id):
    """Review and process an email submission."""
    if request.method == 'OPTIONS':
        return jsonify({})
    
    try:
        data = request.get_json()
        action = data.get('action')  # 'accept' or 'reject'
        notes = data.get('notes', '')
        
        if action not in ['accept', 'reject']:
            return jsonify({"detail": "Invalid action. Must be 'accept' or 'reject'"}), 400
        
        email_sub = EmailSubmission.query.get(email_submission_id)
        if not email_sub:
            return jsonify({"detail": "Email submission not found"}), 404
        
        # Get or create submission record
        if action == 'accept':
            # Try to find existing submission by extracting info from email
            # or create a new one
            
            # Extract project title from subject or body
            subject = email_sub.subject
            project_title = subject.replace('ABSTRACT-', '').strip()
            if not project_title or len(project_title) < 5:
                # Try to find project title in body
                lines = email_sub.body.split('\n') if email_sub.body else []
                for line in lines:
                    if 'ABSTRACT' in line.upper() or 'TITLE' in line.upper():
                        project_title = line.strip()
                        break
                if not project_title:
                    project_title = email_sub.subject
            
            # Create submission record
            new_submission = Submission(
                user_id=0,  # System user
                extension_project_title=project_title,
                thematic_area='Not specified',
                paper_category='Completed Extension Project Papers',
                suc_agencies=email_sub.sender_name or email_sub.sender_email,
                author=email_sub.project_leader_name or email_sub.sender_name,
                presenter=email_sub.project_leader_name or email_sub.sender_name,
                status='accepted',
                co_authors='',
                abstract_view_url=email_sub.attachment_view_url,
                abstract_download_url=email_sub.attachment_download_url,
                endorsement_view_url=None,
                endorsement_download_url=None,
                compextproj_drive_view_url=None,
                compextproj_drive_download_url=None
            )
            
            db.session.add(new_submission)
            db.session.flush()  # Get the ID
            
            # Link the email submission to the new submission
            email_sub.processed_submission_id = new_submission.id
            email_sub.status = 'processed'
            
            db.session.commit()
            
            # Send confirmation email (optional)
            send_confirmation_email(email_sub.sender_email, new_submission, 'accepted', notes)
            
            return jsonify({
                "message": "Email submission accepted and converted to submission",
                "submission_id": new_submission.id,
                "status": new_submission.status
            }), 200
            
        else:  # reject
            email_sub.status = 'rejected'
            db.session.commit()
            
            # Send rejection email (optional)
            send_confirmation_email(email_sub.sender_email, email_sub, 'rejected', notes)
            
            return jsonify({
                "message": "Email submission rejected",
                "status": email_sub.status
            }), 200
        
    except Exception as e:
        db.session.rollback()
        print(f"Error reviewing email submission: {e}")
        traceback.print_exc()
        return jsonify({"detail": str(e)}), 500

def send_confirmation_email(to_email, submission, action, notes=''):
    """Send confirmation email to the sender."""
    try:
        if not gmail_service:
            print("Gmail service not configured, skipping email send")
            return False
        
        subject = f"Abstract Submission {action.capitalize()} - {submission.extension_project_title if hasattr(submission, 'extension_project_title') else submission.subject}"
        
        body = f"""
Dear {submission.author if hasattr(submission, 'author') else submission.sender_name},

Your abstract submission has been {action}d.

Title: {submission.extension_project_title if hasattr(submission, 'extension_project_title') else submission.subject}

Status: {action.upper()}

"""
        
        if notes:
            body += f"\nReview Notes:\n{notes}\n"
        
        body += f"""
Thank you for your submission.

Best regards,
PEMNet 2026 Conference Committee
"""
        
        # Create email
        gmail_service.send_email(to_email, subject, body)
        return True
        
    except Exception as e:
        print(f"Error sending confirmation email: {e}")
        return False

@app.route('/api/email-submissions/<int:email_submission_id>/view', methods=['GET', 'OPTIONS'])
def view_email_submission(email_submission_id):
    """Get full email submission details for viewing."""
    if request.method == 'OPTIONS':
        return jsonify({})
    
    try:
        email_sub = EmailSubmission.query.get(email_submission_id)
        if not email_sub:
            return jsonify({"detail": "Email submission not found"}), 404
        
        return jsonify({
            'id': email_sub.id,
            'sender_email': email_sub.sender_email,
            'sender_name': email_sub.sender_name,
            'project_leader_name': email_sub.project_leader_name,
            'subject': email_sub.subject,
            'body': email_sub.body,
            'attachment_filename': email_sub.attachment_filename,
            'attachment_view_url': email_sub.attachment_view_url,
            'attachment_download_url': email_sub.attachment_download_url,
            'status': email_sub.status,
            'processed_submission_id': email_sub.processed_submission_id,
            'email_received_at': email_sub.email_received_at.strftime('%Y-%m-%d %H:%M:%S') if email_sub.email_received_at else None,
            'created_at': email_sub.created_at.strftime('%Y-%m-%d %H:%M:%S') if email_sub.created_at else None
        }), 200
        
    except Exception as e:
        print(f"Error viewing email submission: {e}")
        return jsonify({"detail": str(e)}), 500

@app.route('/api/email-submissions/sync-all', methods=['POST', 'OPTIONS'])
def sync_all_emails():
    """Sync all emails with attachments (both read and unread)."""
    if request.method == 'OPTIONS':
        return jsonify({})
    
    try:
        if not gmail_service:
            return jsonify({"detail": "Gmail service not configured. Please set up credentials.json"}), 503
        
        # Get ALL existing email message IDs from our database
        existing_ids = set()
        all_existing = EmailSubmission.query.with_entities(EmailSubmission.email_message_id).all()
        for record in all_existing:
            existing_ids.add(record[0])
        
        print(f"Found {len(existing_ids)} existing email records in database")
        
        # Fetch ALL emails with attachments, excluding self-emails
        query = 'has:attachment -from:pemnet26@gmail.com'
        
        emails = gmail_service.get_emails_with_attachments(
            query=query,
            max_results=100
        )
        
        processed_count = 0
        skipped_count = 0
        invitation_skipped = 0
        errors = []
        
        for email in emails:
            # Check if already processed
            if email['id'] in existing_ids:
                skipped_count += 1
                continue
            
            # Check if it's an invitation
            subject = email['subject']
            body = email['body'] if email['body'] else ''
            
            invitation_keywords = [
                'invitation', 'invite', 'INVITATION', 'INVITE',
                'PEMNET 1ST NATIONAL EXTENSION CONFERENCE',
                'CONFERENCE 2026',
                'you are invited',
                'Welcome to',
                'Registration',
                'register',
                'CONFIRMATION',
                'extension conference'
            ]
            
            is_invitation = False
            for keyword in invitation_keywords:
                if keyword.lower() in subject.lower() or keyword.lower() in body.lower():
                    is_invitation = True
                    break
            
            if is_invitation:
                invitation_skipped += 1
                print(f"⏭️  Skipping invitation email: {subject}")
                continue
            
            # Process the email
            result = process_email_submission(email)
            if result:
                processed_count += 1
                print(f"Synced new email: {email['subject']}")
            else:
                errors.append(email['subject'])
        
        return jsonify({
            "message": f"Synced {len(emails)} emails",
            "processed": processed_count,
            "skipped": skipped_count,
            "invitation_skipped": invitation_skipped,
            "errors": errors,
            "total_emails_found": len(emails)
        }), 200
        
    except Exception as e:
        print(f"Error syncing emails: {e}")
        traceback.print_exc()
        return jsonify({"detail": str(e)}), 500
    
if __name__ == '__main__':
    app.run(debug=True, port=5000, host='127.0.0.1')