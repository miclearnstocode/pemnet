"use client";
import { useState, useEffect } from 'react';

export default function ReassignModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  currentThematicArea,
  userThematicAreas = [],
  isLoading 
}) {
  const [selectedArea, setSelectedArea] = useState(currentThematicArea || '');
  const [showAllAreas, setShowAllAreas] = useState(false);

  // Reset selected area when modal opens with new current area
  useEffect(() => {
    if (isOpen) {
      setSelectedArea(currentThematicArea || '');
    }
  }, [isOpen, currentThematicArea]);

  if (!isOpen) return null;

  // All possible thematic areas (from your system)
  const allThematicAreas = [
    'Food Production, Agriculture, Fisheries, and Natural Resource Systems',
    'Health, Nutrition, Wellness, and Community Care',
    'Education, Literacy, Skills Development, and Lifelong Learning',
    'Livelihood, Entrepreneurship, Cooperatives, MSMEs, and Local Economic Development',
    'Environment, Climate Action, Disaster Risk Reduction, and Community Resilience'
  ];

  const handleSubmit = () => {
    if (!selectedArea) return;
    onSubmit(selectedArea);
  };

  return (
    <div className="fixed inset-0 z-55 overflow-y-auto">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative min-h-full flex items-center justify-center p-4">
        <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
            <h3 className="text-lg font-bold text-slate-900">Reassign Thematic Area</h3>
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
            {/* Current Thematic Area - Display Only */}
            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <p className="text-sm font-semibold text-blue-700 mb-1">Current Thematic Area</p>
              <p className="text-base font-bold text-blue-900">
                {currentThematicArea || 'Not Set'}
              </p>
            </div>

            {/* Show user's existing thematic areas (informational only) */}
            {userThematicAreas.length > 0 && (
              <div className="mb-3">
                <p className="text-xs text-slate-500 mb-2">
                  This user has used these thematic areas before:
                </p>
                <div className="flex flex-wrap gap-1">
                  {userThematicAreas.map((area, idx) => (
                    <span 
                      key={idx} 
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        area === currentThematicArea 
                          ? 'bg-blue-100 text-blue-700 border border-blue-300' 
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {area.length > 30 ? area.substring(0, 30) + '...' : area}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Select New Thematic Area
            </label>
            
            {/* Dropdown always shows ALL thematic areas */}
            <select
              value={selectedArea}
              onChange={(e) => setSelectedArea(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none"
              disabled={isLoading}
            >
              <option value="">-- Select New Area --</option>
              {allThematicAreas.map((area) => (
                <option key={area} value={area}>{area}</option>
              ))}
            </select>

            {/* Show change indicator */}
            {selectedArea && selectedArea !== currentThematicArea && (
              <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-xs text-yellow-700">
                  🔄 Changing from "<strong>{currentThematicArea || 'Not Set'}</strong>" to "<strong>{selectedArea}</strong>"
                </p>
              </div>
            )}

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
                disabled={!selectedArea || selectedArea === currentThematicArea || isLoading}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Submitting...
                  </>
                ) : (
                  'Reassign'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}