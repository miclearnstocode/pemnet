"use client";

import Link from 'next/link';
import { useState, useCallback, useEffect } from 'react';
import Footer from '../components/Footer';

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockTimer, setLockTimer] = useState(0);

  // Load attempts from localStorage
  useEffect(() => {
    const savedAttempts = localStorage.getItem('login_attempts');
    if (savedAttempts) {
      const data = JSON.parse(savedAttempts);
      const now = Date.now();
      // Reset if more than 15 minutes old
      if (now - data.timestamp > 15 * 60 * 1000) {
        localStorage.removeItem('login_attempts');
        setAttempts(0);
      } else {
        setAttempts(data.count);
        if (data.count >= 5) {
          setIsLocked(true);
          const remaining = Math.ceil((15 * 60 * 1000 - (now - data.timestamp)) / 1000);
          setLockTimer(remaining);
        }
      }
    }
  }, []);

  // Lock timer countdown
  useEffect(() => {
    let interval;
    if (isLocked && lockTimer > 0) {
      interval = setInterval(() => {
        setLockTimer((prev) => {
          if (prev <= 1) {
            setIsLocked(false);
            localStorage.removeItem('login_attempts');
            setAttempts(0);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isLocked, lockTimer]);

  const togglePasswordVisibility = useCallback(() => {
    setShowPassword((prev) => !prev);
  }, []);

  const handleFailedAttempt = () => {
    const newAttempts = attempts + 1;
    setAttempts(newAttempts);
    
    localStorage.setItem('login_attempts', JSON.stringify({
      count: newAttempts,
      timestamp: Date.now()
    }));

    if (newAttempts >= 5) {
      setIsLocked(true);
      setLockTimer(15 * 60); // 15 minutes
      setError('Too many failed attempts. Please wait 15 minutes before trying again.');
    }
  };

  async function handleLogin(e) {
    e.preventDefault();
    setError('');
    
    // Check if locked
    if (isLocked) {
      setError(`Account temporarily locked. Please wait ${Math.ceil(lockTimer / 60)} minutes.`);
      return;
    }

    // Validate inputs
    if (!email || !email.trim()) {
      setError('Please enter your email address.');
      return;
    }

    if (!password || password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);

    try {
      // Sanitize inputs - trim and validate
      const sanitizedEmail = email.trim().toLowerCase();
      const sanitizedPassword = password;
      
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/login`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ 
          email: sanitizedEmail, 
          password: sanitizedPassword 
        }),
      });

      if (res.ok) {
        const data = await res.json();
        
        // Reset attempts on successful login
        localStorage.removeItem('login_attempts');
        setAttempts(0);
        
        // Clear ALL old localStorage data first
        localStorage.removeItem('pemnet_token');
        localStorage.removeItem('pemnet_user');
        
        // Store fresh user data
        localStorage.setItem('pemnet_user', JSON.stringify(data.user));
        
        console.log('User role:', data.user.role);
        
        // Redirect based on role
        if (data.user.role === 'evaluator' || data.user.role === 'admin' || data.user.role === 'staff') {
          window.location.href = '/review';
        } else if (data.user.role === 'master_approver') {
          window.location.href = '/master-review';
        } else if (data.user.role === 'treasurer') {
          window.location.href = '/treasurer';
        } else {
          window.location.href = '/submit';
        }
      } else {
        const errData = await res.json().catch(() => ({}));
        // Generic error message for security
        setError('Invalid credentials. Please check your credentials properly.');
        handleFailedAttempt();
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Unable to connect to the server. Please try again later.');
      handleFailedAttempt();
    } finally {
      setLoading(false);
    }
  }

  // Format lock timer
  const formatLockTime = () => {
    const minutes = Math.floor(lockTimer / 60);
    const seconds = lockTimer % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-100/50 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-emerald-100/50 rounded-full blur-3xl"></div>
      </div>

      <div className="relative w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 p-8 border border-slate-100">

          {/* Header */}
          <div className="text-center mb-8">
            <div className="relative w-20 h-20 mx-auto mb-4 bg-linear-to-br from-blue-50 to-emerald-50 rounded-2xl p-3 flex items-center justify-center">
              <img
                src="/images/pemnet_logo.png"
                alt="PEMNet Logo"
                width={64}
                height={64}
                className="object-contain w-full h-full"
              />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Welcome back</h1>
            <p className="text-slate-500 text-sm mt-1">Sign in to access your extension network dashboard</p>
          </div>

          {/* Form */}
          <form className="space-y-5" onSubmit={handleLogin}>
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-1.5">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                disabled={isLocked}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none transition disabled:opacity-50 disabled:cursor-not-allowed"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-slate-700 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  disabled={isLocked}
                  className="w-full px-4 py-3 pr-12 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none transition disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  aria-pressed={showPassword}
                  title={showPassword ? "Hide password" : "Show password"}
                  tabIndex={0}
                  disabled={isLocked}
                  className="absolute inset-y-0 right-0 z-10 flex items-center justify-center w-12 h-full text-slate-400 hover:text-slate-600 hover:bg-slate-100/50 rounded-lg transition cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 pointer-events-none" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 pointer-events-none" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                </button>
              </div>
              {isLocked && (
                <p className="mt-2 text-sm text-red-600">
                  Account locked. Try again in {formatLockTime()}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-slate-600 cursor-pointer">
                <input type="checkbox" className="rounded border-slate-300 text-blue-600 focus:ring-blue-500/20 w-4 h-4" />
                Remember me
              </label>
              <a href="#" className="text-blue-600 hover:text-blue-700 font-semibold transition">Forgot password?</a>
            </div>

            <button
              type="submit"
              disabled={loading || isLocked}
              className="w-full bg-blue-700 text-white py-3 rounded-xl font-semibold hover:bg-blue-800 transition shadow-lg shadow-blue-700/20 mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Signing in..." : isLocked ? "Account Locked" : "Sign In"}
            </button>
          </form>

          {/* Error Message */}
          {error && (
            <div className="mt-4 bg-red-50 border border-red-100 text-red-600 text-sm p-4 rounded-xl flex items-start gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 shrink-0 mt-0.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
              {error}
            </div>
          )}

          <div className="mt-8 text-center border-t border-slate-100 pt-6">
            <p className="text-sm text-slate-500">
              Don't have an account?{' '}
              <Link href="/register" className="text-yellow-600 font-bold hover:text-yellow-700 transition">
                Sign Up Now
              </Link>
            </p>
          </div>

          <div className="mt-4 text-center">
            <Link href="/" className="text-xs text-slate-400 hover:text-slate-600 transition inline-flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3 h-3">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}