# master_approver.py
from models import db, Submission, EmailSubmission, ExtractedAbstractData, SubmissionVote, User
from email_service import send_status_update_email
import traceback
import json

class MasterApproverService:
    
    @staticmethod
    def get_status_summary():
        """Get status summary for master approver dashboard."""
        try:
            # Count system submissions
            system_total = Submission.query.count()
            system_pending = Submission.query.filter_by(evaluation_status='pending').count()
            system_endorsed = Submission.query.filter_by(evaluation_status='endorse').count()
            system_non_competitive = Submission.query.filter_by(evaluation_status='downgraded-non_competitive').count()
            system_poster_only = Submission.query.filter_by(evaluation_status='downgraded-poster_only').count()
            
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
            
            # Get system submissions
            system_submissions = Submission.query.filter_by(evaluation_status='pending').all()
            for sub in system_submissions:
                votes = SubmissionVote.query.filter_by(submission_id=sub.submission_id).all()
                vote_stats = {
                    'endorse': sum(1 for v in votes if v.vote_status == 'endorse'),
                    'downgrade': sum(1 for v in votes if v.vote_status == 'downgrade'),
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
                    results.append({
                        'id': extracted.submission_id,
                        'type': 'email',
                        'title': extracted.title or email_sub.subject,
                        'author': extracted.project_leader or email_sub.project_leader_name,
                        'suc_agencies': extracted.sucs or email_sub.sender_name,
                        'paper_category': extracted.paper_category or 'Not specified',
                        'thematic_area': extracted.thematic_area or 'Not specified',
                        'evaluation_status': extracted.evaluation_status,
                        'created_at': email_sub.email_received_at,
                        'vote_stats': {'endorse': 0, 'downgrade': 0, 'reassign': 0},
                        'votes': []
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
                    'downgrade': sum(1 for v in votes if v.vote_status == 'downgrade'),
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
                        'evaluation_status': submission.evaluation_status,
                        'status': submission.status,
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
            
            # If not found, try email submission
            extracted = ExtractedAbstractData.query.filter_by(submission_id=submission_id).first()
            if extracted:
                email_sub = EmailSubmission.query.get(extracted.email_submission_id)
                if email_sub:
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
                            'evaluation_status': extracted.evaluation_status,
                            'status': email_sub.status,
                            'abstract_view_url': email_sub.attachment_view_url,
                            'endorsement_view_url': None,
                            'created_at': email_sub.email_received_at
                        },
                        'votes': [],  # Email submissions don't have votes
                        'vote_stats': {'endorse': 0, 'downgrade': 0, 'reassign': 0},
                        'type': 'email'
                    }, 200
            
            return {"detail": "Submission not found"}, 404
            
        except Exception as e:
            print(f"Error getting submission details: {e}")
            traceback.print_exc()
            return {"detail": str(e)}, 500
    
    @staticmethod
    def set_final_status(submission_id, data):
        """Set final status for a submission."""
        try:
            status = data.get('status')
            master_approver_id = data.get('master_approver_id')
            notes = data.get('notes', '')
            send_email = data.get('send_email', True)
            
            if not status or not master_approver_id:
                return {"detail": "Status and master_approver_id are required"}, 400
            
            if status not in ['endorse', 'downgraded-non_competitive', 'downgraded-poster_only', 'pending']:
                return {"detail": "Invalid status"}, 400
            
            email_sent = False
            
            # First try to find in system submissions
            submission = Submission.query.filter_by(submission_id=submission_id).first()
            if submission:
                # Update system submission
                submission.evaluation_status = status
                if status == 'endorse':
                    submission.status = 'endorse'
                elif 'downgraded' in status:
                    submission.status = 'downgraded'
                else:
                    submission.status = 'pending'
                
                db.session.commit()
                
                # Send email if requested
                if send_email and status == 'endorse':
                    email_sent = send_status_update_email(
                        submission.corresponding_author_email,
                        submission,
                        status
                    )
                
                return {
                    "message": f"Status updated to {status}",
                    "email_sent": email_sent,
                    "status": status,
                    "type": "system"
                }, 200
            
            # If not found, try email submission (extracted_abstract_data)
            extracted = ExtractedAbstractData.query.filter_by(submission_id=submission_id).first()
            if extracted:
                # Update extracted_abstract_data evaluation_status
                extracted.evaluation_status = status
                
                # Also update the email_submission status
                email_sub = EmailSubmission.query.get(extracted.email_submission_id)
                if email_sub:
                    if status == 'endorse':
                        email_sub.status = 'endorse'
                    elif 'downgraded' in status:
                        email_sub.status = 'downgraded'
                    else:
                        email_sub.status = 'pending'
                
                db.session.commit()
                
                # Send email if requested
                if send_email and status == 'endorse' and email_sub:
                    # Get the corresponding author email from extracted data
                    corr_email = extracted.corresponding_author_email or email_sub.sender_email
                    email_sent = send_status_update_email(
                        corr_email,
                        extracted,
                        status
                    )
                
                return {
                    "message": f"Status updated to {status}",
                    "email_sent": email_sent,
                    "status": status,
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
                    email_sent = send_status_update_email(
                        submission.corresponding_author_email,
                        submission,
                        status
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
                        email_sent = send_status_update_email(
                            corr_email,
                            extracted,
                            status
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