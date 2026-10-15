"use client";

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faGavel,
  faSignOutAlt,
  faChevronLeft,
  faChevronRight,
  faDashboard,
  faFileAlt,
  faEnvelope,
  faCog,
  faQuestionCircle,
  faInfoCircle,
  faEdit,
  faHistory,
} from '@fortawesome/free-solid-svg-icons';
import ConfirmModal from './../ConfirmModal';

// ---------- Helper to format role for display ----------
function formatRole(role) {
  if (!role) return 'User';
  switch (role.toLowerCase()) {
    case 'master_approver':
      return 'Master Approver';
    case 'evaluator':
      return 'Evaluator';
    case 'admin':
      return 'Administrator';
    default:
      return role
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
  }
}

// ---------- Sidebar Navigation Item ----------
export function SidebarItem({ icon, label, isActive, onClick, collapsed, badge = null }) {
  return (
    <button
      onClick={onClick}
      className={`
        w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative
        ${isActive
          ? 'bg-linear-to-r from-indigo-500 to-blue-600 text-white shadow-lg shadow-indigo-500/25'
          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
        }
        ${collapsed ? 'justify-center px-3' : ''}
      `}
      title={collapsed ? label : ''}
    >
      <FontAwesomeIcon
        icon={icon}
        className={`w-5 h-5 shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'}`}
      />
      {!collapsed && (
        <>
          <span className="font-semibold text-sm flex-1 text-left">{label}</span>
          {badge !== null && badge > 0 && (
            <span
              className={`
                px-2 py-0.5 rounded-full text-[10px] font-bold
                ${isActive ? 'bg-white/25 text-white' : 'bg-indigo-100 text-indigo-700'}
              `}
            >
              {badge}
            </span>
          )}
        </>
      )}
      {collapsed && badge !== null && badge > 0 && (
        <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
          {badge > 99 ? '99+' : badge}
        </span>
      )}
    </button>
  );
}

// ---------- Quick Tips (shown in expanded sidebar only) ----------
const QUICK_TIPS = [
  {
    icon: faGavel,
    title: 'Make final decisions',
    text: 'Click any submission to review details and endorse or downgrade.',
    box: 'bg-indigo-50 border-indigo-100',
    iconBox: 'bg-indigo-100',
    iconColor: 'text-indigo-600',
    titleColor: 'text-indigo-900',
    textColor: 'text-indigo-700',
  },
  {
    icon: faEdit,
    title: 'Edit before deciding',
    text: 'Correct extracted data issues before making your final call.',
    box: 'bg-emerald-50 border-emerald-100',
    iconBox: 'bg-emerald-100',
    iconColor: 'text-emerald-600',
    titleColor: 'text-emerald-900',
    textColor: 'text-emerald-700',
  },
  {
    icon: faHistory,
    title: 'Track all changes',
    text: 'View edit history to see who changed what and when.',
    box: 'bg-blue-50 border-blue-100',
    iconBox: 'bg-blue-100',
    iconColor: 'text-blue-600',
    titleColor: 'text-blue-900',
    textColor: 'text-blue-700',
  },
];

// ---------- Sidebar Component ----------
export default function Sidebar({
  collapsed,
  onToggleCollapse,
  activeNavItem,
  onNavClick,
  currentUser,
  pendingCount = 0,
  systemPendingCount = 0,
  emailPendingCount = 0,
  mobileOpen = false,
  onMobileClose,
}) {
  const router = useRouter();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  // Main navigation — shown at the top
  const navItems = [
    {
      id: 'dashboard',
      icon: faDashboard,
      label: 'Dashboard',
      badge: null,
    },
    {
      id: 'system',
      icon: faFileAlt,
      label: 'Submissions',
      badge: systemPendingCount || null,
    },
  ];

  // Secondary navigation
  const secondaryItems = [
    {
      id: 'settings',
      icon: faCog,
      label: 'Settings',
    },
    {
      id: 'help',
      icon: faQuestionCircle,
      label: 'Help Center',
    },
  ];

  const displayRole = formatRole(currentUser?.role);

  const handleLogout = () => {
    setLoggingOut(true);
    localStorage.removeItem('pemnet_token');
    localStorage.removeItem('pemnet_user');
    router.push('/login');
  };

  const closeLogoutModal = () => {
    setShowLogoutModal(false);
    setLoggingOut(false);
  };

  return (
    <>
      <aside
        className={`
          fixed lg:sticky top-0 left-0 z-50 h-screen bg-white border-r border-slate-200
          flex flex-col transition-all duration-300 ease-in-out
          ${collapsed ? 'w-20' : 'w-64'}
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Sidebar Header */}
        <div
          className={`flex items-center h-16 px-4 border-b border-slate-200 ${
            collapsed ? 'justify-center' : 'justify-between'
          }`}
        >
          {!collapsed && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-linear-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
                <FontAwesomeIcon icon={faGavel} className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-slate-800 text-sm">PEMNet</span>
            </div>
          )}
          {collapsed && (
            <div className="w-8 h-8 rounded-lg bg-linear-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <FontAwesomeIcon icon={faGavel} className="w-4 h-4 text-white" />
            </div>
          )}
          <button
            onClick={onToggleCollapse}
            className={`hidden lg:flex w-8 h-8 items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition ${
              collapsed ? 'absolute -right-4 bg-white border border-slate-200 shadow-sm' : ''
            }`}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <FontAwesomeIcon
              icon={collapsed ? faChevronRight : faChevronLeft}
              className="w-4 h-4"
            />
          </button>
        </div>

        {/* Main Navigation Items (top) */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <SidebarItem
              key={item.id}
              icon={item.icon}
              label={item.label}
              isActive={activeNavItem === item.id}
              onClick={() => onNavClick(item.id)}
              collapsed={collapsed}
              badge={item.badge}
            />
          ))}

          {/* Quick Tips — hidden when sidebar is collapsed */}
          {!collapsed && (
            <div className="pt-4 mt-3 border-t border-slate-200">
              <h3 className="px-1 mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                <FontAwesomeIcon icon={faInfoCircle} className="w-3.5 h-3.5 text-blue-500" />
                Quick Tips
              </h3>
              <div className="space-y-2">
                {QUICK_TIPS.map((tip) => (
                  <div
                    key={tip.title}
                    className={`flex items-start gap-2.5 p-2.5 rounded-xl border ${tip.box}`}
                  >
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${tip.iconBox}`}>
                      <FontAwesomeIcon icon={tip.icon} className={`w-3 h-3 ${tip.iconColor}`} />
                    </div>
                    <div className="min-w-0">
                      <p className={`text-xs font-semibold ${tip.titleColor}`}>{tip.title}</p>
                      <p className={`text-[11px] leading-snug mt-0.5 ${tip.textColor}`}>{tip.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </nav>

        {/* Secondary Navigation — Settings & Help Center */}
        <div className="p-3 pt-2 space-y-1 border-t border-slate-200">
          {secondaryItems.map((item) => (
            <SidebarItem
              key={item.id}
              icon={item.icon}
              label={item.label}
              isActive={false}
              onClick={() => onNavClick(item.id)}
              collapsed={collapsed}
            />
          ))}
        </div>

        {/* Sidebar Footer - User Info */}
        <div className={`p-3 border-t border-slate-200 ${collapsed ? 'flex justify-center' : ''}`}>
          {collapsed ? (
            <button
              onClick={() => setShowLogoutModal(true)}
              className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold uppercase text-sm shadow-sm cursor-pointer hover:ring-2 hover:ring-blue-300 transition"
              title="Logout"
            >
              {currentUser?.full_name?.charAt(0) || 'U'}
            </button>
          ) : (
            <div className="flex items-center gap-3 p-2 bg-slate-50 rounded-xl border border-slate-200">
              <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold uppercase text-sm shadow-sm shrink-0">
                {currentUser?.full_name?.charAt(0) || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-800 truncate">
                  {currentUser?.full_name || 'User'}
                </p>
                <p className="text-[10px] text-slate-500 uppercase tracking-wider font-medium">
                  {displayRole}
                </p>
              </div>
              <button
                onClick={() => setShowLogoutModal(true)}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-red-500 hover:bg-red-50 transition shrink-0"
                title="Logout"
              >
                <FontAwesomeIcon icon={faSignOutAlt} className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={onMobileClose}
        />
      )}

      {/* Logout Confirmation Modal */}
      <ConfirmModal
        isOpen={showLogoutModal}
        onClose={closeLogoutModal}
        onConfirm={handleLogout}
        title="Logout?"
        message="Are you sure you want to log out of your account?"
        confirmText="Yes, Logout"
        cancelText="Cancel"
        isLoading={loggingOut}
        type="danger"
      />
    </>
  );
}