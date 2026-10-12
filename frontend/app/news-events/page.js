'use client';

import { useState, useEffect, useRef } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const API_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, '') || 'http://localhost:5000';

// Tab label → backend type value
const TYPE_MAP = {
  News: 'NEWS',
  Events: 'EVENT',
  Announcements: 'ANNOUNCEMENT',
};

// ---------- Google Drive ID extractor ----------
function extractDriveId(url) {
  if (!url || typeof url !== 'string') return null;
  const patterns = [
    /\/file\/d\/([a-zA-Z0-9_-]+)/,
    /[?&]id=([a-zA-Z0-9_-]+)/,
    /\/d\/([a-zA-Z0-9_-]+)/,
    /open\?id=([a-zA-Z0-9_-]+)/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m && m[1]) return m[1].split('?')[0].split('&')[0];
  }
  return null;
}

function getAllImageFileIds(item) {
  const ids = [];
  if (item.image_urls && item.image_urls.length > 0) {
    item.image_urls.forEach((entry) => {
      if (typeof entry === 'object' && entry?.file_id) ids.push(entry.file_id);
      else if (typeof entry === 'string') {
        const fid = extractDriveId(entry);
        if (fid) ids.push(fid);
      }
    });
  } else if (item.image_url) {
    const fid = extractDriveId(item.image_url);
    if (fid) ids.push(fid);
  }
  return ids;
}

// ---------- Image carousel ----------
function ImageCarousel({ fileIds, title, interval = 4000, fullSize = false }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    setIndex(0);
  }, [fileIds.length]);

  useEffect(() => {
    if (fileIds.length <= 1 || paused) return;
    timerRef.current = setInterval(() => {
      setIndex((i) => (i + 1) % fileIds.length);
    }, interval);
    return () => clearInterval(timerRef.current);
  }, [fileIds.length, interval, paused]);

  if (fileIds.length === 0) {
    return (
      <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
        <svg className="w-12 h-12 text-slate-300" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
        </svg>
      </div>
    );
  }

  return (
    <div
      className="relative w-full h-full overflow-hidden bg-slate-100"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div
        className="flex h-full transition-transform duration-700 ease-out"
        style={{
          width: `${fileIds.length * 100}%`,
          transform: `translateX(-${(index * 100) / fileIds.length}%)`,
        }}
      >
        {fileIds.map((fid, idx) => (
          <div
            key={`${fid}-${idx}`}
            className="relative shrink-0 h-full overflow-hidden"
            style={{ width: `${100 / fileIds.length}%` }}
          >
            {fullSize ? (
              <iframe
                src={`https://drive.google.com/file/d/${fid}/preview`}
                className="w-full h-full border-0"
                allow="autoplay"
                title={`${title} — image ${idx + 1}`}
                loading="lazy"
              />
            ) : (
              <iframe
                src={`https://drive.google.com/file/d/${fid}/preview`}
                className="absolute border-0 pointer-events-none"
                style={{
                  width: '1200px',
                  height: '675px',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%) scale(0.4)',
                  transformOrigin: 'center center',
                }}
                tabIndex={-1}
                title={`${title} — image ${idx + 1}`}
                loading="lazy"
              />
            )}
          </div>
        ))}
      </div>

      {/* Dots */}
      {fileIds.length > 1 && (
        <div className={`absolute ${fullSize ? 'bottom-4' : 'bottom-3'} left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-20`}>
          {fileIds.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIndex(idx);
              }}
              className={
                idx === index
                  ? `h-2 w-6 rounded-full bg-white shadow-md transition-all duration-300 ${fullSize ? 'h-2.5 w-8' : ''}`
                  : `h-2 w-2 rounded-full bg-white/60 hover:bg-white/80 transition-all duration-300 ${fullSize ? 'h-2.5 w-2.5' : ''}`
              }
              aria-label={`Go to image ${idx + 1}`}
            />
          ))}
        </div>
      )}

      {/* Prev / Next arrows */}
      {fileIds.length > 1 && (
        <>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIndex((i) => (i - 1 + fileIds.length) % fileIds.length);
            }}
            className={
              fullSize
                ? 'absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center opacity-100 transition z-20'
                : 'absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition z-20'
            }
            aria-label="Previous image"
          >
            <svg className={fullSize ? 'w-5 h-5' : 'w-3.5 h-3.5'} fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIndex((i) => (i + 1) % fileIds.length);
            }}
            className={
              fullSize
                ? 'absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center opacity-100 transition z-20'
                : 'absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition z-20'
            }
            aria-label="Next image"
          >
            <svg className={fullSize ? 'w-5 h-5' : 'w-3.5 h-3.5'} fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>
        </>
      )}

      {/* Counter pill (fullSize only) */}
      {fileIds.length > 1 && fullSize && (
        <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-black/50 text-white text-xs font-semibold z-20">
          {index + 1} / {fileIds.length}
        </div>
      )}
    </div>
  );
}

export default function NewsEventsPage() {
  const [activeTab, setActiveTab] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [newsItems, setNewsItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);

  const tabs = ['All', 'News', 'Events', 'Announcements'];

  useEffect(() => {
    if (selectedItem) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [selectedItem]);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') setSelectedItem(null); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Fetch news/events
  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (activeTab !== 'All') {
          params.append('type', TYPE_MAP[activeTab]);
        }
        if (searchTerm) params.append('search', searchTerm);

        const res = await fetch(`${API_URL}/api/news-events?${params}`);
        if (res.ok) {
          setNewsItems(await res.json());
          setError('');
        } else {
          setError('Failed to load news & events');
        }
      } catch (err) {
        console.error('Error fetching news:', err);
        setError('Unable to connect to the server');
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(fetchNews, 300);
    return () => clearTimeout(debounce);
  }, [activeTab, searchTerm]);

  const filteredItems = newsItems.filter((item) => {
    if (!item.is_published) return false;

    const matchesTab = activeTab === 'All' || item.type === TYPE_MAP[activeTab];
    const matchesSearch =
      !searchTerm ||
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.excerpt && item.excerpt.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesTab && matchesSearch;
  });

  const selectedImageIds = selectedItem ? getAllImageFileIds(selectedItem) : [];

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] font-sans">
      <Header />

      <main className="flex-1 py-16 px-6 relative overflow-hidden">
        <div className="absolute -top-25 left-1/2 -translate-x-1/2 w-150 h-150 bg-blue-50 rounded-full blur-3xl opacity-50 pointer-events-none"></div>

        <div className="max-w-6xl mx-auto relative z-10">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-50 rounded-2xl mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7 text-blue-700">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
              </svg>
            </div>
            <h1 className="text-4xl md:text-5xl font-serif text-slate-900 mb-4">
              News <span className="text-blue-800">&</span> Events
            </h1>
            <p className="text-slate-600 text-lg max-w-xl mx-auto">
              Stay updated with the latest research news, upcoming events, and important announcements.
            </p>
          </div>

          {/* Tabs + Search */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-10">
            <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-full p-1 shadow-sm">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all ${
                    activeTab === tab ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="relative w-full md:w-64">
                <input
                  type="text"
                  placeholder="Search news & events..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300"
                />
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Loading */}
          {loading && (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
            </div>
          )}

          {/* Error */}
          {error && !loading && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl text-center">
              {error}
            </div>
          )}

          {/* Empty */}
          {!loading && !error && filteredItems.length === 0 && (
            <div className="text-center py-20">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-16 h-16 mx-auto text-slate-300 mb-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
              <h3 className="text-lg font-semibold text-slate-900 mb-1">No results found</h3>
              <p className="text-slate-500">Try adjusting your search or filter.</p>
            </div>
          )}

          {/* Grid */}
          {!loading && !error && filteredItems.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredItems.map((item) => {
                const fileIds = getAllImageFileIds(item);
                return (
                  <div
                    key={item.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => setSelectedItem(item)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setSelectedItem(item);
                      }
                    }}
                    className="group text-left flex flex-col bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-lg hover:shadow-slate-200/60 hover:-translate-y-1 transition-all duration-300 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400"
                  >
                    <div className="relative h-48 overflow-hidden bg-slate-100">
                      <ImageCarousel fileIds={fileIds} title={item.title} />
                      <div className={`absolute top-3 left-3 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${item.type_color || 'bg-blue-100 text-blue-800'} z-10`}>
                        {item.type}
                      </div>
                    </div>

                    <div className="flex flex-col flex-1 p-5">
                      <div className="text-xs font-semibold text-slate-500 mb-3">{item.date_display}</div>
                      <h3 className="text-lg font-bold text-slate-900 leading-snug mb-2 line-clamp-2">{item.title}</h3>
                      {item.excerpt && (
                        <p className="text-sm text-slate-600 leading-relaxed mb-6 line-clamp-3">{item.excerpt}</p>
                      )}

                      <div className="mt-auto flex items-center justify-between">
                        {item.tag && (
                          <span className={`px-3 py-1 rounded-lg text-xs font-semibold border ${item.tag_color || 'bg-blue-50 text-blue-700 border-blue-200'}`}>
                            {item.tag}
                          </span>
                        )}
                        <span className="text-sm font-semibold text-blue-700 group-hover:text-blue-900 transition flex items-center gap-1 ml-auto">
                          Read more
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                          </svg>
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* ============ DETAIL MODAL ============ */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setSelectedItem(null)}
          />

          <div className="relative min-h-full flex items-center justify-center p-4 sm:p-6">
            <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-linear-to-r from-blue-50 to-indigo-50 sticky top-0 z-10">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-blue-700">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V18a2.25 2.25 0 002.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5M6 7.5h3v3H6v-3z" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${selectedItem.type_color || 'bg-blue-100 text-blue-800'}`}>
                      {selectedItem.type}
                    </span>
                    <p className="text-xs text-slate-500 mt-1">{selectedItem.date_display}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedItem(null)}
                  className="w-9 h-9 flex items-center justify-center rounded-lg bg-white hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition shrink-0"
                  aria-label="Close"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto">
                {selectedImageIds.length > 0 && (
                  <div className="bg-black border-b border-slate-200">
                    <div className="aspect-video w-full">
                      <ImageCarousel
                        fileIds={selectedImageIds}
                        title={selectedItem.title}
                        fullSize
                      />
                    </div>
                  </div>
                )}

                <div className="p-6 sm:p-8">
                  <h2 className="text-2xl sm:text-3xl font-serif text-slate-900 leading-tight mb-4">
                    {selectedItem.title}
                  </h2>

                  <div className="flex flex-wrap items-center gap-3 mb-6 pb-6 border-b border-slate-200">
                    <span className="text-sm text-slate-500 font-medium">{selectedItem.date_display}</span>
                    {selectedItem.tag && (
                      <span className={`px-3 py-1 rounded-lg text-xs font-semibold border ${selectedItem.tag_color || 'bg-blue-50 text-blue-700 border-blue-200'}`}>
                        {selectedItem.tag}
                      </span>
                    )}
                    {selectedItem.is_featured && (
                      <span className="px-3 py-1 rounded-lg text-xs font-bold bg-amber-100 text-amber-700 border border-amber-200">
                        FEATURED
                      </span>
                    )}
                  </div>

                  {selectedItem.excerpt && (
                    <p className="text-lg text-slate-700 leading-relaxed font-medium mb-6">
                      {selectedItem.excerpt}
                    </p>
                  )}

                  {selectedItem.content ? (
                    <div className="prose prose-slate max-w-none">
                      {selectedItem.content
                        .split(/\n\n+/)
                        .filter(Boolean)
                        .map((para, idx) => (
                          <p key={idx} className="text-slate-700 leading-relaxed mb-4 whitespace-pre-line">
                            {para}
                          </p>
                        ))}
                    </div>
                  ) : (
                    !selectedItem.excerpt && (
                      <p className="text-slate-500 italic">No additional details provided.</p>
                    )
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex justify-end">
                <button
                  onClick={() => setSelectedItem(null)}
                  className="px-6 py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl font-semibold text-sm transition shadow-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}