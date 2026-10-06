import json
import os
import tempfile
import traceback
from datetime import datetime

from flask import Blueprint, jsonify, request
from werkzeug.utils import secure_filename

from sqlalchemy import text as sa_text
from models import (db, Submission, FullPaper, FullPaperFigure, FullPaperProjectDesign, FullPaperTable)
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
        return raw
    except Exception:
        return raw


def _safe_json_loads(raw, fallback):
    if not raw:
        return fallback
    try:
        return json.loads(raw)
    except Exception:
        return fallback


def _clean_stored_name(name: str) -> str:
    """
    Strip any previously-added 'full_paper_' or 'preview_' prefix so we
    never end up with 'full_paper_full_paper_...' or 'preview_preview_...'.
    """
    if not name:
        return name
    base = name
    # remove any leading prefix pairs repeatedly (covers legacy double prefixes)
    while True:
        if base.startswith('full_paper_'):
            base = base[len('full_paper_'):]
        elif base.startswith('preview_'):
            base = base[len('preview_'):]
        else:
            break
    return base or name


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
            all_subs = Submission.query.with_entities(
                Submission.submission_id
            ).all()
            print(f"❌ Lookup failed for submission_id={submission_id!r}")
            print(f"   Available submission_ids: {[s[0] for s in all_subs]}")
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

        # Strip any prior prefix so we never store 'full_paper_full_paper_x.pdf'
        raw_name = _clean_stored_name(full_paper_file.filename)
        safe_name = secure_filename(
            raw_name.replace(' ', '_')
        ) or 'full_paper.pdf'

        temp_dir = tempfile.mkdtemp()
        file_path = os.path.join(temp_dir, safe_name)
        full_paper_file.save(file_path)
        temp_files.append(file_path)

        # NOTE: preview_file upload removed. The frontend already sends the
        # same PDF for preview, and generating a duplicate in Drive was
        # producing 'preview_preview_full_paper_...' garbage.

        # ---------------- Resolve abstract file ID for Drive placement ----------------
        abstract_file_id = linked.abstract_file_id
        if not abstract_file_id and linked.abstract_view_url:
            abstract_file_id = extract_file_id_from_url(linked.abstract_view_url)

        # ---------------- Upload main PDF into abstract's Full Paper folder ----------------
        # Naming: use just the safe filename (no extra 'full_paper_' prefix)
        try:
            file_id, view_url, download_url, folder_id = upload_full_paper_pdf(
                file_path=file_path,
                filename=safe_name,
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
        try:
            db.session.execute(sa_text('SELECT 1'))
        except Exception:
            db.session.rollback()
            db.session.execute(sa_text('SELECT 1'))

        # ---------------- Persist / update FullPaper row ----------------
        if existing:
            print(f"♻️  Updating existing FullPaper id={existing.id}")
            fp = existing
        else:
            print(f"🆕 Creating new FullPaper for submission_id={submission_id!r}, user_id={user_id_int}")
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

        # Legacy single-table / single-figure fields
        fp.table1_title = _form('full_paper_table1_title')
        fp.table1_rows = _form_json('full_paper_table1_rows')
        fp.table1_note = _form('full_paper_table1_note')
        fp.figure1_title = _form('full_paper_figure1_title')
        fp.figure1_note = _form('full_paper_figure1_note')

        # File references (main PDF only — no preview PDF)
        fp.full_paper_file_id = file_id
        fp.full_paper_view_url = view_url
        fp.full_paper_download_url = download_url
        fp.drive_folder_id = folder_id
        fp.preview_file_id = None
        fp.preview_view_url = None

        fp.status = 'submitted'
        fp.submitted_at = datetime.now()

        # Flush so fp.id is available for child rows
        db.session.flush()

        linked.has_full_paper = True
        linked.full_paper_submitted_at = datetime.now()

        # ---------------- Clear previous children on resubmission ----------------
        if existing:
            for old_fig in list(fp.figures):
                db.session.delete(old_fig)
            if fp.project_design:
                db.session.delete(fp.project_design)
            db.session.flush()

        # ---------------- Upload + persist each figure ----------------
        for idx, fig_file in enumerate(figure_files):
            meta = figures_meta[idx] if idx < len(figures_meta) else {}
            keep_id = meta.get('keep_existing_id') or ''

            # Nothing new uploaded for this slot — restore existing row
            if (not fig_file or not fig_file.filename) and keep_id:
                # Find the old figure record (was NOT deleted above)
                old = next(
                    (f for f in existing.figures if f.drive_file_id == keep_id),
                    None,
                ) if existing else None
                if old:
                    # Re-append by re-creating a copy attached to fp
                    fp.figures.append(FullPaperFigure(
                        title=old.title,
                        note=old.note,
                        drive_file_id=old.drive_file_id,
                        view_url=old.view_url,
                        download_url=old.download_url,
                        original_filename=old.original_filename,
                        mime_type=old.mime_type,
                        file_size=old.file_size,
                        display_order=old.display_order,
                    ))
                continue

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
            
        # ---------------- Clear previous children on resubmission ----------------
        if existing:
            for old_fig in list(fp.figures):
                # Only delete figures that were NOT marked as "keep"
                keep_ids = {
                    (m.get('keep_existing_id') or '')
                    for m in figures_meta
                    if isinstance(m, dict)
                }
                if old_fig.drive_file_id and old_fig.drive_file_id in keep_ids:
                    continue
                db.session.delete(old_fig)
            if fp.project_design:
                pd_keep = bool(project_design_meta.get('keep_existing_id'))
                if not pd_keep:
                    db.session.delete(fp.project_design)
            db.session.flush()
            
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

        db.session.commit()

        # ---------------- Build SAFE response ----------------
        try:
            fp_dict = fp.to_dict()
        except Exception as dict_err:
            print(f"⚠️ fp.to_dict() failed (non-fatal): {dict_err}")
            traceback.print_exc()
            fp_dict = None

        return jsonify({
            "message": "Full paper submitted successfully",
            "full_paper_id": fp.id,
            "submission_id": linked.submission_id,
            "full_paper_file_id": file_id,
            "full_paper_view_url": view_url,
            "full_paper_download_url": download_url,
            "full_paper_drive_folder_id": folder_id,
            "full_paper_preview_file_id": None,
            "full_paper_preview_view_url": None,
            "figures_saved": len(fp.figures or []),
            "project_design_saved": bool(fp.project_design),
            "tables_saved": len(fp.tables or []),
            "db_committed": True,
            "full_paper": fp_dict,
        }), 200

    except Exception as e:
        db.session.rollback()
        print("=" * 60)
        print(f"❌ FULL PAPER SUBMISSION EXCEPTION: {e}")
        traceback.print_exc()
        print("=" * 60)
        return jsonify({"detail": str(e)}), 500

    finally:
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


@full_paper_bp.route('/api/submissions/<string:submission_id>/full-paper', methods=['GET', 'OPTIONS'])
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


@full_paper_bp.route('/api/submissions/<string:submission_id>/full-paper', methods=['DELETE', 'OPTIONS'])
def delete_full_paper(submission_id):
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

        drive_file_ids = []

        if fp.full_paper_file_id:
            drive_file_ids.append(fp.full_paper_file_id)
        if fp.preview_file_id:
            drive_file_ids.append(fp.preview_file_id)
        for fig in (fp.figures or []):
            if fig.drive_file_id:
                drive_file_ids.append(fig.drive_file_id)
        if fp.project_design and fp.project_design.drive_file_id:
            drive_file_ids.append(fp.project_design.drive_file_id)

        trashed_count, failed_count = trash_files(drive_file_ids)

        print(
            f"🗑️  Full paper delete: trashed {trashed_count} Drive file(s), "
            f"{failed_count} failed (submission={submission_id})"
        )

        db.session.delete(fp)
        linked = Submission.query.filter_by(submission_id=submission_id).first()
        if linked:
            linked.has_full_paper = False
            linked.full_paper_submitted_at = None
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