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
  faUsers
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
  fields = null // Custom fields configuration
}) {
  const [editForm, setEditForm] = useState({});
  const [showSucDropdown, setShowSucDropdown] = useState(false);
  const [sucSearchTerm, setSucSearchTerm] = useState('');
  const [sucList, setSucList] = useState([]);
  const [isAddingSuc, setIsAddingSuc] = useState(false);
  const [newSucName, setNewSucName] = useState('');
  const [newSucRegion, setNewSucRegion] = useState('');

  // Default field configurations - Updated to match database fields
  const defaultFields = {
    extension_project_title: { label: 'Title', icon: faFileAlt, type: 'text' },
    project_leader: { label: 'Project Leader', icon: faUser, type: 'text' },
    presenter: { label: 'Presenter', icon: faUserCircleIcon, type: 'text' },
    suc_agencies: { label: 'SUC / Agency', icon: faSchool, type: 'suc' },
    corresponding_author_name: { label: 'Corresponding Author', icon: faUserCircleIcon, type: 'text' },
    corresponding_author_email: { label: 'Corresponding Email', icon: faEnvelope, type: 'email' },
    corresponding_author_position: { label: 'Corresponding Position', icon: faTag, type: 'text' },
    co_authors: { label: 'Co-Authors', icon: faUsers, type: 'text' },
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
    ]}
  };

  // Merge custom fields with defaults
  const fieldConfig = fields || defaultFields;

  useEffect(() => {
    if (isOpen && data) {
      // Initialize form with data
      const initialForm = {};
      Object.keys(fieldConfig).forEach(key => {
        initialForm[key] = data[key] || '';
      });
      setEditForm(initialForm);
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
  };

  const handleSucSelect = (sucName) => {
    setEditForm(prev => ({ ...prev, suc_agencies: sucName }));
    setShowSucDropdown(false);
    setSucSearchTerm('');
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
        setEditForm(prev => ({ ...prev, suc_agencies: data.name }));
        setNewSucName('');
        setNewSucRegion('');
        setShowSucDropdown(false);
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
    if (onSave) {
      onSave(editForm);
    }
  };

  if (!isOpen) return null;

  // Filter SUCs based on search term
  const filteredSucs = sucList.filter(suc =>
    suc.name.toLowerCase().includes(sucSearchTerm.toLowerCase())
  );

  return (
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
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 flex items-center justify-center rounded-lg bg-white text-slate-600 hover:bg-slate-100 transition shadow-sm"
            >
              <FontAwesomeIcon icon={faTimes} className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
            <div className="space-y-4">
              {Object.keys(fieldConfig).map((key) => {
                const field = fieldConfig[key];
                const value = editForm[key] || '';

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
                          value={value}
                          onChange={(e) => {
                            setEditForm(prev => ({ ...prev, [key]: e.target.value }));
                            setSucSearchTerm(e.target.value);
                            setShowSucDropdown(true);
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
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200 bg-slate-50">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200 transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className={`px-6 py-2 rounded-xl font-semibold transition flex items-center gap-2 text-white ${
                isMasterApprover
                  ? 'bg-purple-600 hover:bg-purple-700 shadow-lg shadow-purple-500/25'
                  : 'bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-500/25'
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
  );
}