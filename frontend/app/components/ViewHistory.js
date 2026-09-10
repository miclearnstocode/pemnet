"use client";

import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faHistory,
  faUserCircle,
  faClock,
  faArrowRight,
  faTimes,
  faSpinner,
  faEye,
  faUser,
  faTag,
  faFileAlt,
  faBookOpen,
  faLayerGroup,
  faSchool,
  faEnvelope,
  faFlag,
  faChevronDown,
  faChevronUp,
  faSync
} from '@fortawesome/free-solid-svg-icons';

export default function ViewHistory({
  isOpen,
  onClose,
  submissionId,
  extractedDataId,
  isMasterApprover = false,
  title = 'Edit History'
}) {
  const [revisions, setRevisions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedItems, setExpandedItems] = useState({});
  const [allUsers, setAllUsers] = useState([]);

  useEffect(() => {
    if (isOpen && (submissionId || extractedDataId)) {
      fetchHistory();
      fetchUsers();
    }
  }, [isOpen, submissionId, extractedDataId]);

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users`);
      if (res.ok) {
        const data = await res.json();
        setAllUsers(data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchHistory = async () => {
    setLoading(true);
    try {
      let url;
      
      if (extractedDataId) {
        url = `${process.env.NEXT_PUBLIC_API_URL}/api/extracted-data/${extractedDataId}/revisions`;
      } else if (submissionId) {
        url = `${process.env.NEXT_PUBLIC_API_URL}/api/submissions/${submissionId}/edit-history`;
      } else {
        setRevisions([]);
        setLoading(false);
        return;
      }

      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setRevisions(Array.isArray(data) ? data : []);
      } else {
        console.error('Failed to fetch revision history');
        setRevisions([]);
      }
    } catch (error) {
      console.error('Error fetching revision history:', error);
      setRevisions([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (id) => {
    setExpandedItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const getFieldLabel = (field) => {
    const labels = {
      title: 'Title',
      authors: 'Authors',
      authors_list: 'Authors List',
      project_leader: 'Project Leader',
      sucs: 'SUC / Agency',
      corresponding_author_name: 'Corresponding Author',
      corresponding_author_email: 'Corresponding Email',
      corresponding_author_position: 'Corresponding Position',
      paper_category: 'Paper Category',
      thematic_area: 'Thematic Area',
      theme: 'Theme',
      extension_project_title: 'Project Title',
      author: 'Author',
      presenter: 'Presenter',
      co_authors: 'Co-Authors',
      suc_agencies: 'SUC / Agency',
      corresponding_author: 'Corresponding Author'
    };
    return labels[field] || field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getFieldIcon = (field) => {
    const icons = {
      title: faFileAlt,
      authors: faUserCircle,
      authors_list: faUser,
      project_leader: faUser,
      sucs: faSchool,
      corresponding_author_name: faUserCircle,
      corresponding_author_email: faEnvelope,
      corresponding_author_position: faTag,
      paper_category: faBookOpen,
      thematic_area: faLayerGroup,
      theme: faFlag,
      extension_project_title: faFileAlt,
      author: faUser,
      presenter: faUser,
      co_authors: faUser,
      suc_agencies: faSchool
    };
    return icons[field] || faTag;
  };

  const getUserName = (userId) => {
    const user = allUsers.find(u => u.id === userId);
    return user ? user.full_name : `User ${userId}`;
  };

  const getUserRole = (userId) => {
    const user = allUsers.find(u => u.id === userId);
    return user ? user.role : 'user';
  };

  const getRoleBadge = (userId) => {
    const role = getUserRole(userId);
    if (role === 'master_approver' || role === 'admin') {
      return (
        <span className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-purple-100 text-purple-700 border border-purple-200">
          Master Approver
        </span>
      );
    }
    if (role === 'evaluator') {
      return (
        <span className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-100 text-blue-700 border border-blue-200">
          Evaluator
        </span>
      );
    }
    return null;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-60 overflow-y-auto">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative min-h-full flex items-center justify-center p-4">
        <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[90vh]">
          {/* Header */}
          <div className={`flex items-center justify-between px-6 py-4 border-b border-slate-200 ${
            isMasterApprover ? 'bg-linear-to-r from-purple-50 to-blue-50' : 'bg-linear-to-r from-blue-50 to-white'
          }`}>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                isMasterApprover ? 'bg-purple-100 text-purple-600' : 'bg-indigo-100 text-indigo-600'
              }`}>
                <FontAwesomeIcon icon={faHistory} className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">{title}</h3>
                <p className="text-sm text-slate-500">
                  {revisions.length} {revisions.length === 1 ? 'edit' : 'edits'} recorded
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

          {/* Body */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <FontAwesomeIcon icon={faSpinner} className="w-8 h-8 text-blue-500 animate-spin" />
              </div>
            ) : revisions.length > 0 ? (
              <div className="space-y-4">
                {revisions.map((rev, index) => {
                  const isExpanded = expandedItems[rev.id] || false;
                  const changes = rev.changes || {};
                  const changeKeys = Object.keys(changes);
                  const isLatest = index === 0;

                  return (
                    <div
                      key={rev.id}
                      className={`border rounded-xl overflow-hidden transition-all ${
                        isLatest ? 'border-blue-300 bg-blue-50/30' : 'border-slate-200 bg-white'
                      }`}
                    >
                      {/* Header */}
                      <div
                        className={`p-4 cursor-pointer hover:bg-slate-50/50 transition flex items-center justify-between ${
                          isLatest ? 'bg-blue-50/50' : ''
                        }`}
                        onClick={() => toggleExpand(rev.id)}
                      >
                        <div className="flex items-center gap-3 flex-wrap">
                          <div className="flex items-center gap-2">
                            <FontAwesomeIcon
                              icon={faUserCircle}
                              className="w-5 h-5 text-slate-400"
                            />
                            <span className="font-semibold text-sm text-slate-900">
                              {rev.edited_by_name || getUserName(rev.edited_by)}
                            </span>
                            {getRoleBadge(rev.edited_by)}
                            {isLatest && (
                              <span className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-100 text-emerald-700 border border-emerald-200">
                                Latest Edit
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-slate-400 flex items-center gap-1">
                            <FontAwesomeIcon icon={faClock} className="w-3 h-3" />
                            {rev.created_at}
                          </span>
                          <span className="text-xs text-slate-400">
                            ({changeKeys.length} {changeKeys.length === 1 ? 'field' : 'fields'} changed)
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-500">
                            {isExpanded ? 'Hide' : 'Show'} details
                          </span>
                          <FontAwesomeIcon
                            icon={isExpanded ? faChevronUp : faChevronDown}
                            className="w-4 h-4 text-slate-400"
                          />
                        </div>
                      </div>

                      {/* Changes */}
                      {isExpanded && (
                        <div className="p-4 border-t border-slate-200 bg-slate-50/50">
                          <div className="space-y-3">
                            {changeKeys.map((field) => {
                              const change = changes[field];
                              const oldValue = change?.old !== undefined ? String(change.old) : '';
                              const newValue = change?.new !== undefined ? String(change.new) : '';
                              const fieldIcon = getFieldIcon(field);

                              return (
                                <div
                                  key={field}
                                  className="bg-white rounded-lg border border-slate-200 p-3 hover:shadow-sm transition"
                                >
                                  <div className="flex items-center gap-2 mb-2">
                                    <FontAwesomeIcon
                                      icon={fieldIcon}
                                      className="w-4 h-4 text-blue-500"
                                    />
                                    <span className="text-sm font-semibold text-slate-700">
                                      {getFieldLabel(field)}
                                    </span>
                                  </div>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div className="bg-red-50 rounded-lg p-2 border border-red-100">
                                      <p className="text-xs text-red-600 font-medium mb-1">Old Value</p>
                                      <p className="text-sm text-red-800 line-through wrap-break-word">
                                        {oldValue || <span className="text-red-400 italic">Not set</span>}
                                      </p>
                                    </div>
                                    <div className="bg-emerald-50 rounded-lg p-2 border border-emerald-100">
                                      <p className="text-xs text-emerald-600 font-medium mb-1">New Value</p>
                                      <p className="text-sm text-emerald-800 font-medium wrap-break-word">
                                        {newValue || <span className="text-emerald-400 italic">Not set</span>}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-1 mt-2 text-[10px] text-slate-400">
                                    <FontAwesomeIcon icon={faArrowRight} className="w-3 h-3" />
                                    Changed from <span className="font-mono text-slate-500">"{oldValue || 'empty'}"</span>
                                    to <span className="font-mono text-emerald-600">"{newValue || 'empty'}"</span>
                                  </div>
                                </div>
                              );
                            })}

                            {/* Snapshot View */}
                            {rev.snapshot && (
                              <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                <details className="group">
                                  <summary className="text-xs font-medium text-blue-700 cursor-pointer flex items-center gap-2">
                                    <FontAwesomeIcon icon={faEye} className="w-3 h-3" />
                                    View Full Snapshot After Edit
                                    <FontAwesomeIcon icon={faChevronDown} className="w-3 h-3 group-open:rotate-180 transition-transform" />
                                  </summary>
                                  <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                                    {Object.entries(rev.snapshot).map(([key, value]) => (
                                      value && (
                                        <div key={key} className="bg-white rounded p-2 border border-blue-100">
                                          <span className="font-medium text-slate-600 block mb-0.5">
                                            {getFieldLabel(key)}:
                                          </span>
                                          <span className="text-slate-800 wrap-break-word">
                                            {String(value)}
                                          </span>
                                        </div>
                                      )
                                    ))}
                                  </div>
                                </details>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 text-slate-400">
                <FontAwesomeIcon icon={faHistory} className="w-12 h-12 text-slate-300 mb-4" />
                <p className="text-lg font-medium">No edit history found</p>
                <p className="text-sm">This submission has not been edited yet</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 bg-slate-50">
            <div className="text-xs text-slate-500 flex items-center gap-2">
              <FontAwesomeIcon icon={faHistory} className="w-3 h-3" />
              {revisions.length > 0 ? (
                <>
                  Showing {revisions.length} revision{revisions.length > 1 ? 's' : ''}
                  {isMasterApprover && ' (including master approver edits)'}
                </>
              ) : (
                'No edits recorded'
              )}
            </div>
            <button
              onClick={fetchHistory}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-blue-700 transition disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <FontAwesomeIcon icon={faSpinner} className="w-4 h-4 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faSync} className="w-4 h-4" />
                  Refresh
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}