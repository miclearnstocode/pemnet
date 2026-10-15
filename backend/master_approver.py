from models import db, Submission, EmailSubmission, ExtractedAbstractData, SubmissionVote, User, EmailNotificationLog, EvaluatorDiscussion
from email_service import send_status_update_email, send_endorsement_confirmation_email, build_endorsement_email
import traceback

class MasterApproverService:
    
    @staticmethod
    def get_status_summary():
        try:
            system_total = Submission.query.count()
            system_pending = Submission.query.filter_by(status='pending').count()
            system_endorsed = Submission.query.filter_by(status='endorse').count()
            system_non_competitive = Submission.query.filter_by(status='downgraded-non_competitive').count()
            system_poster_only = Submission.query.filter_by(status='downgraded-poster_only').count()
            
            return {
                "total": system_total,
                "pending": system_pending,
                "endorsed": system_endorsed,
                "non_competitive": system_non_competitive,
                "poster_only": system_poster_only
            }, 200
            
        except Exception as e:
            print(f"Error getting status summary: {e}")
            traceback.print_exc()
            return {"detail": str(e)}, 500
    
    @staticmethod
    def get_pending_submissions():
        try:
            results = []
            
            # Get system submissions with status 'pending' (master approver hasn't decided yet)
            system_submissions = Submission.query.filter_by(status='pending').all()
            for sub in system_submissions:
                votes = SubmissionVote.query.filter_by(submission_id=sub.submission_id).all()
                vote_stats = {
                    'endorse': sum(1 for v in votes if v.vote_status == 'endorse'),
                    'downgrade': sum(1 for v in votes if v.vote_status in ['downgraded-non_competitive', 'downgraded-poster_only', 'downgrade']),
                    'reassign': sum(1 for v in votes if v.vote_status == 'reassign')
                }
                results.append({
                    'id': sub.submission_id,
                    'type': 'system',
                    'title': sub.extension_project_title,
                    'project_leader': sub.project_leader,
                    'suc_agencies': sub.suc_agencies,
                    'paper_category': sub.paper_category,
                    'thematic_area': sub.thematic_area,
                    'status': sub.status,
                    'evaluation_status': sub.evaluation_status,
                    'created_at': sub.created_at,
                    'vote_stats': vote_stats,
                    'votes': [{
                        'evaluator_id': v.evaluator_id,
                        'vote_status': v.vote_status,
                        'vote_notes': v.vote_notes,
                        'vote_reassign_to': v.vote_reassign_to,
                        'vote_downgrade_to': v.vote_downgrade_to
                    } for v in votes]
                })
            
            return results, 200
            
        except Exception as e:
            print(f"Error getting pending submissions: {e}")
            traceback.print_exc()
            return {"detail": str(e)}, 500
    
    @staticmethod
    def get_submission_with_votes(submission_id):
        try:
            discussion_count = EvaluatorDiscussion.query.filter_by(submission_id=submission_id).count()

            # First try to find in system submissions
            submission = Submission.query.filter_by(submission_id=submission_id).first()
            if submission:
                votes = SubmissionVote.query.filter_by(submission_id=submission_id).all()
                vote_stats = {
                    'endorse': sum(1 for v in votes if v.vote_status == 'endorse'),
                    'downgrade': sum(1 for v in votes if v.vote_status in ['downgraded-non_competitive', 'downgraded-poster_only', 'downgrade']),
                    'reassign': sum(1 for v in votes if v.vote_status == 'reassign')
                }
                return {
                    'submission': {
                        'id': submission.id,
                        'submission_id': submission.submission_id,
                        'title': submission.extension_project_title,
                        'project_leader': submission.project_leader, 
                        'suc_agencies': submission.suc_agencies,
                        'paper_category': submission.paper_category,
                        'thematic_area': submission.thematic_area,
                        'corresponding_author_name': submission.corresponding_author_name,
                        'corresponding_author_email': submission.corresponding_author_email,
                        'corresponding_author_position': submission.corresponding_author_position,
                        'status': submission.status,
                        'evaluation_status': submission.evaluation_status,
                        'abstract_view_url': submission.abstract_view_url,
                        'endorsement_view_url': submission.endorsement_view_url,
                        'created_at': submission.created_at
                    },
                    'votes': [{
                        'evaluator_id': v.evaluator_id,
                        'vote_status': v.vote_status,
                        'vote_notes': v.vote_notes,
                        'vote_reassign_to': v.vote_reassign_to,
                        'vote_downgrade_to': v.vote_downgrade_to
                    } for v in votes],
                    'vote_stats': vote_stats,
                    'type': 'system',
                    'discussion_count': discussion_count
                }, 200
            
            # If not found, try email submission (extracted_abstract_data)
            extracted = ExtractedAbstractData.query.filter_by(submission_id=submission_id).first()
            if extracted:
                email_sub = EmailSubmission.query.get(extracted.email_submission_id)
                if email_sub:
                    votes = SubmissionVote.query.filter_by(submission_id=submission_id).all()
                    vote_stats = {
                        'endorse': sum(1 for v in votes if v.vote_status == 'endorse'),
                        'downgrade': sum(1 for v in votes if v.vote_status in ['downgraded-non_competitive', 'downgraded-poster_only', 'downgrade']),
                        'reassign': sum(1 for v in votes if v.vote_status == 'reassign')
                    }
                    
                    return {
                        'submission': {
                            'id': email_sub.id,
                            'submission_id': extracted.submission_id,
                            'title': extracted.title or email_sub.subject,
                            'project_leader': extracted.project_leader or email_sub.project_leader_name, 
                            'suc_agencies': extracted.sucs or email_sub.sender_name,
                            'paper_category': extracted.paper_category or 'Not specified',
                            'thematic_area': extracted.thematic_area or 'Not specified',
                            'corresponding_author_name': extracted.corresponding_author_name or 'N/A',
                            'corresponding_author_email': extracted.corresponding_author_email or email_sub.sender_email,
                            'corresponding_author_position': extracted.corresponding_author_position or 'N/A',
                            'status': email_sub.status,
                            'evaluation_status': extracted.evaluation_status,
                            'abstract_view_url': email_sub.attachment_view_url,
                            'endorsement_view_url': None,
                            'created_at': email_sub.email_received_at
                        },
                        'votes': [{
                            'evaluator_id': v.evaluator_id,
                            'vote_status': v.vote_status,
                            'vote_notes': v.vote_notes,
                            'vote_reassign_to': v.vote_reassign_to,
                            'vote_downgrade_to': v.vote_downgrade_to
                        } for v in votes],
                        'vote_stats': vote_stats,
                        'type': 'email',
                        'discussion_count': discussion_count
                    }, 200
            
            return {"detail": "Submission not found"}, 404
            
        except Exception as e:
            print(f"Error getting submission details: {e}")
            traceback.print_exc()
            return {"detail": str(e)}, 500
    
    @staticmethod
    def set_final_status(submission_id, data):
        try:
            # The frontend sends: 'endorse', 'downgraded-non_competitive', 'downgraded-poster_only', 'pending'
            status = data.get('status')
            master_approver_id = data.get('master_approver_id')
            notes = data.get('notes', '')
            
            if not status or not master_approver_id:
                return {"detail": "Status and master_approver_id are required"}, 400
            
            # Validate status is one of the allowed values
            allowed_statuses = ['endorse', 'downgraded-non_competitive', 'downgraded-poster_only', 'pending']
            if status not in allowed_statuses:
                return {"detail": f"Invalid status: {status}. Must be one of: {', '.join(allowed_statuses)}"}, 400
            
            # First try to find in system submissions
            submission = Submission.query.filter_by(submission_id=submission_id).first()
            if submission:
                # Update the status column directly with the full status value
                submission.status = status
                # evaluation_status remains unchanged (evaluators' decision)
                
                db.session.commit()
                
                return {
                    "message": f"Status updated to {status}",
                    "status": status,
                    "evaluation_status": submission.evaluation_status,
                    "type": "system"
                }, 200
            
            # If not found, try email submission (extracted_abstract_data)
            extracted = ExtractedAbstractData.query.filter_by(submission_id=submission_id).first()
            if extracted:
                # For email submissions, we update both the email_submission status and extracted_data evaluation_status
                email_sub = EmailSubmission.query.get(extracted.email_submission_id)
                if email_sub:
                    # Update email_submission status
                    email_sub.status = status
                    extracted.evaluation_status = status
                
                db.session.commit()
                
                return {
                    "message": f"Status updated to {status}",
                    "status": status,
                    "evaluation_status": extracted.evaluation_status,
                    "type": "email"
                }, 200
            
            return {"detail": "Submission not found"}, 404
            
        except Exception as e:
            db.session.rollback()
            print(f"Error setting final status: {e}")
            traceback.print_exc()
            return {"detail": str(e)}, 500
    
    COMMUNICATION_STATUSES = ('endorse', 'downgraded-non_competitive', 'downgraded-poster_only')

    @staticmethod
    def _communication_context(submission_id):

        submission = Submission.query.filter_by(submission_id=submission_id).first()
        if not submission:
            return None, {"detail": "Submission not found"}, 404

        if submission.status not in MasterApproverService.COMMUNICATION_STATUSES:
            return None, {
                "detail": "Set the final decision (endorse or downgrade) before sending a communication email"
            }, 400

        submission_dict = {
            'submission_id': submission.submission_id,
            'extension_project_title': submission.extension_project_title,
            'project_leader': submission.project_leader,
            'corresponding_author_name': submission.corresponding_author_name,
            'corresponding_author_email': submission.corresponding_author_email,
            'corresponding_author_position': submission.corresponding_author_position,
            'co_authors': submission.co_authors,
            'suc_agencies': submission.suc_agencies,
            'paper_category': submission.paper_category,
            'thematic_area': submission.thematic_area,
            'status': submission.status,
        }
        return submission_dict, None, None

    @staticmethod
    def get_communication_email_preview(submission_id):
        """Build the acceptance/downgrade email WITHOUT sending it."""
        try:
            submission_dict, error, code = MasterApproverService._communication_context(submission_id)
            if error:
                return error, code

            email = build_endorsement_email(submission_dict)
            if not email:
                return {"detail": "No recipient email found for this submission"}, 400

            last_sent = EmailNotificationLog.query.filter_by(submission_id=submission_id, email_type='endorsement', status='sent'
            ).order_by(EmailNotificationLog.created_at.desc()).first()

            return {
                "to": email['to_email'],
                "cc": email['cc_list'],
                "subject": email['subject'],
                "html_body": email['html_body'],
                "template_used": email['template_used'],
                "status": email['status'],
                "submission_id": submission_id,
                "already_sent": last_sent is not None,
                "last_sent_at": last_sent.sent_at.isoformat() if last_sent and last_sent.sent_at else None,
            }, 200

        except Exception as e:
            print(f"Error building communication email preview: {e}")
            traceback.print_exc()
            return {"detail": str(e)}, 500

    @staticmethod
    def send_communication_email(submission_id, data):
        """Send the acceptance/downgrade email for a submission whose status is already set."""
        try:
            master_approver_id = (data or {}).get('master_approver_id')
            if not master_approver_id:
                return {"detail": "master_approver_id is required"}, 400

            submission_dict, error, code = MasterApproverService._communication_context(submission_id)
            if error:
                return error, code

            email_sent = send_endorsement_confirmation_email(submission_dict, master_approver_id=master_approver_id)
            if not email_sent:
                return {"detail": "Email failed to send. Check the email logs for details."}, 502

            return {"message": "Communication email sent", "email_sent": True, "status": submission_dict['status'], }, 200

        except Exception as e:
            print(f"Error sending communication email: {e}")
            traceback.print_exc()
            return {"detail": str(e)}, 500

    @staticmethod
    def bulk_send_status_emails(data):
        try:
            submission_ids = data.get('submission_ids', [])
            status = data.get('status')
            
            if not submission_ids:
                return {"detail": "No submissions selected"}, 400
            
            sent_count = 0
            failed_count = 0
            
            for submission_id in submission_ids:
                # Try system submissions first
                submission = Submission.query.filter_by(submission_id=submission_id).first()
                if submission:
                    author_name = submission.corresponding_author_name or submission.project_leader 
                    email_sent = send_status_update_email(submission.corresponding_author_email or submission.corresponding_author_email,
                        author_name, submission.extension_project_title, status, submission_id=submission.submission_id)
                    if email_sent:
                        sent_count += 1
                    else:
                        failed_count += 1
                    continue
                
                # Try email submissions
                extracted = ExtractedAbstractData.query.filter_by(submission_id=submission_id).first()
                if extracted:
                    email_sub = EmailSubmission.query.get(extracted.email_submission_id)
                    if email_sub:
                        corr_email = extracted.corresponding_author_email or email_sub.sender_email
                        author_name = extracted.corresponding_author_name or email_sub.project_leader_name or email_sub.sender_name
                        project_title = extracted.title or email_sub.subject
                        email_sent = send_status_update_email(corr_email, author_name, project_title, status, submission_id=submission_id)
                        if email_sent:
                            sent_count += 1
                        else:
                            failed_count += 1
            
            return {
                "message": f"Sent {sent_count} emails, {failed_count} failed",
                "sent": sent_count,
                "failed": failed_count
            }, 200
            
        except Exception as e:
            print(f"Error sending bulk emails: {e}")
            traceback.print_exc()
            return {"detail": str(e)}, 500