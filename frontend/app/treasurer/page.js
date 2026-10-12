"use client";

import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCheckCircle, faTimesCircle, faClock, faFileAlt, faSearch, faFilter, faSync,
  faUserCircle, faInfoCircle, faFolderOpen, faSpinner, faCalendarAlt, faTag,
  faThumbsUp, faThumbsDown, faUsers, faEdit, faHistory, faBars, faDashboard,
  faCog, faQuestionCircle, faBell, faLifeRing, faChevronDown, faChevronUp,
  faClipboardList, faMoneyBillWave, faCreditCard, faReceipt, faUniversity,
  faArrowLeft, faSignOutAlt, faShieldAlt, faDownload, faEye, faPrint
} from '@fortawesome/free-solid-svg-icons';

const API_URL = (process.env.NEXT_PUBLIC_API_URL).replace(/\/+$/, '');

// ---------- Reusable sub-components ----------
function SectionTitle({ icon, color = 'slate', label }) {
  const colorMap = {
    indigo:  'text-indigo-600 bg-indigo-50 border-indigo-100',
    blue:    'text-blue-600 bg-blue-50 border-blue-100',
    emerald: 'text-emerald-600 bg-emerald-50 border-emerald-100',
    purple:  'text-purple-600 bg-purple-50 border-purple-100',
    amber:   'text-amber-600 bg-amber-50 border-amber-100',
    rose:    'text-rose-600 bg-rose-50 border-rose-100',
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

// ---------- Settings Panel ----------
function SettingsPanel({ isOpen, onClose, onSaved }) {
  const [settings, setSettings] = useState({
    emailNotifications: true,
    autoRefresh: false,
    refreshInterval: 30,
    compactView: false,
  });
  const [saving, setSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    setSaving(true);
    setSavedMessage(false);
    // Simulate save (replace with actual API call if needed)
    setTimeout(() => {
      setSaving(false);
      setSavedMessage(true);
      onSaved?.(); // notify parent but DON'T close
      // Auto-hide the success message after 2.5s but keep modal open
      setTimeout(() => setSavedMessage(false), 2500);
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-100 overflow-y-auto">
      {/* Backdrop — closes on click */}
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      <div className="relative min-h-full flex items-center justify-center p-4">
        {/* Inner modal — stop propagation so clicks inside don't hit backdrop */}
        <div
          className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="bg-linear-to-r from-emerald-50 to-blue-50 px-6 py-5 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 border border-emerald-200 flex items-center justify-center">
                  <FontAwesomeIcon icon={faCog} className="w-5 h-5 text-emerald-600" />
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
            {/* Saved success banner */}
            {savedMessage && (
              <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-xl animate-slide-in">
                <FontAwesomeIcon icon={faCheckCircle} className="w-4 h-4 text-emerald-600" />
                <p className="text-sm font-semibold text-emerald-700">Settings saved successfully!</p>
              </div>
            )}

            <div>
              <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-3">
                Notifications
              </h4>
              <div className="space-y-3">
                <label className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-100 transition">
                  <div className="flex items-center gap-3">
                    <FontAwesomeIcon icon={faBell} className="w-4 h-4 text-emerald-500" />
                    <span className="text-sm font-medium text-slate-700">Email Notifications</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.emailNotifications}
                    onChange={(e) => setSettings({ ...settings, emailNotifications: e.target.checked })}
                    className="w-5 h-5 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                  />
                </label>
                <label className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-100 transition">
                  <div className="flex items-center gap-3">
                    <FontAwesomeIcon icon={faSync} className="w-4 h-4 text-emerald-500" />
                    <span className="text-sm font-medium text-slate-700">Auto Refresh</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.autoRefresh}
                    onChange={(e) => setSettings({ ...settings, autoRefresh: e.target.checked })}
                    className="w-5 h-5 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
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
                      onChange={(e) => setSettings({ ...settings, refreshInterval: parseInt(e.target.value) || 30 })}
                      className="w-20 px-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 focus:outline-none"
                    />
                  </div>
                )}
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-3">
                Display
              </h4>
              <div className="space-y-3">
                <label className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-100 transition">
                  <div className="flex items-center gap-3">
                    <FontAwesomeIcon icon={faClipboardList} className="w-4 h-4 text-emerald-500" />
                    <span className="text-sm font-medium text-slate-700">Compact View</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.compactView}
                    onChange={(e) => setSettings({ ...settings, compactView: e.target.checked })}
                    className="w-5 h-5 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                  />
                </label>
              </div>
            </div>
          </div>

          <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-3">
            <button
              onClick={onClose}
              disabled={saving}
              className="px-5 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl font-semibold text-sm hover:bg-slate-100 transition disabled:opacity-50"
            >
              Close
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl font-semibold text-sm hover:bg-emerald-700 transition shadow-sm disabled:opacity-50 inline-flex items-center gap-2"
            >
              {saving ? (
                <>
                  <FontAwesomeIcon icon={faSpinner} className="w-3.5 h-3.5 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faCheckCircle} className="w-3.5 h-3.5" />
                  Save Settings
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------- Help Center Panel ----------
function HelpCenterPanel({ isOpen, onClose, onGotIt }) {
  const [expandedFaq, setExpandedFaq] = useState(null);

  const faqs = [
    { q: 'How do I verify a payment?', a: 'Click on any pending payment row to open the details modal. Review the payment proof on the right side, then click "Verify Payment" to accept it or "Reject Payment" to decline it with a reason.' },
    { q: 'What payment statuses exist?', a: 'There are three statuses: Pending (awaiting verification), Verified (accepted), and Rejected (declined with reason). Only pending payments can be acted upon.' },
    { q: 'Can I view accepted payments?', a: 'Yes! Use the sidebar to filter by "Accepted Payments" status, or check the "Accepted Payments Management" section on the dashboard which shows all verified payments with their details.' },
    { q: 'How do I search for a specific payment?', a: 'Use the search bar at the top of the payments table. You can search by submission title, user name, or reference number.' },
    { q: 'What happens after I verify a payment?', a: 'Once verified, the payment status is updated and the user can proceed with the next steps of their submission. The verification is logged with your user ID and timestamp.' },
    { q: 'Can I undo a verification?', a: 'Verification decisions cannot be undone from this dashboard. If you made a mistake, please contact the system administrator to correct it.' },
  ];

  // Reset expanded FAQ when modal closes so it reopens clean
  useEffect(() => {
    if (!isOpen) setExpandedFaq(null);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleGotIt = () => {
    setExpandedFaq(null);
    onClose();          // close the modal
    onGotIt?.();        // then route to dashboard
  };

  return (
    <div className="fixed inset-0 z-100 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      <div className="relative min-h-full flex items-center justify-center p-4">
        {/* Inner modal — stop propagation */}
        <div
          className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="bg-linear-to-r from-blue-50 to-cyan-50 px-6 py-5 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 border border-blue-200 flex items-center justify-center">
                  <FontAwesomeIcon icon={faLifeRing} className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Help Center</h3>
                  <p className="text-xs text-slate-500">Find answers and learn how to use the treasurer dashboard</p>
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

          <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex justify-between items-center">
            <p className="text-xs text-slate-500">
              <FontAwesomeIcon icon={faInfoCircle} className="w-3 h-3 mr-1" />
              Need more help? Contact support@pemnet.com
            </p>
            <button
              onClick={handleGotIt}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-blue-700 transition shadow-sm"
            >
              Got it
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------- Treasurer Sidebar ----------
function TreasurerSidebar({ collapsed, onToggleCollapse, activeNavItem, onNavClick, currentUser, pendingCount, verifiedCount, rejectedCount, mobileOpen, onMobileClose, onLogout }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: faDashboard },
    { id: 'all-payments', label: 'All Payments', icon: faMoneyBillWave, badge: null },
    { id: 'pending', label: 'Pending', icon: faClock, badge: pendingCount, badgeColor: 'bg-amber-100 text-amber-700' },
    { id: 'verified', label: 'Accepted Payments', icon: faCheckCircle, badge: verifiedCount, badgeColor: 'bg-emerald-100 text-emerald-700' },
    { id: 'rejected', label: 'Rejected', icon: faTimesCircle, badge: rejectedCount, badgeColor: 'bg-rose-100 text-rose-700' },
  ];

  const bottomItems = [
    { id: 'settings', label: 'Settings', icon: faCog },
    { id: 'help', label: 'Help Center', icon: faQuestionCircle },
  ];

  return (
    <>
      {mobileOpen && <div className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden" onClick={onMobileClose} />}
      <aside className={`fixed lg:sticky top-0 left-0 z-50 h-screen bg-white border-r border-slate-200 flex flex-col transition-all duration-300 ${collapsed ? 'w-20' : 'w-64'} ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        {/* Logo */}
        <div className="h-16 px-4 border-b border-slate-200 flex items-center justify-between">
          <div className={`flex items-center gap-3 ${collapsed ? 'justify-center w-full' : ''}`}>
            <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center shrink-0">
              <FontAwesomeIcon icon={faUniversity} className="w-4 h-4 text-white" />
            </div>
            {!collapsed && (
              <div>
                <p className="text-sm font-bold text-slate-900">PEMNet</p>
                <p className="text-[10px] text-slate-500 uppercase tracking-wider">Treasurer</p>
              </div>
            )}
          </div>
          <button onClick={onToggleCollapse} className="hidden lg:flex w-7 h-7 items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 transition">
            <FontAwesomeIcon icon={faBars} className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* User Info */}
        <div className={`p-4 border-b border-slate-200 ${collapsed ? 'flex justify-center' : ''}`}>
          {collapsed ? (
            <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold text-sm">
              {currentUser?.full_name?.charAt(0) || 'T'}
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                {currentUser?.full_name?.charAt(0) || 'T'}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-800 truncate">{currentUser?.full_name || 'Treasurer'}</p>
                <p className="text-[10px] text-slate-500 uppercase tracking-wider">Treasurer</p>
              </div>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {navItems.map((item) => {
            const isActive = activeNavItem === item.id;
            return (
              <button
                key={item.id}
                onClick={() => { onNavClick(item.id); onMobileClose?.(); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${collapsed ? 'justify-center' : ''} ${
                  isActive ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
                title={collapsed ? item.label : ''}
              >
                <FontAwesomeIcon icon={item.icon} className={`w-4 h-4 shrink-0 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
                {!collapsed && (
                  <>
                    <span className="flex-1 text-left">{item.label}</span>
                    {item.badge > 0 && (
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${item.badgeColor}`}>{item.badge}</span>
                    )}
                  </>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="p-3 border-t border-slate-200 space-y-1">
          {bottomItems.map((item) => (
            <button
              key={item.id}
              onClick={() => { onNavClick(item.id); onMobileClose?.(); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition ${collapsed ? 'justify-center' : ''}`}
              title={collapsed ? item.label : ''}
            >
              <FontAwesomeIcon icon={item.icon} className="w-4 h-4 text-slate-400 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </button>
          ))}
        </div>
      </aside>
    </>
  );
}

export default function TreasurerPage() {
  const [currentUser, setCurrentUser] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [allUsers, setAllUsers] = useState([]);

  // Sidebar states
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeNavItem, setActiveNavItem] = useState('dashboard');
  const [showSettings, setShowSettings] = useState(false);
  const [showHelpCenter, setShowHelpCenter] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    verified: 0,
    rejected: 0,
    totalAmount: 0,
    verifiedAmount: 0,
    pendingAmount: 0
  });

  useEffect(() => {
    const storedUser = localStorage.getItem('pemnet_user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setCurrentUser(user);
        if (user.role !== 'treasurer') {
          window.location.href = '/treasurer';
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    } else {
      window.location.href = '/login';
    }
    fetchUsers();
    fetchPayments();
  }, [statusFilter]);

  const fetchUsers = async () => {
    try {
      const apiUrl = (process.env.NEXT_PUBLIC_API_URL).replace(/\/+$/, '');
      const res = await fetch(`${apiUrl}/api/users`);
      if (res.ok) {
        const data = await res.json();
        setAllUsers(data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('pemnet_token');
      const url = statusFilter === 'all'
        ? `${API_URL}/api/payments/all`
        : `${API_URL}/api/payments/all?status=${statusFilter}`;
      const res = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setPayments(data);
        const total = data.length;
        const pending = data.filter(p => p.payment_status === 'pending').length;
        const verified = data.filter(p => p.payment_status === 'verified').length;
        const rejected = data.filter(p => p.payment_status === 'rejected').length;
        const totalAmount = data.reduce((sum, p) => sum + (parseFloat(p.payment_amount) || 0), 0);
        const verifiedAmount = data.filter(p => p.payment_status === 'verified').reduce((sum, p) => sum + (parseFloat(p.payment_amount) || 0), 0);
        const pendingAmount = data.filter(p => p.payment_status === 'pending').reduce((sum, p) => sum + (parseFloat(p.payment_amount) || 0), 0);
        setStats({ total, pending, verified, rejected, totalAmount, verifiedAmount, pendingAmount });
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
      showToast('Failed to fetch payments', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  };

  const handleVerify = async (paymentId) => {
    setActionLoading(true);
    try {
      const token = localStorage.getItem('pemnet_token');
      const res = await fetch(`${API_URL}/api/payments/${paymentId}/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ verifier_id: currentUser.id, action: 'verify' })
      });
      if (res.ok) {
        showToast('Payment verified successfully!', 'success');
        fetchPayments();
        setShowModal(false);
        setSelectedPayment(null);
      } else {
        const error = await res.json();
        showToast(error.detail || 'Failed to verify payment', 'error');
      }
    } catch (error) {
      console.error('Error verifying payment:', error);
      showToast('Network error. Please try again.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (paymentId) => {
    if (!rejectionReason.trim()) {
      showToast('Please provide a reason for rejection', 'error');
      return;
    }
    setActionLoading(true);
    try {
      const token = localStorage.getItem('pemnet_token');
      const res = await fetch(`${API_URL}/api/payments/${paymentId}/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ verifier_id: currentUser.id, action: 'reject', rejection_reason: rejectionReason })
      });
      if (res.ok) {
        showToast('Payment rejected', 'success');
        fetchPayments();
        setShowRejectModal(false);
        setShowModal(false);
        setSelectedPayment(null);
        setRejectionReason('');
      } else {
        const error = await res.json();
        showToast(error.detail || 'Failed to reject payment', 'error');
      }
    } catch (error) {
      console.error('Error rejecting payment:', error);
      showToast('Network error. Please try again.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const openPaymentDetails = (payment) => {
    setSelectedPayment(payment);
    setShowModal(true);
    setRejectionReason('');
  };

  const getUserName = (userId) => {
    const user = allUsers.find(u => u.id === userId);
    return user ? user.full_name : 'Unknown User';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'verified': return 'bg-emerald-100 text-emerald-700';
      case 'rejected': return 'bg-red-100 text-red-700';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'verified': return '✅';
      case 'rejected': return '❌';
      case 'pending': return '⏳';
      default: return '❓';
    }
  };

  const extractGoogleDriveId = (url) => {
    if (!url) return null;
    const patterns = [/\/d\/([a-zA-Z0-9_-]+)/, /id=([a-zA-Z0-9_-]+)/, /open\?id=([a-zA-Z0-9_-]+)/, /\/file\/d\/([a-zA-Z0-9_-]+)/, /([a-zA-Z0-9_-]{25,})/];
    for (let pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) return match[1].split('?')[0].split('&')[0];
    }
    return null;
  };

  const handleLogout = () => {
    localStorage.removeItem('pemnet_user');
    localStorage.removeItem('pemnet_token');
    window.location.href = '/login';
  };

  const handleNavClick = (navId) => {
    setActiveNavItem(navId);
    setMobileSidebarOpen(false);
    switch (navId) {
      case 'dashboard':
      case 'all-payments':
        setStatusFilter('all');
        break;
      case 'pending':
        setStatusFilter('pending');
        break;
      case 'verified':
        setStatusFilter('verified');
        break;
      case 'rejected':
        setStatusFilter('rejected');
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

  const filteredPayments = payments.filter(payment => {
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      return (
        (payment.submission_title && payment.submission_title.toLowerCase().includes(search)) ||
        (payment.user_name && payment.user_name.toLowerCase().includes(search)) ||
        (payment.reference_number && payment.reference_number.toLowerCase().includes(search))
      );
    }
    return true;
  });

  // Accepted (verified) payments for management section
  const verifiedPayments = payments.filter(p => p.payment_status === 'verified');

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(amount || 0);
  };

  if (loading && payments.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent"></div>
          <p className="text-slate-500 text-sm font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* ============ SIDEBAR ============ */}
      <TreasurerSidebar
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        activeNavItem={activeNavItem}
        onNavClick={handleNavClick}
        currentUser={currentUser}
        pendingCount={stats.pending}
        verifiedCount={stats.verified}
        rejectedCount={stats.rejected}
        mobileOpen={mobileSidebarOpen}
        onMobileClose={() => setMobileSidebarOpen(false)}
        onLogout={handleLogout}
      />

      {/* ============ MAIN CONTENT ============ */}
      <main className="flex-1 min-w-0">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200">
          <div className="px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button onClick={() => setMobileSidebarOpen(true)} className="lg:hidden w-9 h-9 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-500 transition">
                <FontAwesomeIcon icon={faBars} className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
                  <FontAwesomeIcon
                    icon={
                      activeNavItem === 'dashboard' ? faDashboard
                        : activeNavItem === 'pending' ? faClock
                        : activeNavItem === 'verified' ? faCheckCircle
                        : activeNavItem === 'rejected' ? faTimesCircle
                        : faMoneyBillWave
                    }
                    className="w-5 h-5 text-emerald-600 hidden sm:inline"
                  />
                  {activeNavItem === 'dashboard' ? 'Treasurer Dashboard'
                    : activeNavItem === 'all-payments' ? 'All Payments'
                    : activeNavItem === 'pending' ? 'Pending Payments'
                    : activeNavItem === 'verified' ? 'Accepted Payments'
                    : activeNavItem === 'rejected' ? 'Rejected Payments'
                    : 'Treasurer Dashboard'}
                </h1>
                <p className="text-xs text-slate-500 hidden sm:block">
                  {activeNavItem === 'dashboard' ? 'Manage and verify registration payments'
                    : activeNavItem === 'verified' ? 'Manage all accepted and verified payments'
                    : 'Review and manage payment submissions'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={fetchPayments} className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-500 transition" title="Refresh">
                <FontAwesomeIcon icon={faSync} className="w-4 h-4" />
              </button>
              <button onClick={handleLogout} className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 text-sm font-semibold transition">
                <FontAwesomeIcon icon={faSignOutAlt} className="w-3.5 h-3.5" />
                Logout
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-4 sm:p-6 lg:p-8">
          {/* ===== DASHBOARD VIEW ===== */}
          {activeNavItem === 'dashboard' && (
            <div className="space-y-6">
              {/* Welcome Banner */}
              <div className="bg-linear-to-r from-emerald-500 via-emerald-500 to-teal-500 rounded-2xl p-6 sm:p-8 text-white shadow-xl shadow-emerald-500/20">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold mb-1">
                      Welcome back, {currentUser?.full_name?.split(' ')[0] || 'Treasurer'}! 👋
                    </h2>
                    <p className="text-white/80 text-sm">
                      You have <span className="font-bold text-white">{stats.pending}</span> pending payment{stats.pending !== 1 ? 's' : ''} awaiting verification.
                    </p>
                  </div>
                  <button onClick={() => handleNavClick('pending')} className="px-5 py-2.5 bg-white/20 hover:bg-white/30 backdrop-blur rounded-xl font-semibold text-sm transition border border-white/30">
                    Review Pending →
                  </button>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <button type="button" onClick={() => handleNavClick('all-payments')} className="text-left bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                      <FontAwesomeIcon icon={faMoneyBillWave} className="w-5 h-5 text-slate-600" />
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-slate-900">{stats.total}</p>
                  <p className="text-sm text-slate-500 mt-1">Total Payments</p>
                  <p className="text-xs text-slate-400 mt-2">{formatCurrency(stats.totalAmount)}</p>
                </button>

                <button type="button" onClick={() => handleNavClick('pending')} className="text-left bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                      <FontAwesomeIcon icon={faClock} className="w-5 h-5 text-amber-600" />
                    </div>
                    {stats.pending > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[10px] font-bold">Action needed</span>
                    )}
                  </div>
                  <p className="text-3xl font-bold text-amber-600">{stats.pending}</p>
                  <p className="text-sm text-slate-500 mt-1">Pending Verification</p>
                  <p className="text-xs text-slate-400 mt-2">{formatCurrency(stats.pendingAmount)}</p>
                </button>

                <button type="button" onClick={() => handleNavClick('verified')} className="text-left bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                      <FontAwesomeIcon icon={faCheckCircle} className="w-5 h-5 text-emerald-600" />
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-emerald-600">{stats.verified}</p>
                  <p className="text-sm text-slate-500 mt-1">Accepted Payments</p>
                  <p className="text-xs text-slate-400 mt-2">{formatCurrency(stats.verifiedAmount)}</p>
                </button>

                <button type="button" onClick={() => handleNavClick('rejected')} className="text-left bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center">
                      <FontAwesomeIcon icon={faTimesCircle} className="w-5 h-5 text-rose-600" />
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-rose-600">{stats.rejected}</p>
                  <p className="text-sm text-slate-500 mt-1">Rejected</p>
                </button>
              </div>

              {/* ===== ACCEPTED PAYMENTS MANAGEMENT ===== */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-100 border border-emerald-200 flex items-center justify-center">
                      <FontAwesomeIcon icon={faCheckCircle} className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800">Accepted Payments Management</h3>
                      <p className="text-xs text-slate-500">Overview of all verified payments</p>
                    </div>
                  </div>
                  <button onClick={() => handleNavClick('verified')} className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 transition">
                    View all →
                  </button>
                </div>

                {verifiedPayments.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-emerald-50/50 border-b border-slate-200">
                          <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">User / Submission</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Amount</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Reference</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Verified Date</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Verified By</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {verifiedPayments.slice(0, 5).map((payment) => (
                          <tr key={payment.id} className="border-b border-slate-100 hover:bg-emerald-50/30 transition">
                            <td className="px-6 py-4">
                              <p className="text-sm font-semibold text-slate-900">{payment.user_name}</p>
                              <p className="text-xs text-slate-500">{payment.submission_title || 'N/A'}</p>
                            </td>
                            <td className="px-6 py-4">
                              <p className="text-sm font-semibold text-emerald-700">{formatCurrency(payment.payment_amount)}</p>
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-600">{payment.reference_number || 'N/A'}</td>
                            <td className="px-6 py-4 text-sm text-slate-600">
                              {payment.verified_at ? new Date(payment.verified_at).toLocaleDateString() : 'N/A'}
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-600">
                              {payment.verified_by ? getUserName(payment.verified_by) : 'N/A'}
                            </td>
                            <td className="px-6 py-4">
                              <button onClick={() => openPaymentDetails(payment)} className="text-emerald-600 hover:text-emerald-700 text-sm font-medium inline-flex items-center gap-1">
                                <FontAwesomeIcon icon={faEye} className="w-3.5 h-3.5" />
                                View
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-12 text-slate-400">
                    <FontAwesomeIcon icon={faCheckCircle} className="w-10 h-10 text-slate-300 mb-3" />
                    <p className="text-sm">No accepted payments yet</p>
                  </div>
                )}

                {verifiedPayments.length > 0 && (
                  <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
                    <p className="text-xs text-slate-500">
                      Showing {Math.min(5, verifiedPayments.length)} of {verifiedPayments.length} accepted payments
                    </p>
                    <p className="text-sm font-bold text-emerald-700">
                      Total: {formatCurrency(stats.verifiedAmount)}
                    </p>
                  </div>
                )}
              </div>

              {/* Quick Tips */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-slate-200">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                      <FontAwesomeIcon icon={faClock} className="w-4 h-4 text-amber-500" />
                      Recent Pending Payments
                    </h3>
                  </div>
                  <div className="divide-y divide-slate-100">
                    {payments.filter(p => p.payment_status === 'pending').slice(0, 5).map((payment) => (
                      <div key={payment.id} onClick={() => openPaymentDetails(payment)} className="px-6 py-3 hover:bg-slate-50 cursor-pointer transition flex items-center justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-slate-800 truncate">{payment.user_name}</p>
                          <p className="text-xs text-slate-500 truncate">{payment.submission_title || 'N/A'}</p>
                        </div>
                        <span className="shrink-0 text-sm font-semibold text-slate-700">{formatCurrency(payment.payment_amount)}</span>
                      </div>
                    ))}
                    {payments.filter(p => p.payment_status === 'pending').length === 0 && (
                      <div className="px-6 py-8 text-center text-slate-400 text-sm">
                        <FontAwesomeIcon icon={faCheckCircle} className="w-8 h-8 mb-2 text-emerald-300" />
                        <p>All caught up!</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-slate-200">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                      <FontAwesomeIcon icon={faInfoCircle} className="w-4 h-4 text-blue-500" />
                      Quick Tips
                    </h3>
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="flex items-start gap-3 p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                      <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
                        <FontAwesomeIcon icon={faCheckCircle} className="w-3.5 h-3.5 text-emerald-600" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-emerald-900">Verify payments</p>
                        <p className="text-xs text-emerald-700 mt-0.5">Click a pending payment to review proof and verify.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-xl border border-amber-100">
                      <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
                        <FontAwesomeIcon icon={faReceipt} className="w-3.5 h-3.5 text-amber-600" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-amber-900">Check references</p>
                        <p className="text-xs text-amber-700 mt-0.5">Always match reference numbers against proof.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-xl border border-blue-100">
                      <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                        <FontAwesomeIcon icon={faDownload} className="w-3.5 h-3.5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-blue-900">Export records</p>
                        <p className="text-xs text-blue-700 mt-0.5">Download accepted payments for your records.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ===== PAYMENTS TABLE VIEW (all/pending/verified/rejected) ===== */}
          {['all-payments', 'pending', 'verified', 'rejected'].includes(activeNavItem) && (
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <button type="button" onClick={() => handleNavClick('all-payments')} className={`text-left bg-white rounded-xl p-5 border shadow-sm hover:shadow-md transition-all cursor-pointer ${activeNavItem === 'all-payments' ? 'border-slate-500 ring-2 ring-slate-500/20' : 'border-slate-200'}`}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                      <FontAwesomeIcon icon={faMoneyBillWave} className="w-5 h-5 text-slate-600" />
                    </div>
                    <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
                  </div>
                  <p className="text-sm text-slate-500">Total Payments</p>
                </button>

                <button type="button" onClick={() => handleNavClick('pending')} className={`text-left bg-white rounded-xl p-5 border shadow-sm hover:shadow-md transition-all cursor-pointer ${activeNavItem === 'pending' ? 'border-amber-500 ring-2 ring-amber-500/20' : 'border-slate-200'}`}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
                      <FontAwesomeIcon icon={faClock} className="w-5 h-5 text-amber-600" />
                    </div>
                    <p className="text-2xl font-bold text-amber-600">{stats.pending}</p>
                  </div>
                  <p className="text-sm text-slate-500">Pending</p>
                </button>

                <button type="button" onClick={() => handleNavClick('verified')} className={`text-left bg-white rounded-xl p-5 border shadow-sm hover:shadow-md transition-all cursor-pointer ${activeNavItem === 'verified' ? 'border-emerald-500 ring-2 ring-emerald-500/20' : 'border-slate-200'}`}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
                      <FontAwesomeIcon icon={faCheckCircle} className="w-5 h-5 text-emerald-600" />
                    </div>
                    <p className="text-2xl font-bold text-emerald-600">{stats.verified}</p>
                  </div>
                  <p className="text-sm text-slate-500">Accepted</p>
                </button>

                <button type="button" onClick={() => handleNavClick('rejected')} className={`text-left bg-white rounded-xl p-5 border shadow-sm hover:shadow-md transition-all cursor-pointer ${activeNavItem === 'rejected' ? 'border-rose-500 ring-2 ring-rose-500/20' : 'border-slate-200'}`}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center shrink-0">
                      <FontAwesomeIcon icon={faTimesCircle} className="w-5 h-5 text-rose-600" />
                    </div>
                    <p className="text-2xl font-bold text-rose-600">{stats.rejected}</p>
                  </div>
                  <p className="text-sm text-slate-500">Rejected</p>
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
                    placeholder="Search by title, user, or reference number..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-2.5 pl-10 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400">
                    <FontAwesomeIcon icon={faFilter} className="w-4 h-4" />
                  </div>
                  <select
                    value={statusFilter}
                    onChange={(e) => { setStatusFilter(e.target.value); }}
                    className="pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none appearance-none cursor-pointer min-w-40"
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="verified">Accepted</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
                <button onClick={fetchPayments} className="px-4 py-2.5 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition flex items-center gap-2 text-sm">
                  <FontAwesomeIcon icon={faSync} className="w-4 h-4" />
                  Refresh
                </button>
              </div>

              {/* Payments Table */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200">
                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">User / Submission</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Amount</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Reference</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPayments.map((payment) => (
                        <tr key={payment.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition">
                          <td className="px-6 py-4">
                            <p className="text-sm font-semibold text-slate-900">{payment.user_name}</p>
                            <p className="text-xs text-slate-500">{payment.submission_title || 'N/A'}</p>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-sm font-semibold text-slate-900">{formatCurrency(payment.payment_amount)}</p>
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-600">{payment.reference_number || 'N/A'}</td>
                          <td className="px-6 py-4 text-sm text-slate-600">{new Date(payment.created_at).toLocaleDateString()}</td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(payment.payment_status)}`}>
                              {getStatusIcon(payment.payment_status)} {payment.payment_status === 'verified' ? 'ACCEPTED' : payment.payment_status.toUpperCase()}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <button onClick={() => openPaymentDetails(payment)} className="text-blue-600 hover:text-blue-700 text-sm font-medium inline-flex items-center gap-1">
                              <FontAwesomeIcon icon={faEye} className="w-3.5 h-3.5" />
                              {payment.payment_status === 'pending' ? 'Review' : 'View'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {filteredPayments.length === 0 && (
                    <div className="text-center py-12 text-slate-500">
                      <FontAwesomeIcon icon={faMoneyBillWave} className="w-10 h-10 text-slate-300 mb-3" />
                      <p>No payments found</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* ============ MODALS ============ */}

      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-9999 animate-slide-in">
          <div className={`relative w-96 p-4 rounded-xl border shadow-lg ${toast.type === 'success' ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}>
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

      <SettingsPanel isOpen={showSettings} onClose={() => setShowSettings(false)} onSaved={() => showToast('Settings saved!', 'success')}/>
      <HelpCenterPanel isOpen={showHelpCenter} onClose={() => setShowHelpCenter(false)} onGotIt={() => { setActiveNavItem('dashboard'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}/>

      {/* Payment Details Modal */}
      {showModal && selectedPayment && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)}></div>
          <div className="relative min-h-full flex items-center justify-center p-4">
            <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[95vh] flex flex-col">
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-linear-to-r from-emerald-50 to-blue-50 sticky top-0 z-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <FontAwesomeIcon icon={faMoneyBillWave} className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Payment Details</h3>
                    <p className="text-sm text-slate-500">Review payment proof and verify</p>
                  </div>
                </div>
                <button onClick={() => setShowModal(false)} className="w-10 h-10 flex items-center justify-center rounded-lg bg-white text-slate-600 hover:bg-slate-100 transition shadow-sm">
                  <FontAwesomeIcon icon={faTimesCircle} className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 flex-1 overflow-hidden min-h-0">
                {/* Left: Payment Info */}
                <div className="p-6 overflow-y-auto border-r border-slate-200">
                  <SectionTitle icon={faReceipt} color="emerald" label="Payment Information" />
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-slate-600 font-medium">Submission Title</p>
                      <p className="text-lg font-semibold text-slate-900">{selectedPayment.submission_title || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600 font-medium">User</p>
                      <p className="text-lg font-semibold text-slate-900">{selectedPayment.user_name}</p>
                      <p className="text-sm text-slate-500">{selectedPayment.user_email}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-slate-600 font-medium">Amount</p>
                        <p className="text-lg font-semibold text-slate-900">{formatCurrency(selectedPayment.payment_amount)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-600 font-medium">Reference Number</p>
                        <p className="text-lg font-semibold text-slate-900">{selectedPayment.reference_number || 'N/A'}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600 font-medium">Payment Date</p>
                      <p className="text-lg font-semibold text-slate-900">
                        {selectedPayment.payment_date ? new Date(selectedPayment.payment_date).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600 font-medium">Submitted On</p>
                      <p className="text-lg font-semibold text-slate-900">{new Date(selectedPayment.created_at).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600 font-medium">Status</p>
                      <span className={`inline-flex px-3 py-1.5 rounded-full text-sm font-medium ${getStatusColor(selectedPayment.payment_status)}`}>
                        {getStatusIcon(selectedPayment.payment_status)} {selectedPayment.payment_status === 'verified' ? 'ACCEPTED' : selectedPayment.payment_status.toUpperCase()}
                      </span>
                    </div>
                    {selectedPayment.rejection_reason && (
                      <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                        <p className="text-sm font-semibold text-red-700">Rejection Reason</p>
                        <p className="text-sm text-red-600">{selectedPayment.rejection_reason}</p>
                      </div>
                    )}
                    {selectedPayment.verified_by && (
                      <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                        <p className="text-sm font-semibold text-emerald-700">Verified By</p>
                        <p className="text-sm text-emerald-600">{getUserName(selectedPayment.verified_by)}</p>
                        <p className="text-xs text-emerald-500">
                          {selectedPayment.verified_at ? new Date(selectedPayment.verified_at).toLocaleString() : ''}
                        </p>
                      </div>
                    )}
                  </div>

                  {selectedPayment.payment_status === 'pending' && (
                    <div className="mt-6 pt-6 border-t-2 border-emerald-200 space-y-3">
                      <h4 className="text-base font-bold text-emerald-700 uppercase mb-3">Actions</h4>
                      <button onClick={() => handleVerify(selectedPayment.id)} disabled={actionLoading} className="w-full bg-emerald-600 text-white py-3 rounded-xl font-semibold hover:bg-emerald-700 transition disabled:opacity-50 flex items-center justify-center gap-2">
                        <FontAwesomeIcon icon={faCheckCircle} className="w-5 h-5" />
                        {actionLoading ? 'Processing...' : 'Verify Payment'}
                      </button>
                      <button onClick={() => setShowRejectModal(true)} disabled={actionLoading} className="w-full bg-red-500 text-white py-3 rounded-xl font-semibold hover:bg-red-600 transition disabled:opacity-50 flex items-center justify-center gap-2">
                        <FontAwesomeIcon icon={faTimesCircle} className="w-5 h-5" />
                        Reject Payment
                      </button>
                    </div>
                  )}
                </div>

                {/* Right: Proof Viewer */}
                <div className="bg-slate-50 p-6 overflow-y-auto">
                  <SectionTitle icon={faFolderOpen} color="blue" label="Payment Proof" />
                  {selectedPayment.payment_proof_view_url ? (
                    <div className="border rounded-lg bg-white overflow-hidden" style={{ height: '550px' }}>
                      <iframe src={`https://drive.google.com/file/d/${extractGoogleDriveId(selectedPayment.payment_proof_view_url)}/preview?embedded=true`} className="w-full h-full" allow="autoplay" />
                    </div>
                  ) : (
                    <div className="text-center py-16 text-slate-500 bg-white rounded-lg border text-lg">No Payment Proof Available</div>
                  )}
                  <div className="mt-4">
                    <a href={selectedPayment.payment_proof_view_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 text-sm font-medium inline-flex items-center gap-2">
                      <FontAwesomeIcon icon={faEye} className="w-4 h-4" />
                      Open in new tab
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowRejectModal(false)}></div>
          <div className="relative min-h-full flex items-center justify-center p-4">
            <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200">
                <h3 className="text-lg font-bold text-red-600">Reject Payment</h3>
              </div>
              <div className="p-6">
                <p className="text-slate-600 mb-4">Please provide a reason for rejecting this payment:</p>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Enter rejection reason..."
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-red-500/20 focus:border-red-500 focus:outline-none"
                  rows={4}
                />
                <div className="mt-4 flex gap-3">
                  <button onClick={() => setShowRejectModal(false)} className="flex-1 px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200 transition">Cancel</button>
                  <button onClick={() => handleReject(selectedPayment.id)} disabled={actionLoading} className="flex-1 px-4 py-2 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition disabled:opacity-50">
                    {actionLoading ? 'Processing...' : 'Confirm Reject'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

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