'use client';

import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimesCircle, faSearch, faSync, faEye, faMoneyBillWave, faReceipt, faFolderOpen } from '@fortawesome/free-solid-svg-icons';

const API_URL = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/+$/, '');

// ---------- Section Title ----------
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

// ---------- Google Drive ID extractor ----------
function extractGoogleDriveId(url) {
  if (!url) return null;
  const patterns = [
    /\/d\/([a-zA-Z0-9_-]+)/,
    /id=([a-zA-Z0-9_-]+)/,
    /open\?id=([a-zA-Z0-9_-]+)/,
    /\/file\/d\/([a-zA-Z0-9_-]+)/,
    /([a-zA-Z0-9_-]{25,})/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) return match[1].split('?')[0].split('&')[0];
  }
  return null;
}

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('verified');
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    fetchUsers();
    fetchPayments();
  }, [statusFilter]);

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API_URL}/api/users`);
      if (res.ok) setAllUsers(await res.json());
    } catch (err) {
      console.error('Error fetching users:', err);
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
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (res.ok) setPayments(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getUserName = (userId) => {
    const u = allUsers.find(x => x.id === userId);
    return u ? u.full_name : 'Unknown User';
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

  const formatCurrency = (a) =>
    new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(a || 0);

  const filtered = payments.filter(p => {
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return (
      (p.user_name || '').toLowerCase().includes(q) ||
      (p.submission_title || '').toLowerCase().includes(q) ||
      (p.reference_number || '').toLowerCase().includes(q)
    );
  });

  const proofId = selected ? extractGoogleDriveId(selected.payment_proof_view_url) : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Payments</h1>
          <p className="text-sm text-slate-500 mt-1">
            {statusFilter === 'verified'
              ? 'All accepted payment proofs — read only'
              : 'View and manage payment records'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none appearance-none cursor-pointer text-sm font-medium"
            >
              <option value="all">All Status</option>
              <option value="verified">Verified</option>
              <option value="pending">Pending</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <button
            onClick={fetchPayments}
            className="px-4 py-2.5 bg-emerald-600 text-white rounded-xl font-semibold text-sm hover:bg-emerald-700 transition flex items-center gap-2"
          >
            <FontAwesomeIcon icon={faSync} className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <FontAwesomeIcon
          icon={faSearch}
          className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2"
        />
        <input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by user, submission, or reference..."
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-slate-500">Loading…</div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <FontAwesomeIcon icon={faMoneyBillWave} className="w-10 h-10 text-slate-300 mb-3" />
            <p>No payments found</p>
          </div>
        ) : (
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
                {filtered.map((p) => (
                  <tr key={p.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition">
                    <td className="px-6 py-4">
                      <p className="text-sm font-semibold text-slate-900">{p.user_name}</p>
                      <p className="text-xs text-slate-500">{p.submission_title || 'N/A'}</p>
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-slate-900">
                      {formatCurrency(p.payment_amount)}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{p.reference_number || 'N/A'}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {new Date(p.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(p.payment_status)}`}>
                        {getStatusIcon(p.payment_status)}{' '}
                        {p.payment_status === 'verified' ? 'ACCEPTED' : p.payment_status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => setSelected(p)}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium inline-flex items-center gap-1"
                      >
                        <FontAwesomeIcon icon={faEye} className="w-3.5 h-3.5" />
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ============ PAYMENT DETAILS MODAL (treasurer-style, read-only) ============ */}
      {selected && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setSelected(null)}
          />

          <div className="relative min-h-full flex items-center justify-center p-4">
            <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[95vh] flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-linear-to-r from-emerald-50 to-blue-50 sticky top-0 z-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <FontAwesomeIcon icon={faMoneyBillWave} className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Payment Details</h3>
                    <p className="text-sm text-slate-500">
                      {selected.payment_status === 'verified'
                        ? 'Verified payment record'
                        : 'Review payment information'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelected(null)}
                  className="w-10 h-10 flex items-center justify-center rounded-lg bg-white text-slate-600 hover:bg-slate-100 transition shadow-sm"
                >
                  <FontAwesomeIcon icon={faTimesCircle} className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="grid grid-cols-1 lg:grid-cols-2 flex-1 overflow-hidden min-h-0">
                {/* Left: Payment Info */}
                <div className="p-6 overflow-y-auto border-r border-slate-200">
                  <SectionTitle icon={faReceipt} color="emerald" label="Payment Information" />

                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-slate-600 font-medium">Submission Title</p>
                      <p className="text-lg font-semibold text-slate-700">
                        {selected.submission_title || 'N/A'}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-slate-600 font-medium">User</p>
                      <p className="text-lg font-semibold text-slate-700">{selected.user_name}</p>
                      <p className="text-sm text-slate-500">{selected.user_email}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-slate-600 font-medium">Amount</p>
                        <p className="text-lg font-semibold text-slate-700">
                          {formatCurrency(selected.payment_amount)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-600 font-medium">Reference Number</p>
                        <p className="text-lg font-semibold text-slate-700">
                          {selected.reference_number || 'N/A'}
                        </p>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm text-slate-600 font-medium">Payment Date</p>
                      <p className="text-lg font-semibold text-slate-700">
                        {selected.payment_date
                          ? new Date(selected.payment_date).toLocaleDateString()
                          : 'N/A'}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-slate-600 font-medium">Submitted On</p>
                      <p className="text-lg font-semibold text-slate-700">
                        {new Date(selected.created_at).toLocaleString()}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-slate-600 font-medium">Status</p>
                      <span className={`inline-flex px-3 py-1.5 rounded-full text-sm font-medium ${getStatusColor(selected.payment_status)}`}>
                        {getStatusIcon(selected.payment_status)}{' '}
                        {selected.payment_status === 'verified'
                          ? 'ACCEPTED'
                          : selected.payment_status.toUpperCase()}
                      </span>
                    </div>

                    {selected.rejection_reason && (
                      <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                        <p className="text-sm font-semibold text-red-700">Rejection Reason</p>
                        <p className="text-sm text-slate-700">{selected.rejection_reason}</p>
                      </div>
                    )}

                    {selected.verified_by && (
                      <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                        <p className="text-sm font-semibold text-emerald-700">Verified By</p>
                        <p className="text-sm text-slate-700">
                          {getUserName(selected.verified_by)}
                        </p>
                        <p className="text-xs text-slate-500">
                          {selected.verified_at
                            ? new Date(selected.verified_at).toLocaleString()
                            : ''}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: Payment Proof Preview (embedded, no new tab) */}
                <div className="bg-slate-50 p-6 overflow-y-auto">
                  <SectionTitle icon={faFolderOpen} color="blue" label="Payment Proof" />

                  {proofId ? (
                    <div
                      className="border border-slate-200 rounded-xl bg-white overflow-hidden shadow-sm"
                      style={{ height: '550px' }}
                    >
                      <iframe
                        src={`https://drive.google.com/file/d/${proofId}/preview?embedded=true`}
                        className="w-full h-full"
                        allow="autoplay"
                        title="Payment Proof Preview"
                      />
                    </div>
                  ) : selected.payment_proof_view_url ? (
                    <div
                      className="border border-slate-200 rounded-xl bg-white overflow-hidden shadow-sm"
                      style={{ height: '550px' }}
                    >
                      <iframe
                        src={selected.payment_proof_view_url}
                        className="w-full h-full"
                        title="Payment Proof Preview"
                      />
                    </div>
                  ) : (
                    <div className="text-center py-16 text-slate-500 bg-white rounded-xl border border-dashed border-slate-300 text-sm italic">
                      No Payment Proof Available
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}