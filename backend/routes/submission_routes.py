import os
import tempfile
import traceback
from flask import Blueprint, jsonify, request
from werkzeug.utils import secure_filename

from models import db, Submission, User, SupportingDocument
from google_drive import upload_file_to_drive, get_drive_service
from services.submission_id_service import generate_submission_id

submission_bp = Blueprint('submissions', __name__)


# ---------------------------------------------------------------------------
# Filename helpers
# ---------------------------------------------------------------------------

_PREFIXES = (
    'abstract_',
    'endorsement_',
    'full_paper_',
    'preview_',
    'supporting_',
)


def strip_known_prefixes(name: str) -> str:
    """
    Strip any previously-added internal prefixes so we never end up with
    'abstract_abstract_...' or 'endorsement_endorsement_...' in Drive.

    Only strips prefixes repeatedly (covers legacy double prefixes).
    """
    if not name:
        return name
    base = name
    changed = True
    while changed:
        changed = False
        for p in _PREFIXES:
            if base.startswith(p):
                base = base[len(p):]
                changed = True
                break
    return base or name


def safe_drive_name(upload_filename: str, kind: str) -> str:
    """
    Build the filename we hand to Drive.

    * kind in {'abstract', 'endorsement', 'supporting'} — prepends a single
      canonical prefix like 'abstract_...' / 'endorsement_...'
    * The original extension is preserved (.pdf, .png, etc.)
    * Any prior internal prefix on the incoming name is stripped first.
    """
    if not upload_filename:
        upload_filename = f"{kind}.pdf"

    # Separate name and extension
    stem, ext = os.path.splitext(upload_filename)
    stem = strip_known_prefixes(stem)
    stem = secure_filename(stem.replace(' ', '_')) or f"{kind}"
    ext = ext or '.pdf'
    return f"{kind}_{stem}{ext}"


# ---------------------------------------------------------------------------
# Submit abstract
# ---------------------------------------------------------------------------

@submission_bp.route('/api/submit', methods=['POST', 'OPTIONS'])
def submit():
    if request.method == 'OPTIONS':
        return jsonify({})

    temp_files = []
    temp_dir = None

    try:
        user_id = request.form.get('user_id', 0)
        extension_project_title = request.form.get('extension_project_title', '')
        thematic_area = request.form.get('thematic_area', '')
        paper_category = request.form.get('paper_category', '')
        suc_agencies = request.form.get('suc_agencies', '')
        project_leader = request.form.get('project_leader', '')
        presenter = request.form.get('presenter', '')
        corresponding_author_name = request.form.get('corresponding_author_name', '')
        corresponding_author_position = request.form.get('corresponding_author_position', '')
        corresponding_author_email = request.form.get('corresponding_author_email', '')
        co_authors = request.form.get('co_authors', '')

        community_need = request.form.get('community_need', '')
        project_objectives = request.form.get('project_objectives', '')
        extension_methods = request.form.get('extension_methods', '')
        major_outputs = request.form.get('major_outputs', '')
        evidence_outcomes = request.form.get('evidence_outcomes', '')
        supporting_docs = request.form.get('supporting_docs', '')
        sustainability = request.form.get('sustainability', '')
        keywords = request.form.get('keywords', '')

        missing = []
        for key, val in [
            ('extension_project_title', extension_project_title),
            ('thematic_area', thematic_area),
            ('paper_category', paper_category),
            ('project_leader', project_leader),
            ('presenter', presenter),
        ]:
            if not val:
                missing.append(key)
        if missing:
            return jsonify({"detail": f"Missing required fields: {', '.join(missing)}"}), 400

        try:
            user_id = int(user_id) if user_id else 0
        except ValueError:
            user_id = 0

        co_authors = (co_authors or '').strip() or None

        abstract_file = request.files.get('abstract_file')
        endorsement_file = request.files.get('endorsement_file')
        supporting_files = request.files.getlist('supporting_documents')

        if not endorsement_file or not endorsement_file.filename:
            return jsonify({"detail": "Endorsement file is required"}), 400
        if not endorsement_file.filename.lower().endswith('.pdf'):
            return jsonify({"detail": "Endorsement file must be a PDF"}), 400
        if not abstract_file or not abstract_file.filename:
            return jsonify({"detail": "Abstract file is required"}), 400
        if not abstract_file.filename.lower().endswith('.pdf'):
            return jsonify({"detail": "Abstract file must be a PDF"}), 400

        # Compute clean Drive filenames ONCE, before writing temp files.
        abstract_drive_name = safe_drive_name(abstract_file.filename, 'abstract')
        endorsement_drive_name = safe_drive_name(endorsement_file.filename, 'endorsement')

        # Local temp names — use the *stripped* stem + extension
        safe_abstract_name = os.path.splitext(abstract_drive_name)[0] + os.path.splitext(abstract_file.filename)[1].lower()
        safe_endorsement_name = os.path.splitext(endorsement_drive_name)[0] + os.path.splitext(endorsement_file.filename)[1].lower()

        temp_dir = tempfile.mkdtemp()

        abstract_path = os.path.join(temp_dir, safe_abstract_name)
        abstract_file.save(abstract_path)
        temp_files.append(abstract_path)

        endorsement_path = os.path.join(temp_dir, safe_endorsement_name)
        endorsement_file.save(endorsement_path)
        temp_files.append(endorsement_path)

        supporting_file_paths = []
        for idx, sf in enumerate(supporting_files):
            if not sf or not sf.filename:
                continue
            # Preserve original name for storage but write a sanitized temp file
            sf_drive_name = safe_drive_name(sf.filename, 'supporting')
            unique_name = f"{idx}_{sf_drive_name}"
            sf_path = os.path.join(temp_dir, unique_name)
            sf.save(sf_path)
            temp_files.append(sf_path)
            supporting_file_paths.append({
                'path': sf_path,
                'original_name': sf.filename,
                'size': os.path.getsize(sf_path),
                'mime_type': sf.content_type or 'application/octet-stream',
            })

        # ---- Drive: abstract ----
        try:
            abstract_file_id, abstract_view_url = upload_file_to_drive(
                abstract_path,
                abstract_drive_name,          # e.g. "abstract_From_Farm_Residue_....pdf"
                project_title=extension_project_title,
                sender_name=project_leader,
                paper_category=paper_category,
                thematic_area=thematic_area,
            )
        except Exception as drive_error:
            print(f"Drive upload error (abstract): {drive_error}")
            traceback.print_exc()
            return jsonify({"detail": f"Failed to upload abstract to Google Drive: {drive_error}"}), 500

        # ---- Drive: endorsement ----
        try:
            endorsement_file_id, endorsement_view_url = upload_file_to_drive(
                endorsement_path,
                endorsement_drive_name,       # e.g. "endorsement_From_Farm_Residue_....pdf"
                project_title=extension_project_title,
                sender_name=project_leader,
                paper_category=paper_category,
                thematic_area=thematic_area,
            )
        except Exception as drive_error:
            print(f"Drive upload error (endorsement): {drive_error}")
            traceback.print_exc()
            return jsonify({"detail": f"Failed to upload endorsement to Google Drive: {drive_error}"}), 500

        # ---- Resolve sender folder ID ----
        sender_folder_id = None
        try:
            service = get_drive_service()
            file_info = service.files().get(
                fileId=abstract_file_id,
                fields='parents',
                supportsAllDrives=True,
            ).execute()
            parents = file_info.get('parents', [])
            sender_folder_id = parents[0] if parents else None
        except Exception as folder_err:
            print(f"⚠️ Could not resolve sender folder ID: {folder_err}")

        submission_id_value = generate_submission_id()

        # ---- Drive: supporting documents ----
        supporting_docs_metadata = []
        if supporting_file_paths and sender_folder_id:
            try:
                from google_drive import upload_supporting_document_to_drive

                for sf in supporting_file_paths:
                    try:
                        sf_id, sf_view_url = upload_supporting_document_to_drive(
                            sf['path'], sf['original_name'], sender_folder_id,
                        )
                        sf_download_url = f"https://drive.google.com/uc?export=download&id={sf_id}"
                        supporting_docs_metadata.append({
                            'file_id': sf_id,
                            'file_name': sf['original_name'],
                            'view_url': sf_view_url,
                            'download_url': sf_download_url,
                            'file_size': sf['size'],
                            'mime_type': sf['mime_type'],
                            'folder_id': None,
                            'parent_folder_id': sender_folder_id,
                        })
                    except Exception as sf_err:
                        print(f"❌ Failed to upload supporting document '{sf['original_name']}': {sf_err}")
                        traceback.print_exc()
            except Exception as e:
                print(f"⚠️ Error uploading supporting documents: {e}")
                traceback.print_exc()

        # ---- Persist submission ----
        new_submission = Submission(
            user_id=user_id,
            submission_id=submission_id_value,
            extension_project_title=extension_project_title,
            thematic_area=thematic_area,
            paper_category=paper_category,
            suc_agencies=suc_agencies,
            project_leader=project_leader,
            presenter=presenter,
            corresponding_author_name=corresponding_author_name,
            corresponding_author_position=corresponding_author_position,
            corresponding_author_email=corresponding_author_email,
            co_authors=co_authors,
            community_need=community_need,
            project_objectives=project_objectives,
            extension_methods=extension_methods,
            major_outputs=major_outputs,
            evidence_outcomes=evidence_outcomes,
            supporting_docs=supporting_docs,
            sustainability=sustainability,
            keywords=keywords,
            abstract_file_id=abstract_file_id,
            abstract_view_url=abstract_view_url,
            endorsement_file_id=endorsement_file_id,
            endorsement_view_url=endorsement_view_url,
            status='pending',
            has_full_paper=False,
        )
        db.session.add(new_submission)
        db.session.flush()

        for sfd in supporting_docs_metadata:
            db.session.add(SupportingDocument(
                submission_id=submission_id_value,
                file_id=sfd['file_id'],
                file_name=sfd['file_name'],
                view_url=sfd['view_url'],
                download_url=sfd['download_url'],
                file_size=sfd['file_size'],
                mime_type=sfd['mime_type'],
                folder_id=sfd.get('folder_id'),
                parent_folder_id=sfd.get('parent_folder_id'),
            ))

        db.session.commit()

        return jsonify({
            "message": "Submission successful",
            "submission_id": new_submission.id,
            "submission_id_format": submission_id_value,
            "status": "pending",
            "abstract_file_id": abstract_file_id,
            "abstract_view_url": abstract_view_url,
            "endorsement_file_id": endorsement_file_id,
            "endorsement_view_url": endorsement_view_url,
            "supporting_documents_count": len(supporting_docs_metadata),
            "supporting_documents": supporting_docs_metadata,
        }), 200

    except Exception as e:
        db.session.rollback()
        print(f"Submission error: {e}")
        traceback.print_exc()
        return jsonify({"detail": str(e), "error_type": type(e).__name__}), 500
    finally:
        for fp in temp_files:
            try:
                if os.path.exists(fp):
                    os.remove(fp)
            except Exception:
                pass
        if temp_dir and os.path.exists(temp_dir):
            try:
                os.rmdir(temp_dir)
            except Exception:
                pass


@submission_bp.route('/api/submissions/user/<int:user_id>', methods=['GET', 'OPTIONS'])
def get_user_submissions(user_id):
    if request.method == 'OPTIONS':
        return jsonify({})

    try:
        user = User.query.get(user_id)
        if not user:
            return jsonify({"detail": "User not found"}), 404

        submissions = Submission.query.filter_by(user_id=user_id)\
            .order_by(Submission.created_at.desc()).all()

        result = []
        for s in submissions:
            supporting_docs = SupportingDocument.query.filter_by(
                submission_id=s.submission_id
            ).all()

            result.append({
                'id': s.id,
                'submission_id': s.submission_id,
                'user_id': s.user_id,
                'extension_project_title': s.extension_project_title,
                'thematic_area': s.thematic_area,
                'paper_category': s.paper_category,
                'suc_agencies': s.suc_agencies,
                'project_leader': s.project_leader,
                'presenter': s.presenter,
                'corresponding_author_name': s.corresponding_author_name,
                'corresponding_author_email': s.corresponding_author_email,
                'corresponding_author_position': s.corresponding_author_position,
                'co_authors': s.co_authors,
                'community_need': s.community_need,
                'project_objectives': s.project_objectives,
                'extension_methods': s.extension_methods,
                'major_outputs': s.major_outputs,
                'evidence_outcomes': s.evidence_outcomes,
                'supporting_docs': s.supporting_docs,
                'sustainability': s.sustainability,
                'keywords': s.keywords,
                'abstract_file_id': s.abstract_file_id,
                'abstract_view_url': s.abstract_view_url,
                'endorsement_file_id': s.endorsement_file_id,
                'endorsement_view_url': s.endorsement_view_url,
                'compextproj_file_id': s.compextproj_file_id,
                'compextproj_drive_view_url': s.compextproj_drive_view_url,
                'supporting_documents': [doc.to_dict() for doc in supporting_docs],
                'status': s.status,
                'evaluation_status': s.evaluation_status,
                'has_full_paper': bool(s.has_full_paper) if s.has_full_paper is not None else False,
                'full_paper_submitted_at': (
                    s.full_paper_submitted_at.strftime('%Y-%m-%d %H:%M:%S')
                    if s.full_paper_submitted_at else None
                ),
                'created_at': s.created_at.strftime('%Y-%m-%d %H:%M:%S') if s.created_at else None,
            })

        return jsonify(result), 200

    except Exception as e:
        print(f"Error fetching user submissions: {e}")
        traceback.print_exc()
        return jsonify({"detail": str(e)}), 500


@submission_bp.route('/api/submissions', methods=['GET', 'OPTIONS'])
def get_submissions():
    if request.method == 'OPTIONS':
        return jsonify({})

    try:
        submissions = Submission.query.order_by(Submission.created_at.desc()).all()

        result = [{
            'id': s.id,
            'submission_id': s.submission_id,
            'user_id': s.user_id,
            'extension_project_title': s.extension_project_title,
            'thematic_area': s.thematic_area,
            'paper_category': s.paper_category,
            'suc_agencies': s.suc_agencies,
            'project_leader': s.project_leader,
            'presenter': s.presenter,
            'corresponding_author_name': s.corresponding_author_name,
            'corresponding_author_email': s.corresponding_author_email,
            'corresponding_author_position': s.corresponding_author_position,
            'status': s.status,
            'evaluation_status': s.evaluation_status,
            'co_authors': s.co_authors,
            'abstract_view_url': s.abstract_view_url,
            'endorsement_view_url': s.endorsement_view_url,
            'compextproj_drive_view_url': s.compextproj_drive_view_url,
            'has_full_paper': bool(s.has_full_paper) if s.has_full_paper is not None else False,
            'full_paper_submitted_at': (
                s.full_paper_submitted_at.strftime('%Y-%m-%d %H:%M:%S')
                if s.full_paper_submitted_at else None
            ),
            'created_at': s.created_at.strftime('%Y-%m-%d %H:%M:%S') if s.created_at else None,
        } for s in submissions]

        return jsonify(result), 200

    except Exception as e:
        print(f"Error fetching submissions: {e}")
        traceback.print_exc()
        return jsonify({"detail": str(e)}), 500


@submission_bp.route('/api/submissions/<string:submission_id>/status', methods=['PUT', 'OPTIONS'])
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
            "status": submission.status,
        }), 200

    except Exception as e:
        db.session.rollback()
        print(f"Error updating status: {e}")
        traceback.print_exc()
        return jsonify({"detail": str(e)}), 500


@submission_bp.route('/api/submissions/<string:submission_id>/compextproj', methods=['PUT', 'OPTIONS'])
def update_compextproj_urls(submission_id):
    if request.method == 'OPTIONS':
        return jsonify({})

    try:
        data = request.get_json()
        view_url = data.get('compextproj_drive_view_url')

        submission = Submission.query.get(submission_id)
        if not submission:
            return jsonify({"detail": "Submission not found"}), 404

        if view_url:
            submission.compextproj_drive_view_url = view_url

        db.session.commit()

        return jsonify({"message": "Comp Ext Project URL updated successfully","id": submission.id,"compextproj_drive_view_url": submission.compextproj_drive_view_url,}), 200

    except Exception as e:
        db.session.rollback()
        print(f"Error updating URLs: {e}")
        traceback.print_exc()
        return jsonify({"detail": str(e)}), 500


@submission_bp.route('/api/submissions/<string:submission_id>/supporting-documents', methods=['GET', 'OPTIONS'])
def get_supporting_documents(submission_id):
    if request.method == 'OPTIONS':
        return jsonify({})

    try:
        docs = SupportingDocument.query.filter_by(submission_id=submission_id).all()
        return jsonify([doc.to_dict() for doc in docs]), 200
    except Exception as e:
        print(f"Error fetching supporting documents: {e}")
        traceback.print_exc()
        return jsonify({"detail": str(e)}), 500


@submission_bp.route('/api/sucs', methods=['GET', 'OPTIONS'])
def get_sucs():
    if request.method == 'OPTIONS':
        return jsonify({})

    try:
        from models import SUC
        search = request.args.get('search')
        query = SUC.query.filter_by(is_active=True)

        if search:
            query = query.filter(
                db.or_(
                    SUC.name.like(f'%{search}%'),
                    SUC.region.like(f'%{search}%'),
                )
            )

        sucs = query.order_by(SUC.name).all()
        return jsonify([{'id': s.id, 'region': s.region, 'name': s.name} for s in sucs]), 200

    except Exception as e:
        print(f"Error fetching SUCs: {e}")
        traceback.print_exc()
        return jsonify({"detail": str(e)}), 500


@submission_bp.route('/api/sucs', methods=['POST', 'OPTIONS'])
def add_suc():
    if request.method == 'OPTIONS':
        return jsonify({})

    try:
        from models import SUC
        data = request.get_json()

        if not data.get('name'):
            return jsonify({"detail": "SUC name is required"}), 400

        if SUC.query.filter_by(name=data['name']).first():
            return jsonify({"detail": "SUC already exists"}), 400

        new_suc = SUC(name=data['name'], region=data.get('region', 'Other'))
        db.session.add(new_suc)
        db.session.commit()

        return jsonify({'id': new_suc.id, 'region': new_suc.region, 'name': new_suc.name}), 201

    except Exception as e:
        db.session.rollback()
        print(f"Error adding SUC: {e}")
        traceback.print_exc()
        return jsonify({"detail": str(e)}), 500