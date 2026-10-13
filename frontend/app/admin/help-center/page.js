'use client';

import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlus, faEdit, faTrash, faSave, faTimes, faGripVertical,
  faEye, faEyeSlash, faStar, faChevronDown, faChevronRight,
  faFileAlt, faQuestionCircle, faPlay, faUser, faWrench,
  faFolder, faBook, faLayerGroup, faListOl, faInfoCircle
} from '@fortawesome/free-solid-svg-icons';

const API_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, '') || 'http://localhost:5000';

const ICON_OPTIONS = [
  { value: 'document', label: 'Document', icon: faFileAlt },
  { value: 'play', label: 'Play/Video', icon: faPlay },
  { value: 'question', label: 'Question', icon: faQuestionCircle },
  { value: 'file', label: 'File', icon: faFileAlt },
  { value: 'user', label: 'User', icon: faUser },
  { value: 'wrench', label: 'Wrench', icon: faWrench },
  { value: 'folder', label: 'Folder', icon: faFolder },
  { value: 'book', label: 'Book', icon: faBook },
];

const COLOR_OPTIONS = [
  { value: 'blue', label: 'Blue', bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-300' },
  { value: 'green', label: 'Green', bg: 'bg-green-50', text: 'text-green-600', border: 'border-green-300' },
  { value: 'yellow', label: 'Yellow', bg: 'bg-yellow-50', text: 'text-yellow-600', border: 'border-yellow-300' },
  { value: 'purple', label: 'Purple', bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-300' },
  { value: 'red', label: 'Red', bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-300' },
  { value: 'indigo', label: 'Indigo', bg: 'bg-indigo-50', text: 'text-indigo-600', border: 'border-indigo-300' },
];

export default function AdminHelpCenterPage() {
  const [activeTab, setActiveTab] = useState('topics'); // topics | articles | workflow | faqs
  const [topics, setTopics] = useState([]);
  const [articles, setArticles] = useState([]);
  const [workflowSteps, setWorkflowSteps] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  // Modal states
  const [editingTopic, setEditingTopic] = useState(null);
  const [editingArticle, setEditingArticle] = useState(null);
  const [editingStep, setEditingStep] = useState(null);
  const [editingFaq, setEditingFaq] = useState(null);
  const [expandedTopic, setExpandedTopic] = useState(null);

  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [topicsRes, workflowRes, faqsRes, statsRes] = await Promise.all([
        fetch(`${API_URL}/api/admin/help/topics`),
        fetch(`${API_URL}/api/admin/help/workflow`),
        fetch(`${API_URL}/api/admin/help/faqs`),
        fetch(`${API_URL}/api/admin/help/stats`),
      ]);
      if (topicsRes.ok) setTopics(await topicsRes.json());
      if (workflowRes.ok) setWorkflowSteps(await workflowRes.json());
      if (faqsRes.ok) setFaqs(await faqsRes.json());
      if (statsRes.ok) setStats(await statsRes.json());
    } catch (err) {
      console.error(err);
      showToast('Failed to load help center data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  // ==================== TOPIC CRUD ====================
  const saveTopic = async (topicData) => {
    const isNew = !topicData.id;
    const url = isNew
      ? `${API_URL}/api/admin/help/topics`
      : `${API_URL}/api/admin/help/topics/${topicData.id}`;
    const method = isNew ? 'POST' : 'PUT';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(topicData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to save topic');
    await fetchAll();
    setEditingTopic(null);
    showToast(isNew ? 'Topic created' : 'Topic updated');
  };

  const deleteTopic = async (id) => {
    if (!confirm('Delete this topic and all its articles?')) return;
    const res = await fetch(`${API_URL}/api/admin/help/topics/${id}`, { method: 'DELETE' });
    if (res.ok) {
      await fetchAll();
      showToast('Topic deleted');
    }
  };

  // ==================== ARTICLE CRUD ====================
  const saveArticle = async (articleData) => {
    const isNew = !articleData.id;
    const url = isNew
      ? `${API_URL}/api/admin/help/articles`
      : `${API_URL}/api/admin/help/articles/${articleData.id}`;
    const method = isNew ? 'POST' : 'PUT';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(articleData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to save article');
    await fetchAll();
    setEditingArticle(null);
    showToast(isNew ? 'Article created' : 'Article updated');
  };

  const deleteArticle = async (id) => {
    if (!confirm('Delete this article?')) return;
    const res = await fetch(`${API_URL}/api/admin/help/articles/${id}`, { method: 'DELETE' });
    if (res.ok) {
      await fetchAll();
      showToast('Article deleted');
    }
  };

  // ==================== WORKFLOW CRUD ====================
  const saveStep = async (stepData) => {
    const isNew = !stepData.id;
    const url = isNew
      ? `${API_URL}/api/admin/help/workflow`
      : `${API_URL}/api/admin/help/workflow/${stepData.id}`;
    const method = isNew ? 'POST' : 'PUT';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(stepData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to save step');
    await fetchAll();
    setEditingStep(null);
    showToast(isNew ? 'Step created' : 'Step updated');
  };

  const deleteStep = async (id) => {
    if (!confirm('Delete this workflow step?')) return;
    const res = await fetch(`${API_URL}/api/admin/help/workflow/${id}`, { method: 'DELETE' });
    if (res.ok) {
      await fetchAll();
      showToast('Step deleted');
    }
  };

  // ==================== FAQ CRUD ====================
  const saveFaq = async (faqData) => {
    const isNew = !faqData.id;
    const url = isNew
      ? `${API_URL}/api/admin/help/faqs`
      : `${API_URL}/api/admin/help/faqs/${faqData.id}`;
    const method = isNew ? 'POST' : 'PUT';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(faqData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to save FAQ');
    await fetchAll();
    setEditingFaq(null);
    showToast(isNew ? 'FAQ created' : 'FAQ updated');
  };

  const deleteFaq = async (id) => {
    if (!confirm('Delete this FAQ?')) return;
    const res = await fetch(`${API_URL}/api/admin/help/faqs/${id}`, { method: 'DELETE' });
    if (res.ok) {
      await fetchAll();
      showToast('FAQ deleted');
    }
  };

  const tabs = [
    { id: 'topics', label: 'Topics', icon: faLayerGroup },
    { id: 'articles', label: 'Articles', icon: faFileAlt },
    { id: 'workflow', label: 'How It Works', icon: faListOl },
    { id: 'faqs', label: 'FAQs', icon: faQuestionCircle },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Help Center Management</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage help topics, articles, workflow steps, and FAQs shown to users.
          </p>
        </div>
        <a
          href="/help"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
        >
          <FontAwesomeIcon icon={faEye} className="w-4 h-4" />
          View Public Help Center
        </a>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Topics" value={stats.total_topics} color="blue" />
          <StatCard label="Active Topics" value={stats.active_topics} color="green" />
          <StatCard label="Published Articles" value={stats.published_articles} color="purple" />
          <StatCard label="Total Views" value={(stats.total_views || 0).toLocaleString()} color="yellow" />
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
        <div className="border-b border-slate-200 px-6">
          <div className="flex gap-1 -mb-px overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-700'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                <FontAwesomeIcon icon={tab.icon} className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="text-center py-12 text-slate-400">Loading...</div>
          ) : (
            <>
              {activeTab === 'topics' && (
                <TopicsTab
                  topics={topics}
                  expandedTopic={expandedTopic}
                  setExpandedTopic={setExpandedTopic}
                  onNew={() => setEditingTopic({ title: '', icon_type: 'document', color_theme: 'blue' })}
                  onEdit={setEditingTopic}
                  onDelete={deleteTopic}
                  onNewArticle={(topicId) => setEditingArticle({ topic_id: topicId, title: '' })}
                  onEditArticle={setEditingArticle}
                  onDeleteArticle={deleteArticle}
                  articles={articles}
                  API_URL={API_URL}
                />
              )}

              {activeTab === 'workflow' && (
                <WorkflowTab
                  steps={workflowSteps}
                  onNew={() => setEditingStep({ step_number: workflowSteps.length + 1, title: '', icon_type: 'document', color_theme: 'blue' })}
                  onEdit={setEditingStep}
                  onDelete={deleteStep}
                />
              )}

              {activeTab === 'faqs' && (
                <FaqsTab
                  faqs={faqs}
                  onNew={() => setEditingFaq({ question: '', answer: '' })}
                  onEdit={setEditingFaq}
                  onDelete={deleteFaq}
                />
              )}
            </>
          )}
        </div>
      </div>

      {/* Modals */}
      {editingTopic && (
        <TopicModal
          topic={editingTopic}
          onClose={() => setEditingTopic(null)}
          onSave={saveTopic}
        />
      )}
      {editingArticle && (
        <ArticleModal
          article={editingArticle}
          topics={topics}
          onClose={() => setEditingArticle(null)}
          onSave={saveArticle}
        />
      )}
      {editingStep && (
        <WorkflowModal
          step={editingStep}
          onClose={() => setEditingStep(null)}
          onSave={saveStep}
        />
      )}
      {editingFaq && (
        <FaqModal
          faq={editingFaq}
          onClose={() => setEditingFaq(null)}
          onSave={saveFaq}
        />
      )}

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 px-6 py-3 rounded-xl shadow-lg text-white text-sm font-semibold ${
          toast.type === 'error' ? 'bg-red-600' : 'bg-emerald-600'
        }`}>
          {toast.message}
        </div>
      )}
    </div>
  );
}

// ==================== SUB COMPONENTS ====================

function StatCard({ label, value, color }) {
  const colors = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-emerald-50 text-emerald-600',
    purple: 'bg-purple-50 text-purple-600',
    yellow: 'bg-amber-50 text-amber-600',
  };
  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
      <p className="text-2xl font-bold text-slate-900">{value}</p>
      <p className="text-xs text-slate-500 mt-1">{label}</p>
    </div>
  );
}

function TopicsTab({ topics, expandedTopic, setExpandedTopic, onNew, onEdit, onDelete, onNewArticle, onEditArticle, onDeleteArticle, API_URL }) {
  const [topicArticles, setTopicArticles] = useState({});

  const loadArticles = async (topicId) => {
    if (topicArticles[topicId]) return;
    const res = await fetch(`${API_URL}/api/admin/help/topics/${topicId}/articles`);
    if (res.ok) {
      const data = await res.json();
      setTopicArticles(prev => ({ ...prev, [topicId]: data }));
    }
  };

  const toggleExpand = (topicId) => {
    if (expandedTopic === topicId) {
      setExpandedTopic(null);
    } else {
      setExpandedTopic(topicId);
      loadArticles(topicId);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-bold text-slate-900">Help Topics</h2>
        <button
          onClick={onNew}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition"
        >
          <FontAwesomeIcon icon={faPlus} className="w-4 h-4" />
          New Topic
        </button>
      </div>

      {topics.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          <FontAwesomeIcon icon={faLayerGroup} className="w-12 h-12 mb-3 opacity-30" />
          <p>No topics yet. Create your first help topic.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {topics.map((topic) => {
            const color = COLOR_OPTIONS.find(c => c.value === topic.color_theme) || COLOR_OPTIONS[0];
            const icon = ICON_OPTIONS.find(i => i.value === topic.icon_type) || ICON_OPTIONS[0];
            const isExpanded = expandedTopic === topic.id;
            const articles = topicArticles[topic.id] || [];

            return (
              <div key={topic.id} className="border border-slate-200 rounded-xl overflow-hidden">
                <div className="flex items-center gap-3 p-4 bg-white hover:bg-slate-50 transition">
                  <button onClick={() => toggleExpand(topic.id)} className="text-slate-400">
                    <FontAwesomeIcon icon={isExpanded ? faChevronDown : faChevronRight} className="w-4 h-4" />
                  </button>
                  <div className={`w-10 h-10 rounded-xl ${color.bg} flex items-center justify-center`}>
                    <FontAwesomeIcon icon={icon.icon} className={`w-5 h-5 ${color.text}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-slate-900 truncate">{topic.title}</h3>
                      {!topic.is_active && (
                        <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full">Inactive</span>
                      )}
                      {topic.is_featured && (
                        <FontAwesomeIcon icon={faStar} className="w-3.5 h-3.5 text-amber-500" />
                      )}
                    </div>
                    <p className="text-xs text-slate-500 truncate">{topic.description || 'No description'}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onNewArticle(topic.id)}
                      className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                      title="Add article"
                    >
                      <FontAwesomeIcon icon={faPlus} className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onEdit(topic)}
                      className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                      title="Edit topic"
                    >
                      <FontAwesomeIcon icon={faEdit} className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDelete(topic.id)}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                      title="Delete topic"
                    >
                      <FontAwesomeIcon icon={faTrash} className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-slate-100 bg-slate-50 p-4">
                    {articles.length === 0 ? (
                      <p className="text-sm text-slate-400 text-center py-4">No articles in this topic.</p>
                    ) : (
                      <div className="space-y-2">
                        {articles.map((article) => (
                          <div key={article.id} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-200">
                            <FontAwesomeIcon icon={faFileAlt} className="w-4 h-4 text-slate-400" />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-semibold text-slate-800 truncate">{article.title}</span>
                                {!article.is_published && (
                                  <span className="text-xs px-2 py-0.5 bg-amber-50 text-amber-600 rounded-full">Draft</span>
                                )}
                              </div>
                              <p className="text-xs text-slate-500 truncate">{article.excerpt || 'No excerpt'}</p>
                            </div>
                            <button
                              onClick={() => onEditArticle(article)}
                              className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            >
                              <FontAwesomeIcon icon={faEdit} className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => onDeleteArticle(article.id)}
                              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                            >
                              <FontAwesomeIcon icon={faTrash} className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function WorkflowTab({ steps, onNew, onEdit, onDelete }) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-bold text-slate-900">How It Works Steps</h2>
        <button
          onClick={onNew}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition"
        >
          <FontAwesomeIcon icon={faPlus} className="w-4 h-4" />
          Add Step
        </button>
      </div>

      {steps.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          <FontAwesomeIcon icon={faListOl} className="w-12 h-12 mb-3 opacity-30" />
          <p>No workflow steps yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {steps.map((step) => {
            const color = COLOR_OPTIONS.find(c => c.value === step.color_theme) || COLOR_OPTIONS[0];
            const icon = ICON_OPTIONS.find(i => i.value === step.icon_type) || ICON_OPTIONS[0];
            return (
              <div key={step.id} className="flex items-center gap-4 p-4 bg-white border border-slate-200 rounded-xl">
                <div className={`w-10 h-10 rounded-full border-2 ${color.border} ${color.text} flex items-center justify-center font-bold text-sm`}>
                  {step.step_number}
                </div>
                <div className={`w-10 h-10 rounded-xl ${color.bg} flex items-center justify-center`}>
                  <FontAwesomeIcon icon={icon.icon} className={`w-5 h-5 ${color.text}`} />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-slate-900">{step.title}</h3>
                  <p className="text-xs text-slate-500">{step.description}</p>
                </div>
                <button onClick={() => onEdit(step)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition">
                  <FontAwesomeIcon icon={faEdit} className="w-4 h-4" />
                </button>
                <button onClick={() => onDelete(step.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition">
                  <FontAwesomeIcon icon={faTrash} className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function FaqsTab({ faqs, onNew, onEdit, onDelete }) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-bold text-slate-900">Frequently Asked Questions</h2>
        <button
          onClick={onNew}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition"
        >
          <FontAwesomeIcon icon={faPlus} className="w-4 h-4" />
          Add FAQ
        </button>
      </div>

      {faqs.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          <FontAwesomeIcon icon={faQuestionCircle} className="w-12 h-12 mb-3 opacity-30" />
          <p>No FAQs yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {faqs.map((faq) => (
            <div key={faq.id} className="p-4 bg-white border border-slate-200 rounded-xl">
              <div className="flex items-start gap-3">
                <FontAwesomeIcon icon={faQuestionCircle} className="w-5 h-5 text-blue-500 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-900">{faq.question}</h3>
                  <p className="text-sm text-slate-500 mt-1 line-clamp-2">{faq.answer}</p>
                  {faq.category && (
                    <span className="inline-block mt-2 text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full">
                      {faq.category}
                    </span>
                  )}
                </div>
                <button onClick={() => onEdit(faq)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition">
                  <FontAwesomeIcon icon={faEdit} className="w-4 h-4" />
                </button>
                <button onClick={() => onDelete(faq.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition">
                  <FontAwesomeIcon icon={faTrash} className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ==================== MODALS ====================

function Modal({ title, onClose, onSave, children, saving }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h2 className="text-lg font-bold text-slate-900">{title}</h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg transition">
            <FontAwesomeIcon icon={faTimes} className="w-4 h-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6">{children}</div>
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-200 bg-slate-50">
          <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition">
            Cancel
          </button>
          <button
            onClick={onSave}
            disabled={saving}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition disabled:opacity-50"
          >
            <FontAwesomeIcon icon={faSave} className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}

function TopicModal({ topic, onClose, onSave }) {
  const [form, setForm] = useState({
    id: topic.id,
    title: topic.title || '',
    slug: topic.slug || '',
    description: topic.description || '',
    icon_type: topic.icon_type || 'document',
    color_theme: topic.color_theme || 'blue',
    content: topic.content || '',
    display_order: topic.display_order || 0,
    is_active: topic.is_active !== undefined ? topic.is_active : true,
    is_featured: topic.is_featured || false,
    meta_title: topic.meta_title || '',
    meta_description: topic.meta_description || '',
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!form.title.trim()) return alert('Title is required');
    setSaving(true);
    try {
      await onSave(form);
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title={topic.id ? 'Edit Topic' : 'Create Topic'} onClose={onClose} onSave={handleSave} saving={saving}>
      <div className="space-y-4">
        <Field label="Title *">
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
            placeholder="e.g., Getting Started"
          />
        </Field>

        <Field label="Slug (URL)">
          <input
            type="text"
            value={form.slug}
            onChange={(e) => setForm({ ...form, slug: e.target.value })}
            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
            placeholder="auto-generated from title"
          />
        </Field>

        <Field label="Description">
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={2}
            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
            placeholder="Short description of this topic"
          />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Icon">
            <div className="grid grid-cols-4 gap-2">
              {ICON_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setForm({ ...form, icon_type: opt.value })}
                  className={`p-3 rounded-xl border-2 transition flex items-center justify-center ${
                    form.icon_type === opt.value ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <FontAwesomeIcon icon={opt.icon} className={`w-4 h-4 ${form.icon_type === opt.value ? 'text-blue-600' : 'text-slate-500'}`} />
                </button>
              ))}
            </div>
          </Field>

          <Field label="Color Theme">
            <div className="grid grid-cols-3 gap-2">
              {COLOR_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setForm({ ...form, color_theme: opt.value })}
                  className={`px-3 py-2 rounded-xl border-2 text-xs font-semibold transition ${
                    form.color_theme === opt.value ? `${opt.border} ${opt.bg} ${opt.text}` : 'border-slate-200 text-slate-500 hover:border-slate-300'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </Field>
        </div>

        <Field label="Content (Markdown/HTML)">
          <textarea
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            rows={6}
            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
            placeholder="Detailed content for this topic..."
          />
        </Field>

        <div className="grid grid-cols-3 gap-4">
          <Field label="Display Order">
            <input
              type="number"
              value={form.display_order}
              onChange={(e) => setForm({ ...form, display_order: parseInt(e.target.value) || 0 })}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
            />
          </Field>
          <Field label="Active">
            <label className="flex items-center gap-2 mt-2">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                className="w-4 h-4 rounded"
              />
              <span className="text-sm text-slate-600">Visible to users</span>
            </label>
          </Field>
          <Field label="Featured">
            <label className="flex items-center gap-2 mt-2">
              <input
                type="checkbox"
                checked={form.is_featured}
                onChange={(e) => setForm({ ...form, is_featured: e.target.checked })}
                className="w-4 h-4 rounded"
              />
              <span className="text-sm text-slate-600">Show in popular</span>
            </label>
          </Field>
        </div>
      </div>
    </Modal>
  );
}

function ArticleModal({ article, topics, onClose, onSave }) {
  const [form, setForm] = useState({
    id: article.id,
    topic_id: article.topic_id || '',
    title: article.title || '',
    slug: article.slug || '',
    excerpt: article.excerpt || '',
    content: article.content || '',
    reading_time: article.reading_time || 5,
    display_order: article.display_order || 0,
    is_published: article.is_published !== undefined ? article.is_published : true,
    is_featured: article.is_featured || false,
    meta_title: article.meta_title || '',
    meta_description: article.meta_description || '',
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!form.title.trim()) return alert('Title is required');
    if (!form.topic_id) return alert('Topic is required');
    setSaving(true);
    try {
      await onSave(form);
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title={article.id ? 'Edit Article' : 'Create Article'} onClose={onClose} onSave={handleSave} saving={saving}>
      <div className="space-y-4">
        <Field label="Topic *">
          <select
            value={form.topic_id}
            onChange={(e) => setForm({ ...form, topic_id: parseInt(e.target.value) })}
            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
          >
            <option value="">Select a topic...</option>
            {topics.map((t) => (
              <option key={t.id} value={t.id}>{t.title}</option>
            ))}
          </select>
        </Field>

        <Field label="Title *">
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
            placeholder="e.g., How to Submit an Abstract"
          />
        </Field>

        <Field label="Slug (URL)">
          <input
            type="text"
            value={form.slug}
            onChange={(e) => setForm({ ...form, slug: e.target.value })}
            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
            placeholder="auto-generated from title"
          />
        </Field>

        <Field label="Excerpt (short summary)">
          <textarea
            value={form.excerpt}
            onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
            rows={2}
            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
            placeholder="Brief summary shown in listings"
          />
        </Field>

        <Field label="Content (Markdown/HTML)">
          <textarea
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            rows={10}
            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-mono"
            placeholder="Full article content..."
          />
        </Field>

        <div className="grid grid-cols-3 gap-4">
          <Field label="Reading Time (min)">
            <input
              type="number"
              value={form.reading_time}
              onChange={(e) => setForm({ ...form, reading_time: parseInt(e.target.value) || 5 })}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
            />
          </Field>
          <Field label="Display Order">
            <input
              type="number"
              value={form.display_order}
              onChange={(e) => setForm({ ...form, display_order: parseInt(e.target.value) || 0 })}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
            />
          </Field>
          <Field label="Published">
            <label className="flex items-center gap-2 mt-2">
              <input
                type="checkbox"
                checked={form.is_published}
                onChange={(e) => setForm({ ...form, is_published: e.target.checked })}
                className="w-4 h-4 rounded"
              />
              <span className="text-sm text-slate-600">Visible</span>
            </label>
          </Field>
        </div>

        <Field label="Featured">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.is_featured}
              onChange={(e) => setForm({ ...form, is_featured: e.target.checked })}
              className="w-4 h-4 rounded"
            />
            <span className="text-sm text-slate-600">Show in Popular Articles</span>
          </label>
        </Field>
      </div>
    </Modal>
  );
}

function WorkflowModal({ step, onClose, onSave }) {
  const [form, setForm] = useState({
    id: step.id,
    step_number: step.step_number || 1,
    title: step.title || '',
    description: step.description || '',
    icon_type: step.icon_type || 'document',
    color_theme: step.color_theme || 'blue',
    display_order: step.display_order || 0,
    is_active: step.is_active !== undefined ? step.is_active : true,
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!form.title.trim()) return alert('Title is required');
    setSaving(true);
    try {
      await onSave(form);
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title={step.id ? 'Edit Workflow Step' : 'Add Workflow Step'} onClose={onClose} onSave={handleSave} saving={saving}>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Step Number">
            <input
              type="number"
              value={form.step_number}
              onChange={(e) => setForm({ ...form, step_number: parseInt(e.target.value) || 1 })}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
            />
          </Field>
          <Field label="Display Order">
            <input
              type="number"
              value={form.display_order}
              onChange={(e) => setForm({ ...form, display_order: parseInt(e.target.value) || 0 })}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
            />
          </Field>
        </div>

        <Field label="Title *">
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
            placeholder="e.g., Create Account"
          />
        </Field>

        <Field label="Description">
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={2}
            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
            placeholder="Short description of this step"
          />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Icon">
            <div className="grid grid-cols-4 gap-2">
              {ICON_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setForm({ ...form, icon_type: opt.value })}
                  className={`p-3 rounded-xl border-2 transition ${
                    form.icon_type === opt.value ? 'border-blue-500 bg-blue-50' : 'border-slate-200'
                  }`}
                >
                  <FontAwesomeIcon icon={opt.icon} className={`w-4 h-4 ${form.icon_type === opt.value ? 'text-blue-600' : 'text-slate-500'}`} />
                </button>
              ))}
            </div>
          </Field>
          <Field label="Color">
            <div className="grid grid-cols-3 gap-2">
              {COLOR_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setForm({ ...form, color_theme: opt.value })}
                  className={`px-3 py-2 rounded-xl border-2 text-xs font-semibold transition ${
                    form.color_theme === opt.value ? `${opt.border} ${opt.bg} ${opt.text}` : 'border-slate-200 text-slate-500'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </Field>
        </div>

        <Field label="Active">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
              className="w-4 h-4 rounded"
            />
            <span className="text-sm text-slate-600">Show this step</span>
          </label>
        </Field>
      </div>
    </Modal>
  );
}

function FaqModal({ faq, onClose, onSave }) {
  const [form, setForm] = useState({
    id: faq.id,
    question: faq.question || '',
    answer: faq.answer || '',
    category: faq.category || '',
    display_order: faq.display_order || 0,
    is_active: faq.is_active !== undefined ? faq.is_active : true,
    is_featured: faq.is_featured || false,
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!form.question.trim()) return alert('Question is required');
    setSaving(true);
    try {
      await onSave(form);
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title={faq.id ? 'Edit FAQ' : 'Add FAQ'} onClose={onClose} onSave={handleSave} saving={saving}>
      <div className="space-y-4">
        <Field label="Question *">
          <input
            type="text"
            value={form.question}
            onChange={(e) => setForm({ ...form, question: e.target.value })}
            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
            placeholder="e.g., How do I submit an abstract?"
          />
        </Field>

        <Field label="Answer">
          <textarea
            value={form.answer}
            onChange={(e) => setForm({ ...form, answer: e.target.value })}
            rows={5}
            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
            placeholder="Detailed answer..."
          />
        </Field>

        <div className="grid grid-cols-3 gap-4">
          <Field label="Category">
            <input
              type="text"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
              placeholder="e.g., submission"
            />
          </Field>
          <Field label="Display Order">
            <input
              type="number"
              value={form.display_order}
              onChange={(e) => setForm({ ...form, display_order: parseInt(e.target.value) || 0 })}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
            />
          </Field>
          <Field label="Active">
            <label className="flex items-center gap-2 mt-2">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                className="w-4 h-4 rounded"
              />
              <span className="text-sm text-slate-600">Show</span>
            </label>
          </Field>
        </div>

        <Field label="Featured">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.is_featured}
              onChange={(e) => setForm({ ...form, is_featured: e.target.checked })}
              className="w-4 h-4 rounded"
            />
            <span className="text-sm text-slate-600">Show in featured FAQs</span>
          </label>
        </Field>
      </div>
    </Modal>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-600 mb-1.5">{label}</label>
      {children}
    </div>
  );
}