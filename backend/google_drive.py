import os
import io
import re
from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload, MediaIoBaseUpload
from googleapiclient.errors import HttpError

# Load your .env variables
from dotenv import load_dotenv
load_dotenv()

SCOPES = ['https://www.googleapis.com/auth/drive']
SERVICE_ACCOUNT_FILE = 'rdesystem-secret.json'

# Root folder ID - this is already PEMnet_storage
ROOT_FOLDER_ID = '1PDcpYy-3wyt94YgJqVT5k5wnWtCi6TIg'

# Event name
EVENT_NAME = "PEMNet 1st National Extension Conference 2026"

def get_drive_service():
    """Get Google Drive service using official API client."""
    try:
        creds = service_account.Credentials.from_service_account_file(
            SERVICE_ACCOUNT_FILE, 
            scopes=SCOPES
        )
        service = build('drive', 'v3', credentials=creds)
        return service
    except Exception as e:
        print(f"Error getting Drive service: {e}")
        raise

def sanitize_folder_name(name):
    """Sanitize folder name to be valid for Google Drive."""
    if not name or not isinstance(name, str):
        return "Untitled"
    # Remove invalid characters, limit to 100 chars
    sanitized = re.sub(r'[<>:"/\\|?*\x00-\x1f]', '_', name)
    sanitized = sanitized.strip()
    return sanitized[:100] if sanitized else "Untitled"

def get_or_create_folder(service, folder_name, parent_id=None):
    """Get existing folder or create a new one using Google API client."""
    if not folder_name or not isinstance(folder_name, str):
        folder_name = "Untitled"
    
    # Sanitize folder name
    folder_name = sanitize_folder_name(folder_name)
    
    try:
        # Search for existing folder
        query = f"name='{folder_name}' and mimeType='application/vnd.google-apps.folder' and trashed=false"
        if parent_id:
            query += f" and '{parent_id}' in parents"
        
        response = service.files().list(
            q=query,
            spaces='drive',
            fields='files(id, name)',
            supportsAllDrives=True,
            includeItemsFromAllDrives=True
        ).execute()
        
        files = response.get('files', [])
        
        if files:
            folder_id = files[0]['id']
            print(f"📁 Found existing folder: {folder_name}")
            return folder_id
        
        # Create new folder
        file_metadata = {
            'name': folder_name,
            'mimeType': 'application/vnd.google-apps.folder'
        }
        if parent_id:
            file_metadata['parents'] = [parent_id]
        
        folder = service.files().create(
            body=file_metadata,
            fields='id',
            supportsAllDrives=True
        ).execute()
        
        folder_id = folder.get('id')
        print(f"✅ Created new folder: {folder_name}")
        return folder_id
        
    except HttpError as e:
        print(f"Error in folder operation: {e}")
        raise

def get_paper_category_folder_name(category):
    """Get standardized paper category folder name."""
    if not category:
        return "Uncategorized"
    
    # Map categories to standardized names
    category_map = {
        'Completed Extension Project Paper': 'Completed Extension Projects',
        'Ongoing Extension Project Paper': 'Ongoing Extension Projects',
        'Completed': 'Completed Extension Projects',
        'Ongoing': 'Ongoing Extension Projects',
    }
    
    # Check if it matches any key
    for key, value in category_map.items():
        if key.lower() in category.lower():
            return value
    
    # If no match, return sanitized category
    return sanitize_folder_name(category)

def get_thematic_area_folder_name(area):
    """Get standardized thematic area folder name."""
    if not area:
        return "Uncategorized"
    
    # Map thematic areas to standardized names
    area_map = {
        'Food Production, Agriculture, Fisheries, and Natural Resource Systems': 'Food Production & Agriculture',
        'Health, Nutrition, Wellness, and Community Care': 'Health & Community Care',
        'Education, Literacy, Skills Development, and Lifelong Learning': 'Education & Skills Development',
        'Livelihood, Entrepreneurship, Cooperatives, MSMEs, and Local Economic Development': 'Livelihood & Entrepreneurship',
        'Environment, Climate Action, Disaster Risk Reduction, and Community Resilience': 'Environment & Climate Action',
    }
    
    # Check if it matches any key
    for key, value in area_map.items():
        if key.lower() in area.lower():
            return value
    
    # If no match, return sanitized area
    return sanitize_folder_name(area)

def upload_file_to_drive(file_path, filename, project_title=None, sender_name=None, paper_category=None, thematic_area=None):
    """
    Uploads a file to Google Drive with folder structure:
    
    PEMnet_storage (ROOT)
    └── PEMNet 1st National Extension Conference 2026
        └── [Paper Category Folder]
            └── [Thematic Area Folder]
                └── [Sender Name]
                    └── file.pdf
    """
    print("=" * 50)
    print("📤 Starting upload to Google Drive...")
    
    # Validate inputs
    if not file_path or not os.path.exists(file_path):
        raise Exception(f"File not found: {file_path}")
    
    # Ensure filename is a string
    if not filename or not isinstance(filename, str):
        filename = "uploaded_file.pdf"
    
    # Sanitize filename
    filename = sanitize_folder_name(filename)
    
    # Get Drive service
    service = get_drive_service()
    
    # Step 1: Get or create Event folder
    event_folder_id = get_or_create_folder(
        service,
        EVENT_NAME,
        ROOT_FOLDER_ID
    )
    print(f"📁 Event folder: {EVENT_NAME} (ID: {event_folder_id})")
    
    # Step 2: Get or create Paper Category folder
    category_folder_name = get_paper_category_folder_name(paper_category)
    category_folder_id = get_or_create_folder(
        service,
        category_folder_name,
        event_folder_id
    )
    print(f"📁 Category folder: {category_folder_name} (ID: {category_folder_id})")
    
    # Step 3: Get or create Thematic Area folder
    thematic_folder_name = get_thematic_area_folder_name(thematic_area)
    thematic_folder_id = get_or_create_folder(
        service,
        thematic_folder_name,
        category_folder_id
    )
    print(f"📁 Thematic folder: {thematic_folder_name} (ID: {thematic_folder_id})")
    
    # Step 4: Get or create Sender folder
    if sender_name:
        safe_sender_name = sanitize_folder_name(sender_name)
        sender_folder_id = get_or_create_folder(
            service,
            safe_sender_name,
            thematic_folder_id
        )
        print(f"📁 Sender folder: {safe_sender_name} (ID: {sender_folder_id})")
        final_folder_id = sender_folder_id
    else:
        # If no sender name, use a default folder
        default_folder_id = get_or_create_folder(
            service,
            "Unidentified Sender",
            thematic_folder_id
        )
        final_folder_id = default_folder_id
        print(f"📁 Default folder: Unidentified Sender (ID: {default_folder_id})")
    
    # Step 5: Upload file directly to the sender folder
    print(f"📄 Uploading: {filename}")
    
    # Create file metadata
    file_metadata = {
        'name': filename,
        'parents': [final_folder_id]
    }
    
    # Create media upload
    media = MediaFileUpload(
        file_path,
        mimetype='application/pdf',
        resumable=True
    )
    
    # Upload the file
    try:
        file = service.files().create(
            body=file_metadata,
            media_body=media,
            fields='id, name',
            supportsAllDrives=True
        ).execute()
        
        file_id = file.get('id')
        
        if not file_id:
            raise Exception("No file ID returned")
        
        print(f"✅ Uploaded: {filename}")
        print(f"📂 Location: {EVENT_NAME} → {category_folder_name} → {thematic_folder_name} → {safe_sender_name if sender_name else 'Unidentified Sender'}")
        print("=" * 50)
        
        view_url = f"https://drive.google.com/file/d/{file_id}/view"
        download_url = f"https://drive.google.com/uc?export=download&id={file_id}"
        
        return view_url, download_url
        
    except HttpError as e:
        print(f"❌ Upload error: {e}")
        raise

def test_drive_connection():
    """Test connection using Google API client."""
    try:
        service = get_drive_service()
        
        # Test getting the root folder
        folder = service.files().get(
            fileId=ROOT_FOLDER_ID,
            fields='id, name',
            supportsAllDrives=True
        ).execute()
        
        print(f"✅ Connected")
        print(f"  Folder: {folder.get('name')}")
        print(f"  ID: {folder.get('id')}")
        return True
        
    except Exception as e:
        print(f"❌ Failed: {e}")
        return False