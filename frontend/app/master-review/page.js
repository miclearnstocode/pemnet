"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import ConfirmModal from '../components/ConfirmModal';
import DowngradeModal from '../components/DowngradeModal';

export default function MasterReviewPage() {
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState('system');
  const [submissions, setSubmissions] = useState([]);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    endorsed: 0,
    non_competitive: 0,
    poster_only: 0
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [toast, setToast] = useState(null);
  const [isSettingStatus, setIsSettingStatus] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingStatusAction, setPendingStatusAction] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [allUsers, setAllUsers] = useState([]);
  const [submissionDetails, setSubmissionDetails] = useState(null);
  const [emailExtractedData, setEmailExtractedData] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Collapsible sections
  const [showEndorsement, setShowEndorsement] = useState(false);
  
  // Downgrade Modal States
  const [showDowngradeModal, setShowDowngradeModal] = useState(false);
  const [downgradeLoading, setDowngradeLoading] = useState(false);
  const [showDowngradeConfirm, setShowDowngradeConfirm] = useState(false);
  const [pendingDowngradeType, setPendingDowngradeType] = useState(null);
  const [downgradeConfirmLoading, setDowngradeConfirmLoading] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('pemnet_user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setCurrentUser(user);
        if (user.role !== 'admin' && user.role !== 'master_approver') {
          window.location.href = '/review';
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    } else {
      window.location.href = '/login';
    }

    fetchUsers();
    fetchSubmissions();
  }, [activeTab, statusFilter, categoryFilter]);

  const fetchUsers = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/users');
      if (res.ok) {
        const data = await res.json();
        setAllUsers(data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

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
      }
      
      const statsRes = await fetch('http://localhost:5000/api/master-approver/status-summary');
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }
    } catch (error) {
      console.error('Error fetching submissions:', error);
      showToast('Failed to fetch submissions', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  };

  const fetchExtractedData = async (emailSubmissionId) => {
    const res = await fetch(`http://localhost:5000/api/email-submissions/${emailSubmissionId}/extracted-data`);
    if (res.ok) {
      const data = await res.json();
      setEmailExtractedData(data);
      return data;
    }
    return null;
  };

  const selectSubmission = async (sub) => {
    setSelectedSubmission(sub);
    setSubmissionDetails(null);
    setEmailExtractedData(null);
    setSelectedStatus(sub.evaluation_status || 'pending');
    setShowEndorsement(false); // Reset endorsement visibility
    setIsModalOpen(true);
    
    try {
      const res = await fetch(`http://localhost:5000/api/submissions/${sub.id}/master-details`);
      if (res.ok) {
        const data = await res.json();
        setSubmissionDetails(data);
      }
      
      if (activeTab === 'email' && sub.id) {
        await fetchExtractedData(sub.id);
      }
    } catch (error) {
      console.error('Error fetching submission details:', error);
      showToast('Failed to fetch submission details', 'error');
    }
  };

  const handleSetStatus = async (status, notes = '') => {
    if (!selectedSubmission || !status) return;
    
    setIsSettingStatus(true);
    try {
      const res = await fetch(`http://localhost:5000/api/submissions/${selectedSubmission.id}/master-status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: status,
          master_approver_id: currentUser.id,
          notes: notes || document.getElementById('masterNotes')?.value || ''
        }),
      });

      if (res.ok) {
        const data = await res.json();
        showToast(`Status updated to ${getStatusDisplay(status)}`, 'success');
        fetchSubmissions();
        setSelectedSubmission({ ...selectedSubmission, evaluation_status: status });
        setShowConfirmModal(false);
        setPendingStatusAction(null);
        setShowDowngradeConfirm(false);
        setPendingDowngradeType(null);
        setIsModalOpen(false);
      } else {
        const error = await res.json();
        showToast(error.detail || 'Failed to update status', 'error');
      }
    } catch (error) {
      showToast('Failed to update status', 'error');
    } finally {
      setIsSettingStatus(false);
    }
  };

  const confirmStatusChange = (status) => {
    setSelectedStatus(status);
    setPendingStatusAction(status);
    setShowConfirmModal(true);
  };

  // Downgrade Logic - Step 1: Open downgrade modal
  const handleOpenDowngradeModal = () => {
    setShowDowngradeModal(true);
  };

  // Downgrade Logic - Step 2: Select downgrade type, show confirmation
  const handleDowngradeWithConfirm = (downgradeType) => {
    setPendingDowngradeType(downgradeType);
    setShowDowngradeModal(false);
    setShowDowngradeConfirm(true);
  };

  // Downgrade Logic - Step 3: Confirm and submit
  const confirmDowngradeVote = async () => {
    if (!pendingDowngradeType) return;
    setDowngradeConfirmLoading(true);
    try {
      await handleSetStatus(pendingDowngradeType, `Downgraded to ${getStatusDisplay(pendingDowngradeType)}`);
      setShowDowngradeConfirm(false);
      setPendingDowngradeType(null);
    } finally {
      setDowngradeConfirmLoading(false);
    }
  };

  // Return to Sender - Direct action
  const handleReturnToSender = () => {
    setPendingStatusAction('return_to_sender');
    setShowConfirmModal(true);
  };

  const getStatusColor = (status) => {
    const safeStatus = status || 'pending';
    switch (safeStatus) {
      case 'endorse': return 'bg-emerald-100 text-emerald-700';
      case 'downgraded-non_competitive': return 'bg-yellow-100 text-yellow-700';
      case 'downgraded-poster_only': return 'bg-orange-100 text-orange-700';
      case 'pending': return 'bg-slate-100 text-slate-700';
      case 'return_to_sender': return 'bg-red-100 text-red-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const getStatusDisplay = (status) => {
    switch (status) {
      case 'endorse': return 'Endorsed';
      case 'downgraded-non_competitive': return 'Non-Competitive (Poster)';
      case 'downgraded-poster_only': return 'Poster Only';
      case 'pending': return 'Pending';
      case 'return_to_sender': return 'Return to Sender';
      default: return status || 'Pending';
    }
  };

  const getCategoryColor = (category) => {
    if (!category) return 'bg-slate-100 text-slate-700';
    if (category.includes('Natural')) return 'bg-green-100 text-green-700';
    if (category.includes('Information')) return 'bg-blue-100 text-blue-700';
    if (category.includes('Development')) return 'bg-purple-100 text-purple-700';
    if (category.includes('Social')) return 'bg-pink-100 text-pink-700';
    if (category.includes('Food')) return 'bg-yellow-100 text-yellow-700';
    return 'bg-slate-100 text-slate-700';
  };

  const getEvaluatorName = (id) => {
    const user = allUsers.find(u => u.id === id);
    return user ? user.full_name : `Evaluator ${id}`;
  };

  const getVoteIcon = (status) => {
    switch (status) {
      case 'endorse': return '✅';
      case 'downgrade': return '⬇️';
      case 'reassign': return '🔄';
      default: return '❓';
    }
  };

  const getTitle = () => {
    if (activeTab === 'system') return selectedSubmission?.extension_project_title;
    return emailExtractedData?.title || selectedSubmission?.subject;
  };

  const getAuthor = () => {
    if (activeTab === 'system') return selectedSubmission?.author;
    return emailExtractedData?.project_leader || selectedSubmission?.sender_name;
  };

  const getSuc = () => {
    if (activeTab === 'system') return selectedSubmission?.suc_agencies;
    return selectedSubmission?.sender_name;
  };

  const getThematicArea = () => {
    if (activeTab === 'system') return selectedSubmission?.thematic_area;
    return emailExtractedData?.thematic_area || 'Not specified';
  };

  const getPaperCategory = () => {
    if (activeTab === 'system') return selectedSubmission?.paper_category;
    return emailExtractedData?.paper_category || 'Not specified';
  };

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
      if (match && match[1]) return match[1].split('?')[0].split('&')[0];
    }
    return null;
  };

  const filteredSubmissions = submissions.filter(sub => {
    if (activeTab === 'system') {
      if (statusFilter !== 'all' && sub.evaluation_status !== statusFilter) return false;
      if (categoryFilter !== 'all' && sub.paper_category !== categoryFilter) return false;
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        return (
          (sub.extension_project_title && sub.extension_project_title.toLowerCase().includes(search)) ||
          (sub.author && sub.author.toLowerCase().includes(search)) ||
          (sub.suc_agencies && sub.suc_agencies.toLowerCase().includes(search))
        );
      }
      return true;
    } else {
      if (statusFilter !== 'all' && sub.evaluation_status !== statusFilter) return false;
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        return (
          (sub.subject && sub.subject.toLowerCase().includes(search)) ||
          (sub.sender_name && sub.sender_name.toLowerCase().includes(search)) ||
          (sub.sender_email && sub.sender_email.toLowerCase().includes(search))
        );
      }
      return true;
    }
  });

  const totalSubmissions = submissions.length;
  const pendingCount = submissions.filter(s => s.evaluation_status === 'pending').length;
  const endorsedCount = submissions.filter(s => s.evaluation_status === 'endorse').length;
  const downgradedCount = submissions.filter(s => 
    s.evaluation_status === 'downgraded-non_competitive' || 
    s.evaluation_status === 'downgraded-poster_only'
  ).length;

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
              <div className={`shrink-0 mt-0.5 ${toast.type === 'success' ? 'text-emerald-700' : 'text-red-700'}`}>
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

      {/* Endorse Confirmation Modal */}
      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={() => { setShowConfirmModal(false); setPendingStatusAction(null); }}
        onConfirm={() => {
          if (pendingStatusAction === 'return_to_sender') {
            handleSetStatus('pending', 'Return to sender for revisions');
          } else {
            handleSetStatus(pendingStatusAction);
          }
        }}
        title={pendingStatusAction === 'return_to_sender' ? 'Return to Sender' : 'Confirm Status Change'}
        message={pendingStatusAction === 'return_to_sender' 
          ? 'Are you sure you want to return this submission to the sender for revisions?'
          : `Are you sure you want to change the status to <strong>${getStatusDisplay(pendingStatusAction)}</strong>?`
        }
        confirmText={pendingStatusAction === 'return_to_sender' ? 'Yes, Return' : 'Yes, Confirm'}
        cancelText="No, Cancel"
        isLoading={isSettingStatus}
        type={pendingStatusAction === 'return_to_sender' ? 'warning' : 'info'}
      />

      {/* Downgrade Selection Modal */}
      <DowngradeModal
        isOpen={showDowngradeModal}
        onClose={() => setShowDowngradeModal(false)}
        onSubmit={handleDowngradeWithConfirm}
        isLoading={downgradeLoading}
      />

      {/* Downgrade Confirmation Modal */}
      <ConfirmModal
        isOpen={showDowngradeConfirm}
        onClose={() => { setShowDowngradeConfirm(false); setPendingDowngradeType(null); }}
        onConfirm={confirmDowngradeVote}
        title="Confirm Downgrade"
        message={`Are you sure you want to downgrade this submission? This will be recorded as a ${pendingDowngradeType === 'downgraded-non_competitive' ? 'Non-Competitive (Poster)' : 'Poster Only'} decision.`}
        confirmText="Yes, Downgrade"
        cancelText="No, Cancel"
        isLoading={downgradeConfirmLoading}
        type="warning"
      />

      {/* Details Modal */}
      {isModalOpen && selectedSubmission && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative min-h-full flex items-center justify-center p-4">
            <div className="relative w-full max-w-6xl bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[95vh]">
              {/* Modal Header - Fixed */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-purple-50 to-blue-50 sticky top-0 z-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-purple-600">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">
                      {activeTab === 'system' ? 'Submission Details' : 'Email Details'}
                    </h3>
                    <p className="text-sm text-slate-500 truncate max-w-md">{getTitle() || 'Untitled'}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsModalOpen(false)} 
                  className="w-10 h-10 flex items-center justify-center rounded-lg bg-white text-slate-600 hover:bg-slate-100 transition shadow-sm"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Modal Body - Scrollable */}
              <div className="grid grid-cols-1 lg:grid-cols-2 h-[calc(95vh-80px)]">
                {/* Left Column - Submission Information */}
                <div className="p-6 overflow-y-auto border-r border-slate-200">
                  <h4 className="text-base font-bold text-slate-700 uppercase mb-4">Submission Information</h4>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-slate-600 font-medium">Title</p>
                      <p className="text-lg font-semibold text-slate-900">{getTitle() || 'Untitled'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600 font-medium">Author(s)</p>
                      <p className="text-lg font-semibold text-slate-900">{getAuthor() || 'Unknown'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600 font-medium">SUC / Agency</p>
                      <p className="text-lg font-semibold text-slate-900">{getSuc() || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600 font-medium">Thematic Area</p>
                      <p className="text-lg font-semibold text-slate-900">{getThematicArea() || 'Not specified'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600 font-medium">Paper Category</p>
                      <span className={`inline-flex px-3 py-1.5 rounded-full text-sm font-medium ${getCategoryColor(getPaperCategory())}`}>
                        {getPaperCategory()?.includes('Completed') ? 'Completed' : 
                         getPaperCategory()?.includes('Ongoing') ? 'Ongoing' : 
                         'N/A'}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600 font-medium">Source</p>
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${
                        activeTab === 'email' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                      }`}>
                        {activeTab === 'email' ? '📧 Email Submission' : '📝 System Submission'}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600 font-medium">Current Status</p>
                      <span className={`inline-flex px-3 py-1.5 rounded-full text-sm font-medium ${getStatusColor(selectedSubmission.evaluation_status || 'pending')}`}>
                        {getStatusDisplay(selectedSubmission.evaluation_status || 'pending')}
                      </span>
                    </div>
                  </div>

                  {/* Evaluator Votes */}
                  {submissionDetails?.votes && submissionDetails.votes.length > 0 && (
                    <div className="mt-6 pt-6 border-t border-slate-200">
                      <h4 className="text-base font-bold text-slate-700 uppercase mb-4">
                        Evaluator Votes ({submissionDetails.votes.length}/3)
                      </h4>
                      <div className="space-y-3">
                        {submissionDetails.votes.map((vote, idx) => (
                          <div key={idx} className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                            <div className="flex justify-between items-center">
                              <span className="font-semibold text-sm text-slate-900">
                                {getEvaluatorName(vote.evaluator_id)}
                              </span>
                              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(vote.vote_status)}`}>
                                {getVoteIcon(vote.vote_status)} {vote.vote_status.charAt(0).toUpperCase() + vote.vote_status.slice(1)}
                              </span>
                            </div>
                            {vote.vote_notes && (
                              <p className="text-sm text-slate-500 mt-2 italic">"{vote.vote_notes}"</p>
                            )}
                            {vote.vote_reassign_to && (
                              <p className="text-sm text-blue-600 mt-1">Reassigned to: {vote.vote_reassign_to}</p>
                            )}
                            {vote.vote_downgrade_to && (
                              <p className="text-sm text-orange-600 mt-1">Downgrade type: {vote.vote_downgrade_to}</p>
                            )}
                          </div>
                        ))}
                      </div>
                      
                      {/* Vote Summary */}
                      <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                        <div className="bg-emerald-50 p-3 rounded-xl">
                          <p className="text-2xl font-bold text-emerald-600">{submissionDetails.vote_stats?.endorse || 0}</p>
                          <p className="text-xs text-slate-500">Endorse</p>
                        </div>
                        <div className="bg-orange-50 p-3 rounded-xl">
                          <p className="text-2xl font-bold text-orange-600">{submissionDetails.vote_stats?.downgrade || 0}</p>
                          <p className="text-xs text-slate-500">Downgrade</p>
                        </div>
                        <div className="bg-blue-50 p-3 rounded-xl">
                          <p className="text-2xl font-bold text-blue-600">{submissionDetails.vote_stats?.reassign || 0}</p>
                          <p className="text-xs text-slate-500">Reassign</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Master Approver Controls */}
                  <div className="mt-6 pt-6 border-t-2 border-purple-200">
                    <h4 className="text-base font-bold text-purple-700 uppercase mb-3 flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 019 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003.001 2.48z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 00.495-7.467 5.99 5.99 0 00-1.925 3.546 5.974 5.974 0 01-2.133-1A3.75 3.75 0 0012 18z" />
                      </svg>
                      Master Approver Control
                    </h4>
                    <p className="text-xs text-slate-500 mb-3">Set the final decision for this abstract</p>
                    
                    <div className="space-y-3">
                      {/* Endorse for Presentation - Green */}
                      <button
                        onClick={() => confirmStatusChange('endorse')}
                        disabled={selectedSubmission.evaluation_status === 'endorse'}
                        className="w-full bg-emerald-600 text-white py-3 rounded-xl font-semibold hover:bg-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Endorse for Presentation
                      </button>
                      
                      {/* Downgrade - Yellow/Orange */}
                      <button
                        onClick={handleOpenDowngradeModal}
                        disabled={selectedSubmission.evaluation_status === 'downgraded-non_competitive' || selectedSubmission.evaluation_status === 'downgraded-poster_only'}
                        className="w-full bg-yellow-500 text-white py-3 rounded-xl font-semibold hover:bg-yellow-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                        </svg>
                        Downgrade
                      </button>
                      
                      {/* Return to Sender - Red */}
                      <button
                        onClick={handleReturnToSender}
                        disabled={selectedSubmission.evaluation_status === 'pending'}
                        className="w-full bg-red-500 text-white py-3 rounded-xl font-semibold hover:bg-red-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
                        </svg>
                        Return to Sender
                      </button>
                    </div>
                  </div>
                </div>

                {/* Right Column - File Viewer */}
                <div className="bg-slate-50 p-6 overflow-y-auto">
                  <h4 className="text-base font-bold text-slate-700 uppercase mb-4">File Viewer</h4>
                  
                  {activeTab === 'system' ? (
                    <div className="space-y-6">
                      {/* Abstract PDF - Always visible */}
                      <div>
                        <p className="text-sm font-semibold text-slate-700 mb-3">Abstract PDF</p>
                        {selectedSubmission.abstract_view_url ? (
                          <div className="border rounded-lg bg-white overflow-hidden" style={{ height: '450px' }}>
                            <iframe 
                              src={`https://drive.google.com/file/d/${extractGoogleDriveId(selectedSubmission.abstract_view_url)}/preview?embedded=true`} 
                              className="w-full h-full" 
                              allow="autoplay" 
                            />
                          </div>
                        ) : (
                          <div className="text-center py-16 text-slate-500 bg-white rounded-lg border text-lg">No Abstract Available</div>
                        )}
                      </div>
                      
                      {/* Endorsement PDF - Collapsible */}
                      {selectedSubmission.endorsement_view_url && (
                        <div>
                          <button
                            onClick={() => setShowEndorsement(!showEndorsement)}
                            className="w-full flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition"
                          >
                            <span className="text-sm font-semibold text-slate-700">Endorsement PDF</span>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-slate-500">
                                {showEndorsement ? 'Hide' : 'Show'}
                              </span>
                              <svg 
                                xmlns="http://www.w3.org/2000/svg" 
                                fill="none" 
                                viewBox="0 0 24 24" 
                                strokeWidth={2} 
                                stroke="currentColor" 
                                className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${showEndorsement ? 'rotate-180' : ''}`}
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                              </svg>
                            </div>
                          </button>
                          
                          {showEndorsement && (
                            <div className="mt-3 border rounded-lg bg-white overflow-hidden transition-all duration-300" style={{ height: '350px' }}>
                              <iframe 
                                src={`https://drive.google.com/file/d/${extractGoogleDriveId(selectedSubmission.endorsement_view_url)}/preview?embedded=true`} 
                                className="w-full h-full" 
                                allow="autoplay" 
                              />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm font-semibold text-slate-700 mb-3">Attachment</p>
                      {selectedSubmission.attachment_filename && (
                        <p className="text-sm text-slate-500 mb-3">{selectedSubmission.attachment_filename}</p>
                      )}
                      {selectedSubmission.attachment_view_url ? (
                        <div className="border rounded-lg bg-white overflow-hidden" style={{ height: '550px' }}>
                          <iframe 
                            src={`https://drive.google.com/file/d/${extractGoogleDriveId(selectedSubmission.attachment_view_url)}/preview?embedded=true`} 
                            className="w-full h-full" 
                            allow="autoplay" 
                          />
                        </div>
                      ) : (
                        <div className="text-center py-16 text-slate-500 bg-white rounded-lg border text-lg">No Attachment Available</div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header - White Background */}
      <div className="bg-white border-b border-slate-200 px-8 py-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Master Approver Dashboard</h1>
            <p className="text-slate-500 text-sm mt-1">Final decision authority for all abstract submissions</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2.5 px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-full">
              <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold uppercase text-sm shadow-sm">
                {currentUser?.full_name?.charAt(0) || 'A'}
              </div>
              <div className="leading-tight">
                <p className="text-sm font-semibold text-slate-800">{currentUser?.full_name || 'Master Approver'}</p>
                <p className="text-[10px] text-slate-500 uppercase tracking-wider font-medium">Master Approver</p>
              </div>
            </div>
            <Link href="/login" className="text-red-600 hover:text-red-700 font-semibold text-sm transition">
              ← Logout
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
            <p className="text-2xl font-bold text-slate-900">{totalSubmissions}</p>
            <p className="text-sm text-slate-500">Total Submissions</p>
          </div>
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
            <p className="text-2xl font-bold text-yellow-600">{pendingCount}</p>
            <p className="text-sm text-slate-500">Pending Review</p>
          </div>
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
            <p className="text-2xl font-bold text-emerald-600">{endorsedCount}</p>
            <p className="text-sm text-slate-500">Endorsed</p>
          </div>
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
            <p className="text-2xl font-bold text-yellow-600">
              {submissions.filter(s => s.evaluation_status === 'downgraded-non_competitive').length}
            </p>
            <p className="text-sm text-slate-500">Non-Competitive</p>
          </div>
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
            <p className="text-2xl font-bold text-orange-600">
              {submissions.filter(s => s.evaluation_status === 'downgraded-poster_only').length}
            </p>
            <p className="text-sm text-slate-500">Poster Only</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
            <button 
              onClick={() => { setActiveTab('system'); setStatusFilter('all'); setCategoryFilter('all'); setSearchTerm(''); }} 
              className={`px-6 py-2.5 rounded-lg font-semibold text-sm transition ${activeTab === 'system' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-600 hover:text-slate-900'}`}
            >
              System Submissions
            </button>
            <button 
              onClick={() => { setActiveTab('email'); setCategoryFilter('all'); setSearchTerm(''); }} 
              className={`px-6 py-2.5 rounded-lg font-semibold text-sm transition ${activeTab === 'email' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Email Submissions
            </button>
          </div>
          <button
            onClick={fetchSubmissions}
            className="px-4 py-2.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
            Refresh
          </button>
        </div>

        {/* Filters */}
        <div className="flex gap-4 mb-6 flex-wrap">
          <div className="flex-1 min-w-[200px] relative">
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
            <option value="endorse">Endorsed</option>
            <option value="downgraded-non_competitive">Non-Competitive</option>
            <option value="downgraded-poster_only">Poster Only</option>
          </select>
          {activeTab === 'system' && (
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none"
            >
              <option value="all">All Categories</option>
              <option value="Completed Extension Project Papers">Completed Extension</option>
              <option value="Ongoing Extension Project Papers">Ongoing Extension</option>
            </select>
          )}
        </div>

        {/* Submissions Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  {activeTab === 'system' ? (
                    <>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Title & Author</th>
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
                    onClick={() => selectSubmission(sub)}
                    className="cursor-pointer border-b border-slate-100 hover:bg-purple-50/50 transition"
                  >
                    {activeTab === 'system' ? (
                      <>
                        <td className="px-6 py-4">
                          <p className="text-sm font-semibold text-slate-900">{sub.extension_project_title || 'Untitled'}</p>
                          <p className="text-xs text-slate-500 mt-1">{sub.author || 'Unknown Author'}</p>
                        </td>
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
                          <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(sub.evaluation_status || 'pending')}`}>
                            {getStatusDisplay(sub.evaluation_status || 'pending')}
                          </span>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-6 py-4">
                          <p className="text-sm font-semibold text-slate-900">{sub.subject || 'No Subject'}</p>
                          <p className="text-xs text-slate-500 mt-1">{sub.sender_name} ({sub.sender_email})</p>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">{sub.project_leader_name || sub.sender_name}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          {new Date(sub.email_received_at || sub.created_at).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: '2-digit', 
                            year: 'numeric' 
                          })}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(sub.evaluation_status || 'pending')}`}>
                            {getStatusDisplay(sub.evaluation_status || 'pending')}
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
              </div>
            )}
          </div>
        </div>
      </div>

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