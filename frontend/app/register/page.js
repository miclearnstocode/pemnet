"use client";

import Link from 'next/link';
import { useState, useEffect } from 'react';

// Toast Component
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = type === 'success' ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200';
  const textColor = type === 'success' ? 'text-emerald-700' : 'text-red-700';
  const iconColor = type === 'success' ? 'text-emerald-700' : 'text-red-700';
  const progressColor = type === 'success' ? 'bg-emerald-500' : 'bg-red-500';

  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-in">
      <div className={`relative w-96 max-w-[calc(100vw-2rem)] p-4 rounded-xl border shadow-lg ${bgColor}`}>
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-100 rounded-b-xl overflow-hidden">
          <div className={`h-full ${progressColor} animate-progress-shrink`}></div>
        </div>
        
        <div className="flex items-start gap-3">
          <div className={`flex-shrink-0 mt-0.5 ${iconColor}`}>
            {type === 'success' ? (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
            )}
          </div>
          <div className={`flex-1 ${textColor}`}>
            <p className="font-semibold text-sm">
              {type === 'success' ? 'Success!' : 'Error!'}
            </p>
            <p className="text-sm">{message}</p>
          </div>
          <button 
            onClick={onClose}
            className={`flex-shrink-0 ${textColor} hover:opacity-70 transition`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [strengthLabel, setStrengthLabel] = useState('');
  const [strengthColor, setStrengthColor] = useState('bg-slate-200');
  const [passwordMatch, setPasswordMatch] = useState(true);
  const [touched, setTouched] = useState(false);

  // Real-time password strength check
  useEffect(() => {
    checkPasswordStrength(password);
  }, [password]);

  // Real-time password match check
  useEffect(() => {
    if (touched && confirmPassword) {
      setPasswordMatch(password === confirmPassword);
    }
  }, [password, confirmPassword, touched]);

  const showToast = (message, type) => {
    setToast({ message, type });
    // Auto-hide toast after 5 seconds
    setTimeout(() => {
      setToast(null);
    }, 5000);
  };

  const hideToast = () => {
    setToast(null);
  };

  const checkPasswordStrength = (value) => {
    let score = 0;
    const checks = {
      length: value.length >= 8,
      uppercase: /[A-Z]/.test(value),
      lowercase: /[a-z]/.test(value),
      number: /[0-9]/.test(value),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(value)
    };

    Object.values(checks).forEach(pass => {
      if (pass) score++;
    });

    const percentage = (score / 5) * 100;
    setPasswordStrength(percentage);

    if (score === 0) {
      setStrengthLabel('');
      setStrengthColor('bg-slate-200');
    } else if (score <= 2) {
      setStrengthLabel('Weak');
      setStrengthColor('bg-red-500');
    } else if (score <= 3) {
      setStrengthLabel('Fair');
      setStrengthColor('bg-yellow-500');
    } else if (score <= 4) {
      setStrengthLabel('Good');
      setStrengthColor('bg-blue-500');
    } else {
      setStrengthLabel('Strong');
      setStrengthColor('bg-emerald-500');
    }

    return { score, checks };
  };

  const getPasswordRequirements = (value) => {
    return {
      length: value.length >= 8,
      uppercase: /[A-Z]/.test(value),
      lowercase: /[a-z]/.test(value),
      number: /[0-9]/.test(value),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(value)
    };
  };

  async function handleRegister(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setToast(null);

    const formData = new FormData(e.target);
    const fullName = formData.get('fullName');
    const email = formData.get('email');
    const passwordValue = formData.get('password');
    const confirmPasswordValue = formData.get('confirmPassword');

    // Validate full name
    if (!fullName || fullName.trim().length < 2) {
      const errorMsg = 'Please enter your full name (minimum 2 characters).';
      setError(errorMsg);
      showToast(errorMsg, 'error');
      setLoading(false);
      return;
    }

    // Validate email
    if (!email || !email.includes('@')) {
      const errorMsg = 'Please enter a valid email address.';
      setError(errorMsg);
      showToast(errorMsg, 'error');
      setLoading(false);
      return;
    }

    // Validate password strength
    const { score } = checkPasswordStrength(passwordValue);
    if (score < 3) {
      const errorMsg = 'Password is too weak. Please use at least 8 characters with uppercase, lowercase, numbers, and special characters.';
      setError(errorMsg);
      showToast(errorMsg, 'error');
      setLoading(false);
      return;
    }

    // Validate password match
    if (passwordValue !== confirmPasswordValue) {
      const errorMsg = 'Passwords do not match!';
      setError(errorMsg);
      showToast(errorMsg, 'error');
      setLoading(false);
      return;
    }

    const data = {
      full_name: fullName.trim(),
      email: email.trim(),
      password: passwordValue,
    };

    try {
      console.log('Sending registration request:', data);
      
      const res = await fetch('http://localhost:5000/api/register', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      console.log('Response status:', res.status);
      
      if (res.ok) {
        const responseData = await res.json();
        console.log('Registration success:', responseData);
        
        const successMsg = 'Account created successfully! Redirecting to login...';
        showToast(successMsg, 'success');
        
        // Redirect after toast shows
        setTimeout(() => {
          window.location.href = '/login';
        }, 3000);
      } else {
        const errorData = await res.json().catch(() => ({}));
        console.error('Registration error response:', errorData);
        const errorMsg = errorData.detail || 'Registration failed. Please try again.';
        setError(errorMsg);
        showToast(errorMsg, 'error');
      }
    } catch (err) {
      console.error('Registration network error:', err);
      const errorMsg = 'Network error. Is the backend running on port 5000?';
      setError(errorMsg);
      showToast(errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      {/* Toast Notification */}
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={hideToast} 
        />
      )}

      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-100/50 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-emerald-100/50 rounded-full blur-3xl"></div>
      </div>

      <div className="relative w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 p-8 border border-slate-100">
          
          {/* Header */}
          <div className="text-center mb-8">
            <div className="relative w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-blue-50 to-emerald-50 rounded-2xl p-3 flex items-center justify-center">
              <img 
                src="/images/pemnet_logo.png" 
                alt="PEMNet Logo" 
                width={64} 
                height={64} 
                className="object-contain w-full h-full"
              />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Create an Account</h1>
            <p className="text-slate-500 text-sm mt-1">Join the PEMNet extension network today</p>
          </div>

          {/* Form */}
          <form className="space-y-4" onSubmit={handleRegister}>
            <div>
              <label htmlFor="fullName" className="block text-sm font-semibold text-slate-700 mb-1.5">Full Name</label>
              <input 
                type="text" 
                id="fullName" 
                name="fullName"
                placeholder="Juan Dela Cruz"
                autoComplete="name"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none transition"
                required
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-1.5">Email Address</label>
              <input 
                type="email" 
                id="email" 
                name="email"
                placeholder="you@example.com"
                autoComplete="email"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none transition"
                required
              />
            </div>

            {/* Password Field */}
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
                  autoComplete="new-password"
                  className="w-full px-4 py-3 pr-12 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none transition"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition"
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                </button>
              </div>
              
              {/* Password Strength Meter */}
              {password && (
                <div className="mt-3">
                  <div className="flex gap-1.5">
                    <div 
                      className={`h-2 flex-1 rounded-full transition-all duration-300 ${
                        passwordStrength >= 20 ? strengthColor : 'bg-slate-200'
                      }`}
                    ></div>
                    <div 
                      className={`h-2 flex-1 rounded-full transition-all duration-300 ${
                        passwordStrength >= 40 ? strengthColor : 'bg-slate-200'
                      }`}
                    ></div>
                    <div 
                      className={`h-2 flex-1 rounded-full transition-all duration-300 ${
                        passwordStrength >= 60 ? strengthColor : 'bg-slate-200'
                      }`}
                    ></div>
                    <div 
                      className={`h-2 flex-1 rounded-full transition-all duration-300 ${
                        passwordStrength >= 80 ? strengthColor : 'bg-slate-200'
                      }`}
                    ></div>
                    <div 
                      className={`h-2 flex-1 rounded-full transition-all duration-300 ${
                        passwordStrength >= 100 ? strengthColor : 'bg-slate-200'
                      }`}
                    ></div>
                  </div>
                  
                  <div className="flex justify-between items-center mt-2">
                    <p className="text-xs font-medium">
                      Strength: <span className={
                        passwordStrength <= 20 ? 'text-red-500' :
                        passwordStrength <= 40 ? 'text-yellow-600' :
                        passwordStrength <= 60 ? 'text-blue-600' :
                        passwordStrength <= 80 ? 'text-emerald-600' :
                        'text-emerald-700'
                      }>{strengthLabel}</span>
                    </p>
                    <p className="text-xs text-slate-400">
                      {Math.round(passwordStrength)}%
                    </p>
                  </div>

                  {/* Password Requirements Checklist */}
                  <div className="mt-2 grid grid-cols-2 gap-1 text-xs">
                    {(() => {
                      const checks = getPasswordRequirements(password);
                      return (
                        <>
                          <div className={`flex items-center gap-1.5 ${checks.length ? 'text-emerald-600' : 'text-slate-400'}`}>
                            <span>{checks.length ? '✅' : '⬜'}</span>
                            <span>8+ characters</span>
                          </div>
                          <div className={`flex items-center gap-1.5 ${checks.uppercase ? 'text-emerald-600' : 'text-slate-400'}`}>
                            <span>{checks.uppercase ? '✅' : '⬜'}</span>
                            <span>Uppercase</span>
                          </div>
                          <div className={`flex items-center gap-1.5 ${checks.lowercase ? 'text-emerald-600' : 'text-slate-400'}`}>
                            <span>{checks.lowercase ? '✅' : '⬜'}</span>
                            <span>Lowercase</span>
                          </div>
                          <div className={`flex items-center gap-1.5 ${checks.number ? 'text-emerald-600' : 'text-slate-400'}`}>
                            <span>{checks.number ? '✅' : '⬜'}</span>
                            <span>Number</span>
                          </div>
                          <div className={`flex items-center gap-1.5 ${checks.special ? 'text-emerald-600' : 'text-slate-400'} col-span-2`}>
                            <span>{checks.special ? '✅' : '⬜'}</span>
                            <span>Special character (!@#$%^&*)</span>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-semibold text-slate-700 mb-1.5">Confirm Password</label>
              <div className="relative">
                <input 
                  type={showConfirmPassword ? "text" : "password"} 
                  id="confirmPassword" 
                  name="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setTouched(true);
                  }}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  className={`w-full px-4 py-3 pr-12 bg-slate-50 border rounded-xl text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition ${
                    touched && confirmPassword && !passwordMatch 
                      ? 'border-red-500 focus:border-red-500' 
                      : touched && confirmPassword && passwordMatch
                      ? 'border-emerald-500 focus:border-emerald-500'
                      : 'border-slate-200 focus:border-blue-500'
                  }`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition"
                >
                  {showConfirmPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                </button>
              </div>
              
              {/* Password Match Indicator */}
              {touched && confirmPassword && (
                <div className={`mt-2 text-xs flex items-center gap-1.5 ${
                  passwordMatch ? 'text-emerald-600' : 'text-red-500'
                }`}>
                  <span>{passwordMatch ? '✅' : '❌'}</span>
                  <span>{passwordMatch ? 'Passwords match' : 'Passwords do not match'}</span>
                </div>
              )}
            </div>
            
            {/* Terms Checkbox */}
            <div className="flex items-start gap-3 text-sm mt-2">
              <input 
                type="checkbox" 
                id="terms" 
                name="terms"
                className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500/20 w-4 h-4" 
                required
              />
              <label htmlFor="terms" className="text-slate-500 leading-relaxed">
                I agree to the <a href="#" className="text-blue-700 font-semibold hover:underline">Terms of Service</a> and <a href="#" className="text-blue-700 font-semibold hover:underline">Privacy Policy</a>
              </label>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-blue-700 text-white py-3 rounded-xl font-semibold hover:bg-blue-800 transition shadow-lg shadow-blue-700/20 mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Creating Account..." : "Sign Up"}
            </button>
          </form>

          <div className="mt-8 text-center border-t border-slate-100 pt-6">
            <p className="text-sm text-slate-500">
              Already have an account?{' '}
              <Link href="/login" className="text-yellow-600 font-bold hover:text-yellow-700 transition">
                Sign In
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

      {/* Tailwind animations */}
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
        @keyframes progressShrink {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
        .animate-slide-in {
          animation: slideIn 0.3s ease-out;
        }
        .animate-progress-shrink {
          animation: progressShrink 5s linear forwards;
        }
      `}</style>
    </div>
  );
}