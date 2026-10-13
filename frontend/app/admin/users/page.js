'use client';

import { useState, useEffect, useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUsers, faUserPlus, faEdit, faTrash, faKey, faSearch,
  faUserCheck, faUserSlash, faTimes, faSave, faShieldAlt,
  faUserTie, faUserGraduate, faUserCog, faUserShield, faBriefcase,
} from '@fortawesome/free-solid-svg-icons';

const API_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, '') || 'http://localhost:5000';

const ROLE_META = {
  admin:            { label: 'Administrator',   color: 'bg-purple-50 text-purple-700 border-purple-200',   icon: faUserShield },
  master_approver:  { label: 'Master Approver', color: 'bg-indigo-50 text-indigo-700 border-indigo-200',   icon: faUserTie },
  staff:            { label: 'Staff',           color: 'bg-blue-50 text-blue-700 border-blue-200',         icon: faUserCog },
  evaluator:        { label: 'Evaluator',       color: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: faUserGraduate },
  treasurer:        { label: 'Treasurer',       color: 'bg-amber-50 text-amber-700 border-amber-200',      icon: faBriefcase },
  user:             { label: 'User',            color: 'bg-slate-50 text-slate-700 border-slate-200',      icon: faUserCheck },
};

const ALL_ROLES = ['user', 'staff', 'evaluator', 'admin', 'master_approver', 'treasurer'];

function getAuthHeaders() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('pemnet_token') : null;
  const user = typeof window !== 'undefined'
    ? JSON.parse(localStorage.getItem('pemnet_user') || '{}')
    : {};
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    'X-User-Role': user.role || '',
    'X-User-Id': user.id ? String(user.id) : '',
  };
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all'); // all | active | inactive

  const [editingUser, setEditingUser] = useState(null);   // create/edit modal
  const [passwordUser, setPasswordUser] = useState(null); // password modal
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [usersRes, statsRes] = await Promise.all([
        fetch(`${API_URL}/api/admin/users`, { headers: getAuthHeaders() }),
        fetch(`${API_URL}/api/admin/users/stats`, { headers: getAuthHeaders() }),
      ]);
      if (usersRes.ok) setUsers(await usersRes.json());
      if (statsRes.ok) setStats(await statsRes.json());
    } catch (err) {
      console.error(err);
      showToast('Failed to load users', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  // Client-side filters (fast UX)
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      if (roleFilter !== 'all' && u.role !== roleFilter) return false;
      if (statusFilter === 'active' && !u.is_active) return false;
      if (statusFilter === 'inactive' && u.is_active) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        if (!u.full_name?.toLowerCase().includes(q) &&
            !u.email?.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [users, search, roleFilter, statusFilter]);

  // ============ CRUD ============

  const saveUser = async (userData) => {
    const isNew = !userData.id;
    const url = isNew
      ? `${API_URL}/api/admin/users`
      : `${API_URL}/api/admin/users/${userData.id}`;
    const method = isNew ? 'POST' : 'PUT';

    const res = await fetch(url, {
      method,
      headers: getAuthHeaders(),
      body: JSON.stringify(userData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to save user');
    await fetchAll();
    setEditingUser(null);
    showToast(isNew ? 'User created' : 'User updated');
  };

  const savePassword = async (userId, password) => {
    const res = await fetch(`${API_URL}/api/admin/users/${userId}/password`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update password');
    setPasswordUser(null);
    showToast('Password updated');
  };

  const deleteUser = async (id, name) => {
    if (!confirm(`Delete user "${name}"? This cannot be undone.`)) return;
    const res = await fetch(`${API_URL}/api/admin/users/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (res.ok) {
      await fetchAll();
      showToast('User deleted');
    } else {
      showToast(data.error || 'Failed to delete', 'error');
    }
  };

  const toggleActive = async (user) => {
    try {
      await saveUser({ id: user.id, is_active: !user.is_active });
      showToast(user.is_active ? 'User deactivated' : 'User activated');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // ============ RENDER ============

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">User Management</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage user accounts, roles, and passwords.
          </p>
        </div>
        <button
          onClick={() => setEditingUser({ full_name: '', email: '', password: '', role: 'user', is_active: true })}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition"
        >
          <FontAwesomeIcon icon={faUserPlus} className="w-4 h-4" />
          Add User
        </button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={faUsers} label="Total Users" value={stats.total} color="blue" />
          <StatCard icon={faUserCheck} label="Active" value={stats.active} color="emerald" />
          <StatCard icon={faUserSlash} label="Inactive" value={stats.inactive} color="rose" />
          <StatCard icon={faShieldAlt} label="Admins" value={stats.by_role?.admin || 0} color="purple" />
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-700" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-3 py-2 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
        >
          <option value="all">All Roles</option>
          {ALL_ROLES.map((r) => (
            <option key={r} value={r}>{ROLE_META[r].label}</option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="text-center py-16 text-slate-400">Loading users...</div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <FontAwesomeIcon icon={faUsers} className="w-12 h-12 mb-3 opacity-30" />
            <p>No users match your filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-semibold">User</th>
                  <th className="px-4 py-3 font-semibold">Role</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Created</th>
                  <th className="px-4 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((u) => {
                  const meta = ROLE_META[u.role] || ROLE_META.user;
                  return (
                    <tr key={u.id} className="hover:bg-slate-50 transition">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                            {u.full_name?.charAt(0)?.toUpperCase() || '?'}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-slate-700 truncate">
                              {u.full_name}
                            </p>
                            <p className="text-xs text-slate-500 truncate">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${meta.color}`}>
                          <FontAwesomeIcon icon={meta.icon} className="w-3 h-3" />
                          {meta.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => toggleActive(u)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition ${
                            u.is_active
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                              : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${u.is_active ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                          {u.is_active ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500">
                        {u.created_at ? new Date(u.created_at).toLocaleDateString() : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setPasswordUser(u)}
                            className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition"
                            title="Change password"
                          >
                            <FontAwesomeIcon icon={faKey} className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setEditingUser({ ...u, password: '' })}
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            title="Edit user"
                          >
                            <FontAwesomeIcon icon={faEdit} className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => deleteUser(u.id, u.full_name)}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="Delete user"
                          >
                            <FontAwesomeIcon icon={faTrash} className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      {editingUser && (
        <UserModal
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onSave={saveUser}
        />
      )}
      {passwordUser && (
        <PasswordModal
          user={passwordUser}
          onClose={() => setPasswordUser(null)}
          onSave={savePassword}
        />
      )}

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 px-6 py-3 rounded-xl shadow-lg text-white text-sm font-semibold z-50 ${
          toast.type === 'error' ? 'bg-red-600' : 'bg-emerald-600'
        }`}>
          {toast.message}
        </div>
      )}
    </div>
  );
}

/* ============ Sub-components ============ */

function StatCard({ icon, label, value, color }) {
  const colors = {
    blue:    'bg-blue-50 text-blue-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    rose:    'bg-rose-50 text-rose-600',
    purple:  'bg-purple-50 text-purple-600',
  };
  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colors[color]}`}>
        <FontAwesomeIcon icon={icon} className="w-5 h-5" />
      </div>
      <div>
        <p className="text-2xl font-bold text-slate-900">{value}</p>
        <p className="text-xs text-slate-500">{label}</p>
      </div>
    </div>
  );
}

function Modal({ title, onClose, onSave, children, saving }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h2 className="text-lg font-bold text-slate-900">{title}</h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg transition">
            <FontAwesomeIcon icon={faTimes} className="w-4 h-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6">{children}</div>
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-200 bg-slate-50">
          <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 rounded-xl transition">
            Cancel
          </button>
          <button
            onClick={onSave}
            disabled={saving}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition disabled:opacity-50"
          >
            <FontAwesomeIcon icon={faSave} className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-700 mb-1.5">{label}</label>
      {children}
    </div>
  );
}

function UserModal({ user, onClose, onSave }) {
  const isNew = !user.id;
  const [form, setForm] = useState({
    id: user.id,
    full_name: user.full_name || '',
    email: user.email || '',
    password: '',
    role: user.role || 'user',
    is_active: user.is_active !== undefined ? user.is_active : true,
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!form.full_name.trim()) return alert('Full name is required');
    if (!form.email.trim()) return alert('Email is required');
    if (isNew && (!form.password || form.password.length < 6)) {
      return alert('Password must be at least 6 characters');
    }
    setSaving(true);
    try {
      const payload = { ...form };
      if (!isNew) delete payload.password;
      await onSave(payload);
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title={isNew ? 'Add User' : 'Edit User'} onClose={onClose} onSave={handleSave} saving={saving}>
      <div className="space-y-4">
        <Field label="Full Name *">
          <input
            type="text"
            value={form.full_name}
            onChange={(e) => setForm({ ...form, full_name: e.target.value })}
            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
            placeholder="e.g., Juan Dela Cruz"
          />
        </Field>

        <Field label="Email *">
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
            placeholder="user@example.com"
          />
        </Field>

        {isNew && (
          <Field label="Password * (min 6 characters)">
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
              placeholder="••••••••"
            />
          </Field>
        )}

        <Field label="Role">
          <select
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
          >
            {ALL_ROLES.map((r) => (
              <option key={r} value={r} className="text-slate-900">
                {ROLE_META[r].label}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Status">
          <label className="flex items-center gap-2 mt-1 cursor-pointer">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
              className="w-4 h-4 rounded accent-blue-600"
            />
            <span className="text-sm text-slate-900">Account is active</span>
          </label>
        </Field>
      </div>
    </Modal>
  );
}

function PasswordModal({ user, onClose, onSave }) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [show, setShow] = useState(false);

  const handleSave = async () => {
    if (!password || password.length < 6) return alert('Password must be at least 6 characters');
    if (password !== confirmPassword) return alert('Passwords do not match');
    setSaving(true);
    try {
      await onSave(user.id, password);
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title={`Change Password — ${user.full_name}`} onClose={onClose} onSave={handleSave} saving={saving}>
      <div className="space-y-4">
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800">
          <strong>Note:</strong> This will overwrite the user's current password. The user will need to use the new password on their next login.
        </div>

        <Field label="New Password *">
          <input
            type={show ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
            placeholder="At least 6 characters"
          />
        </Field>

        <Field label="Confirm Password *">
          <input
            type={show ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
            placeholder="Re-enter password"
          />
        </Field>

        <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
          <input type="checkbox" checked={show} onChange={(e) => setShow(e.target.checked)} className="w-3.5 h-3.5 rounded" />
          Show password
        </label>
      </div>
    </Modal>
  );
}