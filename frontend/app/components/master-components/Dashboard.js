"use client";

import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {faCheckCircle,faClock,faFileAlt,faEnvelope,faFolderOpen,faInfoCircle,faGavel,faEdit,faHistory,faThumbsDown,faChartLine,faChartPie,faChartBar,faLock,
} from '@fortawesome/free-solid-svg-icons';
import UnderDevelopment from './UnderDevelopment';

const API_URL = (process.env.NEXT_PUBLIC_API_URL).replace(/\/+$/, '');

// ---------- Reusable helpers ----------
function getStatusColor(status) {
  const safeStatus = status || 'pending';
  switch (safeStatus) {
    case 'endorse': return 'bg-emerald-100 text-emerald-700';
    case 'downgraded-non_competitive': return 'bg-yellow-100 text-yellow-700';
    case 'downgraded-poster_only': return 'bg-orange-100 text-orange-700';
    case 'downgraded': return 'bg-yellow-100 text-yellow-700';
    case 'pending': return 'bg-slate-100 text-slate-700';
    case 'return_to_sender': return 'bg-red-100 text-red-700';
    default: return 'bg-slate-100 text-slate-700';
  }
}

function getStatusDisplay(status) {
  switch (status) {
    case 'endorse': return 'Endorsed';
    case 'downgraded-non_competitive': return 'Non-Competitive (Poster)';
    case 'downgraded-poster_only': return 'Poster Only';
    case 'downgraded': return 'Downgraded';
    case 'pending': return 'Pending';
    case 'uncategorized': return 'Uncategorized';
    case 'processed': return 'Processed';
    case 'rejected': return 'Rejected';
    case 'return_to_sender': return 'Return to Sender';
    default: return status || 'Pending';
  }
}

const MOCK_LINE_DATA = [
  { month: 'Jan', count: 3 },
  { month: 'Feb', count: 7 },
  { month: 'Mar', count: 5 },
  { month: 'Apr', count: 12 },
  { month: 'May', count: 9 },
  { month: 'Jun', count: 15 },
  { month: 'Jul', count: 11 },
  { month: 'Aug', count: 18 },
  { month: 'Sep', count: 22 },
];

const MOCK_SUCS_DATA = [
  { label: 'SUCS 1', value: 12, color: '#6366f1' },
  { label: 'SUCS 2', value: 18, color: '#10b981' },
  { label: 'SUCS 3', value: 7,  color: '#f59e0b' },
  { label: 'SUCS 4', value: 22, color: '#ef4444' },
  { label: 'SUCS 5', value: 14, color: '#8b5cf6' },
  { label: 'SUCS 6', value: 9,  color: '#ec4899' },
  { label: 'SUCS 7', value: 16, color: '#14b8a6' },
];


/** Line chart */
function LineChartPreview({ data, color = '#6366f1' }) {
  const width = 480;
  const height = 180;
  const padding = 20;

  const maxValue = Math.max(...data.map(d => d.count), 1);
  const stepX = (width - padding * 2) / (data.length - 1);

  const points = data.map((d, i) => {
    const x = padding + i * stepX;
    const y = height - padding - (d.count / maxValue) * (height - padding * 2);
    return { x, y, ...d };
  });

  const polyline = points.map(p => `${p.x},${p.y}`).join(' ');

  const areaPath = `
    M ${points[0].x},${height - padding}
    L ${polyline.replace(/ /g, ' L ')}
    L ${points[points.length - 1].x},${height - padding}
    Z
  `;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full" preserveAspectRatio="none">
      {[0.25, 0.5, 0.75].map((t) => (
        <line
          key={t}
          x1={padding}
          x2={width - padding}
          y1={padding + t * (height - padding * 2)}
          y2={padding + t * (height - padding * 2)}
          stroke="#e2e8f0"
          strokeWidth="1"
          strokeDasharray="4 4"
        />
      ))}
      <path d={areaPath} fill={color} fillOpacity="0.12" />
      <polyline points={polyline} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="3.5" fill="white" stroke={color} strokeWidth="2" />
      ))}
    </svg>
  );
}

/** Donut / pie chart */
function PieChartPreview({ data, size = 160, thickness = 28 }) {
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;
  const total = data.reduce((sum, d) => sum + d.value, 0) || 1;

  let offset = 0;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="transform -rotate-90">
      <circle cx={size / 2} cy={size / 2} r={radius} fill="transparent" stroke="#f1f5f9" strokeWidth={thickness} />
      {data.map((slice, idx) => {
        const length = (slice.value / total) * circumference;
        const dashArray = `${length} ${circumference - length}`;
        const dashOffset = -offset;
        offset += length;
        return (
          <circle
            key={idx}
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke={slice.color}
            strokeWidth={thickness}
            strokeDasharray={dashArray}
            strokeDashoffset={dashOffset}
            strokeLinecap="butt"
          />
        );
      })}
    </svg>
  );
}

/** Bar chart */
function BarChartPreview({ data, color = '#6366f1' }) {
  const width = 480;
  const height = 180;
  const padding = 20;
  const barPadding = 8;
  const maxValue = Math.max(...data.map(d => d.value), 1);
  const barWidth = (width - padding * 2 - (data.length - 1) * barPadding) / data.length;
  const chartHeight = height - padding * 2;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full" preserveAspectRatio="none">
      {[0.25, 0.5, 0.75].map((t) => (
        <line
          key={t}
          x1={padding}
          x2={width - padding}
          y1={padding + t * chartHeight}
          y2={padding + t * chartHeight}
          stroke="#e2e8f0"
          strokeWidth="1"
          strokeDasharray="4 4"
        />
      ))}
      {data.map((d, i) => {
        const barHeight = (d.value / maxValue) * chartHeight;
        const x = padding + i * (barWidth + barPadding);
        const y = height - padding - barHeight;
        return <rect key={i} x={x} y={y} width={barWidth} height={barHeight} fill={d.color || color} rx="4" />;
      })}
    </svg>
  );
}

function ChartCard({
  icon, title, subtitle, children,
  featureName, description,
  span = 1,
  underDevelopment = true,   // <-- new
}) {
  const colSpan = span === 2 ? 'lg:col-span-2' : '';

  return (
    <div className={`${colSpan} relative`}>
      {underDevelopment && (
        <UnderDevelopment
          icon={icon}
          featureName={featureName}
          description={description}
          variant="ghost"
          size="md"
          className="block! w-full! h-auto! rounded-2xl! p-0! bg-transparent! hover:bg-transparent!"
        />
      )}

      <div className="relative bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FontAwesomeIcon icon={icon} className="w-4 h-4 text-indigo-500" />
            <h3 className="font-bold text-slate-800">{title}</h3>
          </div>

          {underDevelopment ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide bg-amber-100 text-amber-700 border border-amber-200">
              <FontAwesomeIcon icon={faLock} className="w-2.5 h-2.5" />
              Preview
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide bg-emerald-100 text-emerald-700 border border-emerald-200">
              Live
            </span>
          )}
        </div>

        {subtitle && <p className="px-6 pt-3 text-xs text-slate-500">{subtitle}</p>}

        <div className="relative p-6">
          <div className={
            underDevelopment
              ? 'blur-[1.5px] opacity-80 select-none pointer-events-none'
              : ''
          }>
            {children}
          </div>

          {underDevelopment && (
            <div className="absolute inset-0 flex items-center justify-center">
              <UnderDevelopment
                icon={icon}
                featureName={featureName}
                description={description}
                variant="solid"
                size="lg"
                iconSize="w-5 h-5"
                label={`Open ${featureName}`}
                className="bg-slate-900! hover:bg-slate-800! shadow-lg! px-4! py-2.5! w-auto! h-auto! rounded-xl!"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Dashboard Component
// ============================================================
export default function Dashboard({
  currentUser,
  allSubmissions = [],
  totalSubmissions = 0,
  pendingCount = 0,
  endorsedCount = 0,
  nonCompetitiveCount = 0,
  onNavigate,
  onStatCardClick,
  onSelectSubmission,
}) {
  // ----- real chart data from backend -----
  const [chartData, setChartData] = useState({ category: [], thematic: [] });
  const [loadingCharts, setLoadingCharts] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function fetchChartData() {
      try {
        const res = await fetch(`${API_URL}/api/master-approver/chart-data`, {
          credentials: 'include',
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (!cancelled) {
          setChartData({
            category: data.category || [],
            thematic: data.thematic || [],
          });
        }
      } catch (err) {
        console.error('Failed to fetch chart data:', err);
      } finally {
        if (!cancelled) setLoadingCharts(false);
      }
    }

    fetchChartData();
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="space-y-6">
      {/* ===== Welcome Banner ===== */}
      <div className="bg-linear-to-r from-blue-500 via-blue-500 to-blue-500 rounded-2xl p-6 sm:p-8 text-white shadow-xl shadow-blue-500/20">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold mb-1">
              Welcome back, {currentUser?.full_name?.split(' ')[0] || 'Master Approver'}! 👋
            </h2>
            <p className="text-white/80 text-sm">
              You have <span className="font-bold text-white">{pendingCount}</span> pending submission
              {pendingCount !== 1 ? 's' : ''} awaiting your decision.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => onNavigate?.('system')}
              className="px-4 py-2.5 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl font-semibold text-sm transition flex items-center gap-2"
            >
              <FontAwesomeIcon icon={faFileAlt} className="w-4 h-4" />
              System
            </button>
            <button
              onClick={() => onNavigate?.('email')}
              className="px-4 py-2.5 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl font-semibold text-sm transition flex items-center gap-2"
            >
              <FontAwesomeIcon icon={faEnvelope} className="w-4 h-4" />
              Email
            </button>
          </div>
        </div>
      </div>

      {/* ===== Stats Grid ===== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <button
          type="button"
          onClick={() => onNavigate?.('system')}
          className="text-left bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
              <FontAwesomeIcon icon={faFolderOpen} className="w-5 h-5 text-slate-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-900">{totalSubmissions}</p>
          <p className="text-sm text-slate-500 mt-1">Total Submissions</p>
        </button>

        <button
          type="button"
          onClick={() => { onNavigate?.('system'); onStatCardClick?.('pending'); }}
          className="text-left bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
              <FontAwesomeIcon icon={faClock} className="w-5 h-5 text-amber-600" />
            </div>
            {pendingCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[10px] font-bold">
                Action needed
              </span>
            )}
          </div>
          <p className="text-3xl font-bold text-amber-600">{pendingCount}</p>
          <p className="text-sm text-slate-500 mt-1">Pending Review</p>
        </button>

        <button
          type="button"
          onClick={() => { onNavigate?.('system'); onStatCardClick?.('endorsed'); }}
          className="text-left bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
              <FontAwesomeIcon icon={faCheckCircle} className="w-5 h-5 text-emerald-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-emerald-600">{endorsedCount}</p>
          <p className="text-sm text-slate-500 mt-1">Endorsed</p>
        </button>

        <button
          type="button"
          onClick={() => { onNavigate?.('system'); onStatCardClick?.('non_competitive'); }}
          className="text-left bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-yellow-50 flex items-center justify-center">
              <FontAwesomeIcon icon={faThumbsDown} className="w-5 h-5 text-yellow-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-yellow-600">{nonCompetitiveCount}</p>
          <p className="text-sm text-slate-500 mt-1">Non-Competitive</p>
        </button>
      </div>

      {/* ===== Analytics Section ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Line Chart — side by side with Bar Chart */}
        <ChartCard
          icon={faChartLine}
          title="Submissions Over Time"
          subtitle="Monthly volume of abstract submissions (mock preview)"
          featureName="Submission Trend Analytics"
          description="Interactive time-series charts with filters by source, category, and date range are on the way."
        >
          <div className="h-48">
            <LineChartPreview data={MOCK_LINE_DATA} color="#6366f1" />
          </div>
          <div className="flex justify-between mt-2 text-[10px] text-slate-400 font-medium">
            {MOCK_LINE_DATA.map((d) => (
              <span key={d.month}>{d.month}</span>
            ))}
          </div>
        </ChartCard>

        {/* Bar Chart — side by side with Line Chart */}
        <ChartCard
          icon={faChartBar}
          title="Submissions per SUCS"
          subtitle="Number of submissions per State University/College (mock preview)"
          featureName="SUCS Distribution Analytics"
          description="Detailed bar charts with sorting, filtering, and drill-down per SUCS will be available here."
        >
          <div className="h-48">
            <BarChartPreview data={MOCK_SUCS_DATA} />
          </div>
          <div className="flex justify-between mt-2 text-[10px] text-slate-400 font-medium">
            {MOCK_SUCS_DATA.map((d) => (
              <span key={d.label} className="truncate max-w-15" title={d.label}>
                {d.label}
              </span>
            ))}
          </div>
        </ChartCard>

        {/* Pie Chart — Submissions by Category (real data) */}
        <ChartCard
          icon={faChartPie}
          title="Submissions by Category"
          subtitle="Distribution across paper categories (live preview)"
          featureName="Category Breakdown"
          underDevelopment={false}
          description="Live category distribution with drill-down and export options will be available here."
        >
          {loadingCharts ? (
            <div className="h-40 flex items-center justify-center text-slate-400 text-sm">Loading…</div>
          ) : chartData.category.length === 0 ? (
            <div className="h-40 flex items-center justify-center text-slate-400 text-sm">No data yet</div>
          ) : (
            <div className="flex items-center justify-center gap-6">
              <PieChartPreview data={chartData.category} size={160} thickness={28} />
              <div className="space-y-2">
                {chartData.category.map((slice) => (
                  <div key={slice.label} className="flex items-center gap-2 text-xs">
                    <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: slice.color }} />
                    <span className="text-slate-600 font-medium">{slice.label}</span>
                    <span className="text-slate-400 ml-auto pl-2 font-bold">{slice.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </ChartCard>

        {/* Pie Chart — Submissions by Thematic Area (real data) */}
        <ChartCard
          icon={faChartPie}
          title="Submissions by Thematic Area"
          subtitle="Distribution across thematic areas (live preview)"
          featureName="Thematic Area Breakdown"
          underDevelopment={false}
          description="Filterable thematic-area distribution with cross-tab analysis is coming soon."
        >
          {loadingCharts ? (
            <div className="h-40 flex items-center justify-center text-slate-400 text-sm">Loading…</div>
          ) : chartData.thematic.length === 0 ? (
            <div className="h-40 flex items-center justify-center text-slate-400 text-sm">No data yet</div>
          ) : (
            <div className="flex items-center justify-center gap-6">
              <PieChartPreview data={chartData.thematic} size={160} thickness={28} />
              <div className="space-y-2 flex-1">
                {chartData.thematic.map((slice) => (
                  <div key={slice.label} className="flex items-center gap-2 text-xs">
                    <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: slice.color }} />
                    <span className="text-slate-600 font-medium truncate">{slice.label}</span>
                    <span className="text-slate-400 ml-auto pl-2 font-bold">{slice.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </ChartCard>
      </div>

      {/* ===== Quick Actions ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Submissions */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <FontAwesomeIcon icon={faClock} className="w-4 h-4 text-indigo-500" />
              Recent Submissions
            </h3>
            <button
              onClick={() => onNavigate?.('system')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition"
            >
              View all →
            </button>
          </div>
          <div className="divide-y divide-slate-100">
            {allSubmissions.slice(0, 5).map((sub, idx) => (
              <div
                key={sub.submission_id || sub.id || idx}
                onClick={() => onSelectSubmission?.(sub)}
                className="px-6 py-3 hover:bg-slate-50 cursor-pointer transition flex items-center justify-between gap-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-800 truncate">
                    {sub.extension_project_title || sub.subject || 'Untitled'}
                  </p>
                  <p className="text-xs text-slate-500 truncate">
                    {sub.project_leader || sub.sender_name || 'Unknown'}
                  </p>
                </div>
                <span className={`shrink-0 px-2.5 py-1 rounded-full text-[10px] font-semibold ${getStatusColor(sub.status)}`}>
                  {getStatusDisplay(sub.status || 'pending')}
                </span>
              </div>
            ))}
            {allSubmissions.length === 0 && (
              <div className="px-6 py-8 text-center text-slate-400 text-sm">
                <FontAwesomeIcon icon={faFolderOpen} className="w-8 h-8 mb-2 text-slate-300" />
                <p>No submissions yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Tips */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <FontAwesomeIcon icon={faInfoCircle} className="w-4 h-4 text-blue-500" />
              Quick Tips
            </h3>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-start gap-3 p-3 bg-indigo-50 rounded-xl border border-indigo-100">
              <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center shrink-0">
                <FontAwesomeIcon icon={faGavel} className="w-3.5 h-3.5 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-indigo-900">Make final decisions</p>
                <p className="text-xs text-indigo-700 mt-0.5">
                  Click any submission to review details and endorse or downgrade.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-emerald-50 rounded-xl border border-emerald-100">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
                <FontAwesomeIcon icon={faEdit} className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-emerald-900">Edit before deciding</p>
                <p className="text-xs text-emerald-700 mt-0.5">
                  Correct extracted data issues before making your final call.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-xl border border-blue-100">
              <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                <FontAwesomeIcon icon={faHistory} className="w-3.5 h-3.5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-blue-900">Track all changes</p>
                <p className="text-xs text-blue-700 mt-0.5">
                  View edit history to see who changed what and when.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}