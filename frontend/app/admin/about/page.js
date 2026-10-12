'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, '') || 'http://localhost:5000';

const COLOR_THEMES = [
  { value: 'blue',   label: 'Blue',   bg: 'bg-blue-50',   text: 'text-blue-600' },
  { value: 'green',  label: 'Green',  bg: 'bg-green-50',  text: 'text-green-600' },
  { value: 'yellow', label: 'Yellow', bg: 'bg-yellow-50', text: 'text-yellow-600' },
  { value: 'purple', label: 'Purple', bg: 'bg-purple-50', text: 'text-purple-600' },
  { value: 'red',    label: 'Red',    bg: 'bg-red-50',    text: 'text-red-600' },
  { value: 'indigo', label: 'Indigo', bg: 'bg-indigo-50', text: 'text-indigo-600' },
];

const ICON_OPTIONS = [
  { value: 'users',     label: 'Users' },
  { value: 'book',      label: 'Book' },
  { value: 'people',    label: 'People Group' },
  { value: 'globe',     label: 'Globe' },
  { value: 'document',  label: 'Document' },
  { value: 'academic',  label: 'Academic Cap' },
  { value: 'megaphone', label: 'Megaphone' },
];

const TABS = [
  { id: 'header',         label: 'Header' },
  { id: 'what_is',        label: 'What is PEMNet?' },
  { id: 'stats',          label: 'Stats' },
  { id: 'mission_vision', label: 'Mission & Vision' },
  { id: 'what_we_do',     label: 'What We Do' },
  { id: 'members',        label: 'Members' },
];

// Section keys that map to AboutContent rows
const CONTENT_SECTIONS = ['header', 'what_is', 'mission', 'vision', 'core_values', 'what_we_do'];

// Helper to safely read a section field (returns '' if missing)
const readSection = (content, section, field, fallback = '') => {
  const val = content?.[section]?.[field];
  return val === undefined || val === null ? fallback : val;
};

function getLogoImageUrl(member) {
  if (!member) return null;

  let fileId = member.logo_file_id;
  if (!fileId && member.logo_view_url) {
    const match = member.logo_view_url.match(/\/d\/([a-zA-Z0-9_-]+)/);
    if (match) fileId = match[1];
  }
  if (!fileId) return null;

  // Point at our cached proxy — NOT Drive directly
  return `${API_URL}/api/member-logo/${fileId}`;
}

export default function AdminAboutPage() {
  const [activeTab, setActiveTab] = useState('header');
  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState('');
  const [success, setSuccess]     = useState('');

  // Content comes entirely from the DB — no hardcoded shapes.
  const [content, setContent]   = useState({});
  const [stats, setStats]       = useState([]);
  const [features, setFeatures] = useState([]);
  const [cards, setCards]       = useState([]);
  const [members, setMembers]   = useState([]);

  const [editingStat, setEditingStat]       = useState(null);
  const [editingFeature, setEditingFeature] = useState(null);
  const [editingCard, setEditingCard]       = useState(null);
  const [editingMember, setEditingMember]   = useState(null);
  const [uploadingLogo, setUploadingLogo]   = useState(false);
  const [deleteConfirm, setDeleteConfirm]   = useState(null);

  const getUser = () => {
    if (typeof window === 'undefined') return null;
    try {
      const u = localStorage.getItem('pemnet_user');
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/admin/about`);
      if (res.ok) {
        const data = await res.json();
        setContent(data.content || {});
        setStats(data.stats || []);
        setFeatures(data.features || []);
        setCards(data.cards || []);
        setMembers(data.members || []);
      } else {
        setError('Failed to fetch About content');
      }
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (success) {
      const t = setTimeout(() => setSuccess(''), 3000);
      return () => clearTimeout(t);
    }
  }, [success]);

  useEffect(() => {
    if (error) {
      const t = setTimeout(() => setError(''), 5000);
      return () => clearTimeout(t);
    }
  }, [error]);

  // Update a field inside a section — creates the section if missing
  const updateSection = (key, field, value) => {
    setContent((prev) => ({
      ...prev,
      [key]: { ...(prev[key] || {}), [field]: value },
    }));
  };

  const handleSaveContent = async (keys) => {
    setSaving(true);
    try {
      const user = getUser();
      const payload = { _user_id: user?.id };
      keys.forEach((k) => {
        payload[k] = content[k] || {};
      });
      const res = await fetch(`${API_URL}/api/admin/about/content`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) setSuccess('Content saved!');
      else {
        const d = await res.json().catch(() => ({}));
        setError(d.detail || 'Failed to save');
      }
    } catch {
      setError('Network error');
    } finally {
      setSaving(false);
    }
  };

  const saveStat = async (data) => {
    setSaving(true);
    try {
      const user = getUser();
      const isEdit = !!data.id;
      const url = isEdit
        ? `${API_URL}/api/admin/about/stats/${data.id}`
        : `${API_URL}/api/admin/about/stats`;
      const res = await fetch(url, {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, _user_id: user?.id }),
      });
      if (res.ok) {
        setSuccess(isEdit ? 'Stat updated!' : 'Stat created!');
        setEditingStat(null);
        fetchData();
      } else {
        const d = await res.json().catch(() => ({}));
        setError(d.detail || 'Failed');
      }
    } finally {
      setSaving(false);
    }
  };

  const saveFeature = async (data) => {
    setSaving(true);
    try {
      const user = getUser();
      const isEdit = !!data.id;
      const url = isEdit
        ? `${API_URL}/api/admin/about/features/${data.id}`
        : `${API_URL}/api/admin/about/features`;
      const res = await fetch(url, {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, _user_id: user?.id }),
      });
      if (res.ok) {
        setSuccess(isEdit ? 'Feature updated!' : 'Feature created!');
        setEditingFeature(null);
        fetchData();
      } else {
        const d = await res.json().catch(() => ({}));
        setError(d.detail || 'Failed');
      }
    } finally {
      setSaving(false);
    }
  };

  const saveCard = async (data) => {
    setSaving(true);
    try {
      const user = getUser();
      const isEdit = !!data.id;
      const url = isEdit
        ? `${API_URL}/api/admin/about/cards/${data.id}`
        : `${API_URL}/api/admin/about/cards`;
      const res = await fetch(url, {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, _user_id: user?.id }),
      });
      if (res.ok) {
        setSuccess(isEdit ? 'Card updated!' : 'Card created!');
        setEditingCard(null);
        fetchData();
      } else {
        const d = await res.json().catch(() => ({}));
        setError(d.detail || 'Failed');
      }
    } finally {
      setSaving(false);
    }
  };

  const saveMember = async (data) => {
    setSaving(true);
    try {
      const user = getUser();
      const isEdit = !!data.id;
      const url = isEdit
        ? `${API_URL}/api/admin/about/members/${data.id}`
        : `${API_URL}/api/admin/about/members`;
      const res = await fetch(url, {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, _user_id: user?.id }),
      });
      if (res.ok) {
        setSuccess(isEdit ? 'Member updated!' : 'Member created!');
        setEditingMember(null);
        fetchData();
      } else {
        const d = await res.json().catch(() => ({}));
        setError(d.detail || 'Failed');
      }
    } finally {
      setSaving(false);
    }
  };

  const uploadLogo = async (file) => {
    if (!file) return;
    setUploadingLogo(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('acronym', editingMember?.acronym || '');
      const res = await fetch(`${API_URL}/api/admin/about/members/upload-logo`, {
        method: 'POST',
        body: formData,
      });
      if (res.ok) {
        const d = await res.json();
        setEditingMember((prev) => ({
          ...prev,
          logo_file_id: d.file_id,
          logo_view_url: d.view_url,
        }));
        setSuccess('Logo uploaded!');
      } else {
        const d = await res.json().catch(() => ({}));
        setError(d.detail || 'Upload failed');
      }
    } catch {
      setError('Upload error');
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    try {
      const url =
        deleteConfirm.type === 'stat'
          ? `${API_URL}/api/admin/about/stats/${deleteConfirm.id}`
          : deleteConfirm.type === 'feature'
          ? `${API_URL}/api/admin/about/features/${deleteConfirm.id}`
          : deleteConfirm.type === 'member'
          ? `${API_URL}/api/admin/about/members/${deleteConfirm.id}`
          : `${API_URL}/api/admin/about/cards/${deleteConfirm.id}`;
      const res = await fetch(url, { method: 'DELETE' });
      if (res.ok) {
        setSuccess('Deleted!');
        setDeleteConfirm(null);
        fetchData();
      }
    } catch {
      setError('Failed to delete');
    }
  };

  const getColor = (theme) => COLOR_THEMES.find((c) => c.value === theme) || COLOR_THEMES[0];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-indigo-500 border-t-transparent"></div>
          <p className="text-slate-500 text-sm font-medium">Loading About content...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <Link
          href="/about"
          target="_blank"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl font-semibold text-sm hover:bg-slate-50 transition shadow-sm self-start sm:self-auto"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
          </svg>
          Preview
        </Link>
      </div>

      {/* Alerts */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-2">
          <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl flex items-center gap-2">
          <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {success}
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-1.5 overflow-x-auto">
        <div className="flex items-center gap-1 min-w-max">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* HEADER TAB */}
      {activeTab === 'header' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h2 className="text-xl font-bold text-slate-900 mb-1">Page Header</h2>
          <p className="text-sm text-slate-500 mb-6">Main title and subtitle at the top of the About page.</p>
          <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Title</label>
                <input
                  type="text"
                  value={readSection(content, 'header', 'title')}
                  onChange={(e) => updateSection('header', 'title', e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Title Highlight (blue)</label>
                <input
                  type="text"
                  value={readSection(content, 'header', 'title_highlight')}
                  onChange={(e) => updateSection('header', 'title_highlight', e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Subtitle / Intro</label>
              <textarea
                value={readSection(content, 'header', 'subtitle')}
                onChange={(e) => updateSection('header', 'subtitle', e.target.value)}
                rows={4}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none"
              />
            </div>
          </div>
          <div className="flex justify-end mt-6 pt-4 border-t border-slate-200">
            <button
              onClick={() => handleSaveContent(['header'])}
              disabled={saving}
              className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold text-sm hover:bg-indigo-700 transition disabled:opacity-50 shadow-sm"
            >
              {saving ? 'Saving...' : 'Save Header'}
            </button>
          </div>
        </div>
      )}

      {/* WHAT IS TAB */}
      {activeTab === 'what_is' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-1">What is PEMNet?</h2>
            <p className="text-sm text-slate-500 mb-6">Heading and description.</p>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Heading</label>
                <input
                  type="text"
                  value={readSection(content, 'what_is', 'heading')}
                  onChange={(e) => updateSection('what_is', 'heading', e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Description</label>
                <textarea
                  value={readSection(content, 'what_is', 'description')}
                  onChange={(e) => updateSection('what_is', 'description', e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none"
                />
              </div>
            </div>
            <div className="flex justify-end mt-6 pt-4 border-t border-slate-200">
              <button
                onClick={() => handleSaveContent(['what_is'])}
                disabled={saving}
                className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold text-sm hover:bg-indigo-700 transition disabled:opacity-50 shadow-sm"
              >
                {saving ? 'Saving...' : 'Save Section'}
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Feature Bullets</h3>
                <p className="text-sm text-slate-500 mt-0.5">The checkmarked list under the description.</p>
              </div>
              <button
                onClick={() => setEditingFeature({ text: '', is_active: true })}
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl font-semibold text-sm hover:bg-indigo-700 transition shadow-sm"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Add
              </button>
            </div>
            {features.length === 0 ? (
              <p className="text-center text-slate-500 py-8 text-sm">No features yet.</p>
            ) : (
              <div className="space-y-2">
                {features.map((f) => (
                  <div key={f.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <svg className="w-5 h-5 text-emerald-600 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="flex-1 text-sm text-slate-700">{f.text}</span>
                    <button onClick={() => setEditingFeature(f)} className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded transition">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
                      </svg>
                    </button>
                    <button onClick={() => setDeleteConfirm({ type: 'feature', id: f.id, title: f.text })} className="p-1.5 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded transition">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* STATS TAB */}
      {activeTab === 'stats' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Statistics Cards</h2>
              <p className="text-sm text-slate-500 mt-0.5">The stat cards near the top of the page.</p>
            </div>
            <button
              onClick={() => setEditingStat({
                value: '', label: '', sublabel: '', icon_type: 'users', color_theme: 'blue', is_active: true,
              })}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl font-semibold text-sm hover:bg-indigo-700 transition shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Add
            </button>
          </div>
          {stats.length === 0 ? (
            <p className="text-center text-slate-500 py-8 text-sm">No stats yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {stats.map((stat) => {
                const c = getColor(stat.color_theme);
                return (
                  <div key={stat.id} className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <div className={`w-14 h-14 rounded-xl ${c.bg} flex items-center justify-center shrink-0`}>
                      <span className={`text-2xl font-bold ${c.text}`}>{stat.value}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-slate-900 truncate">{stat.label}</div>
                      {stat.sublabel && <div className="text-xs text-slate-500 truncate">{stat.sublabel}</div>}
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => setEditingStat(stat)} className="p-2 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
                        </svg>
                      </button>
                      <button onClick={() => setDeleteConfirm({ type: 'stat', id: stat.id, title: stat.label })} className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                        </svg>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* MISSION & VISION */}
      {activeTab === 'mission_vision' && (
        <div className="space-y-6">
          {['mission', 'vision'].map((key) => (
            <div key={key} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-1 capitalize">{key}</h2>
              <div className="space-y-5 mt-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Heading</label>
                  <input
                    type="text"
                    value={readSection(content, key, 'heading')}
                    onChange={(e) => updateSection(key, 'heading', e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Description</label>
                  <textarea
                    value={readSection(content, key, 'description')}
                    onChange={(e) => updateSection(key, 'description', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none"
                  />
                </div>
              </div>
            </div>
          ))}

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-1">Core Values</h2>
            <div className="space-y-5 mt-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Heading</label>
                <input
                  type="text"
                  value={readSection(content, 'core_values', 'heading')}
                  onChange={(e) => updateSection('core_values', 'heading', e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Values (comma-separated)</label>
                <input
                  type="text"
                  value={(content?.core_values?.values || []).join(', ')}
                  onChange={(e) =>
                    updateSection('core_values', 'values', e.target.value.split(',').map((v) => v.trim()).filter(Boolean))
                  }
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
                <div className="flex flex-wrap gap-2 mt-3">
                  {(content?.core_values?.values || []).map((v, i) => (
                    <span key={i} className="px-3 py-1 rounded-full border border-green-200 bg-green-50 text-green-700 text-xs font-semibold">
                      {v}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={() => handleSaveContent(['mission', 'vision', 'core_values'])}
              disabled={saving}
              className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold text-sm hover:bg-indigo-700 transition disabled:opacity-50 shadow-sm"
            >
              {saving ? 'Saving...' : 'Save All'}
            </button>
          </div>
        </div>
      )}

      {/* WHAT WE DO */}
      {activeTab === 'what_we_do' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-1">Section Heading</h2>
            <input
              type="text"
              value={readSection(content, 'what_we_do', 'heading')}
              onChange={(e) => updateSection('what_we_do', 'heading', e.target.value)}
              className="w-full mt-4 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
            <div className="flex justify-end mt-6 pt-4 border-t border-slate-200">
              <button
                onClick={() => handleSaveContent(['what_we_do'])}
                disabled={saving}
                className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold text-sm hover:bg-indigo-700 transition disabled:opacity-50 shadow-sm"
              >
                {saving ? 'Saving...' : 'Save Heading'}
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Cards</h3>
                <p className="text-sm text-slate-500 mt-0.5">The feature cards in "What We Do".</p>
              </div>
              <button
                onClick={() => setEditingCard({ title: '', description: '', icon_type: 'document', color_theme: 'blue', is_active: true })}
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl font-semibold text-sm hover:bg-indigo-700 transition shadow-sm"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Add Card
              </button>
            </div>
            {cards.length === 0 ? (
              <p className="text-center text-slate-500 py-8 text-sm">No cards yet.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {cards.map((card) => {
                  const c = getColor(card.color_theme);
                  return (
                    <div key={card.id} className="p-5 bg-slate-50 rounded-xl border border-slate-200">
                      <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-xl ${c.bg} flex items-center justify-center shrink-0`}>
                          <svg className={`w-6 h-6 ${c.text}`} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-bold text-slate-900 truncate">{card.title}</h4>
                          <p className="text-xs text-slate-600 mt-1 line-clamp-2">{card.description}</p>
                        </div>
                        <div className="flex flex-col gap-1">
                          <button onClick={() => setEditingCard(card)} className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded transition">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
                            </svg>
                          </button>
                          <button onClick={() => setDeleteConfirm({ type: 'card', id: card.id, title: card.title })} className="p-1.5 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded transition">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* MEMBERS TAB */}
      {activeTab === 'members' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Member Institutions</h2>
              <p className="text-sm text-slate-500 mt-0.5">
                Shown as avatar nodes around the network hub on the About page. Only the acronym is displayed — the full name appears on hover.
              </p>
            </div>
            <button
              onClick={() => setEditingMember({
                acronym: '', full_name: '', logo_view_url: null, logo_file_id: null,
                position_angle: 0, position_radius: 100, node_size: 'md',
                color_theme: 'blue', is_active: true,
              })}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl font-semibold text-sm hover:bg-indigo-700 transition shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Add Member
            </button>
          </div>

          {members.length === 0 ? (
            <p className="text-center text-slate-500 py-8 text-sm">No members yet. Click "Add Member" to start.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {members.map((m) => {
                const c = getColor(m.color_theme);
                const logoUrl = getLogoImageUrl(m);
                return (
                  <div key={m.id} className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <div className={`w-12 h-12 rounded-full ${logoUrl ? 'bg-white' : c.bg} border border-slate-200 flex items-center justify-center shrink-0 overflow-hidden`}>
                      {logoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={logoUrl}
                          alt={m.acronym}
                          className="w-full h-full object-contain p-1"
                          onError={(e) => { e.currentTarget.style.display = 'none'; }}
                        />
                      ) : (
                        <span className={`text-xs font-bold ${c.text}`}>{m.acronym}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold text-slate-900 truncate">{m.acronym}</div>
                      <div className="text-xs text-slate-500 truncate">{m.full_name}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        Angle {m.position_angle}° · Radius {m.position_radius}% · {m.node_size}
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <button onClick={() => setEditingMember(m)} className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded transition">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
                        </svg>
                      </button>
                      <button onClick={() => setDeleteConfirm({ type: 'member', id: m.id, title: m.acronym })} className="p-1.5 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded transition">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                        </svg>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* STAT MODAL */}
      {editingStat && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => !saving && setEditingStat(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="h-1 w-full bg-linear-to-r from-indigo-400 via-blue-400 to-blue-400" />
            <div className="p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-bold text-slate-900">{editingStat.id ? 'Edit Stat' : 'New Stat'}</h3>
                <button
                  onClick={() => !saving && setEditingStat(null)}
                  className="w-9 h-9 flex items-center justify-center rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 transition"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Value *</label>
                    <input
                      type="text"
                      value={editingStat.value}
                      onChange={(e) => setEditingStat({ ...editingStat, value: e.target.value })}
                      placeholder="85+"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Label *</label>
                    <input
                      type="text"
                      value={editingStat.label}
                      onChange={(e) => setEditingStat({ ...editingStat, label: e.target.value })}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Sub-label</label>
                  <input
                    type="text"
                    value={editingStat.sublabel || ''}
                    onChange={(e) => setEditingStat({ ...editingStat, sublabel: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Color</label>
                  <div className="flex gap-2 flex-wrap">
                    {COLOR_THEMES.map((c) => (
                      <button
                        key={c.value}
                        type="button"
                        onClick={() => setEditingStat({ ...editingStat, color_theme: c.value })}
                        className={`w-9 h-9 rounded-lg ${c.bg} border-2 transition ${
                          editingStat.color_theme === c.value ? 'ring-2 ring-indigo-500 ring-offset-2 border-indigo-500' : 'border-slate-200'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingStat.is_active}
                    onChange={(e) => setEditingStat({ ...editingStat, is_active: e.target.checked })}
                    className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500/20"
                  />
                  <span className="text-sm font-semibold text-slate-700">Show on page</span>
                </label>
              </div>
              <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-slate-200">
                <button onClick={() => setEditingStat(null)} className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:text-slate-900">
                  Cancel
                </button>
                <button
                  onClick={() => saveStat(editingStat)}
                  disabled={saving || !editingStat.value || !editingStat.label}
                  className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold text-sm hover:bg-indigo-700 transition disabled:opacity-50 shadow-sm"
                >
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FEATURE MODAL */}
      {editingFeature && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => !saving && setEditingFeature(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full">
            <div className="h-1 w-full bg-linear-to-r from-indigo-400 via-blue-400 to-blue-400" />
            <div className="p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-bold text-slate-900">{editingFeature.id ? 'Edit Feature' : 'New Feature'}</h3>
                <button
                  onClick={() => !saving && setEditingFeature(null)}
                  className="w-9 h-9 flex items-center justify-center rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 transition"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Text *</label>
                  <textarea
                    value={editingFeature.text}
                    onChange={(e) => setEditingFeature({ ...editingFeature, text: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none"
                  />
                </div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingFeature.is_active}
                    onChange={(e) => setEditingFeature({ ...editingFeature, is_active: e.target.checked })}
                    className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500/20"
                  />
                  <span className="text-sm font-semibold text-slate-700">Show on page</span>
                </label>
              </div>
              <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-slate-200">
                <button onClick={() => setEditingFeature(null)} className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:text-slate-900">
                  Cancel
                </button>
                <button
                  onClick={() => saveFeature(editingFeature)}
                  disabled={saving || !editingFeature.text.trim()}
                  className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold text-sm hover:bg-indigo-700 transition disabled:opacity-50 shadow-sm"
                >
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CARD MODAL */}
      {editingCard && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => !saving && setEditingCard(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="h-1 w-full bg-linear-to-r from-indigo-400 via-blue-400 to-blue-400" />
            <div className="p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-bold text-slate-900">{editingCard.id ? 'Edit Card' : 'New Card'}</h3>
                <button
                  onClick={() => !saving && setEditingCard(null)}
                  className="w-9 h-9 flex items-center justify-center rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 transition"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Title *</label>
                  <input
                    type="text"
                    value={editingCard.title}
                    onChange={(e) => setEditingCard({ ...editingCard, title: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Description</label>
                  <textarea
                    value={editingCard.description || ''}
                    onChange={(e) => setEditingCard({ ...editingCard, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Icon</label>
                  <select
                    value={editingCard.icon_type}
                    onChange={(e) => setEditingCard({ ...editingCard, icon_type: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  >
                    {ICON_OPTIONS.map((i) => (
                      <option key={i.value} value={i.value}>{i.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Color</label>
                  <div className="flex gap-2 flex-wrap">
                    {COLOR_THEMES.map((c) => (
                      <button
                        key={c.value}
                        type="button"
                        onClick={() => setEditingCard({ ...editingCard, color_theme: c.value })}
                        className={`w-9 h-9 rounded-lg ${c.bg} border-2 transition ${
                          editingCard.color_theme === c.value ? 'ring-2 ring-indigo-500 ring-offset-2 border-indigo-500' : 'border-slate-200'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingCard.is_active}
                    onChange={(e) => setEditingCard({ ...editingCard, is_active: e.target.checked })}
                    className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500/20"
                  />
                  <span className="text-sm font-semibold text-slate-700">Show on page</span>
                </label>
              </div>
              <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-slate-200">
                <button onClick={() => setEditingCard(null)} className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:text-slate-900">
                  Cancel
                </button>
                <button
                  onClick={() => saveCard(editingCard)}
                  disabled={saving || !editingCard.title.trim()}
                  className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold text-sm hover:bg-indigo-700 transition disabled:opacity-50 shadow-sm"
                >
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MEMBER MODAL */}
      {editingMember && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => !saving && !uploadingLogo && setEditingMember(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="h-1 w-full bg-linear-to-r from-indigo-400 via-blue-400 to-blue-400" />
            <div className="p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-bold text-slate-900">{editingMember.id ? 'Edit Member' : 'New Member'}</h3>
                <button
                  onClick={() => !saving && !uploadingLogo && setEditingMember(null)}
                  className="w-9 h-9 flex items-center justify-center rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 transition"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                {/* Logo uploader */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Logo</label>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center overflow-hidden shrink-0">
                      {getLogoImageUrl(editingMember) ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={getLogoImageUrl(editingMember)}
                          alt="Logo"
                          className="w-full h-full object-contain p-1"
                          onError={(e) => { e.currentTarget.style.display = 'none'; }}
                        />
                      ) : (
                        <span className="text-xs text-slate-400">No logo</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <input
                        type="file"
                        accept="image/*"
                        id="member-logo-input"
                        className="hidden"
                        onChange={(e) => uploadLogo(e.target.files?.[0])}
                      />
                      <label
                        htmlFor="member-logo-input"
                        className={`inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl font-semibold text-sm hover:bg-slate-50 transition shadow-sm cursor-pointer ${uploadingLogo ? 'opacity-50 pointer-events-none' : ''}`}
                      >
                        {uploadingLogo ? 'Uploading...' : 'Upload Logo'}
                      </label>
                      {editingMember.logo_view_url && (
                        <button
                          type="button"
                          onClick={() => setEditingMember({ ...editingMember, logo_view_url: null, logo_file_id: null })}
                          className="ml-2 text-xs text-red-600 hover:text-red-700 font-semibold"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Acronym *</label>
                    <input
                      type="text"
                      value={editingMember.acronym}
                      onChange={(e) => setEditingMember({ ...editingMember, acronym: e.target.value.toUpperCase() })}
                      placeholder="WVSU"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Color</label>
                    <div className="flex gap-2 flex-wrap">
                      {COLOR_THEMES.map((c) => (
                        <button
                          key={c.value}
                          type="button"
                          onClick={() => setEditingMember({ ...editingMember, color_theme: c.value })}
                          className={`w-8 h-8 rounded-lg ${c.bg} border-2 transition ${
                            editingMember.color_theme === c.value ? 'ring-2 ring-indigo-500 ring-offset-2 border-indigo-500' : 'border-slate-200'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Full Name *</label>
                  <input
                    type="text"
                    value={editingMember.full_name}
                    onChange={(e) => setEditingMember({ ...editingMember, full_name: e.target.value })}
                    placeholder="West Visayas State University"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Angle (°)</label>
                    <input
                      type="number"
                      min="0"
                      max="360"
                      value={editingMember.position_angle}
                      onChange={(e) => setEditingMember({ ...editingMember, position_angle: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">0 = top, 90 = right</p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Radius (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={editingMember.position_radius}
                      onChange={(e) => setEditingMember({ ...editingMember, position_radius: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">100 = outer edge</p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Size</label>
                    <select
                      value={editingMember.node_size}
                      onChange={(e) => setEditingMember({ ...editingMember, node_size: e.target.value })}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    >
                      <option value="sm">Small</option>
                      <option value="md">Medium</option>
                      <option value="lg">Large</option>
                    </select>
                  </div>
                </div>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingMember.is_active}
                    onChange={(e) => setEditingMember({ ...editingMember, is_active: e.target.checked })}
                    className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500/20"
                  />
                  <span className="text-sm font-semibold text-slate-700">Show on page</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-slate-200">
                <button onClick={() => setEditingMember(null)} className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:text-slate-900">
                  Cancel
                </button>
                <button
                  onClick={() => saveMember(editingMember)}
                  disabled={saving || uploadingLogo || !editingMember.acronym.trim() || !editingMember.full_name.trim()}
                  className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold text-sm hover:bg-indigo-700 transition disabled:opacity-50 shadow-sm"
                >
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRM */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setDeleteConfirm(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
            <div className="h-1 w-full bg-linear-to-r from-red-400 via-rose-400 to-red-400" />
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                  <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Delete {deleteConfirm.type}</h3>
                  <p className="text-sm text-slate-500">This action cannot be undone.</p>
                </div>
              </div>
              <p className="text-sm text-slate-600 mb-6">
                Are you sure you want to delete <span className="font-semibold text-slate-900">"{deleteConfirm.title}"</span>?
              </p>
              <div className="flex items-center justify-end gap-3">
                <button onClick={() => setDeleteConfirm(null)} className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:text-slate-900">
                  Cancel
                </button>
                <button onClick={handleDelete} className="px-5 py-2.5 bg-red-600 text-white rounded-xl font-semibold text-sm hover:bg-red-700 transition">
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}