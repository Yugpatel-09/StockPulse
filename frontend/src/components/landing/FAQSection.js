'use client';
import { useState, useEffect, useRef } from 'react';
import { ChevronDown } from 'lucide-react';

const FAQS = [
  { q: 'How fresh is the news?', a: 'Our system fetches news from all sources every 10 minutes automatically. Most articles appear within 10–15 minutes of being published on the original source.' },
  { q: 'Which markets are covered?', a: 'We cover Indian markets (NSE, BSE — Nifty 50, Sensex, Bank Nifty, and all listed stocks) and International markets (NYSE, NASDAQ, LSE, and more). Over 500 stocks are tracked.' },
  { q: 'Can I cancel anytime?', a: 'Yes, absolutely. You can cancel your subscription at any time from your billing settings. You will retain access until the end of your current billing period.' },
  { q: 'Is my payment secure?', a: 'Yes. We use Razorpay (for Indian users) and Stripe (for international users) — both are PCI-DSS compliant payment gateways. We never store your card details.' },
  { q: 'Do you cover penny stocks?', a: 'We cover all NSE and BSE listed stocks. For penny stocks, news coverage depends on whether major sources publish articles about them. Google News RSS helps fill gaps for smaller stocks.' },
  { q: 'How is sentiment calculated?', a: 'Our system scans each article headline for financial keywords. Words like "surge", "rally", "profit" tag an article as Bullish. Words like "crash", "loss", "decline" tag it as Bearish. Otherwise it is Neutral.' },
  { q: 'What sources do you use?', a: 'We aggregate from Economic Times, Business Standard, MoneyControl, LiveMint, Financial Express, NDTV Profit, Reuters, Yahoo Finance, CNBC, MarketWatch, Investing.com, Seeking Alpha, and Google News.' },
  { q: 'Is there a mobile app?', a: 'Our web app is fully mobile-responsive and works great on all devices. A dedicated iOS and Android app is on our roadmap for Q3 2025.' },
];

export default function FAQSection() {
  const [open, setOpen] = useState(null);
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
    <section id="faq" ref={ref} className="py-24 px-4 relative">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-16 fade-in-up">
          <span className="text-cyan-400 text-sm font-semibold uppercase tracking-widest">FAQ</span>
          <h2 className="font-syne font-bold text-4xl sm:text-5xl text-white mt-3 mb-4">
            Common <span className="gradient-text">questions</span>
          </h2>
        </div>

        <div className="space-y-3">
          {FAQS.map((faq, i) => (
            <div key={i} className="fade-in-up glass rounded-xl overflow-hidden" style={{ transitionDelay: `${i * 0.05}s` }}>
              <button
                className="w-full flex items-center justify-between p-5 text-left"
                onClick={() => setOpen(open === i ? null : i)}
              >
                <span className="font-semibold text-white text-sm pr-4">{faq.q}</span>
                <ChevronDown
                  size={18}
                  className={`text-cyan-400 flex-shrink-0 transition-transform duration-300 ${open === i ? 'rotate-180' : ''}`}
                />
              </button>
              <div className={`accordion-content ${open === i ? 'open' : ''}`}>
                <p className="px-5 pb-5 text-slate-400 text-sm leading-relaxed">{faq.a}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
