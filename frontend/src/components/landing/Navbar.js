'use client';
import { useState, useEffect } from 'react';
import { Zap, Menu, X } from 'lucide-react';

export default function Navbar({ onLoginClick, onSignupClick }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMobileOpen(false);
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'glass border-b border-slate-800/50' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => scrollTo('hero')}>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center">
              <Zap size={16} className="text-white" />
            </div>
            <span className="font-syne font-bold text-xl text-white">StockPulse</span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {['features', 'how-it-works', 'pricing', 'testimonials', 'faq'].map((id) => (
              <button
                key={id}
                onClick={() => scrollTo(id)}
                className="text-slate-400 hover:text-white text-sm font-medium transition-colors capitalize"
              >
                {id === 'how-it-works' ? 'How It Works' : id.charAt(0).toUpperCase() + id.slice(1)}
              </button>
            ))}
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <button onClick={onLoginClick} className="btn-secondary text-sm py-2 px-4">Login</button>
            <button onClick={onSignupClick} className="btn-primary text-sm py-2 px-4">Sign Up</button>
          </div>

          {/* Mobile toggle */}
          <button className="md:hidden text-slate-400" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden glass border-t border-slate-800/50 px-4 py-4 space-y-3">
          {['features', 'how-it-works', 'pricing', 'testimonials', 'faq'].map((id) => (
            <button key={id} onClick={() => scrollTo(id)} className="block w-full text-left text-slate-400 hover:text-white py-2 text-sm capitalize">
              {id === 'how-it-works' ? 'How It Works' : id.charAt(0).toUpperCase() + id.slice(1)}
            </button>
          ))}
          <div className="flex gap-3 pt-2">
            <button onClick={() => { onLoginClick(); setMobileOpen(false); }} className="btn-secondary text-sm py-2 px-4 flex-1">Login</button>
            <button onClick={() => { onSignupClick(); setMobileOpen(false); }} className="btn-primary text-sm py-2 px-4 flex-1">Sign Up</button>
          </div>
        </div>
      )}
    </nav>
  );
}
