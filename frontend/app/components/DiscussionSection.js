"use client";

import { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faComment,
  faUserCircle,
  faPaperPlane,
  faClock,
  faUsers,
  faSpinner,
  faSync
} from '@fortawesome/free-solid-svg-icons';

export default function DiscussionSection({
  submissionId,
  currentUserId,
  currentUserName,
  onNewMessage,
  initialDiscussions = [],
  isMasterApprover = false,
  title = 'Evaluator Discussion',
  maxHeight = '300px'
}) {
  const [discussions, setDiscussions] = useState(initialDiscussions);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const [error, setError] = useState(null);
  const isInitialMount = useRef(true);

  // Fetch users on mount
  useEffect(() => {
    fetchUsers();
  }, []);

  // Fetch discussions when submissionId changes
  useEffect(() => {
    if (submissionId) {
      fetchDiscussions();
    } else {
      setDiscussions([]);
      setError(null);
    }
  }, [submissionId]);

  // Update discussions when initialDiscussions changes (but only if it's a real change)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    // Compare by IDs to avoid unnecessary updates
    const currentIds = discussions.map(d => d.id).join(',');
    const newIds = initialDiscussions.map(d => d.id).join(',');
    if (currentIds !== newIds && initialDiscussions.length > 0) {
      setDiscussions(initialDiscussions);
    }
  }, [initialDiscussions]);

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

  const fetchDiscussions = async () => {
    if (!submissionId) {
      console.log('No submissionId provided to DiscussionSection');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Fetching discussions for submissionId:', submissionId);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/submissions/${submissionId}/discussions`);
      
      if (res.ok) {
        const data = await res.json();
        console.log('Discussions fetched:', data);
        setDiscussions(Array.isArray(data) ? data : []);
      } else {
        const errorText = await res.text();
        console.error('Failed to fetch discussions:', res.status, errorText);
        setError(`Failed to load discussions (${res.status})`);
      }
    } catch (error) {
      console.error('Error fetching discussions:', error);
      setError('Network error loading discussions');
    } finally {
      setIsLoading(false);
    }
  };

  const postMessage = async () => {
    if (!newMessage.trim() || !submissionId) {
      console.log('Cannot send empty message or missing submissionId');
      return;
    }
    
    setIsSending(true);
    setError(null);
    
    try {
      console.log('Posting message to submissionId:', submissionId);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/submissions/${submissionId}/discussions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          evaluator_id: currentUserId,
          message: newMessage
        })
      });
      
      if (res.ok) {
        const data = await res.json();
        console.log('Message posted:', data);
        const newDiscussion = {
          id: data.id || Date.now(),
          evaluator_id: data.evaluator_id || currentUserId,
          evaluator_name: currentUserName || 'You',
          message: data.message || newMessage,
          created_at: data.created_at || new Date().toLocaleString()
        };
        setDiscussions(prev => [...prev, newDiscussion]);
        setNewMessage('');
        if (onNewMessage) {
          onNewMessage(newDiscussion);
        }
      } else {
        const errorText = await res.text();
        console.error('Failed to post message:', res.status, errorText);
        setError(`Failed to send message (${res.status})`);
      }
    } catch (error) {
      console.error('Error posting message:', error);
      setError('Network error sending message');
    } finally {
      setIsSending(false);
    }
  };

  const getEvaluatorName = (id) => {
    // If id is a string, try to convert to number
    const userId = typeof id === 'string' ? parseInt(id) : id;
    const user = allUsers.find(u => u.id === userId);
    return user ? user.full_name : `Evaluator ${id}`;
  };

  return (
    <div className={`bg-linear-to-br from-slate-50 to-blue-50/20 border border-slate-200 rounded-2xl p-4 ${isMasterApprover ? 'border-purple-200' : ''}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FontAwesomeIcon 
            icon={faComment} 
            className={`w-5 h-5 ${isMasterApprover ? 'text-purple-600' : 'text-indigo-600'}`} 
          />
          <h4 className={`text-sm font-bold uppercase tracking-wider ${isMasterApprover ? 'text-purple-700' : 'text-slate-700'}`}>
            {title}
          </h4>
          <span className="text-xs text-slate-400">
            ({discussions.length} {discussions.length === 1 ? 'message' : 'messages'})
          </span>
          {isMasterApprover && (
            <span className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-purple-100 text-purple-600 border border-purple-200">
              <FontAwesomeIcon icon={faUsers} className="w-2.5 h-2.5" />
              Master View
            </span>
          )}
          {submissionId && (
            <span className="text-[10px] text-slate-400 ml-1">
              (ID: {submissionId})
            </span>
          )}
        </div>
        <button
          onClick={fetchDiscussions}
          disabled={isLoading || !submissionId}
          className="text-xs text-blue-600 hover:text-blue-700 font-medium transition disabled:opacity-50 flex items-center gap-1"
        >
          {isLoading ? (
            <>
              <FontAwesomeIcon icon={faSpinner} className="w-3 h-3 animate-spin" />
              Loading...
            </>
          ) : (
            <>
              <FontAwesomeIcon icon={faSync} className="w-3 h-3" />
              Refresh
            </>
          )}
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600 flex items-center gap-2">
          <FontAwesomeIcon icon={faComment} className="w-3 h-3" />
          {error}
          <button onClick={fetchDiscussions} className="text-red-700 underline ml-auto">
            Retry
          </button>
        </div>
      )}

      {/* No Submission ID Warning */}
      {!submissionId && (
        <div className="mb-3 p-2 bg-yellow-50 border border-yellow-200 rounded-lg text-xs text-yellow-600 flex items-center gap-2">
          <FontAwesomeIcon icon={faComment} className="w-3 h-3" />
          No submission selected
        </div>
      )}

      {/* Messages */}
      <div 
        className="max-h-48 overflow-y-auto bg-white border border-slate-200 rounded-xl p-3 mb-3 space-y-3"
        style={{ maxHeight }}
      >
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <FontAwesomeIcon icon={faSpinner} className="w-6 h-6 text-blue-500 animate-spin" />
          </div>
        ) : discussions.length > 0 ? (
          discussions.map((msg) => {
            const isCurrentUser = msg.evaluator_id === currentUserId;
            const evaluatorName = msg.evaluator_name || getEvaluatorName(msg.evaluator_id) || 'Unknown';
            
            return (
              <div key={msg.id || Math.random()} className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] ${isCurrentUser ? 'items-end' : 'items-start'}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <FontAwesomeIcon 
                      icon={faUserCircle} 
                      className={`w-3 h-3 ${isCurrentUser ? 'text-blue-500' : 'text-slate-400'}`} 
                    />
                    <span className={`text-xs font-bold ${isCurrentUser ? 'text-blue-700' : 'text-slate-600'}`}>
                      {isCurrentUser ? 'You' : evaluatorName}
                      {isMasterApprover && !isCurrentUser && (
                        <span className="ml-1 text-[10px] font-normal text-purple-500">(Evaluator)</span>
                      )}
                    </span>
                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                      <FontAwesomeIcon icon={faClock} className="w-2.5 h-2.5" />
                      {msg.created_at}
                    </span>
                  </div>
                  <div className={`px-4 py-2.5 rounded-2xl text-sm ${
                    isCurrentUser 
                      ? `bg-linear-to-r from-blue-500 to-blue-600 text-white rounded-br-none shadow-md ${isMasterApprover ? 'shadow-blue-500/30' : 'shadow-blue-500/20'}`
                      : 'bg-white border border-slate-200 text-slate-900 rounded-bl-none shadow-sm'
                  }`}>
                    <p className="whitespace-pre-wrap wrap-break-word">{msg.message || msg.text || 'No message'}</p>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-8 text-slate-400">
            <FontAwesomeIcon icon={faComment} className="w-8 h-8 text-slate-300 mb-2" />
            <p className="text-sm">No discussions yet</p>
            <p className="text-xs">Start the conversation with other evaluators</p>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="flex gap-3">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && postMessage()}
          placeholder={isMasterApprover ? "Write a message to evaluators..." : "Write a message to other evaluators..."}
          className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none transition-all"
          disabled={isSending || !submissionId}
        />
        <button
          onClick={postMessage}
          disabled={!newMessage.trim() || isSending || !submissionId}
          className={`inline-flex items-center gap-2 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${
            isMasterApprover
              ? 'bg-linear-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 shadow-lg shadow-purple-500/25'
              : 'bg-linear-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg shadow-blue-500/25'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {isSending ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              Sending...
            </>
          ) : (
            <>
              <FontAwesomeIcon icon={faPaperPlane} className="w-4 h-4" />
              Send
            </>
          )}
        </button>
      </div>
    </div>
  );
}