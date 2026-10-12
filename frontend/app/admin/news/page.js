'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, '') || 'http://localhost:5000';

// Default color options
const TYPE_COLORS = {
  NEWS: { bg: 'bg-yellow-100 text-yellow-800', label: 'News' },
  EVENT: { bg: 'bg-blue-100 text-blue-800', label: 'Event' },
  ANNOUNCEMENT: { bg: 'bg-green-100 text-green-800', label: 'Announcement' }
};

const TAG_COLOR_OPTIONS = [
  { value: 'bg-yellow-50 text-yellow-700 border-yellow-200', label: 'Yellow' },
  { value: 'bg-blue-50 text-blue-700 border-blue-200', label: 'Blue' },
  { value: 'bg-green-50 text-green-700 border-green-200', label: 'Green' },
  { value: 'bg-purple-50 text-purple-700 border-purple-200', label: 'Purple' },
  { value: 'bg-red-50 text-red-700 border-red-200', label: 'Red' },
  { value: 'bg-gray-50 text-gray-700 border-gray-200', label: 'Gray' },
];

// ---------- Google Drive helpers ----------
function extractDriveId(url) {
  if (!url || typeof url !== 'string') return null;
  const patterns = [
    /\/file\/d\/([a-zA-Z0-9_-]+)/,
    /[?&]id=([a-zA-Z0-9_-]+)/,
    /\/d\/([a-zA-Z0-9_-]+)/,
    /open\?id=([a-zA-Z0-9_-]+)/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m && m[1]) return m[1].split('?')[0].split('&')[0];
  }
  return null;
}

// For <img> tags — works with public Drive files
function getThumbnailUrl(entry, size = 400) {
  let fileId = null;
  let rawUrl = null;

  if (typeof entry === 'string') {
    rawUrl = entry;
    fileId = extractDriveId(entry);
  } else if (entry && typeof entry === 'object') {
    fileId = entry.file_id || extractDriveId(entry.view_url);
    rawUrl = entry.view_url;
  }

  if (fileId) return `https://drive.google.com/thumbnail?id=${fileId}&sz=w${size}`;
  return rawUrl; // fallback for non-Drive URLs (e.g. Unsplash)
}

// For <iframe> previews — full embedded viewer
function getPreviewUrl(entry) {
  let fileId = null;
  let rawUrl = null;

  if (typeof entry === 'string') {
    rawUrl = entry;
    fileId = extractDriveId(entry);
  } else if (entry && typeof entry === 'object') {
    fileId = entry.file_id || extractDriveId(entry.view_url);
    rawUrl = entry.view_url;
  }

  if (fileId) return `https://drive.google.com/file/d/${fileId}/preview`;
  return rawUrl;
}

export default function AdminNewsPage() {
  const router = useRouter();
  const [items, setItems] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Filters
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [previewImage, setPreviewImage] = useState(null); // { view_url, file_id }

  // Form state
  const [formData, setFormData] = useState({
    type: 'NEWS',
    title: '',
    excerpt: '',
    content: '',
    date_display: '',
    event_start_date: '',
    event_end_date: '',
    tag: '',
    tag_color: TAG_COLOR_OPTIONS[1].value,
    type_color: '',
    image_urls: [],
    is_published: true,
    is_featured: false,
  });
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  // Get user from localStorage
  const getUser = () => {
    if (typeof window === 'undefined') return null;
    try {
      const userStr = localStorage.getItem('pemnet_user');
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  };

  // Check auth
  useEffect(() => {
    const user = getUser();
    if (!user || !['admin', 'staff', 'master_approver'].includes(user.role)) {
      router.push('/login');
    }
  }, [router]);

  // Fetch items
  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        type: filterType,
        status: filterStatus,
        search: searchTerm,
        sort_by: sortBy,
        sort_order: sortOrder,
      });

      const res = await fetch(`${API_URL}/api/admin/news-events?${params}`);
      if (res.ok) {
        const data = await res.json();
        setItems(data);
      } else {
        setError('Failed to fetch items');
      }
    } catch (err) {
      setError('Network error');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filterType, filterStatus, searchTerm, sortBy, sortOrder]);

  // Fetch stats
  const fetchStats = async () => {
    try {
      const res = await fetch(`${API_URL}/api/admin/news-events/stats`);
      if (res.ok) {
        setStats(await res.json());
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  useEffect(() => {
    fetchItems();
    fetchStats();
  }, [fetchItems]);

  // Clear messages after 3s
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

  const handleCreate = () => {
    setEditingItem(null);
    setFormData({
      type: 'NEWS',
      title: '',
      excerpt: '',
      content: '',
      date_display: '',
      event_start_date: '',
      event_end_date: '',
      tag: '',
      tag_color: TAG_COLOR_OPTIONS[1].value,
      type_color: '',
      image_urls: [],
      is_published: true,
      is_featured: false,
    });
    setImageFiles([]);
    setImagePreviews([]);
    setShowModal(true);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    const existingImages =
      item.image_urls?.length > 0
        ? item.image_urls
        : item.image_url
          ? [{ file_id: null, view_url: item.image_url }]
          : [];

    const toDateInput = (v) => {
      if (!v) return '';
      const s = String(v).trim();
      const m = s.match(/^(\d{4}-\d{2}-\d{2})/);
      return m ? m[1] : '';
    };

    setFormData({
      type: item.type,
      title: item.title || '',
      excerpt: item.excerpt || '',
      content: item.content || '',
      date_display: item.date_display || '',
      event_start_date: toDateInput(item.event_start_date),
      event_end_date: toDateInput(item.event_end_date),
      tag: item.tag || '',
      tag_color: item.tag_color || TAG_COLOR_OPTIONS[1].value,
      type_color: item.type_color || '',
      image_urls: existingImages,
      is_published: item.is_published,
      is_featured: item.is_featured,
    });
    setImageFiles([]);
    setImagePreviews([]);
    setShowModal(true);
  };

  // Handle multiple file selection
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setImageFiles((prev) => [...prev, ...files]);

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews((prev) => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });

    e.target.value = '';
  };

  const removeImagePreview = (index) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const removeImageUrl = (entry) => {
    setFormData((prev) => ({
      ...prev,
      image_urls: prev.image_urls.filter((e) => e !== entry),
    }));
  };

  const addImageUrl = (url) => {
    const trimmed = url.trim();
    if (!trimmed) return;

    const fid = extractDriveId(trimmed);
    const entry = fid
      ? { file_id: fid, view_url: `https://drive.google.com/file/d/${fid}/view` }
      : { file_id: null, view_url: trimmed };

    setFormData((prev) => ({
      ...prev,
      image_urls: [...prev.image_urls, entry],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const user = getUser();

      const formDataToSend = new FormData();
      formDataToSend.append('type', formData.type);
      formDataToSend.append('title', formData.title);
      formDataToSend.append('excerpt', formData.excerpt || '');
      formDataToSend.append('content', formData.content || '');
      formDataToSend.append('date_display', formData.date_display);
      if (formData.type === 'EVENT') {
        formDataToSend.append('event_start_date', formData.event_start_date || '');
        formDataToSend.append('event_end_date', formData.event_end_date || '');
      }
      formDataToSend.append('tag', formData.tag || '');
      formDataToSend.append('tag_color', formData.tag_color || '');
      formDataToSend.append('type_color', formData.type_color || '');
      formDataToSend.append('is_published', formData.is_published.toString());
      formDataToSend.append('is_featured', formData.is_featured.toString());
      formDataToSend.append('created_by', user?.id || '');

      formData.image_urls.forEach((entry) => {
        const payload = typeof entry === 'string' ? { view_url: entry } : entry;
        formDataToSend.append('image_urls', JSON.stringify(payload));
      });

      if (editingItem) {
        formDataToSend.append('keep_existing_images', 'true');
      }

      imageFiles.forEach((file) => {
        formDataToSend.append('images', file);
      });

      const url = editingItem
        ? `${API_URL}/api/admin/news-events/${editingItem.id}`
        : `${API_URL}/api/admin/news-events`;

      const res = await fetch(url, {
        method: editingItem ? 'PUT' : 'POST',
        body: formDataToSend,
      });

      if (res.ok) {
        setSuccess(editingItem ? 'Item updated successfully!' : 'Item created successfully!');
        setShowModal(false);
        fetchItems();
        fetchStats();
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.detail || 'Failed to save item');
      }
    } catch (err) {
      console.error(err);
      setError('Network error while saving');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`${API_URL}/api/admin/news-events/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setSuccess('Item deleted successfully!');
        setDeleteConfirm(null);
        fetchItems();
        fetchStats();
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.detail || 'Failed to delete item');
      }
    } catch (err) {
      setError('Network error while deleting');
    }
  };

  const handleTogglePublish = async (id) => {
    try {
      const res = await fetch(`${API_URL}/api/admin/news-events/${id}/toggle-publish`, {
        method: 'POST',
      });

      if (res.ok) {
        const data = await res.json();
        setSuccess(data.message);
        fetchItems();
        fetchStats();
      }
    } catch (err) {
      setError('Failed to toggle publish status');
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <button
          onClick={handleCreate}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold text-sm hover:bg-indigo-700 transition shadow-sm self-start sm:self-auto"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          New Item
        </button>
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

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-slate-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-bold text-slate-900">{stats.total}</p>
            <p className="text-sm text-slate-500 mt-1">Total Items</p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-bold text-emerald-600">{stats.published}</p>
            <p className="text-sm text-slate-500 mt-1">Published</p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-bold text-amber-600">{stats.drafts}</p>
            <p className="text-sm text-slate-500 mt-1">Drafts</p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-bold text-indigo-600">{stats.total_views?.toLocaleString() || 0}</p>
            <p className="text-sm text-slate-500 mt-1">Total Views</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Search by title, excerpt, or tag..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
            <svg className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
          </div>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer"
          >
            <option value="all">All Types</option>
            <option value="news">News</option>
            <option value="event">Events</option>
            <option value="announcement">Announcements</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer"
          >
            <option value="all">All Status</option>
            <option value="published">Published</option>
            <option value="draft">Drafts</option>
          </select>

          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [by, order] = e.target.value.split('-');
              setSortBy(by);
              setSortOrder(order);
            }}
            className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer"
          >
            <option value="created_at-desc">Newest First</option>
            <option value="created_at-asc">Oldest First</option>
            <option value="title-asc">Title A-Z</option>
            <option value="title-desc">Title Z-A</option>
            <option value="views-desc">Most Viewed</option>
            <option value="event_date-desc">Event Date (Newest)</option>
            <option value="event_date-asc">Event Date (Oldest)</option>
          </select>
        </div>
      </div>

      {/* Items Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-indigo-500 border-t-transparent"></div>
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 text-center">
          <svg className="w-16 h-16 mx-auto text-slate-300 mb-4" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
          </svg>
          <h3 className="text-lg font-semibold text-slate-900 mb-1">No items found</h3>
          <p className="text-slate-500 mb-6">Get started by creating your first news or event.</p>
          <button
            onClick={handleCreate}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold text-sm hover:bg-indigo-700 transition"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Create First Item
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">Item</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">Type</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">Date</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">Status</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">Views</th>
                  <th className="text-right px-6 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-indigo-50/30 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        {item.image_urls && item.image_urls.length > 0 ? (
                          <button
                            type="button"
                            onClick={() => setPreviewImage(item.image_urls[0])}
                            className="relative w-12 h-12 shrink-0 rounded-lg overflow-hidden bg-slate-100 hover:ring-2 hover:ring-indigo-400 transition"
                            title="Click to preview"
                          >
                            <iframe
                              src={`https://drive.google.com/file/d/${item.image_urls[0].file_id}/preview`}
                              className="w-300 h-300 border-0 pointer-events-none origin-top-left"
                              style={{ transform: 'scale(0.04)' }}
                              tabIndex={-1}
                              title={item.title}
                              loading="lazy"
                            />
                            {item.image_urls.length > 1 && (
                              <span className="absolute -top-1 -right-1 px-1.5 py-0.5 bg-indigo-600 text-white text-[9px] font-bold rounded-full z-10">
                                +{item.image_urls.length - 1}
                              </span>
                            )}
                          </button>
                        ) : item.image_url ? (
                          <button
                            type="button"
                            onClick={() => setPreviewImage({ view_url: item.image_url })}
                            className="relative w-12 h-12 shrink-0 rounded-lg overflow-hidden bg-slate-100 hover:ring-2 hover:ring-indigo-400 transition"
                            title="Click to preview"
                          >
                            <iframe
                              src={`https://drive.google.com/file/d/${extractDriveId(item.image_url)}/preview`}
                              className="w-300 h-300 border-0 pointer-events-none origin-top-left"
                              style={{ transform: 'scale(0.04)' }}
                              tabIndex={-1}
                              title={item.title}
                              loading="lazy"
                            />
                          </button>
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                            <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                            </svg>
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold text-slate-900 truncate max-w-xs">{item.title}</p>
                            {item.is_featured && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-700">
                                FEATURED
                              </span>
                            )}
                          </div>
                          {item.excerpt && (
                            <p className="text-xs text-slate-500 truncate max-w-sm mt-0.5">{item.excerpt}</p>
                          )}
                          {item.tag && (
                            <span className={`inline-flex mt-1 px-2 py-0.5 rounded text-[10px] font-semibold border ${item.tag_color || 'bg-slate-50 text-slate-600 border-slate-200'}`}>
                              {item.tag}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold ${item.type_color || TYPE_COLORS[item.type]?.bg || 'bg-slate-100 text-slate-700'}`}>
                        {item.type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-600">{item.date_display}</span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleTogglePublish(item.id)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition ${
                          item.is_published
                            ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                            : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${item.is_published ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                        {item.is_published ? 'Published' : 'Draft'}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-600">{item.views_count || 0}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(item)}
                          className="p-2 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                          title="Edit"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                          </svg>
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(item)}
                          className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Delete"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 py-8">
            <div
              className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm"
              onClick={() => !saving && setShowModal(false)}
            />
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="sticky top-0 bg-white z-10 border-b border-slate-200">
                <div className="h-1 w-full bg-linear-to-r from-indigo-400 via-blue-400 to-blue-400" />
                <div className="px-6 py-4 flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">
                      {editingItem ? 'Edit Item' : 'Create New Item'}
                    </h2>
                    <p className="text-sm text-slate-500 mt-0.5">
                      {editingItem ? `Editing: ${editingItem.title}` : 'Add a news article, event, or announcement'}
                    </p>
                  </div>
                  <button
                    onClick={() => !saving && setShowModal(false)}
                    className="w-9 h-9 flex items-center justify-center rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 transition"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                {/* Type & Date Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                      Type <span className="text-red-500">*</span>
                    </label>
                    <div className="flex gap-2">
                      {['NEWS', 'EVENT', 'ANNOUNCEMENT'].map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setFormData({ ...formData, type: t })}
                          className={`flex-1 px-3 py-2 rounded-xl text-xs font-bold transition border-2 ${
                            formData.type === t
                              ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                              : 'border-slate-200 text-slate-600 hover:border-slate-300'
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                      Display Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.date_display}
                      onChange={(e) => setFormData({ ...formData, date_display: e.target.value })}
                      placeholder="e.g., May 20, 2026 or June 15–17, 2026"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                      required
                    />
                  </div>
                </div>

                {/* Title */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Enter the title..."
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    required
                  />
                </div>

                {/* Excerpt */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Excerpt / Short Description
                  </label>
                  <textarea
                    value={formData.excerpt}
                    onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                    placeholder="A brief summary that appears on the card..."
                    rows={3}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none"
                  />
                </div>

                {/* Content */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Full Content
                  </label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    placeholder="Full article content (optional)..."
                    rows={5}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none"
                  />
                </div>

                {/* Event Dates */}
                {formData.type === 'EVENT' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 p-4 bg-indigo-50/50 rounded-xl border border-indigo-100">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                        Event Start Date
                      </label>
                      <input
                        type="date"
                        value={formData.event_start_date}
                        onChange={(e) => setFormData({ ...formData, event_start_date: e.target.value })}
                        className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                        Event End Date
                      </label>
                      <input
                        type="date"
                        value={formData.event_end_date}
                        onChange={(e) => setFormData({ ...formData, event_end_date: e.target.value })}
                        className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                      />
                    </div>
                  </div>
                )}

                {/* Tag & Tag Color */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                      Tag
                    </label>
                    <input
                      type="text"
                      value={formData.tag}
                      onChange={(e) => setFormData({ ...formData, tag: e.target.value })}
                      placeholder="e.g., Funding, Symposium, Deadline"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                      Tag Color
                    </label>
                    <div className="flex gap-2">
                      {TAG_COLOR_OPTIONS.map((color) => (
                        <button
                          key={color.value}
                          type="button"
                          onClick={() => setFormData({ ...formData, tag_color: color.value })}
                          className={`w-9 h-9 rounded-lg border-2 transition ${color.value} ${
                            formData.tag_color === color.value
                              ? 'ring-2 ring-indigo-500 ring-offset-2'
                              : ''
                          }`}
                          title={color.label}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Featured Images */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Featured Images
                    <span className="ml-2 text-xs font-normal text-slate-500">
                      (add one or more)
                    </span>
                  </label>

                  {(formData.image_urls.length > 0 || imagePreviews.length > 0) && (
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-3">
                      {/* Existing URLs (already saved) */}
                      {formData.image_urls.map((entry, idx) => {
                        const thumbUrl = getThumbnailUrl(entry, 400);
                        if (!thumbUrl) return null;
                        return (
                          <div
                            key={`url-${idx}`}
                            className="relative aspect-square rounded-xl overflow-hidden border border-slate-200 group bg-slate-100"
                          >
                            <img
                              src={thumbUrl}
                              alt={`Existing ${idx + 1}`}
                              className="w-full h-full object-cover cursor-pointer"
                              onClick={() => setPreviewImage(entry)}
                              onError={(e) => { e.currentTarget.style.visibility = 'hidden'; }}
                            />
                            <button
                              type="button"
                              onClick={() => removeImageUrl(entry)}
                              className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 hover:bg-red-600 transition"
                              title="Remove"
                            >
                              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        );
                      })}

                      {/* New previews (not yet uploaded) */}
                      {imagePreviews.map((preview, idx) => (
                        <div
                          key={`preview-${idx}`}
                          className="relative aspect-square rounded-xl overflow-hidden border border-indigo-300 group"
                        >
                          <img src={preview} alt={`New ${idx + 1}`} className="w-full h-full object-cover" />
                          <span className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-indigo-600 text-white text-[9px] font-bold rounded">
                            NEW
                          </span>
                          <button
                            type="button"
                            onClick={() => removeImagePreview(idx)}
                            className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 hover:bg-red-600 transition"
                            title="Remove"
                          >
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Upload zone */}
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/50 transition">
                    <svg className="w-8 h-8 text-slate-400 mb-2" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                    </svg>
                    <span className="text-xs text-slate-500">Click to upload image(s)</span>
                    <span className="text-[10px] text-slate-400 mt-1">JPG, PNG, GIF, WEBP (max 64MB each) — multiple allowed</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>

                  {/* Paste-URL input */}
                  <div className="mt-2 flex gap-2">
                    <input
                      type="text"
                      id="imageUrlInput"
                      placeholder="Or paste an image URL and press Enter..."
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addImageUrl(e.currentTarget.value);
                          e.currentTarget.value = '';
                        }
                      }}
                      className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const input = document.getElementById('imageUrlInput');
                        if (input?.value) {
                          addImageUrl(input.value);
                          input.value = '';
                        }
                      }}
                      className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition"
                    >
                      Add URL
                    </button>
                  </div>
                </div>

                {/* Toggles */}
                <div className="flex flex-wrap gap-6 p-4 bg-slate-50 rounded-xl">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_published}
                      onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                      className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500/20"
                    />
                    <div>
                      <div className="text-sm font-semibold text-slate-700">Published</div>
                      <div className="text-xs text-slate-500">Visible to the public</div>
                    </div>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_featured}
                      onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                      className="w-5 h-5 rounded border-slate-300 text-amber-600 focus:ring-amber-500/20"
                    />
                    <div>
                      <div className="text-sm font-semibold text-slate-700">Featured</div>
                      <div className="text-xs text-slate-500">Highlight on the homepage</div>
                    </div>
                  </label>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    disabled={saving}
                    className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:text-slate-900 transition disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold text-sm hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                  >
                    {saving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                        {editingItem ? 'Update' : 'Create'}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Image Preview Modal */}
      {previewImage && (
        <div className="fixed inset-0 z-[60] overflow-y-auto">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setPreviewImage(null)}
          />
          <div className="relative min-h-full flex items-center justify-center p-4">
            <div className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
                <h3 className="font-bold text-slate-900">Image Preview</h3>
                <button
                  onClick={() => setPreviewImage(null)}
                  className="w-9 h-9 flex items-center justify-center rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 transition"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="p-4 bg-slate-50">
                <iframe
                  src={getPreviewUrl(previewImage)}
                  className="w-full bg-white rounded-xl"
                  style={{ height: '70vh' }}
                  allow="autoplay"
                  title="Image Preview"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm"
            onClick={() => setDeleteConfirm(null)}
          />
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
                  <h3 className="text-lg font-bold text-slate-900">Delete Item</h3>
                  <p className="text-sm text-slate-500">This action cannot be undone.</p>
                </div>
              </div>
              <p className="text-sm text-slate-600 mb-6">
                Are you sure you want to delete <span className="font-semibold text-slate-900">"{deleteConfirm.title}"</span>?
              </p>
              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:text-slate-900 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirm.id)}
                  className="px-5 py-2.5 bg-red-600 text-white rounded-xl font-semibold text-sm hover:bg-red-700 transition"
                >
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