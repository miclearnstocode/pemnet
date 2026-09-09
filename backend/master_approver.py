from models import db, Submission, EmailSubmission, ExtractedAbstractData, SubmissionVote, User, EmailNotificationLog
from email_service import send_status_update_email, send_endorsement_confirmation_email
import traceback
import json

class MasterApproverService:
    
    @staticmethod
    def get_status_summary():
        """Get status summary for master approver dashboard."""
        try:
            # Count system submissions by status (master approver decision)
            system_total = Submission.query.count()
            system_pending = Submission.query.filter_by(status='pending').count()
            system_endorsed = Submission.query.filter_by(status='endorse').count()
            system_non_competitive = Submission.query.filter_by(status='downgraded-non_competitive').count()
            system_poster_only = Submission.query.filter_by(status='downgraded-poster_only').count()
            
            # Count email submissions from extracted_abstract_data
            email_pending = ExtractedAbstractData.query.filter_by(evaluation_status='pending').count()
            email_endorsed = ExtractedAbstractData.query.filter_by(evaluation_status='endorse').count()
            email_non_competitive = ExtractedAbstractData.query.filter_by(evaluation_status='downgraded-non_competitive').count()
            email_poster_only = ExtractedAbstractData.query.filter_by(evaluation_status='downgraded-poster_only').count()
            
            # Get total system submissions
            total_system = system_total
            
            # Get total email submissions
            total_email = ExtractedAbstractData.query.count()
            
            return {
                "total": total_system + total_email,
                "pending": system_pending + email_pending,
                "endorsed": system_endorsed + email_endorsed,
                "non_competitive": system_non_competitive + email_non_competitive,
                "poster_only": system_poster_only + email_poster_only
            }, 200
            
        except Exception as e:
            print(f"Error getting status summary: {e}")
            traceback.print_exc()
            return {"detail": str(e)}, 500
    
    @staticmethod
    def get_pending_submissions():
        """Get all pending submissions with vote summaries."""
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
                    'author': sub.author,
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
            
            # Get email submissions (using extracted_abstract_data)
            email_data = ExtractedAbstractData.query.filter_by(evaluation_status='pending').all()
            for extracted in email_data:
                email_sub = EmailSubmission.query.get(extracted.email_submission_id)
                if email_sub:
                    # IMPORTANT FIX: Also fetch votes for email submissions
                    votes = SubmissionVote.query.filter_by(submission_id=extracted.submission_id).all()
                    vote_stats = {
                        'endorse': sum(1 for v in votes if v.vote_status == 'endorse'),
                        'downgrade': sum(1 for v in votes if v.vote_status in ['downgraded-non_competitive', 'downgraded-poster_only', 'downgrade']),
                        'reassign': sum(1 for v in votes if v.vote_status == 'reassign')
                    }
                    results.append({
                        'id': extracted.submission_id,
                        'type': 'email',
                        'title': extracted.title or email_sub.subject,
                        'author': extracted.project_leader or email_sub.project_leader_name,
                        'suc_agencies': extracted.sucs or email_sub.sender_name,
                        'paper_category': extracted.paper_category or 'Not specified',
                        'thematic_area': extracted.thematic_area or 'Not specified',
                        'status': email_sub.status,
                        'evaluation_status': extracted.evaluation_status,
                        'created_at': email_sub.email_received_at,
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
        """Get submission details with votes for master approver."""
        try:
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
                        'author': submission.author,
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
                    'type': 'system'
                }, 200
            
            # If not found, try email submission (extracted_abstract_data)
            extracted = ExtractedAbstractData.query.filter_by(submission_id=submission_id).first()
            if extracted:
                email_sub = EmailSubmission.query.get(extracted.email_submission_id)
                if email_sub:
                    # IMPORTANT FIX: Also fetch votes for email submissions using the same submission_id
                    votes = SubmissionVote.query.filter_by(submission_id=submission_id).all()
                    
                    # Fix vote stats to handle both 'downgrade' and specific downgrade types
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
                            'author': extracted.project_leader or email_sub.project_leader_name,
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
                        'type': 'email'
                    }, 200
            
            return {"detail": "Submission not found"}, 404
            
        except Exception as e:
            print(f"Error getting submission details: {e}")
            traceback.print_exc()
            return {"detail": str(e)}, 500
    
    @staticmethod
    def set_final_status(submission_id, data):
        """Set final status for a submission.
        
        IMPORTANT: Master Approver updates the 'status' column with the full status value.
        The 'evaluation_status' is for evaluators' decisions and should not be modified.
        """
        try:
            # The frontend sends: 'endorse', 'downgraded-non_competitive', 'downgraded-poster_only', 'pending'
            status = data.get('status')
            master_approver_id = data.get('master_approver_id')
            notes = data.get('notes', '')
            send_email = data.get('send_email', True)
            
            if not status or not master_approver_id:
                return {"detail": "Status and master_approver_id are required"}, 400
            
            # Validate status is one of the allowed values
            allowed_statuses = ['endorse', 'downgraded-non_competitive', 'downgraded-poster_only', 'pending']
            if status not in allowed_statuses:
                return {"detail": f"Invalid status: {status}. Must be one of: {', '.join(allowed_statuses)}"}, 400
            
            email_sent = False
            
            # First try to find in system submissions
            submission = Submission.query.filter_by(submission_id=submission_id).first()
            if submission:
                # Update the status column directly with the full status value
                submission.status = status
                # evaluation_status remains unchanged (evaluators' decision)
                
                db.session.commit()
                
                # Send email if requested
                if send_email:
                    if status == 'endorse':
                        # Use the detailed endorsement email
                        submission_dict = {
                            'submission_id': submission.submission_id,
                            'extension_project_title': submission.extension_project_title,
                            'author': submission.author,
                            'corresponding_author_name': submission.corresponding_author_name,
                            'corresponding_author_email': submission.corresponding_author_email,
                            'corresponding_author_position': submission.corresponding_author_position,
                            'suc_agencies': submission.suc_agencies,
                            'paper_category': submission.paper_category,
                            'thematic_area': submission.thematic_area
                        }
                        email_sent = send_endorsement_confirmation_email(
                            submission_dict,
                            master_approver_id=master_approver_id
                        )
                    else:
                        # Use the status update email
                        author_name = submission.corresponding_author_name or submission.author
                        cc_emails = [submission.corresponding_author_email] if submission.corresponding_author_email else None
                        email_sent = send_status_update_email(
                            submission.corresponding_author_email,
                            author_name,
                            submission.extension_project_title,
                            status,
                            notes,
                            submission_id=submission.submission_id,
                            master_approver_id=master_approver_id,
                            cc_emails=cc_emails
                        )
                
                return {
                    "message": f"Status updated to {status}",
                    "email_sent": email_sent,
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
                    
                    # For email submissions, also update the evaluation_status to match
                    # since email submissions don't have separate evaluator/master statuses
                    extracted.evaluation_status = status
                
                db.session.commit()
                
                # Send email if requested
                if send_email and email_sub:
                    # Get the corresponding author email from extracted data
                    corr_email = extracted.corresponding_author_email or email_sub.sender_email
                    author_name = extracted.corresponding_author_name or email_sub.project_leader_name or email_sub.sender_name
                    project_title = extracted.title or email_sub.subject
                    
                    if status == 'endorse':
                        # Use the detailed endorsement email
                        submission_dict = {
                            'submission_id': submission_id,
                            'extension_project_title': project_title,
                            'author': author_name,
                            'corresponding_author_name': extracted.corresponding_author_name or author_name,
                            'corresponding_author_email': corr_email,
                            'corresponding_author_position': extracted.corresponding_author_position or '',
                            'suc_agencies': extracted.sucs or email_sub.sender_name,
                            'paper_category': extracted.paper_category or 'Not specified',
                            'thematic_area': extracted.thematic_area or 'Not specified',
                            'sender_email': email_sub.sender_email
                        }
                        email_sent = send_endorsement_confirmation_email(
                            submission_dict,
                            extracted_data=extracted,
                            master_approver_id=master_approver_id
                        )
                    else:
                        cc_emails = [email_sub.sender_email] if email_sub.sender_email and email_sub.sender_email != corr_email else None
                        email_sent = send_status_update_email(
                            corr_email,
                            author_name,
                            project_title,
                            status,
                            notes,
                            submission_id=submission_id,
                            master_approver_id=master_approver_id,
                            cc_emails=cc_emails
                        )
                
                return {
                    "message": f"Status updated to {status}",
                    "email_sent": email_sent,
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
    
    @staticmethod
    def bulk_send_status_emails(data):
        """Send bulk status update emails."""
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
                    author_name = submission.corresponding_author_name or submission.author
                    email_sent = send_status_update_email(
                        submission.corresponding_author_email,
                        author_name,
                        submission.extension_project_title,
                        status,
                        submission_id=submission.submission_id
                    )
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
                        email_sent = send_status_update_email(
                            corr_email,
                            author_name,
                            project_title,
                            status,
                            submission_id=submission_id
                        )
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