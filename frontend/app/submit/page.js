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
    <div className="fixed top-20 right-4 z-[9999] animate-slide-in">
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

  useEffect(() => {
    const fetchSUCs = async () => {
      try {
        console.log('Fetching SUCs...');
        const response = await fetch('http://localhost:5000/api/sucs');
        
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
      const response = await fetch(`http://localhost:5000/api/submissions/user/${userId}`);
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
      const response = await fetch(`http://localhost:5000/api/payments/user/${userId}`);
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
      const response = await fetch(`http://localhost:5000/api/payments/submission/${submissionId}`);
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
      
      const response = await fetch('http://localhost:5000/api/payments/upload', {
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
        const addResponse = await fetch('http://localhost:5000/api/sucs', {
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
      const res = await fetch('http://localhost:5000/api/submit', {
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
        {userSubmissions.map((submission) => (
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
                  <a 
                    href={submission.abstract_view_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium inline-flex items-center gap-1"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                    </svg>
                    View Abstract
                  </a>
                )}
                {submission.endorsement_view_url && (
                  <a 
                    href={submission.endorsement_view_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-600 hover:text-emerald-700 text-sm font-medium inline-flex items-center gap-1"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                    </svg>
                    View Endorsement
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  if (!user) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Toast Notification */}
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={hideToast} 
        />
      )}

      {/* --- NAVIGATION --- */}
      <nav className="bg-white border-b border-slate-100 sticky top-0 z-50 shadow-sm">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-linear-to-br from-blue-50 to-emerald-50 rounded-xl p-1.5 flex items-center justify-center">
              <img src="/images/pemnet_logo.png" alt="PEMNet Logo" width={32} height={32} className="object-contain" />
            </div>
            <h1 className="text-xl font-bold text-slate-900">PEMNet</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-600">Welcome, {user.full_name}</span>
            <Link href="/login" className="inline-flex items-center gap-2 text-red-600 hover:text-red-700 font-medium text-sm transition-all hover:bg-red-50 px-4 py-2 rounded-xl">
              <FontAwesomeIcon icon={faSignOutAlt} className="w-4 h-4" />
              Logout
            </Link>
          </div>
        </div>
      </nav>

      {/* --- TABS --- */}
      <div className="max-w-5xl mx-auto px-6 pt-6">
        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
          <div className="flex border-b border-slate-200">
            <button
              onClick={() => setActiveTab('submit')}
              className={`flex-1 px-6 py-4 text-sm font-semibold transition relative ${
                activeTab === 'submit'
                  ? 'text-blue-600'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Submit Abstract
              {activeTab === 'submit' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>
              )}
            </button>
            <button
              onClick={() => {
                setActiveTab('my-submissions');
                fetchUserSubmissions(user.id);
              }}
              className={`flex-1 px-6 py-4 text-sm font-semibold transition relative ${
                activeTab === 'my-submissions'
                  ? 'text-blue-600'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              My Submissions
              {userSubmissions.length > 0 && (
                <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                  {userSubmissions.length}
                </span>
              )}
              {activeTab === 'my-submissions' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>
              )}
            </button>
            <button
              onClick={() => {
                setActiveTab('payment');
                if (user) {
                  fetchUserPayments(user.id);
                }
              }}
              className={`flex-1 px-6 py-4 text-sm font-semibold transition relative ${
                activeTab === 'payment'
                  ? 'text-blue-600'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Payment
              {activeTab === 'payment' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>
              )}
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-8">
            {activeTab === 'submit' ? (
              <>
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h1 className="text-3xl font-bold text-slate-900">Submit Extension Project Abstract</h1>
                    <p className="text-slate-500 text-sm mt-1">Upload your abstract for the conference</p>
                  </div>
                </div>

                {error && !toast && (
                  <div className="bg-red-50 border border-red-100 text-red-600 text-sm p-4 rounded-xl mb-6 flex items-start gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 shrink-0 mt-0.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                    </svg>
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-10">
                  {/* Section 1: Project Information */}
                  <div>
                    <div>
                      <div className="w-full px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl text-slate-700 font-medium text-center">
                        PEMNet 1st National Extension Conference 2026
                      </div>
                    </div>
                    <div className="flex items-center gap-3 mb-6 mt-6">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <span className="text-blue-700 font-bold text-sm">1</span>
                      </div>
                      <h2 className="text-lg font-bold text-slate-900">Project Information</h2>
                    </div>
                    
                    <div className="space-y-5 pl-11">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Extension Project Title</label>
                        <input 
                          name="title" 
                          type="text" 
                          required 
                          placeholder="Enter project title"
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none transition"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-1.5">Thematic Area</label>
                          <select 
                            name="thematicArea" 
                            required 
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none transition"
                          >
                            <option value="">Select Thematic Area</option>
                            {thematicAreas.map((area) => (
                              <option key={area} value={area}>{area}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-1.5">Paper Category</label>
                          <select 
                            name="paperCategory" 
                            required 
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none transition"
                          >
                            <option value="">Select Category</option>
                            {paperCategories.map((cat) => (
                              <option key={cat} value={cat}>{cat}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div ref={dropdownRef}>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">SUC / Agency</label>
                        
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
                  </div>

                  {/* Section 2: Author Information */}
                  <div>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                        <span className="text-emerald-700 font-bold text-sm">2</span>
                      </div>
                      <h2 className="text-lg font-bold text-slate-900">Author Information</h2>
                    </div>
                    
                    <div className="space-y-5 pl-11">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-1.5">Project Leader</label>
                          <input 
                            name="project_leader" 
                            type="text" 
                            required 
                            placeholder="Project Leader Name"
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none transition"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-1.5">Paper Presenter</label>
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
                  </div>

                  {/* Section 3: Files */}
                  <div>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                        <span className="text-yellow-700 font-bold text-sm">3</span>
                      </div>
                      <h2 className="text-lg font-bold text-slate-900">File Uploads</h2>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pl-11">
                      <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl p-6 hover:border-blue-300 transition text-center">
                        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-blue-600">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                          </svg>
                        </div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Abstract PDF *</label>
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
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Endorsement PDF *</label>
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

                  {/* Submit Button */}
                  <div className="pt-4">
                    <button 
                      type="submit" 
                      disabled={submitting || loading}
                      className="w-full bg-linear-to-r from-blue-700 to-blue-800 text-white py-4 rounded-xl font-bold text-lg hover:from-blue-800 hover:to-blue-900 transition shadow-lg shadow-blue-700/20 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submitting ? "Submitting..." : "Submit Abstract"}
                    </button>
                  </div>
                </form>
              </>
            ) : activeTab === 'my-submissions' ? (
              // My Submissions Tab
              <>
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h1 className="text-3xl font-bold text-slate-900">My Submissions</h1>
                    <p className="text-slate-500 text-sm mt-1">View all your submitted abstracts</p>
                  </div>
                  <button
                    onClick={() => {
                      setActiveTab('submit');
                      fetchUserSubmissions(user.id);
                    }}
                    className="text-blue-600 hover:text-blue-700 font-semibold text-sm inline-flex items-center gap-1 transition"
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
              </>
            ) : (
              // Payment Tab
              <>
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h1 className="text-3xl font-bold text-slate-900">Payment</h1>
                    <p className="text-slate-500 text-sm mt-1">Manage your registration payments</p>
                  </div>
                </div>

                {/* Payment Information */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
                  <h2 className="text-lg font-bold text-blue-800 mb-2">Registration Fees</h2>
                  <div className="space-y-2 text-blue-700">
                    <p><span className="font-semibold">Regular Registration Fee:</span> PhP 6,500.00</p>
                    <p><span className="font-semibold">Early-Bird Registration Fee:</span> PhP 6,000.00 <span className="text-xs text-blue-500">(for payments made on or before October 3, 2026)</span></p>
                    <div className="mt-3 pt-3 border-t border-blue-200">
                      <p className="font-semibold">Registration Fee Inclusions:</p>
                      <ul className="list-disc list-inside text-sm space-y-1 ml-2">
                        <li>Conference kit</li>
                        <li>Two (2) managed buffet lunches</li>
                        <li>Five (5) snacks</li>
                      </ul>
                    </div>
                    <div className="mt-3 pt-3 border-t border-blue-200">
                      <p className="font-semibold">Payment Details</p>
                      <p className="text-sm">Payments may be deposited or transferred to the following official account:</p>
                      <div className="bg-white p-4 rounded-lg mt-2 space-y-1 text-sm">
                        <p><span className="font-semibold">Account Name:</span> Philippine Extension Managers Network, Inc.</p>
                        <p><span className="font-semibold">Bank:</span> Bank of the Philippine Islands</p>
                        <p><span className="font-semibold">Account Number:</span> 1330-0222-23</p>
                        <p><span className="font-semibold">Branch:</span> Iloilo Jaro Branch: E Lopez St. Cor D.B. Ledesma St., Jaro, Iloilo City 5000</p>
                      </div>
                      <p className="text-xs text-blue-600 mt-2">After payment, upload a clear copy of the validated deposit slip or electronic transaction receipt. The proof of payment must indicate the participant's full name, institution, amount paid, date of payment, and transaction or reference number.</p>
                    </div>
                  </div>
                </div>

                {/* Payment Form - Only show for endorsed submissions */}
                {userSubmissions.filter(s => s.status === 'endorse').length > 0 ? (
                  <>
                    <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6">
                      <h3 className="text-lg font-bold text-slate-900 mb-4">Upload Payment Proof</h3>
                      <p className="text-sm text-slate-600 mb-4">Select an endorsed submission and upload your payment proof.</p>
                      
                      <form onSubmit={handlePaymentUpload} className="space-y-4">
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-1.5">Select Submission</label>
                          <select
                            onChange={(e) => {
                              const subId = parseInt(e.target.value);
                              const sub = userSubmissions.find(s => s.id === subId);
                              setSelectedSubmission(sub);
                              if (sub) {
                                checkPaymentStatus(sub.id);
                              }
                            }}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none"
                          >
                            <option value="">Select a submission</option>
                            {userSubmissions.filter(s => s.status === 'endorse').map((sub) => (
                              <option key={sub.id} value={sub.id}>
                                {sub.extension_project_title}
                              </option>
                            ))}
                          </select>
                        </div>

                        {selectedSubmission && (
                          <>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Reference Number</label>
                                <input
                                  type="text"
                                  value={referenceNumber}
                                  onChange={(e) => setReferenceNumber(e.target.value)}
                                  placeholder="Enter transaction/reference number"
                                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none"
                                  required
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Payment Amount (PHP)</label>
                                <input
                                  type="number"
                                  value={paymentAmount}
                                  onChange={(e) => setPaymentAmount(e.target.value)}
                                  placeholder="6500.00"
                                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none"
                                  required
                                />
                              </div>
                            </div>
                            <div>
                              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Payment Date</label>
                              <input
                                type="date"
                                value={paymentDate}
                                onChange={(e) => setPaymentDate(e.target.value)}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none"
                                required
                              />
                            </div>

                            <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl p-6 hover:border-blue-300 transition text-center">
                              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-blue-600">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                                </svg>
                              </div>
                              <label className="block text-sm font-semibold text-slate-700 mb-2">Payment Proof (Image or PDF)</label>
                              <input
                                type="file"
                                accept=".jpg,.jpeg,.png,.gif,.bmp,.webp,.pdf"
                                onChange={(e) => setPaymentFile(e.target.files[0])}
                                className="w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-5 file:rounded-xl file:border-0 file:bg-blue-700 file:text-white file:font-semibold hover:file:bg-blue-800 cursor-pointer transition"
                                required
                              />
                              <p className="text-xs text-slate-500 mt-2">Accepted formats: JPG, PNG, GIF, BMP, WEBP, PDF</p>
                              {paymentFile && (
                                <p className="text-xs text-emerald-600 mt-2">{paymentFile.name}</p>
                              )}
                            </div>

                            {paymentData && paymentData.exists && (
                              <div className={`p-4 rounded-xl ${paymentData.payment.payment_status === 'verified' ? 'bg-emerald-50 border border-emerald-200' : paymentData.payment.payment_status === 'rejected' ? 'bg-red-50 border border-red-200' : 'bg-yellow-50 border border-yellow-200'}`}>
                                <p className="font-semibold">Payment Status: <span className={
                                  paymentData.payment.payment_status === 'verified' ? 'text-emerald-600' :
                                  paymentData.payment.payment_status === 'rejected' ? 'text-red-600' :
                                  'text-yellow-600'
                                }>{paymentData.payment.payment_status.toUpperCase()}</span></p>
                                {paymentData.payment.payment_status === 'rejected' && paymentData.payment.rejection_reason && (
                                  <p className="text-sm text-red-600 mt-1">Reason: {paymentData.payment.rejection_reason}</p>
                                )}
                                {paymentData.payment.payment_proof_view_url && (
                                  <a href={paymentData.payment.payment_proof_view_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 text-sm inline-flex items-center gap-1 mt-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                                    </svg>
                                    View Payment Proof
                                  </a>
                                )}
                              </div>
                            )}

                            <button
                              type="submit"
                              disabled={isUploadingPayment || !paymentFile}
                              className="w-full bg-emerald-600 text-white py-3 rounded-xl font-semibold hover:bg-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {isUploadingPayment ? 'Uploading...' : 'Upload Payment Proof'}
                            </button>
                          </>
                        )}
                      </form>
                    </div>

                    {/* Payment History */}
                    <div className="bg-white border border-slate-200 rounded-xl p-6">
                      <h3 className="text-lg font-bold text-slate-900 mb-4">Payment History</h3>
                      {userPayments.length > 0 ? (
                        <div className="space-y-3">
                          {userPayments.map((payment) => (
                            <div key={payment.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                              <div>
                                <p className="font-semibold text-slate-900">{payment.submission_title || 'Submission'}</p>
                                <p className="text-sm text-slate-600">Amount: PhP {payment.payment_amount}</p>
                                <p className="text-sm text-slate-600">Reference: {payment.reference_number}</p>
                              </div>
                              <div className="text-right">
                                <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${payment.payment_status === 'verified' ? 'bg-emerald-100 text-emerald-700' :
                                  payment.payment_status === 'rejected' ? 'bg-red-100 text-red-700' :
                                  'bg-yellow-100 text-yellow-700'
                                }`}>
                                  {payment.payment_status.toUpperCase()}
                                </span>
                                <p className="text-xs text-slate-400 mt-1">{new Date(payment.created_at).toLocaleDateString()}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-center text-slate-500 py-4">No payment records found.</p>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="bg-white border border-slate-200 rounded-xl p-8 text-center">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-slate-400">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-slate-700">No Endorsed Submissions</h3>
                    <p className="text-slate-500 text-sm mt-1">You need to have an endorsed submission to make a payment.</p>
                    <p className="text-slate-500 text-sm">Please wait for your submission to be endorsed by the evaluators.</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
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
        .animate-slide-in {
          animation: slideIn 0.3s ease-out;
        }
        .animate-progress-shrink {
          animation: progressShrink 5s linear forwards;
        }
      `}</style>
    </div>
  );
}