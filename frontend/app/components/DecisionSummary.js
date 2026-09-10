"use client";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faGavel,
  faThumbsUp,
  faThumbsDown,
  faClock,
  faCheckCircle,
  faTimesCircle,
  faArrowDown,
  faSync,
  faUserCircle,
  faInfoCircle,
  faChartBar,
  faExclamationTriangle
} from '@fortawesome/free-solid-svg-icons';

export default function DecisionSummary({
  submissionStatus = 'pending',
  evaluationStatus = 'pending',
  votes = [],
  voteStats = null,
  evaluators = [],
  showEvaluators = true,
  compact = false,
}) {
  // === Normalizers ===
  const normalizeStatus = (s) => {
    if (!s) return 'pending';
    const val = String(s).toLowerCase();
    if (val === 'endorse' || val === 'endorsed') return 'endorse';
    if (val.startsWith('downgraded-non_competitive') || val === 'non_competitive' || val === 'downgraded_non_competitive') return 'downgraded-non_competitive';
    if (val.startsWith('downgraded-poster_only') || val === 'poster_only' || val === 'downgraded_poster_only') return 'downgraded-poster_only';
    if (val === 'downgraded') return 'downgraded-non_competitive';
    return 'pending';
  };

  const normalizedFinal = normalizeStatus(submissionStatus);
  const normalizedEvaluation = normalizeStatus(evaluationStatus);

  // === Labels ===
  const finalLabel = {
    'endorse': 'Endorsed for Presentation',
    'downgraded-non_competitive': 'Downgraded — Non-Competitive (Poster)',
    'downgraded-poster_only': 'Downgraded — Poster Only',
    'pending': 'Pending Final Decision'
  }[normalizedFinal];

  const evaluationLabel = {
    'endorse': 'Endorsed by Evaluators',
    'downgraded-non_competitive': 'Downgraded to Non-Competitive',
    'downgraded-poster_only': 'Downgraded to Poster Only',
    'pending': 'Awaiting Final Decision'
  }[normalizedEvaluation];

  // === Icon / color per decision ===
  const decisionStyle = (status) => {
    switch (status) {
      case 'endorse':
        return {
          bg: 'bg-emerald-50',
          border: 'border-emerald-200',
          text: 'text-emerald-800',
          badge: 'bg-emerald-600 text-white',
          icon: faThumbsUp,
          accent: 'text-emerald-600',
        };
      case 'downgraded-non_competitive':
        return {
          bg: 'bg-amber-50',
          border: 'border-amber-200',
          text: 'text-amber-800',
          badge: 'bg-amber-500 text-white',
          icon: faArrowDown,
          accent: 'text-amber-600',
        };
      case 'downgraded-poster_only':
        return {
          bg: 'bg-orange-50',
          border: 'border-orange-200',
          text: 'text-orange-800',
          badge: 'bg-orange-500 text-white',
          icon: faThumbsDown,
          accent: 'text-orange-600',
        };
      default:
        return {
          bg: 'bg-slate-50',
          border: 'border-slate-200',
          text: 'text-slate-800',
          badge: 'bg-slate-400 text-white',
          icon: faClock,
          accent: 'text-slate-500',
        };
    }
  };

  const finalStyle = decisionStyle(normalizedFinal);
  const evalStyle = decisionStyle(normalizedEvaluation);

  // === Compute stats if not provided ===
  const computedStats = voteStats || (() => {
    const stats = { endorse: 0, downgrade: 0, reassign: 0 };
    (votes || []).forEach(v => {
      const vs = String(v.vote_status || '').toLowerCase();
      if (vs === 'endorse') stats.endorse += 1;
      else if (vs.startsWith('downgraded') || vs === 'downgrade') stats.downgrade += 1;
      else if (vs === 'reassign') stats.reassign += 1;
    });
    return stats;
  })();

  const totalVotes = computedStats.endorse + computedStats.downgrade + computedStats.reassign;
  const voteTarget = 3;

  // === Vote consistency check ===
  const isConsistent = (() => {
    if (normalizedFinal === 'pending' || totalVotes === 0) return null;
    if (normalizedFinal === 'endorse' && computedStats.endorse > 0) return true;
    if (normalizedFinal.startsWith('downgraded') && computedStats.downgrade > 0) return true;
    return false;
  })();

  const getEvaluatorName = (id) => {
    const user = (evaluators || []).find(u => u.id === id || String(u.id) === String(id));
    return user ? user.full_name : `Evaluator #${id}`;
  };

  const voteStyle = (status) => {
    const vs = String(status || '').toLowerCase();
    if (vs === 'endorse') return { color: 'bg-emerald-100 text-emerald-700', icon: faThumbsUp, label: 'Endorse' };
    if (vs === 'reassign') return { color: 'bg-blue-100 text-blue-700', icon: faSync, label: 'Reassign' };
    if (vs.startsWith('downgraded-non_competitive')) return { color: 'bg-amber-100 text-amber-700', icon: faArrowDown, label: 'Non-Competitive' };
    if (vs.startsWith('downgraded-poster_only')) return { color: 'bg-orange-100 text-orange-700', icon: faArrowDown, label: 'Poster Only' };
    if (vs === 'downgrade') return { color: 'bg-amber-100 text-amber-700', icon: faArrowDown, label: 'Downgrade' };
    return { color: 'bg-slate-100 text-slate-700', icon: faInfoCircle, label: status || 'N/A' };
  };

  // === Render ===
  if (compact) {
    return (
      <div className={`rounded-xl border p-4 ${finalStyle.bg} ${finalStyle.border}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FontAwesomeIcon icon={faGavel} className={`w-4 h-4 ${finalStyle.accent}`} />
            <span className={`text-xs font-bold uppercase tracking-wide ${finalStyle.text}`}>
              Master Decision
            </span>
          </div>
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${finalStyle.badge}`}>
            <FontAwesomeIcon icon={finalStyle.icon} className="w-3 h-3" />
            {finalLabel}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* ===== Master Approver Decision ===== */}
      <div className={`rounded-2xl border ${finalStyle.border} ${finalStyle.bg} overflow-hidden`}>
        <div className={`px-5 py-3 border-b ${finalStyle.border} flex items-center gap-2`}>
          <FontAwesomeIcon icon={faGavel} className={`w-4 h-4 ${finalStyle.accent}`} />
          <h4 className={`text-sm font-bold uppercase tracking-wide ${finalStyle.text}`}>
            Master Approver Decision
          </h4>
        </div>
        <div className="px-5 py-4 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${finalStyle.badge}`}>
              <FontAwesomeIcon icon={finalStyle.icon} className="w-5 h-5" />
            </div>
            <div>
              <p className={`text-sm font-semibold ${finalStyle.text}`}>{finalLabel}</p>
              <p className="text-xs text-slate-500">
                {normalizedFinal === 'pending'
                  ? 'The Master Approver has not finalized this submission yet.'
                  : 'This is the final decision for this submission.'}
              </p>
            </div>
          </div>

          {/* Consistency badge */}
          {isConsistent === false && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
              <FontAwesomeIcon icon={faExclamationTriangle} className="w-3 h-3" />
              Differs from evaluator majority
            </span>
          )}
        </div>
      </div>

      {/* ===== Evaluator Decision Summary ===== */}
      <div className={`rounded-2xl border ${evalStyle.border} ${evalStyle.bg} overflow-hidden`}>
        <div className={`px-5 py-3 border-b ${evalStyle.border} flex items-center justify-between`}>
          <div className="flex items-center gap-2">
            <FontAwesomeIcon icon={faChartBar} className={`w-4 h-4 ${evalStyle.accent}`} />
            <h4 className={`text-sm font-bold uppercase tracking-wide ${evalStyle.text}`}>
              Evaluator Decision Summary
            </h4>
          </div>
          <span className="text-xs text-slate-500">
            {totalVotes}/{voteTarget} votes cast
          </span>
        </div>

        <div className="px-5 py-4 space-y-4">
          {/* Vote stats grid */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white rounded-xl p-3 border border-emerald-100 text-center">
              <p className="text-2xl font-bold text-emerald-600">{computedStats.endorse}</p>
              <p className="text-xs text-slate-500 mt-0.5">Endorse</p>
            </div>
            <div className="bg-white rounded-xl p-3 border border-amber-100 text-center">
              <p className="text-2xl font-bold text-amber-600">{computedStats.downgrade}</p>
              <p className="text-xs text-slate-500 mt-0.5">Downgrade</p>
            </div>
            <div className="bg-white rounded-xl p-3 border border-blue-100 text-center">
              <p className="text-2xl font-bold text-blue-600">{computedStats.reassign}</p>
              <p className="text-xs text-slate-500 mt-0.5">Reassign</p>
            </div>
          </div>

          {/* Progress bar */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-medium text-slate-500">Progress</span>
              <span className="text-xs text-slate-400">
                {totalVotes >= voteTarget ? 'Complete' : `${voteTarget - totalVotes} remaining`}
              </span>
            </div>
            <div className="h-2 bg-white rounded-full overflow-hidden border border-slate-200">
              <div
                className={`h-full transition-all ${
                  totalVotes >= voteTarget ? 'bg-emerald-500' : 'bg-blue-500'
                }`}
                style={{ width: `${Math.min(100, (totalVotes / voteTarget) * 100)}%` }}
              />
            </div>
          </div>

          {/* Individual votes */}
          {showEvaluators && votes && votes.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Individual Votes
              </p>
              {votes.map((vote, idx) => {
                const vs = voteStyle(vote.vote_status);
                return (
                  <div
                    key={idx}
                    className="flex items-start gap-3 p-3 bg-white rounded-xl border border-slate-200"
                  >
                    <FontAwesomeIcon
                      icon={faUserCircle}
                      className="w-5 h-5 text-slate-400 mt-0.5"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-semibold text-slate-900 truncate">
                          {getEvaluatorName(vote.evaluator_id)}
                        </p>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${vs.color}`}>
                          <FontAwesomeIcon icon={vs.icon} className="w-2.5 h-2.5" />
                          {vs.label}
                        </span>
                      </div>
                      {vote.vote_notes && (
                        <p className="text-xs text-slate-500 italic mt-1 line-clamp-2">
                          "{vote.vote_notes}"
                        </p>
                      )}
                      {vote.vote_reassign_to && (
                        <p className="text-xs text-blue-600 mt-1">
                          <FontAwesomeIcon icon={faSync} className="w-2.5 h-2.5 mr-1" />
                          Reassigned to: {vote.vote_reassign_to}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {totalVotes === 0 && (
            <div className="text-center py-3 text-xs text-slate-400 italic">
              No evaluator votes yet
            </div>
          )}
        </div>
      </div>
    </div>
  );
}