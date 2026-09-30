"use client";

import { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import AbstractForm from '@/app/components/AbstractForm';
import SubmitFullPaper from '@/app/components/SubmitFullPaper';

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

  const getPreviewUrl = (url) => {
    if (!url) return '';
    const driveMatch = url.match(/\/file\/d\/([^/]+)/);
    if (driveMatch && driveMatch[1]) {
      return `https://drive.google.com/file/d/${driveMatch[1]}/preview`;
    }
    return url;
  };

  const previewUrl = getPreviewUrl(fileUrl);

  return (
    <div
      className="fixed inset-0 z-10000 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-3 min-w-0">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              fileType === 'abstract' ? 'bg-blue-100' : 
              fileType === 'supporting' ? 'bg-purple-100' : 
              'bg-emerald-100'
            }`}>
              {fileType === 'abstract' ? (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-blue-600">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
              ) : fileType === 'supporting' ? (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-purple-600">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-emerald-600">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
                </svg>
              )}
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-slate-900 truncate">
                {fileType === 'abstract' ? 'Abstract Document' : 
                fileType === 'supporting' ? 'Supporting Document' : 
                'Endorsement Document'}
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

        <div className="flex-1 bg-slate-100 relative">
          <iframe
            src={previewUrl}
            className="w-full h-full"
            title={fileType === 'abstract' ? 'Abstract Preview' : 'Endorsement Preview'}
            allow="autoplay"
          />
        </div>

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
  const [activeTab, setActiveTab] = useState('home');
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

  const [viewerModal, setViewerModal] = useState({
    isOpen: false,
    fileUrl: '',
    fileType: '',
    title: ''
  });

  const [openSections, setOpenSections] = useState([1]);

  const toggleSection = (sectionId) => {
    setOpenSections(prev =>
      prev.includes(sectionId)
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const openFileViewer = (fileUrl, fileType, title) => {
    if (!fileUrl) return;
    setViewerModal({
      isOpen: true,
      fileUrl,
      fileType,
      title: title || ''
    });
  };

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
        const response = await fetch(`${API_URL}/api/sucs`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (Array.isArray(data)) {
          const sanitizedData = data.map((suc) => ({
            ...suc,
            region: suc.region || 'Unknown Region',
            name: suc.name || 'Unknown SUC'
          }));
          setSucList(sanitizedData);
          setFilteredSucList(sanitizedData);
        } else {
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

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

    try {
      const res = await fetch(`${API_URL}/api/submit`, {
        method: 'POST',
        body: submitData,
      });

      let data;
      const text = await res.text();

      try {
        data = JSON.parse(text);
      } catch (parseError) {
        console.error('Failed to parse JSON:', text);
        throw new Error(`Server returned non-JSON response: ${text.substring(0, 100)}`);
      }

      if (res.ok) {
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
        const errorMsg = data.detail || data.error || data.msg || 'Submission failed. Please try again.';
        setError(errorMsg);
        showToast(errorMsg, 'error');
      }
    } catch (err) {
      console.error('Submission network error:', err);
      const errorMsg = err.message || 'Network error. Is the backend running?';
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

    // Helper: status pill styling
    const getStatusStyle = (status) => {
      switch (status) {
        case 'endorse':
          return 'bg-emerald-50 text-emerald-700 border-emerald-200';
        case 'downgraded-non_competitive':
          return 'bg-amber-50 text-amber-700 border-amber-200';
        case 'downgraded-poster_only':
          return 'bg-amber-50 text-amber-700 border-amber-200';
        case 'accepted':
          return 'bg-emerald-50 text-emerald-700 border-emerald-200';
        case 'rejected':
          return 'bg-red-50 text-red-700 border-red-200';
        default:
          return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      }
    };

    const formatStatus = (status) => {
      if (!status) return 'Pending';
      return status
        .split('-')
        .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
        .join(' ');
    };

    const formatFileSize = (bytes) => {
      if (!bytes) return '';
      if (bytes < 1024) return `${bytes} B`;
      if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    const getFileIcon = (name = '') => {
      const ext = name.split('.').pop()?.toLowerCase() || '';
      if (['png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp', 'svg'].includes(ext))
        return { bg: '#E0F2FE', color: '#0284C7' };
      if (ext === 'pdf') return { bg: '#FEE2E2', color: '#DC2626' };
      if (['xls', 'xlsx', 'csv'].includes(ext))
        return { bg: '#DCFCE7', color: '#16A34A' };
      if (['doc', 'docx'].includes(ext))
        return { bg: '#DBEAFE', color: '#2563EB' };
      return { bg: '#F1F5F9', color: '#475569' };
    };

    return (
      <div className="space-y-5">
        {userSubmissions.map((submission) => {
          const isAccepted = submission.status === 'endorse';
          const existingPayment = userPayments.find(
            (p) => p.submission_id === submission.id
          );

          return (
            <div
              key={submission.id}
              className="bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition overflow-hidden"
            >
              {/* ===== HEADER: Title + Status ===== */}
              <div className="px-6 py-5 border-b border-slate-100">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-bold text-slate-900 leading-snug line-clamp-2">
                      {submission.extension_project_title}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1.5">
                      Submitted{' '}
                      {new Date(submission.created_at).toLocaleDateString(
                        undefined,
                        {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        }
                      )}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 px-3 py-1 rounded-full text-xs font-semibold border ${getStatusStyle(
                      submission.status
                    )}`}
                  >
                    {formatStatus(submission.status)}
                  </span>
                </div>

                {/* Badges row — wraps gracefully */}
                <div className="flex flex-wrap gap-2 mt-3">
                  {submission.paper_category && (
                    <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 bg-purple-50 text-purple-700 rounded-full font-medium">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                        className="w-3 h-3"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      {submission.paper_category}
                    </span>
                  )}
                  {submission.thematic_area && (
                    <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full font-medium">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                        className="w-3 h-3"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M6 6h.008v.008H6V6z"
                        />
                      </svg>
                      {submission.thematic_area}
                    </span>
                  )}
                </div>
              </div>

              {/* ===== BODY: Metadata Grid ===== */}
              <div className="px-6 py-4 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-0.5">
                    Project Leader
                  </p>
                  <p className="text-slate-800 truncate">
                    {submission.project_leader || '—'}
                  </p>
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-0.5">
                    Presenter
                  </p>
                  <p className="text-slate-800 truncate">
                    {submission.presenter || '—'}
                  </p>
                </div>
                {submission.corresponding_author_name && (
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-0.5">
                      Corresponding Author
                    </p>
                    <p className="text-slate-800 truncate">
                      {submission.corresponding_author_name}
                      {submission.corresponding_author_position && (
                        <span className="text-slate-500 font-normal">
                          {' '}
                          · {submission.corresponding_author_position}
                        </span>
                      )}
                    </p>
                  </div>
                )}
                {submission.suc_agencies && (
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-0.5">
                      SUC / Agency
                    </p>
                    <p className="text-slate-800 truncate">
                      {submission.suc_agencies}
                    </p>
                  </div>
                )}
              </div>

              {/* ===== FILES SECTION ===== */}
              <div className="px-6 py-5 bg-slate-50 border-t border-slate-100 space-y-5">

                {/* ---------- Group 1: Primary Documents ---------- */}
                <div>
                  <div className="flex items-center gap-2 mb-2.5">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-4 h-4 text-slate-500"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z"
                      />
                    </svg>
                    <span className="font-semibold text-xs uppercase tracking-wide text-slate-500">
                      Primary Documents
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Abstract card */}
                    {submission.abstract_view_url && (
                      <button
                        type="button"
                        onClick={() =>
                          openFileViewer(
                            submission.abstract_view_url,
                            'abstract',
                            submission.extension_project_title
                          )
                        }
                        className="group flex items-center gap-3 p-3 bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-300 rounded-xl transition text-left"
                      >
                        <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.8}
                            stroke="currentColor"
                            className="w-4.5 h-4.5 text-blue-600"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                            />
                          </svg>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-slate-800 group-hover:text-blue-700">
                            Abstract
                          </p>
                          <p className="text-xs text-slate-500 truncate">
                            Primary submission document
                          </p>
                        </div>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={2}
                          stroke="currentColor"
                          className="w-4 h-4 text-slate-400 group-hover:text-blue-600 shrink-0"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
                          />
                        </svg>
                      </button>
                    )}

                    {/* Endorsement card */}
                    {submission.endorsement_view_url && (
                      <button
                        type="button"
                        onClick={() =>
                          openFileViewer(
                            submission.endorsement_view_url,
                            'endorsement',
                            submission.extension_project_title
                          )
                        }
                        className="group flex items-center gap-3 p-3 bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 rounded-xl transition text-left"
                      >
                        <div className="w-9 h-9 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.8}
                            stroke="currentColor"
                            className="w-4.5 h-4.5 text-emerald-600"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z"
                            />
                          </svg>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-slate-800 group-hover:text-emerald-700">
                            Endorsement
                          </p>
                          <p className="text-xs text-slate-500 truncate">
                            Signed endorsement letter
                          </p>
                        </div>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={2}
                          stroke="currentColor"
                          className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 shrink-0"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
                          />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>

                {/* ---------- Group 2: Supporting Documents ---------- */}
                {submission.supporting_documents &&
                  submission.supporting_documents.length > 0 && (
                    <div className="pt-4 border-t border-slate-200">
                      <div className="flex items-center justify-between mb-2.5">
                        <div className="flex items-center gap-2">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="w-4 h-4 text-slate-500"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13"
                            />
                          </svg>
                          <span className="font-semibold text-xs uppercase tracking-wide text-slate-500">
                            Supporting Documents
                          </span>
                        </div>
                        <span className="inline-flex items-center justify-center min-w-6 h-6 px-2 text-xs font-bold rounded-full bg-purple-100 text-purple-700">
                          {submission.supporting_documents.length}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                        {submission.supporting_documents.map((doc, idx) => {
                          const icon = getFileIcon(doc.file_name);
                          const ext = (doc.file_name?.split('.').pop() || '').toLowerCase();

                          return (
                            <button
                              key={doc.id || idx}
                              type="button"
                              onClick={() =>
                                openFileViewer(doc.view_url, 'supporting', doc.file_name)
                              }
                              className="group flex items-center gap-2.5 p-2.5 bg-white hover:bg-purple-50 border border-slate-200 hover:border-purple-300 rounded-lg transition text-left min-w-0"
                              title={doc.file_name}
                            >
                              <span
                                className="inline-flex items-center justify-center w-8 h-8 rounded-lg shrink-0"
                                style={{ backgroundColor: icon.bg, color: icon.color }}
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  strokeWidth={1.8}
                                  stroke="currentColor"
                                  className="w-4 h-4"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                                  />
                                </svg>
                              </span>
                              <div className="min-w-0 flex-1">
                                <p className="text-xs font-semibold text-slate-800 group-hover:text-purple-700 truncate">
                                  {doc.file_name}
                                </p>
                                <p className="text-[10px] text-slate-500 uppercase tracking-wide">
                                  {ext}
                                  {doc.file_size
                                    ? ` · ${formatFileSize(doc.file_size)}`
                                    : ''}
                                </p>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
              </div>

              {/* ===== PAYMENT SECTION ===== */}
              <div className="px-6 py-5 border-t border-slate-100">
                <div className="flex items-center gap-2 mb-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-4 h-4 text-slate-500"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z"
                    />
                  </svg>
                  <span className="font-semibold text-sm text-slate-700">
                    Payment
                  </span>
                </div>

                {!isAccepted ? (
                  <div className="flex items-center gap-2 text-slate-500 text-sm bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-4 h-4 shrink-0"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
                      />
                    </svg>
                    Payment will be available once your submission is accepted.
                  </div>
                ) : existingPayment ? (
                  <div
                    className={`p-3 rounded-xl border text-sm ${
                      existingPayment.payment_status === 'verified'
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                        : existingPayment.payment_status === 'rejected'
                        ? 'bg-red-50 border-red-200 text-red-700'
                        : 'bg-yellow-50 border-yellow-200 text-yellow-700'
                    }`}
                  >
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <span>
                        Status:{' '}
                        <strong>
                          {existingPayment.payment_status.toUpperCase()}
                        </strong>
                      </span>
                      {existingPayment.payment_proof_view_url && (
                        <a
                          href={existingPayment.payment_proof_view_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline font-medium"
                        >
                          View Proof
                        </a>
                      )}
                    </div>
                    {existingPayment.payment_status === 'rejected' &&
                      existingPayment.rejection_reason && (
                        <p className="text-xs mt-1">
                          Reason: {existingPayment.rejection_reason}
                        </p>
                      )}
                  </div>
                ) : (
                  <form
                    onSubmit={handlePaymentUpload}
                    className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3"
                  >
                    <p className="text-xs text-slate-500">
                      Provide your payment details and upload proof of payment.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">
                          Reference Number *
                        </label>
                        <input
                          type="text"
                          value={referenceNumber}
                          onChange={(e) => setReferenceNumber(e.target.value)}
                          placeholder="e.g. 1234567890"
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">
                          Amount (PHP) *
                        </label>
                        <input
                          type="number"
                          value={paymentAmount}
                          onChange={(e) => setPaymentAmount(e.target.value)}
                          placeholder="e.g. 6500.00"
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">
                          Date of Payment *
                        </label>
                        <input
                          type="date"
                          value={paymentDate}
                          onChange={(e) => setPaymentDate(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">
                        Proof of Payment *
                      </label>
                      <div className="border-2 border-dashed border-slate-300 rounded-lg p-3 text-center hover:border-blue-400 transition bg-white">
                        <input
                          type="file"
                          accept=".jpg,.jpeg,.png,.gif,.bmp,.webp,.pdf"
                          onChange={(e) => setPaymentFile(e.target.files[0])}
                          className="w-full text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-blue-600 file:text-white file:font-medium hover:file:bg-blue-700 cursor-pointer"
                          required
                        />
                        <p className="text-[10px] text-slate-400 mt-1">
                          PDF, JPG, PNG (Max 5MB)
                        </p>
                        {paymentFile && (
                          <p className="text-xs text-emerald-600 mt-1">
                            {paymentFile.name}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={isUploadingPayment || !paymentFile}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={2}
                          stroke="currentColor"
                          className="w-4 h-4"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z"
                          />
                        </svg>
                        {isUploadingPayment ? 'Uploading...' : 'Submit Payment'}
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
    return <div className="flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="bg-slate-50 flex-1 flex flex-col">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={hideToast}
        />
      )}

      <FileViewerModal
        isOpen={viewerModal.isOpen}
        onClose={closeFileViewer}
        fileUrl={viewerModal.fileUrl}
        fileType={viewerModal.fileType}
        title={viewerModal.title}
      />

      {/* --- TOP NAVBAR --- */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-linear-to-br from-blue-50 to-emerald-50 rounded-xl p-1.5 flex items-center justify-center">
              <img src="/images/pemnet_logo.png" alt="PEMNet Logo" width={32} height={32} className="object-contain" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 leading-tight">PEMNet</h1>
              <p className="text-[10px] text-slate-500 leading-tight hidden sm:block">Philippine Extension and Management Network</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-600 hidden sm:inline">Welcome, {user.full_name}</span>
            <button
              onClick={() => {
                localStorage.removeItem('pemnet_user');
                window.location.href = '/login';
              }}
              className="inline-flex items-center gap-2 text-red-600 hover:text-red-700 font-medium text-sm transition-all hover:bg-red-50 px-4 py-2 rounded-xl"
            >
              <FontAwesomeIcon icon={faSignOutAlt} className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 p-6">
        <div className="max-w-5xl mx-auto">

          {activeTab === 'home' && (
            <div className="max-w-4xl mx-auto">
              <div className="bg-linear-to-r from-blue-500 to-emerald-500 rounded-2xl p-8 text-white mb-8 relative overflow-hidden">
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
                <button onClick={() => setActiveTab('submit')} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition text-left group">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-200 transition">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-blue-600">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-1">Submit Abstract</h3>
                  <p className="text-sm text-slate-500">Create and submit your extension project abstract for review.</p>
                </button>

                <button onClick={() => { setActiveTab('my-submissions'); fetchUserSubmissions(user.id); }} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition text-left group">
                  <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-emerald-200 transition">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-emerald-600">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-1">My Submissions</h3>
                  <p className="text-sm text-slate-500">View and track your submitted abstracts and their status.</p>
                </button>
                <button
                  onClick={() => { setActiveTab('full-paper'); fetchUserSubmissions(user.id); }}
                  className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition text-left group"
                >
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-purple-200 transition">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-purple-600">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-1">Submit Full Paper</h3>
                  <p className="text-sm text-slate-500">
                    Upload your full paper after your abstract is accepted.
                  </p>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'submit' && (
            <div className="max-w-5xl mx-auto">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h1 className="text-2xl font-bold text-slate-900">Submit Abstract</h1>
                  <p className="text-slate-500 text-sm mt-1">
                    Complete all sections based on the PEMNet Abstract Template.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('home')}
                  className="text-slate-600 hover:text-slate-900 font-semibold text-sm inline-flex items-center gap-1 transition bg-slate-100 px-4 py-2 rounded-xl"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                  </svg>
                  Back to Home
                </button>
              </div>

              <AbstractForm
                user={user}
                submitting={submitting}
                error={error}
                sucList={sucList}
                isLoadingSucs={isLoadingSucs}
                onSucAdded={(newSuc) => setSucList((prev) => [...prev, newSuc])}
                onSubmit={async (payload) => {
                  // Called when the child form is ready to submit
                  if (payload.error) {
                    setError(payload.error);
                    showToast(payload.error, 'error');
                    return;
                  }

                  setSubmitting(true);
                  setError('');

                  try {
                    const res = await fetch(`${API_URL}/api/submit`, {
                      method: 'POST',
                      body: payload.formData,
                    });

                    const text = await res.text();
                    let data;
                    try {
                      data = JSON.parse(text);
                    } catch {
                      throw new Error(`Server returned non-JSON response: ${text.substring(0, 100)}`);
                    }

                    if (res.ok) {
                      showToast('Abstract submitted successfully!', 'success');
                      fetchUserSubmissions(user.id);
                      setTimeout(() => setActiveTab('my-submissions'), 1000);
                    } else {
                      const msg = data.detail || data.error || data.msg || 'Submission failed.';
                      setError(msg);
                      showToast(msg, 'error');
                    }
                  } catch (err) {
                    console.error('Submission error:', err);
                    const msg = err.message || 'Network error.';
                    setError(msg);
                    showToast(msg, 'error');
                  } finally {
                    setSubmitting(false);
                  }
                }}
              />
            </div>
          )}

          {activeTab === 'my-submissions' && (
            <div className="max-w-4xl mx-auto">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h1 className="text-2xl font-bold text-slate-900">My Submissions</h1>
                  <p className="text-slate-500 text-sm mt-1">View and manage your submitted abstracts and payment status.</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveTab('home')}
                    className="text-slate-600 hover:text-slate-900 font-semibold text-sm inline-flex items-center gap-1 transition bg-slate-100 px-4 py-2 rounded-xl"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                    </svg>
                    Back to Home
                  </button>
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
              </div>

              <div className="mt-4">
                {renderSubmissions()}
              </div>
            </div>
          )}

          {activeTab === 'full-paper' && (
            <SubmitFullPaper
              user={user}
              submissions={userSubmissions}
              onBack={() => setActiveTab('home')}
              onToast={showToast}
              onSubmitted={() => {
                fetchUserSubmissions(user.id);
                setTimeout(() => setActiveTab('my-submissions'), 1000);
              }}
            />
          )}
        </div>
      </main>

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