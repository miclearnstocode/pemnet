"use client";

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignOutAlt } from '@fortawesome/free-solid-svg-icons';

const thematicAreas = [
  "Food Production, Agricultural, Fisheries, and Natural Resource Systems",
  "Health, Nutrition, Wellness, and Community Care",
  "Education, Literacy, Skills Development, and Lifelong Learning",
  "Livelihood, Entrepreneurships; Cooperatives, MSMEs, and Local Economic Development",
  "Environment, Climate Action, Disaster Risk Reduction, and Community Resilience"
];

const paperCategories = [
  "Completed Extension Project Papers",
  "Ongoing Extension Project Papers"
];

const API_URL = (process.env.NEXT_PUBLIC_API_URL).replace(/\/+$/, '');

// Toast Component
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = type === 'success' ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200';
  const textColor = type === 'success' ? 'text-emerald-700' : 'text-red-700';
  const iconColor = type === 'success' ? 'text-emerald-700' : 'text-red-700';
  const progressColor = type === 'success' ? 'bg-emerald-500' : 'bg-red-500';

  return (
    <div className="fixed top-20 right-4 z-9999 animate-slide-in">
      <div className={`relative w-96 max-w-[calc(100vw-2rem)] p-4 rounded-xl border shadow-2xl ${bgColor}`}>
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-100 rounded-b-xl overflow-hidden">
          <div className={`h-full ${progressColor} animate-progress-shrink`}></div>
        </div>
        
        <div className="flex items-start gap-3">
          <div className={`shrink-0 mt-0.5 ${iconColor}`}>
            {type === 'success' ? (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
            )}
          </div>
          <div className={`flex-1 ${textColor}`}>
            <p className="font-semibold text-sm">
              {type === 'success' ? 'Success!' : 'Error!'}
            </p>
            <p className="text-sm">{message}</p>
          </div>
          <button 
            onClick={onClose}
            className={`shrink-0 ${textColor} hover:opacity-70 transition`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

// File Viewer Modal Component
const FileViewerModal = ({ isOpen, onClose, fileUrl, fileType, title }) => {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !fileUrl) return null;

  // Convert Google Drive view URL to preview URL
  const getPreviewUrl = (url) => {
    if (!url) return '';
    // Handle Google Drive URLs
    const driveMatch = url.match(/\/file\/d\/([^/]+)/);
    if (driveMatch && driveMatch[1]) {
      return `https://drive.google.com/file/d/${driveMatch[1]}/preview`;
    }
    // If it's already a preview or other URL, use as-is
    return url;
  };

  const previewUrl = getPreviewUrl(fileUrl);

  return (
    <div 
      className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-3 min-w-0">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              fileType === 'abstract' ? 'bg-blue-100' : 'bg-emerald-100'
            }`}>
              {fileType === 'abstract' ? (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-blue-600">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-emerald-600">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
                </svg>
              )}
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-slate-900 truncate">
                {fileType === 'abstract' ? 'Abstract Document' : 'Endorsement Document'}
              </h3>
              <p className="text-xs text-slate-500 truncate">{title}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <a
              href={fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded-lg transition"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
              </svg>
              Open in Drive
            </a>
            <button
              onClick={onClose}
              className="w-9 h-9 flex items-center justify-center rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition"
              title="Close (Esc)"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Body - Embedded Preview */}
        <div className="flex-1 bg-slate-100 relative">
          <iframe
            src={previewUrl}
            className="w-full h-full"
            title={fileType === 'abstract' ? 'Abstract Preview' : 'Endorsement Preview'}
            allow="autoplay"
          />
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span>Press <kbd className="px-1.5 py-0.5 bg-white border border-slate-300 rounded text-[10px] font-mono">Esc</kbd> to close</span>
          <a
            href={fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-700 font-semibold inline-flex items-center gap-1"
          >
            Open in new tab
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3 h-3">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
};

export default function SubmitPage() {
  const [activeTab, setActiveTab] = useState('submit');
  const [coAuthors, setCoAuthors] = useState(['']);
  const [chosenSuc, setChosenSuc] = useState('');
  const [showOtherSuc, setShowOtherSuc] = useState(false);
  const [otherSucName, setOtherSucName] = useState('');
  const [abstractFile, setAbstractFile] = useState(null);
  const [endorsementFile, setEndorsementFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);
  const [user, setUser] = useState(null);
  const [sucList, setSucList] = useState([]);
  const [filteredSucList, setFilteredSucList] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoadingSucs, setIsLoadingSucs] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const [userSubmissions, setUserSubmissions] = useState([]);
  const [isLoadingSubmissions, setIsLoadingSubmissions] = useState(false);
  const [paymentFile, setPaymentFile] = useState(null);
  const [paymentData, setPaymentData] = useState(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [referenceNumber, setReferenceNumber] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentDate, setPaymentDate] = useState('');
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [isUploadingPayment, setIsUploadingPayment] = useState(false);
  const [userPayments, setUserPayments] = useState([]);
  const [selectedSubmission, setSelectedSubmission] = useState(null);

  // File viewer modal state
  const [viewerModal, setViewerModal] = useState({
    isOpen: false,
    fileUrl: '',
    fileType: '', // 'abstract' | 'endorsement'
    title: ''
  });

  // Accordion state
  const [openSections, setOpenSections] = useState([1]); // 1 is open by default

  const toggleSection = (sectionId) => {
    setOpenSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  // Open file viewer modal
  const openFileViewer = (fileUrl, fileType, title) => {
    if (!fileUrl) return;
    setViewerModal({
      isOpen: true,
      fileUrl,
      fileType,
      title: title || ''
    });
  };

  // Close file viewer modal
  const closeFileViewer = () => {
    setViewerModal({
      isOpen: false,
      fileUrl: '',
      fileType: '',
      title: ''
    });
  };

  useEffect(() => {
    const fetchSUCs = async () => {
      try {
        console.log('Fetching SUCs...');
        const response = await fetch(`${API_URL}/api/sucs`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('SUCs fetched:', data.length, 'items');
        
        if (Array.isArray(data)) {
          const sanitizedData = data.map((suc) => ({
            ...suc,
            region: suc.region || 'Unknown Region',
            name: suc.name || 'Unknown SUC'
          }));
          
          setSucList(sanitizedData);
          setFilteredSucList(sanitizedData);
        } else {
          console.error('Unexpected data format:', data);
          setSucList([]);
          setFilteredSucList([]);
        }
      } catch (error) {
        console.error('Error fetching SUCs:', error);
        setSucList([]);
        setFilteredSucList([]);
      } finally {
        setIsLoadingSucs(false);
      }
    };
    
    fetchSUCs();
  }, []);

  // Check if user is logged in - simply check localStorage for user data
  useEffect(() => {
    const userData = localStorage.getItem('pemnet_user');
    if (!userData) {
      window.location.href = '/login';
    } else {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        fetchUserSubmissions(parsedUser.id);
        fetchUserPayments(parsedUser.id);
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('pemnet_user');
        window.location.href = '/login';
      }
    }
  }, []);

  const fetchUserSubmissions = async (userId) => {
    setIsLoadingSubmissions(true);
    try {
      const response = await fetch(`${API_URL}/api/submissions/user/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setUserSubmissions(data);
      } else {
        console.error('Failed to fetch user submissions');
      }
    } catch (error) {
      console.error('Error fetching user submissions:', error);
    } finally {
      setIsLoadingSubmissions(false);
    }
  };

  const fetchUserPayments = async (userId) => {
    try {
      const response = await fetch(`${API_URL}/api/payments/user/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setUserPayments(data);
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter SUCs based on search term
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredSucList(sucList);
    } else {
      const filtered = sucList.filter(suc => 
        suc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (suc.abbreviation && suc.abbreviation.toLowerCase().includes(searchTerm.toLowerCase())) ||
        suc.region.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredSucList(filtered);
    }
  }, [searchTerm, sucList]);

  const checkPaymentStatus = async (submissionId) => {
    try {
      const response = await fetch(`${API_URL}/api/payments/submission/${submissionId}`);
      if (response.ok) {
        const data = await response.json();
        setPaymentData(data);
        if (data.exists) {
          setPaymentStatus(data.payment.payment_status);
        }
        return data;
      }
    } catch (error) {
      console.error('Error checking payment status:', error);
    }
    return null;
  };

  const handlePaymentUpload = async (e) => {
    e.preventDefault();
    if (!paymentFile || !selectedSubmission) {
      showToast('Please select a payment proof file', 'error');
      return;
    }
    
    setIsUploadingPayment(true);
    
    try {
      const userData = JSON.parse(localStorage.getItem('pemnet_user'));
      
      const formData = new FormData();
      formData.append('user_id', userData.id);
      formData.append('submission_id', selectedSubmission.id);
      formData.append('reference_number', referenceNumber);
      formData.append('payment_amount', paymentAmount);
      formData.append('payment_date', paymentDate);
      formData.append('payment_proof', paymentFile);
      
      const response = await fetch(`${API_URL}/api/payments/upload`, {
        method: 'POST',
        body: formData
      });
      
      if (response.ok) {
        const data = await response.json();
        showToast('Payment proof uploaded successfully!', 'success');
        setPaymentData(data);
        setPaymentStatus('pending');
        setPaymentFile(null);
        setReferenceNumber('');
        setPaymentAmount('');
        setPaymentDate('');
        fetchUserPayments(userData.id);
      } else {
        const error = await response.json();
        showToast(error.detail || 'Failed to upload payment proof', 'error');
      }
    } catch (error) {
      console.error('Error uploading payment:', error);
      showToast('Network error. Please try again.', 'error');
    } finally {
      setIsUploadingPayment(false);
    }
  };

  const showToast = (message, type) => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 5000);
  };

  const hideToast = () => {
    setToast(null);
  };

  const addCoAuthor = () => {
    setCoAuthors([...coAuthors, '']);
  };

  const removeCoAuthor = (index) => {
    const newCoAuthors = coAuthors.filter((_, i) => i !== index);
    setCoAuthors(newCoAuthors);
  };

  const handleCoAuthorChange = (index, value) => {
    const newCoAuthors = [...coAuthors];
    newCoAuthors[index] = value;
    setCoAuthors(newCoAuthors);
  };

  const handleSucSelect = (suc) => {
    setChosenSuc(suc.name);
    setShowOtherSuc(false);
    setShowDropdown(false);
    setSearchTerm(suc.name);
  };

  const handleOtherSucChange = (e) => {
    setOtherSucName(e.target.value);
    setChosenSuc(e.target.value);
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setShowDropdown(true);
  };

  const handleAddOther = () => {
    setShowOtherSuc(true);
    setShowDropdown(false);
    setSearchTerm('');
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setToast(null);

    // Check if user exists in localStorage
    const userData = localStorage.getItem('pemnet_user');
    if (!userData) {
      const errorMsg = 'You are not logged in. Please login again.';
      setError(errorMsg);
      showToast(errorMsg, 'error');
      setSubmitting(false);
      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);
      return;
    }

    let parsedUser;
    try {
      parsedUser = JSON.parse(userData);
    } catch (error) {
      console.error('Error parsing user data:', error);
      const errorMsg = 'Session error. Please login again.';
      setError(errorMsg);
      showToast(errorMsg, 'error');
      setSubmitting(false);
      localStorage.removeItem('pemnet_user');
      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);
      return;
    }

    if (!parsedUser || !parsedUser.id) {
      const errorMsg = 'Invalid user session. Please login again.';
      setError(errorMsg);
      showToast(errorMsg, 'error');
      setSubmitting(false);
      localStorage.removeItem('pemnet_user');
      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);
      return;
    }

    const formData = new FormData(e.target);
    const filteredCoAuthors = coAuthors.filter(c => c.trim() !== '');
    
    let finalSuc = chosenSuc;
    
    if (showOtherSuc) {
      finalSuc = otherSucName.trim();
      if (!finalSuc) {
        const errorMsg = "Please enter your SUC/Agency name.";
        setError(errorMsg);
        showToast(errorMsg, 'error');
        setSubmitting(false);
        return;
      }
    }

    if (!finalSuc) {
      const errorMsg = "Please select or enter your SUC/Agency.";
      setError(errorMsg);
      showToast(errorMsg, 'error');
      setSubmitting(false);
      return;
    }

    // Check if the SUC exists in the database, if not, add it
    const existingSuc = sucList.find(s => s.name.toLowerCase() === finalSuc.toLowerCase());
    if (!existingSuc && showOtherSuc) {
      try {
        const addResponse = await fetch(`${API_URL}/api/sucs`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: finalSuc,
            region: 'Other'
          })
        });

        if (addResponse.ok) {
          const newSuc = await addResponse.json();
          setSucList([...sucList, newSuc]);
          showToast('New SUC/Agency added to the database!', 'success');
        }
      } catch (error) {
        console.error('Error adding SUC:', error);
      }
    }

    // Build FormData for submission
    const submitData = new FormData();

    submitData.append('user_id', parsedUser.id);
    submitData.append('extension_project_title', formData.get('title'));
    submitData.append('thematic_area', formData.get('thematicArea'));
    submitData.append('paper_category', formData.get('paperCategory'));
    submitData.append('suc_agencies', finalSuc);
    submitData.append('project_leader', formData.get('project_leader'));
    submitData.append('presenter', formData.get('presenter'));
    submitData.append('corresponding_author_name', formData.get('correspondingAuthorName'));
    submitData.append('corresponding_author_position', formData.get('correspondingAuthorPosition'));
    submitData.append('corresponding_author_email', formData.get('correspondingAuthorEmail'));
    submitData.append('co_authors', filteredCoAuthors.length > 0 ? filteredCoAuthors.join(', ') : '');

    if (!abstractFile) {
      const errorMsg = 'Abstract PDF file is required.';
      setError(errorMsg);
      showToast(errorMsg, 'error');
      setSubmitting(false);
      return;
    }

    if (!endorsementFile) {
      const errorMsg = 'Endorsement PDF file is required.';
      setError(errorMsg);
      showToast(errorMsg, 'error');
      setSubmitting(false);
      return;
    }

    const safeAbstractName = abstractFile.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const safeAbstractFile = new File([abstractFile], safeAbstractName, { type: 'application/pdf' });
    submitData.append('abstract_file', safeAbstractFile);

    const safeEndorsementName = endorsementFile.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const safeEndorsementFile = new File([endorsementFile], safeEndorsementName, { type: 'application/pdf' });
    submitData.append('endorsement_file', safeEndorsementFile);

    console.log('Submitting data with user_id:', parsedUser.id);
    for (let pair of submitData.entries()) {
      if (pair[0].includes('file')) {
        console.log(pair[0] + ': ' + (pair[1]?.name || 'No file'));
      } else {
        console.log(pair[0] + ': ' + pair[1]);
      }
    }

    try {
      const res = await fetch(`${API_URL}/api/submit`, {
        method: 'POST',
        body: submitData,
      });

      console.log('Response status:', res.status);
      
      let data;
      const text = await res.text();
      console.log('Response text:', text);
      
      try {
        data = JSON.parse(text);
      } catch (parseError) {
        console.error('Failed to parse JSON:', text);
        throw new Error(`Server returned non-JSON response: ${text.substring(0, 100)}`);
      }

      if (res.ok) {
        console.log('Submission successful:', data);
        showToast('Abstract submitted successfully!', 'success');
        setAbstractFile(null);
        setEndorsementFile(null);
        setChosenSuc('');
        setSearchTerm('');
        setCoAuthors(['']);
        fetchUserSubmissions(parsedUser.id);
        setTimeout(() => {
          setActiveTab('my-submissions');
        }, 1000);
      } else {
        console.error('Submission failed:', data);
        const errorMsg = data.detail || data.error || data.msg || 'Submission failed. Please try again.';
        setError(errorMsg);
        showToast(errorMsg, 'error');
      }
    } catch (err) {
      console.error('Submission network error:', err);
      const errorMsg = err.message || 'Network error. Is the backend running on port 5000?';
      setError(errorMsg);
      showToast(errorMsg, 'error');
    } finally {
      setSubmitting(false);
    }
  }

  const renderSubmissions = () => {
    if (isLoadingSubmissions) {
      return (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent"></div>
        </div>
      );
    }

    if (userSubmissions.length === 0) {
      return (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-slate-400">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-slate-700">No Submissions Yet</h3>
          <p className="text-slate-500 text-sm mt-1">You haven't submitted any abstracts yet.</p>
          <button
            onClick={() => setActiveTab('submit')}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition"
          >
            Submit Your First Abstract
          </button>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {userSubmissions.map((submission) => {
          const isAccepted = submission.status === 'endorse';
          const existingPayment = userPayments.find(p => p.submission_id === submission.id);

          return (
            <div key={submission.id} className="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-md transition">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-slate-900 truncate">
                    {submission.extension_project_title}
                  </h3>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className="text-xs px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full">
                      {submission.thematic_area}
                    </span>
                    <span className="text-xs px-2.5 py-1 bg-purple-50 text-purple-700 rounded-full">
                      {submission.paper_category}
                    </span>
                    <span className={`text-xs px-2.5 py-1 rounded-full ${
                      submission.status === 'accepted' ? 'bg-emerald-50 text-emerald-700' :
                      submission.status === 'rejected' ? 'bg-red-50 text-red-700' :
                      'bg-yellow-50 text-yellow-700'
                    }`}>
                      {submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-4 mt-3 text-sm text-slate-600">
                    <span><span className="font-medium">Project Leader:</span> {submission.project_leader}</span>
                    <span><span className="font-medium">Presenter:</span> {submission.presenter}</span>
                    {submission.corresponding_author_name && (
                      <span><span className="font-medium">Corresponding Author:</span> {submission.corresponding_author_name}</span>
                    )}
                    {submission.corresponding_author_position && (
                      <span><span className="font-medium">Position:</span> {submission.corresponding_author_position}</span>
                    )}
                    {submission.suc_agencies && (
                      <span><span className="font-medium">SUC:</span> {submission.suc_agencies}</span>
                    )}
                  </div>
                  <div className="mt-3 text-xs text-slate-400">
                    Submitted: {new Date(submission.created_at).toLocaleString()}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  {submission.abstract_view_url && (
                    <button
                      type="button"
                      onClick={() => openFileViewer(
                        submission.abstract_view_url,
                        'abstract',
                        submission.extension_project_title
                      )}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium inline-flex items-center gap-1 hover:bg-blue-50 px-2 py-1 rounded-lg transition"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      View Abstract
                    </button>
                  )}
                  {submission.endorsement_view_url && (
                    <button
                      type="button"
                      onClick={() => openFileViewer(
                        submission.endorsement_view_url,
                        'endorsement',
                        submission.extension_project_title
                      )}
                      className="text-emerald-600 hover:text-emerald-700 text-sm font-medium inline-flex items-center gap-1 hover:bg-emerald-50 px-2 py-1 rounded-lg transition"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      View Endorsement
                    </button>
                  )}
                </div>
              </div>

              {/* Integrated Payment Section */}
              <div className="mt-4 pt-4 border-t border-slate-100">
                <div className="flex items-center gap-2 mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-slate-500">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
                  </svg>
                  <span className="font-semibold text-sm text-slate-700">Payment</span>
                </div>

                {!isAccepted ? (
                  <div className="flex items-center gap-2 text-slate-400 text-sm bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                    </svg>
                    Payment available once your submission is accepted.
                  </div>
                ) : existingPayment ? (
                   <div className={`p-3 rounded-lg border text-sm ${
                     existingPayment.payment_status === 'verified' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' :
                     existingPayment.payment_status === 'rejected' ? 'bg-red-50 border-red-200 text-red-700' :
                     'bg-yellow-50 border-yellow-200 text-yellow-700'
                   }`}>
                     <div className="flex items-center justify-between">
                       <span>Status: <strong>{existingPayment.payment_status.toUpperCase()}</strong></span>
                       {existingPayment.payment_proof_view_url && (
                         <a href={existingPayment.payment_proof_view_url} target="_blank" rel="noopener noreferrer" className="underline font-medium">View Proof</a>
                       )}
                     </div>
                     {existingPayment.payment_status === 'rejected' && existingPayment.rejection_reason && (
                       <p className="text-xs mt-1">Reason: {existingPayment.rejection_reason}</p>
                     )}
                   </div>
                ) : (
                  <form onSubmit={handlePaymentUpload} className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-3">
                    <p className="text-xs text-slate-500 mb-2">Please provide your payment details or upload proof of payment.</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">Reference Number *</label>
                        <input
                          type="text"
                          value={referenceNumber}
                          onChange={(e) => setReferenceNumber(e.target.value)}
                          placeholder="e.g. 1234567890"
                          className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm placeholder:text-gray-500 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">Amount (PHP) *</label>
                        <input
                          type="number"
                          value={paymentAmount}
                          onChange={(e) => setPaymentAmount(e.target.value)}
                          placeholder="e.g. 6500.00"
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm placeholder:text-gray-500 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">Date of Payment *</label>
                        <input
                          type="date"
                          value={paymentDate}
                          onChange={(e) => setPaymentDate(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none [&::-webkit-datetime-edit]:text-slate-500 [&::-webkit-datetime-edit-fields-wrapper]:text-slate-500 [&::-webkit-calendar-picker-indicator]:opacity-60"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Proof of Payment *</label>
                      <div className="border-2 border-dashed border-slate-300 rounded-lg p-3 text-center hover:border-blue-400 transition bg-white">
                        <input
                          type="file"
                          accept=".jpg,.jpeg,.png,.gif,.bmp,.webp,.pdf"
                          onChange={(e) => setPaymentFile(e.target.files[0])}
                          className="w-full text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-blue-600 file:text-white file:font-medium hover:file:bg-blue-700 cursor-pointer"
                          required
                        />
                        <p className="text-[10px] text-slate-400 mt-1">PDF, JPG, PNG (Max 5MB)</p>
                        {paymentFile && <p className="text-xs text-emerald-600 mt-1">{paymentFile.name}</p>}
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={isUploadingPayment || !paymentFile}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
                        </svg>
                        {isUploadingPayment ? 'Uploading...' : 'Submit Payment Details'}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  if (!user) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Toast Notification */}
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={hideToast} 
        />
      )}

      {/* File Viewer Modal */}
      <FileViewerModal
        isOpen={viewerModal.isOpen}
        onClose={closeFileViewer}
        fileUrl={viewerModal.fileUrl}
        fileType={viewerModal.fileType}
        title={viewerModal.title}
      />

      {/* --- SIDEBAR --- */}
      <aside className="w-64 bg-white border-r border-slate-100 hidden md:flex flex-col sticky top-0 h-screen">
        <div className="p-6 border-b border-slate-100 flex items-center gap-3">
          <div className="w-10 h-10 bg-linear-to-br from-blue-50 to-emerald-50 rounded-xl p-1.5 flex items-center justify-center">
            <img src="/images/pemnet_logo.png" alt="PEMNet Logo" width={32} height={32} className="object-contain" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 leading-tight">PEMNet</h1>
            <p className="text-[10px] text-slate-500 leading-tight">Philippine Extension and<br/>Management Network</p>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <button
            onClick={() => setActiveTab('home')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition ${
              activeTab === 'home' 
                ? 'bg-blue-50 text-blue-700' 
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
            </svg>
            Home
          </button>
          <button
            onClick={() => setActiveTab('submit')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition ${
              activeTab === 'submit' 
                ? 'bg-blue-50 text-blue-700' 
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
            Submit Abstract
          </button>
          <button
            onClick={() => {
              setActiveTab('my-submissions');
              fetchUserSubmissions(user.id);
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition ${
              activeTab === 'my-submissions' 
                ? 'bg-blue-50 text-blue-700' 
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
            </svg>
            My Submissions
          </button>
        </nav>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="bg-white border-b border-slate-100 sticky top-0 z-40 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 md:hidden">
             <img src="/images/pemnet_logo.png" alt="PEMNet Logo" width={32} height={32} className="object-contain" />
             <h1 className="text-xl font-bold text-slate-900">PEMNet</h1>
          </div>
          <div className="hidden md:block"></div> {/* Spacer for desktop */}
          
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-600">Welcome, {user.full_name}</span>
            <Link href="/login" className="inline-flex items-center gap-2 text-red-600 hover:text-red-700 font-medium text-sm transition-all hover:bg-red-50 px-4 py-2 rounded-xl">
              <FontAwesomeIcon icon={faSignOutAlt} className="w-4 h-4" />
              Logout
            </Link>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 p-6 overflow-y-auto">
          {activeTab === 'home' && (
             <div className="max-w-4xl mx-auto">
               <div className="bg-gradient-to-r from-blue-500 to-emerald-500 rounded-2xl p-8 text-white mb-8 relative overflow-hidden">
                 <div className="relative z-10">
                   <h1 className="text-4xl font-bold mb-2">Welcome to PEMNet</h1>
                   <p className="text-lg text-white/90">Manage your extension project abstracts and conference submissions.</p>
                 </div>
                 <div className="absolute right-0 bottom-0 opacity-10">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-64 h-64 -mb-10 -mr-10">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                    </svg>
                 </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {/* Card 1 - Submit Abstract */}
                 <button onClick={() => setActiveTab('submit')} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition text-left group">
                   <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-200 transition">
                     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-blue-600">
                       <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                     </svg>
                   </div>
                   <h3 className="text-lg font-bold text-slate-900 mb-1">Submit Abstract</h3>
                   <p className="text-sm text-slate-500">Create and submit your extension project abstract for review.</p>
                 </button>

                 {/* Card 2 - My Submissions */}
                 <button onClick={() => { setActiveTab('my-submissions'); fetchUserSubmissions(user.id); }} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition text-left group">
                   <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-emerald-200 transition">
                     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-emerald-600">
                       <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
                     </svg>
                   </div>
                   <h3 className="text-lg font-bold text-slate-900 mb-1">My Submissions</h3>
                   <p className="text-sm text-slate-500">View and track your submitted abstracts and their status.</p>
                 </button>
               </div>
             </div>
          )}

          {activeTab === 'submit' && (
            <div className="max-w-4xl mx-auto">
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-900">Submit Abstract</h1>
                <p className="text-slate-500 text-sm mt-1">Fill out the required information for your extension project abstract.</p>
              </div>

              {error && !toast && (
                <div className="bg-red-50 border border-red-100 text-red-600 text-sm p-4 rounded-xl mb-6 flex items-start gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 shrink-0 mt-0.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                  </svg>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                
                {/* Section 1: Project Information */}
                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                  <button
                    type="button"
                    onClick={() => toggleSection(1)}
                    className="w-full flex items-center justify-between p-5 bg-slate-50/50 hover:bg-slate-50 transition text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                        1
                      </div>
                      <h2 className="text-lg font-bold text-slate-900">Project Information</h2>
                    </div>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={`w-5 h-5 text-slate-400 transition-transform ${openSections.includes(1) ? 'rotate-180' : ''}`}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                    </svg>
                  </button>
                  
                  {openSections.includes(1) && (
                    <div className="p-6 border-t border-slate-100 space-y-5">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Project Title <span className="text-red-500">*</span></label>
                        <input 
                          name="title" 
                          type="text" 
                          required 
                          placeholder="Enter your project title"
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none transition"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-1.5">Thematic Area <span className="text-red-500">*</span></label>
                          <select 
                            name="thematicArea" 
                            required 
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none transition"
                          >
                            <option value="">Select thematic area</option>
                            {thematicAreas.map((area) => (
                              <option key={area} value={area}>{area}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-1.5">Paper Category <span className="text-red-500">*</span></label>
                          <select 
                            name="paperCategory" 
                            required 
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none transition"
                          >
                            <option value="">Select category</option>
                            {paperCategories.map((cat) => (
                              <option key={cat} value={cat}>{cat}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div ref={dropdownRef}>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">SUC / Agency <span className="text-red-500">*</span></label>
                        
                        {!showOtherSuc ? (
                          <div className="relative">
                            <div className="relative">
                              <input
                                type="text"
                                placeholder="Search SUC/Agency..."
                                value={searchTerm}
                                onChange={handleSearchChange}
                                onFocus={() => setShowDropdown(true)}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none transition"
                              />
                              {isLoadingSucs && (
                                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
                                </div>
                              )}
                            </div>

                            {showDropdown && (
                              <div className="absolute z-20 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                                {filteredSucList.length > 0 ? (
                                  filteredSucList.map((suc) => (
                                    <button
                                      key={suc.id}
                                      type="button"
                                      onClick={() => handleSucSelect(suc)}
                                      className="w-full px-4 py-2.5 text-left hover:bg-blue-50 transition flex items-center justify-between border-b border-slate-50 last:border-0"
                                    >
                                      <div>
                                        <span className="text-sm font-medium text-slate-900">{suc.name}</span>
                                        {suc.abbreviation && (
                                          <span className="text-xs text-slate-500 ml-2">({suc.abbreviation})</span>
                                        )}
                                      </div>
                                      <span className="text-xs text-slate-400">{suc.region}</span>
                                    </button>
                                  ))
                                ) : (
                                  <div className="px-4 py-3 text-sm text-slate-500">
                                    No SUCs found. 
                                    <button
                                      type="button"
                                      onClick={handleAddOther}
                                      className="text-blue-600 font-semibold hover:underline ml-1"
                                    >
                                      Add "{searchTerm}" as new SUC
                                    </button>
                                  </div>
                                )}
                              </div>
                            )}

                            {chosenSuc && !showOtherSuc && (
                              <div className="mt-2 flex items-center gap-2">
                                <span className="text-sm text-emerald-600 font-medium">Selected: {chosenSuc}</span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setChosenSuc('');
                                    setSearchTerm('');
                                  }}
                                  className="text-xs text-red-500 hover:text-red-700"
                                >
                                  Clear
                                </button>
                              </div>
                            )}

                            <button
                              type="button"
                              onClick={handleAddOther}
                              className="mt-2 text-sm text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                              </svg>
                              Can't find your SUC? Add it here
                            </button>
                          </div>
                        ) : (
                          <div>
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                name="sucAgenciesOther"
                                value={otherSucName}
                                onChange={handleOtherSucChange}
                                placeholder="Enter your SUC/Agency name"
                                required
                                className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none transition"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  setShowOtherSuc(false);
                                  setOtherSucName('');
                                  setChosenSuc('');
                                }}
                                className="px-3 py-3 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl transition"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                            <p className="text-xs text-slate-500 mt-1.5">
                              This SUC/Agency will be added when you submit.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Section 2: Author Information */}
                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                  <button
                    type="button"
                    onClick={() => toggleSection(2)}
                    className="w-full flex items-center justify-between p-5 bg-slate-50/50 hover:bg-slate-50 transition text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                        2
                      </div>
                      <h2 className="text-lg font-bold text-slate-900">Author Information</h2>
                    </div>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={`w-5 h-5 text-slate-400 transition-transform ${openSections.includes(2) ? 'rotate-180' : ''}`}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                    </svg>
                  </button>
                  
                  {openSections.includes(2) && (
                    <div className="p-6 border-t border-slate-100 space-y-5">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-1.5">Project Leader <span className="text-red-500">*</span></label>
                          <input 
                            name="project_leader" 
                            type="text" 
                            required 
                            placeholder="Project Leader Name"
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none transition"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-1.5">Paper Presenter <span className="text-red-500">*</span></label>
                          <input 
                            name="presenter" 
                            type="text" 
                            required 
                            placeholder="Presenter Name"
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none transition"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-1.5">Corresponding Author Name</label>
                          <input 
                            name="correspondingAuthorName" 
                            type="text" 
                            placeholder="Corresponding Author Name"
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none transition"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-1.5">Corresponding Author Position/Designation</label>
                          <input 
                            name="correspondingAuthorPosition" 
                            type="text" 
                            placeholder="e.g., Professor, Research Director, Extension Coordinator"
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none transition"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-1.5">Corresponding Author Email</label>
                          <input 
                            name="correspondingAuthorEmail" 
                            type="email" 
                            placeholder="corresponding@email.com"
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none transition"
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <label className="block text-sm font-semibold text-slate-700">Co-Authors</label>
                          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
                            {coAuthors.length} {coAuthors.length === 1 ? 'Author' : 'Authors'}
                          </span>
                        </div>
                        
                        <div className="flex flex-wrap gap-2">
                          {coAuthors.map((author, index) => (
                            <div 
                              key={index} 
                              className="flex items-center gap-1.5 px-3 h-10 bg-slate-50 border border-slate-200 rounded-xl transition-colors hover:border-blue-300 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20"
                            >
                              <span className="text-xs font-bold text-blue-600">
                                {index + 1}.
                              </span>
                              
                              <input 
                                type="text" 
                                value={author}
                                onChange={(e) => handleCoAuthorChange(index, e.target.value)}
                                placeholder={`Author ${index + 1}`}
                                className="w-32 bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
                              />

                              {coAuthors.length > 1 && (
                                <button 
                                  type="button" 
                                  onClick={() => removeCoAuthor(index)}
                                  className="w-5 h-5 shrink-0 flex items-center justify-center rounded-full text-slate-300 hover:text-red-500 hover:bg-red-50 transition"
                                  title="Remove"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3 h-3">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                </button>
                              )}
                            </div>
                          ))}
                        </div>

                        <button 
                          type="button" 
                          onClick={addCoAuthor}
                          className="mt-3 inline-flex items-center gap-2 px-4 h-10 rounded-xl border-2 border-dashed border-blue-300 text-blue-600 font-semibold text-sm hover:border-blue-500 hover:bg-blue-50 transition"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                          </svg>
                          Add Co-Author
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Section 3: File Uploads */}
                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                  <button
                    type="button"
                    onClick={() => toggleSection(3)}
                    className="w-full flex items-center justify-between p-5 bg-slate-50/50 hover:bg-slate-50 transition text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                        3
                      </div>
                      <h2 className="text-lg font-bold text-slate-900">File Uploads</h2>
                    </div>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={`w-5 h-5 text-slate-400 transition-transform ${openSections.includes(3) ? 'rotate-180' : ''}`}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                    </svg>
                  </button>
                  
                  {openSections.includes(3) && (
                    <div className="p-6 border-t border-slate-100 space-y-5">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl p-6 hover:border-blue-300 transition text-center">
                          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-blue-600">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                            </svg>
                          </div>
                          <label className="block text-sm font-semibold text-slate-700 mb-2">Abstract PDF <span className="text-red-500">*</span></label>
                          <input 
                            type="file" 
                            accept=".pdf" 
                            required 
                            onChange={(e) => setAbstractFile(e.target.files[0])}
                            className="w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-5 file:rounded-xl file:border-0 file:bg-blue-700 file:text-white file:font-semibold hover:file:bg-blue-800 cursor-pointer transition"
                          />
                          {abstractFile && (
                            <p className="text-xs text-emerald-600 mt-2">{abstractFile.name}</p>
                          )}
                        </div>
                        <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl p-6 hover:border-blue-300 transition text-center">
                          <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-emerald-600">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
                            </svg>
                          </div>
                          <label className="block text-sm font-semibold text-slate-700 mb-2">Endorsement PDF <span className="text-red-500">*</span></label>
                          <input 
                            type="file" 
                            accept=".pdf" 
                            required 
                            onChange={(e) => setEndorsementFile(e.target.files[0])}
                            className="w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-5 file:rounded-xl file:border-0 file:bg-emerald-600 file:text-white file:font-semibold hover:file:bg-emerald-700 cursor-pointer transition"
                          />
                          {endorsementFile && (
                            <p className="text-xs text-emerald-600 mt-2">{endorsementFile.name}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Submit Button */}
                <div className="pt-4">
                  <button 
                    type="submit" 
                    disabled={submitting || loading}
                    className="w-full bg-linear-to-r from-blue-700 to-blue-800 text-white py-4 rounded-xl font-bold text-lg hover:from-blue-800 hover:to-blue-900 transition shadow-lg shadow-blue-700/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                    </svg>
                    {submitting ? "Submitting..." : "Submit Abstract"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'my-submissions' && (
            <div className="max-w-4xl mx-auto">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h1 className="text-2xl font-bold text-slate-900">My Submissions</h1>
                  <p className="text-slate-500 text-sm mt-1">View and manage your submitted abstracts and payment status.</p>
                </div>
                <button
                  onClick={() => {
                    setActiveTab('submit');
                    fetchUserSubmissions(user.id);
                  }}
                  className="text-blue-600 hover:text-blue-700 font-semibold text-sm inline-flex items-center gap-1 transition bg-blue-50 px-4 py-2 rounded-xl"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                  Submit New Abstract
                </button>
              </div>

              <div className="mt-4">
                {renderSubmissions()}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Tailwind animations */}
      <style jsx>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        @keyframes progressShrink {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-slide-in {
          animation: slideIn 0.3s ease-out;
        }
        .animate-progress-shrink {
          animation: progressShrink 5s linear forwards;
        }
        .animate-fade-in {
          animation: fadeIn 0.2s ease-out;
        }
        .animate-scale-in {
          animation: scaleIn 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}