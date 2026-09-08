from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    full_name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False, index=True)
    hashed_password = db.Column(db.String(255), nullable=False)
    is_active = db.Column(db.Boolean, default=True)
    role = db.Column(db.Enum('user', 'staff', 'evaluator', 'admin', 'master_approver', 'treasurer'), nullable=False, default='user')
    created_at = db.Column(db.DateTime, server_default=db.func.now())
    updated_at = db.Column(db.DateTime, server_default=db.func.now(), onupdate=db.func.now())

    def to_dict(self):
        return {
            'id': self.id,
            'full_name': self.full_name,
            'email': self.email,
            'role': self.role,
            'is_active': self.is_active,
            'created_at': self.created_at.strftime('%Y-%m-%d %H:%M:%S') if self.created_at else None
        }

class Submission(db.Model):
    __tablename__ = 'submissions'
    id = db.Column(db.Integer, primary_key=True)
    submission_id = db.Column(db.String(50), unique=True, nullable=True, index=True) 
    user_id = db.Column(db.Integer, nullable=False, default=0)
    submission_type = db.Column(db.String(50), nullable=True, default='abstract')  
    extension_project_title = db.Column(db.String(255), nullable=False)
    thematic_area = db.Column(db.String(255), nullable=False)
    paper_category = db.Column(db.String(255), nullable=False)
    suc_agencies = db.Column(db.String(255), nullable=True)
    author = db.Column(db.String(255), nullable=False)
    presenter = db.Column(db.String(255), nullable=False)
    corresponding_author_name = db.Column(db.String(255), nullable=True)  
    corresponding_author_position = db.Column(db.String(255), nullable=True)
    corresponding_author_email = db.Column(db.String(255), nullable=True) 
    status = db.Column(db.Enum('pending', 'endorse', 'downgraded'), nullable=False, default='pending')
    evaluation_status = db.Column(db.Enum('pending', 'endorse', 'downgraded-non_competitive', 'downgraded-poster_only'), nullable=False, default='pending')
    co_authors = db.Column(db.Text, nullable=True)
    abstract_view_url = db.Column(db.String(500), nullable=True)
    abstract_download_url = db.Column(db.String(500), nullable=True)
    endorsement_view_url = db.Column(db.String(500), nullable=True)
    endorsement_download_url = db.Column(db.String(500), nullable=True)
    compextproj_drive_view_url = db.Column(db.String(500), nullable=True)
    compextproj_drive_download_url = db.Column(db.String(500), nullable=True)
    created_at = db.Column(db.DateTime, server_default=db.func.now())

    def to_dict(self):
        return {
            'id': self.id,
            'submission_id': self.submission_id,
            'user_id': self.user_id,
            'extension_project_title': self.extension_project_title,
            'thematic_area': self.thematic_area,
            'paper_category': self.paper_category,
            'suc_agencies': self.suc_agencies,
            'author': self.author,
            'presenter': self.presenter,
            'corresponding_author_name': self.corresponding_author_name,  
            'corresponding_author_position': self.corresponding_author_position,
            'corresponding_author_email': self.corresponding_author_email, 
            'status': self.status,
            'evaluation_status': self.evaluation_status,
            'co_authors': self.co_authors,
            'abstract_view_url': self.abstract_view_url,
            'abstract_download_url': self.abstract_download_url,
            'endorsement_view_url': self.endorsement_view_url,
            'endorsement_download_url': self.endorsement_download_url,
            'compextproj_drive_view_url': self.compextproj_drive_view_url,
            'compextproj_drive_download_url': self.compextproj_drive_download_url,
            'created_at': self.created_at.strftime('%Y-%m-%d %H:%M:%S') if self.created_at else None
        }
        
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
    status = db.Column(db.Enum('endorse','downgraded','pending'), nullable=False, default='pending')
    processed_submission_id = db.Column(db.Integer, db.ForeignKey('submissions.id'), nullable=True)
    email_received_at = db.Column(db.DateTime, nullable=False)
    created_at = db.Column(db.DateTime, server_default=db.func.now())
    updated_at = db.Column(db.DateTime, server_default=db.func.now(), onupdate=db.func.now())

    submission = db.relationship('Submission', foreign_keys=[processed_submission_id], backref='email_submissions')
    
    def to_dict(self):
        return {
            'id': self.id,
            'sender_email': self.sender_email,
            'sender_name': self.sender_name,
            'project_leader_name': self.project_leader_name,
            'subject': self.subject,
            'body': self.body[:500] if self.body else '',
            'attachment_filename': self.attachment_filename,
            'attachment_view_url': self.attachment_view_url,
            'attachment_download_url': self.attachment_download_url,
            'status': self.status,
            'processed_submission_id': self.processed_submission_id,
            'email_received_at': self.email_received_at.strftime('%Y-%m-%d %H:%M:%S') if self.email_received_at else None
        }

class ExtractedAbstractData(db.Model):
    __tablename__ = 'extracted_abstract_data'
    id = db.Column(db.Integer, primary_key=True)
    submission_id = db.Column(db.String(50), unique=True, nullable=True, index=True) 
    email_submission_id = db.Column(db.Integer, db.ForeignKey('email_submissions.id'), nullable=False, index=True)
    title = db.Column(db.String(500), nullable=True)
    authors = db.Column(db.Text, nullable=True)
    authors_list = db.Column(db.Text, nullable=True)
    project_leader = db.Column(db.String(255), nullable=True)
    corresponding_author_name = db.Column(db.String(255), nullable=True)
    corresponding_author_email = db.Column(db.String(255), nullable=True)
    corresponding_author_position = db.Column(db.String(255), nullable=True)
    sucs = db.Column(db.String(255), nullable=True)
    paper_category = db.Column(db.String(255), nullable=True)
    thematic_area = db.Column(db.String(255), nullable=True)
    theme = db.Column(db.String(500), nullable=True)
    evaluation_status = db.Column(db.Enum('pending', 'endorse', 'downgraded-non_competitive', 'downgraded-poster_only'), nullable=False, default='pending')
    extraction_status = db.Column(db.Enum('pending', 'extracted', 'failed'), nullable=False, default='pending')
    extraction_error = db.Column(db.Text, nullable=True)
    extracted_at = db.Column(db.DateTime, server_default=db.func.now())
    
    email_submission = db.relationship('EmailSubmission', foreign_keys=[email_submission_id], backref='extracted_data')
    
class ExtractedDataRevision(db.Model):
    __tablename__ = 'extracted_data_revisions'
    id = db.Column(db.Integer, primary_key=True)
    extracted_data_id = db.Column(db.Integer, db.ForeignKey('extracted_abstract_data.id'), nullable=False, index=True)
    edited_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    
    # Fields tracked (only storing what was changed)
    changes = db.Column(db.Text, nullable=True)  # JSON string of changed fields
    
    # Snapshot of the data AFTER the edit
    title = db.Column(db.String(500), nullable=True)
    authors = db.Column(db.Text, nullable=True)
    authors_list = db.Column(db.Text, nullable=True)
    project_leader = db.Column(db.String(255), nullable=True)
    sucs = db.Column(db.String(255), nullable=True)
    corresponding_author_name = db.Column(db.String(255), nullable=True)
    corresponding_author_email = db.Column(db.String(255), nullable=True)
    corresponding_author_position = db.Column(db.String(255), nullable=True)
    paper_category = db.Column(db.String(255), nullable=True)
    thematic_area = db.Column(db.String(255), nullable=True)
    theme = db.Column(db.String(500), nullable=True)
    
    created_at = db.Column(db.DateTime, server_default=db.func.now())

    # Relationships
    extracted_data = db.relationship('ExtractedAbstractData', foreign_keys=[extracted_data_id], backref='revisions')
    editor = db.relationship('User', foreign_keys=[edited_by])
    
class SUC(db.Model):
    __tablename__ = 'sucs'
    id = db.Column(db.Integer, primary_key=True)
    region = db.Column(db.String(100), nullable=False)
    name = db.Column(db.String(255), nullable=False, unique=True)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, server_default=db.func.now())
    updated_at = db.Column(db.DateTime, server_default=db.func.now(), onupdate=db.func.now())

    def to_dict(self):
        return {
            'id': self.id,
            'region': self.region,
            'name': self.name,
            'is_active': self.is_active,
            'created_at': self.created_at.strftime('%Y-%m-%d %H:%M:%S') if self.created_at else None,
            'updated_at': self.updated_at.strftime('%Y-%m-%d %H:%M:%S') if self.updated_at else None
        }

class SubmissionVote(db.Model):
    __tablename__ = 'submission_votes'
    id = db.Column(db.Integer, primary_key=True)
    submission_id = db.Column(db.String(50), nullable=False)
    evaluator_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    vote_status = db.Column(db.String(50), nullable=False)
    vote_notes = db.Column(db.Text, nullable=True)
    vote_reassign_to = db.Column(db.String(255), nullable=True)
    vote_downgrade_to = db.Column(db.String(255), nullable=True)
    created_at = db.Column(db.DateTime, server_default=db.func.now())
    updated_at = db.Column(db.DateTime, server_default=db.func.now(), onupdate=db.func.now())

    # Fixed: Use primaryjoin to join on submission_id string field
    submission = db.relationship(
        'Submission', 
        foreign_keys=[submission_id],
        primaryjoin='SubmissionVote.submission_id == Submission.submission_id',
        backref='votes'
    )
    evaluator = db.relationship('User', foreign_keys=[evaluator_id])

class EvaluatorDiscussion(db.Model):
    __tablename__ = 'evaluator_discussions'
    id = db.Column(db.Integer, primary_key=True)
    submission_id = db.Column(db.String(50), nullable=False)
    evaluator_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    message = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, server_default=db.func.now())

    # Fixed: Use primaryjoin to join on submission_id string field
    submission = db.relationship(
        'Submission',
        foreign_keys=[submission_id],
        primaryjoin='EvaluatorDiscussion.submission_id == Submission.submission_id',
        backref='discussions'
    )
    evaluator = db.relationship('User', foreign_keys=[evaluator_id], backref='discussions')
    
class Payment(db.Model):
    __tablename__ = 'payments'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    submission_id = db.Column(db.String(50), nullable=False)
    payment_proof_view_url = db.Column(db.String(500), nullable=True)
    payment_proof_download_url = db.Column(db.String(500), nullable=True)
    payment_status = db.Column(db.Enum('pending', 'verified', 'rejected'), nullable=False, default='pending')
    payment_amount = db.Column(db.Numeric(10, 2), nullable=True)
    payment_date = db.Column(db.DateTime, nullable=True)
    reference_number = db.Column(db.String(100), nullable=True)
    verified_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    verified_at = db.Column(db.DateTime, nullable=True)
    rejection_reason = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, server_default=db.func.now())
    updated_at = db.Column(db.DateTime, server_default=db.func.now(), onupdate=db.func.now())

    # Relationships
    user = db.relationship('User', foreign_keys=[user_id])
    # Fixed: Use primaryjoin to join on submission_id string field
    submission = db.relationship(
        'Submission',
        foreign_keys=[submission_id],
        primaryjoin='Payment.submission_id == Submission.submission_id'
    )
    verifier = db.relationship('User', foreign_keys=[verified_by])

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'submission_id': self.submission_id,
            'payment_proof_view_url': self.payment_proof_view_url,
            'payment_proof_download_url': self.payment_proof_download_url,
            'payment_status': self.payment_status,
            'payment_amount': float(self.payment_amount) if self.payment_amount else None,
            'payment_date': self.payment_date.strftime('%Y-%m-%d %H:%M:%S') if self.payment_date else None,
            'reference_number': self.reference_number,
            'verified_by': self.verified_by,
            'verified_at': self.verified_at.strftime('%Y-%m-%d %H:%M:%S') if self.verified_at else None,
            'rejection_reason': self.rejection_reason,
            'created_at': self.created_at.strftime('%Y-%m-%d %H:%M:%S') if self.created_at else None,
            'updated_at': self.updated_at.strftime('%Y-%m-%d %H:%M:%S') if self.updated_at else None
        }