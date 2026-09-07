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
        
        gmail_service.send_email(to_email, subject, body)
        return True
        
    except Exception as e:
        print(f"Error sending status update email: {e}")
        return False

def send_confirmation_email(to_email, submission, action, notes=''):
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
        
        gmail_service.send_email(to_email, subject, body)
        return True
        
    except Exception as e:
        print(f"Error sending confirmation email: {e}")
        return False

def send_endorsement_confirmation_email(submission_data, extracted_data=None):
    """
    Send a detailed confirmation email when an abstract is endorsed.
    
    Args:
        submission_data (dict): Submission data from the submissions table
        extracted_data (dict, optional): Extracted data from the extracted_abstract_data table
    
    Returns:
        bool: True if email was sent successfully
    """
    try:
        if not gmail_service:
            print("Gmail service not configured, skipping email send")
            return False
        
        # Get the corresponding author email (use extracted data first, fallback to submission)
        to_email = submission_data.get('corresponding_author_email')
        if not to_email:
            # Try to find from extracted data
            if extracted_data and extracted_data.get('corresponding_author_email'):
                to_email = extracted_data.get('corresponding_author_email')
            else:
                print("⚠️ No corresponding author email found, skipping email")
                return False
        
        # Get author details
        author_name = submission_data.get('corresponding_author_name') or extracted_data.get('corresponding_author_name') or submission_data.get('author') or 'Author'
        author_position = submission_data.get('corresponding_author_position') or extracted_data.get('corresponding_author_position') or ''
        institution = submission_data.get('suc_agencies') or extracted_data.get('sucs') or ''
        
        # Get paper details
        paper_title = submission_data.get('extension_project_title') or extracted_data.get('title') or ''
        paper_category = submission_data.get('paper_category') or extracted_data.get('paper_category') or ''
        thematic_area = submission_data.get('thematic_area') or extracted_data.get('thematic_area') or ''
        submission_id = submission_data.get('submission_id') or extracted_data.get('submission_id') or ''
        
        # Format the date
        current_date = datetime.now().strftime('%B %d, %Y')
        
        # Build the email body
        body = f"""
{current_date}

{author_name}
{author_position}
{institution}

Dear {author_name}:

CONGRATULATIONS!

We are pleased to inform you that your abstract has successfully passed the review process and has been ACCEPTED FOR PAPER PRESENTATION at the PEMNet 1st National Extension Conference 2026.

Paper Title: "{paper_title}"
Paper Category: {paper_category}
Thematic Area: {thematic_area}
Submission ID: {submission_id}

The Conference, with the theme "HEIs at the Forefront of Transformative Extension: Advancing Evidence-Based, Inclusive, Sustainable, and Resilient Community Development," will be held on October 27–30, 2026, at Hue Hotels and Resorts Boracay, Boracay Island, Malay, Aklan, Philippines.

To confirm your participation as a paper presenter, please create an account or log in to the official PEMNet Conference Website: http://localhost:3000. Through the website, you may complete your registration, submit the required documents, review the payment process, and view conference information and inclusions.

For Completed Extension Project Papers, authors who wish to qualify for competitive evaluation, ranking, and paper awards under their respective thematic area, and to be considered for possible inclusion in the conference proceedings, must submit the required full paper on or before October 3, 2026, using the prescribed PEMNet Completed Extension Project Full Paper Template.

Please note that submission of the full paper does not automatically guarantee inclusion in the conference proceedings. Papers submitted for publication shall be subject to editorial review and compliance with conference requirements.

We look forward to your participation and to welcoming you to the PEMNet 1st National Extension Conference 2026 in Boracay.

Thank you, and congratulations once again!

Sincerely yours,
Conference Program Committee
PEMNet
"""
        
        subject = f"PEMNet 2026 - Abstract Accepted for Presentation: {paper_title}"
        
        # Send the email
        result = gmail_service.send_email(to_email, subject, body)
        
        if result:
            print(f"✅ Endorsement confirmation email sent to {to_email}")
        else:
            print(f"❌ Failed to send endorsement confirmation email to {to_email}")
        
        return result
        
    except Exception as e:
        print(f"❌ Error sending endorsement confirmation email: {e}")
        return False