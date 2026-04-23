'use client';
import NewsFeed from '@/components/dashboard/NewsFeed';

const INDICES = [
  { name: 'Nifty 50', value: '22,147.00', change: '+0.82%', up: true },
  { name: 'Sensex', value: '73,088.33', change: '+0.79%', up: true },
  { name: 'Bank Nifty', value: '47,234.50', change: '-0.21%', up: false },
  { name: 'Nifty IT', value: '38,456.20', change: '+1.45%', up: true },
];

export default function IndiaMarketsPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="font-syne font-bold text-2xl text-white">🇮🇳 Indian Markets</h1>
        <p className="text-slate-400 text-sm mt-1">NSE & BSE — Live news and market updates</p>
      </div>

      {/* Indices */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {INDICES.map((idx) => (
          <div key={idx.name} className="glass rounded-xl p-4">
            <div className="text-slate-400 text-xs mb-1">{idx.name}</div>
            <div className="font-syne font-bold text-white text-lg">{idx.value}</div>
            <div className={`text-sm font-medium ${idx.up ? 'text-green-400' : 'text-red-400'}`}>{idx.change}</div>
          </div>
        ))}
      </div>

      <NewsFeed market="india" />
    </div>
  );
}
