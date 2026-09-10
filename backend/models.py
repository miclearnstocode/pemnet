from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import json

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
    project_leader = db.Column(db.String(255), nullable=False)
    presenter = db.Column(db.String(255), nullable=False)
    corresponding_author_name = db.Column(db.String(255), nullable=True)  
    corresponding_author_position = db.Column(db.String(255), nullable=True)
    corresponding_author_email = db.Column(db.String(255), nullable=True) 
    status = db.Column(db.Enum('pending', 'endorse', 'downgraded-non_competitive', 'downgraded-poster_only'), nullable=False, default='pending')
    evaluation_status = db.Column(db.Enum('pending', 'endorse', 'downgraded-non_competitive', 'downgraded-poster_only'), nullable=False, default='pending')
    co_authors = db.Column(db.Text, nullable=True)
    abstract_view_url = db.Column(db.String(500), nullable=True)
    abstract_download_url = db.Column(db.String(500), nullable=True)
    endorsement_view_url = db.Column(db.String(500), nullable=True)
    endorsement_download_url = db.Column(db.String(500), nullable=True)
    compextproj_drive_view_url = db.Column(db.String(500), nullable=True)
    compextproj_drive_download_url = db.Column(db.String(500), nullable=True)
    created_at = db.Column(db.DateTime, server_default=db.func.now())

    revisions = db.relationship('SubmissionRevision', foreign_keys='SubmissionRevision.submission_id',
                                    primaryjoin='Submission.submission_id == SubmissionRevision.submission_id',
                                    backref='submission_ref')

    def to_dict(self):
        return {
            'id': self.id,
            'submission_id': self.submission_id,
            'user_id': self.user_id,
            'extension_project_title': self.extension_project_title,
            'thematic_area': self.thematic_area,
            'paper_category': self.paper_category,
            'suc_agencies': self.suc_agencies,
            'project_leader': self.project_leader,
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
    status = db.Column(db.Enum('pending', 'endorse', 'downgraded-non_competitive', 'downgraded-poster_only'), nullable=False, default='pending')
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
    submission_id = db.Column(db.String(50), nullable=False, index=True)
    evaluator_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    vote_status = db.Column(db.String(50), nullable=False)
    vote_notes = db.Column(db.Text, nullable=True)
    vote_reassign_to = db.Column(db.String(255), nullable=True)
    vote_downgrade_to = db.Column(db.String(255), nullable=True)
    created_at = db.Column(db.DateTime, server_default=db.func.now())
    updated_at = db.Column(db.DateTime, server_default=db.func.now(), onupdate=db.func.now())

    evaluator = db.relationship('User', foreign_keys=[evaluator_id])

class EvaluatorDiscussion(db.Model):
    __tablename__ = 'evaluator_discussions'
    id = db.Column(db.Integer, primary_key=True)
    submission_id = db.Column(db.String(50), nullable=False, index=True)
    evaluator_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    message = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, server_default=db.func.now())

    evaluator = db.relationship('User', foreign_keys=[evaluator_id], backref='discussions')
    
class Payment(db.Model):
    __tablename__ = 'payments'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    submission_id = db.Column(db.String(50), nullable=False, index=True)
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

class EmailNotificationLog(db.Model):
    __tablename__ = 'email_notification_logs'
    id = db.Column(db.Integer, primary_key=True)
    submission_id = db.Column(db.String(50), nullable=False, index=True)
    email_type = db.Column(db.Enum('endorsement', 'status_update', 'confirmation'), nullable=False)
    status = db.Column(db.Enum('pending', 'sent', 'failed'), nullable=False, default='pending')
    recipient_email = db.Column(db.String(255), nullable=False)
    cc_emails = db.Column(db.Text, nullable=True)  # Store as comma-separated list
    subject = db.Column(db.String(500), nullable=True)
    body_preview = db.Column(db.Text, nullable=True)  # First 500 chars of email body
    action_performed = db.Column(db.Enum('endorse', 'downgraded-non_competitive', 'downgraded-poster_only', 'pending'), nullable=False)
    error_message = db.Column(db.Text, nullable=True)
    sent_at = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, server_default=db.func.now())
    
    # For tracking who sent the email
    master_approver_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    
    # Relationships
    master_approver = db.relationship('User', foreign_keys=[master_approver_id])

    def to_dict(self):
        return {
            'id': self.id,
            'submission_id': self.submission_id,
            'email_type': self.email_type,
            'status': self.status,
            'recipient_email': self.recipient_email,
            'cc_emails': self.cc_emails,
            'subject': self.subject,
            'body_preview': self.body_preview,
            'action_performed': self.action_performed,
            'error_message': self.error_message,
            'sent_at': self.sent_at.strftime('%Y-%m-%d %H:%M:%S') if self.sent_at else None,
            'created_at': self.created_at.strftime('%Y-%m-%d %H:%M:%S') if self.created_at else None,
            'master_approver_id': self.master_approver_id
        }

class SubmissionRevision(db.Model):
    __tablename__ = 'submission_revisions'
    id = db.Column(db.Integer, primary_key=True)
    submission_id = db.Column(db.String(50), nullable=False, index=True)
    edited_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    edited_by_name = db.Column(db.String(100), nullable=True)
    is_master_approver = db.Column(db.Boolean, default=False)
    changes = db.Column(db.Text, nullable=True)  # JSON string of changed fields
    
    # Snapshot of the data AFTER the edit
    extension_project_title = db.Column(db.String(255), nullable=True)
    thematic_area = db.Column(db.String(255), nullable=True)
    paper_category = db.Column(db.String(255), nullable=True)
    suc_agencies = db.Column(db.String(255), nullable=True)
    project_leader = db.Column(db.String(255), nullable=True)
    presenter = db.Column(db.String(255), nullable=True)
    corresponding_author_name = db.Column(db.String(255), nullable=True)
    corresponding_author_email = db.Column(db.String(255), nullable=True)
    corresponding_author_position = db.Column(db.String(255), nullable=True)
    co_authors = db.Column(db.Text, nullable=True)
    
    created_at = db.Column(db.DateTime, server_default=db.func.now())
    
    editor = db.relationship('User', foreign_keys=[edited_by])
    
    def to_dict(self):
        return {
            'id': self.id,
            'submission_id': self.submission_id,
            'edited_by': self.edited_by,
            'edited_by_name': self.edited_by_name,
            'is_master_approver': self.is_master_approver,
            'changes': json.loads(self.changes) if self.changes else {},
            'snapshot': {
                'extension_project_title': self.extension_project_title,
                'thematic_area': self.thematic_area,
                'paper_category': self.paper_category,
                'suc_agencies': self.suc_agencies,
                'project_leader': self.project_leader,
                'presenter': self.presenter,
                'corresponding_author_name': self.corresponding_author_name,
                'corresponding_author_email': self.corresponding_author_email,
                'corresponding_author_position': self.corresponding_author_position,
                'co_authors': self.co_authors
            },
            'created_at': self.created_at.strftime('%Y-%m-%d %H:%M:%S') if self.created_at else None
        }
        
class FileMoveLog(db.Model):
    __tablename__ = 'file_move_logs'
    id = db.Column(db.Integer, primary_key=True)
    
    # What was moved
    submission_id = db.Column(db.String(50), nullable=False, index=True)
    submission_type = db.Column(db.Enum('system', 'email'), nullable=False, default='system')
    file_id = db.Column(db.String(255), nullable=True, index=True)  # Google Drive file ID
    file_name = db.Column(db.String(500), nullable=True)
    file_type = db.Column(db.String(50), nullable=True)  # 'abstract', 'endorsement', 'compextproj'
    
    # Where it moved from and to
    old_paper_category = db.Column(db.String(255), nullable=True)
    old_thematic_area = db.Column(db.String(255), nullable=True)
    old_sender_name = db.Column(db.String(255), nullable=True)  # Old project leader name
    old_folder_id = db.Column(db.String(255), nullable=True)
    old_folder_path = db.Column(db.Text, nullable=True)  # Full path for readability
    
    new_paper_category = db.Column(db.String(255), nullable=True)
    new_thematic_area = db.Column(db.String(255), nullable=True)
    new_sender_name = db.Column(db.String(255), nullable=True)
    new_folder_id = db.Column(db.String(255), nullable=True)
    new_folder_path = db.Column(db.Text, nullable=True)
    
    # Status tracking
    status = db.Column(db.Enum('success', 'failed', 'partial'), nullable=False, default='success')
    error_message = db.Column(db.Text, nullable=True)
    
    # What triggered the move
    trigger_field = db.Column(db.String(50), nullable=True)  # 'paper_category', 'thematic_area', 'project_leader', 'multiple'
    triggered_by_user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    triggered_by_name = db.Column(db.String(100), nullable=True)
    
    # Folder cleanup info
    trashed_folders = db.Column(db.Text, nullable=True)  # JSON list of trashed folder names
    
    # Timestamps
    created_at = db.Column(db.DateTime, server_default=db.func.now(), index=True)
    
    # Relationships
    triggered_by = db.relationship('User', foreign_keys=[triggered_by_user_id])
    
    def to_dict(self):
        return {
            'id': self.id,
            'submission_id': self.submission_id,
            'submission_type': self.submission_type,
            'file_id': self.file_id,
            'file_name': self.file_name,
            'file_type': self.file_type,
            'old_paper_category': self.old_paper_category,
            'old_thematic_area': self.old_thematic_area,
            'old_sender_name': self.old_sender_name,
            'old_folder_id': self.old_folder_id,
            'old_folder_path': self.old_folder_path,
            'new_paper_category': self.new_paper_category,
            'new_thematic_area': self.new_thematic_area,
            'new_sender_name': self.new_sender_name,
            'new_folder_id': self.new_folder_id,
            'new_folder_path': self.new_folder_path,
            'status': self.status,
            'error_message': self.error_message,
            'trigger_field': self.trigger_field,
            'triggered_by_user_id': self.triggered_by_user_id,
            'triggered_by_name': self.triggered_by_name,
            'trashed_folders': json.loads(self.trashed_folders) if self.trashed_folders else [],
            'created_at': self.created_at.strftime('%Y-%m-%d %H:%M:%S') if self.created_at else None
        }