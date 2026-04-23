'use client';
import { Zap, Twitter, Linkedin, Instagram } from 'lucide-react';

export default function Footer() {
  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

  return (
    <footer className="border-t border-slate-800/50 py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center">
                <Zap size={16} className="text-white" />
              </div>
              <span className="font-syne font-bold text-xl text-white">StockPulse</span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
              Real-time stock intelligence for Indian and International markets. Zero noise, pure signal.
            </p>
            <div className="flex gap-4 mt-6">
              {[Twitter, Linkedin, Instagram].map((Icon, i) => (
                <a key={i} href="#" className="w-9 h-9 glass rounded-lg flex items-center justify-center text-slate-400 hover:text-cyan-400 hover:border-cyan-500/30 transition-colors">
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-syne font-semibold text-white mb-4">Product</h4>
            <ul className="space-y-2">
              {[['features', 'Features'], ['how-it-works', 'How It Works'], ['pricing', 'Pricing'], ['testimonials', 'Testimonials']].map(([id, label]) => (
                <li key={id}>
                  <button onClick={() => scrollTo(id)} className="text-slate-400 hover:text-white text-sm transition-colors">{label}</button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-syne font-semibold text-white mb-4">Legal</h4>
            <ul className="space-y-2">
              {['Privacy Policy', 'Terms of Service', 'Refund Policy', 'Contact Us'].map((item) => (
                <li key={item}>
                  <a href="#" className="text-slate-400 hover:text-white text-sm transition-colors">{item}</a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800/50 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-slate-500 text-sm">© 2025 StockPulse. All rights reserved.</p>
          <p className="text-slate-600 text-xs">News data sourced from public RSS feeds. Not financial advice.</p>
        </div>
      </div>
    </footer>
  );
}
