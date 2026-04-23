'use client';
import { useEffect, useRef } from 'react';
import { ArrowRight, TrendingUp, TrendingDown } from 'lucide-react';

const FloatingCard = ({ title, symbol, sentiment, time, style }) => (
  <div className="absolute glass rounded-xl p-3 text-xs w-52 shadow-2xl" style={style}>
    <div className="flex items-center justify-between mb-1">
      <span className="font-semibold text-cyan-400 font-dm">{symbol}</span>
      <span className={`px-2 py-0.5 rounded-full text-xs ${sentiment === 'bullish' ? 'badge-bullish' : 'badge-bearish'}`}>
        {sentiment === 'bullish' ? '🟢 Bullish' : '🔴 Bearish'}
      </span>
    </div>
    <p className="text-slate-300 leading-tight mb-1">{title}</p>
    <span className="text-slate-500">{time}</span>
  </div>
);

const FLOATING_CARDS = [
  { title: 'Reliance Q3 profit surges 18% YoY, beats estimates', symbol: 'RELIANCE', sentiment: 'bullish', time: '2 min ago', style: { top: '15%', left: '-5%', animation: 'float 7s ease-in-out infinite' } },
  { title: 'Apple iPhone sales drop in China amid competition', symbol: 'AAPL', sentiment: 'bearish', time: '8 min ago', style: { top: '55%', right: '-5%', animation: 'float 9s ease-in-out infinite 2s' } },
  { title: 'HDFC Bank raises lending rates by 25bps', symbol: 'HDFCBANK', sentiment: 'bearish', time: '15 min ago', style: { bottom: '20%', left: '2%', animation: 'float 6s ease-in-out infinite 1s' } },
  { title: 'NVIDIA data center revenue hits record $18.4B', symbol: 'NVDA', sentiment: 'bullish', time: '22 min ago', style: { top: '25%', right: '0%', animation: 'float 8s ease-in-out infinite 3s' } },
];

export default function HeroSection({ onSignupClick, onPricingClick }) {
  const heroRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add('visible')),
      { threshold: 0.1 }
    );
    heroRef.current?.querySelectorAll('.fade-in-up').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <section id="hero" ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden mesh-bg pt-16">
      {/* Orbs */}
      <div className="orb w-96 h-96 bg-cyan-500/10 top-20 -left-20" />
      <div className="orb w-80 h-80 bg-blue-600/10 bottom-20 -right-20" style={{ animationDelay: '3s' }} />
      <div className="orb w-64 h-64 bg-purple-600/8 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" style={{ animationDelay: '1.5s' }} />

      {/* Floating cards — hidden on mobile */}
      <div className="hidden lg:block absolute inset-0 pointer-events-none">
        {FLOATING_CARDS.map((card, i) => <FloatingCard key={i} {...card} />)}
      </div>

      {/* Hero content */}
      <div className="relative z-10 text-center max-w-4xl mx-auto px-4">
        <div className="fade-in-up mb-6">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-sm text-cyan-400 border border-cyan-500/20">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            Live news from 12+ sources — updated every 10 minutes
          </span>
        </div>

        <h1 className="fade-in-up font-syne font-bold text-5xl sm:text-6xl lg:text-7xl text-white leading-tight mb-6" style={{ transitionDelay: '0.1s' }}>
          Real-Time Stock<br />
          <span className="gradient-text">Intelligence.</span><br />
          Zero Noise.
        </h1>

        <p className="fade-in-up text-slate-400 text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed" style={{ transitionDelay: '0.2s' }}>
          Get live curated news for every stock in Indian and International markets — delivered the moment it breaks.
        </p>

        <div className="fade-in-up flex flex-col sm:flex-row gap-4 justify-center" style={{ transitionDelay: '0.3s' }}>
          <button onClick={onSignupClick} className="btn-primary flex items-center justify-center gap-2 text-base py-3 px-8">
            Start For Free <ArrowRight size={18} />
          </button>
          <button onClick={onPricingClick} className="btn-secondary flex items-center justify-center gap-2 text-base py-3 px-8">
            View Pricing
          </button>
        </div>

        {/* Stats */}
        <div className="fade-in-up flex flex-wrap justify-center gap-8 mt-16" style={{ transitionDelay: '0.4s' }}>
          {[
            { label: 'News Sources', value: '12+' },
            { label: 'Stocks Covered', value: '500+' },
            { label: 'Updates/Day', value: '1,000+' },
            { label: 'Markets', value: 'NSE, BSE, NYSE, NASDAQ' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="font-syne font-bold text-2xl text-white">{stat.value}</div>
              <div className="text-slate-500 text-sm">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-slate-600">
        <span className="text-xs">Scroll to explore</span>
        <div className="w-5 h-8 border border-slate-700 rounded-full flex justify-center pt-1">
          <div className="w-1 h-2 bg-cyan-400 rounded-full animate-bounce" />
        </div>
      </div>
    </section>
  );
}
