from gmail_service import GmailService
from datetime import datetime
from models import db, EmailNotificationLog
import json

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

def _parse_authors_list(authors_value):
    """Helper to parse authors list from JSON string or plain text."""
    if not authors_value:
        return ''
    if isinstance(authors_value, str):
        try:
            parsed = json.loads(authors_value)
            if isinstance(parsed, list):
                return ', '.join(str(a) for a in parsed)
        except (json.JSONDecodeError, TypeError):
            pass
    return str(authors_value)

def send_status_update_email(to_email, author_name, project_title, new_status, notes='', submission_id=None, master_approver_id=None, cc_emails=None):
    """
    Send a status update email to the author.
    """
    try:
        if not gmail_service:
            print("Gmail service not configured, skipping email send")
            return False
        
        status_display = {
            'endorse': 'Endorsed for Presentation',
            'downgraded-non_competitive': 'Downgraded - Non-Competitive (Poster)',
            'downgraded-poster_only': 'Downgraded - Poster Only',
            'pending': 'Pending Review'
        }
        
        status_text = status_display.get(new_status, new_status)
        
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
        print(f"Error sending status update email: {e}")
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


# ============================================================================
# EMAIL TEMPLATES
# ============================================================================

def _build_completed_competitive_template(author_name, paper_title, authors_display, institution, thematic_area):
    """Template for: Completed Extension Project Paper — Competitive (Endorsed)"""
    return f"""<html>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 700px; margin: 0 auto; padding: 20px;">
<p style="text-align: center; font-size: 14px; margin-bottom: 5px;">1<sup>st</sup> NATIONAL EXTENSION CONFERENCE 2026</p>
<p style="text-align: center; font-size: 14px; margin-top: 0; margin-bottom: 5px;">October 27-30, 2026</p>
<p style="text-align: center; font-size: 14px; margin-top: 0; margin-bottom: 5px;">Hue Hotels and Resorts Boracay</p>
<p style="text-align: center; font-size: 14px; margin-top: 0; margin-bottom: 30px;">Boracay Island, Malay, Aklan, Philippines</p>
<hr style="border: none; border-top: 2px solid #333; margin: 20px 0;">
<h1 style="text-align: center; font-size: 20px; margin: 20px 0;">NOTICE OF ACCEPTANCE</h1>
<p style="text-align: center; font-size: 16px; font-weight: bold; margin-bottom: 30px;">Completed Extension Project Paper</p>
<p>Dear {author_name}:</p>
<p>Greetings from the Philippine Extension Managers Network (PEMNet), Inc.</p>
<p>We are pleased to inform you that your extension project paper entitled:</p>
<p style="font-weight: bold; font-size: 16px; margin: 20px 0;">"{paper_title}"</p>
<p>Authored by <strong>{authors_display}</strong> from <strong>{institution}</strong> has been <strong>ACCEPTED</strong> for presentation under the Completed Extension Project Paper category of the PEMNet 1<sup>st</sup> National Extension Conference 2026.</p>
<p><strong>Thematic Area:</strong> {thematic_area}</p>
<p>To complete your conference requirements, please take note of the following:</p>
<p><strong>Full Paper.</strong> Submit your completed full paper on or before <strong>October 17, 2026 (Saturday)</strong>, using only the prescribed PEMNet template. Full papers submitted within the deadline shall be eligible for competitive evaluation, paper awards, and possible inclusion in the conference proceedings, subject to editorial review and compliance with conference requirements. Completed Extension Project Full Paper Template: [INSERT OFFICIAL LINK]</p>
<p><strong>Oral Presentation.</strong> Please prepare your presentation using the prescribed PEMNet PowerPoint Presentation Template. The conference guidelines provide 10 minutes for presentation and 10 minutes for the open forum. Bring your laptop for the presentation. PowerPoint Presentation Template: [INSERT OFFICIAL LINK]</p>
<p>Your accepted Completed Extension Project Paper is also eligible for the Poster Competition, subject to the prescribed poster requirements. Poster entries shall be submitted during the conference registration.</p>
<p>For the Extension Video Presentation Competition, each participating SUC/HEI/LUC may submit only one (1) official video entry. The institution shall select and endorse its entry from among its accepted Completed Extension Project Papers. The official video link must be submitted on or before <strong>October 15, 2026</strong>.</p>
<p>All required electronic submissions shall be sent to the official conference email: <a href="mailto:pemnet26@gmail.com">pemnet26@gmail.com</a></p>
<p>Congratulations on the acceptance of your paper. We look forward to your participation and to welcoming you to Boracay for the PEMNet 1<sup>st</sup> National Extension Conference 2026.</p>
<p>Sincerely,</p>
<p style="margin-top: 30px;"><strong>RICKY P. BECODO, PhD</strong><br>President<br>PEMNet, Inc.</p>
</body>
</html>"""


def _build_completed_non_competitive_template(author_name, paper_title, institution, thematic_area):
    """Template for: Completed Extension Project Paper — Non-Competitive Oral Presentation (Downgraded)"""
    return f"""<html>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 700px; margin: 0 auto; padding: 20px;">
<p style="text-align: center; font-size: 14px; margin-bottom: 5px;">1<sup>st</sup> NATIONAL EXTENSION CONFERENCE 2026</p>
<p style="text-align: center; font-size: 14px; margin-top: 0; margin-bottom: 5px;">October 27-30, 2026</p>
<p style="text-align: center; font-size: 14px; margin-top: 0; margin-bottom: 5px;">Hue Hotels and Resorts Boracay</p>
<p style="text-align: center; font-size: 14px; margin-top: 0; margin-bottom: 30px;">Boracay Island, Malay, Aklan, Philippines</p>
<hr style="border: none; border-top: 2px solid #333; margin: 20px 0;">
<h1 style="text-align: center; font-size: 20px; margin: 20px 0;">NOTICE OF ACCEPTANCE</h1>
<p style="text-align: center; font-size: 16px; font-weight: bold; margin-bottom: 30px;">Completed Extension Project Paper - Non-Competitive Oral Presentation</p>
<p>Dear {author_name}:</p>
<p>Greetings from the Philippine Extension Managers Network (PEMNet), Inc.</p>
<p>We are pleased to inform you that your submitted abstract entitled:</p>
<p style="font-weight: bold; font-size: 16px; margin: 20px 0;">"{paper_title}"</p>
<p>from <strong>{institution}</strong> has been <strong>ACCEPTED</strong> as a Completed Extension Project Paper for <strong>NON-COMPETITIVE ORAL PRESENTATION</strong> at the PEMNet 1<sup>st</sup> National Extension Conference 2026.</p>
<p><strong>Thematic Area:</strong> {thematic_area}</p>
<p>Based on the review of the submitted abstract, your paper has been accepted for presentation and knowledge-sharing purposes but will not be included in the competitive evaluation for the Completed Extension Project Paper Awards.</p>
<h2 style="font-size: 16px; margin-top: 30px; margin-bottom: 10px;">Presentation Requirements</h2>
<p>For this classification, submission of a full paper is not required.</p>
<p>The presenter shall prepare the oral presentation using the official PEMNet PowerPoint Presentation Template:</p>
<p>PowerPoint Presentation Template: [INSERT OFFICIAL LINK]</p>
<p>Each accepted paper shall be given 10 minutes for presentation and 10 minutes for the open forum. The presentation should clearly highlight the project need, objectives, methods or strategies, implementation, documented results, sustainability direction, and public value.</p>
<p>As a non-competitive paper presentation, the entry shall not be evaluated or ranked for the Completed Extension Project Paper Awards and shall not be considered for inclusion in the conference proceedings.</p>
<h2 style="font-size: 16px; margin-top: 30px; margin-bottom: 10px;">Poster Competition</h2>
<p>Your project remains an accepted Completed Extension Project Paper and is therefore eligible to participate in the Poster Competition, subject to compliance with the official poster requirements. The conference guidelines provide that the Poster Competition is open to accepted Completed Extension Project Papers and is judged separately from the paper presentation.</p>
<p>Further instructions regarding presentation schedules, cluster assignments, poster submission/display, and other conference arrangements will be communicated by the Conference Secretariat.</p>
<p>Congratulations on the acceptance of your extension project for presentation. We look forward to your participation and to the sharing of your institution's extension experience at the 1st PEMNet National Extension Conference 2026.</p>
<p>Sincerely,</p>
<p style="margin-top: 30px;"><strong>RICKY P. BECODO, PhD</strong><br>President<br>PEMNet, Inc.</p>
</body>
</html>"""


def _build_ongoing_template(author_name, paper_title, institution, thematic_area):
    """
    Template for: Ongoing Extension Project Paper — Non-Competitive Presentation.
    Used for BOTH endorse and downgrade actions on Ongoing papers.
    """
    return f"""<html>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 700px; margin: 0 auto; padding: 20px;">
<p style="text-align: center; font-size: 14px; margin-bottom: 5px;">1<sup>st</sup> NATIONAL EXTENSION CONFERENCE 2026</p>
<p style="text-align: center; font-size: 14px; margin-top: 0; margin-bottom: 5px;">October 27-30, 2026</p>
<p style="text-align: center; font-size: 14px; margin-top: 0; margin-bottom: 5px;">Hue Hotels and Resorts Boracay</p>
<p style="text-align: center; font-size: 14px; margin-top: 0; margin-bottom: 30px;">Boracay Island, Malay, Aklan, Philippines</p>
<hr style="border: none; border-top: 2px solid #333; margin: 20px 0;">
<h1 style="text-align: center; font-size: 20px; margin: 20px 0;">NOTICE OF ACCEPTANCE</h1>
<p style="text-align: center; font-size: 16px; font-weight: bold; margin-bottom: 30px;">Ongoing Extension Project Paper — Non-Competitive Presentation</p>
<p>Dear {author_name}:</p>
<p>Greetings from the Philippine Extension Managers Network (PEMNet), Inc.</p>
<p>We are pleased to inform you that your submitted abstract entitled:</p>
<p style="font-weight: bold; font-size: 16px; margin: 20px 0;">"{paper_title}"</p>
<p>from <strong>{institution}</strong> has been <strong>ACCEPTED</strong> for presentation under the <strong>Ongoing Extension Project Paper</strong> category of the 1<sup>st</sup> PEMNet National Extension Conference 2026.</p>
<p><strong>Thematic Area:</strong> {thematic_area}</p>
<p><strong>Presentation Classification:</strong> Non-Competitive</p>
<p>In accordance with the Conference Guidelines, Ongoing Extension Project Papers shall be presented as non-competitive entries and shall not be ranked or compete for awards with Completed Extension Project Papers. The presentation is intended primarily for knowledge-sharing, developmental feedback, mentoring, and technical assistance to help project teams strengthen implementation, documentation, outcome tracking, sustainability, and public value.</p>
<h2 style="font-size: 16px; margin-top: 30px; margin-bottom: 10px;">Submission Requirement</h2>
<p>A Completed Extension Project Full Paper is <strong>not required</strong> for this category.</p>
<p>However, presenters may submit an <strong>Ongoing Extension Project Progress Paper</strong> or project write-up not later than <strong>October 17, 2026 (Saturday)</strong> using the prescribed PEMNet template. The progress paper should present the validated need addressed, project objectives, target beneficiaries or partner community, implementation strategies, activities conducted, documented outputs, emerging results, implementation issues, lessons learned, corrective actions, and next steps.</p>
<h2 style="font-size: 16px; margin-top: 30px; margin-bottom: 10px;">Oral Presentation</h2>
<p>Presenters shall prepare their presentation using the official PEMNet PowerPoint Presentation Template:</p>
<p><strong>PowerPoint Presentation Template:</strong> [INSERT OFFICIAL TEMPLATE LINK]</p>
<p>Each presenter shall be given <strong>10 minutes for presentation</strong> and <strong>10 minutes for the open forum</strong>. The presentation should focus on the project needs, objectives, implementation strategies, documented outputs, emerging results, lessons learned, issues encountered, corrective actions, sustainability direction, and next steps. Final outcome or impact claims should not be made unless supported by available evidence.</p>
<p>At least one registered presenter must represent each accepted paper during its assigned session. A Certificate of Presentation shall be issued only for papers actually presented during the conference.</p>
<p>Further information on presentation schedules, thematic cluster assignments, room assignments, and other conference arrangements shall be communicated by the Conference Secretariat.</p>
<p>Congratulations on the acceptance of your ongoing extension project. We look forward to your participation and to the sharing of your project's experiences, emerging results, and lessons at the PEMNet 1<sup>st</sup> National Extension Conference 2026.</p>
<p>Sincerely,</p>
<p style="margin-top: 30px;"><strong>RICKY P. BECODO, PhD</strong><br>President<br>PEMNet, Inc.</p>
</body>
</html>"""


# ============================================================================
# MAIN ENDORSEMENT EMAIL FUNCTION
# ============================================================================

def send_endorsement_confirmation_email(submission_data, extracted_data=None, master_approver_id=None):
    """
    Send a detailed confirmation email when an abstract is endorsed or downgraded.
    
    Template selection logic:
      - paper_category contains 'Completed' AND status == 'endorse'
            → Completed Extension Project Paper (Competitive) template
      - paper_category contains 'Completed' AND status is a downgrade
            → Completed Extension Project Paper - Non-Competitive Oral Presentation template
      - paper_category contains 'Ongoing' (any status: endorse or downgrade)
            → Ongoing Extension Project Paper - Non-Competitive Presentation template
      - fallback → Completed Competitive template
    
    Args:
        submission_data (dict): Submission data from submissions table or extracted data
        extracted_data (dict, optional): Extracted data from extracted_abstract_data table
        master_approver_id (int, optional): ID of the master approver sending the email
    
    Returns:
        bool: True if email was sent successfully
    """
    try:
        if not gmail_service:
            print("Gmail service not configured, skipping email send")
            return False
        
        # --- Determine recipient ---
        to_email = submission_data.get('corresponding_author_email')
        if not to_email and extracted_data:
            to_email = extracted_data.get('corresponding_author_email')
        
        sender_email = submission_data.get('sender_email')
        if not sender_email and extracted_data:
            sender_email = extracted_data.get('sender_email')
        
        if not to_email and sender_email:
            to_email = sender_email
        
        if not to_email:
            print("⚠️ No email found for recipient, skipping email")
            return False
        
        # --- Submission ID ---
        submission_id = submission_data.get('submission_id') or (extracted_data.get('submission_id') if extracted_data else None)
        
        # --- Author details ---
        author_name = (
            submission_data.get('corresponding_author_name') or 
            submission_data.get('author') or 
            (extracted_data.get('corresponding_author_name') if extracted_data else None) or 
            (extracted_data.get('project_leader') if extracted_data else None) or 
            submission_data.get('sender_name') or 
            'Author'
        )
        
        institution = (
            submission_data.get('suc_agencies') or 
            (extracted_data.get('sucs') if extracted_data else None) or 
            submission_data.get('sender_name') or 
            ''
        )
        
        # --- Paper details ---
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
        
        # --- Authors list ---
        raw_authors = (
            submission_data.get('co_authors') or 
            (extracted_data.get('authors_list') if extracted_data else None) or 
            ''
        )
        authors_display = _parse_authors_list(raw_authors) or author_name
        
        # --- Determine status (endorse vs downgrade) ---
        status = submission_data.get('status') or (extracted_data.get('evaluation_status') if extracted_data else None) or 'endorse'
        is_downgrade = status in ('downgraded-non_competitive', 'downgraded-poster_only')
        is_completed = paper_category and 'Completed' in paper_category
        is_ongoing = paper_category and 'Ongoing' in paper_category
        
        # --- Select template ---
        if is_completed and not is_downgrade:
            # Completed + Endorsed → Competitive Oral Presentation
            subject = f"PEMNet 2026 - Notice of Acceptance: {paper_title}"
            html_body = _build_completed_competitive_template(
                author_name, paper_title, authors_display, institution, thematic_area
            )
            template_used = 'completed_competitive'
        elif is_completed and is_downgrade:
            # Completed + Downgraded → Non-Competitive Oral Presentation
            subject = f"PEMNet 2026 - Notice of Acceptance (Non-Competitive): {paper_title}"
            html_body = _build_completed_non_competitive_template(
                author_name, paper_title, institution, thematic_area
            )
            template_used = 'completed_non_competitive'
        elif is_ongoing:
            # Ongoing (regardless of endorse/downgrade) → Ongoing Non-Competitive template
            subject = f"PEMNet 2026 - Notice of Acceptance (Ongoing Project): {paper_title}"
            html_body = _build_ongoing_template(
                author_name, paper_title, institution, thematic_area
            )
            template_used = 'ongoing'
        else:
            # Fallback — generic notice
            subject = f"PEMNet 2026 - Notice of Acceptance: {paper_title}"
            html_body = _build_completed_competitive_template(
                author_name, paper_title, authors_display, institution, thematic_area
            )
            template_used = 'fallback'
        
        print(f"📧 Using template: {template_used} (category: {paper_category}, status: {status})")
        
        # --- CC list ---
        cc_list = []
        if sender_email and sender_email != to_email:
            cc_list.append(sender_email)
        
        # --- Log the email attempt ---
        log = log_email_notification(
            submission_id=submission_id,
            email_type='endorsement',
            recipient_email=to_email,
            subject=subject,
            body=html_body,
            action_performed='endorse' if not is_downgrade else status,
            cc_emails=', '.join(cc_list) if cc_list else None,
            master_approver_id=master_approver_id,
            status='pending'
        )
        
        # --- Send the email ---
        result = gmail_service.send_email(to_email, subject, html_body, is_html=True, cc=cc_list)
        
        if result:
            if log:
                update_email_log_status(log.id, 'sent')
            print(f"✅ Notice of Acceptance sent to {to_email} (template: {template_used})")
            if cc_list:
                print(f"   CC: {', '.join(cc_list)}")
            return True
        else:
            if log:
                update_email_log_status(log.id, 'failed', 'Gmail API send failed')
            print(f"❌ Failed to send Notice of Acceptance to {to_email}")
            return False
        
    except Exception as e:
        print(f"❌ Error sending endorsement confirmation email: {e}")
        import traceback
        traceback.print_exc()
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