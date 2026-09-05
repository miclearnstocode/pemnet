import os
from google_drive import upload_file_to_drive, test_drive_connection, ROOT_FOLDER_ID

def create_test_pdf():
    """Create a minimal valid PDF for testing."""
    test_file = "test.pdf"
    with open(test_file, 'wb') as f:
        f.write(b'%PDF-1.4\n')
        f.write(b'1 0 obj\n')
        f.write(b'<< /Type /Catalog /Pages 2 0 R >>\n')
        f.write(b'endobj\n')
        f.write(b'2 0 obj\n')
        f.write(b'<< /Type /Pages /Kids [3 0 R] /Count 1 >>\n')
        f.write(b'endobj\n')
        f.write(b'3 0 obj\n')
        f.write(b'<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R >>\n')
        f.write(b'endobj\n')
        f.write(b'4 0 obj\n')
        f.write(b'<< /Length 44 >>\n')
        f.write(b'stream\n')
        f.write(b'BT /F1 12 Tf 100 700 Td (Test PDF) Tj ET\n')
        f.write(b'endstream\n')
        f.write(b'endobj\n')
        f.write(b'xref\n')
        f.write(b'0 5\n')
        f.write(b'0000000000 65535 f\n')
        f.write(b'0000000010 00000 n\n')
        f.write(b'0000000050 00000 n\n')
        f.write(b'0000000100 00000 n\n')
        f.write(b'0000000200 00000 n\n')
        f.write(b'trailer\n')
        f.write(b'<< /Size 5 /Root 1 0 R >>\n')
        f.write(b'startxref\n')
        f.write(b'300\n')
        f.write(b'%%EOF\n')
    return test_file

def test_upload():
    """Test uploading a file using Google API client."""
    test_file = create_test_pdf()
    
    try:
        print("\n" + "=" * 50)
        print("Testing File Upload...")
        print("=" * 50)
        
        view_url, download_url = upload_file_to_drive(
            test_file,
            "cherry joy.pdf",
            project_title="Test Project"
        )
        
        print("\n✅ Upload successful!")
        print(f"  View URL: {view_url}")
        print(f"  Download URL: {download_url}")
        print("\n📁 Folder structure created:")
        print(f"  📁 Root Folder ({ROOT_FOLDER_ID})")
        print(f"  └── 📁 PEMnet_storage")
        print(f"      └── 📁 PEMNet 1st National Extension Conference 2026")
        print(f"          └── 📁 Test Project")
        print(f"              └── 📄 test_upload.pdf")
        
        return True
    except Exception as e:
        print(f"\n❌ Upload failed: {e}")
        import traceback
        traceback.print_exc()
        return False
    finally:
        if os.path.exists(test_file):
            os.remove(test_file)
            print("\n✓ Test file cleaned up")

if __name__ == "__main__":
    print("=" * 50)
    print("Google Drive Test")
    print("=" * 50)
    print()
    
    print("Testing connection to Google Drive...")
    print("Root Folder ID: " + ROOT_FOLDER_ID)
    print("-" * 50)
    if test_drive_connection():
        print("\n✅ Connection successful!")
        test_upload()
    else:
        print("\n❌ Connection failed. Please check your service account and root folder ID.")