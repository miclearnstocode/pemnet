"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';

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
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    verified: 0,
    rejected: 0
  });
  const [allUsers, setAllUsers] = useState([]);

  useEffect(() => {
    const storedUser = localStorage.getItem('pemnet_user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setCurrentUser(user);
        // Check if user has treasurer role (admin or master_approver)
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
      const res = await fetch('http://localhost:5000/api/users');
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
        ? 'http://localhost:5000/api/payments/all'
        : `http://localhost:5000/api/payments/all?status=${statusFilter}`;
      
      const res = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (res.ok) {
        const data = await res.json();
        setPayments(data);
        
        // Calculate stats
        const total = data.length;
        const pending = data.filter(p => p.payment_status === 'pending').length;
        const verified = data.filter(p => p.payment_status === 'verified').length;
        const rejected = data.filter(p => p.payment_status === 'rejected').length;
        setStats({ total, pending, verified, rejected });
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
      const res = await fetch(`http://localhost:5000/api/payments/${paymentId}/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          verifier_id: currentUser.id,
          action: 'verify'
        })
      });

      if (res.ok) {
        const data = await res.json();
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
      const res = await fetch(`http://localhost:5000/api/payments/${paymentId}/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          verifier_id: currentUser.id,
          action: 'reject',
          rejection_reason: rejectionReason
        })
      });

      if (res.ok) {
        const data = await res.json();
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 animate-slide-in">
          <div className={`relative w-96 p-4 rounded-xl border shadow-lg ${
            toast.type === 'success' ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-start gap-3">
              <div className={`shrink-0 mt-0.5 ${toast.type === 'success' ? 'text-emerald-700' : 'text-red-700'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className={`flex-1 ${toast.type === 'success' ? 'text-emerald-700' : 'text-red-700'}`}>
                <p className="font-semibold text-sm">{toast.type === 'success' ? 'Success!' : 'Error!'}</p>
                <p className="text-sm">{toast.message}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Details Modal */}
      {showModal && selectedPayment && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)}></div>
          <div className="relative min-h-full flex items-center justify-center p-4">
            <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[95vh]">
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-emerald-50 to-blue-50 sticky top-0 z-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-emerald-600">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Payment Details</h3>
                    <p className="text-sm text-slate-500">Review payment proof and verify</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowModal(false)} 
                  className="w-10 h-10 flex items-center justify-center rounded-lg bg-white text-slate-600 hover:bg-slate-100 transition shadow-sm"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Modal Body */}
              <div className="grid grid-cols-1 lg:grid-cols-2 h-[calc(95vh-80px)]">
                {/* Left Column - Payment Information */}
                <div className="p-6 overflow-y-auto border-r border-slate-200">
                  <h4 className="text-base font-bold text-slate-700 uppercase mb-4">Payment Information</h4>
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
                        <p className="text-lg font-semibold text-slate-900">PhP {selectedPayment.payment_amount}</p>
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
                      <p className="text-lg font-semibold text-slate-900">
                        {new Date(selectedPayment.created_at).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600 font-medium">Status</p>
                      <span className={`inline-flex px-3 py-1.5 rounded-full text-sm font-medium ${getStatusColor(selectedPayment.payment_status)}`}>
                        {getStatusIcon(selectedPayment.payment_status)} {selectedPayment.payment_status.toUpperCase()}
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

                  {/* Action Buttons - Only show for pending payments */}
                  {selectedPayment.payment_status === 'pending' && (
                    <div className="mt-6 pt-6 border-t-2 border-emerald-200 space-y-3">
                      <h4 className="text-base font-bold text-emerald-700 uppercase mb-3">Actions</h4>
                      <button
                        onClick={() => handleVerify(selectedPayment.id)}
                        disabled={actionLoading}
                        className="w-full bg-emerald-600 text-white py-3 rounded-xl font-semibold hover:bg-emerald-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {actionLoading ? 'Processing...' : 'Verify Payment'}
                      </button>
                      <button
                        onClick={() => setShowRejectModal(true)}
                        disabled={actionLoading}
                        className="w-full bg-red-500 text-white py-3 rounded-xl font-semibold hover:bg-red-600 transition disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Reject Payment
                      </button>
                    </div>
                  )}
                </div>

                {/* Right Column - Payment Proof Viewer */}
                <div className="bg-slate-50 p-6 overflow-y-auto">
                  <h4 className="text-base font-bold text-slate-700 uppercase mb-4">Payment Proof</h4>
                  {selectedPayment.payment_proof_view_url ? (
                    <div className="border rounded-lg bg-white overflow-hidden" style={{ height: '550px' }}>
                      <iframe 
                        src={`https://drive.google.com/file/d/${extractGoogleDriveId(selectedPayment.payment_proof_view_url)}/preview?embedded=true`} 
                        className="w-full h-full" 
                        allow="autoplay" 
                      />
                    </div>
                  ) : (
                    <div className="text-center py-16 text-slate-500 bg-white rounded-lg border text-lg">
                      No Payment Proof Available
                    </div>
                  )}
                  <div className="mt-4">
                    <a 
                      href={selectedPayment.payment_proof_view_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium inline-flex items-center gap-2"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                      </svg>
                      Open in new tab
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reject Confirmation Modal */}
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
                  <button
                    onClick={() => setShowRejectModal(false)}
                    className="flex-1 px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleReject(selectedPayment.id)}
                    disabled={actionLoading}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition disabled:opacity-50"
                  >
                    {actionLoading ? 'Processing...' : 'Confirm Reject'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-8 py-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Treasurer Dashboard</h1>
            <p className="text-slate-500 text-sm mt-1">Manage and verify registration payments</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2.5 px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-full">
              <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold uppercase text-sm shadow-sm">
                {currentUser?.full_name?.charAt(0) || 'T'}
              </div>
              <div className="leading-tight">
                <p className="text-sm font-semibold text-slate-800">{currentUser?.full_name || 'Treasurer'}</p>
                <p className="text-[10px] text-slate-500 uppercase tracking-wider font-medium">Treasurer</p>
              </div>
            </div>
            <Link href="/review" className="text-emerald-600 hover:text-emerald-700 font-semibold text-sm transition">
              ← Back to Review
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
            <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
            <p className="text-sm text-slate-500">Total Payments</p>
          </div>
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
            <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
            <p className="text-sm text-slate-500">Pending Verification</p>
          </div>
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
            <p className="text-2xl font-bold text-emerald-600">{stats.verified}</p>
            <p className="text-sm text-slate-500">Verified</p>
          </div>
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
            <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
            <p className="text-sm text-slate-500">Rejected</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-4 mb-6 flex-wrap">
          <div className="flex-1 min-w-[200px] relative">
            <input
              type="text"
              placeholder="Search by title, user, or reference number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2.5 pl-10 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none"
            />
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="verified">Verified</option>
            <option value="rejected">Rejected</option>
          </select>
          <button
            onClick={fetchPayments}
            className="px-4 py-2.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
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
                  <tr
                    key={payment.id}
                    className="border-b border-slate-100 hover:bg-slate-50/50 transition"
                  >
                    <td className="px-6 py-4">
                      <p className="text-sm font-semibold text-slate-900">{payment.user_name}</p>
                      <p className="text-xs text-slate-500">{payment.submission_title || 'N/A'}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-semibold text-slate-900">PhP {payment.payment_amount}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-slate-600">{payment.reference_number || 'N/A'}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {new Date(payment.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(payment.payment_status)}`}>
                        {getStatusIcon(payment.payment_status)} {payment.payment_status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => openPaymentDetails(payment)}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium inline-flex items-center gap-1"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Review
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredPayments.length === 0 && (
              <div className="text-center py-12 text-slate-500">
                <p>No payments found</p>
              </div>
            )}
          </div>
        </div>
      </div>

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
      `}</style>
    </div>
  );
}

// Helper function to extract Google Drive ID
function extractGoogleDriveId(url) {
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
}