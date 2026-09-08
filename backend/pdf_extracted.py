import io
import re
import PyPDF2
from pdfminer.high_level import extract_text as pdfminer_extract_text
import pymupdf as fitz  
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
        """Extract main title - robustly handles multi-line text, table structures, and standard abstracts."""
        if not self.text:
            return None
        
        # 1. First, try to get the EXACT cell content using PyMuPDF tables
        table_data = self._get_pdf_table_rows()
        if table_data.get('title'):
            return table_data['title']
        
        # 2. Check if it's a Standard Abstract (has "ABSTRACT" or "SDG" in the first 500 chars)
        normalized_text = re.sub(r'\s+', ' ', self.text)
        if 'ABSTRACT' in normalized_text[:500] or 'SDG' in normalized_text[:500]:
            # Extract the title: find the first line that is not a header or abstract
            # The title is usually the first 1-2 lines before the authors
            lines = [line.strip() for line in self.text.split('\n') if line.strip()]
            
            # Skip the first few lines if they're headers (like "ABSTRACT TEMPLATE")
            # Find the first line that has letters and is not 'Abstract', 'Keywords', etc.
            title_lines = []
            for line in lines:
                if not line: continue
                if re.search(r'^(ABSTRACT|KEYWORDS|Keywords|SDG)', line, re.IGNORECASE): 
                    break
                if re.search(r'^(MA\.|RHODA|ALJUN|DAVAO)', line): # Skip author names or SUCs
                    break
                if len(line) > 10 and not re.search(r'^\d+\.\s', line): # Skip numbered list
                    title_lines.append(line)
                if len(title_lines) >= 2:
                    break
            
            if title_lines:
                return ' '.join(title_lines)
        
        # 3. Fallback to text regex for table format
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

        # 2. Standard Abstract Format (like in your image)
        normalized_text = re.sub(r'\s+', ' ', self.text)
        if 'ABSTRACT' in normalized_text[:500] or 'SDG' in normalized_text[:500]:
            lines = [line.strip() for line in self.text.split('\n') if line.strip()]
            
            # Look for lines that are pure Author Names (Capital Letters with Degrees)
            author_lines = []
            for line in lines:
                # Match patterns like: "MA. ERWYNYAH E. CARAOA, DBA"
                if re.match(r'^[A-Z][A-Za-z\.\s]*,?\s*(DBA|MABM|MBA|PhD|Ph\.D|EdD|M\.D|MA|MSc|BS|MS)\s*$', line, re.IGNORECASE):
                    author_lines.append(line)
                # Match patterns like: "DR. JOHN DOE"
                elif re.match(r'^(DR\.|PROF\.|MR\.|MS\.|MRS\.)\s+[A-Z]', line, re.IGNORECASE) and len(line) < 50:
                    author_lines.append(line)
            
            if author_lines:
                # Parse the found author lines
                full_text = '; '.join(author_lines)
                authors_list = []
                
                # Remove degrees for the list
                for author in author_lines:
                    clean_author = re.sub(r',\s*(DBA|MABM|MBA|PhD|Ph\.D|EdD|M\.D|MA|MSc|BS|MS)\s*$', '', author).strip()
                    if clean_author:
                        authors_list.append(clean_author)
                
                # Assume the first author is the Project Leader
                project_leader = authors_list[0] if authors_list else None
                
                return {
                    'full_text': full_text,
                    'list': authors_list,
                    'project_leader': project_leader,
                    'institution': None
                }

        # 3. Fallback to text regex if table extraction failed
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

    def extract_sucs(self):
        """Extract SUCs - Case-insensitive. Uses updated DB names. Removes longer names first so shorter names CANNOT falsely match."""
        if not self.text:
            return None
        
        # Normalize text to handle extra spaces and keep a version for case-insensitive matching
        normalized_text = re.sub(r'\s+', ' ', self.text)
        normalized_text_lower = normalized_text.lower()  # Lowercase for searching
        
        # EXACT UPDATED FULL SUC names from the database table
        suc_names = [
            # National Capital Region
            "University of the Philippines",
            "Polytechnic University of the Philippines",
            "Technological University of the Philippines",
            "Philippine Normal University",
            "National Aviation Academy of the Philippines",
            "Eulogio \"Amang\" Rodriguez Institute of Science and Technology",
            "Marikina Polytechnic College",
            "Rizal Technological University",
            # Ilocos Region
            "Don Mariano Marcos Memorial State University",
            "University of Ilocos Philippines",
            "Mariano Marcos State University",
            "Pangasinan State University",
            "University of Northern Philippines",
            # Cordillera Administrative Region
            "Apayao State College",
            "Benguet State University",
            "Ifugao State University",
            "Kalinga State University",
            "Mountain Province State University",
            "Philippine Military Academy",
            "University of Abra",
            # Cagayan Valley
            "Batanes State College",
            "Cagayan State University",
            "Isabela State University",
            "Nueva Vizcaya State University",
            "Quirino State University",
            # Central Luzon
            "Aurora State College of Technology",
            "Bataan Peninsula State University",
            "Bulacan State Agricultural University",
            "Bulacan State University",
            "Central Luzon State University",
            "Pampanga State University",
            "Nueva Ecija University of Science and Technology",
            "Pampanga State Agricultural University",
            "Philippine Merchant Marine Academy",
            "President Ramon Magsaysay State University",
            "Tarlac Agricultural University",
            "Tarlac State University",
            # Calabarzon
            "Batangas State University",
            "Cavite State University",
            "Laguna State Polytechnic University",
            "Southern Luzon State University",
            "University of Rizal System",
            # Mimaropa
            "Marinduque State University",
            "Mindoro State University",
            "Occidental Mindoro State University",
            "Palawan State University",
            "Romblon State University",
            "Western Philippines University",
            # Bicol Region
            "Bicol University",
            "University of Camarines Norte",
            "Camarines Sur Polytechnic Colleges",
            "Catanduanes State University",
            "Central Bicol State University of Agriculture",
            "Dr. Emilio B. Espinosa Sr. Memorial State College of Agriculture and Technology",
            "Partido State University",
            "Sorsogon State University",
            "Southeast Asian University of Technology",
            # Western Visayas
            "Aklan State University",
            "Capiz State University",
            "Guimaras State University",
            "Iloilo Science and Technology University",
            "Iloilo State University of Fisheries Science and Technology",
            "Northern Iloilo State University",
            "University of Antique",
            "University of the Philippines Visayas",
            "West Visayas State University",
            # Negros Island Region
            "Philippine Normal University Visayas",
            "State University of Northern Negros",
            "Carlos Hilado Memorial State University",
            "Central Philippines State University",
            "Technological University of the Philippines Visayas",
            "Negros Oriental State University",
            "Siquijor State College",
            # Central Visayas
            "Bohol Island State University",
            "Cebu Normal University",
            "Cebu Technological University",
            "University of the Philippines Cebu",
            # Eastern Visayas
            "Biliran Province State University",
            "Eastern Samar State University",
            "Eastern Visayas State University",
            "Leyte Normal University",
            "Northwest Samar State University",
            "Palompon Institute of Technology",
            "Samar State University",
            "Southern Leyte State University",
            "University of Eastern Philippines",
            "University of the Philippines Tacloban",
            "Visayas State University",
            # Zamboanga Peninsula
            "Zamboanga del Sur State University",
            "Zamboanga del Sur Polytechnic State College",
            "Jose Rizal Memorial State University",
            "Mindanao State University–Zamboanga Sibugay",
            "Sulu State University",
            "Western Mindanao State University",
            "Zamboanga Peninsula Polytechnic State University",
            "Zamboanga State College of Marine Sciences and Technology",
            # Northern Mindanao
            "Bukidnon State University",
            "Camiguin Polytechnic State College",
            "Central Mindanao University",
            "Iligan City Polytechnic State College",
            "Mindanao State University–Iligan Institute of Technology",
            "Mindanao State University–Sultan Naga Dimaporo",
            "Misamis Occidental State College",
            "Northern Bukidnon State College",
            "University of Northwestern Mindanao",
            "University of Science and Technology of Southern Philippines",
            # Davao Region
            "Davao de Oro State College",
            "Davao del Norte State College",
            "Davao del Sur State College",
            "Davao Oriental State University",
            "Southern Philippines Agri-Business and Marine and Aquatic School of Technology",
            "University of Southeastern Philippines",
            # Soccsksargen
            "Cotabato Foundation College of Science and Technology",
            "University of Southern Mindanao",
            "Mindanao State University–General Santos",
            "South Cotabato State College",
            "Sultan Kudarat State University",
            # Caraga
            "Agusan del Sur State University",
            "Caraga State University",
            "North Eastern Mindanao State University",
            "Surigao del Norte State University",
            # Bangsamoro
            "Adiong Memorial State College",
            "Basilan State University",
            "Cotabato State University",
            "Mindanao State University–Maguindanao",
            "Mindanao State University Main",
            "Mindanao State University–Tawi-Tawi College of Technology and Oceanography",
            "Tawi-Tawi Regional Agricultural College"
        ]

        # CRITICAL: Sort by length (longest first)
        suc_names.sort(key=len, reverse=True)
        
        found_sucs = []
        remaining_text_lower = normalized_text_lower  # Work on the lowercase version to prevent short matches
        
        for name in suc_names:
            name_lower = name.lower()
            
            # Check if the full name exists in the CURRENT remaining text (case-insensitive)
            if name_lower in remaining_text_lower:
                found_sucs.append(name)
                
                # CRITICAL: Remove this longer name from the text
                remaining_text_lower = remaining_text_lower.replace(name_lower, '')
        
        if found_sucs:
            return ', '.join(found_sucs) 
        
        # Fallback: Look for text right after authors (if exact table matching fails)
        authors_data = self.extract_authors()
        if authors_data and authors_data.get('institution'):
            return authors_data['institution']
            
        return None
    
    def extract_corresponding_author_position(self):
        """Extract corresponding author's position (Professor, Dean, etc.)"""
        if not self.text:
            return None
        
        # Normalize text
        normalized_text = re.sub(r'\s+', ' ', self.text)
        
        positions = [
            'Professor', 'Associate Professor', 'Assistant Professor', 'Instructor', 
            'Dean', 'Director', 'Chairperson', 'Department Head', 'Registrar', 
            'Extension Coordinator', 'Research Director', 'Campus Director'
        ]
        
        corr_author = self.extract_corresponding_author()
        if corr_author and corr_author.get('name'):
            # Find the section around the corresponding author
            name = re.escape(corr_author['name'])
            pattern = rf'{name}[^|]*?({ "|".join(positions) })'
            match = re.search(pattern, normalized_text, re.IGNORECASE)
            if match:
                return match.group(1).strip()
        
        # Fallback: Search anywhere in the document
        for pos in positions:
            match = re.search(rf'\b{re.escape(pos)}\b', normalized_text, re.IGNORECASE)
            if match:
                return match.group(0)
                
        return None
    
    def _get_highlighted_text_areas(self):
        """
        Use PyMuPDF (fitz) to find areas with a highlight background color.
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
                        # Check if it's yellow or any color (not white/transparent)
                        # Yellow: r>0.8, g>0.8, b<0.4
                        # Also check for other colors like gray, light yellow, etc.
                        if (r > 0.7 and g > 0.7 and b < 0.5) or (r < 0.9 and g < 0.9 and b < 0.9 and drawing.get("fill")):
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

                # 3. NEW: Use PyMuPDF to find highlighted text by color
                # Get all text blocks and check if they have a highlight color
                page_dict = page.get_text("dict")
                for block in page_dict.get("blocks", []):
                    if block.get("type") == 0:  # Text block
                        for line in block.get("lines", []):
                            for span in line.get("spans", []):
                                # Check for text highlight color in the span
                                # PyMuPDF stores highlight color in 'color' field
                                # Sometimes it's in the span's 'flags' or 'color'
                                # Let's check for non-black, non-white text colors
                                if span.get("color") is not None:
                                    # Check if text has a background highlight
                                    # This is usually detected by looking at the annotation
                                    pass  # Fall through to other methods

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
                    # This now handles [ /] with spaces
                    for line in text.split('\n'):
                        if re.search(r'\[(\s*)(x|X|✓|√|✔|v|V|/)(\s*)\]', line):
                            checked_items.append(line.strip())
            return checked_items
        except Exception as e:
            print(f"Warning: Could not detect text checks (pdfplumber): {e}")
            return []

    def _detect_checked_checkbox_by_position(self):
        """
        NEW METHOD: Detect checked checkboxes by analyzing text positions and colors.
        This is the most reliable way to detect checkboxes with color fill.
        """
        try:
            doc = fitz.open(stream=self.pdf_buffer, filetype="pdf")
            checked_items = []
            
            categories = ["Completed", "Ongoing"]
            thematic_areas = [
                'Food Production, Agriculture, Fisheries, and Natural Resource Systems',
                'Health, Nutrition, Wellness, and Community Care',
                'Education, Literacy, Skills Development, and Lifelong Learning',
                'Livelihood, Entrepreneurship, Cooperatives, MSMEs, and Local Economic Development',
                'Environment, Climate Action, Disaster Risk Reduction, and Community Resilience'
            ]
            
            for page in doc:
                # Get all text spans with their positions
                page_dict = page.get_text("dict")
                spans_data = []
                
                for block in page_dict.get("blocks", []):
                    if block.get("type") == 0:  # Text block
                        for line in block.get("lines", []):
                            for span in line.get("spans", []):
                                text = span.get("text", "")
                                if text.strip():
                                    bbox = span.get("bbox", [])
                                    # Store span info with position
                                    spans_data.append({
                                        'text': text,
                                        'bbox': bbox,
                                        'size': span.get("size", 0),
                                        'font': span.get("font", "")
                                    })
                
                # Get drawings (rectangles) for checkbox detection
                drawings = page.get_drawings()
                checkbox_rects = []
                
                for drawing in drawings:
                    if drawing.get("fill"):
                        r, g, b = drawing["fill"]
                        # Check if it's a colored fill (not white or transparent)
                        # This could be yellow, blue, gray, etc.
                        if (r > 0.3 and g > 0.3 and b > 0.3) or (r > 0.8 and g > 0.8 and b < 0.5):
                            rect = drawing["rect"]
                            checkbox_rects.append({
                                'rect': rect,
                                'fill': (r, g, b)
                            })
                
                # For each text span, check if it's near a checkbox rect
                for span in spans_data:
                    text = span['text']
                    span_bbox = fitz.Rect(span['bbox'])
                    
                    # Check if span contains categories or thematic areas
                    all_options = categories + thematic_areas
                    
                    for option in all_options:
                        if option.lower() in text.lower():
                            # Check if there's a checkbox rect near this text
                            for cb in checkbox_rects:
                                cb_rect = cb['rect']
                                # Check if checkbox is on the same line (vertical overlap)
                                if cb_rect.y0 < span_bbox.y1 and cb_rect.y1 > span_bbox.y0:
                                    # Check if checkbox is to the left of the text
                                    if cb_rect.x1 <= span_bbox.x0 + 50:  # Within 50 units to the left
                                        # Check if checkbox has a colored fill (indicates it's checked)
                                        if self._is_colored_fill(cb['fill']):
                                            checked_items.append(text.strip())
                                            break
                                    
                            # Also check for text-based markers (including [ /] with space)
                            if re.search(r'\[(\s*)(x|X|✓|√|✔|v|V|/)(\s*)\]', text):
                                checked_items.append(text.strip())
                                break
            
            doc.close()
            return checked_items
        except Exception as e:
            print(f"Warning: Could not detect checkboxes by position: {e}")
            return []

    def _is_colored_fill(self, fill_color):
        """Check if a fill color indicates a checked checkbox (not white or transparent)"""
        r, g, b = fill_color
        # Check if it's not white/transparent (0.95+ for all channels)
        if r > 0.9 and g > 0.9 and b > 0.9:
            return False
        # Check if it's yellow (common highlight color)
        if r > 0.7 and g > 0.7 and b < 0.5:
            return True
        # Check if it's gray (common for checkbox)
        if 0.3 < r < 0.8 and 0.3 < g < 0.8 and 0.3 < b < 0.8 and abs(r-g) < 0.1 and abs(g-b) < 0.1:
            return True
        return False

    def _get_highlighted_text_areas_v2(self):
        """
        NEW: Enhanced version that uses PyMuPDF to find text with any colored background.
        Returns a list of strings found in highlighted areas.
        """
        try:
            doc = fitz.open(stream=self.pdf_buffer, filetype="pdf")
            highlighted_texts = []

            for page in doc:
                # 1. Check for text annotations with color
                for annotation in page.annots() or []:
                    if annotation.type[0] == 8:  # Highlight annotation
                        text = annotation.info.get("content", "").strip()
                        if text:
                            highlighted_texts.append(text)
                    
                    # Check for any annotation with a colored border or fill
                    if annotation.type[0] == 1:  # Text annotation
                        text = annotation.info.get("content", "").strip()
                        if text:
                            highlighted_texts.append(text)

                # 2. Check for colored shapes/rectangles that contain text
                for drawing in page.get_drawings():
                    if drawing.get("fill"):
                        r, g, b = drawing["fill"]
                        # Check if it's a colored fill (yellow, blue, green, etc.)
                        if not (r > 0.95 and g > 0.95 and b > 0.95):  # Not white
                            if not (r < 0.1 and g < 0.1 and b < 0.1):  # Not black
                                rect = drawing["rect"]
                                # Get text within this rect
                                text = page.get_text("text", clip=rect).strip()
                                if text:
                                    highlighted_texts.append(text)

                # 3. Check for text with color spans (non-black non-white)
                page_dict = page.get_text("dict")
                for block in page_dict.get("blocks", []):
                    if block.get("type") == 0:
                        for line in block.get("lines", []):
                            for span in line.get("spans", []):
                                # Check if span has a background color or colored text
                                if span.get("color") is not None and span.get("color") != 0:
                                    # Not black text
                                    color_val = span.get("color", 0)
                                    # Check if it's not standard black text
                                    if color_val not in [0, 0x000000]:  # Not black
                                        text = span.get("text", "")
                                        if text.strip():
                                            highlighted_texts.append(text.strip())

            doc.close()
            return highlighted_texts
        except Exception as e:
            print(f"Warning: Could not detect highlights v2: {e}")
            return []

    def extract_paper_category(self):
        """Extract paper category - Handles [X], [✓], [/], [ /], and other markups, then fallback to highlighted color."""
        if not self.text:
            return None
        
        categories = ["Completed", "Ongoing"]
        
        # 1. Existing text checks. Remove newlines from text first to avoid line break issues.
        normalized_text = re.sub(r'\s+', ' ', self.text)
        
        # IF THIS IS A STANDARD ABSTRACT (NO TEMPLATE), RETURN NULL IMMEDIATELY
        if 'ABSTRACT' in normalized_text[:500] and 'Paper Category' not in normalized_text:
            return None
        
        # 2. Check for text markers: [X], [x], [/], [ /], [✓], etc. - This now handles spaces
        # Updated regex to allow spaces inside brackets: [ /], [x ], [ x], etc.
        for cat in categories:
            if re.search(r'\[(\s*)(x|X|✓|√|✔|v|V|/)(\s*)\]\s*' + cat, normalized_text, re.IGNORECASE):
                return f"{cat} Extension Project Paper"
        
        # 3. NEW: Check for highlighted checkboxes using PyMuPDF position detection
        checked_items = self._detect_checked_checkbox_by_position()
        for item in checked_items:
            for cat in categories:
                if cat.lower() in item.lower():
                    return f"{cat} Extension Project Paper"

        # 4. Fallback: Check highlighted paragraphs
        highlighted_texts = self._get_highlighted_text_areas() + self._get_highlighted_text_areas_v2()
        for text in highlighted_texts:
            for cat in categories:
                if cat.lower() in text.lower():
                    return f"{cat} Extension Project Paper"
        
        # 5. Check via pdfplumber
        checked_items = self._get_checked_text_items()
        for item in checked_items:
            for cat in categories:
                if cat.lower() in item.lower():
                    return f"{cat} Extension Project Paper"

        return None

    def extract_thematic_area(self):
        """Extract thematic area - Handles [X], [✓], [/], [ /], and other markups, then fallback to highlighted color."""
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
        
        # IF THIS IS A STANDARD ABSTRACT (NO TEMPLATE), RETURN NULL IMMEDIATELY
        if 'ABSTRACT' in normalized_text[:500] and 'Thematic Area' not in normalized_text:
            return None
        
        # 2. Check for text markers: [X], [x], [/], [ /], [✓], etc. - This now handles spaces
        # Updated regex to allow spaces inside brackets: [ /], [x ], [ x], etc.
        for area in thematic_areas:
            if re.search(r'\[(\s*)(x|X|✓|√|✔|v|V|/)(\s*)\]\s*' + re.escape(area), normalized_text, re.IGNORECASE):
                return area

        # 3. NEW: Check for highlighted checkboxes using PyMuPDF position detection
        checked_items = self._detect_checked_checkbox_by_position()
        for item in checked_items:
            item_clean = re.sub(r'^[\[\]xX✓√✔vV/\s]+', '', item).strip()
            for area in thematic_areas:
                if area.lower() in item_clean.lower():
                    return area

        # 4. Fallback: Check highlighted paragraphs
        highlighted_texts = self._get_highlighted_text_areas() + self._get_highlighted_text_areas_v2()
        for text in highlighted_texts:
            text_clean = re.sub(r'^[\[\]xX✓√✔vV/\s]+', '', text).strip()
            for area in thematic_areas:
                if area.lower() in text_clean.lower():
                    return area

        # 5. Check via pdfplumber
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
        
        # Fallback for Standard Abstract with SDG at the end
        sdg_match = re.search(r'(SDG\s*[:#]?\s*\d+.*)', self.text, re.IGNORECASE)
        if sdg_match:
            return sdg_match.group(1).strip()
        
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
                'sucs': self.extract_sucs(),
                'corresponding_author_position': self.extract_corresponding_author_position(),
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