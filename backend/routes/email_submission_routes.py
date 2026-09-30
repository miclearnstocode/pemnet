"""Routes for reading Gmail, syncing submissions, and reviewing email data."""

import traceback
from datetime import date

from flask import Blueprint, jsonify, request

from models import (
    db, EmailSubmission, ExtractedAbstractData, ExtractedDataRevision,
    User, Submission,
)
from services.email_filter_service import should_skip_email, is_invitation_email
from services.email_processor_service import process_email_submission
from email_service import gmail_service, send_confirmation_email

email_submission_bp = Blueprint('email_submissions', __name__)


@email_submission_bp.route('/api/email-submissions/check', methods=['POST', 'OPTIONS'])
def check_email_submissions():
    if request.method == 'OPTIONS':
        return jsonify({})

    try:
        if not gmail_service:
            return jsonify({"detail": "Gmail service not configured."}), 503

        existing_base_ids = {
            rec[0].split('__att')[0]
            for rec in EmailSubmission.query.with_entities(EmailSubmission.email_message_id).all()
            if rec[0]
        }

        print(f"📧 Reading emails from inbox of: pemnet26@gmail.com")
        print(f"Found {len(existing_base_ids)} existing email records in database")

        query = 'has:attachment -from:pemnet26@gmail.com -in:spam'
        emails = gmail_service.get_emails_with_attachments(
            query=query, max_results=20000, chunk_by_month=True,
        )

        processed_count = 0
        errors = []
        skipped_count = 0
        invitation_skipped = 0
        non_abstract_skipped = 0

        for email in emails:
            if email['id'] in existing_base_ids:
                skipped_count += 1
                continue

            subject = email['subject']
            body = email['body'] if email['body'] else ''
            sender_email = email['sender_email']

            if is_invitation_email(subject, body):
                invitation_skipped += 1
                print(f"⏭️  Skipping invitation email: {subject}")
                continue

            if not _is_abstract_email(subject, body, sender_email):
                non_abstract_skipped += 1
                print(f"⏭️  Skipping non-abstract email: {subject}")
                continue

            results = process_email_submission(email)
            if results:
                processed_count += len(results)
                print(f"✅ Processed {len(results)} submission(s) from: {sender_email}")
            else:
                errors.append(subject)

        return jsonify({
            "message": f"Checked {len(emails)} emails from pemnet26@gmail.com",
            "processed": processed_count,
            "skipped": skipped_count,
            "invitation_skipped": invitation_skipped,
            "non_abstract_skipped": non_abstract_skipped,
            "errors": errors,
        }), 200

    except Exception as e:
        print(f"❌ Error checking email submissions: {e}")
        traceback.print_exc()
        return jsonify({"detail": str(e)}), 500


def _is_abstract_email(subject, body, sender_email):
    from services.email_filter_service import is_abstract_submission
    return is_abstract_submission(subject, body, sender_email)


@email_submission_bp.route('/api/email-submissions', methods=['GET', 'OPTIONS'])
def get_email_submissions():
    if request.method == 'OPTIONS':
        return jsonify({})

    try:
        status_filter = request.args.get('status', 'all')
        query = EmailSubmission.query

        if status_filter == 'endorse':
            query = query.filter_by(status='endorse')
        elif status_filter == 'downgrade':
            query = query.filter_by(status='downgraded')
        elif status_filter == 'pending':
            query = query.filter_by(status='pending')
        elif status_filter == 'uncategorized':
            query = query.join(
                ExtractedAbstractData,
                ExtractedAbstractData.email_submission_id == EmailSubmission.id,
            ).filter(ExtractedAbstractData.extraction_status == 'failed')
        elif status_filter != 'all':
            query = query.filter_by(status=status_filter)

        submissions = query.order_by(EmailSubmission.email_received_at.desc()).all()

        result = []
        for s in submissions:
            extracted_data = ExtractedAbstractData.query\
                .filter_by(email_submission_id=s.id).first()

            def _is_blank(v):
                return v is None or (isinstance(v, str) and v.strip() == '') or v == 'Not specified'

            paper_cat = extracted_data.paper_category if extracted_data else None
            thematic = extracted_data.thematic_area if extracted_data else None
            has_category = not _is_blank(paper_cat) and not _is_blank(thematic)

            if s.status in ('endorse', 'downgraded-non_competitive',
                            'downgraded-poster_only', 'processed', 'rejected'):
                display_status = s.status
            elif not has_category:
                display_status = 'uncategorized'
            else:
                display_status = 'pending'

            result.append({
                'id': s.id,
                'submission_id': extracted_data.submission_id if extracted_data else None,
                'sender_email': s.sender_email,
                'sender_name': s.sender_name,
                'project_leader_name': extracted_data.project_leader if extracted_data else s.project_leader_name,
                'subject': s.subject,
                'body': s.body[:500] if s.body else '',
                'attachment_filename': s.attachment_filename,
                'attachment_view_url': s.attachment_view_url,
                'attachment_download_url': s.attachment_download_url,
                'status': display_status,
                'extraction_status': extracted_data.extraction_status if extracted_data else 'pending',
                'evaluation_status': extracted_data.evaluation_status if extracted_data else 'pending',
                'paper_category': paper_cat,
                'thematic_area': thematic,
                'is_categorized': has_category,
                'processed_submission_id': s.processed_submission_id,
                'email_received_at': s.email_received_at.strftime('%Y-%m-%d %H:%M:%S') if s.email_received_at else None,
                'created_at': s.created_at.strftime('%Y-%m-%d %H:%M:%S') if s.created_at else None,
            })

        return jsonify(result), 200

    except Exception as e:
        print(f"Error fetching email submissions: {e}")
        traceback.print_exc()
        return jsonify({"detail": str(e)}), 500


@email_submission_bp.route('/api/email-submissions/sync-all', methods=['POST', 'OPTIONS'])
def sync_all_emails():
    if request.method == 'OPTIONS':
        return jsonify({})

    try:
        if not gmail_service:
            return jsonify({"detail": "Gmail service not configured."}), 503

        body = request.get_json(silent=True) or {}
        deep_scan = bool(body.get('deep', False))

        existing_base_ids = {
            rec[0].split('__att')[0]
            for rec in EmailSubmission.query.with_entities(EmailSubmission.email_message_id).all()
            if rec[0]
        }
        print(f"Found {len(existing_base_ids)} existing email records in database")

        if deep_scan:
            earliest = gmail_service.find_earliest_email_date(
                query='has:attachment -from:pemnet26@gmail.com -in:spam'
            )
            if not earliest:
                earliest = date(date.today().year - 5, 1, 1)
            print(f"📅 Deep scan: earliest email found at {earliest}")
        else:
            today = date.today()
            earliest = date(today.year - 2, today.month, 1)

        query = 'has:attachment -from:pemnet26@gmail.com -in:spam'
        emails = gmail_service.get_emails_with_attachments(
            query=query,
            max_results=20000,
            page_size=100,
            chunk_by_month=True,
            chunk_by='auto',
            earliest_date=earliest,
        )

        processed_count = 0
        skipped_count = 0
        errors = []
        skipped_samples = []

        for email in emails:
            if email['id'] in existing_base_ids:
                skipped_count += 1
                continue

            subject = email['subject']
            body = email['body'] or ''
            sender_email = email['sender_email']

            should_skip, skip_reason = should_skip_email(subject, body, sender_email)
            if should_skip:
                if len(skipped_samples) < 20:
                    skipped_samples.append(f"{subject} :: {skip_reason}")
                continue

            if is_invitation_email(subject, body):
                if len(skipped_samples) < 20:
                    skipped_samples.append(f"{subject} :: invitation")
                continue

            if not _is_abstract_email(subject, body, sender_email):
                if len(skipped_samples) < 20:
                    skipped_samples.append(f"{subject} :: not-abstract")
                continue

            results = process_email_submission(email)
            if results:
                processed_count += len(results)
                print(f"✅ Synced {len(results)} submission(s) from: {subject}")
            else:
                errors.append(subject)

        return jsonify({
            "message": f"Scanned {len(emails)} emails" + (" (deep scan)" if deep_scan else ""),
            "processed": processed_count,
            "skipped_already_in_db": skipped_count,
            "errors": errors,
            "skipped_samples": skipped_samples,
            "total_emails_found": len(emails),
            "earliest_scanned": earliest.isoformat() if earliest else None,
            "deep_scan": deep_scan,
        }), 200

    except Exception as e:
        print(f"❌ Error syncing emails: {e}")
        traceback.print_exc()
        return jsonify({"detail": str(e)}), 500


@email_submission_bp.route('/api/email-submissions/<int:email_submission_id>/review', methods=['POST', 'OPTIONS'])
def review_email_submission(email_submission_id):
    if request.method == 'OPTIONS':
        return jsonify({})

    try:
        data = request.get_json()
        action = data.get('action')
        notes = data.get('notes', '')

        if action not in ['accept', 'reject']:
            return jsonify({"detail": "Invalid action. Must be 'accept' or 'reject'"}), 400

        email_sub = EmailSubmission.query.get(email_submission_id)
        if not email_sub:
            return jsonify({"detail": "Email submission not found"}), 404

        if action == 'accept':
            subject = email_sub.subject
            project_title = subject.replace('ABSTRACT-', '').strip()
            if not project_title or len(project_title) < 5:
                for line in (email_sub.body.split('\n') if email_sub.body else []):
                    if 'ABSTRACT' in line.upper() or 'TITLE' in line.upper():
                        project_title = line.strip()
                        break
                if not project_title:
                    project_title = email_sub.subject

            new_submission = Submission(
                user_id=0,
                extension_project_title=project_title,
                thematic_area='Not specified',
                paper_category='Completed Extension Project Papers',
                suc_agencies=email_sub.sender_name or email_sub.sender_email,
                author=email_sub.project_leader_name or email_sub.sender_name,
                presenter=email_sub.project_leader_name or email_sub.sender_name,
                status='accepted',
                co_authors='',
                abstract_view_url=email_sub.attachment_view_url,
                abstract_download_url=email_sub.attachment_download_url,
                endorsement_view_url=None,
                endorsement_download_url=None,
                compextproj_drive_view_url=None,
                compextproj_drive_download_url=None,
            )
            db.session.add(new_submission)
            db.session.flush()

            email_sub.processed_submission_id = new_submission.id
            email_sub.status = 'processed'
            db.session.commit()

            send_confirmation_email(email_sub.sender_email, new_submission, 'accepted', notes)

            return jsonify({
                "message": "Email submission accepted and converted to submission",
                "submission_id": new_submission.id,
                "status": new_submission.status,
            }), 200

        email_sub.status = 'rejected'
        db.session.commit()
        send_confirmation_email(email_sub.sender_email, email_sub, 'rejected', notes)

        return jsonify({
            "message": "Email submission rejected",
            "status": email_sub.status,
        }), 200

    except Exception as e:
        db.session.rollback()
        print(f"Error reviewing email submission: {e}")
        traceback.print_exc()
        return jsonify({"detail": str(e)}), 500


@email_submission_bp.route('/api/email-submissions/<int:email_submission_id>/view', methods=['GET', 'OPTIONS'])
def view_email_submission(email_submission_id):
    if request.method == 'OPTIONS':
        return jsonify({})

    try:
        email_sub = EmailSubmission.query.get(email_submission_id)
        if not email_sub:
            return jsonify({"detail": "Email submission not found"}), 404

        return jsonify({
            'id': email_sub.id,
            'sender_email': email_sub.sender_email,
            'sender_name': email_sub.sender_name,
            'project_leader_name': email_sub.project_leader_name,
            'subject': email_sub.subject,
            'body': email_sub.body,
            'attachment_filename': email_sub.attachment_filename,
            'attachment_view_url': email_sub.attachment_view_url,
            'attachment_download_url': email_sub.attachment_download_url,
            'status': email_sub.status,
            'processed_submission_id': email_sub.processed_submission_id,
            'email_received_at': email_sub.email_received_at.strftime('%Y-%m-%d %H:%M:%S') if email_sub.email_received_at else None,
            'created_at': email_sub.created_at.strftime('%Y-%m-%d %H:%M:%S') if email_sub.created_at else None,
        }), 200

    except Exception as e:
        print(f"Error viewing email submission: {e}")
        return jsonify({"detail": str(e)}), 500


@email_submission_bp.route('/api/email-submissions/<int:email_submission_id>/extracted-data', methods=['GET', 'OPTIONS'])
def get_extracted_data(email_submission_id):
    if request.method == 'OPTIONS':
        return jsonify({})

    try:
        extracted = ExtractedAbstractData.query\
            .filter_by(email_submission_id=email_submission_id).first()

        if not extracted:
            return jsonify({}), 200

        email_sub = EmailSubmission.query.get(email_submission_id)
        email_status = email_sub.status if email_sub else 'pending'

        def _is_blank(v):
            return v is None or (isinstance(v, str) and v.strip() == '') or v == 'Not specified'

        has_category = not _is_blank(extracted.paper_category) and not _is_blank(extracted.thematic_area)

        if email_status in ('endorse', 'downgraded-non_competitive',
                            'downgraded-poster_only', 'processed', 'rejected'):
            display_status = email_status
        elif not has_category:
            display_status = 'uncategorized'
        else:
            display_status = 'pending'

        return jsonify({
            'id': extracted.id,
            'email_submission_id': extracted.email_submission_id,
            'title': extracted.title,
            'authors': extracted.authors,
            'authors_list': extracted.authors_list,
            'project_leader': extracted.project_leader,
            'sucs': extracted.sucs,
            'corresponding_author_name': extracted.corresponding_author_name,
            'corresponding_author_email': extracted.corresponding_author_email,
            'corresponding_author_position': extracted.corresponding_author_position,
            'paper_category': extracted.paper_category,
            'thematic_area': extracted.thematic_area,
            'theme': extracted.theme,
            'status': display_status,
            'raw_email_status': email_status,
            'is_categorized': has_category,
            'extraction_status': extracted.extraction_status,
            'extraction_error': extracted.extraction_error,
            'extracted_at': extracted.extracted_at.strftime('%Y-%m-%d %H:%M:%S') if extracted.extracted_at else None,
        }), 200

    except Exception as e:
        print(f"Error fetching extracted data: {e}")
        return jsonify({"detail": str(e)}), 500


@email_submission_bp.route('/api/extracted-data/<int:extracted_data_id>/edit', methods=['PUT', 'OPTIONS'])
def edit_extracted_data(extracted_data_id):
    if request.method == 'OPTIONS':
        return jsonify({})

    try:
        from google_drive import move_submission_files
        import json as _json

        data = request.get_json()
        evaluator_id = data.get('evaluator_id')

        if not evaluator_id:
            return jsonify({"detail": "Evaluator ID is required"}), 400

        user = User.query.get(evaluator_id)
        user_name = user.full_name if user else 'Unknown'
        is_master_approver = user.role in ['admin', 'master_approver'] if user else False

        extracted = ExtractedAbstractData.query.get(extracted_data_id)
        if not extracted:
            return jsonify({"detail": "Extracted data not found"}), 404

        email_sub = EmailSubmission.query.get(extracted.email_submission_id)

        old_paper_category = extracted.paper_category
        old_thematic_area = extracted.thematic_area
        old_sender_name = (
            extracted.project_leader or
            extracted.corresponding_author_name or
            (email_sub.sender_name if email_sub else None)
        )

        changes = {}
        needs_file_move = False

        def update_field(field_name, column):
            nonlocal needs_file_move
            if field_name in data:
                new_value = data[field_name]
                old_value = getattr(extracted, column)
                old_str = str(old_value) if old_value is not None else ''
                new_str = str(new_value) if new_value is not None else ''
                if old_str != new_str:
                    changes[field_name] = {'old': old_value, 'new': new_value}
                    setattr(extracted, column, new_value)
                    if field_name in ['paper_category', 'thematic_area']:
                        needs_file_move = True

        update_field('title', 'title')
        update_field('authors', 'authors')
        update_field('authors_list', 'authors_list')
        update_field('project_leader', 'project_leader')
        update_field('sucs', 'sucs')
        update_field('corresponding_author_name', 'corresponding_author_name')
        update_field('corresponding_author_email', 'corresponding_author_email')
        update_field('corresponding_author_position', 'corresponding_author_position')
        update_field('paper_category', 'paper_category')
        update_field('thematic_area', 'thematic_area')
        update_field('theme', 'theme')

        new_sender_name = (
            extracted.project_leader or
            extracted.corresponding_author_name or
            (email_sub.sender_name if email_sub else None)
        )
        if (str(old_sender_name or '') != str(new_sender_name or '')):
            needs_file_move = True

        drive_move_result = None
        if needs_file_move and changes and email_sub:
            try:
                file_urls = []
                if email_sub.attachment_view_url:
                    file_urls.append(email_sub.attachment_view_url)

                if file_urls:
                    drive_move_result = move_submission_files(
                        file_urls,
                        extracted.paper_category,
                        extracted.thematic_area,
                        new_sender_name,
                    )
                    if drive_move_result and drive_move_result.get('url_mapping'):
                        for old_url, new_urls in drive_move_result['url_mapping'].items():
                            if email_sub.attachment_view_url == old_url:
                                email_sub.attachment_view_url = new_urls['view_url']
                                email_sub.attachment_download_url = new_urls['download_url']
            except Exception as drive_error:
                print(f"⚠️ Drive move error (non-fatal): {drive_error}")
                traceback.print_exc()
                drive_move_result = {'error': str(drive_error)}

        if changes:
            db.session.commit()

            revision = ExtractedDataRevision(
                extracted_data_id=extracted_data_id,
                edited_by=evaluator_id,
                changes=_json.dumps({
                    'changes': changes,
                    'edited_by_name': user_name,
                    'is_master_approver': is_master_approver,
                }),
                title=extracted.title,
                authors=extracted.authors,
                authors_list=extracted.authors_list,
                project_leader=extracted.project_leader,
                sucs=extracted.sucs,
                corresponding_author_name=extracted.corresponding_author_name,
                corresponding_author_email=extracted.corresponding_author_email,
                corresponding_author_position=extracted.corresponding_author_position,
                paper_category=extracted.paper_category,
                thematic_area=extracted.thematic_area,
                theme=extracted.theme,
            )
            db.session.add(revision)

            try:
                def _is_blank(v):
                    return v is None or (isinstance(v, str) and v.strip() == '') or v == 'Not specified'
                has_category = (
                    not _is_blank(extracted.paper_category)
                    and not _is_blank(extracted.thematic_area)
                )
                if email_sub and has_category and email_sub.status == 'uncategorized':
                    email_sub.status = 'pending'
                    print(f"📝 Email submission {email_sub.id} status: uncategorized → pending")
            except Exception as sync_error:
                print(f"⚠️ Could not sync email submission status: {sync_error}")

            db.session.commit()

        return jsonify({
            "message": "Data updated successfully",
            "changes": changes,
            "drive_move": drive_move_result,
            "data": {
                'title': extracted.title,
                'authors': extracted.authors,
                'authors_list': extracted.authors_list,
                'project_leader': extracted.project_leader,
                'sucs': extracted.sucs,
                'corresponding_author_name': extracted.corresponding_author_name,
                'corresponding_author_email': extracted.corresponding_author_email,
                'corresponding_author_position': extracted.corresponding_author_position,
                'paper_category': extracted.paper_category,
                'thematic_area': extracted.thematic_area,
                'theme': extracted.theme,
            },
        }), 200

    except Exception as e:
        db.session.rollback()
        print(f"Error editing extracted data: {e}")
        traceback.print_exc()
        return jsonify({"detail": str(e)}), 500


@email_submission_bp.route('/api/extracted-data/<int:extracted_data_id>/revisions', methods=['GET', 'OPTIONS'])
def get_extracted_data_revisions(extracted_data_id):
    if request.method == 'OPTIONS':
        return jsonify({})

    try:
        import json as _json

        revisions = ExtractedDataRevision.query\
            .filter_by(extracted_data_id=extracted_data_id)\
            .order_by(ExtractedDataRevision.created_at.desc()).all()

        result = []
        for rev in revisions:
            user = User.query.get(rev.edited_by)
            changes_data = {}
            is_master_approver = False
            edited_by_name = user.full_name if user else 'Unknown'

            try:
                if rev.changes:
                    parsed = _json.loads(rev.changes)
                    if isinstance(parsed, dict) and 'changes' in parsed:
                        changes_data = parsed.get('changes', {})
                        edited_by_name = parsed.get('edited_by_name', edited_by_name)
                        is_master_approver = parsed.get('is_master_approver', False)
                    else:
                        changes_data = parsed
            except Exception:
                changes_data = {}

            result.append({
                'id': rev.id,
                'edited_by': rev.edited_by,
                'edited_by_name': edited_by_name,
                'is_master_approver': is_master_approver,
                'changes': changes_data,
                'snapshot': {
                    'title': rev.title,
                    'authors': rev.authors,
                    'authors_list': rev.authors_list,
                    'project_leader': rev.project_leader,
                    'sucs': rev.sucs,
                    'corresponding_author_name': rev.corresponding_author_name,
                    'corresponding_author_email': rev.corresponding_author_email,
                    'corresponding_author_position': rev.corresponding_author_position,
                    'paper_category': rev.paper_category,
                    'thematic_area': rev.thematic_area,
                    'theme': rev.theme,
                },
                'created_at': rev.created_at.strftime('%Y-%m-%d %H:%M:%S') if rev.created_at else None,
            })

        return jsonify(result), 200

    except Exception as e:
        print(f"Error fetching revisions: {e}")
        return jsonify({"detail": str(e)}), 500