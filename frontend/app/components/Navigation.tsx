// components/Navigation.tsx
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/news-events", label: "News & Events" },
  { href: "/about", label: "About PEMNet" },
  { href: "/help-center", label: "Help Center" },
];

export default function Navigation() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <nav className="hidden md:flex items-center gap-8">
      {navLinks.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={`relative text-sm transition-all duration-200 font-medium group
            ${
              isActive(link.href)
                ? "text-blue-700 font-semibold"
                : "text-slate-600 hover:text-blue-700"
            }
          `}
        >
          {link.label}
          
          {/* Animated Underline Effect */}
          <span
            className={`absolute left-0 -bottom-1 h-0.5 rounded-full bg-blue-700 transition-all duration-300
              ${isActive(link.href) ? "w-full" : "w-0 group-hover:w-full"}
            `}
          />
        </Link>
      ))}
      
      {/* Sign In Button */}
      <Link
        href="/login"
        className="bg-white border border-slate-300 text-slate-700 px-5 py-2 rounded-lg hover:bg-slate-50 transition shadow-sm font-semibold text-sm"
      >
        Sign in
      </Link>
    </nav>
  );
}