"use client";

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilter, faSearch, faSync } from '@fortawesome/free-solid-svg-icons';

const API_URL = (process.env.NEXT_PUBLIC_API_URL).replace(/\/+$/, '');

// Static option lists
const PAPER_CATEGORIES = [
  'Completed Extension Project Paper',
  'Ongoing Extension Project Paper',
];

const THEMATIC_AREAS = [
  'Food Production, Agriculture, Fisheries, and Natural Resource Systems',
  'Health, Nutrition, Wellness, and Community Care',
  'Education, Literacy, Skills Development, and Lifelong Learning',
  'Livelihood, Entrepreneurship, Cooperatives, MSMEs, and Local Economic Development',
  'Environment, Climate Action, Disaster Risk Reduction, and Community Resilience',
];

export default function EmailReviewPage() {
    const [currentEvaluatorId, setCurrentEvaluatorId] = useState(null); 

    const [submissions, setSubmissions] = useState([]);
    const [selectedSubmission, setSelectedSubmission] = useState(null);
    const [loading, setLoading] = useState(true);
    const [checking, setChecking] = useState(false);
    const [statusFilter, setStatusFilter] = useState('all');
    const [categoryFilter, setCategoryFilter] = useState('all');           // 🔧 NEW
    const [thematicAreaFilter, setThematicAreaFilter] = useState('all');   // 🔧 NEW
    const [searchTerm, setSearchTerm] = useState('');                      // 🔧 NEW
    const [toast, setToast] = useState(null);
    const [syncing, setSyncing] = useState(false);
    
    // Voting and Discussion States
    const [votes, setVotes] = useState({ votes: [], evaluation_status: 'pending' });
    const [discussions, setDiscussions] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [voteNotes, setVoteNotes] = useState('');
    
    // Reassign Modal States
    const [showReassignModal, setShowReassignModal] = useState(false);
    const [newThematicArea, setNewThematicArea] = useState('');
    const [isReassignLoading, setIsReassignLoading] = useState(false);

    // Extracted Data State
    const [extractedData, setExtractedData] = useState(null);
    // 🔧 NEW: cache of extracted data keyed by submission id — powers the filters
    const [extractedCache, setExtractedCache] = useState({});

    useEffect(() => {
        const userData = localStorage.getItem('pemnet_user');
        if (userData) {
            try {
                const user = JSON.parse(userData);
                setCurrentEvaluatorId(user.id || 3);
            } catch (e) {
                setCurrentEvaluatorId(3);
            }
        } else {
            setCurrentEvaluatorId(3);
        }
        
        fetchSubmissions();
    }, [statusFilter]);

    const fetchSubmissions = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/api/email-submissions?status=${statusFilter}`);
            if (res.ok) {
                const data = await res.json();
                setSubmissions(data);

                // 🔧 NEW: pre-load extracted data for all submissions so filters work
                await prefetchExtractedData(data);

                // If there's a selected submission, update it
                if (selectedSubmission) {
                    const updated = data.find(s => s.id === selectedSubmission.id);
                    if (updated) setSelectedSubmission(updated);
                }
            }
        } catch (error) {
            console.error('Error fetching submissions:', error);
            showToast('Failed to fetch submissions', 'error');
        } finally {
            setLoading(false);
        }
    };

    // 🔧 NEW: fetch extracted-data for every submission (parallel, best-effort)
    const prefetchExtractedData = async (list) => {
        if (!Array.isArray(list) || list.length === 0) return;

        const results = await Promise.all(
            list.map(async (sub) => {
                // Skip if we already have it cached
                if (extractedCache[sub.id]) return [sub.id, extractedCache[sub.id]];
                try {
                    const res = await fetch(`${API_URL}/api/email-submissions/${sub.id}/extracted-data`);
                    if (!res.ok) return [sub.id, null];
                    const data = await res.json();
                    return [sub.id, data];
                } catch {
                    return [sub.id, null];
                }
            })
        );

        const nextCache = { ...extractedCache };
        results.forEach(([id, data]) => {
            if (data) nextCache[id] = data;
        });
        setExtractedCache(nextCache);
    };

    const fetchVotesAndDiscussions = async (submissionId) => {
        const votesRes = await fetch(`${API_URL}/api/submissions/${submissionId}/evaluate`);
        const votesData = await votesRes.json();
        setVotes({
            ...votesData,
            evaluation_status: votesData.evaluation_status || 'pending'
        });

        const discRes = await fetch(`${API_URL}/api/submissions/${submissionId}/discussions`);
        const discData = await discRes.json();
        setDiscussions(Array.isArray(discData) ? discData : []);
    };

    const fetchExtractedData = async (emailSubmissionId) => {
        const res = await fetch(`${API_URL}/api/email-submissions/${emailSubmissionId}/extracted-data`);
        if (res.ok) {
            const data = await res.json();
            setExtractedData(data);
            // 🔧 NEW: also stash in cache
            setExtractedCache(prev => ({ ...prev, [emailSubmissionId]: data }));
            return data;
        }
        return null;
    };

    const selectSubmission = async (sub) => {
        setSelectedSubmission(sub);
        setExtractedData(null);
        fetchVotesAndDiscussions(sub.id);
        await fetchExtractedData(sub.id);
    };
    
    const syncAllEmails = async () => {
        setSyncing(true);
        try {
            const res = await fetch(`${API_URL}/api/email-submissions/sync-all`, { method: 'POST' });
            if (res.ok) {
                const data = await res.json();
                showToast(`Synced ${data.processed} new email submissions`, 'success');
                setExtractedCache({}); // 🔧 clear cache to refetch fresh data
                fetchSubmissions();
            }
        } catch (error) {
            console.error('Error syncing emails:', error);
            showToast('Failed to sync emails', 'error');
        } finally {
            setSyncing(false);
        }
    };

    const checkEmails = async () => {
        setChecking(true);
        try {
            const res = await fetch(`${API_URL}/api/email-submissions/check`, { method: 'POST' });
            if (res.ok) {
                const data = await res.json();
                showToast(`Found ${data.processed} new email submissions`, 'success');
                setExtractedCache({});
                fetchSubmissions();
            }
        } catch (error) {
            console.error('Error checking emails:', error);
            showToast('Failed to check emails', 'error');
        } finally {
            setChecking(false);
        }
    };

    const showToast = (message, type) => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 5000);
    };

    // --- GETTERS FOR SUBMISSION INFORMATION ---
    const getTitle = () => extractedData?.title || selectedSubmission?.subject;
    const getAuthor = () => extractedData?.project_leader || selectedSubmission?.sender_name;
    const getSuc = () => extractedData?.sucs || selectedSubmission?.sender_name;
    const getThematicArea = () => extractedData?.thematic_area || 'Not specified';
    const getPaperCategory = () => extractedData?.paper_category || 'Not specified';
    const getCorrespondingAuthorName = () => extractedData?.corresponding_author_name || 'Not specified';
    const getCorrespondingAuthorEmail = () => extractedData?.corresponding_author_email || 'Not specified';
    const getCorrespondingAuthorPosition = () => extractedData?.corresponding_author_position || 'Not specified';
    const getTheme = () => extractedData?.theme || 'Not specified';

    const handleVote = async (vote_status) => {
        if (!selectedSubmission) return;
        try {
            const res = await fetch(`${API_URL}/api/submissions/${selectedSubmission.id}/evaluate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    evaluator_id: currentEvaluatorId,
                    vote_status: vote_status,
                    vote_notes: voteNotes
                }),
            });
            if (res.ok) {
                const data = await res.json();
                setVotes({ ...data, evaluation_status: data.evaluation_status || 'pending' });
                showToast(`Voted: ${vote_status.replace('_', ' ')}`, 'success');
                setVoteNotes('');
                if (data.evaluation_status !== 'pending') fetchSubmissions();
            } else {
                const error = await res.json();
                showToast(error.detail || 'Failed to vote', 'error');
            }
        } catch (error) {
            showToast('Failed to vote', 'error');
        }
    };

    const postMessage = async () => {
        if (!newMessage.trim() || !selectedSubmission) return;
        try {
            const res = await fetch(`${API_URL}/api/submissions/${selectedSubmission.id}/discussions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ evaluator_id: currentEvaluatorId, message: newMessage })
            });
            if (res.ok) {
                const data = await res.json();
                setDiscussions([...discussions, data]);
                setNewMessage('');
            }
        } catch (error) {
            showToast('Failed to send message', 'error');
        }
    };

    const openReassignModal = () => {
        setNewThematicArea(getThematicArea());
        setShowReassignModal(true);
    };

    const handleReassignSubmit = async () => {
        if (!selectedSubmission || !newThematicArea) return;
        setIsReassignLoading(true);

        try {
            const res = await fetch(`${API_URL}/api/submissions/${selectedSubmission.id}/evaluate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    evaluator_id: currentEvaluatorId,
                    vote_status: 'reassign',
                    vote_notes: '',
                    vote_reassign_to: newThematicArea
                }),
            });
            if (res.ok) {
                const data = await res.json();
                setVotes({ ...data, evaluation_status: data.evaluation_status || 'pending' });
                showToast('Successfully reassigned!', 'success');
                setShowReassignModal(false);
                if (data.evaluation_status !== 'pending') fetchSubmissions();
            } else {
                const error = await res.json();
                showToast(error.detail || 'Failed to reassign', 'error');
            }
        } catch (error) {
            showToast('Failed to reassign', 'error');
        } finally {
            setIsReassignLoading(false);
        }
    };

    const getStatusColor = (status) => {
        const safeStatus = status || 'pending';
        switch (safeStatus) {
            case 'accepted': return 'bg-emerald-100 text-emerald-700';
            case 'non_competitive': return 'bg-red-100 text-red-700';
            case 'downgraded': return 'bg-yellow-100 text-yellow-700';
            case 'reassigned': return 'bg-blue-100 text-blue-700';
            case 'pending': return 'bg-yellow-100 text-yellow-700';
            default: return 'bg-slate-100 text-slate-700';
        }
    };

    // 🔧 NEW: apply all filters client-side
    const filteredSubmissions = useMemo(() => {
        return submissions.filter((sub) => {
            const extracted = extractedCache[sub.id] || {};

            // Status filter — server already filters, but re-check client-side
            if (statusFilter !== 'all') {
                const s = (sub.evaluation_status || sub.status || '').toLowerCase();
                if (s !== statusFilter.toLowerCase()) return false;
            }

            // Category filter
            if (categoryFilter !== 'all') {
                const cat = (extracted.paper_category || sub.paper_category || '').toString();
                if (!cat.toLowerCase().includes(categoryFilter.toLowerCase())) return false;
            }

            // Thematic area filter
            if (thematicAreaFilter !== 'all') {
                const area = (extracted.thematic_area || sub.thematic_area || '').toString();
                if (area !== thematicAreaFilter) return false;
            }

            // Search — subject, sender, title, project leader
            if (searchTerm.trim()) {
                const q = searchTerm.toLowerCase();
                const haystack = [
                    sub.subject,
                    sub.sender_name,
                    sub.sender_email,
                    sub.project_leader_name,
                    extracted.title,
                    extracted.project_leader,
                ]
                    .filter(Boolean)
                    .join(' ')
                    .toLowerCase();
                if (!haystack.includes(q)) return false;
            }

            return true;
        });
    }, [submissions, extractedCache, statusFilter, categoryFilter, thematicAreaFilter, searchTerm]);

    const resetFilters = () => {
        setStatusFilter('all');
        setCategoryFilter('all');
        setThematicAreaFilter('all');
        setSearchTerm('');
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
            </div>
        );
    }

    const thematicAreas = THEMATIC_AREAS; // alias for the reassign modal

    return (
        <div className="min-h-screen bg-slate-50">
            {toast && (
                <div className="fixed top-4 right-4 z-50 animate-slide-in">
                    <div className={`relative w-96 p-4 rounded-xl border shadow-lg ${toast.type === 'success' ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}>
                        <div className="flex items-start gap-3">
                            <div className={`shrink-0 mt-0.5 ${toast.type === 'success' ? 'text-emerald-700' : 'text-red-700'}`}>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div className={`flex-1 ${toast.type === 'success' ? 'text-emerald-700' : 'text-red-700'}`}>
                                <p className="font-semibold text-sm">{toast.type === 'success' ? 'Success!' : 'Error!'}</p>
                                <p className="text-sm">{toast.message}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showReassignModal && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowReassignModal(false)}></div>
                    <div className="relative min-h-full flex items-center justify-center p-4">
                        <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
                            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
                                <h3 className="text-lg font-bold text-slate-900">Reassign Thematic Area</h3>
                                <button onClick={() => setShowReassignModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
                            </div>
                            <div className="p-6">
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Select New Thematic Area</label>
                                <select
                                    value={newThematicArea}
                                    onChange={(e) => setNewThematicArea(e.target.value)}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none"
                                >
                                    <option value="">-- Select --</option>
                                    {thematicAreas.map((area) => (
                                        <option key={area} value={area}>{area}</option>
                                    ))}
                                </select>

                                <div className="mt-6 flex gap-3">
                                    <button
                                        onClick={() => setShowReassignModal(false)}
                                        className="flex-1 px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200 transition"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleReassignSubmit}
                                        disabled={!newThematicArea || isReassignLoading}
                                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition disabled:opacity-50"
                                    >
                                        {isReassignLoading ? 'Submitting...' : 'Reassign'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="bg-white border-b border-slate-200 px-8 py-6">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Email Submissions</h1>
                        <p className="text-slate-500 text-sm mt-1">Review, vote, and collaborate on email submissions.</p>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={checkEmails} disabled={checking} className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 flex items-center gap-2">
                            {checking ? <><div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>Checking...</> : <><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9" /></svg>Check Inbox</>}
                        </button>
                        <button onClick={syncAllEmails} disabled={syncing} className="px-4 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition disabled:opacity-50 flex items-center gap-2">
                            {syncing ? <><div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>Syncing...</> : <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" /></svg>}
                        </button>
                        <Link href="/review" className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-semibold hover:bg-slate-200 transition">
                            View System Submissions
                        </Link>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-8 py-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white rounded-xl p-4 border border-slate-200">
                        <p className="text-2xl font-bold text-slate-900">{submissions.length}</p>
                        <p className="text-sm text-slate-500">Total</p>
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-slate-200">
                        <p className="text-2xl font-bold text-yellow-600">{submissions.filter(s => s.status === 'pending').length}</p>
                        <p className="text-sm text-slate-500">Pending</p>
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-slate-200">
                        <p className="text-2xl font-bold text-emerald-600">{submissions.filter(s => s.evaluation_status === 'accepted').length}</p>
                        <p className="text-sm text-slate-500">Accepted</p>
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-slate-200">
                        <p className="text-2xl font-bold text-red-600">{submissions.filter(s => s.evaluation_status === 'non_competitive').length}</p>
                        <p className="text-sm text-slate-500">Non-Competitive</p>
                    </div>
                </div>

                {/* 🔧 NEW: Filters row with search + status + category + thematic area */}
                <div className="flex flex-wrap gap-3 mb-6 items-center">
                    {/* Search */}
                    <div className="flex-1 min-w-55 relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                            <FontAwesomeIcon icon={faSearch} className="w-4 h-4" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search by subject, sender, or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full px-4 py-2.5 pl-10 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none"
                        />
                    </div>

                    {/* Status */}
                    <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                            <FontAwesomeIcon icon={faFilter} className="w-4 h-4" />
                        </div>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none appearance-none cursor-pointer min-w-40"
                        >
                            <option value="all">All Status</option>
                            <option value="pending">Pending</option>
                            <option value="accepted">Accepted</option>
                            <option value="rejected">Rejected</option>
                        </select>
                    </div>

                    {/* 🔧 NEW: Categories */}
                    <div className="relative">
                        <select
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none appearance-none cursor-pointer min-w-50"
                        >
                            <option value="all">All Categories</option>
                            {PAPER_CATEGORIES.map((cat) => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>

                    {/* 🔧 NEW: Thematic Areas */}
                    <div className="relative">
                        <select
                            value={thematicAreaFilter}
                            onChange={(e) => setThematicAreaFilter(e.target.value)}
                            className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none appearance-none cursor-pointer min-w-60 max-w-75 truncate"
                        >
                            <option value="all">All Thematic Areas</option>
                            {THEMATIC_AREAS.map((area) => (
                                <option key={area} value={area}>{area}</option>
                            ))}
                        </select>
                    </div>

                    {/* Reset button — only shown when any filter is active */}
                    {(statusFilter !== 'all' || categoryFilter !== 'all' || thematicAreaFilter !== 'all' || searchTerm) && (
                        <button
                            onClick={resetFilters}
                            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold text-sm transition"
                        >
                            Reset
                        </button>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-200">
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Subject / Sender</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Project Leader</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Received</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredSubmissions.map((sub) => (
                                        <tr
                                            key={sub.id}
                                            onClick={() => selectSubmission(sub)}
                                            className={`cursor-pointer border-b border-slate-100 hover:bg-blue-50/50 transition ${selectedSubmission?.id === sub.id ? 'bg-blue-50/50 border-blue-200' : ''}`}
                                        >
                                            <td className="px-6 py-4">
                                                <p className="text-sm font-semibold text-slate-900">{sub.subject}</p>
                                                <p className="text-xs text-slate-500 mt-1">{sub.sender_name} ({sub.sender_email})</p>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-600">{sub.project_leader_name}</td>
                                            <td className="px-6 py-4 text-sm text-slate-600">
                                                {new Date(sub.email_received_at).toLocaleDateString('en-US', {
                                                    month: 'short',
                                                    day: '2-digit',
                                                    year: 'numeric'
                                                })}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(sub.evaluation_status || 'pending')}`}>
                                                    {sub.evaluation_status || 'pending'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {filteredSubmissions.length === 0 && (
                                <div className="text-center py-12 text-slate-500">
                                    <p className="text-sm">No email submissions match the current filters</p>
                                    <button
                                        onClick={resetFilters}
                                        className="mt-3 text-xs font-semibold text-blue-600 hover:text-blue-700"
                                    >
                                        Clear filters
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="lg:col-span-1 bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                        {selectedSubmission ? (
                            <>
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-lg font-bold text-slate-900">Submission Information</h2>
                                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(votes.evaluation_status)}`}>
                                        {votes.evaluation_status ? votes.evaluation_status.charAt(0).toUpperCase() + votes.evaluation_status.slice(1) : 'Pending'}
                                    </span>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <p className="text-sm text-slate-600">Title</p>
                                        <p className="font-semibold text-slate-900">{getTitle()}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-600">Author(s)</p>
                                        <p className="text-slate-900">{getAuthor()}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-600">SUC / Agency</p>
                                        <p className="font-semibold text-slate-900">{getSuc()}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-600">Thematic Area</p>
                                        <p className="text-slate-900">{getThematicArea()}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-600">Paper Category</p>
                                        <p className="text-slate-900">{getPaperCategory()}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-600">Corresponding Author Name</p>
                                        <p className="text-slate-900">{getCorrespondingAuthorName()}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-600">Corresponding Author Email</p>
                                        <p className="text-slate-900">{getCorrespondingAuthorEmail()}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-600">Corresponding Author Position</p>
                                        <p className="text-slate-900">{getCorrespondingAuthorPosition()}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-600">Theme</p>
                                        <p className="text-slate-900">{getTheme()}</p>
                                    </div>
                                </div>

                                {votes.evaluation_status === 'pending' && (
                                    <>
                                        <div className="mt-6">
                                            <label className="block text-sm font-semibold text-slate-700 mb-2">Your Notes</label>
                                            <textarea
                                                value={voteNotes}
                                                onChange={(e) => setVoteNotes(e.target.value)}
                                                placeholder="Add notes for other evaluators..."
                                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none"
                                                rows={3}
                                            />
                                        </div>

                                        <div className="mt-4 space-y-3">
                                            <button
                                                onClick={() => handleVote('endorse')}
                                                className="w-full bg-emerald-600 text-white py-3 rounded-xl font-semibold hover:bg-emerald-700 transition"
                                            >
                                                ✅ Endorse
                                            </button>
                                            <button
                                                onClick={() => handleVote('non_competitive')}
                                                className="w-full bg-red-50 text-red-600 py-3 rounded-xl font-semibold hover:bg-red-100 transition"
                                            >
                                                🚫 Non-Competitive
                                            </button>
                                            <div className="grid grid-cols-2 gap-3">
                                                <button
                                                    onClick={() => handleVote('downgrade')}
                                                    className="w-full bg-yellow-50 text-yellow-600 py-3 rounded-xl font-semibold hover:bg-yellow-100 transition"
                                                >
                                                    ⬇️ Downgrade
                                                </button>
                                                <button
                                                    onClick={openReassignModal}
                                                    className="w-full bg-blue-50 text-blue-600 py-3 rounded-xl font-semibold hover:bg-blue-100 transition"
                                                >
                                                    🔄 Reassign
                                                </button>
                                            </div>
                                        </div>
                                    </>
                                )}

                                <div className="mt-6 pt-4 border-t border-slate-200">
                                    <h3 className="text-sm font-bold text-slate-700 mb-2">Team Votes ({(votes.votes || []).length}/3)</h3>
                                    <div className="space-y-2">
                                        {(votes.votes || []).map((vote, idx) => (
                                            <div key={idx} className="p-2 bg-slate-50 rounded-lg text-sm">
                                                <strong>Evaluator {vote.evaluator_id}:</strong> {vote.vote_status.replace('_', ' ').toUpperCase()}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="mt-6 pt-4 border-t border-slate-200">
                                    <h3 className="text-sm font-bold text-slate-700 mb-2">Evaluator Discussion</h3>
                                    <div className="max-h-40 overflow-y-auto bg-slate-50 border border-slate-200 rounded-lg p-3 mb-3">
                                        {discussions.map((msg) => (
                                            <div key={msg.id} className="mb-2">
                                                <span className="text-xs font-bold text-slate-900">Evaluator {msg.evaluator_id}:</span>
                                                <span className="text-xs text-slate-700 ml-2">{msg.message}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={newMessage}
                                            onChange={(e) => setNewMessage(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && postMessage()}
                                            placeholder="Chat with evaluators..."
                                            className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                                        />
                                        <button onClick={postMessage} className="bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-semibold">
                                            Send
                                        </button>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="text-center py-12">
                                <p className="text-slate-500">Select an email to view details</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <style jsx>{`
                @keyframes slideIn {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
                .animate-slide-in {
                    animation: slideIn 0.3s ease-out;
                }
            `}</style>
        </div>
    );
}