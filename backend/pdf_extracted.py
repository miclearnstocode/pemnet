import io
import re
import PyPDF2
from pdfminer.high_level import extract_text as pdfminer_extract_text
import fitz  
import pdfplumber

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

    def _get_pdf_table_rows(self):
        """
        Use PyMuPDF to extract table cells from the PDF. 
        This is the ONLY reliable way to handle the jumbled text in tables.
        """
        try:
            doc = fitz.open(stream=self.pdf_buffer, filetype="pdf")
            table_data = {}
            
            for page_num, page in enumerate(doc):
                # Extract tables from the page
                tabs = page.find_tables()
                if not tabs.tables:
                    continue
                
                for tab in tabs.tables:
                    # Iterate over rows and cells
                    for row_idx, row in enumerate(tab.extract()):
                        # Row is a list of cell texts (strings)
                        # We look for specific labels in the first column
                        for cell_idx, cell in enumerate(row):
                            if cell:
                                clean_cell = ' '.join(cell.split())
                                if '1. Title' in clean_cell:
                                    # The title is the next cell
                                    if cell_idx + 1 < len(row) and row[cell_idx + 1]:
                                        table_data['title'] = ' '.join(row[cell_idx + 1].split())
                                elif '2. Author' in clean_cell:
                                    if cell_idx + 1 < len(row) and row[cell_idx + 1]:
                                        table_data['authors'] = ' '.join(row[cell_idx + 1].split())
                                elif '3. Name' in clean_cell:
                                    if cell_idx + 1 < len(row) and row[cell_idx + 1]:
                                        table_data['corresponding_author'] = ' '.join(row[cell_idx + 1].split())
                                elif '3. Paper' in clean_cell:
                                    if cell_idx + 1 < len(row) and row[cell_idx + 1]:
                                        table_data['paper_category'] = ' '.join(row[cell_idx + 1].split())
                                elif '4. Thematic' in clean_cell:
                                    if cell_idx + 1 < len(row) and row[cell_idx + 1]:
                                        table_data['thematic_area'] = ' '.join(row[cell_idx + 1].split())
            
            doc.close()
            return table_data
        except Exception as e:
            print(f"Warning: Could not extract table cells (fitz): {e}")
            return {}
    
    def extract_title(self):
        """Extract main title - robustly handles multi-line text and table structures."""
        if not self.text:
            return None
        
        # 1. First, try to get the EXACT cell content using PyMuPDF tables
        table_data = self._get_pdf_table_rows()
        if table_data.get('title'):
            return table_data['title']
        
        # 2. Fallback to text regex
        normalized_text = re.sub(r'\s+', ' ', self.text)
        pattern = r'1\.\s*Title\s+of\s+the\s+Extension\s+Project\s+Paper\s*[|:]*\s*(.*?)(?=\s*2\.\s*Author|$)'
        match = re.search(pattern, normalized_text, re.IGNORECASE | re.DOTALL)
        
        if match:
            title = match.group(1).strip()
            title = re.sub(r'\s*(?:Note:|Use an asterisk|paper presenter).*$', '', title, flags=re.IGNORECASE)
            if title and len(title) > 5:
                return title
        
        return None
    
    def extract_title_english(self):
        """Extract English version of title"""
        if not self.text:
            return None

        normalized_text = re.sub(r'\s+', ' ', self.text)
        patterns = [
            r'English\s+Version[:\s]*([^\n]+)',
            r'English\s+Title[:\s]*([^\n]+)',
        ]
        for pattern in patterns:
            match = re.search(pattern, normalized_text, re.IGNORECASE)
            if match:
                return match.group(1).strip()
        return None
    
    def extract_authors(self):
        """Extract authors - get the author names after the note and title"""
        if not self.text:
            return None
        
        # 1. Get exact cell content from PyMuPDF table
        table_data = self._get_pdf_table_rows()
        if table_data.get('authors'):
            return self._parse_authors(table_data['authors'])

        # 2. Fallback to text regex if table extraction failed
        normalized_text = re.sub(r'\s+', ' ', self.text)
        
        pattern = r'2\.\s*Author/s\s+and\s+Institutional\s+Affiliation/s\s*[|:]*\s*(.*?)(?=\s*3\.\s*Name|$)'
        match = re.search(pattern, normalized_text, re.IGNORECASE | re.DOTALL)
        
        if match:
            authors_text = match.group(1).strip()
            authors_text = re.sub(r'\s*(?:Note:.*?paper presenter).*$', '', authors_text, flags=re.IGNORECASE)
            authors_text = ' '.join(authors_text.split())
            
            if authors_text and len(authors_text) > 5:
                return self._parse_authors(authors_text)
        
        return None
    
    def _parse_authors(self, authors_text):
        """Helper method to parse authors text. Dynamically handles Asterisk (*), Lead Proponent, and Degrees."""
        full_text = authors_text
        
        # ---------------------------------------------------------
        # 1. Extract Institution
        # ---------------------------------------------------------
        institution = None
        
        # New format: "Institutional Affiliation: ..."
        institution_match = re.search(r'Institutional\s+Affiliation\s*:\s*(.+?)(?=\s*$|3\.)', authors_text, re.IGNORECASE)
        if institution_match:
            institution = institution_match.group(1).strip()
        else:
            # Old format: "Name*/Institution; ..."
            slash_match = re.search(r'[^/]+/+\s*([^;]+)', authors_text)
            if slash_match:
                institution = slash_match.group(1).strip()

        # ---------------------------------------------------------
        # 2. Extract Project Leader (Fixed Regex for Commas!)
        # ---------------------------------------------------------
        project_leader = None
        
        # New format: "Lead Proponent/ Program Leader: Dr. Maria Wendy M. Solomo"
        lead_match = re.search(r'Lead\s+Proponent/?\s*Program\s+Leader\s*:\s*(.*?)(?=\s*Members?\s*:|$)', authors_text, re.IGNORECASE | re.DOTALL)
        if lead_match:
            project_leader = lead_match.group(1).strip()
            # Clean up degree if present
            project_leader = re.sub(r',\s*(?:MALT|PhD|Ph\.D|EdD|M\.D|MA|MSc)\s*$', '', project_leader).strip()
        else:
            # Old format: "Dominador, Jr. B. Maquillan, MALT*"
            # Regex captures everything up to the first comma followed by the * 
            # OR everything up to the * if no comma is present before it
            asterisk_match = re.search(r'^(.*?)(?:,)?\s*(?:MALT|PhD|Ph\.D|EdD|M\.D|MA|MSc)?\s*\*', authors_text)
            if asterisk_match:
                project_leader = asterisk_match.group(1).strip()
                # Remove trailing commas/slashes and whitespace
                project_leader = re.sub(r'[,\s/]+$', '', project_leader).strip()

        # ---------------------------------------------------------
        # 3. Extract Members
        # ---------------------------------------------------------
        members_text = ""
        members_match = re.search(r'Members?\s*:\s*(.*?)(?=\s*Institutional\s+Affiliation)', authors_text, re.IGNORECASE | re.DOTALL)
        if members_match:
            members_text = members_match.group(1).strip()
        else:
            # If no "Members" label, just take everything between the Leader and the Institution
            if project_leader:
                members_text = authors_text.replace(project_leader, '', 1)
            if institution:
                members_text = members_text.replace(institution, '')

        # ---------------------------------------------------------
        # 4. Build Authors List (Dynamic Splitting)
        # ---------------------------------------------------------
        authors_list = []
        if project_leader:
            authors_list.append(project_leader.strip())
        
        if members_text:
            members_text = members_text.replace('\u200b', ' ').replace('\u200b', '')
            
            # Split names based on punctuation and capitalization
            # This regex tries to grab "First Middle Last, Degree" patterns
            patterns = re.findall(r'([A-Z][A-Za-z.\-]+(?:\s+[A-Z][A-Za-z.\-]+){0,3}(?:,\s*[A-Z][A-Za-z.\-]+)*,?\s*(?:MALT|PhD|Ph\.D|EdD|M\.D|MA|MSc)?)', members_text)
            
            for member in patterns:
                member = member.strip()
                # Remove the degree suffix and trailing commas
                member = re.sub(r',\s*(?:MALT|PhD|Ph\.D|EdD|M\.D|MA|MSc)\s*$', '', member).strip()
                member = re.sub(r'[,\s]+$', '', member).strip()
                
                if member and len(member) > 2 and member.lower() not in ['members', 'lead proponent', 'program leader', 'davao', 'sur', 'state', 'college']:
                    authors_list.append(member)

        # ---------------------------------------------------------
        # 5. Clean up list
        # ---------------------------------------------------------
        cleaned_authors = []
        for author in authors_list:
            author = author.strip()
            if not author:
                continue
            # Skip if it's the institution itself
            if institution and author.lower() == institution.lower():
                continue
            # Skip if author is a piece of the institution
            if institution and author.lower() in institution.lower():
                continue
            if author not in cleaned_authors:
                cleaned_authors.append(author)
        
        # ---------------------------------------------------------
        # 6. Append Institution
        # ---------------------------------------------------------
        if institution:
            cleaned_authors = [f"{author} - {institution}" for author in cleaned_authors]

        return {
            'full_text': full_text,
            'list': cleaned_authors,
            'project_leader': project_leader,
            'institution': institution
        }
    
    def extract_corresponding_author(self):
        """Extract corresponding author - specifically pulls the name right before the email."""
        if not self.text:
            return None
        
        # 1. Get exact cell content from PyMuPDF table
        table_data = self._get_pdf_table_rows()
        if table_data.get('corresponding_author'):
            section_text = table_data['corresponding_author']
            email_match = re.search(r'([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\s*\.\s*[a-zA-Z]{2,})', section_text)
            if email_match:
                email = re.sub(r'\s+', '', email_match.group(1).strip())
                raw_name = section_text[:email_match.start()].strip()
                # Clean the name
                name = re.sub(r'[,\s]+$', '', raw_name)
                if name and email:
                    return {
                        'full': f"{name} {email}".strip(),
                        'name': name,
                        'email': email
                    }

        # 2. Fallback to text regex if table extraction failed
        normalized_text = re.sub(r'\s+', ' ', self.text)
        email_match = re.search(r'([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\s*\.\s*[a-zA-Z]{2,})', normalized_text)
        
        if email_match:
            email = re.sub(r'\s+', '', email_match.group(1).strip())
            before_email = normalized_text[:email_match.start()].strip()
            
            # Look for the last occurrence of a real name (e.g., "Dr. Maria Wendy M. Solomo")
            name_pattern = r'(?:Dr\.|Prof\.|Mr\.|Ms\.|Mrs\.)?\s*[A-Z][A-Za-z.\-]+(?:\s+[A-Z][A-Za-z.\-]+)+(?:,\s*(?:PhD|Ph\.D\.|EdD|M\.D\.|MSc|MA))?'
            name_matches = re.findall(name_pattern, before_email)
            
            if name_matches:
                name = name_matches[-1].strip()
                name = re.sub(r'[,\s]+$', '', name)
            else:
                words = before_email.split()
                name = ' '.join(words[-4:])
            
            if name and email:
                return {
                    'full': f"{name} {email}".strip(),
                    'name': name,
                    'email': email
                }
        
        return None
    
    def _get_highlighted_text_areas(self):
        """
        Use PyMuPDF (fitz) to find areas with a yellow highlight background.
        Returns a list of strings found in those highlighted areas.
        """
        try:
            doc = fitz.open(stream=self.pdf_buffer, filetype="pdf")
            highlighted_texts = []

            for page in doc:
                # 1. Check rectangles (filled shapes)
                for drawing in page.get_drawings():
                    if drawing.get("fill"):
                        r, g, b = drawing["fill"]
                        # Check if it's yellow (high Red, high Green, low Blue)
                        if r > 0.8 and g > 0.8 and b < 0.4:
                            rect = drawing["rect"]
                            text = page.get_text("text", clip=rect).strip()
                            if text:
                                highlighted_texts.append(text)

                # 2. Check text annotations/highlights (sometimes generated as text marks)
                for annotation in page.annots() or []:
                    if annotation.type[0] == 8:  # Highlight annotation type
                        text = annotation.info.get("content", "").strip()
                        if text:
                            highlighted_texts.append(text)

            doc.close()
            return highlighted_texts
        except Exception as e:
            print(f"Warning: Could not detect color highlights (fitz): {e}")
            return []

    def _get_checked_text_items(self):
        """
        Use pdfplumber to find text that clearly contains [X], [✓], or [/].
        Returns a list of strings containing these markers.
        """
        try:
            checked_items = []
            with pdfplumber.open(io.BytesIO(self.pdf_buffer)) as pdf:
                for page in pdf.pages:
                    text = page.extract_text()
                    if not text:
                        continue
                    
                    # Regex to find brackets containing X, checkmarks, or slash (case insensitive)
                    for line in text.split('\n'):
                        if re.search(r'\[(x|X|✓|√|✔|v|V|/)\]', line):
                            checked_items.append(line.strip())
            return checked_items
        except Exception as e:
            print(f"Warning: Could not detect text checks (pdfplumber): {e}")
            return []

    def extract_paper_category(self):
        """Extract paper category - Handles [X], [✓], [/], and other markups, then fallback to highlighted color."""
        if not self.text:
            return None
        
        categories = ["Completed", "Ongoing"]
        
        # 1. Existing text checks. Remove newlines from text first to avoid line break issues.
        normalized_text = re.sub(r'\s+', ' ', self.text)
        for cat in categories:
            if re.search(r'\[(x|X|✓|√|✔|v|V|/)\]\s*' + cat, normalized_text, re.IGNORECASE):
                return f"{cat} Extension Project Paper"

        # 2. Fallback: Check highlighted paragraphs (only if text check failed)
        highlighted_texts = self._get_highlighted_text_areas()
        for text in highlighted_texts:
            for cat in categories:
                if cat.lower() in text.lower():
                    return f"{cat} Extension Project Paper"
        
        # 3. Check via pdfplumber
        checked_items = self._get_checked_text_items()
        for item in checked_items:
            for cat in categories:
                if cat.lower() in item.lower():
                    return f"{cat} Extension Project Paper"

        return None

    def extract_thematic_area(self):
        """Extract thematic area - Handles [X], [✓], [/], and other markups, then fallback to highlighted color."""
        if not self.text:
            return None

        thematic_areas = [
            'Food Production, Agriculture, Fisheries, and Natural Resource Systems',
            'Health, Nutrition, Wellness, and Community Care',
            'Education, Literacy, Skills Development, and Lifelong Learning',
            'Livelihood, Entrepreneurship, Cooperatives, MSMEs, and Local Economic Development',
            'Environment, Climate Action, Disaster Risk Reduction, and Community Resilience'
        ]

        # 1. Existing text checks. Remove newlines from text first to avoid line break issues.
        normalized_text = re.sub(r'\s+', ' ', self.text)
        for area in thematic_areas:
            if re.search(r'\[(x|X|✓|√|✔|v|V|/)\]\s*' + re.escape(area), normalized_text, re.IGNORECASE):
                return area

        # 2. Fallback: Check highlighted paragraphs (only if text check failed)
        highlighted_texts = self._get_highlighted_text_areas()
        for text in highlighted_texts:
            text_clean = re.sub(r'^[\[\]xX✓√✔vV/\s]+', '', text).strip()
            for area in thematic_areas:
                if area.lower() in text_clean.lower():
                    return area

        # 3. Check via pdfplumber
        checked_items = self._get_checked_text_items()
        for item in checked_items:
            item_clean = re.sub(r'^[\[\]xX✓√✔vV/\s]+', '', item).strip()
            for area in thematic_areas:
                if area.lower() in item_clean.lower():
                    return area

        return None
    
    def extract_theme(self):
        """Extract theme - get the value after Theme:"""
        if not self.text:
            return None
        
        # Look for the theme, split by "Theme:" and stop at the next section
        theme_match = re.search(r'Theme\s*[:]\s*(.*?)(?=\s*(?:Instructions|A\.|1\.|$))', self.text, re.IGNORECASE | re.DOTALL)
        if theme_match:
            theme = theme_match.group(1).strip()
            theme = re.sub(r'\s+', ' ', theme) # Flatten multi-line themes
            theme = re.sub(r'\s*(?:Instructions|A\.|1\.).*$', '', theme, flags=re.IGNORECASE)
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