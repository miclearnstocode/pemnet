from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from datetime import datetime
import os, json
import tempfile, re
import traceback
from werkzeug.utils import secure_filename
from werkzeug.exceptions import UnprocessableEntity
from dotenv import load_dotenv
from google_drive import upload_file_to_drive
from functools import wraps
from gmail_service import GmailService
from models import db, User, Submission, EmailSubmission, ExtractedAbstractData, SUC, SubmissionVote, EvaluatorDiscussion, Payment, ExtractedDataRevision
from master_approver import MasterApproverService
from email_service import gmail_service, send_status_update_email, send_confirmation_email

load_dotenv()

app = Flask(__name__)
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'your_super_secret_key_here')
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'mysql+pymysql://root:@127.0.0.1:3306/pemnet')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['MAX_CONTENT_LENGTH'] = 64 * 1024 * 1024  # 64MB max file size

# Initialize extensions
db.init_app(app)
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

@app.route('/api/validate-email', methods=['GET', 'OPTIONS'])
def validate_email():
    """Check if an email exists in the email_submissions table."""
    if request.method == 'OPTIONS':
        return jsonify({})
    
    try:
        email = request.args.get('email')
        if not email:
            return jsonify({"valid": False, "detail": "Email parameter required"}), 400
        
        # Check if email exists in email_submissions
        exists = db.session.query(
            EmailSubmission.query.filter_by(sender_email=email).exists()
        ).scalar()
        
        return jsonify({
            "valid": exists,
            "email": email,
            "exists": exists
        }), 200
        
    except Exception as e:
        print(f"Error validating email: {e}")
        traceback.print_exc()
        return jsonify({"valid": False, "detail": str(e)}), 500
    
@app.route('/api/register', methods=['POST', 'OPTIONS'])
def register():
    if request.method == 'OPTIONS':
        return jsonify({})
    
    try:
        data = request.get_json()
        
        if not data.get('full_name') or not data.get('email') or not data.get('password'):
            return jsonify({"detail": "All fields are required"}), 400
        
        # SECURITY CHECK: Verify email exists in email_submissions
        email_exists = db.session.query(
            EmailSubmission.query.filter_by(sender_email=data['email']).exists()
        ).scalar()
        
        if not email_exists:
            return jsonify({
                "detail": "This email is not registered in our system. Please use the email you used to submit your abstract."
            }), 403
        
        existing_user = User.query.filter_by(email=data['email']).first()
        if existing_user:
            return jsonify({"detail": "Email already registered"}), 400
        
        hashed_password = bcrypt.generate_password_hash(data['password']).decode('utf-8')
        
        new_user = User(
            full_name=data['full_name'],
            email=data['email'],
            hashed_password=hashed_password,
            role='user'
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
    
@app.route('/api/current-user', methods=['GET', 'OPTIONS'])
def get_current_user():
    """Get the currently logged-in user from the session."""
    if request.method == 'OPTIONS':
        return jsonify({})
    
    try:
        # For now, we'll use a simple approach - get user from Authorization header
        # In production, use proper JWT or session-based authentication
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return jsonify({"detail": "Authorization header required"}), 401
        
        # Simple token-based authentication (for demo purposes)
        # In production, use JWT tokens
        if auth_header.startswith('Bearer '):
            token = auth_header[7:]
            # For demo, we'll use a simple token mapping
            # In production, verify JWT token
            user_data = verify_token(token)
            if not user_data:
                return jsonify({"detail": "Invalid token"}), 401
            
            return jsonify({
                "id": user_data['id'],
                "full_name": user_data['full_name'],
                "email": user_data['email'],
                "role": user_data['role']
            }), 200
        
        return jsonify({"detail": "Invalid authorization format"}), 401
        
    except Exception as e:
        print(f"Error getting current user: {e}")
        return jsonify({"detail": str(e)}), 500

@app.route('/api/users', methods=['GET', 'OPTIONS'])
def get_all_users():
    """Get all users for name mapping."""
    if request.method == 'OPTIONS':
        return jsonify({})
    
    try:
        users = User.query.all()
        return jsonify([{
            'id': user.id,
            'full_name': user.full_name,
            'email': user.email,
            'role': user.role
        } for user in users]), 200
    except Exception as e:
        print(f"Error fetching users: {e}")
        return jsonify({"detail": str(e)}), 500
    
def verify_token(token):
    """Simple token verification for demo purposes."""
    try:
        # For demo: token is base64 encoded email
        import base64
        decoded = base64.b64decode(token).decode('utf-8')
        if '@' in decoded:
            user = User.query.filter_by(email=decoded).first()
            if user:
                return {
                    "id": user.id,
                    "full_name": user.full_name,
                    "email": user.email,
                    "role": user.role
                }
    except:
        pass
    return None

@app.route('/api/login', methods=['POST', 'OPTIONS'])
def login():
    if request.method == 'OPTIONS':
        return jsonify({})
    
    try:
        data = request.get_json()
        
        if not data.get('email') or not data.get('password'):
            return jsonify({"detail": "Email and password are required"}), 400
        
        # Sanitize inputs to prevent SQL injection
        email = data['email'].strip().lower()
        password = data['password']
        
        # Validate email format
        if not re.match(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$', email):
            return jsonify({"detail": "Invalid credentials"}), 401
        
        # Validate password length
        if len(password) < 8:
            return jsonify({"detail": "Invalid credentials"}), 401
        
        # Use parameterized query to prevent SQL injection
        # SQLAlchemy automatically uses parameterized queries
        user = User.query.filter_by(email=email).first()
        
        if not user:
            # Use generic message for security
            return jsonify({"detail": "Invalid credentials"}), 401
        
        # Check if user is active
        if not user.is_active:
            return jsonify({"detail": "Account is deactivated. Please contact support."}), 403
        
        # Verify password using bcrypt
        if not bcrypt.check_password_hash(user.hashed_password, password):
            # Use generic message for security
            return jsonify({"detail": "Invalid credentials"}), 401
        
        # Generate secure token
        import secrets
        import base64
        
        # Create a secure token using secrets module
        token_data = f"{user.email}|{secrets.token_urlsafe(32)}"
        token = base64.b64encode(token_data.encode('utf-8')).decode('utf-8')
        
        # Log successful login (optional)
        print(f"✅ User logged in: {user.email} at {datetime.now()}")
        
        return jsonify({
            "message": "Login successful",
            "user": {
                "id": user.id,
                "full_name": user.full_name,
                "email": user.email,
                "role": user.role
            },
            "token": token
        }), 200
        
    except Exception as e:
        print(f"Login error: {e}")
        traceback.print_exc()
        return jsonify({"detail": "An error occurred during login"}), 500
    
def generate_submission_id():
    """Generate a unique submission ID in format pemnet-XXX-YYYY"""
    from datetime import datetime
    
    current_year = datetime.now().year
    year_prefix = str(current_year)
    
    # Find the last submission ID for the current year
    # Query submissions with submission_id starting with pemnet- and ending with current year
    pattern = f'pemnet-%{year_prefix}'
    
    # Get all submission IDs for current year
    existing_ids = Submission.query.filter(
        Submission.submission_id.like(f'pemnet-%-{year_prefix}')
    ).with_entities(Submission.submission_id).all()
    
    # Also check extracted_abstract_data for email submissions
    extracted_ids = ExtractedAbstractData.query.filter(
        ExtractedAbstractData.submission_id.like(f'pemnet-%-{year_prefix}')
    ).with_entities(ExtractedAbstractData.submission_id).all()
    
    # Combine all IDs
    all_ids = [id[0] for id in existing_ids if id[0]] + [id[0] for id in extracted_ids if id[0]]
    
    max_number = 0
    
    if all_ids:
        # Extract numbers from existing IDs
        for submission_id in all_ids:
            try:
                # Format: pemnet-XXX-YYYY
                parts = submission_id.split('-')
                if len(parts) == 3:
                    num = int(parts[1])
                    if num > max_number:
                        max_number = num
            except (ValueError, IndexError):
                continue
    
    # Increment the number
    next_number = max_number + 1
    
    # Format with 3 digits (e.g., 001, 002, 010, 100)
    formatted_number = f"{next_number:03d}"
    
    return f"pemnet-{formatted_number}-{year_prefix}"

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
        user_id = request.form.get('user_id', 0)
        extension_project_title = request.form.get('extension_project_title', '')
        thematic_area = request.form.get('thematic_area', '')
        paper_category = request.form.get('paper_category', '')
        suc_agencies = request.form.get('suc_agencies', '')
        author = request.form.get('author', '')
        presenter = request.form.get('presenter', '')
        corresponding_author_name = request.form.get('corresponding_author_name', '')  
        corresponding_author_position = request.form.get('corresponding_author_position', '')
        corresponding_author_email = request.form.get('corresponding_author_email', '')
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
        
        # Convert user_id to int if provided
        try:
            user_id = int(user_id) if user_id else 0
        except ValueError:
            user_id = 0
        
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
        
        submission_id_value = generate_submission_id()
        print(f"Generated submission ID: {submission_id_value}")
        
        # Create submission record with user_id and new fields
        new_submission = Submission(
            user_id=user_id, 
            submission_id=submission_id_value,
            extension_project_title=extension_project_title,
            thematic_area=thematic_area,
            paper_category=paper_category,
            suc_agencies=suc_agencies,
            author=author,
            presenter=presenter,
            corresponding_author_name=corresponding_author_name, 
            corresponding_author_position=corresponding_author_position,
            corresponding_author_email=corresponding_author_email,  
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
        print(f"Submission saved to database with ID: {new_submission.id}, User ID: {user_id}")
        
        return jsonify({
            "message": "Submission successful",
            "submission_id": new_submission.id,
            "submission_id_format": submission_id_value,
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
        
@app.route('/api/submissions/user/<int:user_id>', methods=['GET', 'OPTIONS'])
def get_user_submissions(user_id):
    if request.method == 'OPTIONS':
        return jsonify({})
    
    try:
        user = User.query.get(user_id)
        if not user:
            return jsonify({"detail": "User not found"}), 404
        
        submissions = Submission.query.filter_by(user_id=user_id).order_by(Submission.created_at.desc()).all()
        
        result = [{
            'id': s.id,
            'user_id': s.user_id,
            'extension_project_title': s.extension_project_title,
            'thematic_area': s.thematic_area,
            'paper_category': s.paper_category,
            'suc_agencies': s.suc_agencies,
            'author': s.author,
            'presenter': s.presenter,
            'corresponding_author_name': s.corresponding_author_name,
            'corresponding_author_email': s.corresponding_author_email,
            'corresponding_author_position': s.corresponding_author_position, 
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
        print(f"Error fetching user submissions: {e}")
        traceback.print_exc()
        return jsonify({"detail": str(e)}), 500
    

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
@app.route('/api/submissions/<string:submission_id>/status', methods=['PUT', 'OPTIONS'])
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
@app.route('/api/submissions/<string:submission_id>/compextproj', methods=['PUT', 'OPTIONS'])
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
                    SUC.region.like(f'%{search}%')
                )
            )
        
        sucs = query.order_by(SUC.name).all()
        
        result = []
        for s in sucs:
            result.append({
                'id': s.id,
                'region': s.region,
                'name': s.name
            })
        
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
            region=data.get('region', 'Other')
        )
        
        db.session.add(new_suc)
        db.session.commit()
        
        return jsonify({
            'id': new_suc.id,
            'region': new_suc.region,
            'name': new_suc.name
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
                
                # Determine file type from extension
                is_docx = original_filename.lower().endswith('.docx')
                is_pdf = original_filename.lower().endswith('.pdf')
                
                # If it's not PDF or DOCX, treat as PDF for extraction attempt
                if not is_pdf and not is_docx:
                    # Try to detect from file content
                    if attachment['data'][:4] == b'%PDF':
                        is_pdf = True
                    elif attachment['data'][:2] == b'PK':
                        is_docx = True
                
                # Step 1: Create temporary file
                suffix = '.docx' if is_docx else '.pdf'
                with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as temp_file:
                    temp_file.write(attachment['data'])
                    temp_path = temp_file.name
                
                print(f"📄 Temporary file created: {temp_path} ({os.path.getsize(temp_path)} bytes)")
                
                # Step 2: Extract data from the file based on type
                try:
                    if is_docx:
                        from docs_extracted import DOCSExtractor as DOCXExtractor
                        print("📄 Reading and extracting data from DOCX attachment...")
                        extractor = DOCXExtractor(attachment['data'], filename=original_filename)
                    else:
                        from pdf_extracted import PDFExtractor
                        print("📄 Reading and extracting data from PDF attachment...")
                        extractor = PDFExtractor(attachment['data'])
                    
                    extracted_data = extractor.extract_all()
                    
                    if extracted_data:
                        print(f"✅ Extraction successful!")
                        if extracted_data.get('title'):
                            print(f"   📝 Title: {extracted_data.get('title')}")
                        if extracted_data.get('authors_data'):
                            print(f"   👤 Authors: {extracted_data.get('authors_data', {}).get('list', [])}")
                        if extracted_data.get('paper_category'):
                            print(f"   📂 Category: {extracted_data.get('paper_category')}")
                        if extracted_data.get('thematic_area'):
                            print(f"   🎯 Thematic Area: {extracted_data.get('thematic_area')}")
                        if extracted_data.get('sucs'):
                            print(f"   🏫 SUCs: {extracted_data.get('sucs')}")
                    else:
                        print("⚠️  No data extracted from file")
                        
                except ImportError as e:
                    print(f"⚠️  Import error: {e}")
                except Exception as e:
                    print(f"⚠️  Error extracting data: {e}")
                    import traceback
                    traceback.print_exc()
                
                # Step 3: Extract project title (from email first, then extracted data)
                project_title = subject.replace('ABSTRACT-', '').strip()
                if not project_title or len(project_title) < 5:
                    if extracted_data and extracted_data.get('title'):
                        project_title = extracted_data.get('title')
                    else:
                        lines = body.split('\n') if body else []
                        for line in lines:
                            if 'ABSTRACT' in line.upper() or 'TITLE' in line.upper():
                                project_title = line.strip()
                                break
                        if not project_title:
                            project_title = subject
                
                # Step 4: Get paper category and thematic area from extracted data
                paper_category = extracted_data.get('paper_category') if extracted_data else None
                thematic_area = extracted_data.get('thematic_area') if extracted_data else None
                
                # Step 5: Upload to Google Drive with folder structure
                print(f"📤 Uploading attachment to Google Drive...")
                view_url, download_url = upload_file_to_drive(
                    temp_path,
                    f"abstract_{original_filename}",
                    project_title=project_title,
                    sender_name=sender_name,
                    paper_category=paper_category,
                    thematic_area=thematic_area
                )
                attachment_view_url = view_url
                attachment_download_url = download_url
                print(f"📎 Uploaded attachment to Drive: {view_url}")
                
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
        submission_id_value = generate_submission_id()
        print(f"Generated submission ID for email: {submission_id_value}")
        
        # Step 6: Store in Database (Email Data)
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
        
        # Step 7: Store Extracted Data in Database
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
                    submission_id=submission_id_value,
                    email_submission_id=email_submission.id,
                    title=extracted_data.get('title'),
                    authors=authors_data.get('full_text') if authors_data else None,
                    authors_list=authors_list_json,
                    project_leader=authors_data.get('project_leader') if authors_data else None,
                    corresponding_author_name=corresponding_author.get('name') if corresponding_author else None,
                    corresponding_author_email=corresponding_author.get('email') if corresponding_author else None,
                    corresponding_author_position=extracted_data.get('corresponding_author_position'),
                    sucs=extracted_data.get('sucs'),
                    paper_category=extracted_data.get('paper_category'),
                    thematic_area=extracted_data.get('thematic_area'),
                    theme=extracted_data.get('theme'),
                    extraction_status='extracted' if extracted_data else 'failed'
                )
                db.session.add(extracted_record)
                print(f"✅ Extracted data saved to database (email_submission_id: {email_submission.id})")
                print(f"   🏫 SUCs: {extracted_data.get('sucs')}")
                print(f"   📍 Corresponding Author Position: {extracted_data.get('corresponding_author_position')}")
                
            except Exception as e:
                print(f"⚠️  Error saving extracted data: {e}")
                import traceback
                traceback.print_exc()
        else:
            # Even if no extracted data, create a record with failed status
            try:
                extracted_record = ExtractedAbstractData(
                    submission_id=submission_id_value,
                    email_submission_id=email_submission.id,
                    extraction_status='failed',
                    extraction_error='No data could be extracted from the attachment'
                )
                db.session.add(extracted_record)
                # Update the email submission status to 'uncategorized'
                email_submission.status = 'uncategorized'
                print(f"⚠️  Created failed extraction record for email_submission_id: {email_submission.id}")
            except Exception as e:
                print(f"⚠️  Error saving failed extraction record: {e}")
        
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
    
    # 1. Skip delivery status notifications
    if 'delivery status notification' in subject_lower or 'mail delivery subsystem' in sender_lower:
        return False
    
    # 2. Skip failure notifications
    if 'failure' in subject_lower or 'undelivered' in subject_lower:
        return False
    
    # 3. Skip meeting/planning requests
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
            return False
    
    # 4. Skip interested participant (not abstract submission)
    if 'interested participant' in subject_lower:
        return False
    
    # 5. Skip invitation emails
    invitation_keywords = [
        'invitation',
        'invite',
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
        'invitation to the pemnet',
        'pemnet 1st national extension conference',
        'reminder'
    ]
    
    for keyword in invitation_keywords:
        if keyword in subject_lower or keyword in body_lower:
            print(f"⏭️  Skipping invitation/reminder email: {subject}")
            return False
    
    # 6. Check for abstract-related keywords (MORE SPECIFIC)
    abstract_keywords = [
        'abstract submission',
        'submission of abstract',
        'submitting abstract',
        'abstract for submission',
        'submit abstract',
        'abstract entitled',
        'my abstract',
        'our abstract',
        'extension project abstract',
        'research abstract',
        'attached is our abstract',
        'attached is my abstract',
        'please find attached the abstract',
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
        'project abstract',
        'abstract_',
        'pemnet abstract',
        'abstract -',
        'abstract:',
        'submission of two extension project',
        'submitting two extension project'
    ]
    
    # Check subject for abstract indicators
    for keyword in abstract_keywords:
        if keyword in subject_lower:
            return True
    
    # Check body for abstract indicators
    for keyword in abstract_keywords:
        if keyword in body_lower:
            return True
    
    return False

def is_invitation_email(subject, body):
    """Check if an email is an invitation or reminder."""
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
        'invitation to the pemnet',
        'reminder',
        'registration reminder',
        'conference reminder',
        'abstract reminder'
    ]
    
    # Check for invitation phrases
    for phrase in invitation_phrases:
        if phrase in subject_lower or phrase in body_lower:
            return True
    
    # Check for abstract submission keywords (these indicate it's NOT an invitation)
    abstract_submission_keywords = [
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
        'submission of abstract',
        'submitting abstract',
        'submission of two extension project'
    ]
    
    for keyword in abstract_submission_keywords:
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
    
    # 5. Skip invitation and reminder emails
    invitation_keywords = [
        'invitation',
        'invite',
        'reminder',
        'registration reminder',
        'conference reminder',
        'abstract reminder',
        'you are invited',
        'you have been invited',
        'register now',
        'early bird',
        'rsvp'
    ]
    for keyword in invitation_keywords:
        if keyword in subject_lower:
            return True, "Invitation/Reminder Email"
    
    # 6. Skip if it doesn't have abstract indicators
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
            # Map frontend filter to actual statuses
            if status_filter == 'endorse':
                query = query.filter_by(status='endorse')
            elif status_filter == 'downgrade':
                query = query.filter_by(status='downgraded')
            elif status_filter == 'pending':
                query = query.filter_by(status='pending')
            elif status_filter == 'uncategorized':
                # For uncategorized, we need to check extraction_status
                query = query.join(ExtractedAbstractData, ExtractedAbstractData.email_submission_id == EmailSubmission.id)
                query = query.filter(ExtractedAbstractData.extraction_status == 'failed')
            else:
                query = query.filter_by(status=status_filter)
        
        submissions = query.order_by(EmailSubmission.email_received_at.desc()).all()
        
        result = []
        for s in submissions:
            # Fetch the extracted data for this email submission
            extracted_data = ExtractedAbstractData.query.filter_by(email_submission_id=s.id).first()
            
            # Determine the display status based on extraction status
            if extracted_data and extracted_data.extraction_status == 'failed':
                display_status = 'uncategorized'
            else:
                display_status = s.status
            
            result.append({
                'id': s.id,
                'sender_email': s.sender_email,
                'sender_name': s.sender_name,
                'project_leader_name': extracted_data.project_leader if extracted_data else s.project_leader_name,
                'subject': s.subject,
                'body': s.body[:500] if s.body else '',
                'attachment_filename': s.attachment_filename,
                'attachment_view_url': s.attachment_view_url,
                'attachment_download_url': s.attachment_download_url,
                'status': display_status,
                'extraction_status': extracted_data.extraction_status if extracted_data else 'pending',
                'processed_submission_id': s.processed_submission_id,
                'email_received_at': s.email_received_at.strftime('%Y-%m-%d %H:%M:%S') if s.email_received_at else None,
                'created_at': s.created_at.strftime('%Y-%m-%d %H:%M:%S') if s.created_at else None
            })
        
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

# ========== EVALUATOR ROUTES ==========
def evaluate_final_decision(submission_id):
    """Automatically evaluates the submission based on majority votes."""
    submission = Submission.query.get(submission_id)
    votes = SubmissionVote.query.filter_by(submission_id=submission_id).all()
    
    endorse_count = 0
    downgrade_count = 0
    reassign_count = 0
    downgrade_type = None

    for vote in votes:
        if vote.vote_status == 'endorse':
            endorse_count += 1
        elif vote.vote_status == 'downgrade':
            downgrade_count += 1
            # Store the downgrade type from the vote
            if vote.vote_downgrade_to:
                downgrade_type = vote.vote_downgrade_to
        elif vote.vote_status == 'reassign':
            reassign_count += 1

    # Final decision logic based on 3 evaluators
    if endorse_count >= 2:  # 2 or more endorse votes
        submission.evaluation_status = 'endorse'
        submission.status = 'endorse'  # Update status as well
    elif downgrade_count >= 2:  # 2 or more downgrade votes
        # Use the downgrade type from the votes
        if downgrade_type:
            submission.evaluation_status = downgrade_type
        else:
            submission.evaluation_status = 'downgraded-non_competitive'  # default
        submission.status = 'downgraded'  # Update status as well
    elif reassign_count >= 2:  # 2 or more reassign votes
        submission.evaluation_status = 'pending'  # Keep pending for reassign
        # Update thematic area is handled elsewhere
    else:
        submission.evaluation_status = 'pending'

    db.session.commit()

# ========== EVALUATOR ROUTES ==========

def get_submission_data(submission_id):
    """Get submission data from either submissions or email_submissions table."""
    # First try to find in submissions table by submission_id (VARCHAR)
    submission = Submission.query.filter_by(submission_id=submission_id).first()
    if submission:
        return {
            'type': 'system',
            'data': submission,
            'id': submission.id,
            'submission_id': submission.submission_id,
            'user_id': submission.user_id,
            'title': submission.extension_project_title,
            'status': submission.status,
            'evaluation_status': submission.evaluation_status,
            'thematic_area': submission.thematic_area,
            'paper_category': submission.paper_category,
            'author': submission.author,
            'suc_agencies': submission.suc_agencies,
            'corresponding_author_name': submission.corresponding_author_name,
            'corresponding_author_email': submission.corresponding_author_email,
            'corresponding_author_position': submission.corresponding_author_position,
            'abstract_view_url': submission.abstract_view_url,
            'endorsement_view_url': submission.endorsement_view_url,
            'created_at': submission.created_at
        }
    
    # If not found, try email_submissions with extracted data
    # Check if the submission_id exists in extracted_abstract_data
    extracted = ExtractedAbstractData.query.filter_by(submission_id=submission_id).first()
    if extracted:
        email_sub = EmailSubmission.query.get(extracted.email_submission_id)
        if email_sub:
            return {
                'type': 'email',
                'data': email_sub,
                'id': email_sub.id,
                'submission_id': submission_id,
                'user_id': 0,
                'title': extracted.title if extracted else email_sub.subject,
                'status': email_sub.status,
                'evaluation_status': extracted.evaluation_status if extracted else 'pending',
                'thematic_area': extracted.thematic_area if extracted else 'Not specified',
                'paper_category': extracted.paper_category if extracted else 'Not specified',
                'author': extracted.project_leader if extracted else email_sub.project_leader_name,
                'suc_agencies': extracted.sucs if extracted else email_sub.sender_name,
                'corresponding_author_name': extracted.corresponding_author_name if extracted else None,
                'corresponding_author_email': extracted.corresponding_author_email if extracted else None,
                'corresponding_author_position': extracted.corresponding_author_position if extracted else None,
                'abstract_view_url': email_sub.attachment_view_url,
                'endorsement_view_url': None,
                'created_at': email_sub.email_received_at
            }
    
    # If still not found, check if it's a direct email submission ID
    email_sub = EmailSubmission.query.get(submission_id)
    if email_sub:
        extracted = ExtractedAbstractData.query.filter_by(email_submission_id=email_sub.id).first()
        return {
            'type': 'email',
            'data': email_sub,
            'id': email_sub.id,
            'submission_id': extracted.submission_id if extracted else None,
            'user_id': 0,
            'title': extracted.title if extracted else email_sub.subject,
            'status': email_sub.status,
            'evaluation_status': extracted.evaluation_status if extracted else 'pending',
            'thematic_area': extracted.thematic_area if extracted else 'Not specified',
            'paper_category': extracted.paper_category if extracted else 'Not specified',
            'author': extracted.project_leader if extracted else email_sub.project_leader_name,
            'suc_agencies': extracted.sucs if extracted else email_sub.sender_name,
            'corresponding_author_name': extracted.corresponding_author_name if extracted else None,
            'corresponding_author_email': extracted.corresponding_author_email if extracted else None,
            'corresponding_author_position': extracted.corresponding_author_position if extracted else None,
            'abstract_view_url': email_sub.attachment_view_url,
            'endorsement_view_url': None,
            'created_at': email_sub.email_received_at
        }
    
    return None

def evaluate_final_decision(submission_id, submission_type='system'):
    """Automatically evaluates the submission based on majority votes."""
    if submission_type == 'system':
        submission = Submission.query.get(submission_id)
        if not submission:
            return
    else:
        # For email submissions, update the email submission status
        email_sub = EmailSubmission.query.get(submission_id)
        if not email_sub:
            return
        # Also get the extracted data to update evaluation_status
        extracted = ExtractedAbstractData.query.filter_by(email_submission_id=submission_id).first()
    
    votes = SubmissionVote.query.filter_by(submission_id=submission_id).all()
    
    endorse_count = 0
    downgrade_count = 0
    reassign_count = 0
    downgrade_type = None

    for vote in votes:
        if vote.vote_status == 'endorse':
            endorse_count += 1
        elif vote.vote_status == 'downgrade':
            downgrade_count += 1
            if vote.vote_downgrade_to:
                downgrade_type = vote.vote_downgrade_to
        elif vote.vote_status == 'reassign':
            reassign_count += 1

    # Final decision logic based on 3 evaluators
    if endorse_count >= 2:  # 2 or more endorse votes
        if submission_type == 'system':
            submission.evaluation_status = 'endorse'
            submission.status = 'endorse'
        else:
            # For email submissions, use 'endorse' status
            email_sub.status = 'endorse'
            if extracted:
                extracted.evaluation_status = 'endorse'
    elif downgrade_count >= 2:  # 2 or more downgrade votes
        if downgrade_type:
            if submission_type == 'system':
                submission.evaluation_status = downgrade_type
                submission.status = 'downgraded'
            else:
                email_sub.status = 'downgraded'
                if extracted:
                    extracted.evaluation_status = downgrade_type
        else:
            if submission_type == 'system':
                submission.evaluation_status = 'downgraded-non_competitive'
                submission.status = 'downgraded'
            else:
                email_sub.status = 'downgraded'
                if extracted:
                    extracted.evaluation_status = 'downgraded-non_competitive'
    elif reassign_count >= 2:  # 2 or more reassign votes
        if submission_type == 'system':
            submission.evaluation_status = 'pending'
        # For email submissions, keep as pending
    else:
        if submission_type == 'system':
            submission.evaluation_status = 'pending'

    db.session.commit()

@app.route('/api/submissions/<string:submission_id>/evaluate', methods=['POST', 'OPTIONS'])
def evaluate_submission(submission_id):
    if request.method == 'OPTIONS':
        return jsonify({})
    
    try:
        data = request.get_json()
        evaluator_id = data.get('evaluator_id')
        vote_status = data.get('vote_status')  # 'endorse', 'downgrade', 'reassign'
        vote_notes = data.get('vote_notes', '')
        vote_reassign_to = data.get('vote_reassign_to', '')
        vote_downgrade_to = data.get('vote_downgrade_to', '')

        # Validations
        if not evaluator_id or not vote_status:
            return jsonify({"detail": "Evaluator ID and vote status are required"}), 400

        if vote_status not in ['endorse', 'downgrade', 'reassign']:
            return jsonify({"detail": "Invalid vote status"}), 400

        # Get submission data (system or email)
        submission_data = get_submission_data(submission_id)
        if not submission_data:
            return jsonify({"detail": "Submission not found"}), 404

        # Check if evaluator already voted
        existing_vote = SubmissionVote.query.filter_by(
            submission_id=submission_id, 
            evaluator_id=evaluator_id
        ).first()
        
        if existing_vote:
            existing_vote.vote_status = vote_status
            existing_vote.vote_notes = vote_notes
            existing_vote.vote_reassign_to = vote_reassign_to
            existing_vote.vote_downgrade_to = vote_downgrade_to
        else:
            new_vote = SubmissionVote(
                submission_id=submission_id,
                evaluator_id=evaluator_id,
                vote_status=vote_status,
                vote_notes=vote_notes,
                vote_reassign_to=vote_reassign_to,
                vote_downgrade_to=vote_downgrade_to
            )
            db.session.add(new_vote)

        # IMMEDIATELY update the submission's thematic area if reassign is selected
        if vote_status == 'reassign' and vote_reassign_to:
            if submission_data['type'] == 'system':
                submission_data['data'].thematic_area = vote_reassign_to
            else:
                # For email submissions, update the extracted data
                extracted = ExtractedAbstractData.query.filter_by(
                    email_submission_id=submission_id
                ).first()
                if extracted:
                    extracted.thematic_area = vote_reassign_to

        db.session.commit()

        # Automatically update status based on all votes
        evaluate_final_decision(submission_id, submission_data['type'])

        # Fetch updated votes
        votes = SubmissionVote.query.filter_by(submission_id=submission_id).all()
        
        # Get the evaluation status based on submission type
        if submission_data['type'] == 'system':
            evaluation_status = submission_data['data'].evaluation_status
        else:
            # For email submissions, use the extracted data evaluation_status
            extracted = ExtractedAbstractData.query.filter_by(email_submission_id=submission_id).first()
            evaluation_status = extracted.evaluation_status if extracted else submission_data['status']

        return jsonify({
            "message": "Vote recorded successfully",
            "evaluation_status": evaluation_status,
            "thematic_area": submission_data['thematic_area'],
            "votes": [{
                "evaluator_id": v.evaluator_id,
                "vote_status": v.vote_status,
                "vote_notes": v.vote_notes,
                "vote_reassign_to": v.vote_reassign_to,
                "vote_downgrade_to": v.vote_downgrade_to
            } for v in votes]
        }), 200
        
    except Exception as e:
        db.session.rollback()
        traceback.print_exc()
        return jsonify({"detail": str(e)}), 500
    
# Get votes for a submission (supports both system and email submissions)
@app.route('/api/submissions/<string:submission_id>/evaluate', methods=['GET', 'OPTIONS'])
def get_submission_votes(submission_id):
    if request.method == 'OPTIONS':
        return jsonify({})

    try:
        # Get submission data (system or email)
        submission_data = get_submission_data(submission_id)
        if not submission_data:
            return jsonify({"detail": "Submission not found"}), 404

        votes = SubmissionVote.query.filter_by(submission_id=submission_id).all()

        # Get evaluation status based on submission type
        if submission_data['type'] == 'system':
            evaluation_status = submission_data['data'].evaluation_status
        else:
            # For email submissions, get from extracted data
            extracted = ExtractedAbstractData.query.filter_by(email_submission_id=submission_id).first()
            evaluation_status = extracted.evaluation_status if extracted else 'pending'

        return jsonify({
            "evaluation_status": evaluation_status,
            "votes": [{
                "id": v.id,
                "evaluator_id": v.evaluator_id,
                "vote_status": v.vote_status,
                "vote_notes": v.vote_notes,
                "vote_reassign_to": v.vote_reassign_to,
                "vote_downgrade_to": v.vote_downgrade_to,
                "updated_at": v.updated_at.strftime('%Y-%m-%d %H:%M:%S') if v.updated_at else None
            } for v in votes]
        }), 200

    except Exception as e:
        return jsonify({"detail": str(e)}), 500

@app.route('/api/submissions/<string:submission_id>/discussions', methods=['POST', 'OPTIONS'])
def post_discussion(submission_id):
    if request.method == 'OPTIONS':
        return jsonify({})
    
    try:
        data = request.get_json()
        evaluator_id = data.get('evaluator_id')
        message = data.get('message', '')

        if not evaluator_id or not message:
            return jsonify({"detail": "Evaluator ID and message are required"}), 400

        # Check if submission exists (system or email)
        submission_data = get_submission_data(submission_id)
        if not submission_data:
            return jsonify({"detail": "Submission not found"}), 404

        # Use the submission_id (VARCHAR) for the discussion
        new_message = EvaluatorDiscussion(
            submission_id=submission_id,
            evaluator_id=evaluator_id,
            message=message
        )
        db.session.add(new_message)
        db.session.commit()

        return jsonify({
            "message": "Discussion posted successfully",
            "id": new_message.id,
            "evaluator_id": new_message.evaluator_id,
            "message": new_message.message,
            "created_at": new_message.created_at.strftime('%Y-%m-%d %H:%M:%S') if new_message.created_at else None
        }), 201

    except Exception as e:
        db.session.rollback()
        traceback.print_exc()
        return jsonify({"detail": str(e)}), 500

@app.route('/api/submissions/<string:submission_id>/discussions', methods=['GET', 'OPTIONS'])
def get_discussions(submission_id):
    if request.method == 'OPTIONS':
        return jsonify({})

    try:
        # Check if submission exists (system or email)
        submission_data = get_submission_data(submission_id)
        if not submission_data:
            return jsonify({"detail": "Submission not found"}), 404

        discussions = EvaluatorDiscussion.query.filter_by(
            submission_id=submission_id
        ).order_by(EvaluatorDiscussion.created_at.asc()).all()

        result = []
        for d in discussions:
            user = User.query.get(d.evaluator_id)
            result.append({
                "id": d.id,
                "evaluator_id": d.evaluator_id,
                "evaluator_name": user.full_name if user else 'Unknown',
                "message": d.message,
                "created_at": d.created_at.strftime('%Y-%m-%d %H:%M:%S') if d.created_at else None
            })

        return jsonify(result), 200

    except Exception as e:
        traceback.print_exc()
        return jsonify({"detail": str(e)}), 500

@app.route('/api/users/<int:user_id>/thematic-areas', methods=['GET', 'OPTIONS'])
def get_user_thematic_areas_simple(user_id):
    """Simple endpoint to get thematic areas for a user."""
    if request.method == 'OPTIONS':
        return jsonify({})
    
    try:
        # Get distinct thematic areas
        submissions = Submission.query.filter_by(user_id=user_id).with_entities(Submission.thematic_area).distinct().all()
        
        thematic_areas = [s[0] for s in submissions if s[0]]
        
        return jsonify({
            "user_id": user_id,
            "thematic_areas": thematic_areas
        }), 200
        
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"detail": str(e)}), 500


@app.route('/api/users/<int:user_id>/thematic-areas', methods=['POST', 'OPTIONS'])
def update_user_thematic_areas_simple(user_id):
    """Simple endpoint to update a submission's thematic area for a user."""
    if request.method == 'OPTIONS':
        return jsonify({})
    
    try:
        data = request.get_json()
        submission_id = data.get('submission_id')
        new_thematic_area = data.get('thematic_area')
        
        if not submission_id or not new_thematic_area:
            return jsonify({"detail": "Submission ID and thematic area are required"}), 400
        
        # Find the submission
        submission = Submission.query.filter_by(id=submission_id, user_id=user_id).first()
        if not submission:
            return jsonify({"detail": "Submission not found"}), 404
        
        # Update
        submission.thematic_area = new_thematic_area
        db.session.commit()
        
        return jsonify({
            "message": "Updated successfully",
            "submission_id": submission_id,
            "new_thematic_area": new_thematic_area
        }), 200
        
    except Exception as e:
        db.session.rollback()
        print(f"Error: {e}")
        return jsonify({"detail": str(e)}), 500
    
@app.route('/api/email-submissions/<int:email_submission_id>/extracted-data', methods=['GET', 'OPTIONS'])
def get_extracted_data(email_submission_id):
    """Get extracted abstract data for an email submission."""
    if request.method == 'OPTIONS':
        return jsonify({})
    
    try:
        # Get the extracted data for this email submission
        extracted = ExtractedAbstractData.query.filter_by(email_submission_id=email_submission_id).first()
        
        if not extracted:
            return jsonify({}), 200 
        
        # Get the email submission to get its status
        email_sub = EmailSubmission.query.get(email_submission_id)
        email_status = email_sub.status if email_sub else 'pending'
        
        return jsonify({
            'id': extracted.id,
            'email_submission_id': extracted.email_submission_id,
            'title': extracted.title,
            'authors': extracted.authors,
            'authors_list': extracted.authors_list,
            'project_leader': extracted.project_leader,
            'sucs': extracted.sucs,
            'corresponding_author_name': extracted.corresponding_author_name,
            'corresponding_author_email': extracted.corresponding_author_email,
            'corresponding_author_position': extracted.corresponding_author_position,
            'paper_category': extracted.paper_category,
            'thematic_area': extracted.thematic_area,
            'theme': extracted.theme,
            # Use email submission status
            'status': email_status,
            'extraction_status': extracted.extraction_status,
            'extraction_error': extracted.extraction_error,
            'extracted_at': extracted.extracted_at.strftime('%Y-%m-%d %H:%M:%S') if extracted.extracted_at else None
        }), 200
        
    except Exception as e:
        print(f"Error fetching extracted data: {e}")
        return jsonify({"detail": str(e)}), 500

@app.route('/api/extracted-data/<int:extracted_data_id>/edit', methods=['PUT', 'OPTIONS'])
def edit_extracted_data(extracted_data_id):
    """Edit extracted data and log the changes."""
    if request.method == 'OPTIONS':
        return jsonify({})

    try:
        data = request.get_json()
        evaluator_id = data.get('evaluator_id')
        
        # Fetch the original data
        extracted = ExtractedAbstractData.query.get(extracted_data_id)
        if not extracted:
            return jsonify({"detail": "Extracted data not found"}), 404

        # Build a list of changed fields
        changes = {}
        
        # Helper to compare and update
        def update_field(field_name, column, max_length=None):
            if field_name in data:
                new_value = data[field_name]
                old_value = getattr(extracted, column)
                
                # Convert to string for comparison
                if new_value != old_value:
                    changes[field_name] = {
                        'old': old_value,
                        'new': new_value
                    }
                    setattr(extracted, column, new_value)

        # Update all editable fields
        update_field('title', 'title')
        update_field('authors', 'authors')
        update_field('authors_list', 'authors_list')
        update_field('project_leader', 'project_leader')
        update_field('sucs', 'sucs')
        update_field('corresponding_author_name', 'corresponding_author_name')
        update_field('corresponding_author_email', 'corresponding_author_email')
        update_field('corresponding_author_position', 'corresponding_author_position')
        update_field('paper_category', 'paper_category')
        update_field('thematic_area', 'thematic_area')
        update_field('theme', 'theme')

        # Save changes if any
        if changes:
            db.session.commit()

            # Create a revision log
            import json
            revision = ExtractedDataRevision(
                extracted_data_id=extracted_data_id,
                edited_by=evaluator_id,
                changes=json.dumps(changes),
                title=extracted.title,
                authors=extracted.authors,
                authors_list=extracted.authors_list,
                project_leader=extracted.project_leader,
                sucs=extracted.sucs,
                corresponding_author_name=extracted.corresponding_author_name,
                corresponding_author_email=extracted.corresponding_author_email,
                corresponding_author_position=extracted.corresponding_author_position,
                paper_category=extracted.paper_category,
                thematic_area=extracted.thematic_area,
                theme=extracted.theme
            )
            db.session.add(revision)
            db.session.commit()

        return jsonify({
            "message": "Data updated successfully",
            "changes": changes,
            "data": {
                'title': extracted.title,
                'authors': extracted.authors,
                'authors_list': extracted.authors_list,
                'project_leader': extracted.project_leader,
                'sucs': extracted.sucs,
                'corresponding_author_name': extracted.corresponding_author_name,
                'corresponding_author_email': extracted.corresponding_author_email,
                'corresponding_author_position': extracted.corresponding_author_position,
                'paper_category': extracted.paper_category,
                'thematic_area': extracted.thematic_area,
                'theme': extracted.theme,
            }
        }), 200

    except Exception as e:
        db.session.rollback()
        print(f"Error editing extracted data: {e}")
        traceback.print_exc()
        return jsonify({"detail": str(e)}), 500


@app.route('/api/extracted-data/<int:extracted_data_id>/revisions', methods=['GET', 'OPTIONS'])
def get_extracted_data_revisions(extracted_data_id):
    """Get all revisions for an extracted data record."""
    if request.method == 'OPTIONS':
        return jsonify({})

    try:
        revisions = ExtractedDataRevision.query.filter_by(
            extracted_data_id=extracted_data_id
        ).order_by(ExtractedDataRevision.created_at.desc()).all()

        result = []
        for rev in revisions:
            user = User.query.get(rev.edited_by)
            result.append({
                'id': rev.id,
                'edited_by': rev.edited_by,
                'edited_by_name': user.full_name if user else 'Unknown',
                'changes': json.loads(rev.changes) if rev.changes else {},
                'snapshot': {
                    'title': rev.title,
                    'authors': rev.authors,
                    'authors_list': rev.authors_list,
                    'project_leader': rev.project_leader,
                    'sucs': rev.sucs,
                    'corresponding_author_name': rev.corresponding_author_name,
                    'corresponding_author_email': rev.corresponding_author_email,
                    'corresponding_author_position': rev.corresponding_author_position,
                    'paper_category': rev.paper_category,
                    'thematic_area': rev.thematic_area,
                    'theme': rev.theme,
                },
                'created_at': rev.created_at.strftime('%Y-%m-%d %H:%M:%S') if rev.created_at else None
            })

        return jsonify(result), 200

    except Exception as e:
        print(f"Error fetching revisions: {e}")
        return jsonify({"detail": str(e)}), 500
    
# ========== MASTER APPROVER ROUTES ==========

@app.route('/api/master-approver/status-summary', methods=['GET', 'OPTIONS'])
def master_approver_status_summary():
    """Get status summary for master approver dashboard."""
    if request.method == 'OPTIONS':
        return jsonify({})
    
    result, status_code = MasterApproverService.get_status_summary()
    return jsonify(result), status_code

@app.route('/api/master-approver/pending-submissions', methods=['GET', 'OPTIONS'])
def master_approver_pending_submissions():
    """Get all pending submissions with vote summaries."""
    if request.method == 'OPTIONS':
        return jsonify({})
    
    result, status_code = MasterApproverService.get_pending_submissions()
    return jsonify(result), status_code

@app.route('/api/submissions/<string:submission_id>/master-status', methods=['POST', 'OPTIONS'])
def set_master_status(submission_id):
    """Master approver sets the final status of a submission."""
    if request.method == 'OPTIONS':
        return jsonify({})
    
    data = request.get_json()
    result, status_code = MasterApproverService.set_final_status(submission_id, data)
    return jsonify(result), status_code

@app.route('/api/submissions/<string:submission_id>/master-details', methods=['GET', 'OPTIONS'])
def get_submission_with_votes(submission_id):
    """Get submission details with all votes and extracted data for master approver."""
    if request.method == 'OPTIONS':
        return jsonify({})
    
    result, status_code = MasterApproverService.get_submission_with_votes(submission_id)
    return jsonify(result), status_code

@app.route('/api/master-approver/bulk-email', methods=['POST', 'OPTIONS'])
def bulk_send_status_emails():
    """Send bulk status update emails."""
    if request.method == 'OPTIONS':
        return jsonify({})
    
    data = request.get_json()
    result, status_code = MasterApproverService.bulk_send_status_emails(data)
    return jsonify(result), status_code

@app.route('/api/payments/upload', methods=['POST', 'OPTIONS'])
def upload_payment_proof():
    """Upload payment proof for a submission."""
    if request.method == 'OPTIONS':
        return jsonify({})
    
    try:
        user_id = request.form.get('user_id')
        submission_id = request.form.get('submission_id')
        reference_number = request.form.get('reference_number')
        payment_amount = request.form.get('payment_amount')
        payment_date = request.form.get('payment_date')
        
        # Validate inputs
        if not user_id or not submission_id:
            return jsonify({"detail": "User ID and Submission ID are required"}), 400
        
        # Check if user exists
        user = User.query.get(user_id)
        if not user:
            return jsonify({"detail": "User not found"}), 404
        
        # Check if submission exists and is endorsed
        submission = Submission.query.get(submission_id)
        if not submission:
            return jsonify({"detail": "Submission not found"}), 404
        
        if submission.status != 'endorse':
            return jsonify({"detail": "Payment is only allowed for endorsed submissions"}), 400
        
        # Check if payment already exists
        existing_payment = Payment.query.filter_by(submission_id=submission_id).first()
        if existing_payment:
            return jsonify({"detail": "Payment already submitted for this submission"}), 400
        
        # Handle file upload
        payment_file = request.files.get('payment_proof')
        if not payment_file or not payment_file.filename:
            return jsonify({"detail": "Payment proof file is required"}), 400
        
        # Check file type (images only)
        allowed_extensions = {'.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.pdf'}
        file_ext = os.path.splitext(payment_file.filename)[1].lower()
        if file_ext not in allowed_extensions:
            return jsonify({"detail": "File must be an image (JPG, PNG, GIF, BMP, WEBP) or PDF"}), 400
        
        # Sanitize filename
        safe_filename = secure_filename(payment_file.filename.replace(' ', '_'))
        
        # Create temp directory
        temp_dir = tempfile.mkdtemp()
        file_path = os.path.join(temp_dir, safe_filename)
        payment_file.save(file_path)
        
        # Upload to Google Drive
        try:
            # Use the project title from submission for folder structure
            view_url, download_url = upload_file_to_drive(
                file_path,
                f"payment_proof_{safe_filename}",
                project_title=submission.extension_project_title,
                sender_name=user.full_name,
                paper_category=submission.paper_category,
                thematic_area=submission.thematic_area
            )
            print(f"✅ Payment proof uploaded to Drive: {view_url}")
        except Exception as drive_error:
            print(f"❌ Drive upload error: {drive_error}")
            # Clean up temp files
            os.remove(file_path)
            os.rmdir(temp_dir)
            return jsonify({"detail": f"Failed to upload payment proof: {str(drive_error)}"}), 500
        
        # Clean up temp files
        os.remove(file_path)
        os.rmdir(temp_dir)
        
        # Create payment record
        payment = Payment(
            user_id=user_id,
            submission_id=submission_id,
            payment_proof_view_url=view_url,
            payment_proof_download_url=download_url,
            payment_status='pending',
            payment_amount=float(payment_amount) if payment_amount else None,
            payment_date=datetime.strptime(payment_date, '%Y-%m-%d') if payment_date else None,
            reference_number=reference_number
        )
        
        db.session.add(payment)
        db.session.commit()
        
        return jsonify({
            "message": "Payment proof uploaded successfully",
            "payment": payment.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        print(f"Error uploading payment proof: {e}")
        traceback.print_exc()
        return jsonify({"detail": str(e)}), 500

@app.route('/api/payments/submission/<string:submission_id>', methods=['GET', 'OPTIONS'])
def get_payment_by_submission(submission_id):
    """Get payment details for a submission."""
    if request.method == 'OPTIONS':
        return jsonify({})
    
    try:
        payment = Payment.query.filter_by(submission_id=submission_id).first()
        if not payment:
            return jsonify({"exists": False}), 200
        
        return jsonify({
            "exists": True,
            "payment": payment.to_dict()
        }), 200
        
    except Exception as e:
        print(f"Error fetching payment: {e}")
        return jsonify({"detail": str(e)}), 500

@app.route('/api/payments/user/<int:user_id>', methods=['GET', 'OPTIONS'])
def get_user_payments(user_id):
    """Get all payments for a user."""
    if request.method == 'OPTIONS':
        return jsonify({})
    
    try:
        payments = Payment.query.filter_by(user_id=user_id).order_by(Payment.created_at.desc()).all()
        return jsonify([p.to_dict() for p in payments]), 200
        
    except Exception as e:
        print(f"Error fetching user payments: {e}")
        return jsonify({"detail": str(e)}), 500

@app.route('/api/payments/<int:payment_id>/verify', methods=['POST', 'OPTIONS'])
def verify_payment(payment_id):
    """Verify a payment (Admin/Master Approver)."""
    if request.method == 'OPTIONS':
        return jsonify({})
    
    try:
        data = request.get_json()
        verifier_id = data.get('verifier_id')
        action = data.get('action')  # 'verify' or 'reject'
        rejection_reason = data.get('rejection_reason', '')
        
        if action not in ['verify', 'reject']:
            return jsonify({"detail": "Invalid action. Must be 'verify' or 'reject'"}), 400
        
        payment = Payment.query.get(payment_id)
        if not payment:
            return jsonify({"detail": "Payment not found"}), 404
        
        # Check if verifier exists and is admin or master_approver
        verifier = User.query.get(verifier_id)
        if not verifier or verifier.role not in ['admin', 'master_approver']:
            return jsonify({"detail": "Unauthorized. Only admins and master approvers can verify payments"}), 403
        
        if action == 'verify':
            payment.payment_status = 'verified'
            payment.verified_by = verifier_id
            payment.verified_at = datetime.now()
        else:  # reject
            payment.payment_status = 'rejected'
            payment.rejection_reason = rejection_reason
        
        db.session.commit()
        
        return jsonify({
            "message": f"Payment {action}ed successfully",
            "payment": payment.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        print(f"Error verifying payment: {e}")
        return jsonify({"detail": str(e)}), 500

@app.route('/api/payments/all', methods=['GET', 'OPTIONS'])
def get_all_payments():
    """Get all payments (Admin/Master Approver)."""
    if request.method == 'OPTIONS':
        return jsonify({})
    
    try:
        status_filter = request.args.get('status', 'all')
        query = Payment.query
        
        if status_filter != 'all':
            query = query.filter_by(payment_status=status_filter)
        
        payments = query.order_by(Payment.created_at.desc()).all()
        
        result = []
        for p in payments:
            payment_data = p.to_dict()
            # Add user and submission info
            user = User.query.get(p.user_id)
            submission = Submission.query.get(p.submission_id)
            payment_data['user_name'] = user.full_name if user else 'Unknown'
            payment_data['user_email'] = user.email if user else 'Unknown'
            payment_data['submission_title'] = submission.extension_project_title if submission else 'Unknown'
            result.append(payment_data)
        
        return jsonify(result), 200
        
    except Exception as e:
        print(f"Error fetching all payments: {e}")
        return jsonify({"detail": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000, host='127.0.0.1')