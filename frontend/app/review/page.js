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
  faFlag,
  faWarning,
  faPlusCircle
} from '@fortawesome/free-solid-svg-icons';
import ReassignModal from '../components/ReassignModal';
import DowngradeModal from '../components/DowngradeModal';
import ConfirmModal from '../components/ConfirmModal';
// Import the reusable components
import EditSubmission from '../components/EditSubmission';
import ViewHistory from '../components/ViewHistory';
import DiscussionSection from '../components/DiscussionSection';

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

  const [sucList, setSucList] = useState([]); 
  const [showEditModal, setShowEditModal] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  const [toast, setToast] = useState(null);
  const [votes, setVotes] = useState({ votes: [], evaluation_status: 'pending' });
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

    fetchAllUsers();
    fetchSucs();
  }, []);

  useEffect(() => {
    if (currentEvaluatorId) {
      fetchSubmissions();
    }
  }, [activeTab, statusFilter, currentEvaluatorId]);

  const fetchAllUsers = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/users');
      const data = await res.json();
      setAllUsers(data);
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  const fetchSucs = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/sucs');
      if (res.ok) {
        const data = await res.json();
        setSucList(data);
      }
    } catch (err) {
      console.error('Error fetching SUCs:', err);
    }
  };

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      let url;
      if (activeTab === 'system') {
        url = 'http://localhost:5000/api/submissions';
      } else {
        url = `http://localhost:5000/api/email-submissions?status=all`;
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
      setEmailExtractedData(null);

      const subId = sub.submission_id || sub.id;
      
      console.log('Selecting submission with ID:', subId, 'Type:', typeof subId);
      
      try {
          const votesRes = await fetch(`http://localhost:5000/api/submissions/${subId}/evaluate`);
          if (votesRes.ok) {
              const votesData = await votesRes.json();
              setVotes({ 
                  ...votesData, 
                  evaluation_status: votesData.evaluation_status || 'pending' 
              });
          } else {
              console.error('Failed to fetch votes:', await votesRes.text());
          }

          if (activeTab === 'email' && sub.id) {
              await fetchExtractedData(sub.id);
          }
      } catch (error) {
          console.error('Error selecting submission:', error);
          showToast('Failed to load submission details', 'error');
      }
  };

  const handleVote = async (vote_status) => {
      if (!selectedSubmission) return;

      const subId = selectedSubmission.submission_id || selectedSubmission.id;

      try {
          const res = await fetch(`http://localhost:5000/api/submissions/${subId}/evaluate`, {
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

  const handleEndorseWithConfirm = () => {
      if (!selectedSubmission) return;
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
      
      const subId = selectedSubmission.submission_id || selectedSubmission.id;
      
      try {
          const res = await fetch(`http://localhost:5000/api/submissions/${subId}/evaluate`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                  evaluator_id: currentEvaluatorId,
                  vote_status: downgradeType,
                  vote_notes: voteNotes,
              }),
          });
          if (res.ok) {
              const data = await res.json();
              setVotes(data);
              showToast(`Submission downgraded to ${downgradeType === 'downgraded-non_competitive' ? 'Non-Competitive' : 'Poster Only'}`, 'success');
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

  const handleEditSave = async (formData) => {
      if (!selectedSubmission) return;
      setEditLoading(true);
      
      try {
        const submissionId = selectedSubmission.submission_id || selectedSubmission.id;
        
        let url;
        let payload = { ...formData };

        if (activeTab === 'email' && emailExtractedData) {
          url = `http://localhost:5000/api/extracted-data/${emailExtractedData.id}/edit`;
          payload.evaluator_id = currentEvaluatorId;
        } else {
          url = `http://localhost:5000/api/submissions/${submissionId}/edit`;
          payload.evaluator_id = currentEvaluatorId;
        }
        
        const res = await fetch(url, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (res.ok) {
          const data = await res.json();
          
          let message = data.message || 'Submission updated successfully!';
          if (data.drive_move && data.drive_move.moved && data.drive_move.moved.length > 0) {
            message += ` ${data.drive_move.moved.length} file(s) moved to the new folder.`;
            if (data.drive_move.trashed_folders && data.drive_move.trashed_folders.length > 0) {
              message += ` ${data.drive_move.trashed_folders.length} empty folder(s) cleaned up.`;
            }
          } else if (data.drive_move && data.drive_move.error) {
            message += ' (Warning: Could not move files in Google Drive)';
          }
          
          showToast(message, 'success');
          setShowEditModal(false);
          
          // Refresh extracted data if applicable
          if (activeTab === 'email' && selectedSubmission.id) {
            await fetchExtractedData(selectedSubmission.id);
          }
          
          // Refresh submissions to get updated data
          fetchSubmissions();
          
          // Update selected submission with new data
          if (activeTab === 'system') {
            setSelectedSubmission(prev => ({
              ...prev,
              ...formData
            }));
          }
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

  const getEditFields = (submissionType) => {
    if (submissionType === 'email') {
      return {
        title: { label: 'Title', icon: faFileAlt, type: 'text' },
        project_leader: { label: 'Project Leader', icon: faUser, type: 'text' },
        sucs: { label: 'SUC / Agency', icon: faSchool, type: 'suc' },
        corresponding_author_name: { label: 'Corresponding Author', icon: faUserCircle, type: 'text' },
        corresponding_author_email: { label: 'Corresponding Email', icon: faEnvelope, type: 'email' },
        corresponding_author_position: { label: 'Corresponding Position', icon: faTag, type: 'text' },
        authors_list: { label: 'Authors List', icon: faUsers, type: 'text' },
        paper_category: { label: 'Paper Category', icon: faBookOpen, type: 'select', options: [
          'Completed Extension Project Paper',
          'Ongoing Extension Project Paper',
          'Not specified'
        ]},
        thematic_area: { label: 'Thematic Area', icon: faLayerGroup, type: 'select', options: [
          'Food Production, Agriculture, Fisheries, and Natural Resource Systems',
          'Health, Nutrition, Wellness, and Community Care',
          'Education, Literacy, Skills Development, and Lifelong Learning',
          'Livelihood, Entrepreneurship, Cooperatives, MSMEs, and Local Economic Development',
          'Environment, Climate Action, Disaster Risk Reduction, and Community Resilience',
          'Not specified'
        ]},
        theme: { label: 'Theme', icon: faFlag, type: 'text' }
      };
    }
    
    // System submission fields
    return {
      extension_project_title: { label: 'Title', icon: faFileAlt, type: 'text' },
      project_leader: { label: 'Project Leader', icon: faUser, type: 'text' },
      presenter: { label: 'Presenter', icon: faUserCircle, type: 'text' },
      suc_agencies: { label: 'SUC / Agency', icon: faSchool, type: 'suc' },
      corresponding_author_name: { label: 'Corresponding Author', icon: faUserCircle, type: 'text' },
      corresponding_author_email: { label: 'Corresponding Email', icon: faEnvelope, type: 'email' },
      corresponding_author_position: { label: 'Corresponding Position', icon: faTag, type: 'text' },
      co_authors: { label: 'Authors', icon: faUsers, type: 'text' },
      paper_category: { label: 'Paper Category', icon: faBookOpen, type: 'select', options: [
        'Completed Extension Project Paper',
        'Ongoing Extension Project Paper',
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
  };

  // SAFE FILTERING - Handle null values properly
  const filteredSubmissions = submissions.filter(sub => {
    if (!sub) return false;
    
    if (activeTab === 'system') {
      if (statusFilter !== 'all' && sub.status !== statusFilter) return false;
      if (categoryFilter !== 'all' && sub.paper_category !== categoryFilter) return false;
      
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        const title = (sub.extension_project_title || '').toLowerCase();
        const leader = (sub.project_leader || '').toLowerCase(); // FIX: Use project_leader
        const suc = (sub.suc_agencies || '').toLowerCase();
        return title.includes(search) || leader.includes(search) || suc.includes(search);
      }
      return true;
    } else {
      if (statusFilter !== 'all' && sub.status !== statusFilter) return false;
      
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        const subject = (sub.subject || '').toLowerCase();
        const projectLeader = (sub.project_leader_name || '').toLowerCase();
        const senderEmail = (sub.sender_email || '').toLowerCase();
        const senderName = (sub.sender_name || '').toLowerCase();
        
        return subject.includes(search) || 
               projectLeader.includes(search) || 
               senderEmail.includes(search) ||
               senderName.includes(search);
      }
      return true;
    }
  });

  // Calculate stat counts based on the current filter
  const getFilteredStats = () => {
    if (activeTab === 'system') {
      const filtered = submissions.filter(sub => {
        if (statusFilter !== 'all' && sub.status !== statusFilter) return false;
        if (categoryFilter !== 'all' && sub.paper_category !== categoryFilter) return false;
        return true;
      });
      
      const total = filtered.length;
      const pending = filtered.filter(s => s.status === 'pending' || !s.status).length;
      const endorsed = filtered.filter(s => s.status === 'endorse').length;
      const downgraded = filtered.filter(s => s.status === 'downgraded').length;
      
      return { total, pending, endorsed, downgraded, uncategorized: 0 };
    } else {
      const filtered = submissions.filter(sub => {
        if (statusFilter !== 'all' && sub.status !== statusFilter) return false;
        return true;
      });
      
      const total = filtered.length;
      const pending = filtered.filter(s => s.status === 'pending').length;
      const endorsed = filtered.filter(s => s.status === 'endorse').length;
      const uncategorized = filtered.filter(s => s.status === 'uncategorized').length;
      const downgraded = filtered.filter(s => s.status === 'downgraded').length;
      
      return { total, pending, endorsed, downgraded, uncategorized };
    }
  };

  const stats = getFilteredStats();

  // Status display functions
  const getStatusColor = (status) => {
    const safeStatus = status || 'pending';
    switch (safeStatus) {
      case 'endorse':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'downgraded':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'pending':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'uncategorized':
        return 'bg-gray-50 text-gray-700 border-gray-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const getStatusDisplay = (status) => {
    switch (status) {
      case 'endorse': return 'Endorsed';
      case 'downgraded': return 'Downgraded';
      case 'pending': return 'Pending Review';
      case 'uncategorized': return 'Uncategorized';
      case 'processed': return 'Processed';
      case 'rejected': return 'Rejected';
      default: return status || 'Pending';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'endorse':
        return faCheckCircle;
      case 'downgraded':
        return faExclamationTriangle;
      case 'pending':
        return faClock;
      case 'uncategorized':
        return faWarning;
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

  // Paper category options
  const paperCategoryOptions = [
    'Completed Extension Project Paper',
    'Ongoing Extension Project Paper',
    'Not specified'
  ];

  // Thematic area options
  const thematicAreaOptions = [
    'Food Production, Agriculture, Fisheries, and Natural Resource Systems',
    'Health, Nutrition, Wellness, and Community Care',
    'Education, Literacy, Skills Development, and Lifelong Learning',
    'Livelihood, Entrepreneurship, Cooperatives, MSMEs, and Local Economic Development',
    'Environment, Climate Action, Disaster Risk Reduction, and Community Resilience',
    'Not specified'
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-50 to-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Loading submissions...</p>
        </div>
      </div>
    );
  }
  
  const FIELD_MAP = {
    title:                    { system: 'extension_project_title',  email: 'title',                      fallbackEmail: 'subject' },
    projectLeader:            { system: 'project_leader',           email: 'project_leader',             fallbackEmail: 'project_leader_name' },
    authorsList:              { system: 'co_authors',               email: 'authors_list' },
    suc:                      { system: 'suc_agencies',             email: 'sucs' },
    correspondingAuthorName:  { system: 'corresponding_author_name', email: 'corresponding_author_name' },
    correspondingAuthorEmail: { system: 'corresponding_author_email', email: 'corresponding_author_email', fallbackEmail: 'sender_email' },
    correspondingAuthorPos:   { system: 'corresponding_author_position', email: 'corresponding_author_position' },
    paperCategory:            { system: 'paper_category',           email: 'paper_category' },
    thematicArea:             { system: 'thematic_area',            email: 'thematic_area' },
    theme:                    { system: 'theme',                    email: 'theme' },
  };

  const getField = (logicalName, fallback = 'Not specified') => {
    const mapping = FIELD_MAP[logicalName];
    if (!mapping) return fallback;

    let value;
    if (activeTab === 'system') {
      value = selectedSubmission?.[mapping.system];
    } else {
      value = emailExtractedData?.[mapping.email];
      if ((value === undefined || value === null || value === '') && mapping.fallbackEmail) {
        value = selectedSubmission?.[mapping.fallbackEmail];
      }
    }

    if (value === undefined || value === null) return fallback;
    if (typeof value === 'string' && value.trim() === '') return fallback;
    return value;
  };

  // Authors list needs custom JSON parsing, so it has its own function
  const getAuthorsList = () => {
    const raw = getField('authorsList', '');
    if (!raw) return 'Not specified';
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed.join(', ');
      return raw;
    } catch {
      return raw;
    }
  };

  // ====== BACKWARDS-COMPATIBLE WRAPPERS ======
  // Keep these so existing call sites don't break.
  const getTitle                     = () => getField('title');
  const getProjectLeader             = () => getField('projectLeader');
  const getSuc                       = () => getField('suc');
  const getThematicArea              = () => getField('thematicArea');
  const getPaperCategory             = () => getField('paperCategory');
  const getCorrespondingAuthorName   = () => getField('correspondingAuthorName');
  const getCorrespondingAuthorEmail  = () => getField('correspondingAuthorEmail');
  const getCorrespondingAuthorPosition = () => getField('correspondingAuthorPos');
  const getTheme                     = () => getField('theme');

  const getEvaluatorName = (id) => {
    const user = allUsers.find(u => u.id === id);
    if (user) return user.full_name;
    return 'Evaluator';
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-blue-50/30">
      {toast && (
        <div className="fixed top-6 right-6 z-100 animate-slide-in">
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
            // FIX: Use submission_id for all submissions
            const res = await fetch(`http://localhost:5000/api/submissions/${selectedSubmission.submission_id || selectedSubmission.id}/evaluate`, {
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
        paperCategory={getPaperCategory()}
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

      {/* MODAL: Reusable EditSubmission Component */}
      <EditSubmission
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        data={emailExtractedData || selectedSubmission}
        onSave={handleEditSave}
        isLoading={editLoading}
        currentUser={currentUser}
        isMasterApprover={false}
        title={activeTab === 'email' ? 'Edit Email Submission Details' : 'Edit Submission Details'}
        fields={getEditFields(activeTab === 'email' ? 'email' : 'system')}
        submissionType={activeTab === 'email' ? 'email' : 'system'}
      />

      {/* MODAL: Reusable ViewHistory Component */}
      <ViewHistory
        isOpen={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
        submissionId={selectedSubmission?.submission_id}
        extractedDataId={emailExtractedData?.id}
        isMasterApprover={false}
        title="Edit History"
      />
      
      {selectedSubmission && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSelectedSubmission(null)}></div>
          <div className="relative min-h-full flex items-center justify-center p-4">
            <div className="relative w-full max-w-7xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100">
              <div className="flex items-center justify-between px-8 py-5 border-b border-slate-100 bg-linear-to-r from-blue-50/50 to-white">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-linear-to-brrom-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/25">
                    <FontAwesomeIcon icon={activeTab === 'system' ? faFileAlt : faEnvelope} className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">
                      {activeTab === 'system' ? 'Submission Details' : 'Email Details'}
                    </h3>
                    <p className="text-sm text-slate-500 truncate max-w-md">{getTitle()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setSelectedSubmission(null)} 
                    className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700 transition-all"
                  >
                    <FontAwesomeIcon icon={faTimes} className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 h-full min-h-150">
                <div className="p-8 overflow-y-auto max-h-[80vh] border-r border-slate-100 bg-white">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <FontAwesomeIcon icon={faClipboard} className="w-5 h-5 text-blue-600" />
                      <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Submission Information</h4>
                    </div>

                    {/* Fixed Buttons with Labels */}
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => setShowHistoryModal(true)}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-all text-xs font-semibold"
                        title="View History"
                      >
                        <FontAwesomeIcon icon={faHistory} className="w-4 h-4" />
                        View History
                      </button>
                      <button 
                        onClick={() => setShowEditModal(true)}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-all text-xs font-semibold"
                        title="Edit Details"
                      >
                        <FontAwesomeIcon icon={faEdit} className="w-4 h-4" />
                        Edit Details
                      </button>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="group">
                      <div className="flex items-center gap-2 text-sm font-medium text-slate-500 mb-1.5">
                        <FontAwesomeIcon icon={faFileAlt} className="w-4 h-4 text-blue-400" />
                        Title
                      </div>
                      <p className="text-base font-semibold text-slate-900 leading-relaxed">{getTitle() || 'No title'}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="group">
                        <div className="flex items-center gap-2 text-sm font-medium text-slate-500 mb-1.5">
                          <FontAwesomeIcon icon={faUser} className="w-4 h-4 text-emerald-400" />
                          Project Leader
                        </div>
                        <p className="text-base font-semibold text-slate-900">{getProjectLeader()}</p>
                      </div>

                      <div className="group">
                        <div className="flex items-center gap-2 text-sm font-medium text-slate-500 mb-1.5">
                          <FontAwesomeIcon icon={faUsers} className="w-4 h-4 text-blue-400" />
                          Authors
                        </div>
                        <p className="text-base font-semibold text-slate-900">{getAuthorsList()}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="group">
                        <div className="flex items-center gap-2 text-sm font-medium text-slate-500 mb-1.5">
                          <FontAwesomeIcon icon={faSchool} className="w-4 h-4 text-amber-400" />
                          SUC / Agency
                        </div>
                        <p className="text-base font-semibold text-slate-900">{getSuc()}</p>
                      </div>

                      <div className="group">
                        <div className="flex items-center gap-2 text-sm font-medium text-slate-500 mb-1.5">
                          <FontAwesomeIcon icon={faUserCircle} className="w-4 h-4 text-cyan-400" />
                          Corresponding Author
                        </div>
                        <p className="text-sm font-medium text-slate-900">{getCorrespondingAuthorName()}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="group">
                        <div className="flex items-center gap-2 text-sm font-medium text-slate-500 mb-1.5">
                          <FontAwesomeIcon icon={faEnvelope} className="w-4 h-4 text-red-400" />
                          Corresponding Author Email
                        </div>
                        <p className="text-sm font-medium text-slate-900 break-all">{getCorrespondingAuthorEmail()}</p>
                      </div>

                      <div className="group">
                        <div className="flex items-center gap-2 text-sm font-medium text-slate-500 mb-1.5">
                          <FontAwesomeIcon icon={faTag} className="w-4 h-4 text-purple-400" />
                          Corresponding Author Position
                        </div>
                        <p className="text-sm font-medium text-slate-900">{getCorrespondingAuthorPosition()}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="group">
                        <div className="flex items-center gap-2 text-sm font-medium text-slate-500 mb-1.5">
                          <FontAwesomeIcon icon={faFlag} className="w-4 h-4 text-rose-400" />
                          Theme
                        </div>
                        <p className="text-base font-semibold text-slate-900">{getTheme()}</p>
                      </div>

                      <div className="group">
                        <div className="flex items-center gap-2 text-sm font-medium text-slate-500 mb-1.5">
                          <FontAwesomeIcon icon={faBookOpen} className="w-4 h-4 text-purple-400" />
                          Paper Category
                        </div>
                        <span className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-sm font-medium border ${getCategoryColor(getPaperCategory())}`}>
                          <FontAwesomeIcon icon={faBookOpen} className="w-3 h-3" />
                          {getPaperCategory()?.includes('Completed') ? 'Completed' : getPaperCategory() || 'Not specified'}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="group">
                        <div className="flex items-center gap-2 text-sm font-medium text-slate-500 mb-1.5">
                          <FontAwesomeIcon icon={faLayerGroup} className="w-4 h-4 text-indigo-400" />
                          Thematic Area
                        </div>
                        <p className="text-base font-semibold text-slate-900">{getThematicArea()}</p>
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

                  {/* Vote Buttons - Always visible for evaluators to vote */}
                  <div className="mt-8 pt-6 border-t border-slate-200 space-y-3">
                      <div className="flex items-center gap-2 mb-2">
                          <FontAwesomeIcon icon={faGavel} className="w-4 h-4 text-slate-400" />
                          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Cast Your Vote</span>
                          {votes.evaluation_status !== 'pending' && (
                              <span className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-50 text-blue-600 border border-blue-200">
                                  <FontAwesomeIcon icon={faCheckCircle} className="w-2.5 h-2.5" />
                                  Finalized by Master Approver
                              </span>
                          )}
                      </div>
                      
                      <button 
                          onClick={handleEndorseWithConfirm} 
                          className="w-full inline-flex items-center justify-center gap-3 bg-linear-to-r from-emerald-500 to-emerald-600 text-white py-3.5 rounded-2xl font-semibold text-sm hover:from-emerald-600 hover:to-emerald-700 transition-all shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={votes.evaluation_status !== 'pending'}
                          title={votes.evaluation_status !== 'pending' ? 'This submission has been finalized by the Master Approver' : ''}
                      >
                          <FontAwesomeIcon icon={faThumbsUp} className="w-5 h-5" />
                          Endorse for Presentation
                      </button>
                      
                      <button 
                          onClick={handleOpenDowngradeModal} 
                          className="w-full inline-flex items-center justify-center gap-3 bg-amber-50 text-amber-700 py-3.5 rounded-2xl font-semibold text-sm hover:bg-amber-100 transition-all border border-amber-200 hover:border-amber-300 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={votes.evaluation_status !== 'pending'}
                          title={votes.evaluation_status !== 'pending' ? 'This submission has been finalized by the Master Approver' : ''}
                      >
                          <FontAwesomeIcon icon={faThumbsDown} className="w-5 h-5" />
                          Downgrade
                      </button>
                  </div>

                  <div className="mt-8 pt-6 border-t border-slate-200">
                    <div className="flex items-center gap-3 mb-4">
                      <FontAwesomeIcon icon={faUsers} className="w-5 h-5 text-blue-600" />
                      <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Live Votes</h4>
                      <span className="text-xs text-slate-400">({(votes.votes || []).length}/3)</span>
                    </div>
                    <div className="space-y-3">
                      {(votes.votes || []).map((vote, idx) => (
                        <div key={idx} className="p-4 bg-linear-to-br from-slate-50 to-white border border-slate-200 rounded-2xl shadow-sm">
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

                  {/* REPLACED: Reusable DiscussionSection Component */}
                  <div className="mt-8 pt-6 border-t border-slate-200">
                    <DiscussionSection
                      submissionId={selectedSubmission?.submission_id || selectedSubmission?.id}
                      currentUserId={currentEvaluatorId}
                      currentUserName={currentUser?.full_name}
                      isMasterApprover={false}
                      title="Evaluator Discussion"
                      maxHeight="300px"
                    />
                  </div>
                </div>

                <div className="bg-linear-to-br from-slate-50 to-blue-50/20 p-6 overflow-y-auto max-h-[80vh]">
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
            <div className="flex items-center gap-3 px-4 py-2 bg-linear-to-br from-slate-50 to-white border border-slate-200 rounded-2xl shadow-sm">
              <div className="w-9 h-9 rounded-full bg-linear-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-blue-500/25">
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
                  ? 'bg-linear-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25' 
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
                  ? 'bg-linear-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25' 
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
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-linear-to-r from-blue-500 to-blue-600 text-white rounded-2xl font-semibold hover:from-blue-600 hover:to-blue-700 transition-all disabled:opacity-50 shadow-lg shadow-blue-500/25"
            >
              {checkingEmails ? (
                <><FontAwesomeIcon icon={faSpinner} className="w-4 h-4 animate-spin" />Checking...</>
              ) : (
                <><FontAwesomeIcon icon={faInbox} className="w-4 h-4" />Check Inbox</>
              )}
            </button>
          )}
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-slate-900">{stats.total}</p>
                <p className="text-sm text-slate-500">
                  {activeTab === 'system' ? 'Total Submissions' : 'Total Emails'}
                  {statusFilter !== 'all' && ` (Filtered)`}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                <FontAwesomeIcon icon={faFolderOpen} className="w-6 h-6" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-amber-600">{stats.pending}</p>
                <p className="text-sm text-slate-500">
                  {activeTab === 'system' ? 'Pending Review' : 'Pending'}
                </p>
              </div>
              <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600">
                <FontAwesomeIcon icon={faClock} className="w-6 h-6" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-emerald-600">{stats.endorsed}</p>
                <p className="text-sm text-slate-500">
                  {activeTab === 'system' ? 'Endorsed' : 'Endorsed'}
                </p>
              </div>
              <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
                <FontAwesomeIcon icon={faCheckCircle} className="w-6 h-6" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-rose-600">
                  {activeTab === 'system' ? stats.downgraded : stats.uncategorized}
                </p>
                <p className="text-sm text-slate-500">
                  {activeTab === 'system' ? 'Downgraded' : 'Uncategorized'}
                </p>
              </div>
              <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-600">
                <FontAwesomeIcon icon={activeTab === 'system' ? faArrowDown : faWarning} className="w-6 h-6" />
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
              placeholder={activeTab === 'system' ? "Search by title, leader, or SUC..." : "Search by subject, sender, or email..."} 
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
              className="pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none appearance-none cursor-pointer min-w-40"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              {activeTab === 'system' ? (
                <>
                  <option value="endorse">Endorsed</option>
                  <option value="downgraded">Downgraded</option>
                </>
              ) : (
                <>
                  <option value="endorse">Endorsed</option>
                  <option value="uncategorized">Uncategorized</option>
                </>
              )}
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
                className="pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none appearance-none cursor-pointer min-w-50"
              >
                <option value="all">All Categories</option>
                <option value="Completed Extension Project Paper">Completed Extension</option>
                <option value="Ongoing Extension Project Paper">Ongoing Extension</option>
              </select>
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-linear-to-r from-slate-50 to-blue-50/50 border-b border-slate-200">
                  {activeTab === 'system' ? (
                    <>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                        <div className="flex items-center gap-2">
                          <FontAwesomeIcon icon={faFileAlt} className="w-3.5 h-3.5 text-blue-500" />
                          Title & Leader
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
                  const displayStatus = activeTab === 'system' ? (sub.status || 'pending') : (sub.status || 'pending');
                  
                  return (
                    <tr 
                      key={sub.id} 
                          onClick={() => { selectSubmission({...sub,id: sub.id,nsubmission_id: sub.submission_id
                          });
                        }} 
                      className="cursor-pointer border-b border-slate-100 hover:bg-blue-50/40 transition-all group"
                    >
                      {activeTab === 'system' ? (
                        <>
                          <td className="px-6 py-4">
                            <p className="text-sm font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">{sub.extension_project_title}</p>
                            <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
                              <FontAwesomeIcon icon={faUserCircle} className="w-3 h-3 text-slate-400" />
                              {sub.project_leader} {/* FIX: Use project_leader */}
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
                            <p className="text-sm font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">{sub.subject || 'No Subject'}</p>
                            <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
                              <FontAwesomeIcon icon={faEnvelope} className="w-3 h-3 text-slate-400" />
                              {sub.sender_name || 'Unknown'} ({sub.sender_email || 'No Email'})
                            </p>
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-600">
                            {sub.project_leader_name || 'Not specified'}
                            {sub.extraction_status === 'failed' && (
                              <span className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-100 text-gray-600 border border-gray-200">
                                <FontAwesomeIcon icon={faWarning} className="w-2.5 h-2.5" />
                                Uncategorized
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-600">
                            <div className="flex items-center gap-1.5">
                              <FontAwesomeIcon icon={faCalendarAlt} className="w-3 h-3 text-slate-400" />
                              {new Date(sub.email_received_at || sub.created_at).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-medium border ${getStatusColor(displayStatus)}`}>
                              <FontAwesomeIcon icon={getStatusIcon(displayStatus)} className="w-3 h-3" />
                              {getStatusDisplay(displayStatus)}
                            </span>
                            {sub.is_categorized === false && (
                              <span className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-red-50 text-red-600 border border-red-200">
                                <FontAwesomeIcon icon={faExclamationTriangle} className="w-2.5 h-2.5" />
                                Needs Review
                              </span>
                            )}
                            {sub.is_categorized === true && sub.extraction_status === 'failed' && (
                              <span className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
                                <FontAwesomeIcon icon={faWarning} className="w-2.5 h-2.5" />
                                Manually Categorized
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