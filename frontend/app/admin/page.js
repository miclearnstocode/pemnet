'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faNewspaper,
  faInfoCircle,
  faCreditCard,
  faArrowRight,
  faFolderOpen,
  faCheckCircle,
  faClock,
  faEye,
} from '@fortawesome/free-solid-svg-icons';

const API_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, '') || 'http://localhost:5000';

export default function AdminDashboard() {
  const [newsStats, setNewsStats] = useState(null);
  const [paymentStats, setPaymentStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    try {
      const userStr = localStorage.getItem('pemnet_user');
      if (userStr) setUser(JSON.parse(userStr));
    } catch {}

    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('pemnet_token');

        // Fetch news stats
        const newsRes = await fetch(`${API_URL}/api/admin/news-events/stats`);
        if (newsRes.ok) setNewsStats(await newsRes.json());

        // Fetch payment stats (verified / pending / rejected counts)
        const payRes = await fetch(`${API_URL}/api/payments/all`, {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {},
        });
        if (payRes.ok) {
          const payments = await payRes.json();
          const list = Array.isArray(payments) ? payments : [];
          setPaymentStats({
            total: list.length,
            verified: list.filter(p => p.payment_status === 'verified').length,
            pending: list.filter(p => p.payment_status === 'pending').length,
            rejected: list.filter(p => p.payment_status === 'rejected').length,
          });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-linear-to-r from-indigo-500 via-blue-500 to-blue-500 rounded-2xl p-6 sm:p-8 text-white shadow-xl shadow-blue-500/20">
        <h2 className="text-xl sm:text-2xl font-bold mb-1">
          Welcome back, {user?.full_name?.split(' ')[0] || 'Admin'}! 👋
        </h2>
        <p className="text-white/80 text-sm">
          Manage your site content, publications, and payments from one place.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
              <FontAwesomeIcon icon={faFolderOpen} className="w-5 h-5 text-slate-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-900">{newsStats?.total ?? '—'}</p>
          <p className="text-sm text-slate-500 mt-1">Total News & Events</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
              <FontAwesomeIcon icon={faCheckCircle} className="w-5 h-5 text-emerald-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-emerald-600">{newsStats?.published ?? '—'}</p>
          <p className="text-sm text-slate-500 mt-1">Published</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
              <FontAwesomeIcon icon={faClock} className="w-5 h-5 text-amber-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-amber-600">{newsStats?.drafts ?? '—'}</p>
          <p className="text-sm text-slate-500 mt-1">Drafts</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <FontAwesomeIcon icon={faEye} className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-blue-600">
            {(newsStats?.total_views ?? 0).toLocaleString()}
          </p>
          <p className="text-sm text-slate-500 mt-1">Total Views</p>
        </div>
      </div>

      {/* Quick Access Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* News & Events */}
        <Link
          href="/admin/news"
          className="group bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
              <FontAwesomeIcon icon={faNewspaper} className="w-5 h-5 text-blue-600" />
            </div>
            <FontAwesomeIcon
              icon={faArrowRight}
              className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition"
            />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-1">News & Events</h3>
          <p className="text-sm text-slate-500 mb-4">
            Create, edit, and publish articles and events.
          </p>
          {!loading && newsStats && (
            <div className="flex items-center gap-4 pt-4 border-t border-slate-100 text-xs">
              <div>
                <div className="font-bold text-slate-900">{newsStats.total}</div>
                <div className="text-slate-500">Total</div>
              </div>
              <div>
                <div className="font-bold text-emerald-600">{newsStats.published}</div>
                <div className="text-slate-500">Live</div>
              </div>
              <div>
                <div className="font-bold text-amber-600">{newsStats.drafts}</div>
                <div className="text-slate-500">Drafts</div>
              </div>
            </div>
          )}
        </Link>

        {/* About Page */}
        <Link
          href="/admin/about"
          className="group bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center">
              <FontAwesomeIcon icon={faInfoCircle} className="w-5 h-5 text-emerald-600" />
            </div>
            <FontAwesomeIcon
              icon={faArrowRight}
              className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition"
            />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-1">About Page</h3>
          <p className="text-sm text-slate-500">
            Edit the mission, vision, stats, and features.
          </p>
        </Link>

        {/* Verified Payments */}
        <Link
          href="/admin/payments"
          className="group bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center">
              <FontAwesomeIcon icon={faCreditCard} className="w-5 h-5 text-purple-600" />
            </div>
            <FontAwesomeIcon
              icon={faArrowRight}
              className="w-4 h-4 text-slate-400 group-hover:text-purple-600 group-hover:translate-x-1 transition"
            />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-1">Verified Payments</h3>
          <p className="text-sm text-slate-500 mb-4">
            View all accepted and verified payment proofs.
          </p>
          {!loading && paymentStats && (
            <div className="flex items-center gap-4 pt-4 border-t border-slate-100 text-xs">
              <div>
                <div className="font-bold text-emerald-600">{paymentStats.verified}</div>
                <div className="text-slate-500">Verified</div>
              </div>
              <div>
                <div className="font-bold text-amber-600">{paymentStats.pending}</div>
                <div className="text-slate-500">Pending</div>
              </div>
              <div>
                <div className="font-bold text-rose-600">{paymentStats.rejected}</div>
                <div className="text-slate-500">Rejected</div>
              </div>
            </div>
          )}
        </Link>
      </div>
    </div>
  );
}