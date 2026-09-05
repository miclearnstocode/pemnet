"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import ReassignModal from '../components/ReassignModal';
import DowngradeModal from '../components/DowngradeModal';
import ConfirmModal from '../components/ConfirmModal';

export default function ReviewPage() {
  const [currentEvaluatorId, setCurrentEvaluatorId] = useState(null);
  const [activeTab, setActiveTab] = useState('system');
  const [submissions, setSubmissions] = useState([]);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Extracted data for email submissions
  const [emailExtractedData, setEmailExtractedData] = useState(null);

  const [toast, setToast] = useState(null);
  const [votes, setVotes] = useState({ votes: [], evaluation_status: 'pending' });
  const [discussions, setDiscussions] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [voteNotes, setVoteNotes] = useState('');

  const [showReassignModal, setShowReassignModal] = useState(false);
  const [reassignLoading, setReassignLoading] = useState(false);
  
  const [showDowngradeModal, setShowDowngradeModal] = useState(false);
  const [downgradeLoading, setDowngradeLoading] = useState(false);
  
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [pendingVoteAction, setPendingVoteAction] = useState(null);
  
  const [checkingEmails, setCheckingEmails] = useState(false);
  const [isModalLoading, setIsModalLoading] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('pemnet_user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setCurrentEvaluatorId(user.id || 3); // fallback
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }, []);

  useEffect(() => {
    if (currentEvaluatorId) {
      fetchSubmissions();
    }
  }, [activeTab, statusFilter, currentEvaluatorId]);

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      let url;
      if (activeTab === 'system') {
        url = 'http://localhost:5000/api/submissions';
      } else {
        url = `http://localhost:5000/api/email-submissions?status=${statusFilter}`;
      }
      
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setSubmissions(data);
      }
    } catch (error) {
      console.error('Error fetching submissions:', error);
      showToast('Failed to fetch submissions', 'error');
    } finally {
      setLoading(false);
    }
  };

  const checkEmails = async () => {
    setCheckingEmails(true);
    try {
      const res = await fetch('http://localhost:5000/api/email-submissions/check', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        showToast(`Found ${data.processed} new email submissions`, 'success');
        fetchSubmissions();
      }
    } catch (error) {
      showToast('Failed to check emails', 'error');
    } finally {
      setCheckingEmails(false);
    }
  };

  const showToast = (message, type) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  };

  // Fetch extracted data for email submissions
  const fetchExtractedData = async (emailSubmissionId) => {
    const res = await fetch(`http://localhost:5000/api/email-submissions/${emailSubmissionId}/extracted-data`);
    if (res.ok) {
      const data = await res.json();
      setEmailExtractedData(data);
      return data;
    }
    return null;
  };

  const selectSubmission = async (sub) => {
    setSelectedSubmission(sub);
    setEmailExtractedData(null); // Reset extracted data

    const votesRes = await fetch(`http://localhost:5000/api/submissions/${sub.id}/evaluate`);
    const votesData = await votesRes.json();
    setVotes({ ...votesData, evaluation_status: votesData.evaluation_status || 'pending' });

    const discRes = await fetch(`http://localhost:5000/api/submissions/${sub.id}/discussions`);
    const discData = await discRes.json();
    setDiscussions(Array.isArray(discData) ? discData : []);

    // If it's an email submission, fetch extracted data
    if (activeTab === 'email' && sub.id) {
      await fetchExtractedData(sub.id);
    }
  };

  const handleVote = async (vote_status) => {
    if (!selectedSubmission) return;

    try {
      const res = await fetch(`http://localhost:5000/api/submissions/${selectedSubmission.id}/evaluate`, {
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
        setVotes(data);
        showToast(`Voted: ${vote_status.replace('_', ' ')}`, 'success');
        setVoteNotes('');
        if (data.evaluation_status !== 'pending') fetchSubmissions();
        return true;
      } else {
        const error = await res.json();
        showToast(error.detail || 'Failed to vote', 'error');
        return false;
      }
    } catch (error) {
      showToast('Failed to vote', 'error');
      return false;
    }
  };

  const postMessage = async () => {
    if (!newMessage.trim() || !selectedSubmission) return;
    try {
      const res = await fetch(`http://localhost:5000/api/submissions/${selectedSubmission.id}/discussions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ evaluator_id: currentEvaluatorId, message: newMessage })
      });
      if (res.ok) {
        const data = await res.json();
        const newDiscussion = {
          id: data.id || Date.now(),
          evaluator_id: data.evaluator_id || currentEvaluatorId,
          message: data.message || newMessage,
          created_at: data.created_at || new Date().toLocaleString()
        };
        setDiscussions([...discussions, newDiscussion]);
        setNewMessage('');
        showToast('Message sent successfully!', 'success');
      }
    } catch (error) {
      showToast('Failed to send message', 'error');
    }
  };

  const handleEndorseWithConfirm = () => {
    setPendingVoteAction('endorse');
    setShowConfirmModal(true);
  };

  const confirmVote = async () => {
    if (!pendingVoteAction) return;
    setConfirmLoading(true);
    try {
      await handleVote(pendingVoteAction);
      setShowConfirmModal(false);
      setPendingVoteAction(null);
    } finally {
      setConfirmLoading(false);
    }
  };

  // Filter submissions
  const filteredSubmissions = submissions.filter(sub => {
    if (activeTab === 'system') {
      if (statusFilter !== 'all' && sub.status !== statusFilter) return false;
      if (categoryFilter !== 'all' && sub.paper_category !== categoryFilter) return false;
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        return (
          sub.extension_project_title.toLowerCase().includes(search) ||
          sub.author.toLowerCase().includes(search) ||
          sub.suc_agencies.toLowerCase().includes(search)
        );
      }
      return true;
    } else {
      if (statusFilter !== 'all' && sub.status !== statusFilter) return false;
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        return (
          sub.subject.toLowerCase().includes(search) ||
          sub.sender_name.toLowerCase().includes(search) ||
          sub.sender_email.toLowerCase().includes(search)
        );
      }
      return true;
    }
  });

  const totalSubmissions = submissions.length;
  const pendingCount = submissions.filter(s => s.evaluation_status === 'pending').length;
  const endorsedCount = submissions.filter(s => s.evaluation_status === 'endorse').length;
  const downgradedCount = submissions.filter(s => s.evaluation_status === 'downgraded-non_competitive' || s.evaluation_status === 'downgraded-poster_only').length;

  const getStatusColor = (status) => {
    const safeStatus = status || 'pending';
    switch (safeStatus) {
      case 'endorse': return 'bg-emerald-100 text-emerald-700';
      case 'downgraded-non_competitive': return 'bg-yellow-100 text-yellow-700';
      case 'downgraded-poster_only': return 'bg-orange-100 text-orange-700';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const getStatusDisplay = (status) => {
    switch (status) {
      case 'endorse': return 'Endorsed';
      case 'downgraded-non_competitive': return 'Non-Competitive (Poster)';
      case 'downgraded-poster_only': return 'Poster Only';
      case 'pending': return 'Pending';
      default: return status || 'Pending';
    }
  };

  const getCategoryColor = (category) => {
    if (!category) return 'bg-slate-100 text-slate-700';
    if (category.includes('Natural')) return 'bg-green-100 text-green-700';
    if (category.includes('Information')) return 'bg-blue-100 text-blue-700';
    if (category.includes('Development')) return 'bg-purple-100 text-purple-700';
    if (category.includes('Social')) return 'bg-pink-100 text-pink-700';
    if (category.includes('Food')) return 'bg-yellow-100 text-yellow-700';
    return 'bg-slate-100 text-slate-700';
  };

  const extractGoogleDriveId = (url) => {
    if (!url) return null;
    const patterns = [
      /\/d\/([a-zA-Z0-9_-]+)/,
      /id=([a-zA-Z0-9_-]+)/,
      /open\?id=([a-zA-Z0-9_-]+)/,
      /\/file\/d\/([a-zA-Z0-9_-]+)/,
      /([a-zA-Z0-9_-]{25,})/
    ];
    for (let pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) return match[1].split('?')[0].split('&')[0];
    }
    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  const getTitle = () => {
    if (activeTab === 'system') return selectedSubmission?.extension_project_title;
    return emailExtractedData?.title || selectedSubmission?.subject;
  };

  const getAuthor = () => {
    if (activeTab === 'system') return selectedSubmission?.author;
    return emailExtractedData?.project_leader || selectedSubmission?.sender_name;
  };

  const getSuc = () => {
    if (activeTab === 'system') return selectedSubmission?.suc_agencies;
    return selectedSubmission?.sender_name;
  };

  const getThematicArea = () => {
    if (activeTab === 'system') return selectedSubmission?.thematic_area;
    return emailExtractedData?.thematic_area || 'Not specified';
  };

  const getPaperCategory = () => {
    if (activeTab === 'system') return selectedSubmission?.paper_category;
    return emailExtractedData?.paper_category || 'Not specified';
  };

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

      <ReassignModal
        isOpen={showReassignModal}
        onClose={() => setShowReassignModal(false)}
        onSubmit={async (newThematicArea) => {
          setReassignLoading(true);
          try {
            const res = await fetch(`http://localhost:5000/api/submissions/${selectedSubmission.id}/evaluate`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                evaluator_id: currentEvaluatorId,
                vote_status: 'reassign',
                vote_notes: voteNotes,
                vote_reassign_to: newThematicArea
              }),
            });
            if (res.ok) {
              const data = await res.json();
              setVotes(data);
              setShowReassignModal(false);
              setVoteNotes('');
              setReassignLoading(false);
              showToast(`Thematic area updated to "${newThematicArea}"`, 'success');
              fetchSubmissions();
              setSelectedSubmission({ ...selectedSubmission, thematic_area: newThematicArea });
            } else {
              const error = await res.json();
              showToast(error.detail || 'Failed to update thematic area', 'error');
              setReassignLoading(false);
            }
          } catch (error) {
            showToast('Failed to update thematic area', 'error');
            setReassignLoading(false);
          }
        }}
        currentThematicArea={getThematicArea()}
      />

      <DowngradeModal
        isOpen={showDowngradeModal}
        onClose={() => setShowDowngradeModal(false)}
        onSubmit={async (downgradeType) => {
          setDowngradeLoading(true);
          try {
            const res = await fetch(`http://localhost:5000/api/submissions/${selectedSubmission.id}/evaluate`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                evaluator_id: currentEvaluatorId,
                vote_status: 'downgrade',
                vote_notes: voteNotes,
                vote_downgrade_to: downgradeType
              }),
            });
            if (res.ok) {
              const data = await res.json();
              setVotes(data);
              setShowDowngradeModal(false);
              setVoteNotes('');
              setDowngradeLoading(false);
              showToast('Submission downgraded', 'success');
              fetchSubmissions();
            } else {
              const error = await res.json();
              showToast(error.detail || 'Failed to downgrade', 'error');
              setDowngradeLoading(false);
            }
          } catch (error) {
            showToast('Failed to downgrade', 'error');
            setDowngradeLoading(false);
          }
        }}
      />

      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={() => { setShowConfirmModal(false); setPendingVoteAction(null); }}
        onConfirm={confirmVote}
        title="Endorse for Presentation"
        message="Are you sure you want to endorse this submission for presentation?"
        confirmText="Yes, Endorse"
        cancelText="No, Cancel"
        isLoading={confirmLoading}
      />

      {selectedSubmission && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedSubmission(null)}></div>
          <div className="relative min-h-full flex items-center justify-center p-4">
            <div className="relative w-full max-w-7xl bg-white rounded-2xl shadow-2xl overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-white">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-blue-600">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">
                      {activeTab === 'system' ? 'Submission Details' : 'Email Details'}
                    </h3>
                    <p className="text-sm text-slate-500">{getTitle()}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedSubmission(null)} className="w-10 h-10 flex items-center justify-center rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 h-full min-h-[700px]">
                {/* Left Panel - "Submission Information" Structure */}
                <div className="p-8 overflow-y-auto max-h-[80vh] border-r border-slate-200">
                  <h4 className="text-base font-bold text-slate-700 uppercase mb-6">Submission Information</h4>
                  <div className="space-y-5">
                    <div>
                      <p className="text-base text-slate-600 font-medium">Title</p>
                      <p className="text-lg font-semibold text-slate-900">{getTitle()}</p>
                    </div>
                    <div>
                      <p className="text-base text-slate-600 font-medium">Author(s)</p>
                      <p className="text-lg font-semibold text-slate-900">{getAuthor()}</p>
                    </div>
                    <div>
                      <p className="text-base text-slate-600 font-medium">SUC / Agency</p>
                      <p className="text-lg font-semibold text-slate-900">{getSuc()}</p>
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between">
                        <p className="text-base text-slate-600 font-medium">Thematic Area</p>
                        {votes.evaluation_status === 'pending' && (
                          <button onClick={() => setShowReassignModal(true)} className="text-xs bg-blue-50 text-blue-600 px-3 py-1 rounded-lg hover:bg-blue-100 transition flex items-center gap-1">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3 h-3">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
                            </svg>
                            Reassigned
                          </button>
                        )}
                      </div>
                      <p className="text-lg font-semibold text-slate-900">{getThematicArea()}</p>
                    </div>
                    
                    <div>
                      <p className="text-base text-slate-600 font-medium">Paper Category</p>
                      <span className={`inline-flex px-4 py-1.5 rounded-full text-base font-medium ${getCategoryColor(getPaperCategory())}`}>
                        {getPaperCategory()?.includes('Completed') ? 'Completed' : 'Ongoing'}
                      </span>
                    </div>
                    <div>
                      <p className="text-base text-slate-600 font-medium">Final Status</p>
                      <span className={`inline-flex px-4 py-1.5 rounded-full text-base font-medium ${getStatusColor(votes.evaluation_status)}`}>
                        {getStatusDisplay(votes.evaluation_status)}
                      </span>
                    </div>
                  </div>

                  {votes.evaluation_status === 'pending' && (
                    <div className="mt-8 pt-6 border-t border-slate-200">
                      <div className="mt-5">
                        <button onClick={handleEndorseWithConfirm} className="w-full bg-emerald-600 text-white py-4 rounded-xl font-semibold text-base hover:bg-emerald-700 transition flex items-center justify-center gap-2">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Endorse for Presentation
                        </button>
                      </div>
                      
                      <div className="mt-4">
                        <button onClick={() => setShowDowngradeModal(true)} className="w-full bg-yellow-50 text-yellow-600 py-4 rounded-xl font-semibold text-base hover:bg-yellow-100 transition flex items-center justify-center gap-2">
                          <img src="/images/downgrade.png" alt="Downgrade" className="w-5 h-5 object-contain" />
                          Downgrade
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="mt-8 pt-6 border-t border-slate-200">
                    <h4 className="text-base font-bold text-slate-700 uppercase mb-4">Live Votes ({(votes.votes || []).length}/3)</h4>
                    <div className="space-y-3">
                      {(votes.votes || []).map((vote, idx) => (
                        <div key={idx} className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                          <div className="flex justify-between items-center">
                            <p className="text-base font-semibold text-slate-900">Evaluator {vote.evaluator_id}</p>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(vote.vote_status)}`}>
                              {vote.vote_status === 'endorse' ? 'Endorse for Presentation' : 
                               vote.vote_status === 'downgrade' ? 'Downgraded' :
                               vote.vote_status?.replace('_', ' ').toUpperCase()}
                            </span>
                          </div>
                          {vote.vote_notes && (
                            <p className="mt-2 text-sm text-slate-500 italic">"{vote.vote_notes}"</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-8 pt-6 border-t border-slate-200">
                    <h4 className="text-base font-bold text-slate-900 uppercase mb-4">Evaluator Discussion</h4>
                    <div className="max-h-48 overflow-y-auto bg-slate-50 border border-slate-200 rounded-xl p-4 mb-4 space-y-3">
                      {Array.isArray(discussions) && discussions.length > 0 ? (
                        discussions.map((msg) => {
                          const isCurrentUser = msg.evaluator_id === currentEvaluatorId;
                          return (
                            <div key={msg.id || Math.random()} className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
                              <div className={`max-w-[80%] ${isCurrentUser ? 'items-end' : 'items-start'}`}>
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-xs font-bold text-slate-600">
                                    {isCurrentUser ? 'You' : `Evaluator ${msg.evaluator_id}`}
                                  </span>
                                  <span className="text-xs text-slate-400">{msg.created_at}</span>
                                </div>
                                <div className={`px-4 py-2 rounded-xl ${isCurrentUser ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white border border-slate-200 text-slate-900 rounded-bl-none'}`}>
                                  <p className="text-sm">{msg.message || msg.text || 'No message'}</p>
                                </div>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <p className="text-center text-slate-500 text-sm py-4">No discussions yet</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && postMessage()} placeholder="Write a message to other evaluators..." className="flex-1 px-4 py-2 border border-slate-200 rounded-xl text-sm text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none" />
                      <button onClick={postMessage} className="bg-blue-600 text-white px-4 py-2 rounded-xl font-semibold hover:bg-blue-700 transition">Send</button>
                    </div>
                  </div>
                </div>

                {/* Right Panel - File Viewer */}
                <div className="bg-slate-50 p-6 overflow-y-auto max-h-[80vh]">
                  <h4 className="text-base font-bold text-slate-700 uppercase mb-4">File Viewer</h4>
                  
                  {activeTab === 'system' ? (
                    <div className="space-y-6">
                      <div>
                        <p className="text-base font-semibold text-slate-700 mb-3">Abstract PDF</p>
                        {selectedSubmission.abstract_view_url ? (
                          <div className="border rounded-lg bg-white overflow-hidden" style={{ height: '550px' }}>
                            <iframe src={`https://drive.google.com/file/d/${extractGoogleDriveId(selectedSubmission.abstract_view_url)}/preview?embedded=true`} className="w-full h-full" allow="autoplay" onLoad={() => setIsModalLoading(false)} />
                          </div>
                        ) : (
                          <div className="text-center py-16 text-slate-500 bg-white rounded-lg border text-lg">No Abstract Available</div>
                        )}
                      </div>
                      <div>
                        <p className="text-base font-semibold text-slate-700 mb-3">Endorsement PDF</p>
                        {selectedSubmission.endorsement_view_url ? (
                          <div className="border rounded-lg bg-white overflow-hidden" style={{ height: '550px' }}>
                            <iframe src={`https://drive.google.com/file/d/${extractGoogleDriveId(selectedSubmission.endorsement_view_url)}/preview?embedded=true`} className="w-full h-full" allow="autoplay" />
                          </div>
                        ) : (
                          <div className="text-center py-16 text-slate-500 bg-white rounded-lg border text-lg">No Endorsement Available</div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <p className="text-base font-semibold text-slate-700 mb-3">Attachment</p>
                        {selectedSubmission.attachment_filename && (
                          <p className="text-sm text-slate-500 mb-3">{selectedSubmission.attachment_filename}</p>
                        )}
                        {selectedSubmission.attachment_view_url ? (
                          <div className="border rounded-lg bg-white overflow-hidden" style={{ height: '650px' }}>
                            <iframe src={`https://drive.google.com/file/d/${extractGoogleDriveId(selectedSubmission.attachment_view_url)}/preview?embedded=true`} className="w-full h-full" allow="autoplay" onLoad={() => setIsModalLoading(false)} />
                          </div>
                        ) : (
                          <div className="text-center py-16 text-slate-500 bg-white rounded-lg border text-lg">No Attachment Available</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header and main UI */}
      <div className="bg-white border-b border-slate-200 px-8 py-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Abstract Review</h1>
            <p className="text-slate-500 text-sm mt-1">Review, vote, and collaborate with your fellow evaluators.</p>
          </div>
          <Link href="/" className="text-blue-600 hover:text-blue-700 font-semibold text-sm">← Back to Dashboard</Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
            <button onClick={() => { setActiveTab('system'); setStatusFilter('all'); setCategoryFilter('all'); setSearchTerm(''); }} className={`px-6 py-2.5 rounded-lg font-semibold text-sm transition ${activeTab === 'system' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-600 hover:text-slate-900'}`}>System Submissions</button>
            <button onClick={() => { setActiveTab('email'); setCategoryFilter('all'); setSearchTerm(''); }} className={`px-6 py-2.5 rounded-lg font-semibold text-sm transition ${activeTab === 'email' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-600 hover:text-slate-900'}`}>Email Submissions</button>
          </div>
          {activeTab === 'email' && (
            <button onClick={checkEmails} disabled={checkingEmails} className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 flex items-center gap-2">
              {checkingEmails ? <><div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>Checking...</> : <><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9" /></svg>Check Inbox</>}
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm"><p className="text-2xl font-bold text-slate-900">{totalSubmissions}</p><p className="text-sm text-slate-500">Total {activeTab === 'system' ? 'Submissions' : 'Emails'}</p></div>
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm"><p className="text-2xl font-bold text-yellow-600">{pendingCount}</p><p className="text-sm text-slate-500">Pending Review</p></div>
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm"><p className="text-2xl font-bold text-emerald-600">{endorsedCount}</p><p className="text-sm text-slate-500">Endorsed</p></div>
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm"><p className="text-2xl font-bold text-yellow-600">{downgradedCount}</p><p className="text-sm text-slate-500">Downgraded</p></div>
        </div>

        <div className="flex gap-4 mb-6">
          <div className="flex-1 relative">
            <input type="text" placeholder={activeTab === 'system' ? "Search by title, author, or SUC..." : "Search by subject, sender, or email..."} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full px-4 py-2.5 pl-10 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none" />
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none">
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="endorse">Endorsed</option>
            <option value="downgraded">Downgraded</option>
          </select>
          {activeTab === 'system' && (
            <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none">
              <option value="all">All Categories</option>
              <option value="Completed Extension Project Papers">Completed Extension</option>
              <option value="Ongoing Extension Project Papers">Ongoing Extension</option>
            </select>
          )}
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  {activeTab === 'system' ? (
                    <>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Title & Author</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">SUC / Agency</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Category</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Status</th>
                    </>
                  ) : (
                    <>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Subject / Sender</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Project Leader</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Received</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Status</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {filteredSubmissions.map((sub) => (
                  <tr key={sub.id} onClick={() => selectSubmission(sub)} className="cursor-pointer border-b border-slate-100 hover:bg-blue-50/50 transition">
                    {activeTab === 'system' ? (
                      <>
                        <td className="px-6 py-4"><p className="text-sm font-semibold text-slate-900">{sub.extension_project_title}</p><p className="text-xs text-slate-500 mt-1">{sub.author}</p></td>
                        <td className="px-6 py-4 text-sm text-slate-600">{sub.suc_agencies}</td>
                        <td className="px-6 py-4"><span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${getCategoryColor(sub.paper_category)}`}>{sub.paper_category?.includes('Completed') ? 'Completed' : 'Ongoing'}</span></td>
                        <td className="px-6 py-4 text-sm text-slate-600">{new Date(sub.created_at).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}</td>
                        <td className="px-6 py-4"><span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(sub.evaluation_status || 'pending')}`}>{getStatusDisplay(sub.evaluation_status || 'pending')}</span></td>
                      </>
                    ) : (
                      <>
                        <td className="px-6 py-4"><p className="text-sm font-semibold text-slate-900">{sub.subject}</p><p className="text-xs text-slate-500 mt-1">{sub.sender_name} ({sub.sender_email})</p></td>
                        <td className="px-6 py-4 text-sm text-slate-600">{sub.project_leader_name}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">{new Date(sub.email_received_at).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}</td>
                        <td className="px-6 py-4"><span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(sub.evaluation_status || 'pending')}`}>{getStatusDisplay(sub.evaluation_status || 'pending')}</span></td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredSubmissions.length === 0 && (
              <div className="text-center py-12 text-slate-500"><p>No {activeTab === 'system' ? 'submissions' : 'email submissions'} found</p></div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .animate-slide-in { animation: slideIn 0.3s ease-out; }
      `}</style>
    </div>
  );
}