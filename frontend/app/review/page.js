"use client";

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

export default function ReviewPage() {
  const [activeTab, setActiveTab] = useState('system'); // 'system' or 'email'
  const [submissions, setSubmissions] = useState([]);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [toast, setToast] = useState(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [pdfModal, setPdfModal] = useState(null);
  const [isModalLoading, setIsModalLoading] = useState(false);
  const [checkingEmails, setCheckingEmails] = useState(false);

  // Fetch submissions based on active tab
  useEffect(() => {
    fetchSubmissions();
  }, [activeTab, statusFilter]);

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      let url;
      if (activeTab === 'system') {
        url = 'http://localhost:5000/api/submissions';
      } else {
        url = `http://localhost:5000/api/email-submissions?status=${statusFilter}`;
      }
      
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setSubmissions(data);
        if (data.length > 0) {
          setSelectedSubmission(data[0]);
        } else {
          setSelectedSubmission(null);
        }
      }
    } catch (error) {
      console.error('Error fetching submissions:', error);
      showToast('Failed to fetch submissions', 'error');
    } finally {
      setLoading(false);
    }
  };

  const checkEmails = async () => {
    setCheckingEmails(true);
    try {
      const res = await fetch('http://localhost:5000/api/email-submissions/check', {
        method: 'POST',
      });
      if (res.ok) {
        const data = await res.json();
        showToast(`Found ${data.processed} new email submissions`, 'success');
        fetchSubmissions();
      } else {
        const error = await res.json();
        showToast(error.detail || 'Failed to check emails', 'error');
      }
    } catch (error) {
      console.error('Error checking emails:', error);
      showToast('Failed to check emails', 'error');
    } finally {
      setCheckingEmails(false);
    }
  };

  const showToast = (message, type) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  };

  const handleAccept = async () => {
    if (!selectedSubmission) return;
    
    try {
      const res = await fetch(`http://localhost:5000/api/submissions/${selectedSubmission.id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'accepted' }),
      });

      if (res.ok) {
        showToast('Submission accepted successfully!', 'success');
        setSubmissions(submissions.map(s => 
          s.id === selectedSubmission.id ? { ...s, status: 'accepted' } : s
        ));
        setSelectedSubmission({ ...selectedSubmission, status: 'accepted' });
      }
    } catch (error) {
      console.error('Error accepting submission:', error);
      showToast('Failed to accept submission', 'error');
    }
  };

  const handleReject = async () => {
    if (!selectedSubmission) return;
    
    try {
      const res = await fetch(`http://localhost:5000/api/submissions/${selectedSubmission.id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'rejected' }),
      });

      if (res.ok) {
        showToast('Submission rejected!', 'error');
        setSubmissions(submissions.map(s => 
          s.id === selectedSubmission.id ? { ...s, status: 'rejected' } : s
        ));
        setSelectedSubmission({ ...selectedSubmission, status: 'rejected' });
      }
    } catch (error) {
      console.error('Error rejecting submission:', error);
      showToast('Failed to reject submission', 'error');
    }
  };

  const handleEmailReview = async (action) => {
    if (!selectedSubmission) return;

    try {
      const res = await fetch(`http://localhost:5000/api/email-submissions/${selectedSubmission.id}/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: action,
          notes: reviewNotes,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        showToast(`Email submission ${action}ed successfully!`, action === 'accept' ? 'success' : 'error');
        
        fetchSubmissions();
        setReviewNotes('');
        
        if (action === 'accept' && data.submission_id) {
          showToast(`Created submission #${data.submission_id}`, 'success');
        }
      } else {
        const error = await res.json();
        showToast(error.detail || 'Failed to process submission', 'error');
      }
    } catch (error) {
      console.error('Error reviewing submission:', error);
      showToast('Failed to process submission', 'error');
    }
  };

  const handleAcceptReject = (action) => {
    if (activeTab === 'system') {
      if (action === 'accept') {
        handleAccept();
      } else {
        handleReject();
      }
    } else {
      handleEmailReview(action);
    }
  };

  // Filter submissions
  const filteredSubmissions = submissions.filter(sub => {
    if (activeTab === 'system') {
      if (statusFilter !== 'all' && sub.status !== statusFilter) return false;
      if (categoryFilter !== 'all' && sub.paper_category !== categoryFilter) return false;
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        return (
          sub.extension_project_title.toLowerCase().includes(search) ||
          sub.author.toLowerCase().includes(search) ||
          sub.suc_agencies.toLowerCase().includes(search)
        );
      }
      return true;
    } else {
      // Email submissions filter
      if (statusFilter !== 'all' && sub.status !== statusFilter) return false;
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        return (
          sub.subject.toLowerCase().includes(search) ||
          sub.sender_name.toLowerCase().includes(search) ||
          sub.sender_email.toLowerCase().includes(search)
        );
      }
      return true;
    }
  });

  // Calculate stats
  const totalSubmissions = submissions.length;
  const pendingCount = submissions.filter(s => s.status === 'pending').length;
  const acceptedCount = submissions.filter(s => s.status === 'accepted').length;
  const rejectedCount = submissions.filter(s => s.status === 'rejected').length;

  // Get status badge color
  const getStatusColor = (status) => {
    switch (status) {
      case 'accepted': return 'bg-emerald-100 text-emerald-700';
      case 'rejected': return 'bg-red-100 text-red-700';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  // Get category badge color
  const getCategoryColor = (category) => {
    if (!category) return 'bg-slate-100 text-slate-700';
    if (category.includes('Natural')) return 'bg-green-100 text-green-700';
    if (category.includes('Information')) return 'bg-blue-100 text-blue-700';
    if (category.includes('Development')) return 'bg-purple-100 text-purple-700';
    if (category.includes('Social')) return 'bg-pink-100 text-pink-700';
    if (category.includes('Food')) return 'bg-yellow-100 text-yellow-700';
    return 'bg-slate-100 text-slate-700';
  };

  // Extract Google Drive file ID from URL
  const extractGoogleDriveId = (url) => {
    if (!url) return null;
    
    const patterns = [
      /\/d\/([a-zA-Z0-9_-]+)/,
      /id=([a-zA-Z0-9_-]+)/,
      /open\?id=([a-zA-Z0-9_-]+)/,
      /\/file\/d\/([a-zA-Z0-9_-]+)/,
      /([a-zA-Z0-9_-]{25,})/
    ];

    for (let pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1].split('?')[0].split('&')[0];
      }
    }
    return null;
  };

  // Open file in modal
  const openFileInModal = (url, title, fileType) => {
    if (!url) {
      showToast(`No ${fileType} file available`, 'error');
      return;
    }

    setIsModalLoading(true);
    setPdfModal({ type: fileType, url, title });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 animate-slide-in">
          <div className={`relative w-96 p-4 rounded-xl border shadow-lg ${
            toast.type === 'success' ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-start gap-3">
              <div className={`shrink-0 mt-0.5 ${
                toast.type === 'success' ? 'text-emerald-700' : 'text-red-700'
              }`}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className={`flex-1 ${toast.type === 'success' ? 'text-emerald-700' : 'text-red-700'}`}>
                <p className="font-semibold text-sm">{toast.type === 'success' ? 'Success!' : 'Error!'}</p>
                <p className="text-sm">{toast.message}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PDF Modal */}
      {pdfModal && (
        <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setPdfModal(null)}
          ></div>
          
          <div className="relative w-full max-w-5xl h-[90vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-blue-600">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{pdfModal.title}</h3>
                  <p className="text-sm text-slate-500">
                    {selectedSubmission?.extension_project_title || selectedSubmission?.subject}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <a 
                  href={pdfModal.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 transition"
                >
                  Open in New Tab
                </a>
                <button
                  onClick={() => setPdfModal(null)}
                  className="w-10 h-10 flex items-center justify-center rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="flex-1 bg-slate-100 overflow-auto relative">
              {isModalLoading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mb-4"></div>
                    <p className="text-slate-600">Loading PDF...</p>
                  </div>
                </div>
              )}
              
              {pdfModal.url.includes('drive.google.com') ? (
                <iframe
                  src={`https://drive.google.com/file/d/${extractGoogleDriveId(pdfModal.url)}/preview`}
                  className="w-full h-full min-h-150"
                  title={pdfModal.title}
                  onLoad={() => setIsModalLoading(false)}
                  onError={() => setIsModalLoading(false)}
                />
              ) : (
                <iframe
                  src={pdfModal.url}
                  className="w-full h-full min-h-150"
                  title={pdfModal.title}
                  onLoad={() => setIsModalLoading(false)}
                  onError={() => setIsModalLoading(false)}
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-8 py-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Abstract Review</h1>
            <p className="text-slate-500 text-sm mt-1">Review and manage submitted abstracts from SUC users and email submissions.</p>
          </div>
          <Link href="/" className="text-blue-600 hover:text-blue-700 font-semibold text-sm">
            ← Back to Dashboard
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-6">
      {/* Tabs */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => {
              setActiveTab('system');
              setStatusFilter('all');
              setCategoryFilter('all');
              setSearchTerm('');
            }}
            className={`px-6 py-2.5 rounded-lg font-semibold text-sm transition ${
              activeTab === 'system'
                ? 'bg-white shadow-sm text-slate-900'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 inline mr-2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
            System Submissions
          </button>
          <div className="relative flex items-center">
            <button
              onClick={() => {
                setActiveTab('email');
                setCategoryFilter('all');
                setSearchTerm('');
              }}
              className={`px-6 py-2.5 rounded-lg font-semibold text-sm transition flex items-center gap-2 ${
                activeTab === 'email'
                  ? 'bg-white shadow-sm text-slate-900'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
              Email Submissions
            </button>
            {activeTab === 'email' && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  checkEmails();
                }}
                disabled={checkingEmails}
                className="ml-2 px-3 py-1 text-xs rounded-lg font-medium bg-blue-100 text-blue-600 hover:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {checkingEmails ? (
                  <span className="flex items-center gap-1">
                    <div className="animate-spin rounded-full h-3 w-3 border-2 border-blue-600 border-t-transparent"></div>
                    Checking
                  </span>
                ) : (
                  'Check Inbox'
                )}
              </button>
            )}
          </div>
        </div>
        
        {activeTab === 'email' && (
          <button
            onClick={checkEmails}
            disabled={checkingEmails}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 flex items-center gap-2"
          >
            {checkingEmails ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                Checking...
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9" />
                </svg>
                Check Inbox
              </>
            )}
          </button>
        )}
      </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-blue-600">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{totalSubmissions}</p>
                <p className="text-sm text-slate-500">Total {activeTab === 'system' ? 'Submissions' : 'Emails'}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-yellow-600">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{pendingCount}</p>
                <p className="text-sm text-slate-500">Pending Review</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-emerald-600">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{acceptedCount}</p>
                <p className="text-sm text-slate-500">Accepted</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-red-600">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{rejectedCount}</p>
                <p className="text-sm text-slate-500">Rejected</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-4 mb-6">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder={activeTab === 'system' ? "Search by title, author, or SUC..." : "Search by subject, sender, or email..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2.5 pl-10 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none"
            />
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="accepted">Accepted</option>
            <option value="rejected">Rejected</option>
          </select>

          {activeTab === 'system' && (
            <>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none"
              >
                <option value="all">All Categories</option>
                <option value="Completed Extension Project Papers">Completed Extension</option>
                <option value="Ongoing Extension Project Papers">Ongoing Extension</option>
              </select>
            </>
          )}
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Submissions List */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    {activeTab === 'system' ? (
                      <>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Title & Author</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">SUC / Agency</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Category</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Status</th>
                      </>
                    ) : (
                      <>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Subject / Sender</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Project Leader</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Received</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Status</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {filteredSubmissions.map((sub) => (
                    <tr
                      key={sub.id}
                      onClick={() => setSelectedSubmission(sub)}
                      className={`cursor-pointer border-b border-slate-100 hover:bg-blue-50/50 transition ${
                        selectedSubmission?.id === sub.id ? 'bg-blue-50/50 border-blue-200' : ''
                      }`}
                    >
                      {activeTab === 'system' ? (
                        <>
                          <td className="px-6 py-4">
                            <p className="text-sm font-semibold text-slate-900">{sub.extension_project_title}</p>
                            <p className="text-xs text-slate-500 mt-1">{sub.author}</p>
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-600">{sub.suc_agencies}</td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${getCategoryColor(sub.paper_category)}`}>
                              {sub.paper_category?.includes('Completed') ? 'Completed' : 'Ongoing'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-600">
                            {new Date(sub.created_at).toLocaleDateString('en-US', {
                              month: 'short',
                              day: '2-digit',
                              year: 'numeric'
                            })}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(sub.status)}`}>
                              {sub.status.charAt(0).toUpperCase() + sub.status.slice(1)}
                            </span>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="px-6 py-4">
                            <p className="text-sm font-semibold text-slate-900">{sub.subject}</p>
                            <p className="text-xs text-slate-500 mt-1">{sub.sender_name} ({sub.sender_email})</p>
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-600">{sub.project_leader_name}</td>
                          <td className="px-6 py-4 text-sm text-slate-600">
                            {new Date(sub.email_received_at).toLocaleDateString('en-US', {
                              month: 'short',
                              day: '2-digit',
                              year: 'numeric'
                            })}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(sub.status)}`}>
                              {sub.status.charAt(0).toUpperCase() + sub.status.slice(1)}
                            </span>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredSubmissions.length === 0 && (
                <div className="text-center py-12 text-slate-500">
                  <p>No {activeTab === 'system' ? 'submissions' : 'email submissions'} found</p>
                  {activeTab === 'email' && (
                    <button
                      onClick={checkEmails}
                      className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
                    >
                      Check Inbox for New Emails
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Submission Details */}
          <div className="lg:col-span-1 bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            {selectedSubmission ? (
              activeTab === 'system' ? (
                // System Submission Details
                <>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-slate-900">Submission Details</h2>
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedSubmission.status)}`}>
                      {selectedSubmission.status.charAt(0).toUpperCase() + selectedSubmission.status.slice(1)}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-slate-900 mb-4">{selectedSubmission.extension_project_title}</h3>

                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-5 h-5 text-slate-400 mt-0.5">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm text-slate-600">Author(s):</p>
                        <p className="text-sm font-medium text-slate-900">
                          {selectedSubmission.author}
                          {selectedSubmission.co_authors && `, ${selectedSubmission.co_authors}`}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-5 h-5 text-slate-400 mt-0.5">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm text-slate-600">SUC / Agency:</p>
                        <p className="text-sm font-medium text-slate-900">{selectedSubmission.suc_agencies}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-5 h-5 text-slate-400 mt-0.5">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm text-slate-600">Thematic Area:</p>
                        <p className="text-sm font-medium text-slate-900">{selectedSubmission.thematic_area}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-5 h-5 text-slate-400 mt-0.5">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm text-slate-600">Paper Category:</p>
                        <p className="text-sm font-medium text-slate-900">{selectedSubmission.paper_category}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-5 h-5 text-slate-400 mt-0.5">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm text-slate-600">Date Submitted:</p>
                        <p className="text-sm font-medium text-slate-900">
                          {new Date(selectedSubmission.created_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Abstract File */}
                  <div className="mt-6 p-4 bg-slate-50 rounded-xl">
                    <p className="text-sm font-semibold text-slate-700 mb-3">Abstract File</p>
                    <button
                      onClick={() => openFileInModal(selectedSubmission.abstract_view_url, 'Abstract Document', 'Abstract')}
                      className="w-full px-4 py-3 bg-white border border-blue-300 rounded-lg text-blue-600 hover:bg-blue-50 font-medium text-sm flex items-center justify-center gap-2 transition"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                      </svg>
                      View PDF Document
                    </button>
                  </div>

                  {/* Endorsement File */}
                  <div className="mt-3 p-4 bg-slate-50 rounded-xl">
                    <p className="text-sm font-semibold text-slate-700 mb-3">Endorsement Letter</p>
                    <button
                      onClick={() => openFileInModal(selectedSubmission.endorsement_view_url, 'Endorsement Letter', 'Endorsement')}
                      className="w-full px-4 py-3 bg-white border border-blue-300 rounded-lg text-blue-600 hover:bg-blue-50 font-medium text-sm flex items-center justify-center gap-2 transition"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                      </svg>
                      View PDF Document
                    </button>
                  </div>

                  {/* Review Notes */}
                  <div className="mt-6">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Review Notes (Optional)</label>
                    <textarea
                      value={reviewNotes}
                      onChange={(e) => setReviewNotes(e.target.value)}
                      placeholder="Add notes or feedback for the author..."
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none"
                      rows={4}
                    />
                    <p className="text-xs text-slate-400 mt-1">These notes will be included in the decision email.</p>
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-6 space-y-3">
                    <button
                      onClick={() => handleAcceptReject('accept')}
                      disabled={selectedSubmission.status === 'accepted'}
                      className="w-full bg-emerald-600 text-white py-3 rounded-xl font-semibold hover:bg-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 inline mr-2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Accept Abstract
                    </button>
                    <button
                      onClick={() => handleAcceptReject('reject')}
                      disabled={selectedSubmission.status === 'rejected'}
                      className="w-full bg-red-50 text-red-600 py-3 rounded-xl font-semibold hover:bg-red-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 inline mr-2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Reject Abstract
                    </button>
                  </div>
                </>
              ) : (
                // Email Submission Details
                <>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-slate-900">Email Details</h2>
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedSubmission.status)}`}>
                      {selectedSubmission.status.charAt(0).toUpperCase() + selectedSubmission.status.slice(1)}
                    </span>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-slate-600">Subject</p>
                      <p className="font-semibold text-slate-900">{selectedSubmission.subject}</p>
                    </div>

                    <div>
                      <p className="text-sm text-slate-600">From</p>
                      <p className="text-slate-900">{selectedSubmission.sender_name}</p>
                      <p className="text-sm text-slate-500">{selectedSubmission.sender_email}</p>
                    </div>

                    <div>
                      <p className="text-sm text-slate-600">Project Leader</p>
                      <p className="font-semibold text-slate-900">{selectedSubmission.project_leader_name}</p>
                    </div>

                    <div>
                      <p className="text-sm text-slate-600">Received</p>
                      <p className="text-slate-900">
                        {new Date(selectedSubmission.email_received_at).toLocaleString('en-US', {
                          month: 'short',
                          day: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>

                    {selectedSubmission.attachment_filename && (
                      <div>
                        <p className="text-sm text-slate-600">Attachment</p>
                        <button
                          onClick={() => openFileInModal(selectedSubmission.attachment_view_url, selectedSubmission.attachment_filename, 'Attachment')}
                          className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-2 mt-1"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                          </svg>
                          {selectedSubmission.attachment_filename}
                        </button>
                      </div>
                    )}

                    {selectedSubmission.body && (
                      <div>
                        <p className="text-sm text-slate-600">Message Preview</p>
                        <div className="mt-2 p-3 bg-slate-50 rounded-lg text-sm text-slate-700 max-h-32 overflow-y-auto whitespace-pre-wrap">
                          {selectedSubmission.body.slice(0, 500)}
                          {selectedSubmission.body.length > 500 && '...'}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Review Notes */}
                  {selectedSubmission.status === 'pending' && (
                    <>
                      <div className="mt-6">
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Review Notes</label>
                        <textarea
                          value={reviewNotes}
                          onChange={(e) => setReviewNotes(e.target.value)}
                          placeholder="Add notes or feedback for the sender..."
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none"
                          rows={3}
                        />
                      </div>

                      {/* Action Buttons */}
                      <div className="mt-6 space-y-3">
                        <button
                          onClick={() => handleAcceptReject('accept')}
                          className="w-full bg-emerald-600 text-white py-3 rounded-xl font-semibold hover:bg-emerald-700 transition"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 inline mr-2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Accept & Create Submission
                        </button>
                        <button
                          onClick={() => handleAcceptReject('reject')}
                          className="w-full bg-red-50 text-red-600 py-3 rounded-xl font-semibold hover:bg-red-100 transition"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 inline mr-2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          Reject
                        </button>
                      </div>
                    </>
                  )}

                  {selectedSubmission.status === 'accepted' && (
                    <div className="mt-6 p-4 bg-emerald-50 rounded-xl">
                      <p className="text-sm text-emerald-700">This email has been accepted</p>
                    </div>
                  )}

                  {selectedSubmission.status === 'rejected' && (
                    <div className="mt-6 p-4 bg-red-50 rounded-xl">
                      <p className="text-sm text-red-700">This email has been rejected</p>
                    </div>
                  )}
                </>
              )
            ) : (
              <div className="text-center py-12">
                <p className="text-slate-500">Select a submission to view details</p>
                {activeTab === 'email' && (
                  <button
                    onClick={checkEmails}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
                  >
                    Check Inbox for New Emails
                  </button>
                )}
              </div>
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
        .animate-slide-in {
          animation: slideIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}