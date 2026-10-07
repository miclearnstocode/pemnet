"use client";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock } from '@fortawesome/free-solid-svg-icons';
import { UnderDevelopmentModal } from './UnderDevelopment';

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
    blue: {
      bg: 'bg-gradient-to-br from-blue-50 to-blue-100/50',
      border: 'border-blue-200',
      hoverBorder: 'hover:border-blue-300',
      iconColor: 'text-blue-600',
      titleHover: 'group-hover:text-blue-700',
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

// ---------- Under Update Popup Modal (thin wrapper around UnderDevelopmentModal) ----------
/**
 * Kept for backwards compatibility with existing imports.
 * Delegates to the shared `UnderDevelopmentModal` from `UnderDevelopment.js`
 * so the popup UI stays consistent across the app.
 */
export function UnderUpdateModal({ isOpen, onClose, featureName }) {
  return (
    <UnderDevelopmentModal
      isOpen={isOpen}
      onClose={onClose}
      featureName={featureName}
      description="This feature is temporarily unavailable while we work on enhancements. We appreciate your patience and will have it ready soon!"
    />
  );
}

export default { QuickLinkCard, UnderUpdateModal };