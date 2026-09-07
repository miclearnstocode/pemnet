"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faFileAlt,
  faEnvelope,
  faUsers,
  faClock,
  faCheckCircle,
  faArrowDown,
  faSearch,
  faFilter,
  faSync,
  faEdit,
  faHistory,
  faSave,
  faTimes,
  faComment,
  faPaperPlane,
  faThumbsUp,
  faThumbsDown,
  faChevronLeft,
  faUserCircle,
  faSignOutAlt,
  faFilePdf,
  faEye,
  faDownload,
  faCheck,
  faExclamationTriangle,
  faList,
  faGavel,
  faChartBar,
  faFolderOpen,
  faInbox,
  faSpinner,
  faInfoCircle,
  faArrowRight,
  faClipboard,
  faUser,
  faSchool,
  faTag,
  faCalendarAlt,
  faPlus,
  faReply,
  faShare,
  faBookOpen,
  faLayerGroup,
  faCertificate,
  faFlag
} from '@fortawesome/free-solid-svg-icons';
import ReassignModal from '../components/ReassignModal';
import DowngradeModal from '../components/DowngradeModal';
import ConfirmModal from '../components/ConfirmModal';

export default function ReviewPage() {
  const [currentUser, setCurrentUser] = useState(null);
  const [currentEvaluatorId, setCurrentEvaluatorId] = useState(null);
  const [activeTab, setActiveTab] = useState('system');
  const [submissions, setSubmissions] = useState([]);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  
  const [allUsers, setAllUsers] = useState([]);
  const [emailExtractedData, setEmailExtractedData] = useState(null);

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [revisions, setRevisions] = useState([]);
  const [showRevisions, setShowRevisions] = useState(false);

  const [toast, setToast] = useState(null);
  const [votes, setVotes] = useState({ votes: [], evaluation_status: 'pending' });
  const [discussions, setDiscussions] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [voteNotes, setVoteNotes] = useState('');

  const [showReassignModal, setShowReassignModal] = useState(false);
  const [reassignLoading, setReassignLoading] = useState(false);
  
  const [showDowngradeModal, setShowDowngradeModal] = useState(false);
  const [downgradeLoading, setDowngradeLoading] = useState(false);
  
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [pendingVoteAction, setPendingVoteAction] = useState(null);
  
  const [checkingEmails, setCheckingEmails] = useState(false);
  const [isModalLoading, setIsModalLoading] = useState(false);

  const [showDowngradeConfirm, setShowDowngradeConfirm] = useState(false);
  const [pendingDowngradeType, setPendingDowngradeType] = useState(null);
  const [downgradeConfirmLoading, setDowngradeConfirmLoading] = useState(false);
  
  useEffect(() => {
    const storedUser = localStorage.getItem('pemnet_user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setCurrentUser(user);
        setCurrentEvaluatorId(user.id || 3);
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }

    fetch('http://localhost:5000/api/users')
      .then(res => res.json())
      .then(data => setAllUsers(data))
      .catch(err => console.error('Error fetching users:', err));
  }, []);

  useEffect(() => {
    if (currentEvaluatorId) {
      fetchSubmissions();
    }
  }, [activeTab, statusFilter, currentEvaluatorId]);

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
      const res = await fetch('http://localhost:5000/api/email-submissions/check', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        showToast(`Found ${data.processed} new email submissions`, 'success');
        fetchSubmissions();
      }
    } catch (error) {
      showToast('Failed to check emails', 'error');
    } finally {
      setCheckingEmails(false);
    }
  };

  const showToast = (message, type) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  };

  const fetchRevisions = async (extractedDataId) => {
    const res = await fetch(`http://localhost:5000/api/extracted-data/${extractedDataId}/revisions`);
    if (res.ok) {
      const data = await res.json();
      setRevisions(data);
    }
  };

  const fetchExtractedData = async (emailSubmissionId) => {
    const res = await fetch(`http://localhost:5000/api/email-submissions/${emailSubmissionId}/extracted-data`);
    if (res.ok) {
      const data = await res.json();
      setEmailExtractedData(data);
      if (data.id) {
        fetchRevisions(data.id);
      }
      return data;
    }
    return null;
  };

  const startEditing = () => {
    setEditForm({
      title: getTitle(),
      authors: getAuthor(),
      authors_list: emailExtractedData?.authors_list || '',
      project_leader: getProjectLeader(),
      sucs: getSuc(),
      corresponding_author_name: getCorrespondingAuthorName(),
      corresponding_author_email: getCorrespondingAuthorEmail(),
      corresponding_author_position: getCorrespondingAuthorPosition(),
      paper_category: getPaperCategory(),
      thematic_area: getThematicArea(),
      theme: getTheme()
    });
    setIsEditing(true);
  };

  const handleEditChange = (e) => {
    setEditForm({
      ...editForm,
      [e.target.name]: e.target.value
    });
  };

  const saveEdits = async () => {
    if (!emailExtractedData?.id) return;
    
    const res = await fetch(`http://localhost:5000/api/extracted-data/${emailExtractedData.id}/edit`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        evaluator_id: currentEvaluatorId,
        ...editForm
      })
    });

    if (res.ok) {
      showToast('Data updated successfully', 'success');
      setIsEditing(false);
      await fetchExtractedData(selectedSubmission.id);
      fetchSubmissions();
    } else {
      const error = await res.json();
      showToast(error.detail || 'Failed to update data', 'error');
    }
  };

  const selectSubmission = async (sub) => {
    setSelectedSubmission(sub);
    setEmailExtractedData(null);
    setIsEditing(false);
    setShowRevisions(false);

    const votesRes = await fetch(`http://localhost:5000/api/submissions/${sub.id}/evaluate`);
    const votesData = await votesRes.json();
    setVotes({ ...votesData, evaluation_status: votesData.evaluation_status || 'pending' });

    const discRes = await fetch(`http://localhost:5000/api/submissions/${sub.id}/discussions`);
    const discData = await discRes.json();
    setDiscussions(Array.isArray(discData) ? discData : []);

    if (activeTab === 'email' && sub.id) {
      await fetchExtractedData(sub.id);
    }
  };

  const handleVote = async (vote_status) => {
    if (!selectedSubmission) return;

    try {
      const res = await fetch(`http://localhost:5000/api/submissions/${selectedSubmission.id}/evaluate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          evaluator_id: currentEvaluatorId,
          vote_status: vote_status,
          vote_notes: voteNotes
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setVotes(data);
        showToast(`Voted: ${vote_status.replace('_', ' ')}`, 'success');
        setVoteNotes('');
        if (data.evaluation_status !== 'pending') fetchSubmissions();
        return true;
      } else {
        const error = await res.json();
        showToast(error.detail || 'Failed to vote', 'error');
        return false;
      }
    } catch (error) {
      showToast('Failed to vote', 'error');
      return false;
    }
  };

  const postMessage = async () => {
    if (!newMessage.trim() || !selectedSubmission) return;
    try {
      const res = await fetch(`http://localhost:5000/api/submissions/${selectedSubmission.id}/discussions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ evaluator_id: currentEvaluatorId, message: newMessage })
      });
      if (res.ok) {
        const data = await res.json();
        const newDiscussion = {
          id: data.id || Date.now(),
          evaluator_id: data.evaluator_id || currentEvaluatorId,
          message: data.message || newMessage,
          created_at: data.created_at || new Date().toLocaleString()
        };
        setDiscussions([...discussions, newDiscussion]);
        setNewMessage('');
        showToast('Message sent successfully!', 'success');
      }
    } catch (error) {
      showToast('Failed to send message', 'error');
    }
  };

  const handleEndorseWithConfirm = () => {
    setPendingVoteAction('endorse');
    setShowConfirmModal(true);
  };

  const confirmVote = async () => {
    if (!pendingVoteAction) return;
    setConfirmLoading(true);
    try {
      await handleVote(pendingVoteAction);
      setShowConfirmModal(false);
      setPendingVoteAction(null);
    } finally {
      setConfirmLoading(false);
    }
  };

  const handleOpenDowngradeModal = () => {
    setShowDowngradeModal(true);
  };

  const handleDowngradeWithConfirm = async (downgradeType) => {
    setPendingDowngradeType(downgradeType);
    setShowDowngradeModal(false);
    setShowDowngradeConfirm(true);
  };

  const handleDowngradeVote = async (downgradeType) => {
    if (!selectedSubmission || !downgradeType) return;
    setDowngradeLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/submissions/${selectedSubmission.id}/evaluate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          evaluator_id: currentEvaluatorId,
          vote_status: 'downgrade',
          vote_notes: voteNotes,
          vote_downgrade_to: downgradeType
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setVotes(data);
        showToast('Submission downgraded', 'success');
        setVoteNotes('');
        setDowngradeLoading(false);
        fetchSubmissions();
      } else {
        const error = await res.json();
        showToast(error.detail || 'Failed to downgrade', 'error');
        setDowngradeLoading(false);
      }
    } catch (error) {
      showToast('Failed to downgrade', 'error');
      setDowngradeLoading(false);
    }
  };

  const confirmDowngradeVote = async () => {
    if (!pendingDowngradeType) return;
    setDowngradeConfirmLoading(true);
    try {
      await handleDowngradeVote(pendingDowngradeType);
      setShowDowngradeConfirm(false);
      setPendingDowngradeType(null);
    } finally {
      setDowngradeConfirmLoading(false);
    }
  };

  const filteredSubmissions = submissions.filter(sub => {
    if (activeTab === 'system') {
      // FIXED: Use status field for filtering
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
      if (statusFilter !== 'all' && sub.status !== statusFilter) return false;
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        return (
          sub.subject.toLowerCase().includes(search) ||
          sub.project_leader_name.toLowerCase().includes(search) ||
          sub.sender_email.toLowerCase().includes(search)
        );
      }
      return true;
    }
  });

  // FIXED: Use status field for stat cards
  const totalSubmissions = submissions.length;
  const pendingCount = submissions.filter(s => s.status === 'pending').length;
  const endorsedCount = submissions.filter(s => s.status === 'endorse' || s.status === 'accepted').length;
  const downgradedCount = submissions.filter(s => s.status === 'downgraded').length;

  // FIXED: Status display functions use status field
  const getStatusColor = (status) => {
    const safeStatus = status || 'pending';
    switch (safeStatus) {
      case 'endorse':
      case 'accepted':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'downgraded':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'pending':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const getStatusDisplay = (status) => {
    switch (status) {
      case 'endorse':
      case 'accepted':
        return 'Endorsed';
      case 'downgraded':
        return 'Downgraded';
      case 'pending':
        return 'Pending Review';
      default:
        return status || 'Pending';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'endorse':
      case 'accepted':
        return faCheckCircle;
      case 'downgraded':
        return faExclamationTriangle;
      case 'pending':
        return faClock;
      default:
        return faInfoCircle;
    }
  };

  const getCategoryColor = (category) => {
    if (!category) return 'bg-slate-50 text-slate-700 border-slate-200';
    if (category.includes('Natural')) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (category.includes('Information')) return 'bg-blue-50 text-blue-700 border-blue-200';
    if (category.includes('Development')) return 'bg-purple-50 text-purple-700 border-purple-200';
    if (category.includes('Social')) return 'bg-pink-50 text-pink-700 border-pink-200';
    if (category.includes('Food')) return 'bg-amber-50 text-amber-700 border-amber-200';
    return 'bg-slate-50 text-slate-700 border-slate-200';
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Loading submissions...</p>
        </div>
      </div>
    );
  }

  const getTitle = () => {
    if (activeTab === 'system') return selectedSubmission?.extension_project_title;
    return emailExtractedData?.title || selectedSubmission?.subject;
  };

  const getProjectLeader = () => {
    if (activeTab === 'system') return selectedSubmission?.author || 'Not specified';
    return emailExtractedData?.project_leader || selectedSubmission?.project_leader_name || 'Not specified';
  };

  const getAuthor = () => {
    if (activeTab === 'system') return selectedSubmission?.author;
    return emailExtractedData?.project_leader || selectedSubmission?.project_leader_name || selectedSubmission?.sender_name;
  };

  const getSuc = () => {
    if (activeTab === 'system') return selectedSubmission?.suc_agencies;
    return emailExtractedData?.sucs || selectedSubmission?.sender_name;
  };

  const getThematicArea = () => {
    if (activeTab === 'system') return selectedSubmission?.thematic_area;
    return emailExtractedData?.thematic_area || 'Not specified';
  };

  const getPaperCategory = () => {
    if (activeTab === 'system') return selectedSubmission?.paper_category;
    return emailExtractedData?.paper_category || 'Not specified';
  };

  const getCorrespondingAuthorName = () => {
    if (activeTab === 'system') return selectedSubmission?.corresponding_author_name || 'Not specified';
    return emailExtractedData?.corresponding_author_name || 'Not specified';
  };

  const getCorrespondingAuthorEmail = () => {
    if (activeTab === 'system') return selectedSubmission?.corresponding_author_email || 'Not specified';
    return emailExtractedData?.corresponding_author_email || 'Not specified';
  };

  const getCorrespondingAuthorPosition = () => {
    if (activeTab === 'system') return selectedSubmission?.corresponding_author_position || 'Not specified';
    return emailExtractedData?.corresponding_author_position || 'Not specified';
  };

  const getTheme = () => {
    if (activeTab === 'system') return 'Not specified';
    return emailExtractedData?.theme || 'Not specified';
  };

  const getEvaluatorName = (id) => {
    const user = allUsers.find(u => u.id === id);
    if (user) return user.full_name;
    return 'Evaluator';
  };

  // Get the display status for a submission (for the table)
  const getSubmissionStatus = (sub) => {
    if (activeTab === 'system') {
      return sub.status || 'pending';
    } else {
      return sub.status || 'pending';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      {toast && (
        <div className="fixed top-6 right-6 z-50 animate-slide-in">
          <div className={`relative w-96 p-5 rounded-2xl border shadow-xl backdrop-blur-sm ${
            toast.type === 'success' 
              ? 'bg-emerald-50/90 border-emerald-200' 
              : 'bg-red-50/90 border-red-200'
          }`}>
            <div className="flex items-start gap-4">
              <div className={`shrink-0 mt-0.5 w-10 h-10 rounded-full flex items-center justify-center ${
                toast.type === 'success' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
              }`}>
                <FontAwesomeIcon icon={toast.type === 'success' ? faCheckCircle : faExclamationTriangle} className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className={`font-bold text-sm ${toast.type === 'success' ? 'text-emerald-800' : 'text-red-800'}`}>
                  {toast.type === 'success' ? 'Success!' : 'Error!'}
                </p>
                <p className={`text-sm ${toast.type === 'success' ? 'text-emerald-700' : 'text-red-700'}`}>{toast.message}</p>
              </div>
              <button onClick={() => setToast(null)} className="text-slate-400 hover:text-slate-600 transition">
                <FontAwesomeIcon icon={faTimes} className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      <ReassignModal
        isOpen={showReassignModal}
        onClose={() => setShowReassignModal(false)}
        onSubmit={async (newThematicArea) => {
          setReassignLoading(true);
          try {
            const res = await fetch(`http://localhost:5000/api/submissions/${selectedSubmission.id}/evaluate`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                evaluator_id: currentEvaluatorId,
                vote_status: 'reassign',
                vote_notes: voteNotes,
                vote_reassign_to: newThematicArea
              }),
            });
            if (res.ok) {
              const data = await res.json();
              setVotes(data);
              setShowReassignModal(false);
              setVoteNotes('');
              setReassignLoading(false);
              showToast(`Thematic area updated to "${newThematicArea}"`, 'success');
              fetchSubmissions();
              setSelectedSubmission({ ...selectedSubmission, thematic_area: newThematicArea });
            } else {
              const error = await res.json();
              showToast(error.detail || 'Failed to update thematic area', 'error');
              setReassignLoading(false);
            }
          } catch (error) {
            showToast('Failed to update thematic area', 'error');
            setReassignLoading(false);
          }
        }}
        currentThematicArea={getThematicArea()}
      />

      <DowngradeModal
        isOpen={showDowngradeModal}
        onClose={() => setShowDowngradeModal(false)}
        onSubmit={handleDowngradeWithConfirm}
        isLoading={downgradeLoading}
      />

      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={() => { setShowConfirmModal(false); setPendingVoteAction(null); }}
        onConfirm={confirmVote}
        title="Endorse for Presentation"
        message="Are you sure you want to endorse this submission for presentation?"
        confirmText="Yes, Endorse"
        cancelText="No, Cancel"
        isLoading={confirmLoading}
      />
      
      <ConfirmModal
        isOpen={showDowngradeConfirm}
        onClose={() => { setShowDowngradeConfirm(false); setPendingDowngradeType(null); }}
        onConfirm={confirmDowngradeVote}
        title="Confirm Downgrade"
        message={`Are you sure you want to downgrade this submission? This will be recorded as a ${pendingDowngradeType === 'non_competitive' ? 'Non-Competitive (Poster)' : 'Poster Only'} decision.`}
        confirmText="Yes, Downgrade"
        cancelText="No, Cancel"
        isLoading={downgradeConfirmLoading}
        type="warning"
      />
      
      {selectedSubmission && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSelectedSubmission(null)}></div>
          <div className="relative min-h-full flex items-center justify-center p-4">
            <div className="relative w-full max-w-7xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100">
              <div className="flex items-center justify-between px-8 py-5 border-b border-slate-100 bg-gradient-to-r from-blue-50/50 to-white">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/25">
                    <FontAwesomeIcon icon={activeTab === 'system' ? faFileAlt : faEnvelope} className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">
                      {activeTab === 'system' ? 'Submission Details' : 'Email Details'}
                    </h3>
                    <p className="text-sm text-slate-500 truncate max-w-md">{getTitle()}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedSubmission(null)} 
                  className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700 transition-all"
                >
                  <FontAwesomeIcon icon={faTimes} className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 h-full min-h-[600px]">
                <div className="p-8 overflow-y-auto max-h-[80vh] border-r border-slate-100 bg-white">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <FontAwesomeIcon icon={faClipboard} className="w-5 h-5 text-blue-600" />
                      <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Submission Information</h4>
                    </div>
                    {activeTab === 'email' && emailExtractedData?.id && (
                      <div className="flex gap-2">
                        {!isEditing && (
                          <button 
                            onClick={() => setShowRevisions(!showRevisions)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-all font-medium"
                          >
                            <FontAwesomeIcon icon={faHistory} className="w-3 h-3" />
                            {showRevisions ? 'Hide' : 'View'} History
                          </button>
                        )}
                        {!isEditing && (
                          <button 
                            onClick={startEditing}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-all font-medium"
                          >
                            <FontAwesomeIcon icon={faEdit} className="w-3 h-3" />
                            Edit
                          </button>
                        )}
                        {isEditing && (
                          <>
                            <button 
                              onClick={saveEdits}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-medium"
                            >
                              <FontAwesomeIcon icon={faSave} className="w-3 h-3" />
                              Save
                            </button>
                            <button 
                              onClick={() => setIsEditing(false)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-all font-medium"
                            >
                              <FontAwesomeIcon icon={faTimes} className="w-3 h-3" />
                              Cancel
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>

                  {showRevisions && activeTab === 'email' && (
                    <div className="mb-6 max-h-48 overflow-y-auto bg-gradient-to-br from-slate-50 to-blue-50/30 border border-slate-200 rounded-2xl p-5">
                      <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <FontAwesomeIcon icon={faHistory} className="text-blue-600" />
                        Change History
                      </h5>
                      {revisions.length > 0 ? (
                        <div className="space-y-3">
                          {revisions.map((rev) => (
                            <div key={rev.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                              <div className="flex justify-between items-center mb-2">
                                <span className="text-xs font-semibold text-blue-600 flex items-center gap-1.5">
                                  <FontAwesomeIcon icon={faUserCircle} className="w-3 h-3" />
                                  {rev.edited_by_name} edited this
                                </span>
                                <span className="text-xs text-slate-400">{rev.created_at}</span>
                              </div>
                              {Object.keys(rev.changes).map((field) => (
                                <div key={field} className="text-xs text-slate-600 mb-1 flex items-center gap-2">
                                  <span className="font-medium capitalize">{field.replace('_', ' ')}:</span>
                                  <span className="line-through text-red-400">{rev.changes[field].old || 'None'}</span>
                                  <FontAwesomeIcon icon={faArrowRight} className="w-3 h-3 text-slate-400" />
                                  <span className="text-emerald-600 font-medium">{rev.changes[field].new || 'None'}</span>
                                </div>
                              ))}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-500 text-center py-4">No edits made yet</p>
                      )}
                    </div>
                  )}

                  <div className="space-y-6">
                    <div className="group">
                      <div className="flex items-center gap-2 text-sm font-medium text-slate-500 mb-1.5">
                        <FontAwesomeIcon icon={faFileAlt} className="w-4 h-4 text-blue-400" />
                        Title
                      </div>
                      {isEditing ? (
                        <input 
                          name="title" 
                          value={editForm.title} 
                          onChange={handleEditChange} 
                          className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none transition-all" 
                        />
                      ) : (
                        <p className="text-base font-semibold text-slate-900 leading-relaxed">{getTitle() || 'No title'}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="group">
                        <div className="flex items-center gap-2 text-sm font-medium text-slate-500 mb-1.5">
                          <FontAwesomeIcon icon={faTag} className="w-4 h-4 text-purple-400" />
                          Paper Category
                        </div>
                        {isEditing ? (
                          <input 
                            name="paper_category" 
                            value={editForm.paper_category} 
                            onChange={handleEditChange} 
                            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none transition-all" 
                          />
                        ) : (
                          <span className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-sm font-medium border ${getCategoryColor(getPaperCategory())}`}>
                            <FontAwesomeIcon icon={faBookOpen} className="w-3 h-3" />
                            {getPaperCategory()?.includes('Completed') ? 'Completed' : 'Ongoing'}
                          </span>
                        )}
                      </div>

                      <div className="group">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-sm font-medium text-slate-500 mb-1.5">
                            <FontAwesomeIcon icon={faLayerGroup} className="w-4 h-4 text-indigo-400" />
                            Thematic Area
                          </div>
                          {votes.evaluation_status === 'pending' && !isEditing && (
                            <button 
                              onClick={() => setShowReassignModal(true)} 
                              className="inline-flex items-center gap-1 text-xs bg-blue-50 text-blue-600 px-3 py-1 rounded-lg hover:bg-blue-100 transition-all font-medium"
                            >
                              <FontAwesomeIcon icon={faSync} className="w-3 h-3" />
                              Reassign
                            </button>
                          )}
                        </div>
                        {isEditing ? (
                          <input 
                            name="thematic_area" 
                            value={editForm.thematic_area} 
                            onChange={handleEditChange} 
                            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none transition-all" 
                          />
                        ) : (
                          <p className="text-base font-semibold text-slate-900">{getThematicArea()}</p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="group">
                        <div className="flex items-center gap-2 text-sm font-medium text-slate-500 mb-1.5">
                          <FontAwesomeIcon icon={faUser} className="w-4 h-4 text-emerald-400" />
                          Project Leader
                        </div>
                        {isEditing ? (
                          <input 
                            name="project_leader" 
                            value={editForm.project_leader} 
                            onChange={handleEditChange} 
                            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none transition-all" 
                          />
                        ) : (
                          <p className="text-base font-semibold text-slate-900">{getProjectLeader()}</p>
                        )}
                      </div>

                      <div className="group">
                        <div className="flex items-center gap-2 text-sm font-medium text-slate-500 mb-1.5">
                          <FontAwesomeIcon icon={faSchool} className="w-4 h-4 text-amber-400" />
                          SUC / Agency
                        </div>
                        {isEditing ? (
                          <input 
                            name="sucs" 
                            value={editForm.sucs} 
                            onChange={handleEditChange} 
                            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none transition-all" 
                          />
                        ) : (
                          <p className="text-base font-semibold text-slate-900">{getSuc()}</p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="group">
                        <div className="flex items-center gap-2 text-sm font-medium text-slate-500 mb-1.5">
                          <FontAwesomeIcon icon={faUserCircle} className="w-4 h-4 text-cyan-400" />
                          Corresponding Author
                        </div>
                        {isEditing ? (
                          <input 
                            name="corresponding_author_name" 
                            value={editForm.corresponding_author_name} 
                            onChange={handleEditChange} 
                            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none transition-all" 
                          />
                        ) : (
                          <p className="text-sm font-medium text-slate-900">{getCorrespondingAuthorName()}</p>
                        )}
                      </div>

                      <div className="group">
                        <div className="flex items-center gap-2 text-sm font-medium text-slate-500 mb-1.5">
                          <FontAwesomeIcon icon={faEnvelope} className="w-4 h-4 text-red-400" />
                          Corresponding Email
                        </div>
                        {isEditing ? (
                          <input 
                            name="corresponding_author_email" 
                            value={editForm.corresponding_author_email} 
                            onChange={handleEditChange} 
                            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none transition-all" 
                          />
                        ) : (
                          <p className="text-sm font-medium text-slate-900 break-all">{getCorrespondingAuthorEmail()}</p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="group">
                        <div className="flex items-center gap-2 text-sm font-medium text-slate-500 mb-1.5">
                          <FontAwesomeIcon icon={faFlag} className="w-4 h-4 text-rose-400" />
                          Theme
                        </div>
                        {isEditing ? (
                          <input 
                            name="theme" 
                            value={editForm.theme} 
                            onChange={handleEditChange} 
                            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none transition-all" 
                          />
                        ) : (
                          <p className="text-base font-semibold text-slate-900">{getTheme()}</p>
                        )}
                      </div>

                      <div className="group">
                        <div className="flex items-center gap-2 text-sm font-medium text-slate-500 mb-1.5">
                          <FontAwesomeIcon icon={faCertificate} className="w-4 h-4 text-violet-400" />
                          Final Status
                        </div>
                        <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-xl text-sm font-medium border ${getStatusColor(votes.evaluation_status)}`}>
                          <FontAwesomeIcon icon={getStatusIcon(votes.evaluation_status)} className="w-3.5 h-3.5" />
                          {getStatusDisplay(votes.evaluation_status)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {votes.evaluation_status === 'pending' && (
                    <div className="mt-8 pt-6 border-t border-slate-200 space-y-3">
                      <button 
                        onClick={handleEndorseWithConfirm} 
                        className="w-full inline-flex items-center justify-center gap-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white py-3.5 rounded-2xl font-semibold text-sm hover:from-emerald-600 hover:to-emerald-700 transition-all shadow-lg shadow-emerald-500/25"
                      >
                        <FontAwesomeIcon icon={faThumbsUp} className="w-5 h-5" />
                        Endorse for Presentation
                      </button>
                      
                      <button 
                        onClick={handleOpenDowngradeModal} 
                        className="w-full inline-flex items-center justify-center gap-3 bg-amber-50 text-amber-700 py-3.5 rounded-2xl font-semibold text-sm hover:bg-amber-100 transition-all border border-amber-200"
                      >
                        <FontAwesomeIcon icon={faThumbsDown} className="w-5 h-5" />
                        Downgrade
                      </button>
                    </div>
                  )}

                  <div className="mt-8 pt-6 border-t border-slate-200">
                    <div className="flex items-center gap-3 mb-4">
                      <FontAwesomeIcon icon={faUsers} className="w-5 h-5 text-blue-600" />
                      <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Live Votes</h4>
                      <span className="text-xs text-slate-400">({(votes.votes || []).length}/3)</span>
                    </div>
                    <div className="space-y-3">
                      {(votes.votes || []).map((vote, idx) => (
                        <div key={idx} className="p-4 bg-gradient-to-br from-slate-50 to-white border border-slate-200 rounded-2xl shadow-sm">
                          <div className="flex justify-between items-center">
                            <p className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                              <FontAwesomeIcon icon={faUserCircle} className="w-4 h-4 text-slate-400" />
                              {vote.evaluator_id === currentEvaluatorId 
                                ? `${currentUser?.full_name || 'You'} (You)` 
                                : getEvaluatorName(vote.evaluator_id)}
                            </p>
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-medium border ${getStatusColor(vote.vote_status)}`}>
                              <FontAwesomeIcon icon={getStatusIcon(vote.vote_status)} className="w-3 h-3" />
                              {vote.vote_status === 'endorse' ? 'Endorse' : 
                               vote.vote_status === 'downgrade' ? 'Downgraded' :
                               vote.vote_status?.replace('_', ' ').toUpperCase()}
                            </span>
                          </div>
                          {vote.vote_notes && (
                            <p className="mt-2 text-sm text-slate-500 italic bg-white p-3 rounded-xl border border-slate-100">
                              "{vote.vote_notes}"
                            </p>
                          )}
                        </div>
                      ))}
                      {(votes.votes || []).length === 0 && (
                        <p className="text-center text-slate-400 text-sm py-4">No votes yet</p>
                      )}
                    </div>
                  </div>

                  <div className="mt-8 pt-6 border-t border-slate-200">
                    <div className="flex items-center gap-3 mb-4">
                      <FontAwesomeIcon icon={faComment} className="w-5 h-5 text-indigo-600" />
                      <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Evaluator Discussion</h4>
                    </div>
                    <div className="max-h-48 overflow-y-auto bg-gradient-to-br from-slate-50 to-blue-50/20 border border-slate-200 rounded-2xl p-4 mb-4 space-y-3">
                      {Array.isArray(discussions) && discussions.length > 0 ? (
                        discussions.map((msg) => {
                          const isCurrentUser = msg.evaluator_id === currentEvaluatorId;
                          return (
                            <div key={msg.id || Math.random()} className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
                              <div className={`max-w-[80%] ${isCurrentUser ? 'items-end' : 'items-start'}`}>
                                <div className="flex items-center gap-2 mb-1">
                                  <FontAwesomeIcon icon={faUserCircle} className={`w-3 h-3 ${isCurrentUser ? 'text-blue-500' : 'text-slate-400'}`} />
                                  <span className={`text-xs font-bold ${isCurrentUser ? 'text-blue-700' : 'text-slate-600'}`}>
                                    {isCurrentUser ? 'You' : getEvaluatorName(msg.evaluator_id)}
                                  </span>
                                  <span className="text-[10px] text-slate-400">{msg.created_at}</span>
                                </div>
                                <div className={`px-4 py-2.5 rounded-2xl text-sm ${
                                  isCurrentUser 
                                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-br-none shadow-md shadow-blue-500/20' 
                                    : 'bg-white border border-slate-200 text-slate-900 rounded-bl-none shadow-sm'
                                }`}>
                                  <p>{msg.message || msg.text || 'No message'}</p>
                                </div>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <p className="text-center text-slate-400 text-sm py-6">No discussions yet</p>
                      )}
                    </div>
                    <div className="flex gap-3">
                      <input 
                        type="text" 
                        value={newMessage} 
                        onChange={(e) => setNewMessage(e.target.value)} 
                        onKeyDown={(e) => e.key === 'Enter' && postMessage()} 
                        placeholder="Write a message to other evaluators..." 
                        className="flex-1 px-4 py-2.5 border border-slate-200 rounded-2xl text-sm text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none transition-all" 
                      />
                      <button 
                        onClick={postMessage} 
                        className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-5 py-2.5 rounded-2xl font-semibold text-sm hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg shadow-blue-500/25"
                      >
                        <FontAwesomeIcon icon={faPaperPlane} className="w-4 h-4" />
                        Send
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-slate-50 to-blue-50/20 p-6 overflow-y-auto max-h-[80vh]">
                  <div className="flex items-center gap-3 mb-4">
                    <FontAwesomeIcon icon={faEye} className="w-5 h-5 text-indigo-600" />
                    <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider">File Viewer</h4>
                  </div>
                  
                  {activeTab === 'system' ? (
                    <div className="space-y-6">
                      <div>
                        <div className="flex items-center gap-2 text-sm font-medium text-slate-600 mb-3">
                          <FontAwesomeIcon icon={faFilePdf} className="w-4 h-4 text-red-500" />
                          Abstract PDF
                        </div>
                        {selectedSubmission.abstract_view_url ? (
                          <div className="border border-slate-200 rounded-2xl bg-white overflow-hidden shadow-lg shadow-slate-200/50" style={{ height: '500px' }}>
                            <iframe 
                              src={`https://drive.google.com/file/d/${extractGoogleDriveId(selectedSubmission.abstract_view_url)}/preview?embedded=true`} 
                              className="w-full h-full" 
                              allow="autoplay" 
                              onLoad={() => setIsModalLoading(false)} 
                            />
                          </div>
                        ) : (
                          <div className="text-center py-16 text-slate-400 bg-white rounded-2xl border-2 border-dashed border-slate-200">
                            <FontAwesomeIcon icon={faFilePdf} className="w-12 h-12 text-slate-300 mb-3" />
                            <p className="text-sm font-medium">No Abstract Available</p>
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 text-sm font-medium text-slate-600 mb-3">
                          <FontAwesomeIcon icon={faFilePdf} className="w-4 h-4 text-emerald-500" />
                          Endorsement PDF
                        </div>
                        {selectedSubmission.endorsement_view_url ? (
                          <div className="border border-slate-200 rounded-2xl bg-white overflow-hidden shadow-lg shadow-slate-200/50" style={{ height: '500px' }}>
                            <iframe 
                              src={`https://drive.google.com/file/d/${extractGoogleDriveId(selectedSubmission.endorsement_view_url)}/preview?embedded=true`} 
                              className="w-full h-full" 
                              allow="autoplay" 
                            />
                          </div>
                        ) : (
                          <div className="text-center py-16 text-slate-400 bg-white rounded-2xl border-2 border-dashed border-slate-200">
                            <FontAwesomeIcon icon={faFilePdf} className="w-12 h-12 text-slate-300 mb-3" />
                            <p className="text-sm font-medium">No Endorsement Available</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center gap-2 text-sm font-medium text-slate-600 mb-3">
                          <FontAwesomeIcon icon={faFilePdf} className="w-4 h-4 text-rose-500" />
                          Attachment
                        </div>
                        {selectedSubmission.attachment_filename && (
                          <p className="text-sm text-slate-500 mb-3 flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-slate-200">
                            <FontAwesomeIcon icon={faFileAlt} className="w-4 h-4 text-slate-400" />
                            {selectedSubmission.attachment_filename}
                          </p>
                        )}
                        {selectedSubmission.attachment_view_url ? (
                          <div className="border border-slate-200 rounded-2xl bg-white overflow-hidden shadow-lg shadow-slate-200/50" style={{ height: '600px' }}>
                            <iframe 
                              src={`https://drive.google.com/file/d/${extractGoogleDriveId(selectedSubmission.attachment_view_url)}/preview?embedded=true`} 
                              className="w-full h-full" 
                              allow="autoplay" 
                              onLoad={() => setIsModalLoading(false)} 
                            />
                          </div>
                        ) : (
                          <div className="text-center py-16 text-slate-400 bg-white rounded-2xl border-2 border-dashed border-slate-200">
                            <FontAwesomeIcon icon={faFileAlt} className="w-12 h-12 text-slate-300 mb-3" />
                            <p className="text-sm font-medium">No Attachment Available</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white border-b border-slate-100 px-8 py-5 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
              <FontAwesomeIcon icon={faGavel} className="w-6 h-6 text-blue-600" />
              Abstract Review
            </h1>
            <p className="text-slate-500 text-sm mt-0.5 flex items-center gap-2">
              <FontAwesomeIcon icon={faInfoCircle} className="w-3.5 h-3.5 text-slate-400" />
              Review, vote, and collaborate with your fellow evaluators.
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 px-4 py-2 bg-gradient-to-br from-slate-50 to-white border border-slate-200 rounded-2xl shadow-sm">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-blue-500/25">
                {currentUser?.full_name?.charAt(0) || 'E'}
              </div>
              <div className="leading-tight">
                <p className="text-sm font-semibold text-slate-800">{currentUser?.full_name || 'Evaluator'}</p>
                <p className="text-[10px] text-slate-500 uppercase tracking-wider font-medium">{currentUser?.role || 'User'}</p>
              </div>
            </div>
            <Link href="/login" className="inline-flex items-center gap-2 text-red-600 hover:text-red-700 font-medium text-sm transition-all hover:bg-red-50 px-4 py-2 rounded-xl">
              <FontAwesomeIcon icon={faSignOutAlt} className="w-4 h-4" />
              Logout
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex gap-1 bg-white p-1 rounded-2xl border border-slate-200 shadow-sm">
            <button 
              onClick={() => { setActiveTab('system'); setStatusFilter('all'); setCategoryFilter('all'); setSearchTerm(''); }} 
              className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                activeTab === 'system' 
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <FontAwesomeIcon icon={faFileAlt} className="w-4 h-4" />
              System Submissions
            </button>
            <button 
              onClick={() => { setActiveTab('email'); setCategoryFilter('all'); setSearchTerm(''); }} 
              className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                activeTab === 'email' 
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <FontAwesomeIcon icon={faEnvelope} className="w-4 h-4" />
              Email Submissions
            </button>
          </div>
          {activeTab === 'email' && (
            <button 
              onClick={checkEmails} 
              disabled={checkingEmails} 
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-2xl font-semibold hover:from-blue-600 hover:to-blue-700 transition-all disabled:opacity-50 shadow-lg shadow-blue-500/25"
            >
              {checkingEmails ? (
                <><FontAwesomeIcon icon={faSpinner} className="w-4 h-4 animate-spin" />Checking...</>
              ) : (
                <><FontAwesomeIcon icon={faInbox} className="w-4 h-4" />Check Inbox</>
              )}
            </button>
          )}
        </div>

        {/* FIXED: Stat Cards now use the status field correctly */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-slate-900">{totalSubmissions}</p>
                <p className="text-sm text-slate-500">Total {activeTab === 'system' ? 'Submissions' : 'Emails'}</p>
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                <FontAwesomeIcon icon={faFolderOpen} className="w-6 h-6" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-amber-600">{pendingCount}</p>
                <p className="text-sm text-slate-500">Pending Review</p>
              </div>
              <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600">
                <FontAwesomeIcon icon={faClock} className="w-6 h-6" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-emerald-600">{endorsedCount}</p>
                <p className="text-sm text-slate-500">Endorsed</p>
              </div>
              <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
                <FontAwesomeIcon icon={faCheckCircle} className="w-6 h-6" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-amber-600">{downgradedCount}</p>
                <p className="text-sm text-slate-500">Downgraded</p>
              </div>
              <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600">
                <FontAwesomeIcon icon={faArrowDown} className="w-6 h-6" />
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-4 mb-6">
          <div className="flex-1 relative">
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400">
              <FontAwesomeIcon icon={faSearch} className="w-4 h-4" />
            </div>
            <input 
              type="text" 
              placeholder={activeTab === 'system' ? "Search by title, author, or SUC..." : "Search by subject, sender, or email..."} 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
              className="w-full px-4 py-3 pl-11 bg-white border border-slate-200 rounded-2xl text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none transition-all" 
            />
          </div>
          <div className="relative">
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400">
              <FontAwesomeIcon icon={faFilter} className="w-4 h-4" />
            </div>
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)} 
              className="pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none appearance-none cursor-pointer min-w-[160px]"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="endorse">Endorsed</option>
              <option value="downgraded">Downgraded</option>
              <option value="accepted">Accepted</option>
            </select>
          </div>
          {activeTab === 'system' && (
            <div className="relative">
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400">
                <FontAwesomeIcon icon={faTag} className="w-4 h-4" />
              </div>
              <select 
                value={categoryFilter} 
                onChange={(e) => setCategoryFilter(e.target.value)} 
                className="pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none appearance-none cursor-pointer min-w-[200px]"
              >
                <option value="all">All Categories</option>
                <option value="Completed Extension Project Papers">Completed Extension</option>
                <option value="Ongoing Extension Project Papers">Ongoing Extension</option>
              </select>
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-slate-50 to-blue-50/50 border-b border-slate-200">
                  {activeTab === 'system' ? (
                    <>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                        <div className="flex items-center gap-2">
                          <FontAwesomeIcon icon={faFileAlt} className="w-3.5 h-3.5 text-blue-500" />
                          Title & Author
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                        <div className="flex items-center gap-2">
                          <FontAwesomeIcon icon={faSchool} className="w-3.5 h-3.5 text-amber-500" />
                          SUC / Agency
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                        <div className="flex items-center gap-2">
                          <FontAwesomeIcon icon={faTag} className="w-3.5 h-3.5 text-purple-500" />
                          Category
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                        <div className="flex items-center gap-2">
                          <FontAwesomeIcon icon={faCalendarAlt} className="w-3.5 h-3.5 text-slate-400" />
                          Date
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                        <div className="flex items-center gap-2">
                          <FontAwesomeIcon icon={faFlag} className="w-3.5 h-3.5 text-rose-500" />
                          Status
                        </div>
                      </th>
                    </>
                  ) : (
                    <>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                        <div className="flex items-center gap-2">
                          <FontAwesomeIcon icon={faEnvelope} className="w-3.5 h-3.5 text-blue-500" />
                          Subject / Sender
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                        <div className="flex items-center gap-2">
                          <FontAwesomeIcon icon={faUser} className="w-3.5 h-3.5 text-emerald-500" />
                          Project Leader
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                        <div className="flex items-center gap-2">
                          <FontAwesomeIcon icon={faCalendarAlt} className="w-3.5 h-3.5 text-slate-400" />
                          Received
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                        <div className="flex items-center gap-2">
                          <FontAwesomeIcon icon={faFlag} className="w-3.5 h-3.5 text-rose-500" />
                          Status
                        </div>
                      </th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {filteredSubmissions.map((sub) => {
                  // Get the correct status for this submission
                  const displayStatus = activeTab === 'system' ? (sub.status || 'pending') : (sub.status || 'pending');
                  
                  return (
                    <tr 
                      key={sub.id} 
                      onClick={() => selectSubmission(sub)} 
                      className="cursor-pointer border-b border-slate-100 hover:bg-blue-50/40 transition-all group"
                    >
                      {activeTab === 'system' ? (
                        <>
                          <td className="px-6 py-4">
                            <p className="text-sm font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">{sub.extension_project_title}</p>
                            <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
                              <FontAwesomeIcon icon={faUserCircle} className="w-3 h-3 text-slate-400" />
                              {sub.author}
                            </p>
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-600">{sub.suc_agencies}</td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-medium border ${getCategoryColor(sub.paper_category)}`}>
                              <FontAwesomeIcon icon={faBookOpen} className="w-3 h-3" />
                              {sub.paper_category?.includes('Completed') ? 'Completed' : 'Ongoing'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-600">
                            <div className="flex items-center gap-1.5">
                              <FontAwesomeIcon icon={faCalendarAlt} className="w-3 h-3 text-slate-400" />
                              {new Date(sub.created_at).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-medium border ${getStatusColor(displayStatus)}`}>
                              <FontAwesomeIcon icon={getStatusIcon(displayStatus)} className="w-3 h-3" />
                              {getStatusDisplay(displayStatus)}
                            </span>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="px-6 py-4">
                            <p className="text-sm font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">{sub.subject}</p>
                            <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
                              <FontAwesomeIcon icon={faEnvelope} className="w-3 h-3 text-slate-400" />
                              {sub.sender_name} ({sub.sender_email})
                            </p>
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-600">{sub.project_leader_name}</td>
                          <td className="px-6 py-4 text-sm text-slate-600">
                            <div className="flex items-center gap-1.5">
                              <FontAwesomeIcon icon={faCalendarAlt} className="w-3 h-3 text-slate-400" />
                              {new Date(sub.email_received_at).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-medium border ${getStatusColor(displayStatus)}`}>
                              <FontAwesomeIcon icon={getStatusIcon(displayStatus)} className="w-3 h-3" />
                              {getStatusDisplay(displayStatus)}
                            </span>
                          </td>
                        </>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filteredSubmissions.length === 0 && (
              <div className="text-center py-16 text-slate-400">
                <FontAwesomeIcon icon={activeTab === 'system' ? faFolderOpen : faInbox} className="w-12 h-12 text-slate-300 mb-4" />
                <p className="text-sm font-medium">No {activeTab === 'system' ? 'submissions' : 'email submissions'} found</p>
                <p className="text-xs text-slate-400 mt-1">Try adjusting your filters or search terms</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .animate-slide-in { animation: slideIn 0.3s ease-out; }
      `}</style>
    </div>
  );
}