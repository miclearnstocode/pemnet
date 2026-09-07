from flask import jsonify, request
from models import db, Submission, User, SubmissionVote, EmailSubmission, ExtractedAbstractData
from email_service import send_status_update_email, send_endorsement_confirmation_email
import traceback
import json

class MasterApproverService:
    """Service class for master approver operations."""
    
    VALID_STATUSES = ['pending', 'endorse', 'downgraded-non_competitive', 'downgraded-poster_only']
    
    @staticmethod
    def set_final_status(submission_id, data):
        """
        Set the final status of a submission by the master approver.
        This updates both submissions.status and submissions.evaluation_status,
        and also updates extracted_abstract_data.status if it exists.
        """
        try:
            status = data.get('status')
            master_approver_id = data.get('master_approver_id')
            notes = data.get('notes', '')
            send_email = data.get('send_email', True)  # NEW: Flag to control email sending
            
            # Validate inputs
            if not status:
                return {"detail": "Status is required"}, 400
            
            if status not in MasterApproverService.VALID_STATUSES:
                return {
                    "detail": f"Invalid status. Must be one of: {', '.join(MasterApproverService.VALID_STATUSES)}"
                }, 400
            
            # Get submission
            submission = Submission.query.get(submission_id)
            if not submission:
                return {"detail": "Submission not found"}, 404
            
            # Check if user is master approver
            if master_approver_id:
                user = User.query.get(master_approver_id)
                if not user or user.role not in ['admin', 'master_approver']:
                    return {"detail": "Unauthorized. Only master approvers can perform this action."}, 403
            
            # Update status in submissions table
            old_status = submission.evaluation_status
            
            # Map status for submissions.status field
            status_mapping = {
                'endorse': 'endorse',
                'downgraded-non_competitive': 'downgraded',
                'downgraded-poster_only': 'downgraded',
                'pending': 'pending'
            }
            
            submission.evaluation_status = status
            submission.status = status_mapping.get(status, 'pending')
            
            # Get extracted data if it exists
            extracted_data = None
            email_sub = EmailSubmission.query.filter_by(processed_submission_id=submission_id).first()
            if email_sub:
                extracted_data = ExtractedAbstractData.query.filter_by(email_submission_id=email_sub.id).first()
                if extracted_data:
                    # Update extracted_abstract_data status
                    extracted_data.evaluation_status = status
                    extracted_data.status = status_mapping.get(status, 'pending')
                    print(f"📝 Updated extracted_abstract_data (id: {extracted_data.id}) status to '{status}'")
            
            # Log the change
            print(f"🔄 Master Approver {master_approver_id} changed status from '{old_status}' to '{status}' for submission {submission_id}")
            
            db.session.commit()
            
            # Send email notification based on status
            try:
                # Always send status update email
                MasterApproverService._send_status_notification(submission, status, notes)
                
                # If status is 'endorse' and send_email is True, send detailed confirmation email
                if status == 'endorse' and send_email:
                    # Prepare submission data for email
                    submission_data = submission.to_dict()
                    
                    # Get extracted data if available
                    extracted_dict = None
                    if extracted_data:
                        extracted_dict = {
                            'title': extracted_data.title,
                            'authors': extracted_data.authors,
                            'authors_list': extracted_data.authors_list,
                            'project_leader': extracted_data.project_leader,
                            'sucs': extracted_data.sucs,
                            'corresponding_author_name': extracted_data.corresponding_author_name,
                            'corresponding_author_email': extracted_data.corresponding_author_email,
                            'corresponding_author_position': extracted_data.corresponding_author_position,
                            'paper_category': extracted_data.paper_category,
                            'thematic_area': extracted_data.thematic_area,
                            'theme': extracted_data.theme,
                            'submission_id': extracted_data.submission_id
                        }
                    
                    # Send the detailed endorsement confirmation email
                    email_sent = send_endorsement_confirmation_email(submission_data, extracted_dict)
                    if email_sent:
                        print(f"📧 Endorsement confirmation email sent for submission {submission_id}")
                    else:
                        print(f"⚠️ Endorsement confirmation email not sent for submission {submission_id}")
                        
            except Exception as email_error:
                print(f"⚠️ Error sending email notification: {email_error}")
                # Don't fail the request if email fails
            
            # Get updated data
            updated_submission = Submission.query.get(submission_id)
            updated_email_sub = EmailSubmission.query.filter_by(processed_submission_id=submission_id).first()
            updated_extracted = None
            if updated_email_sub:
                updated_extracted = ExtractedAbstractData.query.filter_by(email_submission_id=updated_email_sub.id).first()
            
            return {
                "message": f"Status updated to {status}",
                "submission_id": submission.id,
                "old_status": old_status,
                "new_status": submission.evaluation_status,
                "updated_by": master_approver_id,
                "submission_status": submission.status,
                "extracted_status": updated_extracted.evaluation_status if updated_extracted else None,
                "is_email_submission": updated_email_sub is not None,
                "email_sent": status == 'endorse' and send_email  # Indicate if email was sent
            }, 200
            
        except Exception as e:
            db.session.rollback()
            print(f"Error setting master status: {e}")
            traceback.print_exc()
            return {"detail": str(e)}, 500
    
    @staticmethod
    def _send_status_notification(submission, new_status, notes=''):
        """Send status update email to the author."""
        try:
            # Find author email
            author_email = None
            author_name = submission.author
            
            # Try to find user by full name
            user = User.query.filter_by(full_name=author_name).first()
            if user:
                author_email = user.email
            else:
                # Search in email_submissions
                email_sub = EmailSubmission.query.filter_by(processed_submission_id=submission.id).first()
                if email_sub:
                    author_email = email_sub.sender_email
                    if not author_name:
                        author_name = email_sub.sender_name
            
            if author_email:
                send_status_update_email(
                    to_email=author_email,
                    author_name=author_name or 'Author',
                    project_title=submission.extension_project_title,
                    new_status=new_status,
                    notes=notes
                )
                print(f"📧 Status update email sent to {author_email}")
            else:
                print(f"⚠️ No email found for author, skipping notification")
                
        except Exception as e:
            print(f"⚠️ Error sending email notification: {e}")
    
    @staticmethod
    def get_submission_with_votes(submission_id):
        """
        Get submission details along with all votes and extracted data.
        
        Args:
            submission_id (int): ID of the submission
        
        Returns:
            tuple: (response, status_code)
        """
        try:
            submission = Submission.query.get(submission_id)
            if not submission:
                return {"detail": "Submission not found"}, 404
            
            votes = SubmissionVote.query.filter_by(submission_id=submission_id).all()
            
            # Get vote statistics
            vote_stats = {
                'endorse': 0,
                'downgrade': 0,
                'reassign': 0,
                'total': len(votes)
            }
            
            vote_details = []
            for vote in votes:
                if vote.vote_status in vote_stats:
                    vote_stats[vote.vote_status] += 1
                
                # Get evaluator name
                evaluator = User.query.get(vote.evaluator_id)
                evaluator_name = evaluator.full_name if evaluator else f"Evaluator {vote.evaluator_id}"
                
                vote_details.append({
                    "id": vote.id,
                    "evaluator_id": vote.evaluator_id,
                    "evaluator_name": evaluator_name,
                    "vote_status": vote.vote_status,
                    "vote_notes": vote.vote_notes,
                    "vote_reassign_to": vote.vote_reassign_to,
                    "vote_downgrade_to": vote.vote_downgrade_to,
                    "created_at": vote.created_at.strftime('%Y-%m-%d %H:%M:%S') if vote.created_at else None,
                    "updated_at": vote.updated_at.strftime('%Y-%m-%d %H:%M:%S') if vote.updated_at else None
                })
            
            # Check if this is an email submission
            email_sub = EmailSubmission.query.filter_by(processed_submission_id=submission_id).first()
            extracted_data = None
            if email_sub:
                extracted = ExtractedAbstractData.query.filter_by(email_submission_id=email_sub.id).first()
                if extracted:
                    extracted_data = {
                        "id": extracted.id,
                        "title": extracted.title,
                        "title_english": extracted.title_english,
                        "authors": extracted.authors,
                        "authors_list": json.loads(extracted.authors_list) if extracted.authors_list else [],
                        "project_leader": extracted.project_leader,
                        "corresponding_author_name": extracted.corresponding_author_name,
                        "corresponding_author_email": extracted.corresponding_author_email,
                        "paper_category": extracted.paper_category,
                        "thematic_area": extracted.thematic_area,
                        "theme": extracted.theme,
                        "evaluation_status": extracted.evaluation_status,
                        "extraction_status": extracted.extraction_status,
                        "extraction_error": extracted.extraction_error
                    }
            
            return {
                "submission": submission.to_dict(),
                "votes": vote_details,
                "vote_stats": vote_stats,
                "evaluation_status": submission.evaluation_status,
                "is_email_submission": email_sub is not None,
                "extracted_data": extracted_data,
                "email_submission": email_sub.to_dict() if email_sub else None
            }, 200
            
        except Exception as e:
            print(f"Error getting submission with votes: {e}")
            traceback.print_exc()
            return {"detail": str(e)}, 500
    
    @staticmethod
    def bulk_send_status_emails(data):
        """
        Send status update emails to multiple authors.
        
        Args:
            data (dict): Request data with status filter
        
        Returns:
            tuple: (response, status_code)
        """
        try:
            status_filter = data.get('status')
            
            if not status_filter:
                return {"detail": "Status filter required"}, 400
            
            # Get submissions with the specified status
            if status_filter == 'all':
                submissions = Submission.query.all()
            else:
                submissions = Submission.query.filter_by(evaluation_status=status_filter).all()
            
            sent_count = 0
            errors = []
            
            for submission in submissions:
                try:
                    # Find author email
                    author_email = None
                    author_name = submission.author
                    
                    user = User.query.filter_by(full_name=author_name).first()
                    if user:
                        author_email = user.email
                    else:
                        email_sub = EmailSubmission.query.filter_by(processed_submission_id=submission.id).first()
                        if email_sub:
                            author_email = email_sub.sender_email
                            if not author_name:
                                author_name = email_sub.sender_name
                    
                    if author_email:
                        send_status_update_email(
                            to_email=author_email,
                            author_name=author_name or 'Author',
                            project_title=submission.extension_project_title,
                            new_status=submission.evaluation_status or 'pending',
                            notes=f"Final decision from the Master Approver"
                        )
                        sent_count += 1
                    else:
                        errors.append(f"Submission {submission.id}: No email found")
                        
                except Exception as e:
                    errors.append(f"Submission {submission.id}: {str(e)}")
            
            return {
                "message": f"Sent {sent_count} emails",
                "sent": sent_count,
                "errors": errors
            }, 200
            
        except Exception as e:
            print(f"Error sending bulk emails: {e}")
            traceback.print_exc()
            return {"detail": str(e)}, 500
    
    @staticmethod
    def get_status_summary():
        """
        Get summary statistics of all submissions for the master approver dashboard.
        
        Returns:
            tuple: (response, status_code)
        """
        try:
            total = Submission.query.count()
            pending = Submission.query.filter_by(evaluation_status='pending').count()
            endorsed = Submission.query.filter_by(evaluation_status='endorse').count()
            non_competitive = Submission.query.filter_by(evaluation_status='downgraded-non_competitive').count()
            poster_only = Submission.query.filter_by(evaluation_status='downgraded-poster_only').count()
            
            # Get pending submissions with vote counts
            pending_submissions = Submission.query.filter_by(evaluation_status='pending').order_by(
                Submission.created_at.desc()
            ).limit(20).all()
            
            pending_with_votes = []
            for sub in pending_submissions:
                votes = SubmissionVote.query.filter_by(submission_id=sub.id).all()
                vote_summary = {
                    'endorse': 0,
                    'downgrade': 0,
                    'reassign': 0
                }
                for vote in votes:
                    if vote.vote_status in vote_summary:
                        vote_summary[vote.vote_status] += 1
                
                pending_with_votes.append({
                    **sub.to_dict(),
                    'vote_summary': vote_summary,
                    'total_votes': len(votes)
                })
            
            return {
                "total": total,
                "pending": pending,
                "endorsed": endorsed,
                "non_competitive": non_competitive,
                "poster_only": poster_only,
                "recent_pending": pending_with_votes
            }, 200
            
        except Exception as e:
            print(f"Error getting status summary: {e}")
            traceback.print_exc()
            return {"detail": str(e)}, 500
    
    @staticmethod
    def get_pending_submissions():
        """
        Get all pending submissions with their vote summaries.
        
        Returns:
            tuple: (response, status_code)
        """
        try:
            submissions = Submission.query.filter_by(evaluation_status='pending').order_by(
                Submission.created_at.desc()
            ).all()
            
            result = []
            for sub in submissions:
                votes = SubmissionVote.query.filter_by(submission_id=sub.id).all()
                
                # Check if email submission
                email_sub = EmailSubmission.query.filter_by(processed_submission_id=sub.id).first()
                extracted = None
                if email_sub:
                    extracted = ExtractedAbstractData.query.filter_by(email_submission_id=email_sub.id).first()
                
                vote_summary = {
                    'endorse': 0,
                    'downgrade': 0,
                    'reassign': 0
                }
                for vote in votes:
                    if vote.vote_status in vote_summary:
                        vote_summary[vote.vote_status] += 1
                
                result.append({
                    **sub.to_dict(),
                    'vote_summary': vote_summary,
                    'total_votes': len(votes),
                    'is_email_submission': email_sub is not None,
                    'extracted_title': extracted.title if extracted else None,
                    'email_subject': email_sub.subject if email_sub else None
                })
            
            return result, 200
            
        except Exception as e:
            print(f"Error getting pending submissions: {e}")
            traceback.print_exc()
            return {"detail": str(e)}, 500