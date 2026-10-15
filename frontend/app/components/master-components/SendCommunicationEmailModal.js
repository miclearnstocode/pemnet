"use client";

import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faEnvelope,
  faPaperPlane,
  faSpinner,
  faTimes,
  faCheckCircle,
  faExclamationTriangle,
} from '@fortawesome/free-solid-svg-icons';

const TEMPLATE_LABELS = {
  completed_competitive: 'Completed Paper — Competitive (Endorsed)',
  completed_non_competitive: 'Completed Paper — Non-Competitive (Downgraded)',
  ongoing: 'Ongoing Paper — Non-Competitive',
  fallback: 'Notice of Acceptance',
};

/**
 * Preview + send the communication email (acceptance / downgrade notice)
 * for a submission whose final status has ALREADY been set.
 *
 * It does not change the submission status — that is handled separately by the
 * Endorse / Downgrade actions.
 *
 * Props:
 *  - isOpen:          boolean
 *  - onClose:         () => void
 *  - submissionId:    string  (Submission.submission_id)
 *  - masterApproverId: number | string
 *  - apiUrl:          string  (no trailing slash)
 *  - onSent:          () => void  (called after a successful send, e.g. to refresh email logs)
 *  - showToast:       (message, type) => void   (optional)
 */
export default function SendCommunicationEmailModal({
  isOpen,
  onClose,
  submissionId,
  masterApproverId,
  apiUrl,
  onSent,
  showToast,
}) {
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const [confirmResend, setConfirmResend] = useState(false);

  // Load the preview each time the modal opens
  useEffect(() => {
    if (!isOpen || !submissionId) return;

    let cancelled = false;
    setPreview(null);
    setError(null);
    setConfirmResend(false);
    setLoading(true);

    (async () => {
      try {
        const res = await fetch(
          `${apiUrl}/api/submissions/${submissionId}/communication-email/preview`
        );
        const data = await res.json().catch(() => ({}));
        if (cancelled) return;
        if (res.ok) {
          setPreview(data);
        } else {
          setError(data.detail || 'Failed to load email preview');
        }
      } catch (err) {
        if (!cancelled) setError('Failed to load email preview');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [isOpen, submissionId, apiUrl]);

  const handleSend = async () => {
    // If this email was already sent once, require a second click to confirm
    if (preview?.already_sent && !confirmResend) {
      setConfirmResend(true);
      return;
    }

    setSending(true);
    setError(null);
    try {
      const res = await fetch(
        `${apiUrl}/api/submissions/${submissionId}/communication-email/send`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ master_approver_id: masterApproverId }),
        }
      );
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        showToast?.('Communication email sent to the corresponding author.', 'success');
        onSent?.();
        onClose?.();
      } else {
        setError(data.detail || 'Failed to send email');
        showToast?.(data.detail || 'Failed to send email', 'error');
      }
    } catch (err) {
      setError('Failed to send email');
      showToast?.('Failed to send email', 'error');
    } finally {
      setSending(false);
    }
  };

  if (!isOpen) return null;

  const ccList = Array.isArray(preview?.cc) ? preview.cc : [];

  return (
    <div className="fixed inset-0 z-70 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
        onClick={sending ? undefined : onClose}
      />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-100 flex items-center justify-center">
              <FontAwesomeIcon icon={faEnvelope} className="w-4 h-4 text-indigo-600" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800">Send Communication Email</h3>
              <p className="text-xs text-slate-500">
                Review the email below. Nothing is sent until you click Send.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={sending}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition disabled:opacity-50"
            title="Close"
          >
            <FontAwesomeIcon icon={faTimes} className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {loading && (
            <div className="py-16 flex flex-col items-center justify-center text-slate-400 text-sm gap-3">
              <FontAwesomeIcon icon={faSpinner} spin className="w-6 h-6" />
              Building email preview…
            </div>
          )}

          {!loading && error && !preview && (
            <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
              <FontAwesomeIcon icon={faExclamationTriangle} className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {!loading && preview && (
            <>
              {preview.already_sent && (
                <div className="flex items-start gap-3 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs">
                  <FontAwesomeIcon icon={faCheckCircle} className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>
                    This email was already sent
                    {preview.last_sent_at
                      ? ` on ${new Date(preview.last_sent_at).toLocaleString('en-US', {
                          month: 'short', day: 'numeric', year: 'numeric',
                          hour: 'numeric', minute: '2-digit',
                        })}`
                      : ''}
                    . Sending again will deliver a second copy.
                  </span>
                </div>
              )}

              {/* Envelope details */}
              <div className="rounded-xl border border-slate-200 divide-y divide-slate-100 text-sm">
                <div className="flex gap-3 px-4 py-2.5">
                  <span className="w-16 shrink-0 text-xs font-bold uppercase tracking-wide text-slate-400 pt-0.5">To</span>
                  <span className="text-slate-800 break-all">{preview.to}</span>
                </div>
                {ccList.length > 0 && (
                  <div className="flex gap-3 px-4 py-2.5">
                    <span className="w-16 shrink-0 text-xs font-bold uppercase tracking-wide text-slate-400 pt-0.5">CC</span>
                    <span className="text-slate-800 break-all">{ccList.join(', ')}</span>
                  </div>
                )}
                <div className="flex gap-3 px-4 py-2.5">
                  <span className="w-16 shrink-0 text-xs font-bold uppercase tracking-wide text-slate-400 pt-0.5">Subject</span>
                  <span className="text-slate-800 font-medium">{preview.subject}</span>
                </div>
                <div className="flex gap-3 px-4 py-2.5">
                  <span className="w-16 shrink-0 text-xs font-bold uppercase tracking-wide text-slate-400 pt-0.5">Template</span>
                  <span className="text-slate-600">
                    {TEMPLATE_LABELS[preview.template_used] || preview.template_used}
                  </span>
                </div>
              </div>

              {/* Email body — rendered in a sandboxed iframe (no scripts, isolated styles) */}
              <div className="rounded-xl border border-slate-200 overflow-hidden bg-white">
                <iframe
                  title="Email preview"
                  sandbox=""
                  srcDoc={preview.html_body}
                  className="w-full h-105 bg-white"
                />
              </div>

              {error && (
                <div className="flex items-start gap-3 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
                  <FontAwesomeIcon icon={faExclamationTriangle} className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200 bg-slate-50">
          <button
            onClick={onClose}
            disabled={sending}
            className="px-4 py-2 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-200/70 transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSend}
            disabled={loading || sending || !preview}
            className={`px-5 py-2 rounded-lg text-sm font-semibold text-white shadow-sm transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 ${
              confirmResend ? 'bg-amber-500 hover:bg-amber-600' : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
          >
            <FontAwesomeIcon
              icon={sending ? faSpinner : faPaperPlane}
              spin={sending}
              className="w-3.5 h-3.5"
            />
            {sending
              ? 'Sending…'
              : confirmResend
              ? 'Click again to send a second copy'
              : 'Send Email to Author'}
          </button>
        </div>
      </div>
    </div>
  );
}