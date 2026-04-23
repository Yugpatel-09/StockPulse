'use client';
import { useEffect, useRef } from 'react';
import { UserPlus, SlidersHorizontal, Rss } from 'lucide-react';

const STEPS = [
  { icon: UserPlus, num: '01', title: 'Sign Up & Choose Your Plan', desc: 'Create your free account in 30 seconds. Pick the plan that fits your trading style — Free, Pro, or Elite.' },
  { icon: SlidersHorizontal, num: '02', title: 'Select Stocks & Markets', desc: 'Build your watchlist with Indian and International stocks. Set custom alerts for the symbols you care about.' },
  { icon: Rss, num: '03', title: 'Get Live News Instantly', desc: 'News from 12+ sources hits your feed every 10 minutes. Filter by sentiment, sector, or market in one click.' },
];

export default function HowItWorksSection() {
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && e.target.querySelectorAll('.fade-in-up').forEach((el) => el.classList.add('visible'))),
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="how-it-works" ref={ref} className="py-24 px-4 relative overflow-hidden">
      <div className="orb w-96 h-96 bg-blue-600/5 top-0 right-0 pointer-events-none" />
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16 fade-in-up">
          <span className="text-cyan-400 text-sm font-semibold uppercase tracking-widest">How It Works</span>
          <h2 className="font-syne font-bold text-4xl sm:text-5xl text-white mt-3 mb-4">
            Up and running in <span className="gradient-text">3 steps</span>
          </h2>
        </div>

        <div className="relative">
          {/* Connecting line */}
          <div className="hidden lg:block absolute top-16 left-1/6 right-1/6 h-0.5 bg-gradient-to-r from-cyan-500/20 via-cyan-500/60 to-cyan-500/20" style={{ left: '20%', right: '20%' }} />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 stagger">
            {STEPS.map(({ icon: Icon, num, title, desc }) => (
              <div key={num} className="fade-in-up text-center group">
                <div className="relative inline-block mb-6">
                  <div className="w-20 h-20 rounded-2xl glass border border-cyan-500/20 flex items-center justify-center mx-auto group-hover:border-cyan-500/60 transition-all group-hover:glow-cyan">
                    <Icon size={32} className="text-cyan-400" />
                  </div>
                  <span className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-xs font-bold text-white font-syne">
                    {num.slice(1)}
                  </span>
                </div>
                <h3 className="font-syne font-semibold text-xl text-white mb-3">{title}</h3>
                <p className="text-slate-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
