import os
import re
from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload
from googleapiclient.errors import HttpError
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
        return folder_id
        
    except HttpError as e:
        print(f"Error in folder operation: {e}")
        raise

def get_paper_category_folder_name(category):
    """Get standardized paper category folder name."""
    if not category:
        return "Uncategorized"
    
    category_map = {
        'Completed Extension Project Paper': 'Completed Extension Projects',
        'Ongoing Extension Project Paper': 'Ongoing Extension Projects',
        'Completed': 'Completed Extension Projects',
        'Ongoing': 'Ongoing Extension Projects',
    }
    
    for key, value in category_map.items():
        if key.lower() in category.lower():
            return value
    
    return sanitize_folder_name(category)

def get_thematic_area_folder_name(area):
    """Get standardized thematic area folder name."""
    if not area:
        return "Uncategorized"

    area_map = {
        'Food Production, Agriculture, Fisheries, and Natural Resource Systems': 'Food Production & Agriculture',
        'Health, Nutrition, Wellness, and Community Care': 'Health & Community Care',
        'Education, Literacy, Skills Development, and Lifelong Learning': 'Education & Skills Development',
        'Livelihood, Entrepreneurship, Cooperatives, MSMEs, and Local Economic Development': 'Livelihood & Entrepreneurship',
        'Environment, Climate Action, Disaster Risk Reduction, and Community Resilience': 'Environment & Climate Action',
    }
    
    for key, value in area_map.items():
        if key.lower() in area.lower():
            return value
    
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
    
    # Step 2: Get or create Paper Category folder
    category_folder_name = get_paper_category_folder_name(paper_category)
    category_folder_id = get_or_create_folder(
        service,
        category_folder_name,
        event_folder_id
    )
    
    # Step 3: Get or create Thematic Area folder
    thematic_folder_name = get_thematic_area_folder_name(thematic_area)
    thematic_folder_id = get_or_create_folder(
        service,
        thematic_folder_name,
        category_folder_id
    )
    
    # Step 4: Get or create Sender folder
    if sender_name:
        safe_sender_name = sanitize_folder_name(sender_name)
        sender_folder_id = get_or_create_folder(
            service,
            safe_sender_name,
            thematic_folder_id
        )
        final_folder_id = sender_folder_id
    else:
        # If no sender name, use a default folder
        default_folder_id = get_or_create_folder(
            service,
            "Unidentified Sender",
            thematic_folder_id
        )
        final_folder_id = default_folder_id
    
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
    
def extract_file_id_from_url(url):
    """
    Extract Google Drive file ID from a view or download URL.
    
    Args:
        url: Google Drive URL (view or download)
    
    Returns:
        str: File ID or None if not found
    """
    if not url:
        return None
    
    import re
    
    # Common patterns for Google Drive URLs
    patterns = [
        r'/file/d/([a-zA-Z0-9_-]+)',      # https://drive.google.com/file/d/FILE_ID/view
        r'[?&]id=([a-zA-Z0-9_-]+)',        # https://drive.google.com/uc?id=FILE_ID
        r'/d/([a-zA-Z0-9_-]+)',            # https://drive.google.com/d/FILE_ID
        r'open\?id=([a-zA-Z0-9_-]+)',      # https://drive.google.com/open?id=FILE_ID
    ]
    
    for pattern in patterns:
        match = re.search(pattern, url)
        if match:
            file_id = match.group(1)
            # Clean up any trailing parameters
            file_id = file_id.split('?')[0].split('&')[0]
            return file_id
    
    return None


def move_file_to_folder(service, file_id, new_parent_folder_id):
    """
    Move a file to a new folder in Google Drive.
    
    Args:
        service: Google Drive service instance
        file_id: ID of the file to move
        new_parent_folder_id: ID of the destination folder
    
    Returns:
        dict: Updated file metadata
    """
    try:
        file = service.files().get(
            fileId=file_id,
            fields='id, name, parents',
            supportsAllDrives=True
        ).execute()
        
        current_parents = file.get('parents', [])
        
        if new_parent_folder_id in current_parents:
            print(f"📁 File already in target folder, skipping move")
            return file
        
        old_parents_str = ','.join(current_parents) if current_parents else ''
        
        updated_file = service.files().update(
            fileId=file_id,
            addParents=new_parent_folder_id,
            removeParents=old_parents_str,
            fields='id, name, parents, webViewLink',
            supportsAllDrives=True
        ).execute()
        
        print(f"✅ Moved file '{file.get('name')}' to new folder")
        return updated_file
        
    except HttpError as e:
        print(f"❌ Error moving file: {e}")
        raise


def get_folder_path_for_submission(service, paper_category, thematic_area, sender_name):
    """
    Get or create the full folder path for a submission and return the final folder ID.
    
    Structure:
    PEMnet_storage (ROOT)
    └── PEMNet 1st National Extension Conference 2026
        └── [Paper Category Folder]
            └── [Thematic Area Folder]
                └── [Sender Name]
                    └── file.pdf
    
    Args:
        service: Google Drive service instance
        paper_category: Paper category name
        thematic_area: Thematic area name
        sender_name: Sender/author name
    
    Returns:
        str: Final folder ID
    """
    # Step 1: Event folder
    event_folder_id = get_or_create_folder(
        service,
        EVENT_NAME,
        ROOT_FOLDER_ID
    )
    
    # Step 2: Paper Category folder
    category_folder_name = get_paper_category_folder_name(paper_category)
    category_folder_id = get_or_create_folder(
        service,
        category_folder_name,
        event_folder_id
    )
    
    # Step 3: Thematic Area folder
    thematic_folder_name = get_thematic_area_folder_name(thematic_area)
    thematic_folder_id = get_or_create_folder(
        service,
        thematic_folder_name,
        category_folder_id
    )
    
    # Step 4: Sender folder
    if sender_name:
        safe_sender_name = sanitize_folder_name(sender_name)
        sender_folder_id = get_or_create_folder(
            service,
            safe_sender_name,
            thematic_folder_id
        )
        return sender_folder_id
    else:
        default_folder_id = get_or_create_folder(
            service,
            "Unidentified Sender",
            thematic_folder_id
        )
        return default_folder_id


def move_submission_files(file_urls, paper_category, thematic_area, sender_name):
    """
    Move multiple files to the appropriate folder based on paper category and thematic area.
    Also cleans up empty folders left behind after moving.
    
    Args:
        file_urls: List of URLs (view or download) to move
        paper_category: New paper category
        thematic_area: New thematic area
        sender_name: Sender/author name for folder structure
    
    Returns:
        dict: Mapping of old URL to new URL + cleanup info
    """
    result = {
        'moved': [],
        'failed': [],
        'url_mapping': {},
        'trashed_folders': []
    }
    
    if not file_urls:
        print("⚠️ No files to move")
        return result
    
    try:
        service = get_drive_service()
        
        # Get target folder
        target_folder_id = get_folder_path_for_submission( service, paper_category, thematic_area, sender_name)
        
        old_parent_ids = set()
        
        for url in file_urls:
            if not url:
                continue
            
            file_id = extract_file_id_from_url(url)
            if not file_id:
                print(f"⚠️ Could not extract file ID from URL: {url}")
                result['failed'].append(url)
                continue
            
            try:
                file_before = service.files().get(
                    fileId=file_id,
                    fields='id, name, parents',
                    supportsAllDrives=True
                ).execute()
                current_parents = file_before.get('parents', [])
                
                for parent_id in current_parents:
                    old_parent_ids.add(parent_id)
                
                updated_file = move_file_to_folder(service, file_id, target_folder_id)
                
                new_view_url = f"https://drive.google.com/file/d/{file_id}/view"
                new_download_url = f"https://drive.google.com/uc?export=download&id={file_id}"
                
                result['moved'].append({
                    'file_id': file_id,
                    'name': updated_file.get('name'),
                    'old_url': url,
                    'new_view_url': new_view_url,
                    'new_download_url': new_download_url
                })
                
                result['url_mapping'][url] = {
                    'view_url': new_view_url,
                    'download_url': new_download_url
                }
                
            except Exception as e:
                print(f"❌ Failed to move file {file_id}: {e}")
                result['failed'].append(url)
        
        print(f"✅ Moved {len(result['moved'])} files, {len(result['failed'])} failed")
        
        if old_parent_ids:
            event_folder_id = get_or_create_folder(
                service,
                EVENT_NAME,
                ROOT_FOLDER_ID
            )
            
            all_trashed = []
            for old_parent_id in old_parent_ids:
                if old_parent_id == target_folder_id:
                    continue
                
                trashed = cleanup_empty_folders_from_parent(
                    service,
                    old_parent_id,
                    stop_at_folder_id=event_folder_id
                )
                all_trashed.extend(trashed)
            
            result['trashed_folders'] = all_trashed
        
        print("=" * 50)
        
    except Exception as e:
        print(f"❌ Error in move operation: {e}")
        raise
    
    return result

def get_folder_parent(service, folder_id):
    """Get the parent folder ID of a folder."""
    try:
        folder = service.files().get(
            fileId=folder_id,
            fields='id, name, parents',
            supportsAllDrives=True
        ).execute()
        parents = folder.get('parents', [])
        return parents[0] if parents else None
    except HttpError as e:
        print(f"⚠️ Could not get parent of folder {folder_id}: {e}")
        return None


def get_folder_name(service, folder_id):
    """Get the name of a folder."""
    try:
        folder = service.files().get(
            fileId=folder_id,
            fields='id, name',
            supportsAllDrives=True
        ).execute()
        return folder.get('name')
    except HttpError as e:
        print(f"⚠️ Could not get name of folder {folder_id}: {e}")
        return None


def is_folder_empty(service, folder_id):
    """Check if a folder has no children (files or subfolders)."""
    try:
        response = service.files().list(
            q=f"'{folder_id}' in parents and trashed=false",
            fields='files(id, name)',
            supportsAllDrives=True,
            includeItemsFromAllDrives=True,
            pageSize=1
        ).execute()
        files = response.get('files', [])
        return len(files) == 0
    except HttpError as e:
        print(f"⚠️ Could not check if folder is empty: {e}")
        return False


def delete_folder(service, folder_id):
    """Move a folder to trash (safer than permanent delete)."""
    try:
        service.files().update(
            fileId=folder_id,
            body={'trashed': True},
            supportsAllDrives=True
        ).execute()
        return True
    except HttpError as e:
        print(f"⚠️ Could not trash folder {folder_id}: {e}")
        return False


def cleanup_empty_folders(service, file_id, stop_at_folder_id=None):
    """
    After moving a file, walk up the folder tree from the file's OLD parent
    and delete any empty folders (except the root and stop_at_folder_id).
    
    Args:
        service: Google Drive service instance
        file_id: ID of the file that was just moved
        stop_at_folder_id: Stop cleanup when reaching this folder ID (e.g., event folder)
    
    Returns:
        list: Names of folders that were trashed
    """
    trashed_folders = []
    
    try:
        
        pass
    except Exception as e:
        print(f"⚠️ Error in cleanup_empty_folders: {e}")
    
    return trashed_folders


def cleanup_empty_folders_from_parent(service, start_parent_id, stop_at_folder_id=None, max_depth=10):
    """
    Starting from a parent folder, walk UP the tree and delete empty folders.
    
    Args:
        service: Google Drive service instance
        start_parent_id: Folder ID to start checking (the old parent of the moved file)
        stop_at_folder_id: Stop cleanup when reaching this folder ID (e.g., event folder)
        max_depth: Maximum levels to walk up (safety limit)
    
    Returns:
        list: Names of folders that were trashed
    """
    trashed_folders = []
    current_id = start_parent_id
    depth = 0
    
    PROTECTED_FOLDER_IDS = {ROOT_FOLDER_ID}
    
    while current_id and depth < max_depth:
        if current_id in PROTECTED_FOLDER_IDS:
            print(f"🛑 Reached protected folder (ROOT), stopping cleanup")
            break
        
        if stop_at_folder_id and current_id == stop_at_folder_id:
            print(f"🛑 Reached stop folder, stopping cleanup")
            break
        
        if not is_folder_empty(service, current_id):
            print(f"📁 Folder {current_id} is not empty, stopping cleanup")
            break
        
        folder_name = get_folder_name(service, current_id)
        parent_id = get_folder_parent(service, current_id)
        
        if folder_name == EVENT_NAME:
            print(f"🛑 Reached event folder '{EVENT_NAME}', stopping cleanup")
            break
        
        if delete_folder(service, current_id):
            trashed_folders.append(folder_name or current_id)
            print(f"🗑️  Trashed empty folder: {folder_name}")
        
        current_id = parent_id
        depth += 1
    
    if trashed_folders:
        print(f"✅ Cleanup complete. Trashed {len(trashed_folders)} empty folder(s): {', '.join(trashed_folders)}")
    else:
        print(f"✅ Cleanup complete. No empty folders to remove")
    
    return trashed_folders