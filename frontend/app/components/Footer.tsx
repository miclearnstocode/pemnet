// app/components/Footer.tsx
import Image from 'next/image';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-slate-100 py-10 mt-auto">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            {/* Replaced "P" with logo image */}
            <div className="relative w-8 h-8">
              <Image 
                src="/images/pemnet_logo.png" 
                alt="PEMNet" 
                fill
                className="object-contain"
              />
            </div>
            <p className="font-bold text-slate-800 text-sm">PEMNet</p>
          </div>
          <div className="flex gap-8 text-xs text-slate-500">
            <Link href="#" className="hover:text-slate-900 transition">Terms of service</Link>
            <Link href="#" className="hover:text-slate-900 transition">Privacy Policy</Link>
            <Link href="#" className="hover:text-slate-900 transition">Cookies</Link>
          </div>
          <div className="text-xs text-slate-500">
            © 2026 PEMNet. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}