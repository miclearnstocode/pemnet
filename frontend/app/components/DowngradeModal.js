"use client";
import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle, faLock } from '@fortawesome/free-solid-svg-icons';

export default function DowngradeModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  isLoading,
  paperCategory = '',   // <-- NEW: pass the submission's paper_category
}) {
  const [selectedOption, setSelectedOption] = useState('');

  // Only "Completed Extension Project Papers" can be downgraded
  const isDowngradable = (() => {
    if (!paperCategory) return false;
    const normalized = String(paperCategory).toLowerCase();
    // Match any variant: "Completed Extension Project Papers", "Completed Extension Project Paper", "Completed"
    return normalized.includes('completed');
  })();

  // Reset selection when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedOption(isDowngradable ? 'downgraded-non_competitive' : '');
    }
  }, [isOpen, isDowngradable]);

  if (!isOpen) return null;

  // Poster Only option has been REMOVED.
  // Only Non-Competitive downgrade remains.
  const downgradeOptions = [
    { 
      value: 'downgraded-non_competitive', 
      label: 'Non-Competitive Presentation with Poster',
      description: 'Abstract is accepted as a poster presentation only (non-competitive)'
    },
  ];

  const handleSubmit = () => {
    if (!selectedOption || !isDowngradable) return;
    onSubmit(selectedOption);
  };

  return (
    <div className="fixed inset-0 z-55 overflow-y-auto">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative min-h-full flex items-center justify-center p-4">
        <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
            <h3 className="text-lg font-bold text-slate-900">Downgrade Submission</h3>
            <button 
              onClick={onClose} 
              className="text-slate-400 hover:text-slate-600 transition"
              aria-label="Close modal"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="p-6">
            {/* ===== Warning banner when NOT downgradable ===== */}
            {!isDowngradable ? (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl mb-4">
                <div className="flex items-start gap-3">
                  <FontAwesomeIcon icon={faLock} className="w-5 h-5 text-red-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-red-800 mb-1">
                      Downgrade Not Allowed
                    </p>
                    <p className="text-xs text-red-700">
                      Only <strong>Completed Extension Project Papers</strong> can be downgraded to Non-Competitive Presentation.
                    </p>
                    <p className="text-xs text-red-600 mt-2">
                      Current Paper Category:{' '}
                      <span className="font-semibold">
                        {paperCategory || 'Not specified'}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                <p className="text-sm font-semibold text-yellow-800 mb-1">⚠️ Downgrade Option</p>
                <p className="text-xs text-yellow-700">
                  Select the downgrade type. This will update the evaluation status to <strong>Non-Competitive Presentation</strong>.
                </p>
              </div>
            )}

            <label className="block text-sm font-semibold text-slate-700 mb-3">
              Select Downgrade Type
            </label>
            
            <div className="space-y-3">
              {downgradeOptions.map((option) => {
                const disabled = !isDowngradable;
                return (
                  <div
                    key={option.value}
                    onClick={() => {
                      if (disabled) return;
                      setSelectedOption(option.value);
                    }}
                    className={`p-3 border rounded-xl transition ${
                      disabled
                        ? 'border-slate-200 bg-slate-50 opacity-50 cursor-not-allowed'
                        : selectedOption === option.value
                          ? 'border-yellow-500 bg-yellow-50 cursor-pointer'
                          : 'border-slate-200 hover:border-yellow-300 hover:bg-yellow-50/50 cursor-pointer'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                          selectedOption === option.value && !disabled
                            ? 'border-yellow-500 bg-yellow-500'
                            : 'border-slate-300'
                        }`}>
                          {selectedOption === option.value && !disabled && (
                            <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                          )}
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{option.label}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{option.description}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={onClose}
                disabled={isLoading}
                className="flex-1 px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200 transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={!selectedOption || !isDowngradable || isLoading}
                title={!isDowngradable ? 'Only Completed Extension Project Papers can be downgraded' : ''}
                className="flex-1 px-4 py-2 bg-yellow-600 text-white rounded-xl font-semibold hover:bg-yellow-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                    Submitting...
                  </>
                ) : (
                  'Confirm Downgrade'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}