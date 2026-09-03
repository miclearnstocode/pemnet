
'use client';

import Link from 'next/link';
import { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

// Mock Data based on the image
const newsItems = [
  {
    id: 1,
    type: 'NEWS',
    typeColor: 'bg-yellow-100 text-yellow-800',
    date: 'May 20, 2026',
    title: 'New Research Grant Opportunities',
    excerpt: 'Applications are now open for the 2026 Research Grant Program supporting innovative community-based projects.',
    tag: 'Funding',
    tagColor: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    image: 'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?q=80&w=2070&auto=format&fit=crop', // Plants
  },
  {
    id: 2,
    type: 'EVENT',
    typeColor: 'bg-blue-100 text-blue-800',
    date: 'June 15–17, 2026',
    title: 'Community Research Symposium 2026',
    excerpt: 'Join researchers, communities, and partners in a three-day symposium showcasing impactful research.',
    tag: 'Symposium',
    tagColor: 'bg-blue-50 text-blue-700 border-blue-200',
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=2070&auto=format&fit=crop', // Conference
  },
  {
    id: 3,
    type: 'ANNOUNCEMENT',
    typeColor: 'bg-green-100 text-green-800',
    date: 'May 12, 2026',
    title: 'Abstract Submission Extended',
    excerpt: 'The deadline for abstract submission has been extended to May 31, 2026. Submit your abstracts now!',
    tag: 'Deadline',
    tagColor: 'bg-green-50 text-green-700 border-green-200',
    image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?q=80&w=2070&auto=format&fit=crop', // Plant in hands
  },
  {
    id: 4,
    type: 'EVENT',
    typeColor: 'bg-purple-100 text-purple-800',
    date: 'June 28, 2026',
    title: 'Research Workshop: Data for Impact',
    excerpt: 'A hands-on workshop on data collection, analysis, and visualization for community researchers.',
    tag: 'Workshop',
    tagColor: 'bg-purple-50 text-purple-700 border-purple-200',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop', // Laptop with charts
  },
];

export default function NewsEventsPage() {
  const [activeTab, setActiveTab] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  const tabs = ['All', 'News', 'Events', 'Announcements'];

  // Filtering Logic based on Tab and Search
  const filteredItems = newsItems.filter((item) => {
    const matchesTab = activeTab === 'All' || item.type === activeTab.toUpperCase();
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] font-sans">
      <Header />

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 py-16 px-6 relative overflow-hidden">
        {/* Background Decorative Circle */}
        <div className="absolute -top-25 left-1/2 -translate-x-1/2 w-150 h-150 bg-blue-50 rounded-full blur-3xl opacity-50 pointer-events-none"></div>

        <div className="max-w-6xl mx-auto relative z-10">
          
          {/* Header Section */}
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

          {/* Tabs and Search Bar */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-10">
            <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-full p-1 shadow-sm">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all ${
                    activeTab === tab 
                      ? 'bg-blue-50 text-blue-700' 
                      : 'text-slate-600 hover:text-slate-900'
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
              <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 transition">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z" />
                </svg>
                Filter
              </button>
            </div>
          </div>

          {/* News Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredItems.map((item) => (
              <div key={item.id} className="group flex flex-col bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-lg hover:shadow-slate-200/60 hover:-translate-y-1 transition-all duration-300">
                {/* Image */}
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={item.image} 
                    alt={item.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className={`absolute top-3 left-3 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${item.typeColor}`}>
                    {item.type}
                  </div>
                </div>

                {/* Content */}
                <div className="flex flex-col flex-1 p-5">
                  <div className="text-xs font-semibold text-slate-500 mb-3">{item.date}</div>
                  <h3 className="text-lg font-bold text-slate-900 leading-snug mb-2">{item.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed mb-6 line-clamp-3">{item.excerpt}</p>

                  <div className="mt-auto flex items-center justify-between">
                    <span className={`px-3 py-1 rounded-lg text-xs font-semibold border ${item.tagColor}`}>
                      {item.tag}
                    </span>
                    <button className="text-sm font-semibold text-blue-700 hover:text-blue-900 transition flex items-center gap-1">
                      Read more
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* View All Button */}
          <div className="mt-12 flex justify-center">
            <button className="flex items-center gap-2 px-8 py-3.5 bg-white border-2 border-blue-700 text-blue-700 rounded-xl font-semibold hover:bg-blue-50 transition">
              View all news & events
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}