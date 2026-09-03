"use client";

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

const thematicAreas = [
  "Food Production, Agricultural, Fisheries, and Natural Resource Systems",
  "Health, Nutrition, Wellness, and Community Care",
  "Education, Literacy, Skills Development, and Lifelong Learning",
  "Livelihood, Entrepreneurships; Cooperatives, MSMEs, and Local Economic Development",
  "Environment, Climate Action, Disaster Risk Reduction, and Community Resilience"
];

const paperCategories = [
  "Completed Extension Project Papers",
  "Ongoing Extension Project Papers"
];

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
          <div className={`shrink-0 mt-0.5 ${iconColor}`}>
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
            className={`shrink-0 ${textColor} hover:opacity-70 transition`}
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

export default function SubmitPage() {
  const [coAuthors, setCoAuthors] = useState(['']);
  const [chosenSuc, setChosenSuc] = useState('');
  const [showOtherSuc, setShowOtherSuc] = useState(false);
  const [otherSucName, setOtherSucName] = useState('');
  const [abstractFile, setAbstractFile] = useState(null);
  const [endorsementFile, setEndorsementFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);
  const [user, setUser] = useState(null);
  const [sucList, setSucList] = useState([]);
  const [filteredSucList, setFilteredSucList] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoadingSucs, setIsLoadingSucs] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Fetch SUCs from database
  useEffect(() => {
    const fetchSUCs = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/sucs');
        if (response.ok) {
          const data = await response.json();
          setSucList(data);
          setFilteredSucList(data);
        } else {
          console.error('Failed to fetch SUCs');
        }
      } catch (error) {
        console.error('Error fetching SUCs:', error);
      } finally {
        setIsLoadingSucs(false);
      }
    };
    
    fetchSUCs();
  }, []);

  // Check if user is logged in
  useEffect(() => {
      const userData = localStorage.getItem('pemnet_user');
      if (!userData) {
        window.location.href = '/login';
      } else {
        setUser(JSON.parse(userData));
      }
    }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter SUCs based on search term
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredSucList(sucList);
    } else {
      const filtered = sucList.filter(suc => 
        suc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (suc.abbreviation && suc.abbreviation.toLowerCase().includes(searchTerm.toLowerCase())) ||
        suc.region.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredSucList(filtered);
    }
  }, [searchTerm, sucList]);

  const showToast = (message, type) => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 5000);
  };

  const hideToast = () => {
    setToast(null);
  };

  const addCoAuthor = () => {
    setCoAuthors([...coAuthors, '']);
  };

  const removeCoAuthor = (index) => {
    const newCoAuthors = coAuthors.filter((_, i) => i !== index);
    setCoAuthors(newCoAuthors);
  };

  const handleCoAuthorChange = (index, value) => {
    const newCoAuthors = [...coAuthors];
    newCoAuthors[index] = value;
    setCoAuthors(newCoAuthors);
  };

  const handleSucSelect = (suc) => {
    setChosenSuc(suc.name);
    setShowOtherSuc(false);
    setShowDropdown(false);
    setSearchTerm(suc.name);
  };

  const handleOtherSucChange = (e) => {
    setOtherSucName(e.target.value);
    setChosenSuc(e.target.value);
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setShowDropdown(true);
  };

  const handleAddOther = () => {
    setShowOtherSuc(true);
    setShowDropdown(false);
    setSearchTerm('');
  };

  async function handleSubmit(e) {
      e.preventDefault();
      setSubmitting(true);
      setError('');
      setToast(null);

      const token = localStorage.getItem('pemnet_token');
      
      if (!token) {
          const errorMsg = 'You are not logged in. Please login again.';
          setError(errorMsg);
          showToast(errorMsg, 'error');
          setSubmitting(false);
          setTimeout(() => {
              window.location.href = '/login';
          }, 2000);
          return;
      }

      const formData = new FormData(e.target);
      const filteredCoAuthors = coAuthors.filter(c => c.trim() !== '');
      
      let finalSuc = chosenSuc;
      
      if (showOtherSuc) {
          finalSuc = otherSucName.trim();
          if (!finalSuc) {
              const errorMsg = "Please enter your SUC/Agency name.";
              setError(errorMsg);
              showToast(errorMsg, 'error');
              setSubmitting(false);
              return;
          }
      }

      if (!finalSuc) {
          const errorMsg = "Please select or enter your SUC/Agency.";
          setError(errorMsg);
          showToast(errorMsg, 'error');
          setSubmitting(false);
          return;
      }

      // Check if the SUC exists in the database, if not, add it
      const existingSuc = sucList.find(s => s.name.toLowerCase() === finalSuc.toLowerCase());
      if (!existingSuc && showOtherSuc) {
          try {
              const addResponse = await fetch('http://localhost:5000/api/sucs', {
                  method: 'POST',
                  headers: {
                      'Content-Type': 'application/json',
                      'Authorization': `Bearer ${token}`
                  },
                  body: JSON.stringify({
                      name: finalSuc,
                      region: 'Other',
                      abbreviation: '',
                      type: 'Other'
                  })
              });

              if (addResponse.ok) {
                  const newSuc = await addResponse.json();
                  setSucList([...sucList, newSuc]);
                  showToast('New SUC/Agency added to the database!', 'success');
              }
          } catch (error) {
              console.error('Error adding SUC:', error);
          }
      }

      // Build FormData for submission
      const submitData = new FormData();

      // Append all fields
      submitData.append('extension_project_title', formData.get('title'));
      submitData.append('thematic_area', formData.get('thematicArea'));
      submitData.append('paper_category', formData.get('paperCategory'));
      submitData.append('suc_agencies', finalSuc);
      submitData.append('author', formData.get('author'));
      submitData.append('presenter', formData.get('presenter'));
      submitData.append('co_authors', filteredCoAuthors.length > 0 ? filteredCoAuthors.join(', ') : '');

      if (abstractFile) {
          const safeName = abstractFile.name.replace(/[^a-zA-Z0-9._-]/g, '_');
          const safeFile = new File([abstractFile], safeName, { type: 'application/pdf' });
          submitData.append('abstract_file', safeFile);
      } else {
          const errorMsg = 'Abstract PDF file is required.';
          setError(errorMsg);
          showToast(errorMsg, 'error');
          setSubmitting(false);
          return;
      }

      if (endorsementFile) {
          const safeName = endorsementFile.name.replace(/[^a-zA-Z0-9._-]/g, '_');
          const safeFile = new File([endorsementFile], safeName, { type: 'application/pdf' });
          submitData.append('endorsement_file', safeFile);

      } else {
          const errorMsg = 'Endorsement PDF file is required.';
          setError(errorMsg);
          showToast(errorMsg, 'error');
          setSubmitting(false);
          return;
      }

      console.log('Submitting data:');
      for (let pair of submitData.entries()) {
          if (pair[0].includes('file')) {
              console.log(pair[0] + ': ' + (pair[1]?.name || 'No file'));
          } else {
              console.log(pair[0] + ': ' + pair[1]);
          }
      }

      try {
          const res = await fetch('http://localhost:5000/api/submit', {
              method: 'POST',
              headers: {
                  'Authorization': `Bearer ${token}`
              },
              body: submitData,
          });

          console.log('Response status:', res.status);
          
          let data;
          const text = await res.text();
          console.log('Response text:', text);
          
          try {
              data = JSON.parse(text);
          } catch (parseError) {
              console.error('Failed to parse JSON:', text);
              throw new Error(`Server returned non-JSON response: ${text.substring(0, 100)}`);
          }

          if (res.ok) {
              console.log('Submission successful:', data);
              showToast('Abstract submitted successfully!', 'success');
              setTimeout(() => {
                  window.location.reload();
              }, 2000);
          } else {
              console.error('Submission failed:', data);
              const errorMsg = data.detail || data.error || data.msg || 'Submission failed. Please try again.';
              setError(errorMsg);
              showToast(errorMsg, 'error');
          }
      } catch (err) {
          console.error('Submission network error:', err);
          const errorMsg = err.message || 'Network error. Is the backend running on port 5000?';
          setError(errorMsg);
          showToast(errorMsg, 'error');
      } finally {
          setSubmitting(false);
      }
  }

  if (!user) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Toast Notification */}
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={hideToast} 
        />
      )}

      {/* --- NAVIGATION --- */}
      <nav className="bg-white border-b border-slate-100 sticky top-0 z-50 shadow-sm">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-linear-to-br from-blue-50 to-emerald-50 rounded-xl p-1.5 flex items-center justify-center">
              <img src="/images/pemnet_logo.png" alt="PEMNet Logo" width={32} height={32} className="object-contain" />
            </div>
            <h1 className="text-xl font-bold text-slate-900">PEMNet</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-600">Welcome, {user.full_name}</span>
            <button 
              onClick={() => {
                localStorage.removeItem('pemnet_token');
                localStorage.removeItem('pemnet_user');
                window.location.href = '/login';
              }}
              className="text-sm text-red-600 hover:text-red-700 font-semibold"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* --- MAIN CONTENT --- */}
      <div className="py-10 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Submit Extension Project Abstract</h1>
              <p className="text-slate-500 text-sm mt-1">Upload your abstract</p>
            </div>
            <Link href="/" className="text-blue-600 hover:text-blue-700 font-semibold text-sm inline-flex items-center gap-1 transition">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
              Back to Home
            </Link>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100">
            {error && !toast && (
              <div className="bg-red-50 border border-red-100 text-red-600 text-sm p-4 rounded-xl mb-6 flex items-start gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 shrink-0 mt-0.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-10">
              {/* Section 1: Project Information */}
              <div>
                {/* Event Name */}
                <div>
                  <div className="w-full px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl text-slate-700 font-medium text-center">
                    PEMNet 1st National Extension Conference 2026
                  </div>
                </div>
                <div className="flex items-center gap-3 mb-6 mt-6">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-blue-700 font-bold text-sm">1</span>
                  </div>
                  <h2 className="text-lg font-bold text-slate-900">Project Information</h2>
                </div>
                
                <div className="space-y-5 pl-11">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Extension Project Title</label>
                    <input 
                      name="title" 
                      type="text" 
                      required 
                      placeholder="Enter project title"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none transition"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Thematic Area</label>
                      <select 
                        name="thematicArea" 
                        required 
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none transition"
                      >
                        <option value="">Select Thematic Area</option>
                        {thematicAreas.map((area) => (
                          <option key={area} value={area}>{area}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Paper Category</label>
                      <select 
                        name="paperCategory" 
                        required 
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none transition"
                      >
                        <option value="">Select Category</option>
                        {paperCategories.map((cat) => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div ref={dropdownRef}>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">SUC / Agency</label>
                    
                    {!showOtherSuc ? (
                      <div className="relative">
                        <div className="relative">
                          <input
                            type="text"
                            placeholder="Search SUC/Agency..."
                            value={searchTerm}
                            onChange={handleSearchChange}
                            onFocus={() => setShowDropdown(true)}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none transition"
                          />
                          {isLoadingSucs && (
                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                              <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
                            </div>
                          )}
                        </div>

                        {/* Dropdown */}
                        {showDropdown && (
                          <div className="absolute z-20 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                            {filteredSucList.length > 0 ? (
                              filteredSucList.map((suc) => (
                                <button
                                  key={suc.id}
                                  type="button"
                                  onClick={() => handleSucSelect(suc)}
                                  className="w-full px-4 py-2.5 text-left hover:bg-blue-50 transition flex items-center justify-between border-b border-slate-50 last:border-0"
                                >
                                  <div>
                                    <span className="text-sm font-medium text-slate-900">{suc.name}</span>
                                    {suc.abbreviation && (
                                      <span className="text-xs text-slate-500 ml-2">({suc.abbreviation})</span>
                                    )}
                                  </div>
                                  <span className="text-xs text-slate-400">{suc.region}</span>
                                </button>
                              ))
                            ) : (
                              <div className="px-4 py-3 text-sm text-slate-500">
                                No SUCs found. 
                                <button
                                  type="button"
                                  onClick={handleAddOther}
                                  className="text-blue-600 font-semibold hover:underline ml-1"
                                >
                                  Add "{searchTerm}" as new SUC
                                </button>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Selected SUC display */}
                        {chosenSuc && !showOtherSuc && (
                          <div className="mt-2 flex items-center gap-2">
                            <span className="text-sm text-emerald-600 font-medium">Selected: {chosenSuc}</span>
                            <button
                              type="button"
                              onClick={() => {
                                setChosenSuc('');
                                setSearchTerm('');
                              }}
                              className="text-xs text-red-500 hover:text-red-700"
                            >
                              Clear
                            </button>
                          </div>
                        )}

                        <button
                          type="button"
                          onClick={handleAddOther}
                          className="mt-2 text-sm text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                          </svg>
                          Can't find your SUC? Add it here
                        </button>
                      </div>
                    ) : (
                      <div>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            name="sucAgenciesOther"
                            value={otherSucName}
                            onChange={handleOtherSucChange}
                            placeholder="Enter your SUC/Agency name"
                            required
                            className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none transition"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setShowOtherSuc(false);
                              setOtherSucName('');
                              setChosenSuc('');
                            }}
                            className="px-3 py-3 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl transition"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                        <p className="text-xs text-slate-500 mt-1.5">
                          This SUC/Agency will be added when you submit.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Section 2: Authors */}
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <span className="text-emerald-700 font-bold text-sm">2</span>
                  </div>
                  <h2 className="text-lg font-bold text-slate-900">Author Information</h2>
                </div>
                
                <div className="space-y-5 pl-11">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Author</label>
                      <input 
                        name="author" 
                        type="text" 
                        required 
                        placeholder="Main Author"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none transition"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Presenter</label>
                      <input 
                        name="presenter" 
                        type="text" 
                        required 
                        placeholder="Presenter Name"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none transition"
                      />
                    </div>
                  </div>

                  {/* Co-Authors */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="block text-sm font-semibold text-slate-700">Co-Authors</label>
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
                        {coAuthors.length} {coAuthors.length === 1 ? 'Author' : 'Authors'}
                      </span>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {coAuthors.map((author, index) => (
                        <div 
                          key={index} 
                          className="flex items-center gap-1.5 px-3 h-10 bg-slate-50 border border-slate-200 rounded-xl transition-colors hover:border-blue-300 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20"
                        >
                          <span className="text-xs font-bold text-blue-600">
                            {index + 1}.
                          </span>
                          
                          <input 
                            type="text" 
                            value={author}
                            onChange={(e) => handleCoAuthorChange(index, e.target.value)}
                            placeholder={`Author ${index + 1}`}
                            className="w-32 bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
                          />

                          {coAuthors.length > 1 && (
                            <button 
                              type="button" 
                              onClick={() => removeCoAuthor(index)}
                              className="w-5 h-5 shrink-0 flex items-center justify-center rounded-full text-slate-300 hover:text-red-500 hover:bg-red-50 transition"
                              title="Remove"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3 h-3">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          )}
                        </div>
                      ))}
                    </div>

                    <button 
                      type="button" 
                      onClick={addCoAuthor}
                      className="mt-3 inline-flex items-center gap-2 px-4 h-10 rounded-xl border-2 border-dashed border-blue-300 text-blue-600 font-semibold text-sm hover:border-blue-500 hover:bg-blue-50 transition"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                      </svg>
                      Add Co-Author
                    </button>
                  </div>
                </div>
              </div>

              {/* Section 3: Files */}
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <span className="text-yellow-700 font-bold text-sm">3</span>
                  </div>
                  <h2 className="text-lg font-bold text-slate-900">File Uploads</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pl-11">
                  <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl p-6 hover:border-blue-300 transition text-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-blue-600">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                      </svg>
                    </div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Abstract PDF *</label>
                    <input 
                      type="file" 
                      accept=".pdf" 
                      required 
                      onChange={(e) => setAbstractFile(e.target.files[0])}
                      className="w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-5 file:rounded-xl file:border-0 file:bg-blue-700 file:text-white file:font-semibold hover:file:bg-blue-800 cursor-pointer transition"
                    />
                  </div>
                  <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl p-6 hover:border-blue-300 transition text-center">
                    <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-emerald-600">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
                      </svg>
                    </div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Endorsement PDF *</label>
                    <input 
                      type="file" 
                      accept=".pdf" 
                      required 
                      onChange={(e) => setEndorsementFile(e.target.files[0])}
                      className="w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-5 file:rounded-xl file:border-0 file:bg-emerald-600 file:text-white file:font-semibold hover:file:bg-emerald-700 cursor-pointer transition"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <button 
                  type="submit" 
                  disabled={submitting || loading}
                  className="w-full bg-linear-to-r from-blue-700 to-blue-800 text-white py-4 rounded-xl font-bold text-lg hover:from-blue-800 hover:to-blue-900 transition shadow-lg shadow-blue-700/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? "Submitting..." : "Submit Abstract"}
                </button>
              </div>
            </form>
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