'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';

export default function Home() {
  const [activeStep, setActiveStep] = useState(0);
  
  // StrictMode guard to prevent double interval creation in development
  const intervalStarted = useRef(false);

  // AUTO-PLAY LOGIC - Bulletproof
  useEffect(() => {
    // If StrictMode remounts, do not start a second interval
    if (intervalStarted.current) return;
    intervalStarted.current = true;

    const intervalId = setInterval(() => {
      // Functional update ensures we read the latest state (no stale closure)
      setActiveStep((prevStep) => (prevStep + 1) % 3);
    }, 3000);

    // Proper cleanup
    return () => clearInterval(intervalId);
  }, []); // Runs exactly once

  return (
    <div className="min-h-screen flex flex-col bg-white font-sans">
      <Header />

      {/* --- HERO SECTION --- */}
      <section className="relative flex-1 py-20 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* Left Column */}
          <div className="space-y-8 relative z-10">
            <div className="flex items-center gap-3">
              <div className="h-px w-8 bg-blue-700"></div>
              <p className="text-xs font-semibold tracking-widest text-blue-700 uppercase">PEMNet Extension Network</p>
            </div>
            
            <h2 className="text-5xl md:text-6xl font-serif text-slate-900 leading-[1.15] tracking-tight">
              Turn local action<br />
              into shared<br />
              <span className="text-blue-800">learning.</span>
            </h2>
            
            <p className="text-lg text-slate-600 max-w-md leading-relaxed font-light">
              Submit your extension project paper and help practitioners across the region learn from what works in their communities.
            </p>
            
            <div className="pt-2 flex items-center gap-4">
              <Link href="/login" className="bg-blue-800 text-white px-7 py-3.5 rounded-lg font-semibold hover:bg-blue-900 transition shadow-lg shadow-blue-800/10 text-sm flex items-center gap-2">
                Access submission portal
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </Link>
              <div className="text-sm text-slate-500 flex items-center gap-1">
                <span className="font-semibold text-slate-700">Open until 8/30</span> 
                <span>•</span>
                <span>3</span>
              </div>
            </div>
            
            <div className="flex items-center gap-3 pt-4">
              <div className="flex -space-x-2">
                <div className="w-8 h-8 rounded-full bg-yellow-300 border-2 border-white flex items-center justify-center text-xs font-bold text-yellow-900">JD</div>
                <div className="w-8 h-8 rounded-full bg-blue-300 border-2 border-white flex items-center justify-center text-xs font-bold text-blue-900">MS</div>
              </div>
              <p className="text-xs text-slate-500 max-w-45 leading-tight">Join 1,200+ researchers sharing impactful extension work</p>
            </div>
          </div>

          {/* Right Column - Abstract Graphic */}
          <div className="relative hidden lg:flex items-center justify-center h-125">
            
            {/* Background decorative circles - Pulsating */}
            <div className="absolute w-100 h-100 rounded-full border border-slate-200 animate-[pulse-ring_6s_ease-in-out_infinite]"></div>
            <div className="absolute w-75 h-75 rounded-full border border-slate-200 animate-[pulse-ring_6s_ease-in-out_infinite] [animation-delay:1.5s]"></div>
            <div className="absolute w-50 h-50 rounded-full border border-slate-200 animate-[pulse-ring_6s_ease-in-out_infinite] [animation-delay:3s]"></div>
            
            {/* Main Card - Gently floating */}
            <div className="relative w-80 bg-white rounded-2xl shadow-xl shadow-slate-200/50 p-6 border border-slate-100 z-10 animate-[float_8s_ease-in-out_infinite]">
              <div className="flex justify-between items-start mb-4">
                {/* Replaced "P" with logo image */}
                <img 
                  src="/images/pemnet_logo.png" 
                  alt="PEMNet Logo" 
                  className="w-10 h-10 object-contain"
                />
                <span className="text-[10px] text-slate-400">2026</span>
              </div>
              <h3 className="text-xl font-serif font-bold text-slate-900 leading-tight mb-2">
                Growing Futures:<br />
                <span className="text-blue-800">A community-based approach to food security</span>
              </h3>
              <div className="border-t border-slate-100 mt-4 pt-4 flex items-center justify-between">
                <div className="text-xs text-slate-500">Paper Submission</div>
              </div>
            </div>

            {/* Orbiting Badges Container - Rotates around the center */}
            <div className="absolute inset-0 z-20 pointer-events-none">
              
              {/* Top Right Badge (Orbits and fades in/out) */}
              <div className="absolute top-1/2 left-1/2 -mt-5 -ml-20 [--orbit-radius:260px] animate-[orbit-badge_18s_linear_infinite]">
                <div className="bg-white rounded-lg shadow-md border border-slate-100 px-4 py-3 flex items-center gap-3 animate-[fade-badge_9s_ease-in-out_infinite]">
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-emerald-600">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">Abstract accepted</p>
                    <p className="text-[10px] text-slate-500">Submission approved</p>
                  </div>
                </div>
              </div>

              {/* Bottom Left Badge (Opposite orbit and fade timing) */}
              <div className="absolute top-1/2 left-1/2 -mt-5 -ml-20 [--orbit-radius:260px] animate-[orbit-badge_18s_linear_infinite_reverse]">
                <div className="bg-white rounded-lg shadow-md border border-slate-100 px-4 py-3 flex items-center gap-3 animate-[fade-badge-reverse_9s_ease-in-out_infinite]">
                  <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-700 font-bold text-xs">JP</div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">1,000+ contributors</p>
                    <p className="text-[10px] text-slate-500">Join the network</p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* --- SUB NAVIGATION BAR --- */}
      <section className="border-t border-b border-slate-100 bg-white">
        <div className="max-w-7xl mx-auto px-6 py-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-start gap-4">
            <span className="text-sm font-semibold text-slate-400 pt-0.5">01</span>
            <div>
              <h4 className="text-sm font-bold text-slate-900 mb-1">Check eligibility for your paper</h4>
              <p className="text-xs text-slate-500 leading-relaxed">Verify requirements, topic alignment, and submission guidelines.</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <span className="text-sm font-semibold text-slate-400 pt-0.5">02</span>
            <div>
              <h4 className="text-sm font-bold text-slate-900 mb-1">Submit for conference review</h4>
              <p className="text-xs text-slate-500 leading-relaxed">Submit your abstract for evaluation by the scientific committee.</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <span className="text-sm font-semibold text-slate-400 pt-0.5">03</span>
            <div>
              <h4 className="text-sm font-bold text-slate-900 mb-1">Reach broader practitioners</h4>
              <p className="text-xs text-slate-500 leading-relaxed">Present your work at the national conference and foster collaboration.</p>
            </div>
          </div>
        </div>
      </section>

      {/* --- PROCESS / JOURNEY SECTION --- */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16">
          
          <div className="flex flex-col justify-center">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-px w-8 bg-blue-700"></div>
              <p className="text-xs font-semibold tracking-widest text-blue-700 uppercase">A simple two-step journey</p>
            </div>
            <h2 className="text-4xl md:text-5xl font-serif text-slate-900 leading-tight mb-8">
              From your community<br />
              to the network.
            </h2>
          </div>

          <div className="space-y-8">
            {/* Step 1 */}
            <div className="flex gap-6">
              <div className="flex flex-col items-center">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border animate-badge-1`}>
                  01
                </div>
                
                <div className="relative w-px h-24 my-2 bg-slate-200 overflow-hidden">
                  {/* The line starts at height 0 and animates to 100% using your fill-line */}
                  <div className="absolute top-0 left-0 w-full bg-blue-800 animate-line-1" style={{ height: '0%' }}></div>
                </div>
              </div>
              <div className="pt-1 animate-text-1">
                <h4 className="text-sm font-bold text-slate-900 mb-2">Submit your abstract</h4>
                <p className="text-sm text-slate-500 leading-relaxed max-w-sm">Share your project, results, and learning with interested colleagues.</p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex gap-6">
              <div className="flex flex-col items-center">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border animate-badge-2`}>
                  02
                </div>
                
                <div className="relative w-px h-24 my-2 bg-slate-200 overflow-hidden">
                  {/* Delayed by 3 seconds so it starts when Step 2 is active, then uses your fill-line */}
                  <div className="absolute top-0 left-0 w-full bg-blue-800 animate-line-2" style={{ height: '0%' }}></div>
                </div>
              </div>
              <div className="pt-1 animate-text-2">
                <h4 className="text-sm font-bold text-slate-900 mb-2">Complete your paper</h4>
                <p className="text-sm text-slate-500 leading-relaxed max-w-sm">Expand your abstract into a full paper and submit your final version.</p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex gap-6">
              <div className="flex flex-col items-center">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border animate-badge-3`}>
                  03
                </div>
              </div>
              <div className="pt-1 animate-text-3">
                <h4 className="text-sm font-bold text-slate-900 mb-2">Share the learning</h4>
                <p className="text-sm text-slate-500 leading-relaxed max-w-sm">Present your findings and contribute to the collective knowledge pool.</p>
              </div>
            </div>
          </div>

        </div>
      </section>

      <Footer />
    </div>
  );
}