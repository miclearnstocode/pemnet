"use client";

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faBell, 
  faClock, 
  faTimes, 
  faInfoCircle,
  faCode,
  faTools,
} from '@fortawesome/free-solid-svg-icons';

// ---------- Under Development Popup Modal ----------
function UnderDevelopmentModal({ isOpen, onClose, featureName, description }) {
  // Track whether we're mounted on the client (portals require DOM)
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  // Lock body scroll while open
  useEffect(() => {
    if (!isOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = originalOverflow; };
  }, [isOpen]);

  // Escape key closes modal
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen || !mounted) return null;

  const modalContent = (
    <div className="fixed inset-0 z-[9999] overflow-y-auto">
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      ></div>
      <div className="relative min-h-full flex items-center justify-center p-4">
        <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-scale-in">
          {/* Top gradient bar */}
          <div className="h-1.5 w-full bg-gradient-to-r from-amber-400 via-orange-400 to-amber-400" />

          {/* Close button */}
          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
          >
            <FontAwesomeIcon icon={faTimes} className="w-4 h-4" />
          </button>

          <div className="p-6 text-center">
            {/* Animated icon */}
            <div className="relative w-20 h-20 mx-auto mb-4">
              <div className="absolute inset-0 rounded-full bg-amber-100 animate-ping opacity-30" />
              <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-amber-100 to-orange-100 border-2 border-amber-200 flex items-center justify-center">
                <FontAwesomeIcon icon={faTools} className="w-8 h-8 text-amber-600" />
              </div>
            </div>

            <h3 className="text-xl font-bold text-slate-900 mb-2">
              Under Development
            </h3>

            <p className="text-sm text-slate-600 mb-2">
              <span className="font-semibold text-slate-800">"{featureName}"</span> is currently being built.
            </p>

            <p className="text-xs text-slate-500 leading-relaxed">
              {description || "This feature is not yet available. We're working hard to bring it to you soon. Thank you for your patience!"}
            </p>

            {/* Progress bar */}
            <div className="mt-5">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                  Development Progress
                </span>
                <span className="text-[10px] font-bold text-amber-600">
                  In Progress
                </span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full w-2/3 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full animate-pulse" />
              </div>
            </div>

            {/* Action button */}
            <button
              onClick={onClose}
              className="mt-6 w-full px-6 py-2.5 bg-slate-900 text-white rounded-xl font-semibold text-sm hover:bg-slate-800 transition shadow-sm hover:shadow"
            >
              Got it, thanks!
            </button>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes udpFadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        .animate-fade-in { animation: udpFadeIn 0.2s ease-out; }

        @keyframes udpScaleIn {
          from { opacity: 0; transform: scale(0.95) translateY(10px); }
          to   { opacity: 1; transform: scale(1)    translateY(0);    }
        }
        .animate-scale-in { animation: udpScaleIn 0.25s cubic-bezier(0.34, 1.56, 0.64, 1); }
      `}</style>
    </div>
  );

  // 🔑 Render into document.body so it escapes any parent stacking contexts
  return createPortal(modalContent, document.body);
}

// ---------- Under Development Button ----------
export default function UnderDevelopment({
  icon = faBell,
  label = '',
  featureName = 'This feature',
  description = '',
  badge = null,
  className = '',
  iconClassName = '',
  badgeClassName = '',
  size = 'md',
  variant = 'ghost',
  iconSize = 'w-4 h-4',
}) {
  const [isOpen, setIsOpen] = useState(false);

  const sizeMap = {
    sm: 'w-8 h-8',
    md: 'w-9 h-9',
    lg: 'w-10 h-10',
  };

  const variantMap = {
    ghost:   'rounded-lg hover:bg-slate-100 text-slate-500',
    outline: 'rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-500',
    solid:   'rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white',
  };

  const buttonClasses = `
    flex items-center justify-center transition relative
    ${sizeMap[size] || sizeMap.md}
    ${variantMap[variant] || variantMap.ghost}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={buttonClasses}
        title={label || featureName}
        aria-label={label || featureName}
      >
        <FontAwesomeIcon icon={icon} className={`${iconSize} ${iconClassName}`} />
        {badge !== null && badge > 0 && (
          <span
            className={`absolute top-1 right-1 min-w-4 h-4 px-1 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center ${badgeClassName}`}
          >
            {badge > 9 ? '9+' : badge}
          </span>
        )}
      </button>

      <UnderDevelopmentModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        featureName={featureName}
        description={description}
      />
    </>
  );
}

export { UnderDevelopmentModal };