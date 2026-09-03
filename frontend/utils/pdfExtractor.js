// utils/pdfExtractor.js

import pdfParse from 'pdf-parse';

export const extractPDFData = async (pdfBuffer) => {
  try {
    const data = await pdfParse(pdfBuffer);
    const text = data.text;
    
    console.log('Extracted text from PDF:', text); // For debugging
    
    // Parse the extracted text to find specific fields
    const extractedData = {
      title: extractTitle(text),
      authors: extractAuthors(text),
      correspondingAuthor: extractCorrespondingAuthor(text),
      paperCategory: extractPaperCategory(text),
      thematicArea: extractThematicArea(text),
      // Additional fields that might be useful
      theme: extractTheme(text),
      titleEnglish: extractEnglishTitle(text),
    };
    
    return extractedData;
  } catch (error) {
    console.error('Error parsing PDF:', error);
    throw error;
  }
};

// Extract Title (both English and Filipino versions)
const extractTitle = (text) => {
  // Try to get the main title first
  const titleRegex = /Title of the Extension Project Paper:?\s*([^\n]+)/i;
  const match = text.match(titleRegex);
  
  if (match) {
    let title = match[1].trim();
    
    // If there's an English version, we'll store it separately
    // The main title is usually the Filipino version
    return title;
  }
  
  // Fallback: try to find title without the label
  const fallbackRegex = /^([A-Z][A-Z\s\-]+[A-Z])(?:\s*[\(-])?/m;
  const fallbackMatch = text.match(fallbackRegex);
  return fallbackMatch ? fallbackMatch[1].trim() : null;
};

// Extract English Title (if provided)
const extractEnglishTitle = (text) => {
  const regex = /English Version:?\s*([^\n]+)/i;
  const match = text.match(regex);
  return match ? match[1].trim() : null;
};

// Extract Authors and Institutional Affiliations
const extractAuthors = (text) => {
  // Look for the authors section
  const regex = /Author\/s and Institutional Affiliation\/s:?\s*([^\n]+(?:\s*[^\n]*?)(?=\s*(?:Name and Email|Theme Area|Paper Information|$)))/i;
  const match = text.match(regex);
  
  if (match) {
    let authorsText = match[1].trim();
    
    // Parse authors to identify project leader
    const authorList = authorsText.split(/[,;]\s*/).filter(a => a.trim());
    
    // Check if there's an asterisk indicating project leader
    const projectLeader = authorList.find(a => a.includes('*'));
    const allAuthors = authorList.map(a => a.replace('*', '').trim());
    
    return {
      full: authorsText,
      list: allAuthors,
      projectLeader: projectLeader ? projectLeader.replace('*', '').trim() : null,
      isProjectLeader: !!projectLeader
    };
  }
  
  // Fallback: look for authors after "Author/s"
  const fallbackRegex = /Author\/?s?[:\s]+([^\n]+)/i;
  const fallbackMatch = text.match(fallbackRegex);
  return fallbackMatch ? { 
    full: fallbackMatch[1].trim(), 
    list: fallbackMatch[1].trim().split(/[,;]\s*/).filter(a => a.trim()),
    projectLeader: null,
    isProjectLeader: false
  } : null;
};

// Extract Corresponding Author Name and Email
const extractCorrespondingAuthor = (text) => {
  const regex = /Name and Email Address of Corresponding Author:?\s*([^\n]+)/i;
  const match = text.match(regex);
  
  if (match) {
    const info = match[1].trim();
    
    // Try to extract email
    const emailRegex = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i;
    const emailMatch = info.match(emailRegex);
    
    return {
      full: info,
      name: emailMatch ? info.replace(emailMatch[0], '').trim() : info,
      email: emailMatch ? emailMatch[0] : null
    };
  }
  
  return null;
};

// Extract Paper Category (Completed or Ongoing)
const extractPaperCategory = (text) => {
  // Look for checked checkbox
  const checkedRegex = /\[[xX]\][\s]*([^\n]+?)(?=(?:\[[xX]\]|\n|$))/i;
  const match = text.match(checkedRegex);
  
  if (match) {
    const category = match[1].trim();
    // Check if it's Completed or Ongoing
    if (/completed/i.test(category)) {
      return 'Completed Extension Project Paper';
    } else if (/ongoing/i.test(category)) {
      return 'Ongoing Extension Project Paper';
    }
    return category;
  }
  
  // Fallback: try to find the selected category
  const categorySection = text.match(/Paper Category:?\s*([^\n]*?)(?:[\[xX\]]\s*([^\n]+))?/i);
  if (categorySection) {
    // Check which one is checked
    const allCategories = text.match(/\[[ xX]\]\s*(Completed|Ongoing) Extension Project Paper/gi);
    if (allCategories) {
      for (let cat of allCategories) {
        if (cat.includes('x') || cat.includes('X')) {
          const categoryMatch = cat.match(/(Completed|Ongoing)/i);
          return categoryMatch ? `${categoryMatch[1]} Extension Project Paper` : null;
        }
      }
    }
  }
  
  return null;
};

// Extract Thematic Area
const extractThematicArea = (text) => {
  // Look for checked thematic area
  const thematicAreas = [
    'Food Production, Agriculture, Fisheries, and Natural Resource Systems',
    'Health, Nutrition, Wellness, and Community Care',
    'Education, Literacy, Skills Development, and Lifelong Learning',
    'Livelihood, Entrepreneurship, Cooperatives, MSMEs, and Local Economic Development',
    'Environment, Climate Action, Disaster Risk Reduction, and Community Resilience'
  ];
  
  // Check which thematic area is checked
  for (let area of thematicAreas) {
    // Look for the checkbox pattern with this area
    const regex = new RegExp(`\\[[xX]\\]\\s*${area.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'i');
    if (regex.test(text)) {
      return area;
    }
  }
  
  // Fallback: try to find in thematic area section
  const thematicSection = text.match(/Thematic Area:?\s*([^\n]*?)(?:\[[xX]\]\s*([^\n]+))?/i);
  if (thematicSection) {
    for (let area of thematicAreas) {
      if (thematicSection[0].includes(area)) {
        return area;
      }
    }
  }
  
  return null;
};

// Extract Theme (optional)
const extractTheme = (text) => {
  const regex = /Theme:?\s*([^\n]+)/i;
  const match = text.match(regex);
  return match ? match[1].trim() : null;
};

// Helper function to clean extracted text
const cleanText = (text) => {
  if (!text) return null;
  return text.replace(/\s+/g, ' ').trim();
};

// Complete extraction with validation
export const extractAndValidatePDF = async (pdfBuffer) => {
  const extracted = await extractPDFData(pdfBuffer);
  
  // Validate required fields
  const validation = {
    isValid: true,
    errors: [],
    warnings: []
  };
  
  if (!extracted.title) {
    validation.isValid = false;
    validation.errors.push('Title not found in PDF');
  }
  
  if (!extracted.authors || !extracted.authors.full) {
    validation.isValid = false;
    validation.errors.push('Authors not found in PDF');
  }
  
  if (!extracted.paperCategory) {
    validation.warnings.push('Paper category not clearly identified');
  }
  
  if (!extracted.thematicArea) {
    validation.warnings.push('Thematic area not clearly identified');
  }
  
  return {
    data: extracted,
    validation
  };
};

// Example usage with email attachment
export const processEmailAttachment = async (attachmentBuffer) => {
  try {
    const result = await extractAndValidatePDF(attachmentBuffer);
    
    if (result.validation.isValid) {
      console.log('Extracted Data:', result.data);
      console.log('Validation:', result.validation);
      
      // Map to your submission format
      const submissionData = {
        extension_project_title: result.data.title || 'Untitled',
        author: result.data.authors?.projectLeader || result.data.authors?.list?.[0] || 'Unknown',
        co_authors: result.data.authors?.list?.slice(1).join(', ') || '',
        paper_category: result.data.paperCategory || 'Not Specified',
        thematic_area: result.data.thematicArea || 'Not Specified',
        corresponding_author: result.data.correspondingAuthor?.name || '',
        corresponding_email: result.data.correspondingAuthor?.email || '',
        // Additional fields
        title_english: result.data.titleEnglish || '',
        theme: result.data.theme || '',
      };
      
      return {
        success: true,
        data: submissionData,
        extracted: result.data,
        validation: result.validation
      };
    } else {
      return {
        success: false,
        errors: result.validation.errors,
        warnings: result.validation.warnings,
        data: result.data
      };
    }
  } catch (error) {
    console.error('Error processing attachment:', error);
    return {
      success: false,
      error: error.message
    };
  }
};