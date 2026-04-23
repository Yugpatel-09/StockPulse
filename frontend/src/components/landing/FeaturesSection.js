'use client';
import { useEffect, useRef } from 'react';
import { Zap, Flag, Globe, Bell, BarChart2, Briefcase } from 'lucide-react';

const FEATURES = [
  { icon: Zap, title: 'Live News Updates', desc: 'News fetched every 10 minutes from 12+ premium sources. Never miss a market-moving headline.', color: 'from-cyan-500 to-blue-500' },
  { icon: Flag, title: 'Indian Markets', desc: 'Full coverage of NSE and BSE — Nifty 50, Sensex, Bank Nifty, and every listed stock.', color: 'from-orange-500 to-red-500' },
  { icon: Globe, title: 'International Markets', desc: 'NYSE, NASDAQ, LSE and more. Track Apple, Tesla, NVIDIA and thousands of global stocks.', color: 'from-blue-500 to-purple-500' },
  { icon: Bell, title: 'Custom Stock Alerts', desc: 'Set alerts for any stock. Get notified the moment news breaks about your portfolio.', color: 'from-yellow-500 to-orange-500' },
  { icon: BarChart2, title: 'Sentiment Analysis', desc: 'Every article is auto-tagged Bullish, Bearish, or Neutral using AI-powered keyword analysis.', color: 'from-green-500 to-teal-500' },
  { icon: Briefcase, title: 'Portfolio Watchlist', desc: 'Build your personal watchlist. See only the news that matters to your investments.', color: 'from-purple-500 to-pink-500' },
];

export default function FeaturesSection() {
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
    <section id="features" ref={ref} className="py-24 px-4 relative">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <div className="fade-in-up">
            <span className="text-cyan-400 text-sm font-semibold uppercase tracking-widest">Features</span>
            <h2 className="font-syne font-bold text-4xl sm:text-5xl text-white mt-3 mb-4">
              Everything you need to<br /><span className="gradient-text">trade smarter</span>
            </h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              StockPulse aggregates, filters, and delivers the most relevant market news — so you can focus on decisions, not searching.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 stagger">
          {FEATURES.map(({ icon: Icon, title, desc, color }) => (
            <div key={title} className="fade-in-up glass glass-hover rounded-2xl p-6 group">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <Icon size={22} className="text-white" />
              </div>
              <h3 className="font-syne font-semibold text-lg text-white mb-2">{title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
