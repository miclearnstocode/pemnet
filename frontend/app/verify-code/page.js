"use client";

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000').replace(/\/+$/, '');
const CODE_LENGTH = 6;

export default function VerifyCodePage() {
  const router = useRouter();
  const [digits, setDigits] = useState(Array(CODE_LENGTH).fill(''));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const inputsRef = useRef([]);

  useEffect(() => {
    const saved = sessionStorage.getItem('pemnet_reset_email');
    if (!saved) {
      router.replace('/forgot-password');
      return;
    }
    setEmail(saved);
    inputsRef.current[0]?.focus();
  }, [router]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

  const handleChange = (index, value) => {
    // Only digits
    const v = value.replace(/\D/g, '');
    if (!v) {
      const next = [...digits];
      next[index] = '';
      setDigits(next);
      return;
    }

    // Handle paste of multiple digits
    if (v.length > 1) {
      const next = [...digits];
      for (let i = 0; i < v.length && index + i < CODE_LENGTH; i++) {
        next[index + i] = v[i];
      }
      setDigits(next);
      const lastFilled = Math.min(index + v.length, CODE_LENGTH - 1);
      inputsRef.current[lastFilled]?.focus();
      return;
    }

    const next = [...digits];
    next[index] = v;
    setDigits(next);

    // Auto-advance
    if (index < CODE_LENGTH - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowLeft' && index > 0) inputsRef.current[index - 1]?.focus();
    if (e.key === 'ArrowRight' && index < CODE_LENGTH - 1) inputsRef.current[index + 1]?.focus();
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, CODE_LENGTH);
    const next = Array(CODE_LENGTH).fill('');
    for (let i = 0; i < text.length; i++) next[i] = text[i];
    setDigits(next);
    inputsRef.current[Math.min(text.length, CODE_LENGTH - 1)]?.focus();
  };

  const submitCode = async (code) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/api/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: code }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        sessionStorage.setItem('pemnet_reset_token', data.reset_token);
        router.push('/reset-password');
      } else {
        setError(data.detail || 'Verification failed.');
        setDigits(Array(CODE_LENGTH).fill(''));
        inputsRef.current[0]?.focus();
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Auto-submit when all 6 digits are filled
  useEffect(() => {
    const code = digits.join('');
    if (code.length === CODE_LENGTH && !loading) {
      submitCode(code);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [digits]);

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    try {
      await fetch(`${API_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      setResendCooldown(60);
      setError('');
    } catch {
      setError('Could not resend. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-50 via-blue-50 to-emerald-50 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-100 overflow-hidden">
          <div className="p-8">
            <div className="flex justify-center mb-6">
              <div className="w-14 h-14 bg-linear-to-br from-blue-500 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="white" className="w-7 h-7">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
              </div>
            </div>

            <h1 className="text-2xl font-bold text-slate-900 text-center mb-2">
              Check your email
            </h1>
            <p className="text-sm text-slate-500 text-center mb-8">
              We sent a 6-digit code to <span className="font-semibold text-slate-700">{email}</span>
            </p>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700 mb-5 text-center">
                {error}
              </div>
            )}

            <div className="flex justify-center gap-2 mb-8" onPaste={handlePaste}>
              {digits.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => (inputsRef.current[i] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  disabled={loading}
                  className="w-12 h-14 text-center text-2xl font-bold text-slate-900 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 focus:outline-none transition disabled:opacity-50"
                />
              ))}
            </div>

            <div className="text-center">
              {loading ? (
                <p className="text-sm text-slate-500">Verifying…</p>
              ) : (
                <button
                  onClick={handleResend}
                  disabled={resendCooldown > 0}
                  className="text-sm text-slate-500 hover:text-blue-600 disabled:opacity-60 disabled:cursor-not-allowed transition"
                >
                  {resendCooldown > 0
                    ? `Resend code in ${resendCooldown}s`
                    : "Didn't receive a code? Resend"}
                </button>
              )}
            </div>

            <div className="mt-6 text-center">
              <Link href="/forgot-password" className="text-sm text-slate-500 hover:text-slate-700">
                Use a different email
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}