# test_pdf_extraction.py
import os
import sys
import json
import tempfile
import re
from datetime import datetime

# Import both extractors
from pdf_extracted import PDFExtractor
from docs_extracted import PDFExtractor as DOCXExtractor

# ANSI color codes for better output
class Colors:
    HEADER = '\033[95m'
    BLUE = '\033[94m'
    CYAN = '\033[96m'
    GREEN = '\033[92m'
    WARNING = '\033[93m'
    RED = '\033[91m'
    END = '\033[0m'
    BOLD = '\033[1m'
    UNDERLINE = '\033[4m'

def print_header(text):
    """Print a formatted header"""
    print("\n" + "=" * 80)
    print(f"{Colors.BOLD}{Colors.CYAN}{text}{Colors.END}")
    print("=" * 80)

def print_success(text):
    """Print success message"""
    print(f"{Colors.GREEN}✅ {text}{Colors.END}")

def print_error(text):
    """Print error message"""
    print(f"{Colors.RED}❌ {text}{Colors.END}")

def print_warning(text):
    """Print warning message"""
    print(f"{Colors.WARNING}⚠️  {text}{Colors.END}")

def print_info(text):
    """Print info message"""
    print(f"{Colors.BLUE}ℹ️  {text}{Colors.END}")

def print_field(label, value):
    """Print a field with label and value"""
    if value:
        print(f"  {Colors.BOLD}{label}:{Colors.END} {value}")
    else:
        print(f"  {Colors.BOLD}{label}:{Colors.END} {Colors.WARNING}Not found{Colors.END}")

def get_file_type(filepath):
    """Determine file type based on extension"""
    ext = os.path.splitext(filepath)[1].lower()
    if ext == '.pdf':
        return 'pdf'
    elif ext == '.docx':
        return 'docx'
    else:
        return None

def get_extractor(filepath, file_buffer):
    """Get the appropriate extractor based on file type"""
    file_type = get_file_type(filepath)
    
    if file_type == 'pdf':
        print_info("Using PDF extractor")
        return PDFExtractor(file_buffer)
    elif file_type == 'docx':
        print_info("Using DOCX extractor")
        return DOCXExtractor(file_buffer, filename=os.path.basename(filepath))
    else:
        print_error(f"Unsupported file type: {file_type}")
        return None

def analyze_text_structure(text):
    """Analyze the text structure to help debug extraction"""
    print_header("Text Structure Analysis")
    
    # Find lines with common patterns
    patterns = [
        ('Title', r'Title.*?:'),
        ('Authors', r'Author.*?:'),
        ('Corresponding', r'Corresponding.*?:'),
        ('Paper Category', r'Paper Category.*?:'),
        ('Thematic Area', r'Thematic Area.*?:'),
        ('Theme', r'Theme.*?:')
    ]
    
    lines = text.split('\n')
    
    print_info("Looking for field labels in text:")
    for i, line in enumerate(lines):
        line_stripped = line.strip()
        if line_stripped:
            for label, pattern in patterns:
                if re.search(pattern, line_stripped, re.IGNORECASE):
                    # Show the line and the next line that might contain the value
                    print(f"  Line {i}: {line_stripped}")
                    if i + 1 < len(lines) and lines[i+1].strip():
                        print(f"    Value: {lines[i+1].strip()}")
                    break
    
    # Look for table-like data
    print_info("\nLooking for table-like data (rows with labels and values):")
    for i, line in enumerate(lines):
        line_stripped = line.strip()
        if line_stripped and ':' in line_stripped:
            parts = line_stripped.split(':', 1)
            if len(parts) == 2 and len(parts[0]) < 50 and len(parts[1]) > 5:
                print(f"  {parts[0].strip()}: {parts[1].strip()}")

def test_extraction_from_file(filepath):
    """Test extraction from a file (PDF or DOCX) with detailed debugging"""
    print_header(f"Testing Extraction: {os.path.basename(filepath)}")
    
    try:
        # Read file
        with open(filepath, 'rb') as f:
            file_buffer = f.read()
        
        print_info(f"File size: {len(file_buffer)} bytes")
        print_info(f"File type: {get_file_type(filepath)}")
        
        # Get the appropriate extractor
        extractor = get_extractor(filepath, file_buffer)
        if not extractor:
            return None
        
        # Extract text first
        print_info("Extracting text from file...")
        text = extractor.extract_text()
        
        if text:
            print_success(f"Text extracted ({len(text)} characters)")
            # Show first 500 characters
            print_info(f"Preview: {text[:500]}...")
        else:
            print_error("Failed to extract text from file")
            return None
        
        # Analyze the text structure
        analyze_text_structure(text)
        
        # Extract all data
        print_info("Extracting fields from file...")
        extracted_data = extractor.extract_all()
        
        if not extracted_data:
            print_error("No data extracted from file")
            return None
        
        print_success("Extraction completed!")
        
        # Display results
        print_header("Extracted Data Results")
        
        print_field("Title", extracted_data.get('title'))
        print_field("Title (English)", extracted_data.get('title_english'))
        print_field("Theme", extracted_data.get('theme'))
        
        # Authors
        authors_data = extracted_data.get('authors_data')
        if authors_data:
            print_field("Authors (Full)", authors_data.get('full_text'))
            print_field("Authors List", ', '.join(authors_data.get('list', [])) if authors_data.get('list') else None)
            print_field("Project Leader", authors_data.get('project_leader'))
        else:
            print_field("Authors", None)
        
        # Corresponding Author
        corr_author = extracted_data.get('corresponding_author')
        if corr_author:
            print_field("Corresponding Author Name", corr_author.get('name'))
            print_field("Corresponding Author Email", corr_author.get('email'))
        else:
            print_field("Corresponding Author", None)
        
        print_field("Paper Category", extracted_data.get('paper_category'))
        print_field("Thematic Area", extracted_data.get('thematic_area'))
        
        # Print JSON for debugging
        print_header("Extracted Data (JSON)")
        clean_data = {}
        for key, value in extracted_data.items():
            if value is not None:
                if key == 'authors_data' and value:
                    clean_data[key] = {
                        'full_text': value.get('full_text'),
                        'list': value.get('list'),
                        'project_leader': value.get('project_leader')
                    }
                elif key == 'corresponding_author' and value:
                    clean_data[key] = {
                        'name': value.get('name'),
                        'email': value.get('email')
                    }
                else:
                    clean_data[key] = value
        
        print(json.dumps(clean_data, indent=2, ensure_ascii=False))
        
        return extracted_data
        
    except Exception as e:
        print_error(f"Error during extraction: {e}")
        import traceback
        traceback.print_exc()
        return None

def analyze_file_structure(filepath):
    """Analyze the file structure to understand table layout"""
    print_header(f"File Structure Analysis: {os.path.basename(filepath)}")
    
    try:
        with open(filepath, 'rb') as f:
            file_buffer = f.read()
        
        # Get the appropriate extractor
        extractor = get_extractor(filepath, file_buffer)
        if not extractor:
            return None
        
        text = extractor.extract_text()
        
        if not text:
            print_error("Failed to extract text")
            return None
        
        print_info(f"Total text length: {len(text)} characters")
        print_header("Full Extracted Text")
        print(text)
        
        return text
        
    except Exception as e:
        print_error(f"Error analyzing file: {e}")
        return None

def create_test_pdf():
    """Create a test PDF with sample abstract data"""
    try:
        from reportlab.lib.pagesizes import letter
        from reportlab.pdfgen import canvas
        from reportlab.lib.units import inch
    except ImportError:
        print_error("reportlab not installed. Installing...")
        import subprocess
        subprocess.check_call([sys.executable, "-m", "pip", "install", "reportlab"])
        from reportlab.lib.pagesizes import letter
        from reportlab.pdfgen import canvas
        from reportlab.lib.units import inch
    
    # Create a temporary file
    temp_file = tempfile.NamedTemporaryFile(delete=False, suffix='.pdf')
    temp_path = temp_file.name
    temp_file.close()
    
    # Create PDF
    c = canvas.Canvas(temp_path, pagesize=letter)
    width, height = letter
    
    # Title
    c.setFont("Helvetica-Bold", 16)
    c.drawString(1*inch, height - 1*inch, "Title of the Extension Project Paper:")
    c.setFont("Helvetica", 14)
    c.drawString(1.5*inch, height - 1.5*inch, "Sustainable Agriculture and Food Security Program for Rural Communities")
    
    # English Title
    c.setFont("Helvetica-Bold", 12)
    c.drawString(1*inch, height - 2.2*inch, "English Version:")
    c.setFont("Helvetica", 12)
    c.drawString(1.5*inch, height - 2.7*inch, "Sustainable Agriculture and Food Security Program for Rural Communities")
    
    # Authors
    c.setFont("Helvetica-Bold", 12)
    c.drawString(1*inch, height - 3.4*inch, "Author/s and Institutional Affiliation/s:")
    c.setFont("Helvetica", 11)
    c.drawString(1.5*inch, height - 3.9*inch, "Dr. Maria Santos*, University of the Philippines; Prof. Juan Dela Cruz, UPLB")
    
    # Corresponding Author
    c.setFont("Helvetica-Bold", 12)
    c.drawString(1*inch, height - 4.6*inch, "Name and Email Address of Corresponding Author:")
    c.setFont("Helvetica", 11)
    c.drawString(1.5*inch, height - 5.1*inch, "Dr. Maria Santos (msantos@up.edu.ph)")
    
    # Paper Category - with checked checkbox
    c.setFont("Helvetica", 12)
    c.drawString(1*inch, height - 5.8*inch, "Paper Category:")
    c.drawString(1.8*inch, height - 5.8*inch, "[x] Completed Extension Project Paper")
    c.drawString(1.8*inch, height - 6.1*inch, "[ ] Ongoing Extension Project Paper")
    
    # Thematic Area - with checked checkbox
    c.setFont("Helvetica", 11)
    c.drawString(1*inch, height - 6.7*inch, "Thematic Area:")
    c.drawString(1.8*inch, height - 6.7*inch, "[x] Food Production, Agriculture, Fisheries, and Natural Resource Systems")
    
    # Theme
    c.setFont("Helvetica-Bold", 12)
    c.drawString(1*inch, height - 7.4*inch, "Theme:")
    c.setFont("Helvetica", 11)
    c.drawString(1.5*inch, height - 7.9*inch, "Food Security and Sustainable Agriculture")
    
    c.save()
    
    print_success(f"Test PDF created: {temp_path}")
    return temp_path

def run_comprehensive_test():
    """Run comprehensive tests"""
    print_header("File Extraction Test Suite")
    print_info(f"Test started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    results = {
        'total_tests': 0,
        'passed': 0,
        'failed': 0,
        'extracted_data': None
    }
    
    # Test with a real file (if provided)
    print_header("Testing with Real File")
    
    # Check if a file was provided as command line argument
    if len(sys.argv) > 1:
        file_path = sys.argv[1]
        results['total_tests'] += 1
        
        if os.path.exists(file_path):
            print_info(f"Testing with: {file_path}")
            extracted = test_extraction_from_file(file_path)
            
            if extracted:
                results['passed'] += 1
                results['extracted_data'] = extracted
                print_success("Test passed!")
            else:
                results['failed'] += 1
                print_error("Test failed!")
        else:
            results['failed'] += 1
            print_error(f"File not found: {file_path}")
    else:
        print_info("No file provided.")
        print_info("Usage: python test_pdf_extraction.py your_file.pdf (or .docx)")
        print_info("Creating and testing with a sample PDF...")
        
        # Create and test with a sample PDF
        test_pdf_path = create_test_pdf()
        if test_pdf_path and os.path.exists(test_pdf_path):
            extracted = test_extraction_from_file(test_pdf_path)
            if extracted:
                results['passed'] += 1
                results['extracted_data'] = extracted
            else:
                results['failed'] += 1
            
            # Clean up test PDF
            try:
                os.unlink(test_pdf_path)
                print_info(f"Cleaned up test PDF: {test_pdf_path}")
            except:
                pass
    
    # Summary
    print_header("Test Summary")
    print(f"  Total Tests: {results['total_tests']}")
    print(f"  ✅ Passed: {results['passed']}")
    print(f"  ❌ Failed: {results['failed']}")
    
    return results

def interactive_test():
    """Interactive test mode - user can upload a file and check extraction"""
    print_header("Interactive File Extraction Test")
    print_info("This mode allows you to test extraction with your own files (PDF or DOCX)")
    
    while True:
        print("\n" + "-" * 40)
        print("Options:")
        print("  1. Extract data from a file (PDF or DOCX)")
        print("  2. Analyze file structure (debug mode)")
        print("  3. Run comprehensive test (creates test PDF)")
        print("  4. Exit")
        
        choice = input("\nEnter your choice (1-4): ").strip()
        
        if choice == '1':
            file_path = input("Enter the path to the file (PDF or DOCX): ").strip()
            if os.path.exists(file_path):
                extracted = test_extraction_from_file(file_path)
                if extracted:
                    print_success("Extraction completed successfully!")
                else:
                    print_error("Extraction failed!")
            else:
                print_error(f"File not found: {file_path}")
        
        elif choice == '2':
            file_path = input("Enter the path to the file to analyze: ").strip()
            if os.path.exists(file_path):
                analyze_file_structure(file_path)
            else:
                print_error(f"File not found: {file_path}")
        
        elif choice == '3':
            run_comprehensive_test()
        
        elif choice == '4':
            print_info("Exiting...")
            break
        
        else:
            print_warning("Invalid choice. Please try again.")

if __name__ == '__main__':
    # Check if running in interactive mode or with arguments
    if len(sys.argv) > 1 and sys.argv[1] == '--interactive':
        interactive_test()
    elif len(sys.argv) > 1 and sys.argv[1] == '--analyze' and len(sys.argv) > 2:
        analyze_file_structure(sys.argv[2])
    elif len(sys.argv) > 1 and sys.argv[1] != '--help':
        # Run with a specific file
        test_extraction_from_file(sys.argv[1])
    else:
        # Run comprehensive test
        print_info("Running comprehensive test...")
        print_info("For interactive mode: python test_pdf_extraction.py --interactive")
        print_info("To analyze file structure: python test_pdf_extraction.py --analyze your_file.pdf")
        print_info("To test with your file: python test_pdf_extraction.py your_file.pdf (or .docx)")
        print()
        run_comprehensive_test()