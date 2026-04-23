'use client';
import { useEffect, useRef } from 'react';
import { Lock, ExternalLink } from 'lucide-react';

const SAMPLE_NEWS = [
  { title: 'Reliance Industries Q3 profit surges 18% YoY, beats analyst estimates by wide margin', source: 'Economic Times', symbol: 'RELIANCE', market: 'india', sentiment: 'bullish', time: '14 min ago', locked: false },
  { title: 'HDFC Bank raises lending rates by 25 basis points amid RBI policy tightening', source: 'Business Standard', symbol: 'HDFCBANK', market: 'india', sentiment: 'bearish', time: '28 min ago', locked: false },
  { title: 'Apple iPhone 16 sales in China drop 24% in first quarter, Counterpoint data shows', source: 'Reuters', symbol: 'AAPL', market: 'international', sentiment: 'bearish', time: '45 min ago', locked: false },
  { title: 'NVIDIA data center revenue hits record $18.4 billion, stock rallies 5% after hours', source: 'CNBC', symbol: 'NVDA', market: 'international', sentiment: 'bullish', time: '1 hr ago', locked: true },
  { title: 'TCS wins $500M multi-year digital transformation deal with European bank', source: 'LiveMint', symbol: 'TCS', market: 'india', sentiment: 'bullish', time: '2 hr ago', locked: true },
  { title: 'Tesla Cybertruck recall expanded to 46,000 units over accelerator pedal issue', source: 'MarketWatch', symbol: 'TSLA', market: 'international', sentiment: 'bearish', time: '3 hr ago', locked: true },
];

const SentimentBadge = ({ s }) => (
  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${s === 'bullish' ? 'badge-bullish' : s === 'bearish' ? 'badge-bearish' : 'badge-neutral'}`}>
    {s === 'bullish' ? '🟢 Bullish' : s === 'bearish' ? '🔴 Bearish' : '🟡 Neutral'}
  </span>
);

export default function NewsPreviewSection({ onSignupClick }) {
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
    <section id="news-preview" ref={ref} className="py-24 px-4 relative">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12 fade-in-up">
          <span className="text-cyan-400 text-sm font-semibold uppercase tracking-widest">Live Preview</span>
          <h2 className="font-syne font-bold text-4xl sm:text-5xl text-white mt-3 mb-4">
            See what's <span className="gradient-text">breaking right now</span>
          </h2>
          <p className="text-slate-400 text-lg">Free users get 5 articles/day. Subscribe to unlock everything.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
          {SAMPLE_NEWS.map((article, i) => (
            <div key={i} className={`relative news-card fade-in-up ${article.locked ? 'blur-locked' : ''}`} style={{ transitionDelay: `${i * 0.1}s` }}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">{article.source}</span>
                  <span className="text-xs px-2 py-0.5 rounded glass text-slate-400">
                    {article.market === 'india' ? '🇮🇳 India' : '🌍 Global'}
                  </span>
                </div>
                <SentimentBadge s={article.sentiment} />
              </div>
              <h3 className="font-semibold text-white text-sm leading-snug mb-3">{article.title}</h3>
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-cyan-400">{article.symbol}</span>
                <span className="text-xs text-slate-500">{article.time}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Upgrade banner */}
        <div className="fade-in-up glass rounded-2xl p-8 text-center border border-cyan-500/20">
          <Lock size={32} className="text-cyan-400 mx-auto mb-4" />
          <h3 className="font-syne font-bold text-2xl text-white mb-2">Unlock Unlimited Live News</h3>
          <p className="text-slate-400 mb-6">Subscribe to Pro or Elite to access all articles, sentiment analysis, and custom alerts.</p>
          <button onClick={onSignupClick} className="btn-primary py-3 px-8">
            Subscribe Now — Starting ₹499/month
          </button>
        </div>
      </div>
    </section>
  );
}
