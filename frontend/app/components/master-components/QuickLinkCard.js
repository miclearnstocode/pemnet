"use client";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock } from '@fortawesome/free-solid-svg-icons';

// ---------- Quick Link Card Component ----------
export function QuickLinkCard({ 
  icon, 
  title, 
  description, 
  color = 'indigo', 
  href = null, 
  underUpdate = false,
  onUnderUpdateClick = null 
}) {
  const colorMap = {
    indigo: {
      bg: 'bg-gradient-to-br from-indigo-50 to-indigo-100/50',
      border: 'border-indigo-200',
      hoverBorder: 'hover:border-indigo-300',
      iconColor: 'text-indigo-600',
      titleHover: 'group-hover:text-indigo-700',
    },
    emerald: {
      bg: 'bg-gradient-to-br from-emerald-50 to-emerald-100/50',
      border: 'border-emerald-200',
      hoverBorder: 'hover:border-emerald-300',
      iconColor: 'text-emerald-600',
      titleHover: 'group-hover:text-emerald-700',
    },
    purple: {
      bg: 'bg-gradient-to-br from-purple-50 to-purple-100/50',
      border: 'border-purple-200',
      hoverBorder: 'hover:border-purple-300',
      iconColor: 'text-purple-600',
      titleHover: 'group-hover:text-purple-700',
    },
  };

  const colors = colorMap[color] || colorMap.indigo;

  const handleClick = (e) => {
    if (underUpdate) {
      e.preventDefault();
      if (onUnderUpdateClick) onUnderUpdateClick(title);
    }
  };

  const Wrapper = underUpdate ? 'button' : 'a';
  const wrapperProps = underUpdate 
    ? { type: 'button', onClick: handleClick }
    : { href: href || '#', target: '_blank', rel: 'noreferrer' };

  return (
    <Wrapper
      {...wrapperProps}
      className={`
        relative p-4 ${colors.bg} rounded-xl border ${colors.border} ${colors.hoverBorder} 
        transition group text-left w-full cursor-pointer
        ${underUpdate ? 'opacity-90 hover:opacity-100' : ''}
      `}
    >
      {/* "Under Update" badge */}
      {underUpdate && (
        <span className="absolute top-3 right-3 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wide bg-amber-100 text-amber-700 border border-amber-200">
          <FontAwesomeIcon icon={faClock} className="w-2.5 h-2.5" />
          Soon
        </span>
      )}

      <FontAwesomeIcon icon={icon} className={`w-6 h-6 ${colors.iconColor} mb-2`} />
      <p className={`font-semibold text-sm text-slate-800 ${colors.titleHover}`}>
        {title}
      </p>
      <p className="text-xs text-slate-500 mt-0.5">
        {underUpdate ? 'Coming soon…' : description}
      </p>

      {/* Subtle overlay icon for under-update items */}
      {underUpdate && (
        <div className="absolute bottom-3 right-3 w-6 h-6 rounded-full bg-amber-100/80 border border-amber-200 flex items-center justify-center">
          <FontAwesomeIcon icon={faClock} className="w-3 h-3 text-amber-600" />
        </div>
      )}
    </Wrapper>
  );
}

// ---------- Under Update Popup Modal ----------
export function UnderUpdateModal({ isOpen, onClose, featureName }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-110 overflow-y-auto">
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-fade-in" 
        onClick={onClose}
      ></div>
      <div className="relative min-h-full flex items-center justify-center p-4">
        <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-scale-in">
          {/* Header with gradient */}
          <div className="h-1.5 w-full bg-linear-to-r from-amber-400 via-orange-400 to-amber-400" />

          <div className="p-6 text-center">
            {/* Animated icon */}
            <div className="relative w-20 h-20 mx-auto mb-4">
              <div className="absolute inset-0 rounded-full bg-amber-100 animate-ping opacity-30" />
              <div className="relative w-20 h-20 rounded-full bg-linear-to-br from-amber-100 to-orange-100 border-2 border-amber-200 flex items-center justify-center">
                <FontAwesomeIcon icon={faClock} className="w-9 h-9 text-amber-600" />
              </div>
            </div>

            <h3 className="text-xl font-bold text-slate-900 mb-2">
              Currently Under Update
            </h3>
            <p className="text-sm text-slate-600 mb-1">
              <span className="font-semibold text-slate-800">"{featureName}"</span> is being improved.
            </p>
            <p className="text-xs text-slate-500 leading-relaxed">
              This feature is temporarily unavailable while we work on enhancements. 
              We appreciate your patience and will have it ready soon!
            </p>

            {/* Progress bar */}
            <div className="mt-5 mb-1">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                  Development Progress
                </span>
                <span className="text-[10px] font-bold text-amber-600">
                  In Progress
                </span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full w-2/3 bg-linear-to-r from-amber-400 to-orange-500 rounded-full animate-pulse" />
              </div>
            </div>

            {/* Button */}
            <button
              onClick={onClose}
              className="mt-6 w-full px-6 py-2.5 bg-slate-900 text-white rounded-xl font-semibold text-sm hover:bg-slate-800 transition shadow-sm hover:shadow"
            >
              Got it, thanks!
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------- Default export (both components) ----------
export default { QuickLinkCard, UnderUpdateModal };