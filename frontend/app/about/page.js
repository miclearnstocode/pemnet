'use client';

import Link from 'next/link';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function AboutPEMNetPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] font-sans">
      <Header />

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 py-16 px-6 relative overflow-hidden">
        {/* Background decorative gradient circle */}
        <div className="absolute -top-25 left-1/2 -translate-x-1/2 w-175 h-175 bg-blue-50 rounded-full blur-3xl opacity-60 pointer-events-none"></div>

        <div className="max-w-6xl mx-auto relative z-10">
          
          {/* Header Section */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-50 rounded-2xl mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7 text-blue-700">
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
              </svg>
            </div>
            <h1 className="text-4xl md:text-5xl font-serif text-slate-900 mb-4">
              About <span className="text-blue-800">PEMnet</span>
            </h1>
            <p className="text-slate-600 text-lg max-w-3xl mx-auto leading-relaxed">
              PEMNet (Philippine Extension and Research Management Network) is a collaborative platform that connects researchers, extension workers, institutions, and communities to promote impactful research, knowledge sharing, and sustainable development.
            </p>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-16">
            {/* Stat 1 */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 flex items-center gap-4 shadow-sm hover:shadow-md transition">
              <div className="w-14 h-14 rounded-xl bg-blue-50 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7 text-blue-600">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                </svg>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">85+</div>
                <div className="text-sm text-slate-600 font-semibold">Member Institutions</div>
                <div className="text-xs text-slate-500">Across the Philippines</div>
              </div>
            </div>

            {/* Stat 2 */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 flex items-center gap-4 shadow-sm hover:shadow-md transition">
              <div className="w-14 h-14 rounded-xl bg-green-50 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7 text-green-600">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                </svg>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">3,250+</div>
                <div className="text-sm text-slate-600 font-semibold">Research Projects</div>
                <div className="text-xs text-slate-500">Completed & Ongoing</div>
              </div>
            </div>

            {/* Stat 3 */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 flex items-center gap-4 shadow-sm hover:shadow-md transition">
              <div className="w-14 h-14 rounded-xl bg-yellow-50 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7 text-yellow-600">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                </svg>
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-600">12,480+</div>
                <div className="text-sm text-slate-600 font-semibold">Researchers &</div>
                <div className="text-xs text-slate-500">Extensionists</div>
              </div>
            </div>

            {/* Stat 4 */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 flex items-center gap-4 shadow-sm hover:shadow-md transition">
              <div className="w-14 h-14 rounded-xl bg-purple-50 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7 text-purple-600">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m-15.432 0A8.959 8.959 0 013 12c0-.778.099-1.533.284-2.253" />
                </svg>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">250+</div>
                <div className="text-sm text-slate-600 font-semibold">Communities</div>
                <div className="text-xs text-slate-500">Engaged Nationwide</div>
              </div>
            </div>
          </div>

          {/* Two Column Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-16">
            
            {/* Left Card: What is PEMNet? */}
            <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">What is PEMNet?</h2>
              <p className="text-slate-600 mb-8 leading-relaxed">
                PEMNet is a unified network that supports the entire research and extension ecosystem from project development, management, and dissemination to community engagement and impact assessment.
              </p>

              {/* Network Illustration / Hub */}
              <div className="flex justify-center mb-8">
                <div className="relative w-64 h-64">
                  {/* Center Hub */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-blue-600 rounded-full flex flex-col items-center justify-center text-white shadow-lg z-10">
                    <span className="font-bold text-sm leading-tight text-center">PEMNet</span>
                    <span className="text-[10px] text-blue-100">Network</span>
                  </div>
                  
                  {/* Connecting lines (simple approach) */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-40 h-40 border border-slate-200 rounded-full animate-[spin_30s_linear_infinite]"></div>
                  </div>
                  
                  {/* Avatar nodes */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-yellow-200 border-2 border-white shadow-md flex items-center justify-center overflow-hidden z-20">
                    <span className="text-xs font-bold text-yellow-900">MS</span>
                  </div>
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-blue-200 border-2 border-white shadow-md flex items-center justify-center overflow-hidden z-20">
                    <span className="text-xs font-bold text-blue-900">JD</span>
                  </div>
                  <div className="absolute top-1/2 left-0 -translate-y-1/2 w-10 h-10 rounded-full bg-green-200 border-2 border-white shadow-md flex items-center justify-center overflow-hidden z-20">
                    <span className="text-xs font-bold text-green-900">R</span>
                  </div>
                  <div className="absolute top-1/2 right-0 -translate-y-1/2 w-10 h-10 rounded-full bg-purple-200 border-2 border-white shadow-md flex items-center justify-center overflow-hidden z-20">
                    <span className="text-xs font-bold text-purple-900">P</span>
                  </div>
                  <div className="absolute top-1/3 right-2 w-8 h-8 rounded-full bg-red-200 border-2 border-white shadow-md flex items-center justify-center overflow-hidden z-20">
                    <span className="text-xs font-bold text-red-900">A</span>
                  </div>
                  <div className="absolute bottom-1/4 left-2 w-8 h-8 rounded-full bg-indigo-200 border-2 border-white shadow-md flex items-center justify-center overflow-hidden z-20">
                    <span className="text-xs font-bold text-indigo-900">S</span>
                  </div>
                  {/* Small Center Floating icons */}
                  <div className="absolute top-1/3 left-8 w-8 h-8 bg-white rounded-xl border border-slate-200 shadow-sm flex items-center justify-center text-green-600 z-20">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
                    </svg>
                  </div>
                  <div className="absolute top-1/2 right-8 w-8 h-8 bg-white rounded-xl border border-slate-200 shadow-sm flex items-center justify-center text-blue-600 z-20">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-green-600 mt-0.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm text-slate-600">Facilitate collaboration among SUCs, researchers, and communities</span>
                </div>
                <div className="flex items-start gap-3">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-green-600 mt-0.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm text-slate-600">Promote transparency and efficiency in research management</span>
                </div>
                <div className="flex items-start gap-3">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-green-600 mt-0.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm text-slate-600">Support evidence-based decision making and policy development</span>
                </div>
                <div className="flex items-start gap-3">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-green-600 mt-0.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm text-slate-600">Advance sustainable development through knowledge and innovation</span>
                </div>
              </div>
            </div>

            {/* Right Card: Mission, Vision, Values */}
            <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm flex flex-col gap-6">
              
              {/* Mission */}
              <div className="flex gap-4">
                <div className="shrink-0">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-blue-600">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6.115 5.19l.319 1.913A6 6 0 008.11 10.36L9.75 12l-.387.775c-.217.433-.132.956.21 1.298l1.348 1.348c.21.21.329.497.329.795v1.089c0 .426.24.815.622 1.006l.153.076c.433.217.956.132 1.298-.21l.723-.723a8.7 8.7 0 002.288-4.042 1.087 1.087 0 00-.358-1.099l-1.33-1.108c-.251-.21-.582-.299-.905-.245l-1.17.195a1.125 1.125 0 01-.98-.314l-.295-.295a1.125 1.125 0 010-1.591l.13-.132a1.125 1.125 0 011.3-.21l.603.302a.809.809 0 001.086-1.086L14.25 7.5l1.256-.837a4.5 4.5 0 001.528-1.732l.146-.292M6.115 5.19A9 9 0 1017.18 4.64M6.115 5.19A8.965 8.965 0 0112 3c1.929 0 3.716.607 5.18 1.64" />
                    </svg>
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Our Mission</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    To empower researchers and extension practitioners by providing a dynamic platform for collaboration, knowledge sharing, and community engagement for national development.
                  </p>
                </div>
              </div>

              {/* Vision */}
              <div className="flex gap-4">
                <div className="shrink-0">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-blue-600">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Our Vision</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    A connected research and extension community driving innovation, sustainability, and inclusive growth throughout the Philippines.
                  </p>
                </div>
              </div>

              {/* Core Values */}
              <div className="flex gap-4">
                <div className="shrink-0">
                  <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-green-600">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 9.75c0-1.036.84-1.875 1.875-1.875h2.25c1.036 0 1.875.84 1.875 1.875v.001a1.875 1.875 0 01-1.875 1.875h-2.25A1.875 1.875 0 019 9.75v-.001zm-1.5 3.281a3.187 3.187 0 002.995-1.872 3.187 3.187 0 002.995 1.872c.242 0 .478-.026.707-.079a4.5 4.5 0 01-8.404 0c.228.053.464.079.707.079zM9 15h6" />
                    </svg>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-slate-900 mb-3">Core Values</h3>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-4 py-1.5 rounded-full border border-green-200 bg-green-50 text-green-700 text-xs font-semibold">Collaboration</span>
                    <span className="px-4 py-1.5 rounded-full border border-green-200 bg-green-50 text-green-700 text-xs font-semibold">Integrity</span>
                    <span className="px-4 py-1.5 rounded-full border border-green-200 bg-green-50 text-green-700 text-xs font-semibold">Excellence</span>
                    <span className="px-4 py-1.5 rounded-full border border-green-200 bg-green-50 text-green-700 text-xs font-semibold">Sustainability</span>
                    <span className="px-4 py-1.5 rounded-full border border-green-200 bg-green-50 text-green-700 text-xs font-semibold">Inclusivity</span>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* What We Do Section */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-slate-900">What We Do</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            
            {/* Card 1 */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition flex flex-col">
              <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-blue-600">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
                </svg>
              </div>
              <h4 className="text-base font-bold text-slate-900 mb-2">Research Management</h4>
              <p className="text-sm text-slate-600 leading-relaxed">Streamline the submission, review, and monitoring of research proposals and projects.</p>
            </div>

            {/* Card 2 */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition flex flex-col">
              <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-green-600">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                </svg>
              </div>
              <h4 className="text-base font-bold text-slate-900 mb-2">Knowledge Sharing</h4>
              <p className="text-sm text-slate-600 leading-relaxed">Provide access to research outputs, publications, and best practices.</p>
            </div>

            {/* Card 3 */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition flex flex-col">
              <div className="w-12 h-12 rounded-xl bg-yellow-50 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-yellow-600">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                </svg>
              </div>
              <h4 className="text-base font-bold text-slate-900 mb-2">Community Engagement</h4>
              <p className="text-sm text-slate-600 leading-relaxed">Connect researchers with communities to address real-world challenges.</p>
            </div>

            {/* Card 4 */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition flex flex-col">
              <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-purple-600">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
                </svg>
              </div>
              <h4 className="text-base font-bold text-slate-900 mb-2">Capacity Building</h4>
              <p className="text-sm text-slate-600 leading-relaxed">Offer trainings, webinars, and resources to strengthen research and extension capabilities.</p>
            </div>

            {/* Card 5 */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition flex flex-col">
              <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-blue-600">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 110-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38c-.551.318-1.26.117-1.527-.461a20.845 20.845 0 01-1.44-4.282m3.102.069a18.03 18.03 0 01-.59-4.59c0-1.586.205-3.124.59-4.59m0 9.18a23.848 23.848 0 018.835 2.535M10.34 6.66a23.847 23.847 0 008.835-2.535m0 0A23.74 23.74 0 0018.795 3m.38 1.125a23.91 23.91 0 011.014 5.395m-1.014 8.855c-.118.38-.245.754-.38 1.125m.38-1.125a23.91 23.91 0 001.014-5.395m0-3.46c.495.413.811 1.035.811 1.73 0 .695-.316 1.317-.811 1.73m0-3.46a24.347 24.347 0 010 3.46" />
                </svg>
              </div>
              <h4 className="text-base font-bold text-slate-900 mb-2">Information Dissemination</h4>
              <p className="text-sm text-slate-600 leading-relaxed">Share news, events, and opportunities to keep members informed and updated.</p>
            </div>

          </div>

        </div>
      </main>

      <Footer/>
    </div>
  );
}