import os
import base64
import pickle
from datetime import datetime
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.application import MIMEApplication
from google.auth.transport.requests import Request
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from bs4 import BeautifulSoup
import threading
import urllib.parse
import smtplib

# If modifying these scopes, delete the file token.pickle.
SCOPES = [
    'https://www.googleapis.com/auth/gmail.readonly',
    'https://www.googleapis.com/auth/gmail.send',
    'https://www.googleapis.com/auth/gmail.modify'
]

class GmailService:
    def __init__(self, creds_file='credentials.json', token_file='token.pickle', target_email=None):
        self.creds_file = creds_file
        self.target_email = target_email
        
        # Use different token file for different accounts
        if target_email:
            # Sanitize email for filename
            safe_email = target_email.replace('@', '_').replace('.', '_')
            self.token_file = f'token_{safe_email}.pickle'
        else:
            self.token_file = token_file
            
        self.service = self.authenticate()
    
    def authenticate(self):
        creds = None
        
        # Token file stores the user's access and refresh tokens
        if os.path.exists(self.token_file):
            with open(self.token_file, 'rb') as token:
                creds = pickle.load(token)
        
        # If there are no (valid) credentials available, let the user log in.
        if not creds or not creds.valid:
            if creds and creds.expired and creds.refresh_token:
                creds.refresh(Request())
            else:
                if not os.path.exists(self.creds_file):
                    print(f"ERROR: {self.creds_file} not found!")
                    raise FileNotFoundError(f"Credentials file {self.creds_file} not found!")
                
                # Create a flow instance
                flow = InstalledAppFlow.from_client_secrets_file(self.creds_file, SCOPES)
                
                # Run local server - this will open a browser
                creds = flow.run_local_server(
                    port=8087,
                    open_browser=True,
                    success_message='Authentication successful! You can close this window.'
                )
            
            # Save the credentials for the next run
            with open(self.token_file, 'wb') as token:
                pickle.dump(creds, token)
            
            print(f"Authentication successful for: {creds.id_token.get('email') if hasattr(creds, 'id_token') else 'User'}")
        
        return build('gmail', 'v1', credentials=creds)
    
    
    def list_emails(self, query='', max_results=10):
        try:
            result = self.service.users().messages().list(
                userId='me', q=query, maxResults=max_results
            ).execute()
            
            messages = result.get('messages', [])
            emails = []
            
            for msg in messages:
                email_data = self.get_email(msg['id'])
                emails.append(email_data)
            
            return emails
        except HttpError as error:
            print(f'An error occurred: {error}')
            return []
    
    def get_email(self, msg_id):
        try:
            msg = self.service.users().messages().get(
                userId='me', id=msg_id, format='full'
            ).execute()
            
            # Extract headers
            headers = msg['payload']['headers']
            subject = next((h['value'] for h in headers if h['name'] == 'Subject'), 'No Subject')
            sender = next((h['value'] for h in headers if h['name'] == 'From'), 'Unknown')
            received = next((h['value'] for h in headers if h['name'] == 'Date'), '')
            
            # Parse sender
            sender_name = ''
            sender_email = ''
            if '<' in sender and '>' in sender:
                sender_name = sender[:sender.find('<')].strip()
                sender_email = sender[sender.find('<')+1:sender.find('>')]
            else:
                sender_email = sender
            
            # Get body
            body = self.get_email_body(msg)
            
            # Get attachments
            attachments = self.get_attachments(msg)
            
            # Parse received date
            try:
                # Try to parse RFC 2822 date
                from email.utils import parsedate_to_datetime
                received_date = parsedate_to_datetime(received)
            except:
                received_date = datetime.now()
            
            return {
                'id': msg_id,
                'subject': subject,
                'sender': sender,
                'sender_name': sender_name,
                'sender_email': sender_email,
                'received_date': received_date,
                'body': body,
                'attachments': attachments
            }
        except HttpError as error:
            print(f'An error occurred: {error}')
            return None
    
    def get_email_body(self, msg):
        body = ""
        
        if 'parts' in msg['payload']:
            for part in msg['payload']['parts']:
                if part['mimeType'] == 'text/plain':
                    data = part['body']['data']
                    body += base64.urlsafe_b64decode(data).decode('utf-8', errors='ignore')
                elif part['mimeType'] == 'text/html':
                    if not body:  # Use HTML if no plain text
                        data = part['body']['data']
                        html = base64.urlsafe_b64decode(data).decode('utf-8', errors='ignore')
                        body += self.html_to_text(html)
                elif 'parts' in part:
                    # Multipart nested
                    for subpart in part['parts']:
                        if subpart['mimeType'] in ['text/plain', 'text/html']:
                            data = subpart['body']['data']
                            content = base64.urlsafe_b64decode(data).decode('utf-8', errors='ignore')
                            if subpart['mimeType'] == 'text/html':
                                content = self.html_to_text(content)
                            body += content
        else:
            # Simple email
            data = msg['payload']['body']['data']
            body = base64.urlsafe_b64decode(data).decode('utf-8', errors='ignore')
        
        return body.strip()
    
    def html_to_text(self, html):
        soup = BeautifulSoup(html, 'html.parser')
        return soup.get_text(separator='\n', strip=True)

    def get_attachments(self, msg):
        """Extract attachments from email. Only PDF and DOCX attachments are kept."""
        attachments = []

        # Files we accept as submissions
        ALLOWED_EXTENSIONS = ('.pdf', '.docx')

        def _is_allowed(filename):
            if not filename:
                return False
            return filename.lower().endswith(ALLOWED_EXTENSIONS)

        if 'parts' in msg['payload']:
            for part in msg['payload']['parts']:
                if part.get('filename'):
                    filename = part['filename']
                    if not _is_allowed(filename):
                        print(f"   ⏭️  Skipping non-PDF/DOCX attachment: {filename}")
                        continue
                    if 'body' in part and 'attachmentId' in part['body']:
                        attachment_data = self.get_attachment(msg['id'], part['body']['attachmentId'])
                        attachments.append({
                            'filename': filename,
                            'mimeType': part['mimeType'],
                            'size': part['body'].get('size', 0),
                            'data': attachment_data
                        })
                elif 'parts' in part:
                    # Multipart nested
                    for subpart in part['parts']:
                        if subpart.get('filename'):
                            filename = subpart['filename']
                            if not _is_allowed(filename):
                                print(f"   ⏭️  Skipping non-PDF/DOCX attachment: {filename}")
                                continue
                            if 'body' in subpart and 'attachmentId' in subpart['body']:
                                attachment_data = self.get_attachment(msg['id'], subpart['body']['attachmentId'])
                                attachments.append({
                                    'filename': filename,
                                    'mimeType': subpart['mimeType'],
                                    'size': subpart['body'].get('size', 0),
                                    'data': attachment_data
                                })

        return attachments
    
    def get_attachment(self, msg_id, attachment_id):
        try:
            attachment = self.service.users().messages().attachments().get(
                userId='me', messageId=msg_id, id=attachment_id
            ).execute()
            data = attachment['data']
            return base64.urlsafe_b64decode(data)
        except HttpError as error:
            print(f'An error occurred downloading attachment: {error}')
            return None
    
    def mark_as_read(self, msg_id):
        try:
            self.service.users().messages().modify(
                userId='me', id=msg_id,
                body={'removeLabelIds': ['UNREAD']}
            ).execute()
            return True
        except HttpError as error:
            print(f'Error marking email as read: {error}')
            return False
    
    def _fetch_emails_paginated(self, query, max_results, page_size):
        try:
            search_query = 'has:attachment'
            if query:
                if 'has:attachment' not in query:
                    search_query = f'{query} has:attachment'
                else:
                    search_query = query

            print(f"  Query: {search_query}")
            print(f"  Paginating up to {max_results} results...")

            all_message_ids = []
            page_token = None
            page_count = 0

            while True:
                page_count += 1

                list_kwargs = {
                    'userId': 'me',
                    'q': search_query,
                    'maxResults': page_size,
                }
                if page_token:
                    list_kwargs['pageToken'] = page_token

                result = self.service.users().messages().list(**list_kwargs).execute()

                messages = result.get('messages', [])
                all_message_ids.extend(m['id'] for m in messages)

                print(f"    Page {page_count}: +{len(messages)} IDs "
                      f"(total: {len(all_message_ids)})")

                page_token = result.get('nextPageToken')

                if not page_token:
                    print(f"    No more pages")
                    break
                if len(all_message_ids) >= max_results:
                    all_message_ids = all_message_ids[:max_results]
                    break

            emails = []
            fetch_errors = 0

            for idx, msg_id in enumerate(all_message_ids, start=1):
                try:
                    email_data = self.get_email(msg_id)
                    if email_data and email_data.get('attachments'):
                        emails.append(email_data)
                except Exception as e:
                    fetch_errors += 1
                    print(f"    ⚠️ Failed to fetch {msg_id}: {e}")

            if fetch_errors:
                print(f"    Retrieved {len(emails)} emails ({fetch_errors} fetch errors)")
            else:
                print(f"    Retrieved {len(emails)} emails")

            return emails

        except HttpError as error:
            print(f'  ❌ Gmail API error: {error}')
            return []
        
    def get_emails_with_attachments(self, query='', max_results=20000, page_size=100,
                                     chunk_by_month=False, chunk_by='auto',
                                     earliest_date=None):
        if not chunk_by_month:
            return self._fetch_emails_paginated(query, max_results, page_size)

        from datetime import date, timedelta

        if earliest_date is None:
            today = date.today()
            earliest_date = date(today.year - 2, today.month, 1)
        else:
            today = date.today()

        all_emails = []
        seen_ids = set()

        if chunk_by == 'auto':
            windows = self._iter_auto_windows(earliest_date, today)
        elif chunk_by == 'week':
            windows = self._iter_week_windows(earliest_date, today)
        elif chunk_by == 'day':
            windows = self._iter_day_windows(earliest_date, today)
        else:  # 'month'
            windows = self._iter_month_windows(earliest_date, today)

        chunk_count = 0
        for (start_date, end_date, label) in windows:
            chunk_count += 1

            chunk_query = (
                f"{query} "
                f"after:{start_date.strftime('%Y/%m/%d')} "
                f"before:{(end_date + timedelta(days=1)).strftime('%Y/%m/%d')}"
            )

            print(f"\n📅 Chunk {label}: {chunk_query}")

            try:
                chunk_results = self._fetch_emails_paginated(
                    chunk_query, max_results, page_size
                )

                if (chunk_by == 'auto'
                        and len(chunk_results) >= max(150, page_size * 1.5)
                        and (end_date - start_date).days > 10):
                    print(f"   ⚠️ Chunk returned {len(chunk_results)} — re-splitting by week")
                    sub_windows = self._iter_week_windows(start_date, end_date)
                    for (sw_start, sw_end, sw_label) in sub_windows:
                        sub_query = (
                            f"{query} "
                            f"after:{sw_start.strftime('%Y/%m/%d')} "
                            f"before:{(sw_end + timedelta(days=1)).strftime('%Y/%m/%d')}"
                        )
                        print(f"     ↳ Sub-chunk {sw_label}")
                        try:
                            sub_results = self._fetch_emails_paginated(
                                sub_query, max_results, page_size
                            )
                            for email in sub_results:
                                if email['id'] not in seen_ids:
                                    seen_ids.add(email['id'])
                                    all_emails.append(email)
                        except Exception as sub_e:
                            print(f"     ⚠️ Sub-chunk failed: {sub_e}")
                else:
                    for email in chunk_results:
                        if email['id'] not in seen_ids:
                            seen_ids.add(email['id'])
                            all_emails.append(email)

            except Exception as e:
                print(f"   ⚠️ Chunk failed: {e}")

            if len(all_emails) >= max_results:
                print(f"🛑 Hit max_results cap ({max_results}) — stopping")
                all_emails = all_emails[:max_results]
                break


        return all_emails

    def _iter_month_windows(self, start_date, end_date):
        from datetime import date, timedelta
        current = date(start_date.year, start_date.month, 1)
        while current <= end_date:
            if current.month == 12:
                next_month = date(current.year + 1, 1, 1)
            else:
                next_month = date(current.year, current.month + 1, 1)
            chunk_end = min(next_month - timedelta(days=1), end_date)
            yield (current, chunk_end, current.strftime('%Y-%m'))
            current = next_month

    def _iter_week_windows(self, start_date, end_date):
        from datetime import timedelta
        current = start_date
        while current <= end_date:
            chunk_end = min(current + timedelta(days=6), end_date)
            yield (current, chunk_end, f"{current.isoformat()}..{chunk_end.isoformat()}")
            current = chunk_end + timedelta(days=1)

    def _iter_day_windows(self, start_date, end_date):
        from datetime import timedelta
        current = start_date
        while current <= end_date:
            yield (current, current, current.isoformat())
            current = current + timedelta(days=1)

    def _iter_auto_windows(self, start_date, end_date):
        yield from self._iter_month_windows(start_date, end_date)

    def find_earliest_email_date(self, query='has:attachment'):
        try:
            page_token = None
            last_ids = []
            page_count = 0
            while True:
                page_count += 1
                kwargs = {
                    'userId': 'me',
                    'q': query,
                    'maxResults': 500,
                }
                if page_token:
                    kwargs['pageToken'] = page_token
                result = self.service.users().messages().list(**kwargs).execute()
                ids = [m['id'] for m in result.get('messages', [])]
                if ids:
                    last_ids = ids[-50:]   # keep last few for a second check
                page_token = result.get('nextPageToken')
                if not page_token:
                    break
                if page_count > 100:
                    # safety valve; log and bail
                    print("  ⚠️ find_earliest_email_date: page cap hit")
                    break

            if not last_ids:
                return None

            # The last id in the last page is the oldest. Fetch its internalDate.
            oldest_id = last_ids[-1]
            msg = self.service.users().messages().get(
                userId='me', id=oldest_id, format='minimal'
            ).execute()
            internal_ms = int(msg.get('internalDate', 0))
            from datetime import datetime as _dt
            return _dt.utcfromtimestamp(internal_ms / 1000).date()
        except HttpError as e:
            print(f"  ⚠️ find_earliest_email_date failed: {e}")
            return None
    
    def send_email(self, to, subject, body, attachments=None, is_html=False, cc=None):
        try:

            if not to or '@' not in to:
                print(f"❌ Invalid recipient email: {to}")
                return None

            # Create MIME message
            if is_html:
                message = MIMEMultipart('alternative')
                message['to'] = to
                message['subject'] = subject
                
                if cc:
                    message['cc'] = ', '.join(cc) if isinstance(cc, list) else cc
                
                # Plain text version
                plain_text = self.html_to_text(body)
                text_part = MIMEText(plain_text, 'plain', 'utf-8')
                message.attach(text_part)
                
                # HTML version
                html_part = MIMEText(body, 'html', 'utf-8')
                message.attach(html_part)
            else:
                message = MIMEMultipart()
                message['to'] = to
                message['subject'] = subject
                
                if cc:
                    message['cc'] = ', '.join(cc) if isinstance(cc, list) else cc
                
                msg_body = MIMEText(body, 'plain', 'utf-8')
                message.attach(msg_body)
            
            # Add attachments if any
            if attachments:
                for attachment in attachments:
                    part = MIMEApplication(attachment['data'])
                    part['Content-Disposition'] = f'attachment; filename="{attachment["filename"]}"'
                    message.attach(part)

            # SMTP SEND (REQUIRED FOR DELIVERY)
            print(f"📨 Attempting to send email to {to} via SMTP...")
            smtp_server = smtplib.SMTP_SSL('smtp.gmail.com', 465)
            smtp_server.login('pemnet26@gmail.com', 'klhyurwtyduggkde')  # Your App Password
            smtp_server.send_message(message)
            smtp_server.quit()
            
            print(f"✅ Email successfully sent to {to} via SMTP")
            return {'id': 'smtp_success'}

        except Exception as e:
            print(f'❌ SMTP failed to send email to {to}: {e}')
            return None