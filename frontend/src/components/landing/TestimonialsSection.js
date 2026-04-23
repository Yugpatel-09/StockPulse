'use client';
import { useEffect, useRef } from 'react';
import { Star } from 'lucide-react';

const TESTIMONIALS = [
  { name: 'Arjun Mehta', role: 'Retail Investor, Mumbai', rating: 5, review: 'StockPulse completely changed how I track my portfolio. The sentiment tags save me hours every day. Pro plan is absolutely worth it.' },
  { name: 'Priya Sharma', role: 'Day Trader, Bangalore', rating: 5, review: 'The live news feed is incredibly fast. I get Reliance and TCS news before my broker app even updates. This is a game changer for intraday trading.' },
  { name: 'Rahul Gupta', role: 'Fund Manager, Delhi', rating: 5, review: 'We use StockPulse Elite for our entire team. The international market coverage and export features are exactly what we needed.' },
  { name: 'Sarah Chen', role: 'Swing Trader, Singapore', rating: 4, review: 'Excellent coverage of Indian markets. I trade NSE stocks from Singapore and StockPulse gives me the edge I need with real-time news.' },
  { name: 'Vikram Nair', role: 'Options Trader, Chennai', rating: 5, review: 'The custom alerts feature is brilliant. I set alerts for my top 10 stocks and get notified the moment something breaks. Highly recommend.' },
  { name: 'Ananya Patel', role: 'Long-term Investor, Pune', rating: 5, review: 'Clean interface, fast news, and the bullish/bearish tags help me quickly assess market sentiment. Best stock news platform I have used.' },
];

const Stars = ({ count }) => (
  <div className="flex gap-1">
    {Array.from({ length: 5 }).map((_, i) => (
      <Star key={i} size={14} className={i < count ? 'text-yellow-400 fill-yellow-400' : 'text-slate-600'} />
    ))}
  </div>
);

export default function TestimonialsSection() {
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
    <section id="testimonials" ref={ref} className="py-24 px-4 relative">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16 fade-in-up">
          <span className="text-cyan-400 text-sm font-semibold uppercase tracking-widest">Testimonials</span>
          <h2 className="font-syne font-bold text-4xl sm:text-5xl text-white mt-3 mb-4">
            Trusted by <span className="gradient-text">thousands of traders</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 stagger">
          {TESTIMONIALS.map((t, i) => (
            <div key={i} className="fade-in-up glass glass-hover rounded-2xl p-6">
              <Stars count={t.rating} />
              <p className="text-slate-300 text-sm leading-relaxed my-4">"{t.review}"</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm">
                  {t.name.charAt(0)}
                </div>
                <div>
                  <div className="text-white font-semibold text-sm">{t.name}</div>
                  <div className="text-slate-500 text-xs">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
