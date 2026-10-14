'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faGavel,
  faSignOutAlt,
  faChevronLeft,
  faChevronRight,
  faDashboard,
  faNewspaper,
  faInfoCircle,
  faCreditCard,
  faArrowUpRightFromSquare,
  faBars,
  faQuestionCircle,
  faUsers,
} from '@fortawesome/free-solid-svg-icons';
import ConfirmModal from '../components/ConfirmModal';

const API_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, '') || 'http://localhost:5000';

const NAV_ITEMS = [
  { href: '/admin',             label: 'Dashboard',     icon: faDashboard },
  { href: '/admin/news',        label: 'News & Events', icon: faNewspaper },
  { href: '/admin/about',       label: 'About Page',    icon: faInfoCircle },
  { href: '/admin/payments',    label: 'Payments',      icon: faCreditCard },
  { href: '/admin/help-center', label: 'Help Center',   icon: faQuestionCircle },
  { href: '/admin/users',       label: 'User Management', icon: faUsers },
];

function SidebarItem({ icon, label, isActive, onClick, collapsed }) {
  return (
    <Link
      href={onClick.href}
      onClick={onClick.handleClick}
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
      {!collapsed && <span className="font-semibold text-sm flex-1 text-left">{label}</span>}
    </Link>
  );
}

function formatRole(role) {
  if (!role) return 'User';
  switch (role.toLowerCase()) {
    case 'master_approver': return 'Master Approver';
    case 'evaluator':       return 'Evaluator';
    case 'admin':           return 'Administrator';
    case 'staff':           return 'Staff';
    default:
      return role
        .split('_')
        .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(' ');
  }
}

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const router   = useRouter();

  const [collapsed, setCollapsed]       = useState(false);
  const [mobileOpen, setMobileOpen]     = useState(false);
  const [user, setUser]                 = useState(null);
  const [checked, setChecked]           = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [loggingOut, setLoggingOut]     = useState(false);

  useEffect(() => {
    try {
      const userStr = localStorage.getItem('pemnet_user');
      if (!userStr) { router.push('/login'); return; }
      const u = JSON.parse(userStr);
      if (!['admin', 'staff', 'master_approver'].includes(u.role)) {
        router.push('/login');
        return;
      }
      setUser(u);
    } catch {
      router.push('/login');
    } finally {
      setChecked(true);
    }
  }, [router]);

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

  if (!checked) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
          <p className="text-slate-500 text-sm font-medium">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  const displayRole = formatRole(user?.role);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* ============ SIDEBAR ============ */}
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
            onClick={() => setCollapsed(!collapsed)}
            className={`hidden lg:flex w-8 h-8 items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition ${
              collapsed ? 'absolute -right-4 bg-white border border-slate-200 shadow-sm' : ''
            }`}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <FontAwesomeIcon icon={collapsed ? faChevronRight : faChevronLeft} className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const isActive =
              item.href === '/admin'
                ? pathname === '/admin'
                : pathname.startsWith(item.href);
            return (
              <SidebarItem
                key={item.href}
                icon={item.icon}
                label={item.label}
                isActive={isActive}
                collapsed={collapsed}
                onClick={{
                  href: item.href,
                  handleClick: () => setMobileOpen(false),
                }}
              />
            );
          })}

          <div className={`my-3 border-t border-slate-200 ${collapsed ? 'mx-2' : ''}`} />

          <Link
            href="/"
            className={`
              w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group
              text-slate-600 hover:bg-slate-100 hover:text-slate-900
              ${collapsed ? 'justify-center px-3' : ''}
            `}
            title={collapsed ? 'Back to Site' : ''}
          >
            <FontAwesomeIcon
              icon={faArrowUpRightFromSquare}
              className="w-5 h-5 shrink-0 text-slate-400 group-hover:text-slate-600"
            />
            {!collapsed && <span className="font-semibold text-sm flex-1 text-left">Back to Site</span>}
          </Link>
        </nav>

        {/* Sidebar Footer - User Info */}
        <div className={`p-3 border-t border-slate-200 ${collapsed ? 'flex justify-center' : ''}`}>
          {collapsed ? (
            <button
              onClick={() => setShowLogoutModal(true)}
              className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold uppercase text-sm shadow-sm cursor-pointer hover:ring-2 hover:ring-blue-300 transition"
              title="Logout"
            >
              {user?.full_name?.charAt(0) || 'A'}
            </button>
          ) : (
            <div className="flex items-center gap-3 p-2 bg-slate-50 rounded-xl border border-slate-200">
              <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold uppercase text-sm shadow-sm shrink-0">
                {user?.full_name?.charAt(0) || 'A'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-800 truncate">
                  {user?.full_name || 'Admin'}
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

      {/* ============ MAIN CONTENT ============ */}
      <main className="flex-1 min-w-0">
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200">
          <div className="px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileOpen(true)}
                className="lg:hidden w-9 h-9 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-500 transition"
              >
                <FontAwesomeIcon icon={faBars} className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-slate-900">
                  {NAV_ITEMS.find(i => i.href === pathname)?.label || 'Admin Panel'}
                </h1>
                <p className="text-xs text-slate-500 hidden sm:block">
                  Manage your site content and settings
                </p>
              </div>
            </div>
          </div>
        </header>

        <div className="p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </main>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Logout Confirmation Modal */}
      <ConfirmModal
        isOpen={showLogoutModal}
        onClose={closeLogoutModal}
        onConfirm={handleLogout}
        title="Logout?"
        message="Are you sure you want to log out of your admin account?"
        confirmText="Yes, Logout"
        cancelText="Cancel"
        isLoading={loggingOut}
        type="danger"
      />
    </div>
  );
}