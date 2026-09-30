"""
Routes for full-paper submission.

Full papers are submitted by users whose abstracts have already been
endorsed (`status == 'endorse'`). The endpoint uploads the PDF to Google
Drive and attaches it to the linked `Submission` row.
"""

import os
import tempfile
import traceback
from datetime import datetime

from flask import Blueprint, jsonify, request
from werkzeug.utils import secure_filename

from models import db, Submission
from google_drive import upload_file_to_drive

full_paper_bp = Blueprint('full_paper', __name__)


@full_paper_bp.route('/api/submit-full-paper', methods=['POST', 'OPTIONS'])
def submit_full_paper():
    if request.method == 'OPTIONS':
        return jsonify({})

    temp_files = []
    temp_dir = None

    try:
        # ---------------- Form fields ----------------
        user_id = request.form.get('user_id', 0)
        submission_id = request.form.get('submission_id', '')
        full_paper_title = request.form.get('full_paper_title', '')
        full_paper_authors = request.form.get('full_paper_authors', '')
        full_paper_keywords = request.form.get('full_paper_keywords', '')
        full_paper_abstract = request.form.get('full_paper_abstract', '')

        # ---------------- Validation ----------------
        missing = []
        for key, val in [
            ('user_id', user_id),
            ('submission_id', submission_id),
            ('full_paper_title', full_paper_title),
            ('full_paper_authors', full_paper_authors),
            ('full_paper_keywords', full_paper_keywords),
        ]:
            if not val:
                missing.append(key)
        if missing:
            return jsonify({"detail": f"Missing required fields: {', '.join(missing)}"}), 400

        try:
            user_id = int(user_id)
        except (ValueError, TypeError):
            user_id = 0

        # ---------------- Fetch linked submission ----------------
        linked = Submission.query.get(submission_id)
        if not linked:
            return jsonify({"detail": "Linked submission not found"}), 404

        if linked.user_id != user_id:
            return jsonify({"detail": "You do not own this submission"}), 403

        if linked.status != 'endorse':
            return jsonify({
                "detail": "Full paper submission is only allowed for accepted abstracts"
            }), 400

        # ---------------- Full paper file ----------------
        full_paper_file = request.files.get('full_paper_file')
        if not full_paper_file or not full_paper_file.filename:
            return jsonify({"detail": "Full paper file is required"}), 400

        if not full_paper_file.filename.lower().endswith('.pdf'):
            return jsonify({"detail": "Full paper must be a PDF"}), 400

        safe_name = secure_filename(full_paper_file.filename.replace(' ', '_'))
        temp_dir = tempfile.mkdtemp()
        file_path = os.path.join(temp_dir, safe_name)
        full_paper_file.save(file_path)
        temp_files.append(file_path)

        # ---------------- Upload to Drive ----------------
        try:
            file_id, view_url = upload_file_to_drive(
                file_path,
                f"full_paper_{safe_name}",
                project_title=linked.extension_project_title,
                sender_name=linked.project_leader,
                paper_category=linked.paper_category,
                thematic_area=linked.thematic_area,
            )
        except Exception as drive_error:
            print(f"Drive upload error (full paper): {drive_error}")
            traceback.print_exc()
            return jsonify({
                "detail": f"Failed to upload full paper: {drive_error}"
            }), 500

        # ---------------- Persist ----------------
        linked.full_paper_file_id = file_id
        linked.full_paper_view_url = view_url
        linked.full_paper_title = full_paper_title
        linked.full_paper_authors = full_paper_authors
        linked.full_paper_keywords = full_paper_keywords
        linked.full_paper_abstract = full_paper_abstract
        linked.full_paper_submitted_at = datetime.now()
        db.session.commit()

        return jsonify({
            "message": "Full paper submitted successfully",
            "submission_id": linked.id,
            "full_paper_file_id": file_id,
            "full_paper_view_url": view_url,
        }), 200

    except Exception as e:
        db.session.rollback()
        print(f"Full paper submission error: {e}")
        traceback.print_exc()
        return jsonify({"detail": str(e)}), 500

    finally:
        # ---------------- Cleanup ----------------
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


@full_paper_bp.route('/api/submissions/<string:submission_id>/full-paper', methods=['GET', 'OPTIONS'])
def get_full_paper(submission_id):
    """
    Return the full-paper metadata for a given submission (if any).

    Useful for the user dashboard to show "already submitted" state, and
    for admins to review the uploaded PDF.
    """
    if request.method == 'OPTIONS':
        return jsonify({})

    try:
        submission = Submission.query.get(submission_id)
        if not submission:
            return jsonify({"detail": "Submission not found"}), 404

        if not submission.full_paper_file_id:
            return jsonify({"exists": False}), 200

        return jsonify({
            "exists": True,
            "full_paper_file_id": submission.full_paper_file_id,
            "full_paper_view_url": submission.full_paper_view_url,
            "full_paper_title": submission.full_paper_title,
            "full_paper_authors": submission.full_paper_authors,
            "full_paper_keywords": submission.full_paper_keywords,
            "full_paper_abstract": submission.full_paper_abstract,
            "full_paper_submitted_at": (
                submission.full_paper_submitted_at.strftime('%Y-%m-%d %H:%M:%S')
                if submission.full_paper_submitted_at else None
            ),
        }), 200

    except Exception as e:
        print(f"Error fetching full paper: {e}")
        traceback.print_exc()
        return jsonify({"detail": str(e)}), 500


@full_paper_bp.route('/api/submissions/<string:submission_id>/full-paper', methods=['DELETE', 'OPTIONS'])
def delete_full_paper(submission_id):
    """
    Clear the full-paper metadata on a submission.

    NOTE: This does *not* delete the file from Google Drive — it only clears
    the DB references, allowing the user to re-upload a corrected version.
    """
    if request.method == 'OPTIONS':
        return jsonify({})

    try:
        data = request.get_json(silent=True) or {}
        user_id = data.get('user_id')

        submission = Submission.query.get(submission_id)
        if not submission:
            return jsonify({"detail": "Submission not found"}), 404

        # Only the owner (or an admin acting on their behalf) may clear it
        if user_id and int(user_id) != submission.user_id:
            return jsonify({"detail": "You do not own this submission"}), 403

        submission.full_paper_file_id = None
        submission.full_paper_view_url = None
        submission.full_paper_title = None
        submission.full_paper_authors = None
        submission.full_paper_keywords = None
        submission.full_paper_abstract = None
        submission.full_paper_submitted_at = None
        db.session.commit()

        return jsonify({
            "message": "Full paper reference cleared; you may upload a new one",
            "submission_id": submission.id,
        }), 200

    except Exception as e:
        db.session.rollback()
        print(f"Error clearing full paper: {e}")
        traceback.print_exc()
        return jsonify({"detail": str(e)}), 500