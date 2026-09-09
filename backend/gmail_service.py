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
        """
        Initialize Gmail service.
        
        Args:
            creds_file: Path to credentials.json
            token_file: Path to token.pickle
            target_email: The email account to authenticate (e.g., 'pemnet26@gmail.com')
        """
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
        """Authenticate and return Gmail service."""
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
        """List emails matching the query."""
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
        """Get full email data by ID."""
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
        """Extract body from email."""
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
        """Convert HTML to plain text."""
        soup = BeautifulSoup(html, 'html.parser')
        return soup.get_text(separator='\n', strip=True)
    
    def get_attachments(self, msg):
        """Extract attachments from email."""
        attachments = []
        
        if 'parts' in msg['payload']:
            for part in msg['payload']['parts']:
                if part.get('filename'):
                    # This is an attachment
                    if 'body' in part and 'attachmentId' in part['body']:
                        attachment_data = self.get_attachment(msg['id'], part['body']['attachmentId'])
                        attachments.append({
                            'filename': part['filename'],
                            'mimeType': part['mimeType'],
                            'size': part['body'].get('size', 0),
                            'data': attachment_data
                        })
                elif 'parts' in part:
                    # Multipart nested
                    for subpart in part['parts']:
                        if subpart.get('filename'):
                            if 'body' in subpart and 'attachmentId' in subpart['body']:
                                attachment_data = self.get_attachment(msg['id'], subpart['body']['attachmentId'])
                                attachments.append({
                                    'filename': subpart['filename'],
                                    'mimeType': subpart['mimeType'],
                                    'size': subpart['body'].get('size', 0),
                                    'data': attachment_data
                                })
        
        return attachments
    
    def get_attachment(self, msg_id, attachment_id):
        """Download attachment data."""
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
        """Mark email as read."""
        try:
            self.service.users().messages().modify(
                userId='me', id=msg_id,
                body={'removeLabelIds': ['UNREAD']}
            ).execute()
            return True
        except HttpError as error:
            print(f'Error marking email as read: {error}')
            return False
    
    def get_emails_with_attachments(self, query='', max_results=50):
        """Get emails that have attachments (both read and unread)."""
        try:
            # Search for emails with attachments - don't filter by read/unread status
            search_query = 'has:attachment'
            if query:
                # If a query is provided, combine it
                search_query = f'{query} has:attachment'
            
            print(f"Searching Gmail with query: {search_query}")
            
            result = self.service.users().messages().list(
                userId='me', 
                q=search_query, 
                maxResults=max_results
            ).execute()
            
            messages = result.get('messages', [])
            print(f"Found {len(messages)} emails with attachments")
            
            emails = []
            for msg in messages:
                email_data = self.get_email(msg['id'])
                if email_data and email_data['attachments']:
                    emails.append(email_data)
            
            return emails
        except HttpError as error:
            print(f'An error occurred: {error}')
            return []
        
    def send_email(self, to, subject, body, attachments=None, is_html=False, cc=None):
        """Send an email using SMTP (Bypasses Gmail API weirdness)."""
        try:
            # Validate recipient
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