import io
import re
import PyPDF2
from pdfminer.high_level import extract_text as pdfminer_extract_text


class PDFExtractor:
    def __init__(self, pdf_buffer):
        self.pdf_buffer = pdf_buffer
        self.text = None
    
    def extract_text(self):
        """Extract text from PDF buffer using pdfminer for better spacing"""
        try:
            # Try using pdfminer first (better for preserving spaces)
            try:
                pdf_file = io.BytesIO(self.pdf_buffer)
                text = pdfminer_extract_text(pdf_file)
                if text and len(text) > 100:
                    self.text = text
                    return text
            except Exception as e:
                print(f"pdfminer extraction failed: {e}")
            
            # Fallback to PyPDF2
            pdf_file = io.BytesIO(self.pdf_buffer)
            pdf_reader = PyPDF2.PdfReader(pdf_file)
            text = ""
            for page in pdf_reader.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
            self.text = text
            return text
        except Exception as e:
            print(f"Error extracting text from PDF: {e}")
            return None
    
    def extract_title(self):
        """Extract main title - the title is between the note and the authors"""
        if not self.text:
            return None
        
        # Split text into lines
        lines = self.text.split('\n')
        
        # Find the title by looking for it between the note and the authors
        title_lines = []
        found_note = False
        found_title = False
        
        for i, line in enumerate(lines):
            line_stripped = line.strip()
            
            # Look for the note section
            if re.search(r'Note:.*?paper\s+presenter', line_stripped, re.IGNORECASE):
                found_note = True
                # After finding the note, look for the title on the next non-empty lines
                for j in range(i + 1, min(i + 10, len(lines))):
                    next_line = lines[j].strip()
                    if not next_line:
                        continue
                    # If we hit the authors (Florlyn), stop
                    if 'Florlyn' in next_line:
                        break
                    # If we hit another label, stop
                    if re.search(r'\d+\.\s*', next_line):
                        break
                    # This should be the title
                    if len(next_line) > 10 and not next_line.startswith('['):
                        title_lines.append(next_line)
                        found_title = True
                break
        
        if found_title:
            title_text = ' '.join(title_lines)
            # Clean up - remove any trailing text
            title_text = re.sub(r'\s*(?:Florlyn|3\.|$).*$', '', title_text, flags=re.IGNORECASE)
            return title_text
        
        # Fallback: Look for "Advanced ICT Training" specifically
        for i, line in enumerate(lines):
            if 'Advanced ICT Training' in line or 'Teachers - Phase III' in line:
                # Get this line and the next line if it continues the title
                title_parts = [line.strip()]
                if i + 1 < len(lines) and 'Teachers - Phase III' in lines[i + 1]:
                    title_parts.append(lines[i + 1].strip())
                return ' '.join(title_parts)
        
        return None
    
    def extract_title_english(self):
        """Extract English version of title"""
        patterns = [
            r'English\s+Version[:\s]*([^\n]+)',
            r'English\s+Title[:\s]*([^\n]+)',
        ]
        for pattern in patterns:
            match = re.search(pattern, self.text, re.IGNORECASE)
            if match:
                return match.group(1).strip()
        return None
    
    def extract_authors(self):
        """Extract authors - get the author names after the note and title"""
        if not self.text:
            return None
        
        # Look for the authors (starts with Florlyn)
        pattern = r'Florlyn[^\n]*(?:\s*\n\s*[^\n]*)*?(?=\s*3\.\s*Name|$)'
        match = re.search(pattern, self.text, re.IGNORECASE)
        
        if match:
            authors_text = match.group(0).strip()
            # Clean up - join lines
            authors_text = ' '.join(authors_text.split())
            # Remove any trailing text
            authors_text = re.sub(r'\s*(?:3\.|Name|$).*$', '', authors_text, flags=re.IGNORECASE)
            if authors_text and len(authors_text) > 5:
                return self._parse_authors(authors_text)
        
        return None
    
    def _parse_authors(self, authors_text):
        """Helper method to parse authors text"""
        # Parse authors list
        author_parts = re.split(r'[;,]\s*', authors_text)
        authors_list = [a.strip() for a in author_parts if a.strip()]
        
        # Find project leader (marked with *)
        project_leader = None
        clean_authors = []
        for author in authors_list:
            if '*' in author:
                project_leader = author.replace('*', '').strip()
                clean_authors.append(project_leader)
            else:
                clean_authors.append(author)
        
        return {
            'full_text': authors_text,
            'list': clean_authors,
            'project_leader': project_leader
        }
    
    def extract_corresponding_author(self):
        """Extract corresponding author - get only the name and email"""
        if not self.text:
            return None
        
        # Look for the corresponding author section
        # Pattern: "3. Name and Email Address of Corresponding Author" followed by name and email
        pattern = r'3\.\s*Name\s+and\s+Email\s+Address\s+of\s+Corresponding\s+Author.*?\n\s*([A-Z][A-Z\s.]+)\s*\n\s*([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})'
        match = re.search(pattern, self.text, re.IGNORECASE | re.DOTALL)
        
        if match:
            name = match.group(1).strip()
            email = match.group(2).strip()
            return {
                'full': f"{name} {email}".strip(),
                'name': name,
                'email': email
            }
        
        return None
    
    def extract_paper_category(self):
        """Extract paper category - get the checked one"""
        if not self.text:
            return None
        
        # Look for checked checkbox in the text
        checked_match = re.search(r'\[[xX]\]\s*(Completed|Ongoing)\s+Extension\s+Project\s+Paper', self.text, re.IGNORECASE)
        if checked_match:
            category = checked_match.group(1).strip()
            return f"{category.capitalize()} Extension Project Paper"
        
        return None
    
    def extract_thematic_area(self):
        """Extract thematic area - get the checked one"""
        if not self.text:
            return None
        
        thematic_areas = [
            'Food Production, Agriculture, Fisheries, and Natural Resource Systems',
            'Health, Nutrition, Wellness, and Community Care',
            'Education, Literacy, Skills Development, and Lifelong Learning',
            'Livelihood, Entrepreneurship, Cooperatives, MSMEs, and Local Economic Development',
            'Environment, Climate Action, Disaster Risk Reduction, and Community Resilience'
        ]
        
        # Look for [X] followed by any of the thematic areas
        for area in thematic_areas:
            area_pattern = r'\[[xX]\]\s*' + re.escape(area)
            if re.search(area_pattern, self.text, re.IGNORECASE | re.DOTALL):
                return area
        
        # Alternative: find [X] and then match the text after it
        x_pattern = r'\[[xX]\]\s*([^\n]+(?:\s*[^\n]+)*?)(?=\s*(?:\[[xX\s]\]|$|\n\n))'
        matches = re.findall(x_pattern, self.text, re.IGNORECASE | re.DOTALL)
        
        for area_text in matches:
            area_text = area_text.strip()
            for area in thematic_areas:
                if area.lower() in area_text.lower():
                    return area
        
        return None
    
    def extract_theme(self):
        """Extract theme - get the value after Theme:"""
        if not self.text:
            return None
        
        # Look for the theme
        theme_match = re.search(r'Theme[:\s]*([^\n]+(?:\s*[^\n]+)*?)(?=\s*(?:Instructions|A\.|1\.|$))', self.text, re.IGNORECASE | re.DOTALL)
        if theme_match:
            theme = theme_match.group(1).strip()
            # Remove any trailing text
            theme = re.sub(r'\s*(?:Instructions|A\.|1\.).*$', '', theme, flags=re.IGNORECASE)
            theme = re.sub(r'^Theme[:\s]*', '', theme, flags=re.IGNORECASE)
            if theme and len(theme) > 10:
                return theme
        
        return None
    
    def extract_all(self):
        """Extract all fields"""
        try:
            # Extract text from PDF
            if not self.text:
                self.extract_text()
            
            if not self.text:
                return None
            
            # Extract all fields
            extracted_data = {
                'title': self.extract_title(),
                'title_english': self.extract_title_english(),
                'authors_data': self.extract_authors(),
                'corresponding_author': self.extract_corresponding_author(),
                'paper_category': self.extract_paper_category(),
                'thematic_area': self.extract_thematic_area(),
                'theme': self.extract_theme()
            }
            
            # Remove None values for cleaner output
            extracted_data = {k: v for k, v in extracted_data.items() if v is not None}
            
            return extracted_data
            
        except Exception as e:
            print(f"Error extracting data: {e}")
            import traceback
            traceback.print_exc()
            return None

    @staticmethod
    def extract_from_pdf_buffer(pdf_buffer):
        """Static method to extract data from PDF buffer"""
        extractor = PDFExtractor(pdf_buffer)
        return extractor.extract_all()