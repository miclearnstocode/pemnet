"use client";

import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faEdit,
  faSave,
  faTimes,
  faHistory,
  faUserCircle,
  faArrowRight,
  faFileAlt,
  faTag,
  faBookOpen,
  faLayerGroup,
  faUser,
  faSchool,
  faUserCircle as faUserCircleIcon,
  faEnvelope,
  faFlag,
  faPlus,
  faSpinner,
  faUsers,
  faExclamationTriangle
} from '@fortawesome/free-solid-svg-icons';

export default function EditSubmission({
  isOpen,
  onClose,
  data,
  onSave,
  isLoading = false,
  currentUser,
  isMasterApprover = false,
  title = 'Edit Submission',
  fields = null, // Custom fields configuration
  submissionType = 'system' // 'system' or 'email'
}) {
  const [editForm, setEditForm] = useState({});
  const [showSucDropdown, setShowSucDropdown] = useState(false);
  const [sucSearchTerm, setSucSearchTerm] = useState('');
  const [sucList, setSucList] = useState([]);
  const [isAddingSuc, setIsAddingSuc] = useState(false);
  const [newSucName, setNewSucName] = useState('');
  const [newSucRegion, setNewSucRegion] = useState('');
  
  // Confirmation modal state
  const [showConfirm, setShowConfirm] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Default field configurations for system submissions
  const systemFields = {
    extension_project_title: { label: 'Title', icon: faFileAlt, type: 'text' },
    project_leader: { label: 'Project Leader', icon: faUser, type: 'text' },
    presenter: { label: 'Presenter', icon: faUserCircleIcon, type: 'text' },
    suc_agencies: { label: 'SUC / Agency', icon: faSchool, type: 'suc' },
    corresponding_author_name: { label: 'Corresponding Author', icon: faUserCircleIcon, type: 'text' },
    corresponding_author_email: { label: 'Corresponding Email', icon: faEnvelope, type: 'email' },
    corresponding_author_position: { label: 'Corresponding Position', icon: faTag, type: 'text' },
    co_authors: { label: 'Co-Authors', icon: faUsers, type: 'text' },
    paper_category: { label: 'Paper Category', icon: faBookOpen, type: 'select', options: [
      'Not specified',
      'Completed Extension Project Papers',
      'Ongoing Extension Project Papers'
    ]},
    thematic_area: { label: 'Thematic Area', icon: faLayerGroup, type: 'select', options: [
      'Not specified',
      'Food Production, Agriculture, Fisheries, and Natural Resource Systems',
      'Health, Nutrition, Wellness, and Community Care',
      'Education, Literacy, Skills Development, and Lifelong Learning',
      'Livelihood, Entrepreneurship, Cooperatives, MSMEs, and Local Economic Development',
      'Environment, Climate Action, Disaster Risk Reduction, and Community Resilience'
    ]}
  };

  const emailFields = {
    title: { label: 'Title', icon: faFileAlt, type: 'text' },
    project_leader: { label: 'Project Leader', icon: faUser, type: 'text' },
    sucs: { label: 'SUC / Agency', icon: faSchool, type: 'suc' },
    corresponding_author_name: { label: 'Corresponding Author', icon: faUserCircleIcon, type: 'text' },
    corresponding_author_email: { label: 'Corresponding Email', icon: faEnvelope, type: 'email' },
    corresponding_author_position: { label: 'Corresponding Position', icon: faTag, type: 'text' },
    authors_list: { label: 'Authors List', icon: faUsers, type: 'text' }, // Retained
    paper_category: { label: 'Paper Category', icon: faBookOpen, type: 'select', options: [
      'Completed Extension Project Papers',
      'Ongoing Extension Project Papers',
      'Not specified'
    ]},
    thematic_area: { label: 'Thematic Area', icon: faLayerGroup, type: 'select', options: [
      'Food Production, Agriculture, Fisheries, and Natural Resource Systems',
      'Health, Nutrition, Wellness, and Community Care',
      'Education, Literacy, Skills Development, and Lifelong Learning',
      'Livelihood, Entrepreneurship, Cooperatives, MSMEs, and Local Economic Development',
      'Environment, Climate Action, Disaster Risk Reduction, and Community Resilience',
      'Not specified'
    ]},
    theme: { label: 'Theme', icon: faFlag, type: 'text' }
  };

  // Determine which fields to use
  const defaultFields = submissionType === 'email' ? emailFields : systemFields;
  const fieldConfig = fields || defaultFields;

  useEffect(() => {
    if (isOpen && data) {
      const initialForm = {};
      Object.keys(fieldConfig).forEach(key => {
        const value = data[key];
        const field = fieldConfig[key];

        if (field && field.type === 'select') {
          initialForm[key] = value && value.trim() !== '' ? value : 'Not specified';
        } else {
          initialForm[key] = value || '';
        }
      });
      setEditForm(initialForm);
      setHasChanges(false);
    }
  }, [isOpen, data, fieldConfig]);

  useEffect(() => {
    if (isOpen) {
      fetchSucs();
    }
  }, [isOpen]);

  const fetchSucs = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/sucs');
      if (res.ok) {
        const data = await res.json();
        setSucList(data);
      }
    } catch (err) {
      console.error('Error fetching SUCs:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
    setHasChanges(true);
  };

  const handleSucSelect = (sucName) => {
    // Use the correct field name for the submission type
    const sucField = submissionType === 'email' ? 'sucs' : 'suc_agencies';
    setEditForm(prev => ({ ...prev, [sucField]: sucName }));
    setShowSucDropdown(false);
    setSucSearchTerm('');
    setHasChanges(true);
  };

  const handleAddNewSuc = async () => {
    if (!newSucName.trim()) {
      return;
    }

    setIsAddingSuc(true);
    try {
      const res = await fetch('http://localhost:5000/api/sucs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newSucName.trim(),
          region: newSucRegion.trim() || 'Other'
        })
      });

      if (res.ok) {
        const data = await res.json();
        setSucList(prev => [...prev, data]);
        const sucField = submissionType === 'email' ? 'sucs' : 'suc_agencies';
        setEditForm(prev => ({ ...prev, [sucField]: data.name }));
        setNewSucName('');
        setNewSucRegion('');
        setShowSucDropdown(false);
        setHasChanges(true);
      } else {
        const error = await res.json();
        console.error('Failed to add SUC:', error);
      }
    } catch (error) {
      console.error('Error adding SUC:', error);
    } finally {
      setIsAddingSuc(false);
    }
  };

  const handleSubmit = () => {
    // Check if there are actual changes
    if (!hasChanges) {
      // If no changes, just close without showing confirmation
      onClose();
      return;
    }
    // Show confirmation modal
    setShowConfirm(true);
  };

  const confirmSave = () => {
    setShowConfirm(false);
    if (onSave) {
      onSave(editForm);
    }
  };

  const cancelSave = () => {
    setShowConfirm(false);
  };

  if (!isOpen) return null;

  // Filter SUCs based on search term
  const filteredSucs = sucList.filter(suc =>
    suc.name.toLowerCase().includes(sucSearchTerm.toLowerCase())
  );

  // Get the current SUC value based on submission type
  const getSucValue = () => {
    if (submissionType === 'email') {
      return editForm.sucs || '';
    }
    return editForm.suc_agencies || '';
  };

  return (
    <>
      {/* Main Edit Modal */}
      <div className="fixed inset-0 z-60 overflow-y-auto">
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
        <div className="relative min-h-full flex items-center justify-center p-4">
          <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[90vh]">
            {/* Header */}
            <div className={`flex items-center justify-between px-6 py-4 border-b border-slate-200 ${isMasterApprover ? 'bg-gradient-to-r from-purple-50 to-blue-50' : 'bg-gradient-to-r from-blue-50 to-white'}`}>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isMasterApprover ? 'bg-purple-100 text-purple-600' : 'bg-emerald-100 text-emerald-600'}`}>
                  <FontAwesomeIcon icon={faEdit} className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{title}</h3>
                  {isMasterApprover && (
                    <p className="text-xs text-purple-600 font-medium">Master Approver Edit</p>
                  )}
                  <p className="text-xs text-slate-400">
                    {submissionType === 'email' ? '📧 Email Submission' : '📝 System Submission'}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 flex items-center justify-center rounded-lg bg-white text-slate-600 hover:bg-slate-100 transition shadow-sm"
              >
                <FontAwesomeIcon icon={faTimes} className="w-5 h-5" />
              </button>
            </div>

            {/* Body - Adjusted max-height to ensure footer visibility */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
              <div className="space-y-4">
                {Object.keys(fieldConfig).map((key) => {
                  const field = fieldConfig[key];
                  const value = editForm[key] || '';

                  // Skip rendering SUC field if it's not the correct one for this type
                  if (key === 'sucs' && submissionType !== 'email') {
                    return null;
                  }
                  if (key === 'suc_agencies' && submissionType === 'email') {
                    return null;
                  }

                  if (field.type === 'select') {
                    return (
                      <div key={key} className="group">
                        <div className="flex items-center gap-2 text-sm font-medium text-slate-500 mb-1.5">
                          <FontAwesomeIcon icon={field.icon} className="w-4 h-4 text-blue-400" />
                          {field.label}
                        </div>
                        <select
                          name={key}
                          value={value}
                          onChange={handleChange}
                          className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none transition-all bg-white"
                        >
                          {field.options.map(option => (
                            <option key={option} value={option}>{option}</option>
                          ))}
                        </select>
                      </div>
                    );
                  }

                  if (field.type === 'suc') {
                    return (
                      <div key={key} className="group">
                        <div className="flex items-center gap-2 text-sm font-medium text-slate-500 mb-1.5">
                          <FontAwesomeIcon icon={field.icon} className="w-4 h-4 text-amber-400" />
                          {field.label}
                        </div>
                        <div className="relative">
                          <input
                            type="text"
                            name={key}
                            value={getSucValue()}
                            onChange={(e) => {
                              const sucField = submissionType === 'email' ? 'sucs' : 'suc_agencies';
                              setEditForm(prev => ({ ...prev, [sucField]: e.target.value }));
                              setSucSearchTerm(e.target.value);
                              setShowSucDropdown(true);
                              setHasChanges(true);
                            }}
                            onFocus={() => setShowSucDropdown(true)}
                            placeholder="Search or add SUC..."
                            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none transition-all"
                          />
                          {showSucDropdown && (
                            <div className="absolute z-60 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                              {filteredSucs.length > 0 ? (
                                filteredSucs.map(suc => (
                                  <div
                                    key={suc.id}
                                    className="px-4 py-2 hover:bg-blue-50 cursor-pointer text-sm text-slate-700 flex items-center justify-between"
                                    onClick={() => handleSucSelect(suc.name)}
                                  >
                                    <span>{suc.name}</span>
                                    <span className="text-xs text-slate-400">{suc.region}</span>
                                  </div>
                                ))
                              ) : (
                                <div className="p-3">
                                  <p className="text-sm text-slate-500 mb-2">No SUC found. Add new:</p>
                                  <div className="flex gap-2">
                                    <input
                                      type="text"
                                      placeholder="SUC Name"
                                      value={newSucName}
                                      onChange={(e) => setNewSucName(e.target.value)}
                                      className="flex-1 px-3 py-1.5 border border-slate-200 rounded-lg text-sm"
                                    />
                                    <input
                                      type="text"
                                      placeholder="Region"
                                      value={newSucRegion}
                                      onChange={(e) => setNewSucRegion(e.target.value)}
                                      className="flex-1 px-3 py-1.5 border border-slate-200 rounded-lg text-sm"
                                    />
                                    <button
                                      onClick={handleAddNewSuc}
                                      disabled={isAddingSuc}
                                      className="px-3 py-1.5 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition-all disabled:opacity-50"
                                    >
                                      {isAddingSuc ? <FontAwesomeIcon icon={faSpinner} className="w-4 h-4 animate-spin" /> : <FontAwesomeIcon icon={faPlus} className="w-4 h-4" />}
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div key={key} className="group">
                      <div className="flex items-center gap-2 text-sm font-medium text-slate-500 mb-1.5">
                        <FontAwesomeIcon icon={field.icon} className="w-4 h-4 text-blue-400" />
                        {field.label}
                      </div>
                      <input
                        type={field.type || 'text'}
                        name={key}
                        value={value}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none transition-all"
                      />
                    </div>
                  );
                })}
              </div>

              {/* Master Approver Notes */}
              {isMasterApprover && (
                <div className="mt-6 p-4 bg-purple-50 border border-purple-200 rounded-xl">
                  <label className="block text-sm font-semibold text-purple-700 mb-2">
                    <FontAwesomeIcon icon={faEdit} className="w-4 h-4 mr-2" />
                    Master Approver Notes
                  </label>
                  <textarea
                    name="master_notes"
                    value={editForm.master_notes || ''}
                    onChange={handleChange}
                    placeholder="Add notes about this edit (optional)..."
                    className="w-full px-4 py-2.5 border border-purple-200 rounded-xl text-sm text-slate-900 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 focus:outline-none transition-all bg-white"
                    rows="3"
                  />
                </div>
              )}

              {/* History Indicator */}
              {data?.edited_at && (
                <div className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <FontAwesomeIcon icon={faHistory} className="w-3 h-3" />
                    Last edited: {new Date(data.edited_at).toLocaleString()}
                    {data.edited_by && ` by ${data.edited_by}`}
                  </div>
                </div>
              )}
            </div>

            {/* Footer - Fixed with proper padding and layout */}
            <div className="flex items-center justify-end gap-4 px-8 py-5 border-t border-slate-200 bg-slate-50/80">
              <button
                onClick={onClose}
                disabled={isLoading}
                className="px-6 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200 transition disabled:opacity-50 min-w-[100px]"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={isLoading}
                className={`px-8 py-2.5 rounded-xl font-semibold transition flex items-center justify-center gap-3 text-white min-w-[140px] ${
                  isMasterApprover
                    ? 'bg-purple-600 hover:bg-purple-700 shadow-lg shadow-purple-500/25 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]'
                    : 'bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faSave} className="w-4 h-4" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-70 overflow-y-auto">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={cancelSave}></div>
          <div className="relative min-h-full flex items-center justify-center p-4">
            <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
              <div className="p-6">
                <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 rounded-full bg-yellow-100">
                  <FontAwesomeIcon icon={faExclamationTriangle} className="w-6 h-6 text-yellow-600" />
                </div>
                
                <h3 className="text-lg font-bold text-slate-900 text-center mb-2">
                  Confirm Changes
                </h3>
                
                <div className="text-sm text-slate-600 text-center mb-6">
                  {isMasterApprover ? (
                    <p>Are you sure you want to save these changes? This action will be recorded in the edit history with your role as <strong>Master Approver</strong>.</p>
                  ) : (
                    <p>Are you sure you want to save these changes? This action will be recorded in the edit history.</p>
                  )}
                  <p className="text-xs text-slate-400 mt-2">
                    {Object.keys(editForm).map(key => {
                      const originalValue = data?.[key] || '';
                      const newValue = editForm[key] || '';
                      if (originalValue !== newValue && originalValue !== '' && newValue !== '') {
                        return (
                          <span key={key} className="block mt-1">
                            <span className="font-medium">{fieldConfig[key]?.label || key}:</span>{' '}
                            <span className="line-through text-red-400">{originalValue || '(empty)'}</span>
                            {' → '}
                            <span className="text-emerald-600">{newValue || '(empty)'}</span>
                          </span>
                        );
                      }
                      return null;
                    })}
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={cancelSave}
                    disabled={isLoading}
                    className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200 transition disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmSave}
                    disabled={isLoading}
                    className="flex-1 px-4 py-2.5 rounded-xl font-semibold transition flex items-center justify-center gap-2 text-white bg-yellow-600 hover:bg-yellow-700"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <FontAwesomeIcon icon={faSave} className="w-4 h-4" />
                        Yes, Save Changes
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}