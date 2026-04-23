'use client';
import { useEffect, useRef } from 'react';
import { Check, X, Zap } from 'lucide-react';

const PLANS = [
  {
    name: 'Free',
    price: '₹0',
    period: '/month',
    desc: 'Perfect for getting started',
    popular: false,
    features: [
      { text: '5 news articles per day', included: true },
      { text: 'Indian markets only', included: true },
      { text: 'Basic news feed', included: true },
      { text: 'International markets', included: false },
      { text: 'Custom stock alerts', included: false },
      { text: 'Sentiment analysis tags', included: false },
      { text: 'Portfolio watchlist', included: false },
      { text: 'AI summaries', included: false },
      { text: 'Export to PDF/CSV', included: false },
      { text: 'Priority support', included: false },
    ],
    cta: 'Get Started Free',
    ctaStyle: 'btn-secondary w-full py-3',
  },
  {
    name: 'Pro',
    price: '₹499',
    period: '/month',
    desc: 'For serious investors',
    popular: true,
    features: [
      { text: 'Unlimited news articles', included: true },
      { text: 'Indian markets (NSE/BSE)', included: true },
      { text: 'International markets (NYSE/NASDAQ)', included: true },
      { text: '10 custom stock alerts', included: true },
      { text: 'Sentiment analysis tags', included: true },
      { text: 'Portfolio watchlist', included: true },
      { text: 'Advanced filters', included: true },
      { text: 'AI summaries', included: false },
      { text: 'Export to PDF/CSV', included: false },
      { text: 'Priority support', included: false },
    ],
    cta: 'Start Pro Plan',
    ctaStyle: 'btn-primary w-full py-3',
  },
  {
    name: 'Elite',
    price: '₹999',
    period: '/month',
    desc: 'For professional traders',
    popular: false,
    features: [
      { text: 'Everything in Pro', included: true },
      { text: 'Unlimited custom alerts', included: true },
      { text: 'AI article summaries', included: true },
      { text: 'Export to PDF/CSV', included: true },
      { text: 'Advanced analytics dashboard', included: true },
      { text: 'Priority support', included: true },
      { text: 'Early access to new features', included: true },
      { text: 'Dedicated account manager', included: true },
      { text: 'API access (coming soon)', included: true },
      { text: 'Custom integrations', included: true },
    ],
    cta: 'Go Elite',
    ctaStyle: 'btn-secondary w-full py-3 border-yellow-500/50 text-yellow-400 hover:border-yellow-400',
  },
];

export default function PricingSection({ onSignupClick }) {
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
    <section id="pricing" ref={ref} className="py-24 px-4 relative overflow-hidden">
      <div className="orb w-96 h-96 bg-purple-600/5 bottom-0 left-0 pointer-events-none" />
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16 fade-in-up">
          <span className="text-cyan-400 text-sm font-semibold uppercase tracking-widest">Pricing</span>
          <h2 className="font-syne font-bold text-4xl sm:text-5xl text-white mt-3 mb-4">
            Simple, transparent <span className="gradient-text">pricing</span>
          </h2>
          <p className="text-slate-400 text-lg">No hidden fees. Cancel anytime.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 stagger">
          {PLANS.map((plan) => (
            <div key={plan.name} className={`fade-in-up pricing-card relative ${plan.popular ? 'popular' : ''}`}>
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="flex items-center gap-1 bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xs font-bold px-4 py-1.5 rounded-full">
                    <Zap size={12} /> Most Popular
                  </span>
                </div>
              )}

              <div className="mb-6">
                <h3 className="font-syne font-bold text-xl text-white mb-1">{plan.name}</h3>
                <p className="text-slate-500 text-sm mb-4">{plan.desc}</p>
                <div className="flex items-baseline gap-1">
                  <span className="font-syne font-bold text-4xl text-white">{plan.price}</span>
                  <span className="text-slate-500">{plan.period}</span>
                </div>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((f) => (
                  <li key={f.text} className="flex items-center gap-3 text-sm">
                    {f.included
                      ? <Check size={16} className="text-green-400 flex-shrink-0" />
                      : <X size={16} className="text-slate-600 flex-shrink-0" />}
                    <span className={f.included ? 'text-slate-300' : 'text-slate-600'}>{f.text}</span>
                  </li>
                ))}
              </ul>

              <button onClick={onSignupClick} className={plan.ctaStyle}>{plan.cta}</button>
            </div>
          ))}
        </div>

        <p className="text-center text-slate-500 text-sm mt-8 fade-in-up">
          All plans include a 7-day free trial. No credit card required for Free plan.
        </p>
      </div>
    </section>
  );
}
