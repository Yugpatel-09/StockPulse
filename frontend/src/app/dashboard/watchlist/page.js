'use client';
import { useState, useEffect } from 'react';
import { Plus, Trash2, Search } from 'lucide-react';
import api from '@/lib/api';
import NewsFeed from '@/components/dashboard/NewsFeed';

export default function WatchlistPage() {
  const [watchlist, setWatchlist] = useState([]);
  const [search, setSearch] = useState('');
  const [adding, setAdding] = useState('');
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/user/watchlist').then(({ data }) => { setWatchlist(data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const addStock = async () => {
    if (!adding.trim()) return;
    try {
      const { data } = await api.post('/user/watchlist', { stock_symbol: adding.toUpperCase() });
      setWatchlist((prev) => [...prev, data]);
      setAdding('');
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to add stock');
    }
  };

  const removeStock = async (symbol) => {
    await api.delete(`/user/watchlist/${symbol}`);
    setWatchlist((prev) => prev.filter((w) => w.stock_symbol !== symbol));
    if (selected === symbol) setSelected(null);
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-syne font-bold text-2xl text-white">⭐ My Watchlist</h1>
        <p className="text-slate-400 text-sm mt-1">Track news for your favourite stocks</p>
      </div>

      {/* Add stock */}
      <div className="flex gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Add stock symbol (e.g. RELIANCE)"
            value={adding}
            onChange={(e) => setAdding(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addStock()}
            className="input-dark pl-9 text-sm"
          />
        </div>
        <button onClick={addStock} className="btn-primary flex items-center gap-2 text-sm py-2 px-4">
          <Plus size={16} /> Add
        </button>
      </div>

      {/* Watchlist chips */}
      {watchlist.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {watchlist.map((w) => (
            <div
              key={w.stock_symbol}
              onClick={() => setSelected(selected === w.stock_symbol ? null : w.stock_symbol)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm cursor-pointer transition-all ${selected === w.stock_symbol ? 'bg-cyan-500/20 border border-cyan-500/50 text-cyan-400' : 'glass text-slate-300 hover:border-slate-600'}`}
            >
              <span className="font-mono font-semibold">{w.stock_symbol}</span>
              <button onClick={(e) => { e.stopPropagation(); removeStock(w.stock_symbol); }} className="text-slate-500 hover:text-red-400 transition-colors">
                <Trash2 size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      {watchlist.length === 0 && !loading && (
        <div className="glass rounded-2xl p-12 text-center mb-6">
          <div className="text-4xl mb-3">⭐</div>
          <h3 className="font-syne font-semibold text-white mb-2">Your watchlist is empty</h3>
          <p className="text-slate-400 text-sm">Add stock symbols above to track their news</p>
        </div>
      )}

      {/* News for selected stock or all watchlist stocks */}
      {watchlist.length > 0 && (
        <div>
          <h2 className="font-syne font-semibold text-white mb-4">
            {selected ? `News for ${selected}` : 'Latest news from your watchlist'}
          </h2>
          <NewsFeed stockSymbol={selected || undefined} />
        </div>
      )}
    </div>
  );
}
