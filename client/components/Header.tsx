'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Search, X, Menu, ChevronRight } from 'lucide-react';
import { CATEGORIES } from '../lib/api';

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (searchOpen) searchRef.current?.focus();
  }, [searchOpen]);

  return (
    <>
      <header className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/80 backdrop-blur-md shadow-sm border-b border-slate-100'
          : 'bg-white border-b border-slate-100'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">

            {/* Logo */}
            <Link href="/" className="flex items-center gap-1 flex-shrink-0">
              <span className="text-2xl font-extrabold text-[#E11D48]">Pulse</span>
              <span className="text-2xl font-extrabold text-[#0F172A]">Hub</span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-8">
              {CATEGORIES.map(cat => (
                <Link
                  key={cat}
                  href={cat === 'Home' ? '/' : `/category/${cat.toLowerCase()}`}
                  className="nav-link"
                >
                  {cat}
                </Link>
              ))}
            </nav>

            {/* Right Side */}
            <div className="flex items-center gap-3">

              {/* Search */}
              {searchOpen ? (
                <div className="flex items-center gap-2 bg-slate-100 rounded-full px-4 py-2">
                  <input
                    ref={searchRef}
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && searchQuery.trim()) {
                        window.location.href = `/search?q=${encodeURIComponent(searchQuery.trim())}`;
                      }
                    }}
                    placeholder="Search stories..."
                    className="bg-transparent text-sm outline-none w-40 text-slate-800 placeholder-slate-400"
                  />
                  {searchQuery && (
                    <button onClick={() => {
                      window.location.href = `/search?q=${encodeURIComponent(searchQuery.trim())}`;
                    }}>
                      <Search size={14} className="text-[#E11D48]" />
                    </button>
                  )}
                  <button onClick={() => { setSearchOpen(false); setSearchQuery(''); }}>
                    <X size={16} className="text-slate-400 hover:text-slate-700" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setSearchOpen(true)}
                  className="p-2 rounded-full hover:bg-slate-100 transition-colors"
                >
                  <Search size={18} className="text-slate-600" />
                </button>
              )}


              {/* Mobile menu button */}
              <button
                className="md:hidden p-2 rounded-lg hover:bg-slate-100"
                onClick={() => setMenuOpen(!menuOpen)}
              >
                {menuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>

            </div>
          </div>
        </div>

        {/* Breaking news ticker */}
        <div className="bg-[#E11D48] text-white text-xs py-1.5 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 flex items-center gap-3">
            <span className="bg-white text-[#E11D48] font-black px-2 py-0.5 rounded text-xs uppercase tracking-wider flex-shrink-0">
              Live
            </span>
            <span className="opacity-90 truncate">
              Welcome to PulseHub — Your source for breaking news and trending stories
            </span>
          </div>
        </div>
      </header>

      {/* Mobile slide menu */}
      {menuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMenuOpen(false)} />
          <div className="absolute top-0 right-0 h-full w-72 bg-white shadow-2xl flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <span className="font-extrabold text-lg">
                <span className="text-[#E11D48]">Pulse</span>
                <span className="text-[#0F172A]">Hub</span>
              </span>
              <button onClick={() => setMenuOpen(false)}>
                <X size={20} className="text-slate-500" />
              </button>
            </div>
            <nav className="flex flex-col p-4 gap-1 flex-1">
              {CATEGORIES.map(cat => (
                <Link
                  key={cat}
                  href={cat === 'Home' ? '/' : `/category/${cat.toLowerCase()}`}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center justify-between px-4 py-3 rounded-xl hover:bg-slate-50 text-slate-700 font-medium"
                >
                  {cat}
                  <ChevronRight size={16} className="text-slate-400" />
                </Link>
              ))}
            </nav>
            
          </div>
        </div>
      )}
    </>
  );
}