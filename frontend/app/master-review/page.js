"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCheckCircle,
  faTimesCircle,
  faClock,
  faFileAlt,
  faEnvelope,
  faSearch,
  faFilter,
  faSync,
  faUserCircle,
  faSignOutAlt,
  faGavel,
  faInfoCircle,
  faFolderOpen,
  faInbox,
  faSpinner,
  faEye,
  faFilePdf,
  faCalendarAlt,
  faTag,
  faUser,
  faSchool,
  faFlag,
  faExclamationTriangle,
  faWarning,
  faPaperPlane,
  faComment,
  faThumbsUp,
  faThumbsDown,
  faArrowDown,
  faUsers,
  faBookOpen,
  faLayerGroup,
  faCertificate,
  faEdit,
  faHistory
} from '@fortawesome/free-solid-svg-icons';
import ConfirmModal from '../components/ConfirmModal';
import DowngradeModal from '../components/DowngradeModal';
import EditSubmission from '../components/EditSubmission';
import DiscussionSection from '../components/DiscussionSection';
import ViewHistory from '../components/ViewHistory';

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
  const [emailLogs, setEmailLogs] = useState([]);
  const [loadingEmailLogs, setLoadingEmailLogs] = useState(false);
  
  // Email sending preference
  const [sendEmailConfirmation, setSendEmailConfirmation] = useState(true);
  
  // Collapsible sections
  const [showEndorsement, setShowEndorsement] = useState(false);
  
  // Edit Modal States
  const [showEditModal, setShowEditModal] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  
  // History Modal States
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  
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
        url = 'http://localhost:5000/api/email-submissions?status=all';
      }
      
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        const processedData = data.map(sub => {
          return {
            ...sub,
            submission_id: sub.submission_id || null
          };
        });
        setSubmissions(processedData);
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
    try {
      const res = await fetch(`http://localhost:5000/api/email-submissions/${emailSubmissionId}/extracted-data`);
      if (res.ok) {
        const data = await res.json();
        setEmailExtractedData(data);
        return data;
      }
    } catch (error) {
      console.error('Error fetching extracted data:', error);
    }
    return null;
  };

  const fetchEmailLogs = async (submissionId) => {
    if (!submissionId) return;
    setLoadingEmailLogs(true);
    try {
      const res = await fetch(`http://localhost:5000/api/email-logs/${submissionId}`);
      if (res.ok) {
        const data = await res.json();
        setEmailLogs(data);
      }
    } catch (error) {
      console.error('Error fetching email logs:', error);
    } finally {
      setLoadingEmailLogs(false);
    }
  };

  const selectSubmission = async (sub) => {
    setSelectedSubmission(sub);
    setSubmissionDetails(null);
    setEmailExtractedData(null);
    setEmailLogs([]);
    
    const submissionId = sub.submission_id;
    
    if (!submissionId) {
      console.error('No submission_id found for submission:', sub);
      showToast('Invalid submission data - missing submission_id', 'error');
      return;
    }
    
    // Fetch email logs for this submission
    await fetchEmailLogs(submissionId);
    
    // For email submissions, get the status from extracted_abstract_data
    if (activeTab === 'email' && sub.id) {
      const extractedData = await fetchExtractedData(sub.id);
      if (extractedData) {
        sub.status = extractedData.status || 'pending';
        sub.evaluation_status = extractedData.evaluation_status || 'pending';
        sub.submission_id = extractedData.submission_id || sub.submission_id;
        setSelectedSubmission(prev => ({
          ...prev,
          status: extractedData.status || 'pending',
          evaluation_status: extractedData.evaluation_status || 'pending',
          submission_id: extractedData.submission_id || prev.submission_id
        }));
      }
    }
    
    // For system submissions, use 'status' (master approver decision)
    setSelectedStatus(sub.status || 'pending');
    setShowEndorsement(false);
    setSendEmailConfirmation(true);
    setIsModalOpen(true);
    
    try {
      const res = await fetch(`http://localhost:5000/api/submissions/${submissionId}/master-details`);
      if (res.ok) {
        const data = await res.json();
        setSubmissionDetails(data);
      } else {
        console.error('Failed to fetch submission details for:', submissionId);
      }
    } catch (error) {
      console.error('Error fetching submission details:', error);
      showToast('Failed to fetch submission details', 'error');
    }
  };

  const handleEditSave = async (formData) => {
    if (!selectedSubmission) return;
    setEditLoading(true);
    
    try {
      const submissionId = selectedSubmission.submission_id;
      const isEmailSubmission = activeTab === 'email' && emailExtractedData?.id;
      
      // For email submissions, use the extracted data endpoint
      const url = isEmailSubmission
        ? `http://localhost:5000/api/extracted-data/${emailExtractedData.id}/edit`
        : `http://localhost:5000/api/submissions/${submissionId}/edit`;
      
      // Send the form data directly - no field mapping needed now
      const payload = { ...formData };
      
      const res = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          evaluator_id: currentUser.id,
          ...payload
        })
      });

      if (res.ok) {
        const data = await res.json();
        showToast(data.message || 'Submission updated successfully!', 'success');
        setShowEditModal(false);
        // Refresh the submission details
        await selectSubmission(selectedSubmission);
        await fetchSubmissions();
      } else {
        const error = await res.json();
        showToast(error.detail || 'Failed to update submission', 'error');
      }
    } catch (error) {
      console.error('Error updating submission:', error);
      showToast('Failed to update submission', 'error');
    } finally {
      setEditLoading(false);
    }
  };

  const handleSetStatus = async (status, notes = '') => {
    if (!selectedSubmission || !status) return;
    
    setIsSettingStatus(true);
    try {
      const submissionId = selectedSubmission.submission_id;
      
      if (!submissionId) {
        showToast('Invalid submission - missing submission_id', 'error');
        setIsSettingStatus(false);
        return;
      }
      
      const res = await fetch(`http://localhost:5000/api/submissions/${submissionId}/master-status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: status,
          master_approver_id: currentUser.id,
          notes: notes || document.getElementById('masterNotes')?.value || '',
          send_email: sendEmailConfirmation,
          submission_type: activeTab
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const emailMessage = data.email_sent ? ' Confirmation email sent to the corresponding author.' : '';
        showToast(`Status updated to ${getStatusDisplay(status)}.${emailMessage}`, 'success');
        
        // Refresh email logs after sending
        if (sendEmailConfirmation) {
          await fetchEmailLogs(submissionId);
        }
        
        // Update the submissions list using submission_id
        setSubmissions(prev => 
          prev.map(sub => {
            if (sub.submission_id === submissionId) {
              return { 
                ...sub, 
                status: status, // Master Approver decision
              };
            }
            return sub;
          })
        );
        
        setSelectedSubmission(prev => ({
          ...prev,
          status: status // Update Master Approver decision
        }));
        
        if (emailExtractedData) {
          setEmailExtractedData(prev => ({
            ...prev,
            status: status
          }));
        }
        
        // Update stats based on status
        setStats(prev => {
          const newStats = { ...prev };
          if (status === 'endorse') {
            newStats.pending = Math.max(0, (prev.pending || 0) - 1);
            newStats.endorsed = (prev.endorsed || 0) + 1;
          } else if (status === 'downgraded-non_competitive') {
            newStats.pending = Math.max(0, (prev.pending || 0) - 1);
            newStats.non_competitive = (prev.non_competitive || 0) + 1;
          } else if (status === 'downgraded-poster_only') {
            newStats.pending = Math.max(0, (prev.pending || 0) - 1);
            newStats.poster_only = (prev.poster_only || 0) + 1;
          }
          return newStats;
        });
        
        setShowConfirmModal(false);
        setPendingStatusAction(null);
        setShowDowngradeConfirm(false);
        setPendingDowngradeType(null);
        
        setTimeout(() => {
          setIsModalOpen(false);
        }, 1500);
        
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
    setSendEmailConfirmation(status === 'endorse');
    setShowConfirmModal(true);
  };

  const handleOpenDowngradeModal = () => {
    setShowDowngradeModal(true);
  };

  const handleDowngradeWithConfirm = (downgradeType) => {
    setPendingDowngradeType(downgradeType);
    setShowDowngradeModal(false);
    setShowDowngradeConfirm(true);
  };

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

  const handleReturnToSender = () => {
    setPendingStatusAction('return_to_sender');
    setSendEmailConfirmation(false);
    setShowConfirmModal(true);
  };

  const getStatusColor = (status) => {
    const safeStatus = status || 'pending';
    switch (safeStatus) {
      case 'endorse': return 'bg-emerald-100 text-emerald-700';
      case 'downgraded-non_competitive': return 'bg-yellow-100 text-yellow-700';
      case 'downgraded-poster_only': return 'bg-orange-100 text-orange-700';
      case 'downgraded': return 'bg-yellow-100 text-yellow-700';
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
      case 'downgraded': return 'Downgraded';
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
    // If id is a string, try to convert to number
    const userId = typeof id === 'string' ? parseInt(id) : id;
    const user = allUsers.find(u => u.id === userId);
    return user ? user.full_name : `Evaluator ${id}`;
  };

  const getVoteIcon = (status) => {
    switch (status) {
      case 'endorse': return faCheckCircle;
      case 'downgrade': return faArrowDown;
      case 'reassign': return faSync;
      default: return faInfoCircle;
    }
  };

  // Helper functions to get data from selectedSubmission
  const getTitle = () => {
    if (activeTab === 'system') {
      return selectedSubmission?.extension_project_title || 'Untitled';
    }
    return emailExtractedData?.title || selectedSubmission?.subject || 'Untitled';
  };

  const getProjectLeader = () => {
    if (activeTab === 'system') {
      return selectedSubmission?.project_leader || 'Unknown';
    }
    return emailExtractedData?.project_leader || selectedSubmission?.project_leader_name || selectedSubmission?.sender_name || 'Unknown';
  };

  const getAuthorsList = () => {
    if (activeTab === 'system') {
      // Check co_authors first
      if (selectedSubmission?.co_authors) {
        try {
          // Try to parse as JSON if it's an array
          const parsed = JSON.parse(selectedSubmission.co_authors);
          if (Array.isArray(parsed)) {
            return parsed.join(', ');
          }
          return selectedSubmission.co_authors;
        } catch {
          // If not valid JSON, return as is
          return selectedSubmission.co_authors;
        }
      }
      // If no co_authors, show project_leader
      return selectedSubmission?.project_leader || 'N/A';
    }
    // For email submissions
    if (emailExtractedData?.authors_list) {
      try {
        const parsed = JSON.parse(emailExtractedData.authors_list);
        if (Array.isArray(parsed)) {
          return parsed.join(', ');
        }
        return emailExtractedData.authors_list;
      } catch {
        return emailExtractedData.authors_list;
      }
    }
    return emailExtractedData?.project_leader || selectedSubmission?.project_leader_name || selectedSubmission?.sender_name || 'N/A';
  };

  const getSUCs = () => {
    if (activeTab === 'system') {
      return selectedSubmission?.suc_agencies || 'N/A';
    }
    return emailExtractedData?.sucs || selectedSubmission?.sender_name || 'N/A';
  };

  const getCorrespondingAuthorName = () => {
    if (activeTab === 'system') {
      return selectedSubmission?.corresponding_author_name || 'N/A';
    }
    return emailExtractedData?.corresponding_author_name || 'N/A';
  };

  const getCorrespondingAuthorEmail = () => {
    if (activeTab === 'system') {
      return selectedSubmission?.corresponding_author_email || 'N/A';
    }
    return emailExtractedData?.corresponding_author_email || selectedSubmission?.sender_email || 'N/A';
  };

  const getCorrespondingAuthorPosition = () => {
    if (activeTab === 'system') {
      return selectedSubmission?.corresponding_author_position || 'N/A';
    }
    return emailExtractedData?.corresponding_author_position || 'N/A';
  };

  const getPaperCategory = () => {
    if (activeTab === 'system') {
      return selectedSubmission?.paper_category || 'Not specified';
    }
    return emailExtractedData?.paper_category || 'Not specified';
  };

  const getThematicArea = () => {
    if (activeTab === 'system') {
      return selectedSubmission?.thematic_area || 'Not specified';
    }
    return emailExtractedData?.thematic_area || 'Not specified';
  };

  const getTheme = () => {
    if (activeTab === 'system') {
      return 'Not specified';
    }
    return emailExtractedData?.theme || 'Not specified';
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

  // Filter submissions - for master approver, use 'status' field
  const filteredSubmissions = submissions.filter(sub => {
    if (activeTab === 'system') {
      // Use status for filtering (master approver decision)
      if (statusFilter !== 'all' && sub.status !== statusFilter) return false;
      if (categoryFilter !== 'all' && sub.paper_category !== categoryFilter) return false;
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        return (
          (sub.extension_project_title && sub.extension_project_title.toLowerCase().includes(search)) ||
          (sub.project_leader && sub.project_leader.toLowerCase().includes(search)) ||
          (sub.suc_agencies && sub.suc_agencies.toLowerCase().includes(search))
        );
      }
      return true;
    } else {
      // For email submissions, use status
      if (statusFilter !== 'all' && sub.status !== statusFilter) return false;
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        return (
          (sub.subject && sub.subject.toLowerCase().includes(search)) ||
          (sub.sender_name && sub.sender_name.toLowerCase().includes(search)) ||
          (sub.sender_email && sub.sender_email.toLowerCase().includes(search)) ||
          (sub.project_leader_name && sub.project_leader_name.toLowerCase().includes(search))
        );
      }
      return true;
    }
  });

  // Calculate stats based on status (master approver decision)
  const totalSubmissions = submissions.length;
  const pendingCount = submissions.filter(s => s.status === 'pending').length;
  const endorsedCount = submissions.filter(s => s.status === 'endorse').length;
  const nonCompetitiveCount = submissions.filter(s => s.status === 'downgraded-non_competitive' || s.evaluation_status === 'downgraded-non_competitive').length;
  const posterOnlyCount = submissions.filter(s => s.status === 'downgraded-poster_only' || s.evaluation_status === 'downgraded-poster_only').length;

  // Get the latest email log status
  const getEmailStatus = () => {
    if (emailLogs.length === 0) return null;
    const latestLog = emailLogs[0];
    return latestLog.status; // 'sent', 'failed', 'pending'
  };

  const getEmailStatusBadge = () => {
    const status = getEmailStatus();
    if (!status) return null;
    
    const statusConfig = {
      'sent': { color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: faCheckCircle, label: 'Email Sent' },
      'failed': { color: 'bg-red-100 text-red-700 border-red-200', icon: faTimesCircle, label: 'Email Failed' },
      'pending': { color: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: faClock, label: 'Email Pending' }
    };
    
    const config = statusConfig[status] || statusConfig['pending'];
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${config.color}`}>
        <FontAwesomeIcon icon={config.icon} className="w-3.5 h-3.5" />
        {config.label}
      </span>
    );
  };

  // Field configuration for EditSubmission component
  const editFields = {
    extension_project_title: { label: 'Title', icon: faFileAlt, type: 'text' },
    project_leader: { label: 'Project Leader', icon: faUser, type: 'text' },
    presenter: { label: 'Presenter', icon: faUserCircle, type: 'text' },
    suc_agencies: { label: 'SUC / Agency', icon: faSchool, type: 'suc' },
    corresponding_author_name: { label: 'Corresponding Author', icon: faUserCircle, type: 'text' },
    corresponding_author_email: { label: 'Corresponding Email', icon: faEnvelope, type: 'email' },
    corresponding_author_position: { label: 'Corresponding Position', icon: faTag, type: 'text' },
    co_authors: { label: 'Co-Authors', icon: faUsers, type: 'text' },
    paper_category: { label: 'Paper Category', icon: faBookOpen, type: 'select', options: [
      'Completed Extension Project Papers',
      'Ongoing Extension Project Papers',
      'Not specified'
    ]},
    thematic_area: { label: 'Thematic Area', icon: faLayerGroup, type: 'select', options: [
      'Food Production, Agriculture, Fisheries, and Natural Resource Systems',
      'Health, Nutrition, Wellness, and Community Care',
      'Education, Literacy, Skills Development, and Lifelong Learning',
      'Livelihood, Entrepreneurship, Cooperatives, MSMEs, and Local Economic Development',
      'Environment, Climate Action, Disaster Risk Reduction, and Community Resilience',
      'Not specified'
    ]}
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
        <div className="fixed top-4 right-4 z-9999 animate-slide-in">
          <div className={`relative w-96 p-4 rounded-xl border shadow-lg ${
            toast.type === 'success' ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-start gap-3">
              <div className={`shrink-0 mt-0.5 ${toast.type === 'success' ? 'text-emerald-700' : 'text-red-700'}`}>
                <FontAwesomeIcon icon={toast.type === 'success' ? faCheckCircle : faTimesCircle} className="w-5 h-5" />
              </div>
              <div className={`flex-1 ${toast.type === 'success' ? 'text-emerald-700' : 'text-red-700'}`}>
                <p className="font-semibold text-sm">{toast.type === 'success' ? 'Success!' : 'Error!'}</p>
                <p className="text-sm">{toast.message}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Endorse Confirmation Modal with Email Option */}
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
        title={pendingStatusAction === 'return_to_sender' ? 'Return to Sender' : 
              pendingStatusAction === 'endorse' ? 'Endorse for Presentation' : 
              'Confirm Status Change'}
        message={pendingStatusAction === 'return_to_sender' 
          ? 'Are you sure you want to return this submission to the sender for revisions?'
          : pendingStatusAction === 'endorse'
            ? 'Are you sure you want to endorse this submission for presentation?'
            : `Are you sure you want to change the status to <strong>${getStatusDisplay(pendingStatusAction)}</strong>?`
        }
        confirmText={pendingStatusAction === 'return_to_sender' ? 'Yes, Return' : 'Yes, Confirm'}
        cancelText="No, Cancel"
        isLoading={isSettingStatus}
        type={pendingStatusAction === 'return_to_sender' ? 'warning' : pendingStatusAction === 'endorse' ? 'info' : 'info'}
        showEmailCheckbox={pendingStatusAction === 'endorse'}
        emailChecked={sendEmailConfirmation}
        onEmailToggle={setSendEmailConfirmation}
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

      {/* Edit Submission Modal */}
      <EditSubmission
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        data={emailExtractedData || selectedSubmission}
        onSave={handleEditSave}
        isLoading={editLoading}
        currentUser={currentUser}
        isMasterApprover={true}
        title="Edit Submission Details"
        fields={editFields}
      />

      {/* View History Modal */}
      <ViewHistory
        isOpen={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
        submissionId={selectedSubmission?.submission_id}
        extractedDataId={emailExtractedData?.id}
        isMasterApprover={true}
        title="Edit History"
      />

      {/* Details Modal */}
      {isModalOpen && selectedSubmission && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative min-h-full flex items-center justify-center p-4">
            <div className="relative w-full max-w-6xl bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[95vh]">
              {/* Modal Header - Fixed */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-linear-to-r from-purple-50 to-blue-50 sticky top-0 z-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <FontAwesomeIcon icon={faFileAlt} className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">
                      {activeTab === 'system' ? 'Submission Details' : 'Email Details'}
                    </h3>
                    <p className="text-sm text-slate-500 truncate max-w-md">{getTitle()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {/* Email Status Badge */}
                  {getEmailStatusBadge()}
                  <button
                    onClick={() => setShowHistoryModal(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-all font-medium"
                  >
                    <FontAwesomeIcon icon={faHistory} className="w-3 h-3" />
                    View History
                  </button>
                  <button 
                    onClick={() => setIsModalOpen(false)} 
                    className="w-10 h-10 flex items-center justify-center rounded-lg bg-white text-slate-600 hover:bg-slate-100 transition shadow-sm"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Modal Body - Scrollable */}
              <div className="grid grid-cols-1 lg:grid-cols-2 h-[calc(95vh-80px)]">
                {/* Left Column - Submission Information */}
                <div className="p-6 overflow-y-auto border-r border-slate-200">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-base font-bold text-slate-700 uppercase">Submission Information</h4>
                    <button
                      onClick={() => setShowEditModal(true)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-all font-medium"
                      disabled={!selectedSubmission}
                    >
                      <FontAwesomeIcon icon={faEdit} className="w-3 h-3" />
                      Edit Details
                    </button>
                  </div>
                  <div className="space-y-4">
                    {/* Title */}
                    <div>
                      <p className="text-sm text-slate-600 font-medium">Title</p>
                      <p className="text-lg font-semibold text-slate-900">{getTitle()}</p>
                    </div>
                    
                    {/* Project Leader */}
                    <div>
                      <p className="text-sm text-slate-600 font-medium">Project Leader</p>
                      <p className="text-lg font-semibold text-slate-900">{getProjectLeader()}</p>
                    </div>
                    
                    {/* Authors List */}
                    <div>
                      <p className="text-sm text-slate-600 font-medium">Authors</p>
                      <p className="text-lg font-semibold text-slate-900">{getAuthorsList()}</p>
                    </div>
                    
                    {/* SUCs */}
                    <div>
                      <p className="text-sm text-slate-600 font-medium">SUC / Agency</p>
                      <p className="text-lg font-semibold text-slate-900">{getSUCs()}</p>
                    </div>
                    
                    {/* Corresponding Author Name */}
                    <div>
                      <p className="text-sm text-slate-600 font-medium">Corresponding Author</p>
                      <p className="text-lg font-semibold text-slate-900">{getCorrespondingAuthorName()}</p>
                    </div>
                    
                    {/* Corresponding Author Email */}
                    <div>
                      <p className="text-sm text-slate-600 font-medium">Corresponding Author Email</p>
                      <p className="text-lg font-semibold text-slate-900 break-all">{getCorrespondingAuthorEmail()}</p>
                    </div>
                    
                    {/* Corresponding Author Position */}
                    <div>
                      <p className="text-sm text-slate-600 font-medium">Corresponding Author Position</p>
                      <p className="text-lg font-semibold text-slate-900">{getCorrespondingAuthorPosition()}</p>
                    </div>
                    
                    {/* Theme */}
                    <div>
                      <p className="text-sm text-slate-600 font-medium">Theme</p>
                      <p className="text-lg font-semibold text-slate-900">{getTheme()}</p>
                    </div>
                    
                    {/* Paper Category */}
                    <div>
                      <p className="text-sm text-slate-600 font-medium">Paper Category</p>
                      <span className={`inline-flex px-3 py-1.5 rounded-full text-sm font-medium ${getCategoryColor(getPaperCategory())}`}>
                        {getPaperCategory()?.includes('Completed') ? 'Completed' : 
                         getPaperCategory()?.includes('Ongoing') ? 'Ongoing' : 
                         getPaperCategory() || 'N/A'}
                      </span>
                    </div>
                    
                    {/* Thematic Area */}
                    <div>
                      <p className="text-sm text-slate-600 font-medium">Thematic Area</p>
                      <p className="text-lg font-semibold text-slate-900">{getThematicArea()}</p>
                    </div>
                    
                    {/* Source */}
                    <div>
                      <p className="text-sm text-slate-600 font-medium">Source</p>
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${
                        activeTab === 'email' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                      }`}>
                        {activeTab === 'email' ? '📧 Email Submission' : '📝 System Submission'}
                      </span>
                    </div>
                    
                    {/* Master Status - Show status (Master Approver decision) */}
                    <div>
                      <p className="text-sm text-slate-600 font-medium">Master Approver Status</p>
                      <span className={`inline-flex px-3 py-1.5 rounded-full text-sm font-medium ${getStatusColor(selectedSubmission.status || 'pending')}`}>
                        {getStatusDisplay(selectedSubmission.status || 'pending')}
                      </span>
                    </div>

                    {/* Email Notification Status */}
                    <div>
                      <p className="text-sm text-slate-600 font-medium">Email Notification</p>
                      {loadingEmailLogs ? (
                        <span className="inline-flex items-center gap-2 text-sm text-slate-500">
                          <FontAwesomeIcon icon={faSpinner} className="w-4 h-4 animate-spin" />
                          Loading...
                        </span>
                      ) : emailLogs.length > 0 ? (
                        <div className="space-y-2">
                          {emailLogs.map((log) => (
                            <div key={log.id} className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-200 text-sm">
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                                log.status === 'sent' ? 'bg-emerald-100 text-emerald-700' :
                                log.status === 'failed' ? 'bg-red-100 text-red-700' :
                                'bg-yellow-100 text-yellow-700'
                              }`}>
                                <FontAwesomeIcon 
                                  icon={log.status === 'sent' ? faCheckCircle : log.status === 'failed' ? faTimesCircle : faClock} 
                                  className="w-3 h-3" 
                                />
                                {log.status === 'sent' ? 'Sent' : log.status === 'failed' ? 'Failed' : 'Pending'}
                              </span>
                              <span className="text-xs text-slate-500 truncate max-w-37.5">{log.recipient_email}</span>
                              <span className="text-xs text-slate-400 ml-auto">
                                {log.sent_at ? new Date(log.sent_at).toLocaleString() : 'Not sent'}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-sm text-slate-400">No email sent</span>
                      )}
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
                                <FontAwesomeIcon icon={faUserCircle} className="w-4 h-4 text-slate-400 mr-2" />
                                {getEvaluatorName(vote.evaluator_id)}
                              </span>
                              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(vote.vote_status)}`}>
                                <FontAwesomeIcon icon={getVoteIcon(vote.vote_status)} className="w-3 h-3 mr-1" />
                                {vote.vote_status.charAt(0).toUpperCase() + vote.vote_status.slice(1)}
                              </span>
                            </div>
                            {vote.vote_notes && (
                              <p className="text-sm text-slate-500 mt-2 italic">"{vote.vote_notes}"</p>
                            )}
                            {vote.vote_reassign_to && (
                              <p className="text-sm text-blue-600 mt-1">
                                <FontAwesomeIcon icon={faSync} className="w-3 h-3 mr-1" />
                                Reassigned to: {vote.vote_reassign_to}
                              </p>
                            )}
                            {vote.vote_downgrade_to && (
                              <p className="text-sm text-orange-600 mt-1">
                                <FontAwesomeIcon icon={faArrowDown} className="w-3 h-3 mr-1" />
                                Downgrade type: {vote.vote_downgrade_to}
                              </p>
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

                  {/* Evaluator Discussion Section */}
                  <div className="mt-6 pt-6 border-t border-slate-200">
                    <DiscussionSection
                      submissionId={selectedSubmission?.submission_id}
                      currentUserId={currentUser?.id}
                      currentUserName={currentUser?.full_name}
                      isMasterApprover={true}
                      title="Evaluator Discussion"
                      maxHeight="200px"
                    />
                  </div>

                  {/* Master Approver Controls */}
                  <div className="mt-6 pt-6 border-t-2 border-purple-200">
                    <h4 className="text-base font-bold text-purple-700 uppercase mb-3 flex items-center gap-2">
                      <FontAwesomeIcon icon={faGavel} className="w-5 h-5" />
                      Master Approver Control
                    </h4>
                    <p className="text-xs text-slate-500 mb-3">Set the final decision for this abstract</p>
                    
                    <div className="space-y-3">
                      {/* Endorse for Presentation - Green */}
                      <button
                        onClick={() => confirmStatusChange('endorse')}
                        disabled={selectedSubmission.status === 'endorse'}
                        className="w-full bg-emerald-600 text-white py-3 rounded-xl font-semibold hover:bg-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        <FontAwesomeIcon icon={faThumbsUp} className="w-5 h-5" />
                        Endorse for Presentation
                        <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">📧</span>
                      </button>
                      
                      {/* Downgrade - Yellow/Orange */}
                      <button
                        onClick={handleOpenDowngradeModal}
                        disabled={selectedSubmission.status === 'downgraded-non_competitive' || selectedSubmission.status === 'downgraded-poster_only' || selectedSubmission.status === 'downgraded'}
                        className="w-full bg-yellow-500 text-white py-3 rounded-xl font-semibold hover:bg-yellow-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        <FontAwesomeIcon icon={faThumbsDown} className="w-5 h-5" />
                        Downgrade
                      </button>
                      
                      {/* Return to Sender - Red */}
                      <button
                        onClick={handleReturnToSender}
                        disabled={selectedSubmission.status === 'pending'}
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
                        <p className="text-sm font-semibold text-slate-700 mb-3">
                          <FontAwesomeIcon icon={faFilePdf} className="w-4 h-4 text-red-500 mr-2" />
                          Abstract PDF
                        </p>
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
                            <span className="text-sm font-semibold text-slate-700">
                              <FontAwesomeIcon icon={faFilePdf} className="w-4 h-4 text-emerald-500 mr-2" />
                              Endorsement PDF
                            </span>
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
                      <p className="text-sm font-semibold text-slate-700 mb-3">
                        <FontAwesomeIcon icon={faFilePdf} className="w-4 h-4 text-rose-500 mr-2" />
                        Attachment
                      </p>
                      {selectedSubmission.attachment_filename && (
                        <p className="text-sm text-slate-500 mb-3 flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-slate-200">
                          <FontAwesomeIcon icon={faFileAlt} className="w-4 h-4 text-slate-400" />
                          {selectedSubmission.attachment_filename}
                        </p>
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
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
              <FontAwesomeIcon icon={faGavel} className="w-6 h-6 text-blue-600" />
              Master Approver Dashboard
            </h1>
            <p className="text-slate-500 text-sm mt-0.5 flex items-center gap-2">
              <FontAwesomeIcon icon={faInfoCircle} className="w-3.5 h-3.5 text-slate-400" />
              Final decision authority for all abstract submissions
            </p>
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
            <Link href="/login" className="inline-flex items-center gap-2 text-red-600 hover:text-red-700 font-medium text-sm transition-all hover:bg-red-50 px-4 py-2 rounded-xl">
              <FontAwesomeIcon icon={faSignOutAlt} className="w-4 h-4" />
              Logout
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-6">
        {/* Stats Cards - Use status for master approver stats */}
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
            <p className="text-2xl font-bold text-yellow-600">{nonCompetitiveCount}</p>
            <p className="text-sm text-slate-500">Non-Competitive</p>
          </div>
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
            <p className="text-2xl font-bold text-orange-600">{posterOnlyCount}</p>
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
              <FontAwesomeIcon icon={faFileAlt} className="w-4 h-4 mr-2" />
              System Submissions
            </button>
            <button 
              onClick={() => { setActiveTab('email'); setCategoryFilter('all'); setSearchTerm(''); }} 
              className={`px-6 py-2.5 rounded-lg font-semibold text-sm transition ${activeTab === 'email' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-600 hover:text-slate-900'}`}
            >
              <FontAwesomeIcon icon={faEnvelope} className="w-4 h-4 mr-2" />
              Email Submissions
            </button>
          </div>
          <button
            onClick={fetchSubmissions}
            className="px-4 py-2.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition flex items-center gap-2"
          >
            <FontAwesomeIcon icon={faSync} className="w-5 h-5" />
            Refresh
          </button>
        </div>

        {/* Filters */}
        <div className="flex gap-4 mb-6 flex-wrap">
          <div className="flex-1 min-w-50 relative">
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400">
              <FontAwesomeIcon icon={faSearch} className="w-4 h-4" />
            </div>
            <input
              type="text"
              placeholder={activeTab === 'system' ? "Search by title, author, or SUC..." : "Search by subject, sender, or email..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2.5 pl-10 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div className="relative">
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400">
              <FontAwesomeIcon icon={faFilter} className="w-4 h-4" />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none appearance-none cursor-pointer min-w-40"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="endorse">Endorsed</option>
              <option value="downgraded-non_competitive">Non-Competitive</option>
              <option value="downgraded-poster_only">Poster Only</option>
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
                className="pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none appearance-none cursor-pointer min-w-50"
              >
                <option value="all">All Categories</option>
                <option value="Completed Extension Project Papers">Completed Extension</option>
                <option value="Ongoing Extension Project Papers">Ongoing Extension</option>
              </select>
            </div>
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
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">
                        <div className="flex items-center gap-2">
                          <FontAwesomeIcon icon={faFileAlt} className="w-3.5 h-3.5 text-blue-500" />
                          Title & Author
                        </div>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">
                        <div className="flex items-center gap-2">
                          <FontAwesomeIcon icon={faTag} className="w-3.5 h-3.5 text-purple-500" />
                          Category
                        </div>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">
                        <div className="flex items-center gap-2">
                          <FontAwesomeIcon icon={faCalendarAlt} className="w-3.5 h-3.5 text-slate-400" />
                          Date
                        </div>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">
                        <div className="flex items-center gap-2">
                          <FontAwesomeIcon icon={faUserCircle} className="w-3.5 h-3.5 text-blue-400" />
                          Evaluator Decision
                        </div>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">
                        <div className="flex items-center gap-2">
                          <FontAwesomeIcon icon={faGavel} className="w-3.5 h-3.5 text-purple-500" />
                          Master Status
                        </div>
                      </th>
                    </>
                  ) : (
                    <>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">
                        <div className="flex items-center gap-2">
                          <FontAwesomeIcon icon={faEnvelope} className="w-3.5 h-3.5 text-blue-500" />
                          Subject / Sender
                        </div>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">
                        <div className="flex items-center gap-2">
                          <FontAwesomeIcon icon={faUser} className="w-3.5 h-3.5 text-emerald-500" />
                          Project Leader
                        </div>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">
                        <div className="flex items-center gap-2">
                          <FontAwesomeIcon icon={faCalendarAlt} className="w-3.5 h-3.5 text-slate-400" />
                          Received
                        </div>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">
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
                  const evaluatorStatus = sub.evaluation_status || 'pending';
                  const masterStatus = sub.status || 'pending';
                  
                  return (
                    <tr
                      key={sub.submission_id || sub.id}
                      onClick={() => selectSubmission(sub)}
                      className="cursor-pointer border-b border-slate-100 hover:bg-purple-50/50 transition"
                    >
                      {activeTab === 'system' ? (
                        <>
                          <td className="px-6 py-4">
                            <p className="text-sm font-semibold text-slate-900">{sub.extension_project_title || 'Untitled'}</p>
                            <p className="text-xs text-slate-500 mt-1">{sub.project_leader || 'Unknown Project Leader'}</p>
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
                            <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(evaluatorStatus)}`}>
                              {getStatusDisplay(evaluatorStatus)}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(masterStatus)}`}>
                              {getStatusDisplay(masterStatus)}
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
                            <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(masterStatus)}`}>
                              {getStatusDisplay(masterStatus)}
                            </span>
                            {sub.extraction_status === 'failed' && (
                              <span className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-red-50 text-red-600 border border-red-200">
                                <FontAwesomeIcon icon={faExclamationTriangle} className="w-2.5 h-2.5" />
                                Needs Review
                              </span>
                            )}
                          </td>
                        </>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filteredSubmissions.length === 0 && (
              <div className="text-center py-12 text-slate-500">
                <FontAwesomeIcon icon={activeTab === 'system' ? faFolderOpen : faInbox} className="w-12 h-12 text-slate-300 mb-4" />
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