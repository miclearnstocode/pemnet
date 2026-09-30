"""Master Approver routes: final status decisions, bulk emails, email logs."""

import traceback

from flask import Blueprint, jsonify, request

from models import db, EmailNotificationLog
from master_approver import MasterApproverService

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