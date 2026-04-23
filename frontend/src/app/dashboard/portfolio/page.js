'use client';
import { useState, useEffect } from 'react';
import { Plus, Trash2, TrendingUp } from 'lucide-react';
import api from '@/lib/api';
import NewsFeed from '@/components/dashboard/NewsFeed';

export default function PortfolioPage() {
  const [watchlist, setWatchlist] = useState([]);
  const [adding, setAdding] = useState('');

  useEffect(() => {
    api.get('/user/watchlist').then(({ data }) => setWatchlist(data)).catch(() => {});
  }, []);

  const addStock = async () => {
    if (!adding.trim()) return;
    try {
      const { data } = await api.post('/user/watchlist', { stock_symbol: adding.toUpperCase() });
      setWatchlist((prev) => [...prev, data]);
      setAdding('');
    } catch (err) { alert(err.response?.data?.error || 'Failed'); }
  };

  const removeStock = async (symbol) => {
    await api.delete(`/user/watchlist/${symbol}`);
    setWatchlist((prev) => prev.filter((w) => w.stock_symbol !== symbol));
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-syne font-bold text-2xl text-white">💼 My Portfolio</h1>
        <p className="text-slate-400 text-sm mt-1">Track your holdings and related news</p>
      </div>

      <div className="flex gap-3 mb-6">
        <input type="text" placeholder="Add stock (e.g. INFY)" value={adding} onChange={(e) => setAdding(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addStock()} className="input-dark flex-1 max-w-xs text-sm" />
        <button onClick={addStock} className="btn-primary flex items-center gap-2 text-sm py-2 px-4"><Plus size={15} /> Add</button>
      </div>

      {watchlist.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-8">
          {watchlist.map((w) => (
            <div key={w.stock_symbol} className="glass rounded-xl p-3 flex items-center justify-between">
              <div>
                <div className="font-mono font-bold text-cyan-400 text-sm">{w.stock_symbol}</div>
                <div className="text-slate-500 text-xs">Watching</div>
              </div>
              <button onClick={() => removeStock(w.stock_symbol)} className="text-slate-600 hover:text-red-400 transition-colors"><Trash2 size={13} /></button>
            </div>
          ))}
        </div>
      )}

      {watchlist.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center">
          <TrendingUp size={40} className="text-slate-600 mx-auto mb-3" />
          <h3 className="font-syne font-semibold text-white mb-2">No stocks in portfolio</h3>
          <p className="text-slate-400 text-sm">Add stock symbols above to track their news</p>
        </div>
      ) : (
        <div>
          <h2 className="font-syne font-semibold text-white mb-4">Portfolio News</h2>
          <NewsFeed />
        </div>
      )}
    </div>
  );
}
