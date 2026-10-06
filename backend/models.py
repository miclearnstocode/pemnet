from flask_sqlalchemy import SQLAlchemy
import json

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    full_name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False, index=True)
    hashed_password = db.Column(db.String(191), nullable=False)
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

    extension_project_title = db.Column(db.String(191), nullable=False)
    thematic_area = db.Column(db.String(191), nullable=False)
    paper_category = db.Column(db.String(191), nullable=False)
    suc_agencies = db.Column(db.String(191), nullable=True)
    project_leader = db.Column(db.String(191), nullable=False)
    presenter = db.Column(db.String(191), nullable=False)
    corresponding_author_name = db.Column(db.String(191), nullable=True)
    corresponding_author_position = db.Column(db.String(191), nullable=True)
    corresponding_author_email = db.Column(db.String(191), nullable=True)
    co_authors = db.Column(db.Text, nullable=True)

    # ----- Abstract narrative (so the user can edit later) -----
    community_need        = db.Column(db.Text, nullable=True)
    project_objectives    = db.Column(db.Text, nullable=True)
    extension_methods     = db.Column(db.Text, nullable=True)
    major_outputs         = db.Column(db.Text, nullable=True)
    evidence_outcomes     = db.Column(db.Text, nullable=True)
    supporting_docs       = db.Column(db.Text, nullable=True)
    sustainability        = db.Column(db.Text, nullable=True)
    keywords              = db.Column(db.Text, nullable=True)

    # ----- Drive references (id + view url only) -----
    abstract_file_id        = db.Column(db.String(191), nullable=True)
    abstract_view_url       = db.Column(db.String(500), nullable=True)

    endorsement_file_id     = db.Column(db.String(191), nullable=True)
    endorsement_view_url    = db.Column(db.String(500), nullable=True)

    compextproj_file_id     = db.Column(db.String(191), nullable=True)
    compextproj_drive_view_url = db.Column(db.String(500), nullable=True)
    status = db.Column(db.Enum('pending', 'endorse', 'downgraded-non_competitive', 'downgraded-poster_only'), nullable=False, default='pending')
    evaluation_status = db.Column(db.Enum('pending', 'endorse', 'downgraded-non_competitive', 'downgraded-poster_only'), nullable=False, default='pending')
    created_at = db.Column(db.DateTime, server_default=db.func.now())
    revisions = db.relationship( 'SubmissionRevision', foreign_keys='SubmissionRevision.submission_id', primaryjoin='Submission.submission_id == SubmissionRevision.submission_id', backref='submission_ref',)

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
            'co_authors': self.co_authors,

            # Abstract content
            'community_need': self.community_need,
            'project_objectives': self.project_objectives,
            'extension_methods': self.extension_methods,
            'major_outputs': self.major_outputs,
            'evidence_outcomes': self.evidence_outcomes,
            'supporting_docs': self.supporting_docs,
            'sustainability': self.sustainability,
            'keywords': self.keywords,

            # Drive references
            'abstract_file_id': self.abstract_file_id,
            'abstract_view_url': self.abstract_view_url,
            'endorsement_file_id': self.endorsement_file_id,
            'endorsement_view_url': self.endorsement_view_url,
            'compextproj_file_id': self.compextproj_file_id,
            'compextproj_drive_view_url': self.compextproj_drive_view_url,

            'status': self.status,
            'evaluation_status': self.evaluation_status,
            'created_at': self.created_at.strftime('%Y-%m-%d %H:%M:%S') if self.created_at else None,
        }
        
class FullPaper(db.Model):
    __tablename__ = 'full_papers'
    id = db.Column(db.Integer, primary_key=True)

    submission_id = db.Column(
        db.String(50),
        db.ForeignKey('submissions.submission_id'),
        nullable=False,
        unique=True,
        index=True,
    )
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)

    # ---- Core metadata ----
    title = db.Column(db.String(500), nullable=True)
    authors = db.Column(db.Text, nullable=True)
    affiliations = db.Column(db.Text, nullable=True)
    keywords = db.Column(db.Text, nullable=True)
    abstract = db.Column(db.Text, nullable=True)
    corresponding_name = db.Column(db.String(191), nullable=True)
    corresponding_email = db.Column(db.String(191), nullable=True)
    corresponding_orcid = db.Column(db.String(191), nullable=True)
    paper_category = db.Column(db.String(191), nullable=True)
    thematic_area = db.Column(db.String(191), nullable=True)

    # ---- Section 1 ----
    background_context = db.Column(db.Text, nullable=True)
    evidence_need = db.Column(db.Text, nullable=True)
    related_literature = db.Column(db.Text, nullable=True)
    rationale = db.Column(db.Text, nullable=True)
    objectives = db.Column(db.Text, nullable=True)

    # ---- Section 2 ----
    reach_population = db.Column(db.Text, nullable=True)
    setting_duration = db.Column(db.Text, nullable=True)
    participants_desc = db.Column(db.Text, nullable=True)
    situational_analysis = db.Column(db.Text, nullable=True)
    intervention_rationale = db.Column(db.Text, nullable=True)
    implementation_strategies = db.Column(db.Text, nullable=True)
    partnership = db.Column(db.Text, nullable=True)
    monitoring_eval = db.Column(db.Text, nullable=True)
    data_analysis = db.Column(db.Text, nullable=True)
    ethical_considerations = db.Column(db.Text, nullable=True)

    # ---- Section 3 ----
    reach_implementation = db.Column(db.Text, nullable=True)
    immediate_results = db.Column(db.Text, nullable=True)
    outcomes = db.Column(db.Text, nullable=True)
    adoption = db.Column(db.Text, nullable=True)
    institutionalization = db.Column(db.Text, nullable=True)
    public_value = db.Column(db.Text, nullable=True)

    # ---- Section 4 ----
    interpretation = db.Column(db.Text, nullable=True)
    relationship_literature = db.Column(db.Text, nullable=True)
    factors_affecting = db.Column(db.Text, nullable=True)
    inclusion_resilience = db.Column(db.Text, nullable=True)
    transferability = db.Column(db.Text, nullable=True)
    limitations = db.Column(db.Text, nullable=True)

    # ---- Section 5 ----
    implications = db.Column(db.Text, nullable=True)

    # ---- Section 6 + back matter ----
    conclusion = db.Column(db.Text, nullable=True)
    acknowledgments = db.Column(db.Text, nullable=True)
    funding = db.Column(db.Text, nullable=True)
    conflict_of_interest = db.Column(db.Text, nullable=True)
    ethics_statement = db.Column(db.Text, nullable=True)
    data_availability = db.Column(db.Text, nullable=True)
    author_contributions = db.Column(db.Text, nullable=True)
    references = db.Column(db.Text, nullable=True)
    appendices = db.Column(db.Text, nullable=True)

    # ---- Tables (text only) ----
    table1_title = db.Column(db.String(500), nullable=True)
    table1_rows = db.Column(db.Text, nullable=True)   # JSON: [{indicator, baseline, endline, change, source}, ...]
    table1_note = db.Column(db.Text, nullable=True)
    figure1_title = db.Column(db.String(500), nullable=True)
    figure1_note = db.Column(db.Text, nullable=True)

    # ---- Generated PDFs (Drive metadata only) ----
    full_paper_file_id = db.Column(db.String(191), nullable=True)
    full_paper_view_url = db.Column(db.String(500), nullable=True)
    full_paper_download_url = db.Column(db.String(500), nullable=True)
    preview_file_id = db.Column(db.String(191), nullable=True)
    preview_view_url = db.Column(db.String(500), nullable=True)
    drive_folder_id = db.Column(db.String(191), nullable=True)

    status = db.Column(
        db.Enum('submitted', 'under_review', 'revision', 'accepted', 'rejected'),
        nullable=False,
        default='submitted',
    )
    submitted_at = db.Column(db.DateTime, server_default=db.func.now())
    updated_at = db.Column(
        db.DateTime, server_default=db.func.now(), onupdate=db.func.now()
    )

    # Relationships
    submission = db.relationship(
        'Submission',
        foreign_keys=[submission_id],
        primaryjoin='Submission.submission_id == FullPaper.submission_id',
        backref=db.backref('full_paper', uselist=False),
    )
    user = db.relationship('User', foreign_keys=[user_id])
    figures = db.relationship(
        'FullPaperFigure',
        backref='full_paper',
        cascade='all, delete-orphan',
        order_by='FullPaperFigure.display_order',
    )
    project_design = db.relationship(
        'FullPaperProjectDesign',
        backref='full_paper',
        uselist=False,
        cascade='all, delete-orphan',
    )
    tables = db.relationship(
        'FullPaperTable',
        backref='full_paper',
        cascade='all, delete-orphan',
        order_by='FullPaperTable.display_order',
    )
    
    def to_dict(self, include_children=True):
        data = {
            'id': self.id,
            'submission_id': self.submission_id,
            'user_id': self.user_id,
            'title': self.title,
            'authors': self.authors,
            'affiliations': self.affiliations,
            'keywords': self.keywords,
            'abstract': self.abstract,
            'corresponding_name': self.corresponding_name,
            'corresponding_email': self.corresponding_email,
            'corresponding_orcid': self.corresponding_orcid,
            'paper_category': self.paper_category,
            'thematic_area': self.thematic_area,

            'background_context': self.background_context,
            'evidence_need': self.evidence_need,
            'related_literature': self.related_literature,
            'rationale': self.rationale,
            'objectives': self.objectives,

            'reach_population': self.reach_population,
            'setting_duration': self.setting_duration,
            'participants_desc': self.participants_desc,
            'situational_analysis': self.situational_analysis,
            'intervention_rationale': self.intervention_rationale,
            'implementation_strategies': self.implementation_strategies,
            'partnership': self.partnership,
            'monitoring_eval': self.monitoring_eval,
            'data_analysis': self.data_analysis,
            'ethical_considerations': self.ethical_considerations,

            'reach_implementation': self.reach_implementation,
            'immediate_results': self.immediate_results,
            'outcomes': self.outcomes,
            'adoption': self.adoption,
            'institutionalization': self.institutionalization,
            'public_value': self.public_value,

            'interpretation': self.interpretation,
            'relationship_literature': self.relationship_literature,
            'factors_affecting': self.factors_affecting,
            'inclusion_resilience': self.inclusion_resilience,
            'transferability': self.transferability,
            'limitations': self.limitations,

            'implications': self.implications,

            'conclusion': self.conclusion,
            'acknowledgments': self.acknowledgments,
            'funding': self.funding,
            'conflict_of_interest': self.conflict_of_interest,
            'ethics_statement': self.ethics_statement,
            'data_availability': self.data_availability,
            'author_contributions': self.author_contributions,
            'references': self.references,
            'appendices': self.appendices,

            'table1_title': self.table1_title,
            'table1_rows': json.loads(self.table1_rows) if self.table1_rows else [],
            'table1_note': self.table1_note,
            'figure1_title': self.figure1_title,
            'figure1_note': self.figure1_note,

            'full_paper_file_id': self.full_paper_file_id,
            'full_paper_view_url': self.full_paper_view_url,
            'full_paper_download_url': self.full_paper_download_url,
            'preview_file_id': self.preview_file_id,
            'preview_view_url': self.preview_view_url,
            'drive_folder_id': self.drive_folder_id,

            'status': self.status,
            'submitted_at': self.submitted_at.strftime('%Y-%m-%d %H:%M:%S') if self.submitted_at else None,
            'updated_at': self.updated_at.strftime('%Y-%m-%d %H:%M:%S') if self.updated_at else None,
        }

        if include_children:
            data['figures'] = [f.to_dict() for f in self.figures]
            data['project_design'] = (
                self.project_design.to_dict() if self.project_design else None
            )
            data['tables'] = [t.to_dict() for t in self.tables]

        return data

class FullPaperFigure(db.Model):
    __tablename__ = 'full_paper_figures'
    id = db.Column(db.Integer, primary_key=True)
    full_paper_id = db.Column(
        db.Integer,
        db.ForeignKey('full_papers.id', ondelete='CASCADE'),
        nullable=False,
        index=True,
    )

    title = db.Column(db.String(500), nullable=True)
    note = db.Column(db.Text, nullable=True)

    # Drive references (bytes live on Drive)
    drive_file_id = db.Column(db.String(191), nullable=True)
    view_url = db.Column(db.String(500), nullable=True)
    download_url = db.Column(db.String(500), nullable=True)
    original_filename = db.Column(db.String(500), nullable=True)
    mime_type = db.Column(db.String(100), nullable=True)
    file_size = db.Column(db.Integer, nullable=True)

    display_order = db.Column(db.Integer, default=0)

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'note': self.note,
            'drive_file_id': self.drive_file_id,
            'view_url': self.view_url,
            'download_url': self.download_url,
            'original_filename': self.original_filename,
            'mime_type': self.mime_type,
            'file_size': self.file_size,
            'display_order': self.display_order,
        }
        
class FullPaperProjectDesign(db.Model):
    __tablename__ = 'full_paper_project_designs'
    id = db.Column(db.Integer, primary_key=True)
    full_paper_id = db.Column(
        db.Integer,
        db.ForeignKey('full_papers.id', ondelete='CASCADE'),
        nullable=False,
        unique=True,
        index=True,
    )

    drive_file_id = db.Column(db.String(191), nullable=True)
    view_url = db.Column(db.String(500), nullable=True)
    download_url = db.Column(db.String(500), nullable=True)
    original_filename = db.Column(db.String(500), nullable=True)
    mime_type = db.Column(db.String(100), nullable=True)
    file_size = db.Column(db.Integer, nullable=True)

    def to_dict(self):
        return {
            'id': self.id,
            'drive_file_id': self.drive_file_id,
            'view_url': self.view_url,
            'download_url': self.download_url,
            'original_filename': self.original_filename,
            'mime_type': self.mime_type,
            'file_size': self.file_size,
        }
        
class FullPaperTable(db.Model):
    __tablename__ = 'full_paper_tables'
    id = db.Column(db.Integer, primary_key=True)
    full_paper_id = db.Column(
        db.Integer,
        db.ForeignKey('full_papers.id', ondelete='CASCADE'),
        nullable=False,
        index=True,
    )

    title = db.Column(db.String(500), nullable=True)
    note = db.Column(db.Text, nullable=True)

    # Rows stored as JSON: [ {indicator, baseline, endline, change, source}, ... ]
    rows_json = db.Column(db.Text, nullable=True)

    display_order = db.Column(db.Integer, default=0)

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'note': self.note,
            'rows': json.loads(self.rows_json) if self.rows_json else [],
            'display_order': self.display_order,
        }
        
class SupportingDocument(db.Model):
    __tablename__ = 'supporting_documents'
    id = db.Column(db.Integer, primary_key=True)
    submission_id = db.Column(db.String(50), nullable=False, index=True)
    file_id = db.Column(db.String(191), nullable=True) 
    file_name = db.Column(db.String(500), nullable=True)
    view_url = db.Column(db.String(500), nullable=True)
    download_url = db.Column(db.String(500), nullable=True)
    file_size = db.Column(db.Integer, nullable=True) 
    mime_type = db.Column(db.String(100), nullable=True)
    
    # Folder info in Drive
    folder_id = db.Column(db.String(191), nullable=True) 
    parent_folder_id = db.Column(db.String(191), nullable=True) 
    
    created_at = db.Column(db.DateTime, server_default=db.func.now())

    def to_dict(self):
        return {
            'id': self.id,
            'submission_id': self.submission_id,
            'file_id': self.file_id,
            'file_name': self.file_name,
            'view_url': self.view_url,
            'download_url': self.download_url,
            'file_size': self.file_size,
            'mime_type': self.mime_type,
            'created_at': self.created_at.strftime('%Y-%m-%d %H:%M:%S') if self.created_at else None
        }
        
class EmailSubmission(db.Model):
    __tablename__ = 'email_submissions'
    id = db.Column(db.Integer, primary_key=True)
    email_message_id = db.Column(db.String(191), unique=True, nullable=False, index=True)
    sender_email = db.Column(db.String(191), nullable=False)
    sender_name = db.Column(db.String(191), nullable=True)
    project_leader_name = db.Column(db.String(191), nullable=True)
    subject = db.Column(db.String(500), nullable=False)
    body = db.Column(db.Text, nullable=True)
    attachment_filename = db.Column(db.String(191), nullable=True)
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
    project_leader = db.Column(db.String(191), nullable=True)
    corresponding_author_name = db.Column(db.String(191), nullable=True)
    corresponding_author_email = db.Column(db.String(191), nullable=True)
    corresponding_author_position = db.Column(db.String(191), nullable=True)
    sucs = db.Column(db.String(191), nullable=True)
    paper_category = db.Column(db.String(191), nullable=True)
    thematic_area = db.Column(db.String(191), nullable=True)
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
    project_leader = db.Column(db.String(191), nullable=True)
    sucs = db.Column(db.String(191), nullable=True)
    corresponding_author_name = db.Column(db.String(191), nullable=True)
    corresponding_author_email = db.Column(db.String(191), nullable=True)
    corresponding_author_position = db.Column(db.String(191), nullable=True)
    paper_category = db.Column(db.String(191), nullable=True)
    thematic_area = db.Column(db.String(191), nullable=True)
    theme = db.Column(db.String(500), nullable=True)
    
    created_at = db.Column(db.DateTime, server_default=db.func.now())

    # Relationships
    extracted_data = db.relationship('ExtractedAbstractData', foreign_keys=[extracted_data_id], backref='revisions')
    editor = db.relationship('User', foreign_keys=[edited_by])
    
class SUC(db.Model):
    __tablename__ = 'sucs'
    id = db.Column(db.Integer, primary_key=True)
    region = db.Column(db.String(100), nullable=False)
    name = db.Column(db.String(191), nullable=False, unique=True)
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
    vote_reassign_to = db.Column(db.String(191), nullable=True)
    vote_downgrade_to = db.Column(db.String(191), nullable=True)
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
    recipient_email = db.Column(db.String(191), nullable=False)
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
    extension_project_title = db.Column(db.String(191), nullable=True)
    thematic_area = db.Column(db.String(191), nullable=True)
    paper_category = db.Column(db.String(191), nullable=True)
    suc_agencies = db.Column(db.String(191), nullable=True)
    project_leader = db.Column(db.String(191), nullable=True)
    presenter = db.Column(db.String(191), nullable=True)
    corresponding_author_name = db.Column(db.String(191), nullable=True)
    corresponding_author_email = db.Column(db.String(191), nullable=True)
    corresponding_author_position = db.Column(db.String(191), nullable=True)
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
    file_id = db.Column(db.String(191), nullable=True, index=True)  # Google Drive file ID
    file_name = db.Column(db.String(500), nullable=True)
    file_type = db.Column(db.String(50), nullable=True)  # 'abstract', 'endorsement', 'compextproj'
    
    # Where it moved from and to
    old_paper_category = db.Column(db.String(191), nullable=True)
    old_thematic_area = db.Column(db.String(191), nullable=True)
    old_sender_name = db.Column(db.String(191), nullable=True)  # Old project leader name
    old_folder_id = db.Column(db.String(191), nullable=True)
    old_folder_path = db.Column(db.Text, nullable=True)  # Full path for readability
    
    new_paper_category = db.Column(db.String(191), nullable=True)
    new_thematic_area = db.Column(db.String(191), nullable=True)
    new_sender_name = db.Column(db.String(191), nullable=True)
    new_folder_id = db.Column(db.String(191), nullable=True)
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
        
class PasswordReset(db.Model):
    __tablename__ = 'password_resets'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    email = db.Column(db.String(191), nullable=False, index=True)
    otp_code = db.Column(db.String(6), nullable=False)          # displayed only during dev
    otp_hash = db.Column(db.String(191), nullable=False)        # bcrypt hash of OTP
    reset_token = db.Column(db.String(191), nullable=True)      # opaque token after verify
    token_hash = db.Column(db.String(191), nullable=True, index=True)
    attempts = db.Column(db.Integer, nullable=False, default=0)
    verified = db.Column(db.Boolean, nullable=False, default=False)
    used = db.Column(db.Boolean, nullable=False, default=False)
    expires_at = db.Column(db.DateTime, nullable=False, index=True)
    created_at = db.Column(db.DateTime, server_default=db.func.now())
    verified_at = db.Column(db.DateTime, nullable=True)
    ip_address = db.Column(db.String(64), nullable=True)
    user_agent = db.Column(db.String(255), nullable=True)

    user = db.relationship('User', foreign_keys=[user_id], backref='password_resets')

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'email': self.email,
            'verified': self.verified,
            'used': self.used,
            'attempts': self.attempts,
            'expires_at': self.expires_at.strftime('%Y-%m-%d %H:%M:%S') if self.expires_at else None,
            'created_at': self.created_at.strftime('%Y-%m-%d %H:%M:%S') if self.created_at else None,
        }
    
class NewsEvent(db.Model):
    __tablename__ = 'news_events'
    id = db.Column(db.Integer, primary_key=True)
    type = db.Column(db.Enum('NEWS', 'EVENT', 'ANNOUNCEMENT'), nullable=False, default='NEWS')
    title = db.Column(db.String(500), nullable=False)
    excerpt = db.Column(db.Text, nullable=True)
    content = db.Column(db.Text, nullable=True)
    date_display = db.Column(db.String(100), nullable=False)  # Display date like "May 20, 2026"
    event_start_date = db.Column(db.DateTime, nullable=True)  # Actual date for sorting
    event_end_date = db.Column(db.DateTime, nullable=True)
    tag = db.Column(db.String(100), nullable=True)
    tag_color = db.Column(db.String(100), nullable=True, default='bg-blue-50 text-blue-700 border-blue-200')
    type_color = db.Column(db.String(100), nullable=True, default='bg-yellow-100 text-yellow-800')
    image_url = db.Column(db.String(500), nullable=True)
    is_published = db.Column(db.Boolean, default=True)
    is_featured = db.Column(db.Boolean, default=False)
    views_count = db.Column(db.Integer, default=0)
    created_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    created_at = db.Column(db.DateTime, server_default=db.func.now())
    updated_at = db.Column(db.DateTime, server_default=db.func.now(), onupdate=db.func.now())

    creator = db.relationship('User', foreign_keys=[created_by])

    def to_dict(self):
        return {
            'id': self.id,
            'type': self.type,
            'title': self.title,
            'excerpt': self.excerpt,
            'content': self.content,
            'date_display': self.date_display,
            'event_start_date': self.event_start_date.strftime('%Y-%m-%d %H:%M:%S') if self.event_start_date else None,
            'event_end_date': self.event_end_date.strftime('%Y-%m-%d %H:%M:%S') if self.event_end_date else None,
            'tag': self.tag,
            'tag_color': self.tag_color,
            'type_color': self.type_color,
            'image_url': self.image_url,
            'is_published': self.is_published,
            'is_featured': self.is_featured,
            'views_count': self.views_count,
            'created_by': self.created_by,
            'created_at': self.created_at.strftime('%Y-%m-%d %H:%M:%S') if self.created_at else None,
            'updated_at': self.updated_at.strftime('%Y-%m-%d %H:%M:%S') if self.updated_at else None
        }
        
class AboutContent(db.Model):
    __tablename__ = 'about_content'
    id = db.Column(db.Integer, primary_key=True)
    section_key = db.Column(db.String(100), unique=True, nullable=False, index=True)
    content = db.Column(db.Text, nullable=True)
    updated_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    created_at = db.Column(db.DateTime, server_default=db.func.now())
    updated_at = db.Column(db.DateTime, server_default=db.func.now(), onupdate=db.func.now())
    
    updater = db.relationship('User', foreign_keys=[updated_by])
    
    def to_dict(self):
        return {
            'id': self.id,
            'section_key': self.section_key,
            'content': json.loads(self.content) if self.content else {},
            'updated_by': self.updated_by,
            'created_at': self.created_at.strftime('%Y-%m-%d %H:%M:%S') if self.created_at else None,
            'updated_at': self.updated_at.strftime('%Y-%m-%d %H:%M:%S') if self.updated_at else None
        }


class AboutStat(db.Model):
    """Individual stats cards on the About page"""
    __tablename__ = 'about_stats'
    id = db.Column(db.Integer, primary_key=True)
    
    # Stat info
    value = db.Column(db.String(50), nullable=False)  # e.g., "85+"
    label = db.Column(db.String(200), nullable=False)  # e.g., "Member Institutions"
    sublabel = db.Column(db.String(200), nullable=True)  # e.g., "Across the Philippines"
    
    # Styling
    icon_type = db.Column(db.String(50), nullable=False, default='users')  # icon identifier
    color_theme = db.Column(db.String(50), nullable=False, default='blue')  # blue, green, yellow, purple
    
    # Ordering
    display_order = db.Column(db.Integer, default=0)
    is_active = db.Column(db.Boolean, default=True)
    
    # Metadata
    updated_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    created_at = db.Column(db.DateTime, server_default=db.func.now())
    updated_at = db.Column(db.DateTime, server_default=db.func.now(), onupdate=db.func.now())
    
    updater = db.relationship('User', foreign_keys=[updated_by])
    
    def to_dict(self):
        return {
            'id': self.id,
            'value': self.value,
            'label': self.label,
            'sublabel': self.sublabel,
            'icon_type': self.icon_type,
            'color_theme': self.color_theme,
            'display_order': self.display_order,
            'is_active': self.is_active,
            'updated_by': self.updated_by,
            'created_at': self.created_at.strftime('%Y-%m-%d %H:%M:%S') if self.created_at else None,
            'updated_at': self.updated_at.strftime('%Y-%m-%d %H:%M:%S') if self.updated_at else None
        }


class AboutCard(db.Model):
    """Cards for the "What We Do" section"""
    __tablename__ = 'about_cards'
    id = db.Column(db.Integer, primary_key=True)
    
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=True)
    
    # Styling
    icon_type = db.Column(db.String(50), nullable=False, default='document')
    color_theme = db.Column(db.String(50), nullable=False, default='blue')
    
    # Ordering
    display_order = db.Column(db.Integer, default=0)
    is_active = db.Column(db.Boolean, default=True)
    
    # Metadata
    updated_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    created_at = db.Column(db.DateTime, server_default=db.func.now())
    updated_at = db.Column(db.DateTime, server_default=db.func.now(), onupdate=db.func.now())
    
    updater = db.relationship('User', foreign_keys=[updated_by])
    
    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'icon_type': self.icon_type,
            'color_theme': self.color_theme,
            'display_order': self.display_order,
            'is_active': self.is_active,
            'updated_by': self.updated_by,
            'created_at': self.created_at.strftime('%Y-%m-%d %H:%M:%S') if self.created_at else None,
            'updated_at': self.updated_at.strftime('%Y-%m-%d %H:%M:%S') if self.updated_at else None
        }


class AboutFeature(db.Model):
    """Features/bullet points (e.g., the checkmarked list under "What is PEMNet?")"""
    __tablename__ = 'about_features'
    id = db.Column(db.Integer, primary_key=True)
    
    text = db.Column(db.Text, nullable=False)
    section = db.Column(db.String(50), nullable=False, default='what_is')  # which section it belongs to
    
    display_order = db.Column(db.Integer, default=0)
    is_active = db.Column(db.Boolean, default=True)
    
    # Metadata
    updated_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    created_at = db.Column(db.DateTime, server_default=db.func.now())
    updated_at = db.Column(db.DateTime, server_default=db.func.now(), onupdate=db.func.now())
    
    updater = db.relationship('User', foreign_keys=[updated_by])
    
    def to_dict(self):
        return {
            'id': self.id,
            'text': self.text,
            'section': self.section,
            'display_order': self.display_order,
            'is_active': self.is_active,
            'updated_by': self.updated_by,
            'created_at': self.created_at.strftime('%Y-%m-%d %H:%M:%S') if self.created_at else None,
            'updated_at': self.updated_at.strftime('%Y-%m-%d %H:%M:%S') if self.updated_at else None
        }