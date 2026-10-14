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
      label: 'System Submissions',
      badge: systemPendingCount || null,
    },
    {
      id: 'email',
      icon: faEnvelope,
      label: 'Email Submissions',
      badge: emailPendingCount || null,
    },
  ];

  // Secondary navigation — moved to the bottom, above user info
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