# email_service.py
from gmail_service import GmailService

# Initialize Gmail service
try:
    gmail_service = GmailService(target_email='pemnet26@gmail.com')
    print("✅ Gmail service initialized successfully")
except Exception as e:
    print(f"❌ Gmail service initialization failed: {e}")
    gmail_service = None

def send_status_update_email(to_email, author_name, project_title, new_status, notes=''):
    """
    Send a status update email to the author.
    
    Args:
        to_email (str): Recipient email address
        author_name (str): Name of the author
        project_title (str): Title of the project
        new_status (str): New status of the submission
        notes (str): Additional notes from the approver
    
    Returns:
        bool: True if email was sent successfully, False otherwise
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
        
        # Add notes if provided
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
        
        # Send email
        gmail_service.send_email(to_email, subject, body)
        return True
        
    except Exception as e:
        print(f"Error sending status update email: {e}")
        return False

def send_confirmation_email(to_email, submission, action, notes=''):
    """
    Send a confirmation email for submission acceptance/rejection.
    
    Args:
        to_email (str): Recipient email address
        submission: Submission object
        action (str): 'accepted' or 'rejected'
        notes (str): Additional notes
    
    Returns:
        bool: True if email was sent successfully
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
        
        gmail_service.send_email(to_email, subject, body)
        return True
        
    except Exception as e:
        print(f"Error sending confirmation email: {e}")
        return False