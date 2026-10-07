import traceback
from flask import Blueprint, jsonify, request
from master_approver import MasterApproverService
from models import (db, Submission, ExtractedAbstractData, ExtractedDataRevision, EmailNotificationLog,)
from sqlalchemy import func

master_approver_bp = Blueprint('master_approver', __name__)


@master_approver_bp.route('/api/master-approver/status-summary', methods=['GET', 'OPTIONS'])
def master_approver_status_summary():
    if request.method == 'OPTIONS':
        return jsonify({})

    try:
        result, status_code = MasterApproverService.get_status_summary()
        return jsonify(result), status_code
    except Exception as e:
        print(f"Error in master_approver_status_summary: {e}")
        traceback.print_exc()
        return jsonify({"detail": str(e)}), 500


@master_approver_bp.route('/api/master-approver/pending-submissions', methods=['GET', 'OPTIONS'])
def master_approver_pending_submissions():
    if request.method == 'OPTIONS':
        return jsonify({})

    try:
        result, status_code = MasterApproverService.get_pending_submissions()
        return jsonify(result), status_code
    except Exception as e:
        print(f"Error in master_approver_pending_submissions: {e}")
        traceback.print_exc()
        return jsonify({"detail": str(e)}), 500


@master_approver_bp.route('/api/submissions/<string:submission_id>/master-details', methods=['GET', 'OPTIONS'])
def get_submission_with_votes(submission_id):
    if request.method == 'OPTIONS':
        return jsonify({})

    try:
        result, status_code = MasterApproverService.get_submission_with_votes(submission_id)
        return jsonify(result), status_code
    except Exception as e:
        print(f"Error in get_submission_with_votes: {e}")
        traceback.print_exc()
        return jsonify({"detail": str(e)}), 500


@master_approver_bp.route('/api/submissions/<string:submission_id>/master-status', methods=['POST', 'OPTIONS'])
def set_master_status(submission_id):
    if request.method == 'OPTIONS':
        return jsonify({})

    try:
        data = request.get_json()
        if not data:
            return jsonify({"detail": "Request body is required"}), 400

        result, status_code = MasterApproverService.set_final_status(submission_id, data)
        return jsonify(result), status_code
    except Exception as e:
        print(f"Error in set_master_status: {e}")
        traceback.print_exc()
        return jsonify({"detail": str(e)}), 500


@master_approver_bp.route('/api/master-approver/bulk-email', methods=['POST', 'OPTIONS'])
def bulk_send_status_emails():
    if request.method == 'OPTIONS':
        return jsonify({})

    try:
        data = request.get_json()
        if not data:
            return jsonify({"detail": "Request body is required"}), 400

        result, status_code = MasterApproverService.bulk_send_status_emails(data)
        return jsonify(result), status_code
    except Exception as e:
        print(f"Error in bulk_send_status_emails: {e}")
        traceback.print_exc()
        return jsonify({"detail": str(e)}), 500


@master_approver_bp.route('/api/email-logs/<string:submission_id>', methods=['GET', 'OPTIONS'])
def get_email_logs(submission_id):
    if request.method == 'OPTIONS':
        return jsonify({})

    try:
        logs = EmailNotificationLog.query.filter_by(submission_id=submission_id)\
            .order_by(EmailNotificationLog.created_at.desc()).all()
        return jsonify([log.to_dict() for log in logs]), 200
    except Exception as e:
        print(f"Error fetching email logs: {e}")
        return jsonify({"detail": str(e)}), 500


@master_approver_bp.route('/api/email-logs/all', methods=['GET', 'OPTIONS'])
def get_all_email_logs():
    if request.method == 'OPTIONS':
        return jsonify({})

    try:
        limit = request.args.get('limit', 100, type=int)
        status_filter = request.args.get('status', 'all')

        query = EmailNotificationLog.query
        if status_filter != 'all':
            query = query.filter_by(status=status_filter)

        logs = query.order_by(EmailNotificationLog.created_at.desc()).limit(limit).all()
        return jsonify([log.to_dict() for log in logs]), 200
    except Exception as e:
        print(f"Error fetching all email logs: {e}")
        return jsonify({"detail": str(e)}), 500
    
@master_approver_bp.route('/api/master-approver/chart-data', methods=['GET', 'OPTIONS'])
def master_approver_chart_data():
    if request.method == 'OPTIONS':
        return jsonify({})

    try:
        palette = [
            '#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
            '#ec4899', '#14b8a6', '#3b82f6', '#a855f7', '#f97316'
        ]

        # ---- Canonical category names (edit this list if your DB has more) ----
        CANONICAL_CATEGORIES = {
            'completed extension project paper':  'Completed Extension Project Paper',
            'completed extension project papers': 'Completed Extension Project Paper',
            'ongoing extension project paper':    'Ongoing Extension Project Paper',
            'ongoing extension project papers':   'Ongoing Extension Project Paper',
        }

        def normalize_category(label):
            """Map near-duplicate category labels to a single canonical form."""
            if not label:
                return None
            key = ' '.join(label.strip().lower().split())
            return CANONICAL_CATEGORIES.get(key, label.strip())

        def normalize_thematic(label):
            """Normalize thematic areas: trim + collapse whitespace, preserve case."""
            if not label:
                return None
            return ' '.join(label.strip().split())

        # ------------------------------------------------------------
        # 1) SYSTEM submissions
        # ------------------------------------------------------------
        category_counts = {}
        thematic_counts = {}

        for paper_category, cnt in (
            db.session.query(Submission.paper_category, func.count(Submission.id))
            .group_by(Submission.paper_category).all()
        ):
            norm = normalize_category(paper_category)
            if norm:
                category_counts[norm] = category_counts.get(norm, 0) + cnt

        for thematic_area, cnt in (
            db.session.query(Submission.thematic_area, func.count(Submission.id))
            .group_by(Submission.thematic_area).all()
        ):
            norm = normalize_thematic(thematic_area)
            if norm:
                thematic_counts[norm] = thematic_counts.get(norm, 0) + cnt

        # ------------------------------------------------------------
        # 2) EMAIL submissions — use latest revision if present
        # ------------------------------------------------------------
        email_rows = ExtractedAbstractData.query.all()

        for row in email_rows:
            latest_rev = (
                ExtractedDataRevision.query
                .filter_by(extracted_data_id=row.id)
                .order_by(ExtractedDataRevision.created_at.desc())
                .first()
            )

            raw_category = None
            if latest_rev and latest_rev.paper_category:
                raw_category = latest_rev.paper_category
            elif row.paper_category:
                raw_category = row.paper_category

            raw_thematic = None
            if latest_rev and latest_rev.thematic_area:
                raw_thematic = latest_rev.thematic_area
            elif row.thematic_area:
                raw_thematic = row.thematic_area

            cat = normalize_category(raw_category)
            the = normalize_thematic(raw_thematic)

            if cat:
                category_counts[cat] = category_counts.get(cat, 0) + 1
            if the:
                thematic_counts[the] = thematic_counts.get(the, 0) + 1

        # ------------------------------------------------------------
        # 3) Format for the chart
        # ------------------------------------------------------------
        category_data = [
            {'label': label, 'value': value, 'color': palette[i % len(palette)]}
            for i, (label, value) in enumerate(
                sorted(category_counts.items(), key=lambda kv: -kv[1])
            )
        ]

        thematic_data = [
            {'label': label, 'value': value, 'color': palette[i % len(palette)]}
            for i, (label, value) in enumerate(
                sorted(thematic_counts.items(), key=lambda kv: -kv[1])
            )
        ]

        return jsonify({
            'category': category_data,
            'thematic': thematic_data,
        }), 200

    except Exception as e:
        print(f"Error in master_approver_chart_data: {e}")
        traceback.print_exc()
        return jsonify({"detail": str(e)}), 500 