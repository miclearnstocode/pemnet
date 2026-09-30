"""Payment routes: upload proof, verify, list."""

import os
import tempfile
import traceback
from datetime import datetime

from flask import Blueprint, jsonify, request
from werkzeug.utils import secure_filename

from models import db, Payment, User, Submission
from google_drive import upload_file_to_drive

payment_bp = Blueprint('payments', __name__)


@payment_bp.route('/api/payments/upload', methods=['POST', 'OPTIONS'])
def upload_payment_proof():
    if request.method == 'OPTIONS':
        return jsonify({})

    try:
        user_id = request.form.get('user_id')
        submission_id = request.form.get('submission_id')
        reference_number = request.form.get('reference_number')
        payment_amount = request.form.get('payment_amount')
        payment_date = request.form.get('payment_date')

        if not user_id or not submission_id:
            return jsonify({"detail": "User ID and Submission ID are required"}), 400

        user = User.query.get(user_id)
        if not user:
            return jsonify({"detail": "User not found"}), 404

        submission = Submission.query.get(submission_id)
        if not submission:
            return jsonify({"detail": "Submission not found"}), 404

        if submission.status != 'endorse':
            return jsonify({"detail": "Payment is only allowed for endorsed submissions"}), 400

        if Payment.query.filter_by(submission_id=submission_id).first():
            return jsonify({"detail": "Payment already submitted for this submission"}), 400

        payment_file = request.files.get('payment_proof')
        if not payment_file or not payment_file.filename:
            return jsonify({"detail": "Payment proof file is required"}), 400

        allowed_extensions = {'.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.pdf'}
        file_ext = os.path.splitext(payment_file.filename)[1].lower()
        if file_ext not in allowed_extensions:
            return jsonify({"detail": "File must be an image (JPG, PNG, GIF, BMP, WEBP) or PDF"}), 400

        safe_filename = secure_filename(payment_file.filename.replace(' ', '_'))

        temp_dir = tempfile.mkdtemp()
        file_path = os.path.join(temp_dir, safe_filename)
        payment_file.save(file_path)

        try:
            view_url, download_url = upload_file_to_drive(
                file_path,
                f"payment_proof_{safe_filename}",
                project_title=submission.extension_project_title,
                sender_name=user.full_name,
                paper_category=submission.paper_category,
                thematic_area=submission.thematic_area,
            )
        except Exception as drive_error:
            print(f"❌ Drive upload error: {drive_error}")
            os.remove(file_path)
            os.rmdir(temp_dir)
            return jsonify({"detail": f"Failed to upload payment proof: {str(drive_error)}"}), 500

        os.remove(file_path)
        os.rmdir(temp_dir)

        payment = Payment(
            user_id=user_id,
            submission_id=submission_id,
            payment_proof_view_url=view_url,
            payment_proof_download_url=download_url,
            payment_status='pending',
            payment_amount=float(payment_amount) if payment_amount else None,
            payment_date=datetime.strptime(payment_date, '%Y-%m-%d') if payment_date else None,
            reference_number=reference_number,
        )

        db.session.add(payment)
        db.session.commit()

        return jsonify({
            "message": "Payment proof uploaded successfully",
            "payment": payment.to_dict(),
        }), 201

    except Exception as e:
        db.session.rollback()
        print(f"Error uploading payment proof: {e}")
        traceback.print_exc()
        return jsonify({"detail": str(e)}), 500


@payment_bp.route('/api/payments/submission/<string:submission_id>', methods=['GET', 'OPTIONS'])
def get_payment_by_submission(submission_id):
    if request.method == 'OPTIONS':
        return jsonify({})

    try:
        payment = Payment.query.filter_by(submission_id=submission_id).first()
        if not payment:
            return jsonify({"exists": False}), 200
        return jsonify({"exists": True, "payment": payment.to_dict()}), 200
    except Exception as e:
        print(f"Error fetching payment: {e}")
        return jsonify({"detail": str(e)}), 500


@payment_bp.route('/api/payments/user/<int:user_id>', methods=['GET', 'OPTIONS'])
def get_user_payments(user_id):
    if request.method == 'OPTIONS':
        return jsonify({})

    try:
        payments = Payment.query.filter_by(user_id=user_id)\
            .order_by(Payment.created_at.desc()).all()
        return jsonify([p.to_dict() for p in payments]), 200
    except Exception as e:
        print(f"Error fetching user payments: {e}")
        return jsonify({"detail": str(e)}), 500


@payment_bp.route('/api/payments/<int:payment_id>/verify', methods=['POST', 'OPTIONS'])
def verify_payment(payment_id):
    if request.method == 'OPTIONS':
        return jsonify({})

    try:
        data = request.get_json()
        verifier_id = data.get('verifier_id')
        action = data.get('action')
        rejection_reason = data.get('rejection_reason', '')

        if action not in ['verify', 'reject']:
            return jsonify({"detail": "Invalid action. Must be 'verify' or 'reject'"}), 400

        payment = Payment.query.get(payment_id)
        if not payment:
            return jsonify({"detail": "Payment not found"}), 404

        verifier = User.query.get(verifier_id)
        if not verifier or verifier.role not in ['admin', 'master_approver']:
            return jsonify({
                "detail": "Unauthorized. Only admins and master approvers can verify payments"
            }), 403

        if action == 'verify':
            payment.payment_status = 'verified'
            payment.verified_by = verifier_id
            payment.verified_at = datetime.now()
        else:
            payment.payment_status = 'rejected'
            payment.rejection_reason = rejection_reason

        db.session.commit()

        return jsonify({
            "message": f"Payment {action}ed successfully",
            "payment": payment.to_dict(),
        }), 200

    except Exception as e:
        db.session.rollback()
        print(f"Error verifying payment: {e}")
        return jsonify({"detail": str(e)}), 500


@payment_bp.route('/api/payments/all', methods=['GET', 'OPTIONS'])
def get_all_payments():
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