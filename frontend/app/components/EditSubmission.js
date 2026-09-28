"use client";

import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faEdit,
  faSave,
  faTimes,
  faHistory,
  faUserCircle,
  faFileAlt,
  faTag,
  faBookOpen,
  faLayerGroup,
  faUser,
  faSchool,
  faEnvelope,
  faFlag,
  faPlus,
  faSpinner,
  faUsers,
  faExclamationTriangle,
  faInfoCircle,
} from '@fortawesome/free-solid-svg-icons';

const API_URL = (process.env.NEXT_PUBLIC_API_URL).replace(/\/+$/, '');

// ---------- Reusable sub-components (matching page.js) ----------
function SectionTitle({ icon, color = 'slate', label }) {
  const colorMap = {
    indigo:  'text-indigo-600 bg-indigo-50 border-indigo-100',
    blue:    'text-blue-600 bg-blue-50 border-blue-100',
    emerald: 'text-emerald-600 bg-emerald-50 border-emerald-100',
    purple:  'text-purple-600 bg-purple-50 border-purple-100',
    slate:   'text-slate-600 bg-slate-100 border-slate-200',
  };
  const cls = colorMap[color] || colorMap.slate;
  return (
    <div className="flex items-center gap-2.5 mb-4">
      <span className={`w-8 h-8 rounded-lg flex items-center justify-center border ${cls}`}>
        <FontAwesomeIcon icon={icon} className="w-3.5 h-3.5" />
      </span>
      <h4 className="text-xs font-bold uppercase tracking-widest text-slate-600">
        {label}
      </h4>
      <span className="flex-1 h-px bg-slate-200" />
    </div>
  );
}

function FieldLabel({ icon, children }) {
  return (
    <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
      {icon && <FontAwesomeIcon icon={icon} className="w-3.5 h-3.5 text-slate-400" />}
      {children}
    </div>
  );
}

export default function EditSubmission({
  isOpen,
  onClose,
  data,
  onSave,
  isLoading = false,
  currentUser,
  isMasterApprover = false,
  title = 'Edit Submission',
  fields = null,
  submissionType = 'system'
}) {
  const [editForm, setEditForm] = useState({});
  const [showSucDropdown, setShowSucDropdown] = useState(false);
  const [sucSearchTerm, setSucSearchTerm] = useState('');
  const [sucList, setSucList] = useState([]);
  const [isAddingSuc, setIsAddingSuc] = useState(false);
  const [newSucName, setNewSucName] = useState('');
  const [newSucRegion, setNewSucRegion] = useState('');

  const [showConfirm, setShowConfirm] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // ---------- Field configs ----------
  const systemFields = {
    extension_project_title: { label: 'Title', icon: faFileAlt, type: 'text', section: 'overview' },
    project_leader:          { label: 'Project Leader', icon: faUser, type: 'text', section: 'authors' },
    presenter:               { label: 'Presenter', icon: faUserCircle, type: 'text', section: 'authors' },
    suc_agencies:            { label: 'SUC / Agency', icon: faSchool, type: 'suc', section: 'authors' },
    corresponding_author_name: { label: 'Corresponding Author', icon: faUserCircle, type: 'text', section: 'contact' },
    corresponding_author_email: { label: 'Corresponding Email', icon: faEnvelope, type: 'email', section: 'contact' },
    corresponding_author_position: { label: 'Corresponding Position', icon: faTag, type: 'text', section: 'contact' },
    co_authors:              { label: 'Co-Authors', icon: faUsers, type: 'text', section: 'authors' },
    paper_category:          { label: 'Paper Category', icon: faBookOpen, type: 'select', section: 'classification', options: [
      'Not specified',
      'Completed Extension Project Paper',
      'Ongoing Extension Project Paper'
    ]},
    thematic_area:           { label: 'Thematic Area', icon: faLayerGroup, type: 'select', section: 'classification', options: [
      'Not specified',
      'Food Production, Agriculture, Fisheries, and Natural Resource Systems',
      'Health, Nutrition, Wellness, and Community Care',
      'Education, Literacy, Skills Development, and Lifelong Learning',
      'Livelihood, Entrepreneurship, Cooperatives, MSMEs, and Local Economic Development',
      'Environment, Climate Action, Disaster Risk Reduction, and Community Resilience'
    ]}
  };

  const emailFields = {
    title:                    { label: 'Title', icon: faFileAlt, type: 'text', section: 'overview' },
    project_leader:           { label: 'Project Leader', icon: faUser, type: 'text', section: 'authors' },
    sucs:                     { label: 'SUC / Agency', icon: faSchool, type: 'suc', section: 'authors' },
    corresponding_author_name: { label: 'Corresponding Author', icon: faUserCircle, type: 'text', section: 'contact' },
    corresponding_author_email: { label: 'Corresponding Email', icon: faEnvelope, type: 'email', section: 'contact' },
    corresponding_author_position: { label: 'Corresponding Position', icon: faTag, type: 'text', section: 'contact' },
    authors_list:             { label: 'Authors List', icon: faUsers, type: 'text', section: 'authors' },
    paper_category:           { label: 'Paper Category', icon: faBookOpen, type: 'select', section: 'classification', options: [
      'Not specified',
      'Completed Extension Project Papers',
      'Ongoing Extension Project Papers'
    ]},
    thematic_area:            { label: 'Thematic Area', icon: faLayerGroup, type: 'select', section: 'classification', options: [
      'Not specified',
      'Food Production, Agriculture, Fisheries, and Natural Resource Systems',
      'Health, Nutrition, Wellness, and Community Care',
      'Education, Literacy, Skills Development, and Lifelong Learning',
      'Livelihood, Entrepreneurship, Cooperatives, MSMEs, and Local Economic Development',
      'Environment, Climate Action, Disaster Risk Reduction, and Community Resilience'
    ]},
    theme:                    { label: 'Theme', icon: faFlag, type: 'text', section: 'classification' }
  };

  const defaultFields = submissionType === 'email' ? emailFields : systemFields;
  const fieldConfig = fields || defaultFields;

  // Section metadata (order + display) — mirrors the submission details modal layout
  const SECTION_META = {
    overview:       { label: 'Paper Overview',         icon: faFileAlt,    color: 'indigo',  gridCols: 1 },
    authors:        { label: 'Authors & Affiliation',  icon: faUsers,      color: 'blue',    gridCols: 2 },
    contact:        { label: 'Corresponding Author',   icon: faUserCircle, color: 'emerald', gridCols: 2 },
    classification: { label: 'Classification',         icon: faLayerGroup, color: 'purple',  gridCols: 2 },
  };

  // ---------- Form initialization ----------
  useEffect(() => {
    if (isOpen && data) {
      const initialForm = {};
      Object.keys(fieldConfig).forEach(key => {
        const rawValue = data[key];
        const isEmpty =
          rawValue === undefined ||
          rawValue === null ||
          (typeof rawValue === 'string' && rawValue.trim() === '');
        initialForm[key] = isEmpty ? 'Not specified' : rawValue;
      });
      setEditForm(initialForm);
      setHasChanges(false);
    }
  }, [isOpen, data, fieldConfig]);

  useEffect(() => {
    if (isOpen) fetchSucs();
  }, [isOpen]);

  const fetchSucs = async () => {
    try {
      const res = await fetch(`${API_URL}/api/sucs`);
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
    const sucField = submissionType === 'email' ? 'sucs' : 'suc_agencies';
    setEditForm(prev => ({ ...prev, [sucField]: sucName }));
    setShowSucDropdown(false);
    setSucSearchTerm('');
    setHasChanges(true);
  };

  const handleAddNewSuc = async () => {
    if (!newSucName.trim()) return;
    setIsAddingSuc(true);
    try {
      const res = await fetch(`${API_URL}/api/sucs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newSucName.trim(),
          region: newSucRegion.trim() || 'Other'
        })
      });
      if (res.ok) {
        const created = await res.json();
        setSucList(prev => [...prev, created]);
        const sucField = submissionType === 'email' ? 'sucs' : 'suc_agencies';
        setEditForm(prev => ({ ...prev, [sucField]: created.name }));
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
    if (!hasChanges) {
      onClose();
      return;
    }
    setShowConfirm(true);
  };

  const buildCleanPayload = () => {
    const clean = {};
    Object.keys(editForm).forEach(key => {
      const value = editForm[key];
      if (typeof value === 'string' && value.trim() === 'Not specified') {
        clean[key] = '';
      } else {
        clean[key] = value;
      }
    });
    return clean;
  };

  const confirmSave = () => {
    setShowConfirm(false);
    if (onSave) onSave(buildCleanPayload());
  };

  const cancelSave = () => setShowConfirm(false);

  if (!isOpen) return null;

  const filteredSucs = sucList.filter(suc =>
    suc.name.toLowerCase().includes(sucSearchTerm.toLowerCase())
  );

  const getSucValue = () => {
    if (submissionType === 'email') return editForm.sucs || '';
    return editForm.suc_agencies || '';
  };

  // ---------- Render a single field ----------
  const renderField = (key, field) => {
    const value = editForm[key] || '';

    // Skip mismatched SUC keys
    if (key === 'sucs' && submissionType !== 'email') return null;
    if (key === 'suc_agencies' && submissionType === 'email') return null;

    // ---- SELECT ----
    if (field.type === 'select') {
      const isNotSpecified = !value || value === 'Not specified';
      return (
        <div key={key}>
          <FieldLabel icon={field.icon}>{field.label}</FieldLabel>
          <select
            name={key}
            value={value}
            onChange={handleChange}
            className={`w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 focus:outline-none transition-all bg-white ${
              isNotSpecified ? 'text-slate-400 italic' : 'text-slate-900 font-medium'
            }`}
          >
            {field.options.map(option => (
              <option
                key={option}
                value={option}
                className="text-slate-900 not-italic font-normal"
              >
                {option}
              </option>
            ))}
          </select>
        </div>
      );
    }

    // ---- SUC AUTOCOMPLETE ----
    if (field.type === 'suc') {
      return (
        <div key={key} className="relative">
          <FieldLabel icon={field.icon}>{field.label}</FieldLabel>
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
            onBlur={() => setTimeout(() => setShowSucDropdown(false), 200)}
            placeholder="Not specified"
            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 placeholder:italic focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 focus:outline-none transition-all"
          />
          {showSucDropdown && (
            <div className="absolute z-30 w-full mt-1.5 bg-white border border-slate-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
              {filteredSucs.length > 0 ? (
                filteredSucs.map(suc => (
                  <div
                    key={suc.id}
                    className="px-4 py-2.5 hover:bg-indigo-50 cursor-pointer text-sm text-slate-700 flex items-center justify-between border-b border-slate-50 last:border-0"
                    onClick={() => handleSucSelect(suc.name)}
                  >
                    <span className="font-medium">{suc.name}</span>
                    <span className="text-[11px] text-slate-400">{suc.region}</span>
                  </div>
                ))
              ) : (
                <div className="p-3">
                  <p className="text-xs text-slate-500 mb-2 italic">
                    No matching SUC. Add a new one:
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="SUC Name"
                      value={newSucName}
                      onChange={(e) => setNewSucName(e.target.value)}
                      className="flex-1 px-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 focus:outline-none"
                    />
                    <input
                      type="text"
                      placeholder="Region"
                      value={newSucRegion}
                      onChange={(e) => setNewSucRegion(e.target.value)}
                      className="flex-1 px-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 focus:outline-none"
                    />
                    <button
                      onClick={handleAddNewSuc}
                      disabled={isAddingSuc}
                      className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 transition disabled:opacity-50"
                    >
                      {isAddingSuc
                        ? <FontAwesomeIcon icon={faSpinner} className="w-3.5 h-3.5 animate-spin" />
                        : <FontAwesomeIcon icon={faPlus} className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      );
    }

    // ---- TEXT / EMAIL ----
    return (
      <div key={key}>
        <FieldLabel icon={field.icon}>{field.label}</FieldLabel>
        <input
          type={field.type || 'text'}
          name={key}
          value={value}
          onChange={handleChange}
          placeholder="Not specified"
          className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 placeholder:italic focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 focus:outline-none transition-all"
        />
      </div>
    );
  };

  // ---------- Group fields by section ----------
  const groupedFields = Object.keys(fieldConfig).reduce((acc, key) => {
    const section = fieldConfig[key].section || 'overview';
    if (!acc[section]) acc[section] = [];
    acc[section].push(key);
    return acc;
  }, {});

  return (
    <>
      {/* ============ MAIN EDIT MODAL ============ */}
      <div className="fixed inset-0 z-60 overflow-y-auto">
        <div
          className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
          onClick={onClose}
        ></div>

        <div className="relative min-h-full flex items-center justify-center p-4">
          <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden max-h-[92vh] flex flex-col">

            {/* ---------- HEADER ---------- */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-20">
              <div className={`h-1 w-full ${isMasterApprover
                ? 'bg-gradient-to-r from-purple-400 via-indigo-400 to-blue-400'
                : 'bg-gradient-to-r from-indigo-400 via-blue-400 to-cyan-400'
              }`} />

              <div className="px-8 py-5 flex items-start justify-between gap-6">
                <div className="flex items-start gap-4 min-w-0 flex-1">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${
                    isMasterApprover
                      ? 'bg-purple-50 border-purple-100'
                      : 'bg-indigo-50 border-indigo-100'
                  }`}>
                    <FontAwesomeIcon
                      icon={faEdit}
                      className={`w-5 h-5 ${isMasterApprover ? 'text-purple-600' : 'text-indigo-600'}`}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">
                        {submissionType === 'email' ? 'Email Submission' : 'System Submission'}
                      </span>
                      <span className="w-1 h-1 rounded-full bg-slate-300" />
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide border ${
                        isMasterApprover
                          ? 'bg-purple-50 text-purple-700 border-purple-200'
                          : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                      }`}>
                        {isMasterApprover ? 'Master Approver' : 'Editor'}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 leading-snug">
                      {title}
                    </h3>
                    <p className="text-sm text-slate-500 mt-0.5 truncate">
                      {data?.extension_project_title || data?.title || 'Untitled submission'}
                    </p>
                  </div>
                </div>

                <button
                  onClick={onClose}
                  aria-label="Close"
                  className="w-9 h-9 flex items-center justify-center rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 transition shrink-0"
                >
                  <FontAwesomeIcon icon={faTimes} className="w-4 h-4" />
                </button>
              </div>

              {/* Info banner */}
              <div className="px-8 pb-4">
                <div className={`flex items-start gap-2 text-xs px-3.5 py-2.5 rounded-lg border ${
                  isMasterApprover
                    ? 'bg-purple-50/60 border-purple-100 text-purple-800'
                    : 'bg-blue-50/60 border-blue-100 text-blue-800'
                }`}>
                  <FontAwesomeIcon icon={faInfoCircle} className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                  <span>
                    All edits are recorded in the submission history.
                    Empty fields will display as <em>"Not specified"</em> in the review panel.
                  </span>
                </div>
              </div>
            </div>

            {/* ---------- BODY ---------- */}
            <div className="flex-1 overflow-y-auto bg-slate-50 px-8 py-6">
              {Object.entries(SECTION_META).map(([sectionKey, meta]) => {
                const keys = groupedFields[sectionKey] || [];
                if (keys.length === 0) return null;

                const gridClass = meta.gridCols === 2
                  ? 'grid grid-cols-1 md:grid-cols-2 gap-4'
                  : 'space-y-4';

                return (
                  <div
                    key={sectionKey}
                    className="mb-5 last:mb-0 bg-white rounded-2xl border border-slate-200 shadow-sm p-5"
                  >
                    <SectionTitle icon={meta.icon} color={meta.color} label={meta.label} />
                    <div className={gridClass}>
                      {keys.map(key => renderField(key, fieldConfig[key]))}
                    </div>
                  </div>
                );
              })}

              {/* Master Approver Notes */}
              {isMasterApprover && (
                <div className="mt-5 bg-white rounded-2xl border border-purple-200 shadow-sm p-5">
                  <SectionTitle icon={faEdit} color="purple" label="Master Approver Notes" />
                  <textarea
                    name="master_notes"
                    value={editForm.master_notes || ''}
                    onChange={handleChange}
                    placeholder="Add internal notes about this edit (optional)…"
                    rows={3}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 placeholder:italic focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 focus:outline-none transition-all resize-none"
                  />
                </div>
              )}

              {/* Last Edited info */}
              {data?.edited_at && (
                <div className="mt-5 flex items-center gap-2 text-[11px] text-slate-500 bg-white border border-slate-200 rounded-xl px-4 py-3 shadow-sm">
                  <FontAwesomeIcon icon={faHistory} className="w-3 h-3" />
                  <span>
                    Last edited <strong className="text-slate-700">{new Date(data.edited_at).toLocaleString()}</strong>
                    {data.edited_by && <> by <strong className="text-slate-700">{data.edited_by}</strong></>}
                  </span>
                </div>
              )}
            </div>

            {/* ---------- FOOTER ---------- */}
            <div className="flex items-center justify-between gap-4 px-8 py-4 border-t border-slate-200 bg-slate-50 sticky bottom-0">
              <div className="text-xs text-slate-500">
                {hasChanges ? (
                  <span className="inline-flex items-center gap-1.5 text-amber-600 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                    You have unsaved changes
                  </span>
                ) : (
                  <span className="text-slate-400">No changes yet</span>
                )}
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={onClose}
                  disabled={isLoading}
                  className="px-5 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl font-semibold text-sm hover:bg-slate-100 transition disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isLoading || !hasChanges}
                  className={`px-6 py-2.5 rounded-xl font-semibold text-sm transition flex items-center justify-center gap-2 text-white shadow-sm hover:shadow disabled:opacity-50 disabled:cursor-not-allowed ${
                    isMasterApprover
                      ? 'bg-purple-600 hover:bg-purple-700'
                      : 'bg-indigo-600 hover:bg-indigo-700'
                  }`}
                >
                  {isLoading ? (
                    <>
                      <FontAwesomeIcon icon={faSpinner} className="w-3.5 h-3.5 animate-spin" />
                      Saving…
                    </>
                  ) : (
                    <>
                      <FontAwesomeIcon icon={faSave} className="w-3.5 h-3.5" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ============ CONFIRMATION MODAL ============ */}
      {showConfirm && (
        <div className="fixed inset-0 z-70 overflow-y-auto">
          <div
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
            onClick={cancelSave}
          ></div>
          <div className="relative min-h-full flex items-center justify-center p-4">
            <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">

              {/* Header */}
              <div className="px-6 pt-6 pb-4 flex items-start gap-4 border-b border-slate-100">
                <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0">
                  <FontAwesomeIcon icon={faExclamationTriangle} className="w-4 h-4 text-amber-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-bold text-slate-900">
                    Confirm Changes
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {isMasterApprover
                      ? 'This will be recorded in the edit history as Master Approver.'
                      : 'This will be recorded in the submission edit history.'}
                  </p>
                </div>
              </div>

              {/* Diff preview */}
              <div className="px-6 py-4 max-h-80 overflow-y-auto bg-slate-50/60">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-3">
                  Changes to be saved
                </p>
                <div className="space-y-2.5">
                  {Object.keys(editForm).map(key => {
                    const originalValue = data?.[key] || '';
                    const newValue = editForm[key] || '';
                    if (originalValue === newValue) return null;
                    if (originalValue === '' && newValue === 'Not specified') return null;
                    if (originalValue === 'Not specified' && newValue === '') return null;

                    return (
                      <div
                        key={key}
                        className="bg-white rounded-lg border border-slate-200 p-3"
                      >
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                          {fieldConfig[key]?.label || key}
                        </p>
                        <div className="flex flex-col gap-1 text-xs">
                          <div className="flex items-start gap-2">
                            <span className="text-[10px] font-bold text-red-400 uppercase tracking-wide mt-0.5 min-w-12">
                              Before
                            </span>
                            <span className="text-slate-500 line-through break-all">
                              {originalValue || '—'}
                            </span>
                          </div>
                          <div className="flex items-start gap-2">
                            <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wide mt-0.5 min-w-12">
                              After
                            </span>
                            <span className="text-slate-900 font-medium break-all">
                              {newValue || '—'}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {Object.keys(editForm).every(key => {
                    const o = data?.[key] || '';
                    const n = editForm[key] || '';
                    return o === n || (o === '' && n === 'Not specified') || (o === 'Not specified' && n === '');
                  }) && (
                    <p className="text-sm text-slate-500 italic py-4 text-center">
                      No meaningful changes detected.
                    </p>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200 bg-white">
                <button
                  onClick={cancelSave}
                  disabled={isLoading}
                  className="px-5 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl font-semibold text-sm hover:bg-slate-100 transition disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmSave}
                  disabled={isLoading}
                  className="px-6 py-2.5 rounded-xl font-semibold text-sm transition flex items-center justify-center gap-2 text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm hover:shadow disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <FontAwesomeIcon icon={faSpinner} className="w-3.5 h-3.5 animate-spin" />
                      Saving…
                    </>
                  ) : (
                    <>
                      <FontAwesomeIcon icon={faSave} className="w-3.5 h-3.5" />
                      Yes, Save Changes
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}