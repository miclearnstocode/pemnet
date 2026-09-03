import Image from 'next/image';
import Navigation from './Navigation';

export default function Header() {
  return (
    <header className="bg-white border-b border-slate-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="relative w-10 h-10">
            <Image 
              src="/images/pemnet_logo.png" 
              alt="PEMNet Logo" 
              fill
              className="object-contain"
            />
          </div>
          <div className="hidden sm:block">
            <h1 className="text-lg font-bold text-slate-900 tracking-tight leading-none">PEMNet</h1>
            <p className="text-[10px] text-slate-500 -mt-0.5">Philippine Extension Managers Network</p>
          </div>
        </div>

        {/* Reusable Navigation */}
        <Navigation />

        {/* Mobile Menu Button */}
        <button className="md:hidden p-2 text-slate-600 hover:bg-slate-50 rounded-lg">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        </button>
      </div>
    </header>
  );
}