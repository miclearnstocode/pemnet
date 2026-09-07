# email_service.py
from gmail_service import GmailService
from datetime import datetime

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

def send_acceptance_email(submission, extracted_data=None):
    """
    Send an acceptance email to the corresponding author when a submission is endorsed.
    
    Args:
        submission: Submission object
        extracted_data: ExtractedAbstractData object (optional)
    
    Returns:
        bool: True if email was sent successfully, False otherwise
    """
    try:
        if not gmail_service:
            print("Gmail service not configured, skipping email send")
            return False
        
        # Get the corresponding author details
        # Priority: 1. Corresponding author fields, 2. Extracted data, 3. Author field
        to_email = submission.corresponding_author_email or submission.author_email
        if not to_email:
            # Try to find email from extracted data
            if extracted_data and extracted_data.corresponding_author_email:
                to_email = extracted_data.corresponding_author_email
            else:
                # Fallback: try to find user by name
                user = User.query.filter_by(full_name=submission.author).first()
                if user:
                    to_email = user.email
        
        if not to_email:
            print(f"⚠️ No email found for submission {submission.id}, skipping notification")
            return False
        
        # Get author name
        author_name = (submission.corresponding_author_name or 
                      (extracted_data.corresponding_author_name if extracted_data else None) or 
                      submission.author or 
                      'Author')
        
        # Get position/designation
        position = (submission.corresponding_author_position or 
                   (extracted_data.corresponding_author_position if extracted_data else None) or 
                   '')
        
        # Get institution
        institution = submission.suc_agencies or (extracted_data.sucs if extracted_data else None) or ''
        
        # Get paper title
        paper_title = submission.extension_project_title or (extracted_data.title if extracted_data else None) or 'Untitled'
        
        # Get paper category
        paper_category = submission.paper_category or (extracted_data.paper_category if extracted_data else None) or 'Not specified'
        
        # Get thematic area
        thematic_area = submission.thematic_area or (extracted_data.thematic_area if extracted_data else None) or 'Not specified'
        
        # Format date
        current_date = datetime.now().strftime('%B %d, %Y')
        
        # Build the email body
        subject = f"CONGRATULATIONS! Your Abstract Has Been Accepted - PEMNet 2026"
        
        body = f"""
{current_date}

{author_name}
{position}
{institution}

Dear {author_name}:

CONGRATULATIONS!

We are pleased to inform you that your abstract has successfully passed the review process and has been ACCEPTED FOR PAPER PRESENTATION at the PEMNet 1st National Extension Conference 2026.

Paper Title: "{paper_title}"
Paper Category: {paper_category}
Thematic Area: {thematic_area}
Submission ID: {submission.id}

The Conference, with the theme "HEIs at the Forefront of Transformative Extension: Advancing Evidence-Based, Inclusive, Sustainable, and Resilient Community Development," will be held on October 27–30, 2026, at Hue Hotels and Resorts Boracay, Boracay Island, Malay, Aklan, Philippines.

To confirm your participation as a paper presenter, please create an account or log in to the official PEMNet Conference Website: [WEBSITE LINK]. Through the website, you may complete your registration, submit the required documents, review the payment process, and view conference information and inclusions.

For Completed Extension Project Papers, authors who wish to qualify for competitive evaluation, ranking, and paper awards under their respective thematic area, and to be considered for possible inclusion in the conference proceedings, must submit the required full paper on or before October 3, 2026, using the prescribed PEMNet Completed Extension Project Full Paper Template.

Please note that submission of the full paper does not automatically guarantee inclusion in the conference proceedings. Papers submitted for publication shall be subject to editorial review and compliance with conference requirements.

We look forward to your participation and to welcoming you to the PEMNet 1st National Extension Conference 2026 in Boracay.

Thank you, and congratulations once again!

Sincerely yours,
Conference Program Committee
PEMNet
"""
        
        # Send the email
        gmail_service.send_email(to_email, subject, body)
        print(f"✅ Acceptance email sent to {to_email} for submission {submission.id}")
        return True
        
    except Exception as e:
        print(f"Error sending acceptance email: {e}")
        traceback.print_exc()
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