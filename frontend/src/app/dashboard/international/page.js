'use client';
import NewsFeed from '@/components/dashboard/NewsFeed';

const INDICES = [
  { name: 'S&P 500', value: '5,234.18', change: '+0.57%', up: true },
  { name: 'NASDAQ', value: '16,384.47', change: '+0.83%', up: true },
  { name: 'Dow Jones', value: '39,127.14', change: '+0.23%', up: true },
  { name: 'FTSE 100', value: '7,930.96', change: '-0.14%', up: false },
];

export default function InternationalMarketsPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="font-syne font-bold text-2xl text-white">🌍 International Markets</h1>
        <p className="text-slate-400 text-sm mt-1">NYSE, NASDAQ, LSE — Global market intelligence</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {INDICES.map((idx) => (
          <div key={idx.name} className="glass rounded-xl p-4">
            <div className="text-slate-400 text-xs mb-1">{idx.name}</div>
            <div className="font-syne font-bold text-white text-lg">{idx.value}</div>
            <div className={`text-sm font-medium ${idx.up ? 'text-green-400' : 'text-red-400'}`}>{idx.change}</div>
          </div>
        ))}
      </div>

      <NewsFeed market="international" />
    </div>
  );
}
