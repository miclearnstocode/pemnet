from gmail_service import GmailService
from datetime import datetime
from models import db, EmailNotificationLog

# Initialize Gmail service
try:
    gmail_service = GmailService(target_email='pemnet26@gmail.com')
    print("✅ Gmail service initialized successfully")
except Exception as e:
    print(f"❌ Gmail service initialization failed: {e}")
    gmail_service = None

def log_email_notification(submission_id, email_type, recipient_email, subject, body, action_performed, status='pending', cc_emails=None, master_approver_id=None, error_message=None):
    """Log email notification to database."""
    try:
        log = EmailNotificationLog(
            submission_id=submission_id,
            email_type=email_type,
            status=status,
            recipient_email=recipient_email,
            cc_emails=cc_emails,
            subject=subject,
            body_preview=body[:500] if body else None,
            action_performed=action_performed,
            master_approver_id=master_approver_id,
            error_message=error_message,
            sent_at=datetime.now() if status == 'sent' else None
        )
        db.session.add(log)
        db.session.commit()
        return log
    except Exception as e:
        print(f"Error logging email notification: {e}")
        db.session.rollback()
        return None

def update_email_log_status(log_id, status, error_message=None):
    """Update email log status."""
    try:
        log = EmailNotificationLog.query.get(log_id)
        if log:
            log.status = status
            if error_message:
                log.error_message = error_message
            if status == 'sent':
                log.sent_at = datetime.now()
            db.session.commit()
            return True
    except Exception as e:
        print(f"Error updating email log: {e}")
        db.session.rollback()
    return False

def send_status_update_email(to_email, author_name, project_title, new_status, notes='', submission_id=None, master_approver_id=None, cc_emails=None):
    """
    Send a status update email to the author.
    """
    try:
        if not gmail_service:
            print("Gmail service not configured, skipping email send")
            return False
        
        # Map status to display name
        status_display = {
            'endorse': 'Endorsed for Presentation',
            'downgraded-non_competitive': 'Downgraded - Non-Competitive (Poster)',
            'downgraded-poster_only': 'Downgraded - Poster Only',
            'pending': 'Pending Review'
        }
        
        status_text = status_display.get(new_status, new_status)
        
        # Status-specific messages
        status_messages = {
            'endorse': """
We are pleased to inform you that your abstract has been ENDORSED for presentation at the PEMNet 2026 Conference.

The evaluation committee found your submission to be of high quality and relevant to the conference themes.

Please prepare your presentation and look out for further instructions regarding the presentation schedule and guidelines.
""",
            'downgraded-non_competitive': """
After careful review, your abstract has been downgraded and classified as NON-COMPETITIVE (POSTER PRESENTATION).

Your submission will still be presented as a poster during the conference. This allows you to share your work and receive feedback from attendees.

Please prepare your poster presentation and look out for further instructions regarding the poster presentation setup.
""",
            'downgraded-poster_only': """
After careful review, your abstract has been downgraded to POSTER ONLY presentation.

Your submission will be presented as a poster during the conference. This allows you to share your work and receive feedback from attendees.

Please prepare your poster and look out for further instructions regarding the poster presentation setup.
""",
            'pending': """
Your abstract is currently pending final review.

The evaluation committee is still in the process of reviewing your submission. You will receive another notification once a final decision has been made.
"""
        }
        
        message = status_messages.get(new_status, "Your abstract status has been updated.")
        
        if notes:
            message += f"\n\nReviewer Notes:\n{notes}\n"
        
        subject = f"PEMNet 2026 - Abstract Status Update: {status_text}"
        
        body = f"""
Dear {author_name},

This is to inform you about the status of your abstract submission for the PEMNet 2026 Conference.

Project Title: {project_title}
Status: {status_text}

{message}

If you have any questions or concerns, please don't hesitate to contact the PEMNet Conference Committee at pemnet26@gmail.com.

Thank you for your participation in PEMNet 2026.

Best regards,
PEMNet 2026 Conference Committee
"""
        
        # Log the email attempt
        log = log_email_notification(
            submission_id=submission_id,
            email_type='status_update',
            recipient_email=to_email,
            subject=subject,
            body=body,
            action_performed=new_status,
            cc_emails=cc_emails,
            master_approver_id=master_approver_id,
            status='pending'
        )
        
        # Send the email
        result = gmail_service.send_email(to_email, subject, body, cc=cc_emails)
        
        if result:
            # Update log to sent
            if log:
                update_email_log_status(log.id, 'sent')
            return True
        else:
            # Update log to failed
            if log:
                update_email_log_status(log.id, 'failed', 'Gmail API send failed')
            return False
        
    except Exception as e:
        print(f"Error sending status update email: {e}")
        # Log the error
        if submission_id:
            log_email_notification(
                submission_id=submission_id,
                email_type='status_update',
                recipient_email=to_email,
                subject=subject if 'subject' in locals() else 'Unknown',
                body='',
                action_performed=new_status if 'new_status' in locals() else 'unknown',
                cc_emails=cc_emails,
                master_approver_id=master_approver_id,
                status='failed',
                error_message=str(e)
            )
        return False

def send_confirmation_email(to_email, submission, action, notes='', submission_id=None, master_approver_id=None, cc_emails=None):
    """
    Send a confirmation email for submission acceptance/rejection.
    """
    try:
        if not gmail_service:
            print("Gmail service not configured, skipping email send")
            return False
        
        subject = f"Abstract Submission {action.capitalize()} - {submission.extension_project_title if hasattr(submission, 'extension_project_title') else submission.subject}"
        
        body = f"""
Dear {submission.author if hasattr(submission, 'author') else submission.sender_name},

Your abstract submission has been {action}d.

Title: {submission.extension_project_title if hasattr(submission, 'extension_project_title') else submission.subject}

Status: {action.upper()}

"""
        
        if notes:
            body += f"\nReview Notes:\n{notes}\n"
        
        body += f"""
Thank you for your submission.

Best regards,
PEMNet 2026 Conference Committee
"""
        
        # Log the email attempt
        log = log_email_notification(
            submission_id=submission_id,
            email_type='confirmation',
            recipient_email=to_email,
            subject=subject,
            body=body,
            action_performed=action,
            cc_emails=cc_emails,
            master_approver_id=master_approver_id,
            status='pending'
        )
        
        # Send the email
        result = gmail_service.send_email(to_email, subject, body, cc=cc_emails)
        
        if result:
            if log:
                update_email_log_status(log.id, 'sent')
            return True
        else:
            if log:
                update_email_log_status(log.id, 'failed', 'Gmail API send failed')
            return False
        
    except Exception as e:
        print(f"Error sending confirmation email: {e}")
        if submission_id:
            log_email_notification(
                submission_id=submission_id,
                email_type='confirmation',
                recipient_email=to_email,
                subject=subject if 'subject' in locals() else 'Unknown',
                body='',
                action_performed=action if 'action' in locals() else 'unknown',
                cc_emails=cc_emails,
                master_approver_id=master_approver_id,
                status='failed',
                error_message=str(e)
            )
        return False

def send_endorsement_confirmation_email(submission_data, extracted_data=None, master_approver_id=None):
    """
    Send a detailed confirmation email when an abstract is endorsed.
    
    Args:
        submission_data (dict): Submission data from the submissions table or extracted data
        extracted_data (dict, optional): Extracted data from the extracted_abstract_data table
        master_approver_id (int, optional): ID of the master approver sending the email
    
    Returns:
        bool: True if email was sent successfully
    """
    try:
        if not gmail_service:
            print("Gmail service not configured, skipping email send")
            return False
        
        # Get the corresponding author email - check submission_data first, then extracted_data
        to_email = submission_data.get('corresponding_author_email')
        
        # If not found in submission_data, try extracted_data
        if not to_email and extracted_data:
            to_email = extracted_data.get('corresponding_author_email')
        
        # For email submissions, also get the sender email to CC
        sender_email = submission_data.get('sender_email')
        if not sender_email and extracted_data:
            sender_email = extracted_data.get('sender_email')
        
        # If still no to_email, use sender_email as fallback
        if not to_email and sender_email:
            to_email = sender_email
        
        if not to_email:
            print("⚠️ No email found for recipient, skipping email")
            return False
        
        # Get the submission ID
        submission_id = submission_data.get('submission_id') or (extracted_data.get('submission_id') if extracted_data else None)
        
        # Get author details - check submission_data first, then extracted_data
        author_name = (
            submission_data.get('corresponding_author_name') or 
            submission_data.get('author') or 
            (extracted_data.get('corresponding_author_name') if extracted_data else None) or 
            (extracted_data.get('project_leader') if extracted_data else None) or 
            submission_data.get('sender_name') or 
            'Author'
        )
        
        author_position = (
            submission_data.get('corresponding_author_position') or 
            (extracted_data.get('corresponding_author_position') if extracted_data else None) or 
            ''
        )
        
        institution = (
            submission_data.get('suc_agencies') or 
            (extracted_data.get('sucs') if extracted_data else None) or 
            submission_data.get('sender_name') or 
            ''
        )
        
        # Get paper details - check submission_data first, then extracted_data
        paper_title = (
            submission_data.get('extension_project_title') or 
            (extracted_data.get('title') if extracted_data else None) or 
            submission_data.get('subject') or 
            ''
        )
        
        paper_category = (
            submission_data.get('paper_category') or 
            (extracted_data.get('paper_category') if extracted_data else None) or 
            'Not specified'
        )
        
        thematic_area = (
            submission_data.get('thematic_area') or 
            (extracted_data.get('thematic_area') if extracted_data else None) or 
            'Not specified'
        )
        
        # Format the date
        current_date = datetime.now().strftime('%B %d, %Y')
        
        # Build the email body with HTML formatting
        subject = f"PEMNet 2026 - Abstract Accepted for Presentation: {paper_title}"
        
        html_body = f"""<html>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
<p>{current_date}</p>
<p>{author_name}<br>{author_position}<br>{institution}</p>
<p>Dear {author_name}:</p>
<p><b>CONGRATULATIONS!</b></p>
<p>We are pleased to inform you that your abstract has successfully passed the review process and has been <b>ACCEPTED FOR PAPER PRESENTATION</b> at the <b>PEMNet 1st National Extension Conference 2026.</b></p>
<p><b>Paper Title:</b> {paper_title}</p>
<p><b>Paper Category:</b> {paper_category}</p>
<p><b>Thematic Area:</b> {thematic_area}</p>
<p><b>Submission ID:</b> {submission_id}</p>
<p>The Conference, with the theme <b>"HEIs at the Forefront of Transformative Extension: Advancing Evidence-Based, Inclusive, Sustainable, and Resilient Community Development,"</b> will be held on <b>October 27–30, 2026, at Hue Hotels and Resorts Boracay, Boracay Island, Malay, Aklan, Philippines.</b></p>
<p>To confirm your participation as a paper presenter, please create an account or log in to the official PEMNet Conference Website: [Link in here]. Through the website, you may complete your registration, submit the required documents, review the payment process, and view conference information and inclusions.</p>
<p>For <b>Completed Extension Project Papers</b>, authors who wish to qualify for <b>competitive evaluation, ranking, and paper awards under their respective thematic area</b>, and to be considered for <b>possible inclusion in the conference proceedings</b>, must submit the required full paper on or before <b>October 3, 2026</b>, using the prescribed PEMNet Completed Extension Project Full Paper Template.</p>
<p>Please note that submission of the full paper does <b>not automatically guarantee inclusion in the conference proceedings</b>. Papers submitted for publication shall be subject to editorial review and compliance with conference requirements.</p>
<p>We look forward to your participation and to welcoming you to the <b>PEMNet 1st National Extension Conference 2026</b> in Boracay.</p>
<p>Thank you, and congratulations once again!</p>
<p>Sincerely yours,<br><b>Conference Program Committee</b><br><b>PEMNet</b></p>
</body>
</html>"""
        
        # Prepare CC list
        cc_list = []
        if sender_email and sender_email != to_email:
            cc_list.append(sender_email)
        
        # Log the email attempt
        log = log_email_notification(
            submission_id=submission_id,
            email_type='endorsement',
            recipient_email=to_email,
            subject=subject,
            body=html_body,
            action_performed='endorse',
            cc_emails=', '.join(cc_list) if cc_list else None,
            master_approver_id=master_approver_id,
            status='pending'
        )
        
        # Send the email as HTML with CC
        result = gmail_service.send_email(to_email, subject, html_body, is_html=True, cc=cc_list)
        
        if result:
            if log:
                update_email_log_status(log.id, 'sent')
            print(f"✅ Endorsement confirmation email sent to {to_email}")
            if cc_list:
                print(f"   CC: {', '.join(cc_list)}")
            return True
        else:
            if log:
                update_email_log_status(log.id, 'failed', 'Gmail API send failed')
            print(f"❌ Failed to send endorsement confirmation email to {to_email}")
            return False
        
    except Exception as e:
        print(f"❌ Error sending endorsement confirmation email: {e}")
        # Log the error
        submission_id = submission_data.get('submission_id') or (extracted_data.get('submission_id') if extracted_data else None)
        if submission_id:
            log_email_notification(
                submission_id=submission_id,
                email_type='endorsement',
                recipient_email=to_email if 'to_email' in locals() else 'unknown',
                subject=subject if 'subject' in locals() else 'Unknown',
                body='',
                action_performed='endorse',
                cc_emails=', '.join(cc_list) if 'cc_list' in locals() and cc_list else None,
                master_approver_id=master_approver_id,
                status='failed',
                error_message=str(e)
            )
        return False