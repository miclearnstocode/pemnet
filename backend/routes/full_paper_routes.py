import json
import os
import tempfile
import traceback
from datetime import datetime

from flask import Blueprint, jsonify, request
from werkzeug.utils import secure_filename

from sqlalchemy import text as sa_text
from models import ( db, Submission, FullPaper, FullPaperFigure, FullPaperProjectDesign, FullPaperTable)
from google_drive import (
    extract_file_id_from_url,
    upload_full_paper_pdf,
    upload_image_to_full_paper,
    trash_files,
)

full_paper_bp = Blueprint('full_paper', __name__)


def _form(key, default=''):
    val = request.form.get(key)
    return val if val is not None else default


def _form_json(key):
    """Parse a JSON-encoded form field; returns the raw string if it isn't JSON."""
    raw = request.form.get(key)
    if raw in (None, '', 'null'):
        return None
    try:
        json.loads(raw)
        return raw  # already valid JSON string
    except Exception:
        return raw


def _safe_json_loads(raw, fallback):
    if not raw:
        return fallback
    try:
        return json.loads(raw)
    except Exception:
        return fallback


@full_paper_bp.route('/api/submit-full-paper', methods=['POST', 'OPTIONS'])
def submit_full_paper():
    if request.method == 'OPTIONS':
        return jsonify({})

    temp_files = []
    temp_dir = None

    try:
        # ---------------- Required scalar fields ----------------
        user_id = _form('user_id')
        submission_id = _form('submission_id')
        title = _form('full_paper_title')
        authors = _form('full_paper_authors')
        keywords = _form('full_paper_keywords')

        missing = []
        if not user_id:
            missing.append('user_id')
        if not submission_id:
            missing.append('submission_id')
        if not title:
            missing.append('full_paper_title')
        if not authors:
            missing.append('full_paper_authors')
        if not keywords:
            missing.append('full_paper_keywords')
        if missing:
            return jsonify({
                "detail": f"Missing required fields: {', '.join(missing)}"
            }), 400

        try:
            user_id_int = int(user_id)
        except (ValueError, TypeError):
            return jsonify({"detail": "Invalid user_id"}), 400

        # ---------------- Locate the linked abstract ----------------
        linked = Submission.query.filter_by(submission_id=submission_id).first()
        if not linked:
            return jsonify({
                "detail": f"Linked abstract '{submission_id}' not found"
            }), 404

        if linked.user_id != user_id_int:
            return jsonify({"detail": "You do not own this submission"}), 403

        if linked.status != 'endorse':
            return jsonify({
                "detail": "Full paper submission is only allowed for accepted abstracts"
            }), 400

        # ---------------- Existing full paper (for resubmission) ----------------
        existing = FullPaper.query.filter_by(submission_id=submission_id).first()

        # ---------------- Full paper file (required) ----------------
        full_paper_file = request.files.get('full_paper_file')
        if not full_paper_file or not full_paper_file.filename:
            return jsonify({"detail": "Full paper PDF is required"}), 400

        if not full_paper_file.filename.lower().endswith('.pdf'):
            return jsonify({"detail": "Full paper must be a PDF"}), 400

        safe_name = secure_filename(
            full_paper_file.filename.replace(' ', '_')
        ) or 'full_paper.pdf'

        temp_dir = tempfile.mkdtemp()
        file_path = os.path.join(temp_dir, safe_name)
        full_paper_file.save(file_path)
        temp_files.append(file_path)

        # ---------------- Optional preview PDF (from frontend) ----------------
        preview_file = request.files.get('full_paper_preview_file')
        preview_path = None
        preview_safe_name = None
        if preview_file and preview_file.filename:
            preview_safe_name = secure_filename(
                preview_file.filename.replace(' ', '_')
            ) or 'full_paper_preview.pdf'
            preview_path = os.path.join(temp_dir, preview_safe_name)
            preview_file.save(preview_path)
            temp_files.append(preview_path)

        # ---------------- Resolve abstract file ID for Drive placement ----------------
        abstract_file_id = linked.abstract_file_id
        if not abstract_file_id and linked.abstract_view_url:
            abstract_file_id = extract_file_id_from_url(linked.abstract_view_url)

        # ---------------- Upload main PDF into abstract's Full Paper folder ----------------
        try:
            file_id, view_url, download_url, folder_id = upload_full_paper_pdf(
                file_path=file_path,
                filename=f"full_paper_{safe_name}",
                abstract_file_id=abstract_file_id,
                abstract_view_url=linked.abstract_view_url,
                paper_category=linked.paper_category,
                thematic_area=linked.thematic_area,
                sender_name=linked.project_leader,
            )
        except Exception as drive_err:
            print(f"Drive upload error (full paper): {drive_err}")
            traceback.print_exc()
            return jsonify({
                "detail": f"Failed to upload full paper: {drive_err}"
            }), 500

        # ---------------- Optionally upload preview PDF (non-fatal) ----------------
        preview_file_id = None
        preview_view_url = None
        if preview_path:
            try:
                (
                    preview_file_id,
                    preview_view_url,
                    _preview_dl,
                    _preview_folder,
                ) = upload_full_paper_pdf(
                    file_path=preview_path,
                    filename=f"preview_{preview_safe_name}",
                    abstract_file_id=abstract_file_id,
                    abstract_view_url=linked.abstract_view_url,
                    paper_category=linked.paper_category,
                    thematic_area=linked.thematic_area,
                    sender_name=linked.project_leader,
                )
            except Exception as preview_err:
                print(f"⚠️ Preview upload failed (non-fatal): {preview_err}")

        # ---------------- Parse figures meta + files ----------------
        figures_meta = _safe_json_loads(
            request.form.get('full_paper_figures_meta'), []
        )

        figure_files = []
        i = 0
        while True:
            f = request.files.get(f'full_paper_figure_{i}')
            if f is None:
                break
            figure_files.append(f)
            i += 1

        # ---------------- Parse project design meta + file ----------------
        project_design_meta = _safe_json_loads(
            request.form.get('full_paper_project_design_meta'), {}
        )
        project_design_file = request.files.get('full_paper_project_design')
        
        # ---------------- Parse tables ----------------
        tables_meta_raw = request.form.get('full_paper_tables')
        try:
            tables_meta = json.loads(tables_meta_raw) if tables_meta_raw else []
        except Exception:
            tables_meta = []

        # ---------------- Reconnect DB after potentially long Drive uploads ----------------
        # Drive uploads can take 30-60 s; ping the connection now so the INSERT
        # below never hits a stale / timed-out connection.
        try:
            db.session.execute(sa_text('SELECT 1'))
        except Exception:
            db.session.rollback()
            db.session.execute(sa_text('SELECT 1'))

        # ---------------- Persist / update FullPaper row ----------------
        if existing:
            fp = existing
        else:
            fp = FullPaper(submission_id=submission_id, user_id=user_id_int)
            db.session.add(fp)

        # Core metadata
        fp.title = title
        fp.authors = authors
        fp.affiliations = _form('full_paper_affiliations')
        fp.keywords = keywords
        fp.abstract = _form('full_paper_abstract')
        fp.corresponding_name = _form('full_paper_corresponding_name')
        fp.corresponding_email = _form('full_paper_corresponding_email')
        fp.corresponding_orcid = _form('full_paper_corresponding_orcid')
        fp.paper_category = _form('full_paper_category') or linked.paper_category
        fp.thematic_area = _form('full_paper_thematic_area') or linked.thematic_area

        # Section 1
        fp.background_context = _form('full_paper_background_context')
        fp.evidence_need = _form('full_paper_evidence_need')
        fp.related_literature = _form('full_paper_related_literature')
        fp.rationale = _form('full_paper_rationale')
        fp.objectives = _form('full_paper_objectives')

        # Section 2
        fp.reach_population = _form('full_paper_reach_population')
        fp.setting_duration = _form('full_paper_setting_duration')
        fp.participants_desc = _form('full_paper_participants_desc')
        fp.situational_analysis = _form('full_paper_situational_analysis')
        fp.intervention_rationale = _form('full_paper_intervention_rationale')
        fp.implementation_strategies = _form('full_paper_implementation_strategies')
        fp.partnership = _form('full_paper_partnership')
        fp.monitoring_eval = _form('full_paper_monitoring_eval')
        fp.data_analysis = _form('full_paper_data_analysis')
        fp.ethical_considerations = _form('full_paper_ethical_considerations')

        # Section 3
        fp.reach_implementation = _form('full_paper_reach_implementation')
        fp.immediate_results = _form('full_paper_immediate_results')
        fp.outcomes = _form('full_paper_outcomes')
        fp.adoption = _form('full_paper_adoption')
        fp.institutionalization = _form('full_paper_institutionalization')
        fp.public_value = _form('full_paper_public_value')

        # Section 4
        fp.interpretation = _form('full_paper_interpretation')
        fp.relationship_literature = _form('full_paper_relationship_literature')
        fp.factors_affecting = _form('full_paper_factors_affecting')
        fp.inclusion_resilience = _form('full_paper_inclusion_resilience')
        fp.transferability = _form('full_paper_transferability')
        fp.limitations = _form('full_paper_limitations')

        # Section 5
        fp.implications = _form('full_paper_implications')

        # Section 6 + back matter
        fp.conclusion = _form('full_paper_conclusion')
        fp.acknowledgments = _form('full_paper_acknowledgments')
        fp.funding = _form('full_paper_funding')
        fp.conflict_of_interest = _form('full_paper_conflict_of_interest')
        fp.ethics_statement = _form('full_paper_ethics_statement')
        fp.data_availability = _form('full_paper_data_availability')
        fp.author_contributions = _form('full_paper_author_contributions')
        fp.references = _form('full_paper_references')
        fp.appendices = _form('full_paper_appendices')

        # Tables (text only)
        fp.table1_title = _form('full_paper_table1_title')
        fp.table1_rows = _form_json('full_paper_table1_rows')
        fp.table1_note = _form('full_paper_table1_note')
        fp.figure1_title = _form('full_paper_figure1_title')
        fp.figure1_note = _form('full_paper_figure1_note')

        # File references (main PDFs)
        fp.full_paper_file_id = file_id
        fp.full_paper_view_url = view_url
        fp.full_paper_download_url = download_url
        fp.drive_folder_id = folder_id
        fp.preview_file_id = preview_file_id
        fp.preview_view_url = preview_view_url

        fp.status = 'submitted'
        fp.submitted_at = datetime.now()

        # Flush so fp.id is available for child rows
        db.session.flush()

        # ---------------- Clear previous children on resubmission ----------------
        if existing:
            for old_fig in list(fp.figures):
                db.session.delete(old_fig)
            if fp.project_design:
                db.session.delete(fp.project_design)
            db.session.flush()

        # ---------------- Upload + persist each figure ----------------
        for idx, fig_file in enumerate(figure_files):
            if not fig_file or not fig_file.filename:
                continue

            meta = figures_meta[idx] if idx < len(figures_meta) else {}

            safe_fig_name = secure_filename(
                fig_file.filename.replace(' ', '_')
            ) or f'figure_{idx}.png'
            fig_path = os.path.join(temp_dir, f'fig{idx}_{safe_fig_name}')
            fig_file.save(fig_path)
            temp_files.append(fig_path)

            try:
                fig_file_id, fig_view, fig_dl, _fig_folder = upload_image_to_full_paper(
                    file_path=fig_path,
                    filename=f"fig{idx + 1}_{safe_fig_name}",
                    abstract_file_id=abstract_file_id,
                    abstract_view_url=linked.abstract_view_url,
                    paper_category=linked.paper_category,
                    thematic_area=linked.thematic_area,
                    sender_name=linked.project_leader,
                    subfolder="Figures",
                )
            except Exception as fig_err:
                print(f"⚠️ Figure {idx + 1} upload failed (non-fatal): {fig_err}")
                continue

            fp.figures.append(FullPaperFigure(
                title=meta.get('title') or '',
                note=meta.get('note') or '',
                drive_file_id=fig_file_id,
                view_url=fig_view,
                download_url=fig_dl,
                original_filename=meta.get('original_filename') or safe_fig_name,
                mime_type=meta.get('mime_type') or fig_file.mimetype,
                file_size=os.path.getsize(fig_path),
                display_order=meta.get('display_order', idx),
            ))

        # ---------------- Upload + persist project design (optional) ----------------
        if project_design_file and project_design_file.filename:
            safe_pd_name = secure_filename(
                project_design_file.filename.replace(' ', '_')
            ) or 'project_design.png'
            pd_path = os.path.join(temp_dir, safe_pd_name)
            project_design_file.save(pd_path)
            temp_files.append(pd_path)

            try:
                pd_id, pd_view, pd_dl, _pd_folder = upload_image_to_full_paper(
                    file_path=pd_path,
                    filename=f"project_design_{safe_pd_name}",
                    abstract_file_id=abstract_file_id,
                    abstract_view_url=linked.abstract_view_url,
                    paper_category=linked.paper_category,
                    thematic_area=linked.thematic_area,
                    sender_name=linked.project_leader,
                    subfolder="ProjectDesign",
                )

                fp.project_design = FullPaperProjectDesign(
                    drive_file_id=pd_id,
                    view_url=pd_view,
                    download_url=pd_dl,
                    original_filename=project_design_meta.get('original_filename') or safe_pd_name,
                    mime_type=project_design_meta.get('mime_type') or project_design_file.mimetype,
                    file_size=os.path.getsize(pd_path),
                )
            except Exception as pd_err:
                print(f"⚠️ Project design upload failed (non-fatal): {pd_err}")

        # ---------------- Clear old tables on resubmission ----------------
        if existing:
            for old_table in list(fp.tables):
                db.session.delete(old_table)
            db.session.flush()

        # ---------------- Persist tables ----------------
        for idx, table in enumerate(tables_meta):
            if not isinstance(table, dict):
                continue

            rows = table.get('rows') or []
            # Only persist tables that actually have content
            has_content = bool(
                (table.get('title') or '').strip()
                or (table.get('note') or '').strip()
                or any(
                    (r.get('indicator') or r.get('baseline') or r.get('endline')
                     or r.get('change') or r.get('source'))
                    for r in rows if isinstance(r, dict)
                )
            )
            if not has_content:
                continue

            fp.tables.append(FullPaperTable(
                title=table.get('title') or '',
                note=table.get('note') or '',
                rows_json=json.dumps(rows, ensure_ascii=False),
                display_order=table.get('display_order', idx),
            ))
            
        # ---------------- Commit ----------------
        db.session.commit()

        return jsonify({
            "message": "Full paper submitted successfully",
            "full_paper_id": fp.id,
            "submission_id": linked.submission_id,
            "full_paper_file_id": file_id,
            "full_paper_view_url": view_url,
            "full_paper_download_url": download_url,
            "full_paper_drive_folder_id": folder_id,
            "full_paper_preview_file_id": preview_file_id,
            "full_paper_preview_view_url": preview_view_url,
            "figures_saved": len(fp.figures),
            "project_design_saved": bool(fp.project_design),
            "tables_saved": len(fp.tables),
            "full_paper": fp.to_dict(),
        }), 200

    except Exception as e:
        db.session.rollback()
        print(f"Full paper submission error: {e}")
        traceback.print_exc()
        return jsonify({"detail": str(e)}), 500

    finally:
        # Cleanup temp files
        for fp_path in temp_files:
            try:
                if os.path.exists(fp_path):
                    os.remove(fp_path)
            except Exception:
                pass
        if temp_dir and os.path.exists(temp_dir):
            try:
                os.rmdir(temp_dir)
            except Exception:
                pass

@full_paper_bp.route('/api/submissions/<string:submission_id>/full-paper', methods=['GET', 'OPTIONS'],)
def get_full_paper(submission_id):
    if request.method == 'OPTIONS':
        return jsonify({})

    try:
        fp = FullPaper.query.filter_by(submission_id=submission_id).first()
        if not fp:
            return jsonify({"exists": False}), 200

        return jsonify({
            "exists": True,
            "full_paper": fp.to_dict(),
        }), 200

    except Exception as e:
        print(f"Error fetching full paper: {e}")
        traceback.print_exc()
        return jsonify({"detail": str(e)}), 500


@full_paper_bp.route('/api/submissions/<string:submission_id>/full-paper', methods=['DELETE', 'OPTIONS'],)
def delete_full_paper(submission_id):
    """
    Delete a full paper.

    Behavior:
      * All Drive files belonging to the full paper (main PDF, preview PDF,
        each figure, project design) are moved to Drive **trash**.
      * The DB row + its children (figures, project design) are deleted.
      * Accepts optional `hard_delete=true` in the JSON body to permanently
        delete the Drive files instead of trashing them. Default: trash.
    """
    if request.method == 'OPTIONS':
        return jsonify({})

    try:
        data = request.get_json(silent=True) or {}
        user_id = data.get('user_id')

        fp = FullPaper.query.filter_by(submission_id=submission_id).first()
        if not fp:
            return jsonify({"detail": "No full paper found"}), 404

        if user_id and int(user_id) != fp.user_id:
            return jsonify({"detail": "You do not own this submission"}), 403

        # ---- Collect every Drive file ID we need to trash ----
        drive_file_ids = []

        # Main full paper PDF
        if fp.full_paper_file_id:
            drive_file_ids.append(fp.full_paper_file_id)

        # Preview PDF
        if fp.preview_file_id:
            drive_file_ids.append(fp.preview_file_id)

        # Figure images
        for fig in (fp.figures or []):
            if fig.drive_file_id:
                drive_file_ids.append(fig.drive_file_id)

        # Project design image
        if fp.project_design and fp.project_design.drive_file_id:
            drive_file_ids.append(fp.project_design.drive_file_id)

        # ---- Trash them on Drive ----
        trashed_count, failed_count = trash_files(drive_file_ids)

        print(
            f"🗑️  Full paper delete: trashed {trashed_count} Drive file(s), "
            f"{failed_count} failed (submission={submission_id})"
        )

        # ---- Delete DB row (cascade removes figures + project_design) ----
        db.session.delete(fp)
        db.session.commit()

        response = {
            "message": (
                "Full paper deleted. Drive files moved to trash; you may upload a new one."
            ),
            "submission_id": submission_id,
            "drive_files_trashed": trashed_count,
            "drive_files_failed": failed_count,
            "drive_file_ids": drive_file_ids,
        }

        if failed_count:
            response["warning"] = (
                f"{failed_count} Drive file(s) could not be trashed. "
                "They may need manual cleanup. DB record was still removed."
            )

        return jsonify(response), 200

    except Exception as e:
        db.session.rollback()
        print(f"Error deleting full paper: {e}")
        traceback.print_exc()
        return jsonify({"detail": str(e)}), 500