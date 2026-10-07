"use client";

import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCheckCircle, faTimesCircle, faClock, faFileAlt, faEnvelope, faSearch, faFilter, faSync, 
  faUserCircle, faGavel, faInfoCircle, faFolderOpen, faInbox, faSpinner, 
  faFilePdf, faCalendarAlt, faTag, faUser, faSchool, faFlag, faExclamationTriangle, 
  faThumbsUp, faThumbsDown, faArrowDown, faUsers, faBookOpen, faLayerGroup, faEdit, faHistory,
  faBars, faDashboard, faCog, faQuestionCircle, faBell, faLifeRing,
  faChevronDown, faChevronUp, faSlidersH, faEnvelopeOpen, faClipboardList
} from '@fortawesome/free-solid-svg-icons';
import ConfirmModal from '../components/ConfirmModal';
import DowngradeModal from '../components/DowngradeModal';
import EditSubmission from '../components/EditSubmission';
import DiscussionSection from '../components/DiscussionSection';
import ViewHistory from '../components/ViewHistory';
import DecisionSummary from '../components/DecisionSummary';
import Sidebar from '../components/master-components/Sidebar';
import { QuickLinkCard, UnderUpdateModal } from '../components/master-components/QuickLinkCard';
import UnderDevelopment from '../components/master-components/UnderDevelopment';

const API_URL = (process.env.NEXT_PUBLIC_API_URL).replace(/\/+$/, '');

// ---------- Reusable modal sub-components ----------
function SectionTitle({ icon, color = 'slate', label }) {
  const colorMap = {
    indigo:  'text-indigo-600 bg-indigo-50 border-indigo-100',
    blue:    'text-blue-600 bg-blue-50 border-blue-100',
    emerald: 'text-emerald-600 bg-emerald-50 border-emerald-100',
    blue:  'text-blue-600 bg-blue-50 border-blue-100',
    slate:   'text-slate-600 bg-slate-100 border-slate-200',
  };
  const cls = colorMap[color] || colorMap.slate;
  return (
    <div className="flex items-center gap-2.5 mb-4">
      <span className={`w-8 h-8 rounded-lg flex items-center justify-center border ${cls}`}>
        <FontAwesomeIcon icon={icon} className="w-3.5 h-3.5" />
      </span>
      <h4 className="text-xs font-bold uppercase tracking-widest text-slate-600">
        {label}
      </h4>
      <span className="flex-1 h-px bg-slate-200" />
    </div>
  );
}

function Label({ children }) {
  return (
    <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
      {children}
    </p>
  );
}

function InfoCard({ label, value, span = 1, emphasis = false, mono = false, badgeClass = null }) {
  const colSpan = span === 2 ? 'md:col-span-2' : '';
  return (
    <div className={`${colSpan} bg-slate-50 rounded-xl border border-slate-200 p-4 hover:bg-white hover:border-slate-300 transition`}>
      <Label>{label}</Label>
      {badgeClass ? (
        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${badgeClass}`}>
          {value}
        </span>
      ) : (
        <p className={`${
          emphasis ? 'text-base font-bold text-slate-900' : 'text-sm font-semibold text-slate-700'
        } ${mono ? 'font-mono text-[13px] break-all' : ''} leading-relaxed`}>
          {value || 'Not specified'}
        </p>
      )}
    </div>
  );
}

function VoteStat({ label, value, color = 'slate' }) {
  const colorMap = {
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    orange:  'bg-orange-50 text-orange-700 border-orange-100',
    blue:    'bg-blue-50 text-blue-700 border-blue-100',
    slate:   'bg-slate-50 text-slate-700 border-slate-100',
  };
  const cls = colorMap[color] || colorMap.slate;
  return (
    <div className={`p-4 rounded-xl border text-center ${cls}`}>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-[11px] font-semibold uppercase tracking-wider opacity-80 mt-0.5">{label}</p>
    </div>
  );
}

// ---------- Settings Panel Component ----------
function SettingsPanel({ isOpen, onClose }) {
  const [settings, setSettings] = useState({
    emailNotifications: true,
    autoRefresh: false,
    refreshInterval: 30,
    compactView: false,
    showEmailPreview: true,
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-100 overflow-y-auto">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative min-h-full flex items-center justify-center p-4">
        <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="bg-linear-to-r from-indigo-50 to-blue-50 px-6 py-5 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 border border-indigo-200 flex items-center justify-center">
                  <FontAwesomeIcon icon={faCog} className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Settings</h3>
                  <p className="text-xs text-slate-500">Manage your preferences</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-9 h-9 flex items-center justify-center rounded-lg bg-white hover:bg-slate-100 text-slate-500 transition"
              >
                <FontAwesomeIcon icon={faTimesCircle} className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Notification Settings */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-3">Notifications</h4>
              <div className="space-y-3">
                <label className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-100 transition">
                  <div className="flex items-center gap-3">
                    <FontAwesomeIcon icon={faBell} className="w-4 h-4 text-indigo-500" />
                    <span className="text-sm font-medium text-slate-700">Email Notifications</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.emailNotifications}
                    onChange={(e) => setSettings({ ...settings, emailNotifications: e.target.checked })}
                    className="w-5 h-5 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                  />
                </label>
                <label className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-100 transition">
                  <div className="flex items-center gap-3">
                    <FontAwesomeIcon icon={faSync} className="w-4 h-4 text-indigo-500" />
                    <span className="text-sm font-medium text-slate-700">Auto Refresh</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.autoRefresh}
                    onChange={(e) => setSettings({ ...settings, autoRefresh: e.target.checked })}
                    className="w-5 h-5 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                  />
                </label>
                {settings.autoRefresh && (
                  <div className="ml-7 flex items-center gap-3">
                    <label className="text-xs text-slate-500">Interval (seconds):</label>
                    <input
                      type="number"
                      min="10"
                      max="300"
                      value={settings.refreshInterval}
                      onChange={(e) => setSettings({ ...settings, refreshInterval: parseInt(e.target.value) })}
                      className="w-20 px-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 focus:outline-none"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Display Settings */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-3">Display</h4>
              <div className="space-y-3">
                <label className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-100 transition">
                  <div className="flex items-center gap-3">
                    <FontAwesomeIcon icon={faClipboardList} className="w-4 h-4 text-indigo-500" />
                    <span className="text-sm font-medium text-slate-700">Compact View</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.compactView}
                    onChange={(e) => setSettings({ ...settings, compactView: e.target.checked })}
                    className="w-5 h-5 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                  />
                </label>
                <label className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-100 transition">
                  <div className="flex items-center gap-3">
                    <FontAwesomeIcon icon={faEnvelopeOpen} className="w-4 h-4 text-indigo-500" />
                    <span className="text-sm font-medium text-slate-700">Show Email Preview</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.showEmailPreview}
                    onChange={(e) => setSettings({ ...settings, showEmailPreview: e.target.checked })}
                    className="w-5 h-5 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                  />
                </label>
              </div>
            </div>
          </div>

          <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-5 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl font-semibold text-sm hover:bg-slate-100 transition"
            >
              Cancel
            </button>
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold text-sm hover:bg-indigo-700 transition shadow-sm hover:shadow"
            >
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------- Help Center Panel Component ----------
function HelpCenterPanel({ isOpen, onClose }) {
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [underUpdateFeature, setUnderUpdateFeature] = useState(null);

  const faqs = [
    {
      q: 'How do I endorse a submission?',
      a: 'Open a submission by clicking on any row in the table. In the details modal, scroll to the "Master Approver Decision" section and click "Endorse for Presentation". A confirmation dialog will appear where you can choose whether to send a confirmation email to the corresponding author.'
    },
    {
      q: 'What is the difference between Non-Competitive and Poster Only?',
      a: 'Non-Competitive submissions are accepted for poster presentation but do not compete for awards. Poster Only submissions are similar but may have different presentation requirements. Only Completed Extension Project Papers can be downgraded to these categories.'
    },
    {
      q: 'How do I edit submission details?',
      a: 'In the submission details modal, click "Edit Details" in the toolbar. You can modify fields like title, authors, category, and thematic area. All changes are recorded in the edit history.'
    },
    {
      q: 'How do I view the edit history?',
      a: 'Click "View History" in the submission details modal toolbar. This shows all edits made to the submission, including who made them and what changed.'
    },
    {
      q: 'What happens when I return a submission to sender?',
      a: 'Returning a submission to sender changes its status back to "Pending" and notifies the corresponding author that revisions are needed. The submission will reappear in the pending queue.'
    },
    {
      q: 'Can I communicate with evaluators?',
      a: 'Yes! The Evaluator Discussion section in the submission details modal allows you to post messages that all evaluators can see. This is useful for clarifying decisions or asking for additional input.'
    },
  ];

  const handleUnderUpdateClick = (featureName) => {
    setUnderUpdateFeature(featureName);
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-100 overflow-y-auto">
        <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose}></div>
        <div className="relative min-h-full flex items-center justify-center p-4">
          <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="bg-linear-to-r from-blue-50 to-cyan-50 px-6 py-5 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 border border-blue-200 flex items-center justify-center">
                    <FontAwesomeIcon icon={faLifeRing} className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Help Center</h3>
                    <p className="text-xs text-slate-500">Find answers and learn how to use the dashboard</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="w-9 h-9 flex items-center justify-center rounded-lg bg-white hover:bg-slate-100 text-slate-500 transition"
                >
                  <FontAwesomeIcon icon={faTimesCircle} className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {/* Quick Links */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
                <QuickLinkCard
                  icon={faFileAlt}
                  title="Documentation"
                  description="Read the full guide"
                  color="indigo"
                  underUpdate={true}
                  onUnderUpdateClick={handleUnderUpdateClick}
                />
                <QuickLinkCard
                  icon={faEnvelope}
                  title="Contact Support"
                  description="Get help from our team"
                  color="emerald"
                  underUpdate={true}
                  onUnderUpdateClick={handleUnderUpdateClick}
                />
                <QuickLinkCard
                  icon={faHistory}
                  title="Video Tutorials"
                  description="Watch step-by-step guides"
                  color="blue"
                  underUpdate={true}
                  onUnderUpdateClick={handleUnderUpdateClick}
                />
              </div>

              {/* FAQ Section */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-3 flex items-center gap-2">
                  <FontAwesomeIcon icon={faQuestionCircle} className="w-3.5 h-3.5" />
                  Frequently Asked Questions
                </h4>
                <div className="space-y-2">
                  {faqs.map((faq, idx) => (
                    <div key={idx} className="border border-slate-200 rounded-xl overflow-hidden">
                      <button
                        onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                        className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-50 transition"
                      >
                        <span className="font-semibold text-sm text-slate-800 pr-4">{faq.q}</span>
                        <FontAwesomeIcon
                          icon={expandedFaq === idx ? faChevronUp : faChevronDown}
                          className="w-4 h-4 text-slate-400 shrink-0"
                        />
                      </button>
                      {expandedFaq === idx && (
                        <div className="px-4 pb-4 pt-0">
                          <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                            {faq.a}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex justify-between items-center">
              <p className="text-xs text-slate-500">
                <FontAwesomeIcon icon={faInfoCircle} className="w-3 h-3 mr-1" />
                Need more help? Contact support@pemnet.com
              </p>
              <button
                onClick={onClose}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-blue-700 transition shadow-sm hover:shadow"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Under Update Popup */}
      <UnderUpdateModal
        isOpen={!!underUpdateFeature}
        onClose={() => setUnderUpdateFeature(null)}
        featureName={underUpdateFeature}
      />
    </>
  );
}

export default function MasterReviewPage() {
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState('system');
  const [submissions, setSubmissions] = useState([]);
  const [allSubmissions, setAllSubmissions] = useState([]);
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

  // Sidebar States
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeNavItem, setActiveNavItem] = useState('dashboard');
  const [showSettings, setShowSettings] = useState(false);
  const [showHelpCenter, setShowHelpCenter] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // ===== DYNAMIC FIELD MAPPING =====
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
      const res = await fetch(`${API_URL}/api/users`);
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
      // ── Fetch BOTH datasets in parallel ─────────────────────────
      const [systemRes, emailRes] = await Promise.allSettled([
        fetch(`${API_URL}/api/submissions`),
        fetch(`${API_URL}/api/email-submissions?status=all`),
      ]);

      let systemData = [];
      let emailData  = [];

      // ── Parse system response ──
      if (systemRes.status === 'fulfilled' && systemRes.value.ok) {
        try {
          const parsed = await systemRes.value.json();
          systemData = Array.isArray(parsed) ? parsed : [];
        } catch (err) {
          console.error('Failed to parse system submissions JSON:', err);
        }
      } else {
        console.error(
          'System submissions fetch failed:',
          systemRes.status === 'fulfilled' ? systemRes.value.status : systemRes.reason
        );
      }

      // ── Parse email response ──
      if (emailRes.status === 'fulfilled' && emailRes.value.ok) {
        try {
          const parsed = await emailRes.value.json();
          emailData = Array.isArray(parsed) ? parsed : [];
        } catch (err) {
          console.error('Failed to parse email submissions JSON:', err);
        }
      } else {
        console.error(
          'Email submissions fetch failed:',
          emailRes.status === 'fulfilled' ? emailRes.value.status : emailRes.reason
        );
      }

      // ── Tag origins explicitly ──
      const normalizedSystem = systemData.map((sub) => ({
        ...sub,
        submission_id: sub.submission_id || null,
        __source: 'system',
      }));

      const normalizedEmail = emailData.map((sub) => ({
        ...sub,
        submission_id: sub.submission_id || null,
        __source: 'email',
      }));

      // ── Merged list for global stats & sidebar badges ──
      setAllSubmissions([...normalizedSystem, ...normalizedEmail]);

      // ── Table data strictly depends on activeTab ──
      setSubmissions(activeTab === 'system' ? normalizedSystem : normalizedEmail);

      // ── Global summary endpoint ──
      try {
        const statsRes = await fetch(`${API_URL}/api/master-approver/status-summary`);
        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(statsData);
        }
      } catch (err) {
        console.error('Failed to fetch status summary:', err);
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
      const res = await fetch(`${API_URL}/api/email-submissions/${emailSubmissionId}/extracted-data`);
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
      const res = await fetch(`${API_URL}/api/email-logs/${submissionId}`);
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

    await fetchEmailLogs(submissionId);

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

    setSelectedStatus(sub.status || 'pending');
    setShowEndorsement(false);
    setSendEmailConfirmation(true);
    setIsModalOpen(true);

    try {
      const res = await fetch(`${API_URL}/api/submissions/${submissionId}/master-details`);
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

  const getEditData = () => {
    if (activeTab === 'system') {
      return selectedSubmission || {};
    }
    return {
      id: emailExtractedData?.id,
      title: getField('title', ''),
      project_leader: getField('projectLeader', ''),
      sucs: getField('suc', ''),
      corresponding_author_name: getField('correspondingAuthorName', ''),
      corresponding_author_email: getField('correspondingAuthorEmail', ''),
      corresponding_author_position: getField('correspondingAuthorPos', ''),
      authors_list: getField('authorsList', ''),
      paper_category: getField('paperCategory', ''),
      thematic_area: getField('thematicArea', ''),
      theme: getField('theme', ''),
    };
  };

  const handleEditSave = async (formData) => {
    if (!selectedSubmission) return;
    setEditLoading(true);

    try {
      const submissionId = selectedSubmission.submission_id;
      const isEmailSubmission = activeTab === 'email' && emailExtractedData?.id;

      const url = isEmailSubmission
        ? `${API_URL}/api/extracted-data/${emailExtractedData.id}/edit`
        : `${API_URL}/api/submissions/${submissionId}/edit`;

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

        if (activeTab === 'email' && selectedSubmission.id) {
          await fetchExtractedData(selectedSubmission.id);
        }

        await fetchSubmissions();
        await selectSubmission(selectedSubmission);
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

      const res = await fetch(`${API_URL}/api/submissions/${submissionId}/master-status`, {
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

        if (sendEmailConfirmation) {
          await fetchEmailLogs(submissionId);
        }

        setSubmissions(prev =>
          prev.map(sub => {
            if (sub.submission_id === submissionId) {
              return { ...sub, status: status };
            }
            return sub;
          })
        );

        setAllSubmissions(prev =>
          prev.map(sub => {
            if (sub.submission_id === submissionId) {
              return { ...sub, status: status };
            }
            return sub;
          })
        );

        setSelectedSubmission(prev => ({ ...prev, status: status }));

        if (emailExtractedData) {
          setEmailExtractedData(prev => ({ ...prev, status: status }));
        }

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
      case 'uncategorized': return 'Uncategorized';
      case 'processed': return 'Processed';
      case 'rejected': return 'Rejected';
      case 'return_to_sender': return 'Return to Sender';
      default: return status || 'Pending';
    }
  };

  const getCategoryColor = (category) => {
    if (!category) return 'bg-slate-100 text-slate-700';
    if (category.includes('Natural')) return 'bg-green-100 text-green-700';
    if (category.includes('Information')) return 'bg-blue-100 text-blue-700';
    if (category.includes('Development')) return 'bg-blue-100 text-blue-700';
    if (category.includes('Social')) return 'bg-pink-100 text-pink-700';
    if (category.includes('Food')) return 'bg-yellow-100 text-yellow-700';
    return 'bg-slate-100 text-slate-700';
  };

  const getEvaluatorName = (id) => {
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
    const matchesStatusFilter = (() => {
      if (statusFilter === 'all') return true;
      const s = String(sub.status || '').toLowerCase();

      if (statusFilter === 'downgraded') {
        return s === 'downgraded' || s === 'downgrade' || s.startsWith('downgraded');
      }
      if (statusFilter === 'downgraded-non_competitive') {
        return s === 'downgraded-non_competitive' || s === 'downgraded_non_competitive';
      }
      if (statusFilter === 'downgraded-poster_only') {
        return s === 'downgraded-poster_only' || s === 'downgraded_poster_only';
      }
      return s === String(statusFilter).toLowerCase();
    })();

    if (!matchesStatusFilter) return false;

    if (activeTab === 'system') {
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

  const isDowngraded = (status) => {
    if (!status) return false;
    const s = String(status).toLowerCase();
    return s === 'downgraded' || s === 'downgrade' || s.startsWith('downgraded');
  };

  const isNonCompetitive = (status) => {
    if (!status) return false;
    const s = String(status).toLowerCase();
    return s === 'downgraded-non_competitive' || s === 'downgraded_non_competitive';
  };

  const isPosterOnly = (status) => {
    if (!status) return false;
    const s = String(status).toLowerCase();
    return s === 'downgraded-poster_only' || s === 'downgraded_poster_only';
  };

  const isPending = (status) => {
    if (!status) return true;
    return String(status).toLowerCase() === 'pending';
  };

  const isEndorsed = (status) => {
    if (!status) return false;
    const s = String(status).toLowerCase();
    return s === 'endorse' || s === 'endorsed';
  };

  // ── Combined totals across BOTH system + email (for Dashboard + sidebar) ──
  const totalSubmissions     = allSubmissions.length;
  const pendingCount         = allSubmissions.filter(s => isPending(s.status)).length;
  const endorsedCount        = allSubmissions.filter(s => isEndorsed(s.status)).length;
  const nonCompetitiveCount  = allSubmissions.filter(s =>
    isNonCompetitive(s.status) || isNonCompetitive(s.evaluation_status)
  ).length;
  const posterOnlyCount      = allSubmissions.filter(s =>
    isPosterOnly(s.status) || isPosterOnly(s.evaluation_status)
  ).length;

  // ── Per-source breakdown for sidebar badges ──
  const systemPendingCount = allSubmissions
    .filter(s => s.__source === 'system')
    .filter(s => isPending(s.status)).length;

  const emailPendingCount = allSubmissions
    .filter(s => s.__source === 'email')
    .filter(s => isPending(s.status)).length;

  // ── Per-source totals (for sidebar counts if needed) ──
  const systemTotalCount = allSubmissions.filter(s => s.__source === 'system').length;
  const emailTotalCount  = allSubmissions.filter(s => s.__source === 'email').length;

  // ── Tab-scoped counts for stat cards inside the submissions view ──
  const tabSubmissions    = submissions;
  const tabTotal          = tabSubmissions.length;
  const tabPending        = tabSubmissions.filter(s => isPending(s.status)).length;
  const tabEndorsed       = tabSubmissions.filter(s => isEndorsed(s.status)).length;
  const tabNonCompetitive = tabSubmissions.filter(s =>
    isNonCompetitive(s.status) || isNonCompetitive(s.evaluation_status)
  ).length;
  const tabPosterOnly     = tabSubmissions.filter(s =>
    isPosterOnly(s.status) || isPosterOnly(s.evaluation_status)
  ).length;

  const getEmailStatus = () => {
    if (emailLogs.length === 0) return null;
    const latestLog = emailLogs[0];
    return latestLog.status;
  };

  const STAT_FILTERS = {
    total: 'all',
    pending: 'pending',
    endorsed: 'endorse',
    non_competitive: 'downgraded-non_competitive',
    poster_only: 'downgraded-poster_only',
  };

  const handleStatCardClick = (cardKey) => {
    const targetFilter = STAT_FILTERS[cardKey] ?? 'all';
    setStatusFilter(prev => (prev === targetFilter && targetFilter !== 'all' ? 'all' : targetFilter));
  };

  const isStatCardActive = (cardKey) => {
    const targetFilter = STAT_FILTERS[cardKey] ?? 'all';
    return statusFilter === targetFilter;
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

  const getEditFields = (submissionType) => {
    if (submissionType === 'email') {
      return {
        title: { label: 'Title', icon: faFileAlt, type: 'text', section: 'overview' },
        project_leader: { label: 'Project Leader', icon: faUser, type: 'text', section: 'authors' },
        sucs: { label: 'SUC / Agency', icon: faSchool, type: 'suc', section: 'authors' },
        corresponding_author_name: { label: 'Corresponding Author', icon: faUserCircle, type: 'text', section: 'contact' },
        corresponding_author_email: { label: 'Corresponding Email', icon: faEnvelope, type: 'email', section: 'contact' },
        corresponding_author_position: { label: 'Corresponding Position', icon: faTag, type: 'text', section: 'contact' },
        authors_list: { label: 'Authors List', icon: faUsers, type: 'text', section: 'authors' },
        paper_category: { label: 'Paper Category', icon: faBookOpen, type: 'select', section: 'classification', options: [
          'Not specified',
          'Completed Extension Project Paper',
          'Ongoing Extension Project Paper'
        ]},
        thematic_area: { label: 'Thematic Area', icon: faLayerGroup, type: 'select', section: 'classification', options: [
          'Not specified',
          'Food Production, Agriculture, Fisheries, and Natural Resource Systems',
          'Health, Nutrition, Wellness, and Community Care',
          'Education, Literacy, Skills Development, and Lifelong Learning',
          'Livelihood, Entrepreneurship, Cooperatives, MSMEs, and Local Economic Development',
          'Environment, Climate Action, Disaster Risk Reduction, and Community Resilience'
        ]},
        theme: { label: 'Theme', icon: faFlag, type: 'text', section: 'classification' }
      };
    }

    return {
      extension_project_title: { label: 'Title', icon: faFileAlt, type: 'text', section: 'overview' },
      project_leader: { label: 'Project Leader', icon: faUser, type: 'text', section: 'authors' },
      presenter: { label: 'Presenter', icon: faUserCircle, type: 'text', section: 'authors' },
      suc_agencies: { label: 'SUC / Agency', icon: faSchool, type: 'suc', section: 'authors' },
      corresponding_author_name: { label: 'Corresponding Author', icon: faUserCircle, type: 'text', section: 'contact' },
      corresponding_author_email: { label: 'Corresponding Email', icon: faEnvelope, type: 'email', section: 'contact' },
      corresponding_author_position: { label: 'Corresponding Position', icon: faTag, type: 'text', section: 'contact' },
      co_authors: { label: 'Co-Authors', icon: faUsers, type: 'text', section: 'authors' },
      paper_category: { label: 'Paper Category', icon: faBookOpen, type: 'select', section: 'classification', options: [
        'Not specified',
        'Completed Extension Project Paper',
        'Ongoing Extension Project Paper'
      ]},
      thematic_area: { label: 'Thematic Area', icon: faLayerGroup, type: 'select', section: 'classification', options: [
        'Not specified',
        'Food Production, Agriculture, Fisheries, and Natural Resource Systems',
        'Health, Nutrition, Wellness, and Community Care',
        'Education, Literacy, Skills Development, and Lifelong Learning',
        'Livelihood, Entrepreneurship, Cooperatives, MSMEs, and Local Economic Development',
        'Environment, Climate Action, Disaster Risk Reduction, and Community Resilience'
      ]}
    };
  };

  // ===== SIDEBAR NAVIGATION HANDLER =====
  const handleNavClick = (navId) => {
    setActiveNavItem(navId);
    setMobileSidebarOpen(false);

    switch (navId) {
      case 'dashboard':
        window.scrollTo({ top: 0, behavior: 'smooth' });
        break;

      case 'system':
        setActiveTab('system');
        setStatusFilter('all');
        setCategoryFilter('all');
        setSearchTerm('');
        break;

      case 'email':
        setActiveTab('email');
        setStatusFilter('all');
        setCategoryFilter('all');
        setSearchTerm('');
        break;

      case 'settings':
        setShowSettings(true);
        break;

      case 'help':
        setShowHelpCenter(true);
        break;

      default:
        break;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent"></div>
          <p className="text-slate-500 text-sm font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* ============ SIDEBAR (extracted component) ============ */}
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        activeNavItem={activeNavItem}
        onNavClick={handleNavClick}
        currentUser={currentUser}
        pendingCount={pendingCount}
        systemPendingCount={systemPendingCount}
        emailPendingCount={emailPendingCount}
        mobileOpen={mobileSidebarOpen}
        onMobileClose={() => setMobileSidebarOpen(false)}
      />

      {/* ============ MAIN CONTENT ============ */}
      <main className="flex-1 min-w-0">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200">
          <div className="px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileSidebarOpen(true)}
                className="lg:hidden w-9 h-9 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-500 transition"
              >
                <FontAwesomeIcon icon={faBars} className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
                  <FontAwesomeIcon
                    icon={
                      activeNavItem === 'dashboard'
                        ? faDashboard
                        : activeTab === 'system'
                        ? faFileAlt
                        : faEnvelope
                    }
                    className="w-5 h-5 text-indigo-600 hidden sm:inline"
                  />
                  {activeNavItem === 'dashboard'
                    ? 'Dashboard'
                    : activeTab === 'system'
                    ? 'System Submissions'
                    : 'Email Submissions'}
                </h1>
                <p className="text-xs text-slate-500 hidden sm:block">
                  {activeNavItem === 'dashboard'
                    ? 'Overview of all submissions and pending actions'
                    : 'Review and make final decisions on submissions'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Refresh Button */}
              <button
                onClick={fetchSubmissions}
                className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-500 transition"
                title="Refresh"
              >
                <FontAwesomeIcon icon={faSync} className="w-4 h-4" />
              </button>

              {/* Notifications */}
              <UnderDevelopment
                icon={faBell}
                featureName="Notifications"
                description="We're building a notification center so you can stay on top of new submissions and status updates in real time."
                badge={pendingCount}
              />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-4 sm:p-6 lg:p-8">
          {/* ===== DASHBOARD VIEW ===== */}
          {activeNavItem === 'dashboard' && (
            <div className="space-y-6">
              {/* Welcome Banner */}
              <div className="bg-linear-to-r from-indigo-500 via-blue-500 to-blue-500 rounded-2xl p-6 sm:p-8 text-white shadow-xl shadow-indigo-500/20">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold mb-1">
                      Welcome back, {currentUser?.full_name?.split(' ')[0] || 'Master Approver'}! 👋
                    </h2>
                    <p className="text-white/80 text-sm">
                      You have <span className="font-bold text-white">{pendingCount}</span> pending submission
                      {pendingCount !== 1 ? 's' : ''} awaiting your decision.
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleNavClick('system')}
                      className="px-4 py-2.5 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl font-semibold text-sm transition flex items-center gap-2"
                    >
                      <FontAwesomeIcon icon={faFileAlt} className="w-4 h-4" />
                      System
                    </button>
                    <button
                      onClick={() => handleNavClick('email')}
                      className="px-4 py-2.5 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl font-semibold text-sm transition flex items-center gap-2"
                    >
                      <FontAwesomeIcon icon={faEnvelope} className="w-4 h-4" />
                      Email
                    </button>
                  </div>
                </div>
              </div>

              {/* Stats Grid (combined totals) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <button
                  type="button"
                  onClick={() => { handleNavClick('system'); }}
                  className="text-left bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                      <FontAwesomeIcon icon={faFolderOpen} className="w-5 h-5 text-slate-600" />
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-slate-900">{totalSubmissions}</p>
                  <p className="text-sm text-slate-500 mt-1">Total Submissions</p>
                </button>

                <button
                  type="button"
                  onClick={() => { handleNavClick('system'); handleStatCardClick('pending'); }}
                  className="text-left bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                      <FontAwesomeIcon icon={faClock} className="w-5 h-5 text-amber-600" />
                    </div>
                    {pendingCount > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[10px] font-bold">
                        Action needed
                      </span>
                    )}
                  </div>
                  <p className="text-3xl font-bold text-amber-600">{pendingCount}</p>
                  <p className="text-sm text-slate-500 mt-1">Pending Review</p>
                </button>

                <button
                  type="button"
                  onClick={() => { handleNavClick('system'); handleStatCardClick('endorsed'); }}
                  className="text-left bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                      <FontAwesomeIcon icon={faCheckCircle} className="w-5 h-5 text-emerald-600" />
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-emerald-600">{endorsedCount}</p>
                  <p className="text-sm text-slate-500 mt-1">Endorsed</p>
                </button>

                <button
                  type="button"
                  onClick={() => { handleNavClick('system'); handleStatCardClick('non_competitive'); }}
                  className="text-left bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-yellow-50 flex items-center justify-center">
                      <FontAwesomeIcon icon={faThumbsDown} className="w-5 h-5 text-yellow-600" />
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-yellow-600">{nonCompetitiveCount}</p>
                  <p className="text-sm text-slate-500 mt-1">Non-Competitive</p>
                </button>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Submissions */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                      <FontAwesomeIcon icon={faClock} className="w-4 h-4 text-indigo-500" />
                      Recent Submissions
                    </h3>
                    <button
                      onClick={() => handleNavClick('system')}
                      className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition"
                    >
                      View all →
                    </button>
                  </div>
                  <div className="divide-y divide-slate-100">
                    {allSubmissions.slice(0, 5).map((sub, idx) => (
                      <div
                        key={sub.submission_id || sub.id || idx}
                        onClick={() => selectSubmission(sub)}
                        className="px-6 py-3 hover:bg-slate-50 cursor-pointer transition flex items-center justify-between gap-3"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-slate-800 truncate">
                            {sub.extension_project_title || sub.subject || 'Untitled'}
                          </p>
                          <p className="text-xs text-slate-500 truncate">
                            {sub.project_leader || sub.sender_name || 'Unknown'}
                          </p>
                        </div>
                        <span className={`shrink-0 px-2.5 py-1 rounded-full text-[10px] font-semibold ${getStatusColor(sub.status)}`}>
                          {getStatusDisplay(sub.status || 'pending')}
                        </span>
                      </div>
                    ))}
                    {allSubmissions.length === 0 && (
                      <div className="px-6 py-8 text-center text-slate-400 text-sm">
                        <FontAwesomeIcon icon={faFolderOpen} className="w-8 h-8 mb-2 text-slate-300" />
                        <p>No submissions yet</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Quick Tips */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-slate-200">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                      <FontAwesomeIcon icon={faInfoCircle} className="w-4 h-4 text-blue-500" />
                      Quick Tips
                    </h3>
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="flex items-start gap-3 p-3 bg-indigo-50 rounded-xl border border-indigo-100">
                      <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center shrink-0">
                        <FontAwesomeIcon icon={faGavel} className="w-3.5 h-3.5 text-indigo-600" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-indigo-900">Make final decisions</p>
                        <p className="text-xs text-indigo-700 mt-0.5">Click any submission to review details and endorse or downgrade.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                      <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
                        <FontAwesomeIcon icon={faEdit} className="w-3.5 h-3.5 text-emerald-600" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-emerald-900">Edit before deciding</p>
                        <p className="text-xs text-emerald-700 mt-0.5">Correct extracted data issues before making your final call.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-xl border border-blue-100">
                      <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                        <FontAwesomeIcon icon={faHistory} className="w-3.5 h-3.5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-blue-900">Track all changes</p>
                        <p className="text-xs text-blue-700 mt-0.5">View edit history to see who changed what and when.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ===== SUBMISSIONS VIEW ===== */}
          {(activeNavItem === 'system' || activeNavItem === 'email') && (
            <div className="space-y-6">
              {/* Stat Cards — tab-scoped so System vs Email show correct counts */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <button
                  type="button"
                  onClick={() => handleStatCardClick('total')}
                  className={`text-left bg-white rounded-xl p-5 border shadow-sm hover:shadow-md transition-all cursor-pointer ${
                    isStatCardActive('total') ? 'border-slate-500 ring-2 ring-slate-500/20' : 'border-slate-200'
                  }`}
                >
                  <p className="text-2xl font-bold text-slate-900">{tabTotal}</p>
                  <p className="text-sm text-slate-500">Total Submissions</p>
                </button>

                <button
                  type="button"
                  onClick={() => handleStatCardClick('pending')}
                  className={`text-left bg-white rounded-xl p-5 border shadow-sm hover:shadow-md transition-all cursor-pointer ${
                    isStatCardActive('pending') ? 'border-yellow-500 ring-2 ring-yellow-500/20' : 'border-slate-200'
                  }`}
                >
                  <p className="text-2xl font-bold text-yellow-600">{tabPending}</p>
                  <p className="text-sm text-slate-500">Pending Review</p>
                </button>

                <button
                  type="button"
                  onClick={() => handleStatCardClick('endorsed')}
                  className={`text-left bg-white rounded-xl p-5 border shadow-sm hover:shadow-md transition-all cursor-pointer ${
                    isStatCardActive('endorsed') ? 'border-emerald-500 ring-2 ring-emerald-500/20' : 'border-slate-200'
                  }`}
                >
                  <p className="text-2xl font-bold text-emerald-600">{tabEndorsed}</p>
                  <p className="text-sm text-slate-500">Endorsed</p>
                </button>

                <button
                  type="button"
                  onClick={() => handleStatCardClick('non_competitive')}
                  className={`text-left bg-white rounded-xl p-5 border shadow-sm hover:shadow-md transition-all cursor-pointer ${
                    isStatCardActive('non_competitive') ? 'border-yellow-500 ring-2 ring-yellow-500/20' : 'border-slate-200'
                  }`}
                >
                  <p className="text-2xl font-bold text-yellow-600">{tabNonCompetitive}</p>
                  <p className="text-sm text-slate-500">Non-Competitive</p>
                </button>
              </div>

              {/* Filters */}
              <div className="flex gap-3 flex-wrap items-center">
                <div className="flex-1 min-w-50 relative">
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400">
                    <FontAwesomeIcon icon={faSearch} className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    placeholder={activeTab === 'system' ? "Search by title, author, or SUC..." : "Search by subject, sender, or email..."}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-2.5 pl-10 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400">
                    <FontAwesomeIcon icon={faFilter} className="w-4 h-4" />
                  </div>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none appearance-none cursor-pointer min-w-40"
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="endorse">Endorsed</option>
                    <option value="downgraded">Downgraded (All)</option>
                    <option value="downgraded-non_competitive">Non-Competitive</option>
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
                      className="pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none appearance-none cursor-pointer min-w-50"
                    >
                      <option value="all">All Categories</option>
                      <option value="Completed Extension Project Paper">Completed Extension</option>
                      <option value="Ongoing Extension Project Paper">Ongoing Extension</option>
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
                                <FontAwesomeIcon icon={faTag} className="w-3.5 h-3.5 text-blue-500" />
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
                                <FontAwesomeIcon icon={faGavel} className="w-3.5 h-3.5 text-blue-500" />
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
                            className="cursor-pointer border-b border-slate-100 hover:bg-indigo-50/30 transition"
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
                                  {sub.is_categorized === false && (
                                    <span className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-red-50 text-red-600 border border-red-200">
                                      <FontAwesomeIcon icon={faExclamationTriangle} className="w-2.5 h-2.5" />
                                      Needs Review
                                    </span>
                                  )}
                                  {sub.is_categorized === true && sub.extraction_status === 'failed' && (
                                    <span className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
                                      <FontAwesomeIcon icon={faExclamationTriangle} className="w-2.5 h-2.5" />
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
                    <div className="text-center py-12 text-slate-500">
                      <FontAwesomeIcon
                        icon={activeTab === 'system' ? faFolderOpen : faInbox}
                        className="w-12 h-12 text-slate-300 mb-4"
                      />
                      <p>No {activeTab === 'system' ? 'submissions' : 'email submissions'} found</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* ============ MODALS ============ */}

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

      {/* Settings Panel */}
      <SettingsPanel isOpen={showSettings} onClose={() => setShowSettings(false)} />

      {/* Help Center Panel */}
      <HelpCenterPanel isOpen={showHelpCenter} onClose={() => setShowHelpCenter(false)} />

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
        title={
          pendingStatusAction === 'return_to_sender'
            ? 'Return to Sender'
            : pendingStatusAction === 'endorse'
            ? 'Accept Abstract for Paper Presentation'
            : 'Confirm Status Change'
        }
        message={
          pendingStatusAction === 'return_to_sender'
            ? 'Are you sure you want to return this submission to the sender for revisions?'
            : pendingStatusAction === 'endorse'
            ? 'Are you sure you want to accept this abstract for paper presentation?'
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

      <DowngradeModal
        isOpen={showDowngradeModal}
        onClose={() => setShowDowngradeModal(false)}
        onSubmit={handleDowngradeWithConfirm}
        isLoading={downgradeLoading}
        paperCategory={getField('paperCategory')}
      />

      {/* Downgrade Confirmation Modal */}
      <ConfirmModal
        isOpen={showDowngradeConfirm}
        onClose={() => { setShowDowngradeConfirm(false); setPendingDowngradeType(null); }}
        onConfirm={confirmDowngradeVote}
        title="Confirm Downgrade"
        message={`Are you sure you want to downgrade this submission? This will be recorded as a ${
          pendingDowngradeType === 'downgraded-non_competitive' ? 'Non-Competitive (Poster)' : 'Poster Only'
        } decision.`}
        confirmText="Yes, Downgrade"
        cancelText="No, Cancel"
        isLoading={downgradeConfirmLoading}
        type="warning"
      />

      {/* Edit Submission Modal */}
      <EditSubmission
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        data={getEditData()}
        onSave={handleEditSave}
        isLoading={editLoading}
        currentUser={currentUser}
        isMasterApprover={true}
        title={activeTab === 'email' ? 'Edit Email Submission Details' : 'Edit Submission Details'}
        fields={getEditFields(activeTab === 'email' ? 'email' : 'system')}
        submissionType={activeTab === 'email' ? 'email' : 'system'}
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
          <div
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity"
            onClick={() => setIsModalOpen(false)}
          ></div>

          <div className="relative min-h-full flex items-center justify-center p-4">
            <div className="relative w-full max-w-7xl bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden max-h-[95vh] flex flex-col">
              {/* HEADER */}
              <div className="bg-white border-b border-slate-200 sticky top-0 z-20">
                <div className="h-1 w-full bg-linear-to-r from-indigo-400 via-blue-400 to-blue-400" />

                <div className="px-8 py-5 flex items-start justify-between gap-6">
                  <div className="flex items-start gap-4 min-w-0 flex-1">
                    <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0">
                      <FontAwesomeIcon
                        icon={activeTab === 'system' ? faFileAlt : faEnvelope}
                        className="w-5 h-5 text-indigo-600"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">
                          {activeTab === 'system' ? 'System Submission' : 'Email Submission'}
                        </span>
                        <span className="w-1 h-1 rounded-full bg-slate-300" />
                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide border ${
                          isEndorsed(selectedSubmission.status)
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : isPending(selectedSubmission.status)
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-slate-100 text-slate-600 border-slate-200'
                        }`}>
                          {getStatusDisplay(selectedSubmission.status || 'pending')}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 leading-snug line-clamp-2">
                        {getField('title')}
                      </h3>
                      <p className="text-sm text-slate-500 mt-0.5 truncate">
                        {getField('projectLeader')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {getEmailStatusBadge()}
                    <button
                      onClick={() => setIsModalOpen(false)}
                      aria-label="Close"
                      className="w-9 h-9 flex items-center justify-center rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 transition"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Quick-action toolbar */}
                <div className="px-8 pb-4 flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => setShowHistoryModal(true)}
                    className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                  >
                    <FontAwesomeIcon icon={faHistory} className="w-3.5 h-3.5" />
                    View History
                  </button>
                  <button
                    onClick={() => setShowEditModal(true)}
                    disabled={!selectedSubmission}
                    className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-100 transition disabled:opacity-50"
                  >
                    <FontAwesomeIcon icon={faEdit} className="w-3.5 h-3.5" />
                    Edit Details
                  </button>
                  {activeTab === 'email' && emailExtractedData && (
                    <span className="ml-auto text-[11px] text-slate-400 italic">
                      Use Edit to correct any extracted field before final decision
                    </span>
                  )}
                </div>
              </div>

              {/* BODY */}
              <div className="grid grid-cols-1 lg:grid-cols-5 flex-1 overflow-hidden min-h-0">
                {/* LEFT: INFO COLUMN */}
                <div className="lg:col-span-3 p-8 overflow-y-auto bg-white">
                  {/* SECTION: Paper Overview */}
                  <SectionTitle icon={faFileAlt} color="indigo" label="Paper Overview" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                    <InfoCard label="Full Title" value={getField('title')} span={2} emphasis />
                    <InfoCard
                      label="Paper Category"
                      value={
                        getField('paperCategory')?.includes('Completed')
                          ? 'Completed Extension Project Paper'
                          : getField('paperCategory')?.includes('Ongoing')
                          ? 'Ongoing Extension Project Paper'
                          : getField('paperCategory') || 'Not specified'
                      }
                      badgeClass={getCategoryColor(getField('paperCategory'))}
                    />
                    <InfoCard label="Theme" value={getField('theme')} />
                    <InfoCard label="Thematic Area" value={getField('thematicArea')} span={2} />
                  </div>

                  {/* SECTION: Authors & Affiliation */}
                  <SectionTitle icon={faUsers} color="blue" label="Authors & Affiliation" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                    <InfoCard label="Project Leader" value={getField('projectLeader')} />
                    <InfoCard label="SUC / Agency" value={getField('suc')} />
                    <InfoCard label="Authors / Co-Authors" value={getAuthorsList()} span={2} />
                  </div>

                  {/* SECTION: Corresponding Author */}
                  <SectionTitle icon={faUserCircle} color="emerald" label="Corresponding Author" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                    <InfoCard label="Full Name" value={getField('correspondingAuthorName')} />
                    <InfoCard label="Position / Designation" value={getField('correspondingAuthorPos')} />
                    <InfoCard
                      label="Email Address"
                      value={getField('correspondingAuthorEmail')}
                      span={2}
                      mono
                    />
                  </div>

                  {/* SECTION: Submission Metadata */}
                  <SectionTitle icon={faInfoCircle} color="slate" label="Submission Metadata" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                    <InfoCard
                      label="Source"
                      value={activeTab === 'email' ? 'Email Submission' : 'System Submission'}
                    />
                    <InfoCard
                      label="Master Approver Status"
                      value={getStatusDisplay(selectedSubmission.status || 'pending')}
                      badgeClass={getStatusColor(selectedSubmission.status || 'pending')}
                    />
                    <div className="md:col-span-2">
                      <Label>Email Notification Log</Label>
                      {loadingEmailLogs ? (
                        <div className="flex items-center gap-2 text-sm text-slate-500 py-3 px-4 bg-slate-50 border border-slate-200 rounded-xl">
                          <FontAwesomeIcon icon={faSpinner} className="w-4 h-4 animate-spin text-indigo-500" />
                          Loading email history…
                        </div>
                      ) : emailLogs.length > 0 ? (
                        <div className="space-y-2">
                          {emailLogs.map((log) => (
                            <div
                              key={log.id}
                              className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 text-sm"
                            >
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                                log.status === 'sent'
                                  ? 'bg-emerald-100 text-emerald-700'
                                  : log.status === 'failed'
                                  ? 'bg-red-100 text-red-700'
                                  : 'bg-amber-100 text-amber-700'
                              }`}>
                                <FontAwesomeIcon
                                  icon={
                                    log.status === 'sent'
                                      ? faCheckCircle
                                      : log.status === 'failed'
                                      ? faTimesCircle
                                      : faClock
                                  }
                                  className="w-3 h-3"
                                />
                                {log.status === 'sent' ? 'Sent' : log.status === 'failed' ? 'Failed' : 'Pending'}
                              </span>
                              <span className="text-xs text-slate-600 truncate flex-1 font-medium">
                                {log.recipient_email}
                              </span>
                              <span className="text-[11px] text-slate-400 whitespace-nowrap">
                                {log.sent_at ? new Date(log.sent_at).toLocaleString() : 'Not sent'}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-slate-400 py-3 px-4 bg-slate-50 border border-dashed border-slate-200 rounded-xl italic">
                          No confirmation email has been sent yet.
                        </p>
                      )}
                    </div>
                  </div>

                  {/* SECTION: Evaluator Votes */}
                  {submissionDetails?.votes && submissionDetails.votes.length > 0 && (
                    <>
                      <SectionTitle icon={faUserCircle} color="blue" label={`Evaluator Votes (${submissionDetails.votes.length}/3)`} />
                      <div className="space-y-3 mb-4">
                        {submissionDetails.votes.map((vote, idx) => (
                          <div
                            key={idx}
                            className="p-4 bg-slate-50 border border-slate-200 rounded-xl hover:border-slate-300 transition"
                          >
                            <div className="flex justify-between items-center gap-3">
                              <span className="font-semibold text-sm text-slate-800 flex items-center gap-2">
                                <span className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold">
                                  {getEvaluatorName(vote.evaluator_id).charAt(0)}
                                </span>
                                {getEvaluatorName(vote.evaluator_id)}
                              </span>
                              <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${getStatusColor(vote.vote_status)}`}>
                                <FontAwesomeIcon icon={getVoteIcon(vote.vote_status)} className="w-3 h-3 mr-1" />
                                {vote.vote_status.charAt(0).toUpperCase() + vote.vote_status.slice(1)}
                              </span>
                            </div>
                            {vote.vote_notes && (
                              <p className="text-sm text-slate-600 mt-3 italic border-l-2 border-slate-300 pl-3">
                                "{vote.vote_notes}"
                              </p>
                            )}
                            {vote.vote_reassign_to && (
                              <p className="text-xs text-blue-600 mt-2 flex items-center gap-1.5">
                                <FontAwesomeIcon icon={faSync} className="w-3 h-3" />
                                Reassigned to: <strong>{vote.vote_reassign_to}</strong>
                              </p>
                            )}
                            {vote.vote_downgrade_to && (
                              <p className="text-xs text-orange-600 mt-2 flex items-center gap-1.5">
                                <FontAwesomeIcon icon={faArrowDown} className="w-3 h-3" />
                                Downgrade type: <strong>{vote.vote_downgrade_to}</strong>
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                      <div className="grid grid-cols-3 gap-3 mb-8">
                        <VoteStat label="Endorse" value={submissionDetails.vote_stats?.endorse || 0} color="emerald" />
                        <VoteStat label="Downgrade" value={submissionDetails.vote_stats?.downgrade || 0} color="orange" />
                        <VoteStat label="Reassign" value={submissionDetails.vote_stats?.reassign || 0} color="blue" />
                      </div>
                    </>
                  )}

                  {/* SECTION: Discussion */}
                  <SectionTitle icon={faUsers} color="indigo" label="Evaluator Discussion" />
                  <div className="mb-8 bg-slate-50 rounded-xl border border-slate-200 p-4">
                    <DiscussionSection
                      submissionId={selectedSubmission?.submission_id}
                      currentUserId={currentUser?.id}
                      currentUserName={currentUser?.full_name}
                      isMasterApprover={true}
                      title=""
                      maxHeight="240px"
                    />
                  </div>

                  {/* SECTION: Decision Summary */}
                  <SectionTitle icon={faGavel} color="blue" label="Decision Summary" />
                  <div className="mb-8 bg-slate-50 rounded-xl border border-slate-200 p-4">
                    <DecisionSummary
                      submissionStatus={selectedSubmission.status || 'pending'}
                      evaluationStatus={selectedSubmission.evaluation_status || 'pending'}
                      votes={submissionDetails?.votes || []}
                      voteStats={submissionDetails?.vote_stats || null}
                      evaluators={allUsers}
                      showEvaluators={true}
                    />
                  </div>

                  {/* SECTION: Master Approver Controls */}
                  <div className="rounded-xl border border-blue-200 bg-blue-50/40 p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-9 h-9 rounded-lg bg-blue-100 border border-blue-200 flex items-center justify-center">
                        <FontAwesomeIcon icon={faGavel} className="w-4 h-4 text-blue-700" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-blue-900 uppercase tracking-wide">
                          Master Approver Decision
                        </h4>
                        <p className="text-xs text-blue-700/70">
                          This action is final and will notify the corresponding author
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <button
                        onClick={() => confirmStatusChange('endorse')}
                        disabled={selectedSubmission.status === 'endorse'}
                        className="w-full bg-emerald-600 text-white py-3 rounded-lg font-semibold hover:bg-emerald-700 transition shadow-sm hover:shadow disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
                      >
                        <FontAwesomeIcon icon={faThumbsUp} className="w-4 h-4" />
                        {getField('paperCategory')?.includes('Ongoing')
                          ? 'Endorse for Non-Competitive Presentation'
                          : 'Endorse for Presentation'}
                        <span className="text-[10px] bg-white/25 px-2 py-0.5 rounded-full ml-1">📧 Email</span>
                      </button>

                      {getField('paperCategory')?.includes('Completed') && (
                        <button
                          onClick={handleOpenDowngradeModal}
                          disabled={
                            selectedSubmission.status === 'downgraded-non_competitive' ||
                            selectedSubmission.status === 'downgraded-poster_only' ||
                            selectedSubmission.status === 'downgraded'
                          }
                          className="w-full bg-amber-500 text-white py-3 rounded-lg font-semibold hover:bg-amber-600 transition shadow-sm hover:shadow disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
                        >
                          <FontAwesomeIcon icon={faThumbsDown} className="w-4 h-4" />
                          Downgrade Submission
                        </button>
                      )}

                      {getField('paperCategory')?.includes('Ongoing') && (
                        <div className="w-full bg-blue-50 border border-blue-200 text-blue-800 py-3 px-4 rounded-lg text-xs flex items-start gap-2">
                          <FontAwesomeIcon icon={faInfoCircle} className="w-4 h-4 mt-0.5 shrink-0" />
                          <span>
                            Ongoing Extension Project Papers are presented as <strong>non-competitive</strong> entries
                            and can only be <strong>Endorsed</strong>. No downgrade action applies.
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* RIGHT: FILE VIEWER */}
                <div className="lg:col-span-2 bg-slate-50 p-8 overflow-y-auto border-l border-slate-200">
                  <SectionTitle icon={faFolderOpen} color="slate" label="Document Preview" />

                  {activeTab === 'system' ? (
                    <div className="space-y-6">
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <p className="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center gap-2">
                            <FontAwesomeIcon icon={faFilePdf} className="w-3.5 h-3.5 text-red-500" />
                            Abstract PDF
                          </p>
                          {selectedSubmission.abstract_view_url && (
                            <a
                              href={selectedSubmission.abstract_view_url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800"
                            >
                              Open in new tab ↗
                            </a>
                          )}
                        </div>
                        {selectedSubmission.abstract_view_url ? (
                          <div className="border border-slate-200 rounded-xl bg-white overflow-hidden shadow-sm" style={{ height: '480px' }}>
                            <iframe
                              src={`https://drive.google.com/file/d/${extractGoogleDriveId(selectedSubmission.abstract_view_url)}/preview?embedded=true`}
                              className="w-full h-full"
                              allow="autoplay"
                            />
                          </div>
                        ) : (
                          <div className="text-center py-16 text-slate-500 bg-white rounded-xl border border-dashed border-slate-300 text-sm italic">
                            No Abstract Available
                          </div>
                        )}
                      </div>

                      {selectedSubmission.endorsement_view_url && (
                        <div>
                          <button
                            onClick={() => setShowEndorsement(!showEndorsement)}
                            className="w-full flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition shadow-sm"
                          >
                            <span className="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center gap-2">
                              <FontAwesomeIcon icon={faFilePdf} className="w-3.5 h-3.5 text-emerald-500" />
                              Endorsement PDF
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="text-[11px] text-slate-500 font-medium">
                                {showEndorsement ? 'Hide' : 'Show'}
                              </span>
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={2.5}
                                stroke="currentColor"
                                className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${showEndorsement ? 'rotate-180' : ''}`}
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                              </svg>
                            </div>
                          </button>

                          {showEndorsement && (
                            <div className="mt-3 border border-slate-200 rounded-xl bg-white overflow-hidden shadow-sm" style={{ height: '380px' }}>
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
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center gap-2">
                          <FontAwesomeIcon icon={faFilePdf} className="w-3.5 h-3.5 text-rose-500" />
                          Attachment
                        </p>
                        {selectedSubmission.attachment_view_url && (
                          <a
                            href={selectedSubmission.attachment_view_url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800"
                          >
                            Open in new tab ↗
                          </a>
                        )}
                      </div>
                      {selectedSubmission.attachment_filename && (
                        <p className="text-xs text-slate-600 mb-3 flex items-center gap-2 bg-white px-4 py-2.5 rounded-lg border border-slate-200">
                          <FontAwesomeIcon icon={faFileAlt} className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate font-medium">{selectedSubmission.attachment_filename}</span>
                        </p>
                      )}
                      {selectedSubmission.attachment_view_url ? (
                        <div className="border border-slate-200 rounded-xl bg-white overflow-hidden shadow-sm" style={{ height: '600px' }}>
                          <iframe
                            src={`https://drive.google.com/file/d/${extractGoogleDriveId(selectedSubmission.attachment_view_url)}/preview?embedded=true`}
                            className="w-full h-full"
                            allow="autoplay"
                          />
                        </div>
                      ) : (
                        <div className="text-center py-16 text-slate-500 bg-white rounded-xl border border-dashed border-slate-300 text-sm italic">
                          No Attachment Available
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

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
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}