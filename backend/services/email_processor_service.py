"""Processes individual email attachments into EmailSubmission + ExtractedAbstractData rows."""

import os
import json
import tempfile
import traceback

from models import db, EmailSubmission, ExtractedAbstractData, Submission
from google_drive import upload_file_to_drive
from .submission_id_service import generate_submission_id
from .email_filter_service import (
    should_skip_email, is_invitation_email, extract_project_leader,
)


def process_email_submission(email_data: dict):
    """Process one Gmail message. Returns a list of created EmailSubmission rows."""
    try:
        sender_name = email_data['sender_name']
        sender_email = email_data['sender_email']
        subject = email_data['subject']
        body = email_data['body'] if email_data['body'] else ''

        should_skip, skip_reason = should_skip_email(subject, body, sender_email)
        if should_skip:
            print(f"⏭️  Skipping email ({skip_reason}): {subject}")
            return []

        if is_invitation_email(subject, body):
            print(f"⏭️  Skipping invitation email: {subject}")
            return []

        if 'pemnet26@gmail.com' in sender_email:
            print(f"⏭️  Skipping email from self (pemnet26@gmail.com): {subject}")
            return []

        attachments = email_data.get('attachments') or []
        if not attachments:
            print(f"⏭️  Skipping email with no attachment: {subject}")
            return []

        print(f"📎 Email has {len(attachments)} attachment(s) — processing each as a separate submission")

        body_project_leader = extract_project_leader(body) or sender_name

        created_submissions = []
        for idx, attachment in enumerate(attachments):
            if not attachment or not attachment.get('data'):
                print(f"   ⏭️  Skipping attachment #{idx + 1} (no data)")
                continue

            original_filename = attachment.get('filename', f'attachment_{idx + 1}.pdf')
            print(f"\n   ── Processing attachment #{idx + 1}/{len(attachments)}: {original_filename}")

            try:
                submission = process_single_attachment(
                    attachment=attachment,
                    original_filename=original_filename,
                    email_data=email_data,
                    sender_name=sender_name,
                    sender_email=sender_email,
                    subject=subject,
                    body=body,
                    body_project_leader=body_project_leader,
                    attachment_index=idx + 1,
                    total_attachments=len(attachments),
                )
                if submission:
                    created_submissions.append(submission)
            except Exception as e:
                print(f"   ❌ Error processing attachment #{idx + 1}: {e}")
                traceback.print_exc()

        if created_submissions:
            print(f"\n✅ Successfully processed {len(created_submissions)} submission(s) from email: {subject}")

        return created_submissions

    except Exception as e:
        db.session.rollback()
        print(f"❌ Error processing email submission: {e}")
        traceback.print_exc()
        return []


def process_single_attachment(attachment, original_filename, email_data, sender_name,
                              sender_email, subject, body, body_project_leader,
                              attachment_index=1, total_attachments=1):
    """Convert one attachment into EmailSubmission (+ ExtractedAbstractData) records."""
    is_docx = original_filename.lower().endswith('.docx')
    is_pdf = original_filename.lower().endswith('.pdf')

    if not is_pdf and not is_docx:
        if attachment['data'][:4] == b'%PDF':
            is_pdf = True
        elif attachment['data'][:2] == b'PK':
            is_docx = True

    suffix = '.docx' if is_docx else '.pdf'
    temp_path = None
    attachment_view_url = None
    attachment_download_url = None
    extracted_data = None

    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as temp_file:
            temp_file.write(attachment['data'])
            temp_path = temp_file.name

        print(f"      📄 Temp file created: {temp_path} ({os.path.getsize(temp_path)} bytes)")

        # ---- STEP 1: Extract ----
        try:
            if is_docx:
                from docs_extracted import DOCSExtractor as DOCXExtractor
                print(f"      📄 Extracting data from DOCX...")
                extractor = DOCXExtractor(attachment['data'], filename=original_filename)
            else:
                from pdf_extracted import PDFExtractor
                print(f"      📄 Extracting data from PDF...")
                extractor = PDFExtractor(attachment['data'])

            extracted_data = extractor.extract_all()

            if extracted_data:
                print(f"      ✅ Extraction successful!")
                if extracted_data.get('title'):
                    print(f"         📝 Title: {extracted_data.get('title')}")
                if extracted_data.get('paper_category'):
                    print(f"         📂 Category: {extracted_data.get('paper_category')}")
                if extracted_data.get('thematic_area'):
                    print(f"         🎯 Thematic Area: {extracted_data.get('thematic_area')}")
                if extracted_data.get('sucs'):
                    print(f"         🏫 SUCs: {extracted_data.get('sucs')}")
            else:
                print(f"      ⚠️  No data extracted from file")

        except ImportError as e:
            print(f"      ⚠️  Import error: {e}")
        except Exception as e:
            print(f"      ⚠️  Error extracting data: {e}")
            traceback.print_exc()

        # ---- STEP 2: Determine title ----
        if extracted_data and extracted_data.get('title'):
            project_title = extracted_data.get('title')
        else:
            subject_clean = subject
            for prefix in ['ABSTRACT-', 'ABSTRACT:', 'Abstract -', 'Abstract:']:
                if subject_clean.upper().startswith(prefix.upper()):
                    subject_clean = subject_clean[len(prefix):].strip()
                    break
            project_title = subject_clean
            if not project_title or len(project_title) < 5:
                for line in (body.split('\n') if body else []):
                    if 'ABSTRACT' in line.upper() or 'TITLE' in line.upper():
                        project_title = line.strip()
                        break
                if not project_title:
                    project_title = subject

        # ---- STEP 3: Category / thematic area ----
        paper_category = extracted_data.get('paper_category') if extracted_data else None
        thematic_area = extracted_data.get('thematic_area') if extracted_data else None

        # ---- STEP 4: Submission ID ----
        submission_id_value = generate_submission_id()
        print(f"      🆔 Generated submission ID: {submission_id_value}")

        # ---- STEP 5: Upload to Drive ----
        print(f"      📤 Uploading to Google Drive...")
        try:
            view_url, download_url = upload_file_to_drive(
                temp_path,
                f"abstract_{original_filename}",
                project_title=project_title,
                sender_name=sender_name,
                paper_category=paper_category,
                thematic_area=thematic_area,
            )
            attachment_view_url = view_url
            attachment_download_url = download_url
            print(f"      📎 Uploaded: {view_url}")

            try:
                from google_drive import mark_file_parent_as_new
                marked_folder_id = mark_file_parent_as_new(view_url)
                if marked_folder_id:
                    print(f"      🆕 Sender folder marked [NEW] (folder_id={marked_folder_id})")
                else:
                    print(f"      ⚠️  Could not mark sender folder [NEW] (helper returned None)")
            except Exception as mark_err:
                print(f"      ⚠️  Error while marking sender folder [NEW] (non-fatal): {mark_err}")

        except Exception as e:
            print(f"      ❌ Drive upload failed: {e}")
            traceback.print_exc()

        # ---- STEP 6: EmailSubmission row ----
        unique_email_message_id = email_data['id']
        if total_attachments > 1:
            unique_email_message_id = f"{email_data['id']}__att{attachment_index}"

        already_exists = EmailSubmission.query.filter_by(
            email_message_id=unique_email_message_id
        ).first()
        if already_exists:
            print(f"      ⏭️  Attachment #{attachment_index} already exists — skipping")
            return already_exists

        email_submission = EmailSubmission(
            email_message_id=unique_email_message_id,
            sender_email=sender_email,
            sender_name=sender_name,
            project_leader_name=body_project_leader,
            subject=subject,
            body=body[:5000] if body else '',
            attachment_filename=original_filename,
            attachment_view_url=attachment_view_url,
            attachment_download_url=attachment_download_url,
            status='pending',
            email_received_at=email_data['received_date'],
        )
        db.session.add(email_submission)
        db.session.flush()

        # ---- STEP 7: ExtractedAbstractData row ----
        if extracted_data:
            try:
                existing_extracted = ExtractedAbstractData.query.filter_by(
                    submission_id=submission_id_value
                ).first()
                if existing_extracted:
                    print(f"      ⏭️  Extracted data already exists — skipping")
                else:
                    authors_data = extracted_data.get('authors_data')
                    authors_list_json = None
                    if authors_data and authors_data.get('list'):
                        authors_list_json = json.dumps(authors_data.get('list'))

                    corresponding_author = extracted_data.get('corresponding_author')

                    extracted_record = ExtractedAbstractData(
                        submission_id=submission_id_value,
                        email_submission_id=email_submission.id,
                        title=extracted_data.get('title'),
                        authors=authors_data.get('full_text') if authors_data else None,
                        authors_list=authors_list_json,
                        project_leader=authors_data.get('project_leader') if authors_data else None,
                        corresponding_author_name=corresponding_author.get('name') if corresponding_author else None,
                        corresponding_author_email=corresponding_author.get('email') if corresponding_author else None,
                        corresponding_author_position=extracted_data.get('corresponding_author_position'),
                        sucs=extracted_data.get('sucs'),
                        paper_category=extracted_data.get('paper_category'),
                        thematic_area=extracted_data.get('thematic_area'),
                        theme=extracted_data.get('theme'),
                        extraction_status='extracted',
                    )
                    db.session.add(extracted_record)
                    print(f"      ✅ Extracted data saved (email_submission_id: {email_submission.id})")
            except Exception as e:
                print(f"      ⚠️  Error saving extracted data: {e}")
                traceback.print_exc()
        else:
            try:
                existing_extracted = ExtractedAbstractData.query.filter_by(
                    submission_id=submission_id_value
                ).first()
                if existing_extracted:
                    print(f"      ⏭️  Failed-extraction record already exists — skipping")
                else:
                    extracted_record = ExtractedAbstractData(
                        submission_id=submission_id_value,
                        email_submission_id=email_submission.id,
                        extraction_status='failed',
                        extraction_error='No data could be extracted from the attachment',
                    )
                    db.session.add(extracted_record)
                    email_submission.status = 'uncategorized'
                    print(f"      ⚠️  Created failed extraction record (email_submission_id: {email_submission.id})")
            except Exception as e:
                print(f"      ⚠️  Error saving failed extraction record: {e}")

        db.session.commit()
        print(f"      ✅ Attachment #{attachment_index} committed to database")
        return email_submission

    finally:
        if temp_path and os.path.exists(temp_path):
            try:
                os.unlink(temp_path)
                print(f"      🧹 Cleaned up temp file")
            except Exception:
                pass


def get_submission_data(submission_id):
    """
    Look up a submission (system or email) by its identifier.
    Returns a dict describing the submission, or None if not found.
    """
    submission = Submission.query.filter_by(submission_id=submission_id).first()
    if submission:
        return _system_submission_payload(submission)

    try:
        submission_id_int = int(submission_id)
        submission = Submission.query.get(submission_id_int)
        if submission:
            return _system_submission_payload(submission)
    except (ValueError, TypeError):
        pass

    extracted = ExtractedAbstractData.query.filter_by(submission_id=submission_id).first()
    if extracted:
        email_sub = EmailSubmission.query.get(extracted.email_submission_id)
        if email_sub:
            return _email_submission_payload(email_sub, extracted, submission_id)

    try:
        email_sub_id = int(submission_id)
        email_sub = EmailSubmission.query.get(email_sub_id)
        if email_sub:
            extracted = ExtractedAbstractData.query.filter_by(email_submission_id=email_sub.id).first()
            return _email_submission_payload(
                email_sub, extracted,
                extracted.submission_id if extracted else None,
            )
    except (ValueError, TypeError):
        pass

    return None


def _system_submission_payload(submission):
    return {
        'type': 'system',
        'data': submission,
        'id': submission.id,
        'submission_id': submission.submission_id,
        'user_id': submission.user_id,
        'title': submission.extension_project_title,
        'status': submission.status,
        'evaluation_status': submission.evaluation_status,
        'thematic_area': submission.thematic_area,
        'paper_category': submission.paper_category,
        'project_leader': submission.project_leader,
        'suc_agencies': submission.suc_agencies,
        'corresponding_author_name': submission.corresponding_author_name,
        'corresponding_author_email': submission.corresponding_author_email,
        'corresponding_author_position': submission.corresponding_author_position,
        'abstract_view_url': submission.abstract_view_url,
        'endorsement_view_url': submission.endorsement_view_url,
        'created_at': submission.created_at,
    }


def _email_submission_payload(email_sub, extracted, submission_id):
    return {
        'type': 'email',
        'data': email_sub,
        'id': email_sub.id,
        'submission_id': submission_id,
        'user_id': 0,
        'title': extracted.title if extracted else email_sub.subject,
        'status': email_sub.status,
        'evaluation_status': extracted.evaluation_status if extracted else 'pending',
        'thematic_area': extracted.thematic_area if extracted else 'Not specified',
        'paper_category': extracted.paper_category if extracted else 'Not specified',
        'author': extracted.project_leader if extracted else email_sub.project_leader_name,
        'suc_agencies': extracted.sucs if extracted else email_sub.sender_name,
        'corresponding_author_name': extracted.corresponding_author_name if extracted else None,
        'corresponding_author_email': extracted.corresponding_author_email if extracted else None,
        'corresponding_author_position': extracted.corresponding_author_position if extracted else None,
        'abstract_view_url': email_sub.attachment_view_url,
        'endorsement_view_url': None,
        'created_at': email_sub.email_received_at,
    }