'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const API_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, '') || 'http://localhost:5000';

/* ---------- Icon SVG paths keyed by backend icon_type ---------- */
const ICON_PATHS = {
  document: (
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
  ),
  play: (
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8.688c0-.864.933-1.405 1.683-.977l7.108 4.062a1.125 1.125 0 010 1.953l-7.108 4.062A1.125 1.125 0 013 16.312V8.688zM12.75 8.688c0-.864.933-1.405 1.683-.977l7.108 4.062a1.125 1.125 0 010 1.953l-7.108 4.062a1.125 1.125 0 01-1.683-.977V8.688z" />
  ),
  question: (
    <>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
    </>
  ),
  file: (
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
  ),
  user: (
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
  ),
  wrench: (
    <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z" />
  ),
  folder: (
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
  ),
  book: (
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
  ),
  download: (
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
  ),
};

const FALLBACK_ICON = ICON_PATHS.document;

/* ---------- Color theme map ---------- */
const COLOR_MAP = {
  blue:   { bg: 'bg-blue-50',   text: 'text-blue-600',   hoverText: 'group-hover:text-blue-700',   hoverBorder: 'hover:border-blue-300',   ring: 'border-blue-600' },
  green:  { bg: 'bg-green-50',  text: 'text-green-600',  hoverText: 'group-hover:text-green-600',  hoverBorder: 'hover:border-green-300',  ring: 'border-green-600' },
  yellow: { bg: 'bg-yellow-50', text: 'text-yellow-600', hoverText: 'group-hover:text-yellow-600', hoverBorder: 'hover:border-yellow-300', ring: 'border-yellow-600' },
  purple: { bg: 'bg-purple-50', text: 'text-purple-600', hoverText: 'group-hover:text-purple-600', hoverBorder: 'hover:border-purple-300', ring: 'border-purple-600' },
  red:    { bg: 'bg-red-50',    text: 'text-red-600',    hoverText: 'group-hover:text-red-600',    hoverBorder: 'hover:border-red-300',    ring: 'border-red-600' },
  indigo: { bg: 'bg-indigo-50', text: 'text-indigo-600', hoverText: 'group-hover:text-indigo-600', hoverBorder: 'hover:border-indigo-300', ring: 'border-indigo-600' },
};

const FALLBACK_COLOR = COLOR_MAP.blue;

export default function HelpCenterPage() {
  const [topics, setTopics]     = useState([]);
  const [articles, setArticles] = useState([]);
  const [workflow, setWorkflow] = useState([]);
  const [loading, setLoading]   = useState(true);

  const [searchQuery, setSearchQuery]     = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [searching, setSearching]         = useState(false);

  /* ---------------- Fetch initial data ---------------- */
  useEffect(() => {
    const load = async () => {
      try {
        const [topicsRes, articlesRes, workflowRes] = await Promise.all([
          fetch(`${API_URL}/api/help/topics`),
          fetch(`${API_URL}/api/help/articles?featured=true`),
          fetch(`${API_URL}/api/help/workflow`),
        ]);
        if (topicsRes.ok)   setTopics(await topicsRes.json());
        if (articlesRes.ok) setArticles(await articlesRes.json());
        if (workflowRes.ok) setWorkflow(await workflowRes.json());
      } catch (err) {
        console.error('Failed to load help center data:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  /* ---------------- Search handler with debounce ---------------- */
  useEffect(() => {
    const q = searchQuery.trim();
    if (q.length < 2) {
      setSearchResults(null);
      return;
    }
    setSearching(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`${API_URL}/api/help/search?q=${encodeURIComponent(q)}`);
        if (res.ok) setSearchResults(await res.json());
      } catch (err) {
        console.error(err);
      } finally {
        setSearching(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFBFC] font-sans">
      <Header />

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 py-12 px-6">
        <div className="max-w-7xl mx-auto">

          {/* Hero Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-14">

            {/* Left: Text & Search */}
            <div>
              <h1 className="text-5xl font-bold text-blue-700 mb-4">Help Center</h1>
              <p className="text-lg text-slate-600 mb-8 max-w-lg leading-relaxed">
                Find answers to your questions, learn how to use PEMNet, and get the support you need.
              </p>

              {/* Search Box */}
              <div className="relative mb-6">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for help articles..."
                  className="w-full pl-12 pr-4 py-4 bg-white border border-blue-200 rounded-xl text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 shadow-sm"
                />
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>

                {/* Search Results Dropdown */}
                {searchResults && (
                  <div className="absolute z-30 mt-2 w-full bg-white border border-slate-200 rounded-xl shadow-lg max-h-96 overflow-y-auto">
                    {searchResults.topics.length === 0 && searchResults.articles.length === 0 ? (
                      <p className="p-4 text-sm text-slate-500 text-center">No results found.</p>
                    ) : (
                      <>
                        {searchResults.topics.map((t) => (
                          <Link
                            key={`topic-${t.id}`}
                            href={`/help-center/topics/${t.slug}`}
                            className="flex items-center gap-2 p-3 hover:bg-slate-50 border-b border-slate-100 last:border-b-0"
                          >
                            <span className="text-[10px] px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full font-semibold uppercase">Topic</span>
                            <span className="text-sm font-semibold text-slate-800 truncate">{t.title}</span>
                          </Link>
                        ))}
                        {searchResults.articles.map((a) => (
                          <Link
                            key={`article-${a.id}`}
                            href={`/help-center/articles/${a.slug}`}
                            className="flex items-center gap-2 p-3 hover:bg-slate-50 border-b border-slate-100 last:border-b-0"
                          >
                            <span className="text-[10px] px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full font-semibold uppercase">Article</span>
                            <span className="text-sm font-semibold text-slate-800 truncate">{a.title}</span>
                          </Link>
                        ))}
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Popular Searches */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm text-slate-500 font-medium">Popular searches:</span>
                {['Submit Abstract', 'Project Paper', 'Review Process', 'File Upload', 'Status'].map((term) => (
                  <button
                    key={term}
                    onClick={() => setSearchQuery(term)}
                    className="px-3 py-1.5 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full hover:bg-blue-100 transition"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>

            {/* Right: Illustration (CSS-based to match design) */}
            <div className="hidden lg:flex relative items-center justify-center h-75">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-100 h-75 bg-blue-50/50 rounded-[40px] absolute top-0 right-0"></div>
                <div className="w-24 h-24 bg-blue-50 rounded-full absolute top-10 right-10 z-10"></div>
                <div className="w-10 h-10 bg-green-100 rounded-full absolute top-24 left-20 z-10 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-green-600">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>

              <div className="relative z-20">
                <div className="w-40 h-40 bg-blue-600 rounded-[40px] flex items-end justify-center overflow-hidden shadow-xl">
                  <div className="absolute top-6 w-20 h-20 bg-[#F9C6A5] rounded-full"></div>
                  <div className="absolute top-2 left-1/2 -translate-x-1/2 w-24 h-16 bg-slate-900 rounded-t-full"></div>
                  <div className="w-full h-16 bg-[#1B4FD8] rounded-t-2xl mt-14"></div>
                </div>
                <div className="absolute -top-6 -right-6 w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-white text-3xl font-bold">?</span>
                </div>
              </div>

              <div className="absolute bottom-10 right-10 z-30 bg-white rounded-lg shadow-lg border border-slate-100 p-3 w-40">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-3 bg-blue-500 rounded"></div>
                  <div className="w-12 h-3 bg-blue-300 rounded"></div>
                </div>
                <div className="space-y-1.5">
                  <div className="w-full h-2 bg-slate-100 rounded"></div>
                  <div className="w-3/4 h-2 bg-slate-100 rounded"></div>
                  <div className="w-full h-2 bg-slate-100 rounded"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* LEFT COLUMN */}
            <div className="lg:col-span-2 space-y-8">

              {/* Browse by Topic — DYNAMIC */}
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Browse by Topic</h2>

                {loading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div key={i} className="h-44 bg-white rounded-xl border border-slate-200 animate-pulse" />
                    ))}
                  </div>
                ) : topics.length === 0 ? (
                  <div className="bg-white p-10 rounded-xl border border-slate-200 text-center">
                    <p className="text-sm text-slate-500">No topics available yet.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {topics.map((topic) => {
                      const c = COLOR_MAP[topic.color_theme] || FALLBACK_COLOR;
                      const iconPath = ICON_PATHS[topic.icon_type] || FALLBACK_ICON;
                      return (
                        <Link
                          key={topic.id}
                          href={`/help-center/topics/${topic.slug}`}
                          className={`bg-white p-6 rounded-xl border border-slate-200 shadow-sm ${c.hoverBorder} hover:shadow-md transition group`}
                        >
                          <div className={`w-12 h-12 ${c.bg} rounded-full flex items-center justify-center mb-4`}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-6 h-6 ${c.text}`}>
                              {iconPath}
                            </svg>
                          </div>
                          <h3 className="text-base font-bold text-slate-900 mb-1">{topic.title}</h3>
                          <p className="text-sm text-slate-500 leading-relaxed line-clamp-2">
                            {topic.description || 'Learn more about this topic.'}
                          </p>
                          <div className={`mt-4 text-slate-400 ${c.hoverText} transition`}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                            </svg>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* How It Works — DYNAMIC */}
              <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                <h2 className="text-2xl font-bold text-slate-900 mb-8">How It Works</h2>

                {loading ? (
                  <div className="flex items-start justify-between gap-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="flex-1 h-40 bg-slate-50 rounded-xl animate-pulse" />
                    ))}
                  </div>
                ) : workflow.length === 0 ? (
                  <p className="text-sm text-slate-500 text-center py-8">
                    Workflow steps coming soon.
                  </p>
                ) : (
                  <div className="flex items-start justify-between flex-wrap gap-4">
                    {workflow.map((step) => {
                      const c = COLOR_MAP[step.color_theme] || FALLBACK_COLOR;
                      const iconPath = ICON_PATHS[step.icon_type] || FALLBACK_ICON;
                      return (
                        <div
                          key={step.id}
                          className="flex flex-col items-center text-center flex-1 min-w-[120px]"
                        >
                          <div className={`w-10 h-10 rounded-full border-2 ${c.ring} flex items-center justify-center mb-3`}>
                            <span className={`text-sm font-bold ${c.text}`}>{step.step_number}</span>
                          </div>
                          <div className={`w-12 h-12 ${c.bg} rounded-full flex items-center justify-center mb-3`}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-6 h-6 ${c.text}`}>
                              {iconPath}
                            </svg>
                          </div>
                          <h4 className="text-sm font-bold text-slate-900 mb-1">{step.title}</h4>
                          <p className="text-xs text-slate-500">{step.description}</p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

            </div>

            {/* RIGHT COLUMN */}
            <div className="space-y-8">

              {/* Need More Help — STATIC */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 mb-2">Need More Help?</h3>
                <p className="text-sm text-slate-600 mb-6">Our support team is ready to assist you.</p>

                <div className="space-y-5">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-blue-600">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800 mb-0.5">Email Support</p>
                      <p className="text-xs text-slate-500 mb-0.5">support@pemnet.ph</p>
                      <p className="text-xs text-slate-400">We typically reply within 24 hours.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-green-600">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800 mb-0.5">Phone Support</p>
                      <p className="text-xs text-slate-500 mb-0.5">(02) 1234-5678</p>
                      <p className="text-xs text-slate-400">Monday - Friday, 8:00 AM - 5:00 PM</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-yellow-50 rounded-full flex items-center justify-center shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-yellow-600">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800 mb-0.5">Live Chat</p>
                      <p className="text-xs text-slate-500 mb-0.5">Chat with our support team</p>
                      <p className="text-xs text-slate-400">Available during office hours</p>
                    </div>
                  </div>
                </div>

                <button className="w-full mt-6 py-3 bg-white border-2 border-blue-600 text-blue-700 rounded-xl font-semibold text-sm hover:bg-blue-50 transition">
                  Contact Support →
                </button>
              </div>

              {/* Popular Articles — DYNAMIC */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Popular Articles</h3>

                {loading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="h-12 bg-slate-50 rounded-lg animate-pulse" />
                    ))}
                  </div>
                ) : articles.length === 0 ? (
                  <p className="text-sm text-slate-400 text-center py-6">
                    No articles yet.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {articles.map((article) => (
                      <Link
                        key={article.id}
                        href={`/help-center/articles/${article.slug}`}
                        className="flex items-start gap-3 group"
                      >
                        <div className="w-6 h-6 bg-slate-100 rounded flex items-center justify-center shrink-0 mt-0.5">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5 text-slate-500">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-slate-800 group-hover:text-blue-700 transition mb-0.5">
                            {article.title}
                          </p>
                          <p className="text-xs text-slate-500 line-clamp-2">
                            {article.excerpt || 'Read article'}
                          </p>
                        </div>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-slate-300 group-hover:text-blue-600 mt-1 transition">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                        </svg>
                      </Link>
                    ))}
                  </div>
                )}

                <Link href="/help-center/articles" className="block mt-6 text-sm font-semibold text-blue-700 hover:text-blue-900 transition">
                  View all articles →
                </Link>
              </div>

            </div>
          </div>

          {/* Bottom Contact Banner */}
          <div className="mt-12 bg-blue-50 rounded-2xl border border-blue-100 p-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-blue-600">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                </svg>
              </div>
              <div>
                <h4 className="text-lg font-bold text-slate-900">We're here to help!</h4>
                <p className="text-sm text-slate-600">Can't find what you're looking for? Reach out to our support team.</p>
              </div>
            </div>
            <button className="bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold text-sm hover:bg-blue-700 transition">
              Contact Support →
            </button>
          </div>

          {/* Footer Banner */}
          <div className="text-center text-xs text-slate-500 mt-8">
            PEMNet Help Center is available 24/7. Support is available during office hours.
          </div>

        </div>
      </main>
      <Footer />
    </div>
  );
}