"""Evaluator routes: voting, discussions, edit history, and submission edits."""

import json
import traceback

from flask import Blueprint, jsonify, request

from models import (
    db, Submission, SubmissionRevision, SubmissionVote,
    EvaluatorDiscussion, User, ExtractedAbstractData,
)
from services.email_processor_service import get_submission_data

evaluator_bp = Blueprint('evaluator', __name__)


@evaluator_bp.route('/api/submissions/<string:submission_id>/evaluate', methods=['POST', 'OPTIONS'])
def evaluate_submission(submission_id):
    if request.method == 'OPTIONS':
        return jsonify({})

    try:
        data = request.get_json()
        evaluator_id = data.get('evaluator_id')
        vote_status = data.get('vote_status')
        vote_notes = data.get('vote_notes', '')
        vote_reassign_to = data.get('vote_reassign_to', '')
        vote_downgrade_to = data.get('vote_downgrade_to', '')

        if not evaluator_id or not vote_status:
            return jsonify({"detail": "Evaluator ID and vote status are required"}), 400

        valid_statuses = ['endorse', 'downgraded-non_competitive',
                          'downgraded-poster_only', 'reassign']
        if vote_status not in valid_statuses:
            return jsonify({"detail": "Invalid vote status"}), 400

        submission_data = get_submission_data(submission_id)
        if not submission_data:
            return jsonify({"detail": "Submission not found"}), 404

        existing_vote = SubmissionVote.query.filter_by(
            submission_id=submission_id, evaluator_id=evaluator_id,
        ).first()

        if existing_vote:
            existing_vote.vote_status = vote_status
            existing_vote.vote_notes = vote_notes
            existing_vote.vote_reassign_to = vote_reassign_to
            if vote_status in ['downgraded-non_competitive', 'downgraded-poster_only']:
                existing_vote.vote_downgrade_to = vote_status
            else:
                existing_vote.vote_downgrade_to = None
        else:
            db.session.add(SubmissionVote(
                submission_id=submission_id,
                evaluator_id=evaluator_id,
                vote_status=vote_status,
                vote_notes=vote_notes,
                vote_reassign_to=vote_reassign_to,
                vote_downgrade_to=vote_status if vote_status in [
                    'downgraded-non_competitive', 'downgraded-poster_only'
                ] else None,
            ))

        if vote_status == 'reassign' and vote_reassign_to:
            if submission_data['type'] == 'system':
                submission_data['data'].thematic_area = vote_reassign_to
            else:
                extracted = ExtractedAbstractData.query.filter_by(
                    email_submission_id=submission_data['id']
                ).first()
                if extracted:
                    extracted.thematic_area = vote_reassign_to

        db.session.commit()

        votes = SubmissionVote.query.filter_by(submission_id=submission_id).all()

        return jsonify({
            "message": "Vote recorded successfully",
            "evaluation_status": 'pending',
            "thematic_area": submission_data['thematic_area'],
            "votes": [{
                "evaluator_id": v.evaluator_id,
                "vote_status": v.vote_status,
                "vote_notes": v.vote_notes,
                "vote_reassign_to": v.vote_reassign_to,
                "vote_downgrade_to": v.vote_downgrade_to,
            } for v in votes],
        }), 200

    except Exception as e:
        db.session.rollback()
        traceback.print_exc()
        return jsonify({"detail": str(e)}), 500


@evaluator_bp.route('/api/submissions/<string:submission_id>/evaluate', methods=['GET', 'OPTIONS'])
def get_submission_votes(submission_id):
    if request.method == 'OPTIONS':
        return jsonify({})

    try:
        submission_data = get_submission_data(submission_id)
        if not submission_data:
            return jsonify({"detail": "Submission not found"}), 404

        votes = SubmissionVote.query.filter_by(submission_id=submission_id).all()
        evaluation_status = 'pending'

        if submission_data['type'] == 'system':
            if submission_data['data'].evaluation_status and \
               submission_data['data'].evaluation_status != 'pending':
                evaluation_status = submission_data['data'].evaluation_status
        else:
            extracted = ExtractedAbstractData.query.filter_by(
                email_submission_id=submission_data['id']
            ).first()
            if extracted and extracted.evaluation_status and \
               extracted.evaluation_status != 'pending':
                evaluation_status = extracted.evaluation_status

        return jsonify({
            "evaluation_status": evaluation_status,
            "votes": [{
                "id": v.id,
                "evaluator_id": v.evaluator_id,
                "vote_status": v.vote_status,
                "vote_notes": v.vote_notes,
                "vote_reassign_to": v.vote_reassign_to,
                "vote_downgrade_to": v.vote_downgrade_to,
                "updated_at": v.updated_at.strftime('%Y-%m-%d %H:%M:%S') if v.updated_at else None,
            } for v in votes],
        }), 200

    except Exception as e:
        traceback.print_exc()
        return jsonify({"detail": str(e)}), 500


@evaluator_bp.route('/api/submissions/<string:submission_id>/discussions', methods=['POST', 'OPTIONS'])
def post_discussion(submission_id):
    if request.method == 'OPTIONS':
        return jsonify({})

    try:
        data = request.get_json()
        evaluator_id = data.get('evaluator_id')
        message = data.get('message', '')

        if not evaluator_id or not message:
            return jsonify({"detail": "Evaluator ID and message are required"}), 400

        if not get_submission_data(submission_id):
            return jsonify({"detail": "Submission not found"}), 404

        new_message = EvaluatorDiscussion(
            submission_id=submission_id,
            evaluator_id=evaluator_id,
            message=message,
        )
        db.session.add(new_message)
        db.session.commit()

        return jsonify({
            "message": "Discussion posted successfully",
            "id": new_message.id,
            "evaluator_id": new_message.evaluator_id,
            "message": new_message.message,
            "created_at": new_message.created_at.strftime('%Y-%m-%d %H:%M:%S') if new_message.created_at else None,
        }), 201

    except Exception as e:
        db.session.rollback()
        traceback.print_exc()
        return jsonify({"detail": str(e)}), 500


@evaluator_bp.route('/api/submissions/<string:submission_id>/discussions', methods=['GET', 'OPTIONS'])
def get_discussions(submission_id):
    if request.method == 'OPTIONS':
        return jsonify({})

    try:
        if not get_submission_data(submission_id):
            return jsonify({"detail": "Submission not found"}), 404

        discussions = EvaluatorDiscussion.query.filter_by(
            submission_id=submission_id
        ).order_by(EvaluatorDiscussion.created_at.asc()).all()

        result = []
        for d in discussions:
            user = User.query.get(d.evaluator_id)
            result.append({
                "id": d.id,
                "evaluator_id": d.evaluator_id,
                "evaluator_name": user.full_name if user else 'Unknown',
                "message": d.message,
                "created_at": d.created_at.strftime('%Y-%m-%d %H:%M:%S') if d.created_at else None,
            })

        return jsonify(result), 200

    except Exception as e:
        traceback.print_exc()
        return jsonify({"detail": str(e)}), 500


@evaluator_bp.route('/api/submissions/<string:submission_id>/edit', methods=['PUT', 'OPTIONS'])
def edit_system_submission(submission_id):
    if request.method == 'OPTIONS':
        return jsonify({})

    try:
        from google_drive import move_submission_files

        data = request.get_json()
        evaluator_id = data.get('evaluator_id')

        if not evaluator_id:
            return jsonify({"detail": "Evaluator ID is required"}), 400

        submission = Submission.query.filter_by(submission_id=submission_id).first()
        if not submission:
            return jsonify({"detail": "Submission not found"}), 404

        user = User.query.get(evaluator_id)
        user_name = user.full_name if user else 'Unknown'
        is_master_approver = user.role in ['admin', 'master_approver'] if user else False

        editable_fields = {
            'extension_project_title': 'extension_project_title',
            'thematic_area': 'thematic_area',
            'paper_category': 'paper_category',
            'suc_agencies': 'suc_agencies',
            'project_leader': 'project_leader',
            'presenter': 'presenter',
            'corresponding_author_name': 'corresponding_author_name',
            'corresponding_author_email': 'corresponding_author_email',
            'corresponding_author_position': 'corresponding_author_position',
            'co_authors': 'co_authors',
        }

        changes = {}
        needs_file_move = False

        old_paper_category = submission.paper_category
        old_thematic_area = submission.thematic_area
        old_sender_name = submission.project_leader or submission.presenter

        for field_name, db_field in editable_fields.items():
            if field_name in data:
                old_value = getattr(submission, db_field)
                new_value = data[field_name]
                old_str = str(old_value) if old_value is not None else ''
                new_str = str(new_value) if new_value is not None else ''
                if old_str != new_str:
                    changes[field_name] = {'old': old_value, 'new': new_value}
                    setattr(submission, db_field, new_value)
                    if field_name in ['paper_category', 'thematic_area']:
                        needs_file_move = True

        new_sender_name = submission.project_leader or submission.presenter
        if str(old_sender_name or '') != str(new_sender_name or ''):
            needs_file_move = True

        drive_move_result = None
        if needs_file_move and changes:
            try:
                file_urls = []
                file_labels = []

                if submission.abstract_view_url:
                    file_urls.append(submission.abstract_view_url)
                    file_labels.append('abstract')

                if submission.endorsement_view_url:
                    file_urls.append(submission.endorsement_view_url)
                    file_labels.append('endorsement')

                if submission.compextproj_drive_view_url:
                    file_urls.append(submission.compextproj_drive_view_url)
                    file_labels.append('completed_extension_project')

                if file_urls:
                    drive_move_result = move_submission_files(
                        file_urls,
                        submission.paper_category,
                        submission.thematic_area,
                        new_sender_name,
                    )
                    if drive_move_result and drive_move_result.get('url_mapping'):
                        for old_url, new_urls in drive_move_result['url_mapping'].items():
                            if submission.abstract_view_url == old_url:
                                submission.abstract_view_url = new_urls['view_url']
                                submission.abstract_download_url = new_urls['download_url']
                            elif submission.endorsement_view_url == old_url:
                                submission.endorsement_view_url = new_urls['view_url']
                                submission.endorsement_download_url = new_urls['download_url']
                            elif submission.compextproj_drive_view_url == old_url:
                                submission.compextproj_drive_view_url = new_urls['view_url']
                                submission.compextproj_drive_download_url = new_urls['download_url']
            except Exception as drive_error:
                print(f"⚠️ Drive move error (non-fatal): {drive_error}")
                traceback.print_exc()
                drive_move_result = {'error': str(drive_error)}

        if changes:
            db.session.commit()

            revision = SubmissionRevision(
                submission_id=submission_id,
                edited_by=evaluator_id,
                edited_by_name=user_name,
                is_master_approver=is_master_approver,
                changes=json.dumps(changes),
                extension_project_title=submission.extension_project_title,
                thematic_area=submission.thematic_area,
                paper_category=submission.paper_category,
                suc_agencies=submission.suc_agencies,
                project_leader=submission.project_leader,
                presenter=submission.presenter,
                corresponding_author_name=submission.corresponding_author_name,
                corresponding_author_email=submission.corresponding_author_email,
                corresponding_author_position=submission.corresponding_author_position,
                co_authors=submission.co_authors,
            )
            db.session.add(revision)
            db.session.commit()

            return jsonify({
                "message": "Submission updated successfully",
                "changes": changes,
                "revision_id": revision.id,
                "drive_move": drive_move_result,
            }), 200

        return jsonify({"message": "No changes made"}), 200

    except Exception as e:
        db.session.rollback()
        print(f"Error editing submission: {e}")
        traceback.print_exc()
        return jsonify({"detail": str(e)}), 500


@evaluator_bp.route('/api/submissions/<string:submission_id>/edit-history', methods=['GET', 'OPTIONS'])
def get_submission_edit_history(submission_id):
    if request.method == 'OPTIONS':
        return jsonify({})

    try:
        revisions = SubmissionRevision.query.filter_by(
            submission_id=submission_id
        ).order_by(SubmissionRevision.created_at.desc()).all()
        return jsonify([rev.to_dict() for rev in revisions]), 200

    except Exception as e:
        print(f"Error fetching edit history: {e}")
        traceback.print_exc()
        return jsonify({"detail": str(e)}), 500


@evaluator_bp.route('/api/users/<int:user_id>/thematic-areas', methods=['GET', 'OPTIONS'])
def get_user_thematic_areas_simple(user_id):
    if request.method == 'OPTIONS':
        return jsonify({})

    try:
        submissions = Submission.query.filter_by(user_id=user_id)\
            .with_entities(Submission.thematic_area).distinct().all()
        thematic_areas = [s[0] for s in submissions if s[0]]
        return jsonify({"user_id": user_id, "thematic_areas": thematic_areas}), 200
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"detail": str(e)}), 500


@evaluator_bp.route('/api/users/<int:user_id>/thematic-areas', methods=['POST', 'OPTIONS'])
def update_user_thematic_areas_simple(user_id):
    if request.method == 'OPTIONS':
        return jsonify({})

    try:
        data = request.get_json()
        submission_id = data.get('submission_id')
        new_thematic_area = data.get('thematic_area')

        if not submission_id or not new_thematic_area:
            return jsonify({"detail": "Submission ID and thematic area are required"}), 400

        submission = Submission.query.filter_by(id=submission_id, user_id=user_id).first()
        if not submission:
            return jsonify({"detail": "Submission not found"}), 404

        submission.thematic_area = new_thematic_area
        db.session.commit()

        return jsonify({
            "message": "Updated successfully",
            "submission_id": submission_id,
            "new_thematic_area": new_thematic_area,
        }), 200

    except Exception as e:
        db.session.rollback()
        print(f"Error: {e}")
        return jsonify({"detail": str(e)}), 500