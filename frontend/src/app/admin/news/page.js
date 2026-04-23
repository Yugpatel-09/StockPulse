'use client';
import { useState, useEffect } from 'react';
import { Trash2, Plus, ExternalLink } from 'lucide-react';
import api from '@/lib/api';

export default function AdminNewsPage() {
  const [articles, setArticles] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ market: '', sentiment: '' });
  const [showAdd, setShowAdd] = useState(false);
  const [newArticle, setNewArticle] = useState({ title: '', summary: '', source_name: '', article_url: '', market: 'india', sentiment: 'neutral' });

  const fetchArticles = () => {
    setLoading(true);
    api.get('/admin/news', { params: filters }).then(({ data }) => {
      setArticles(data.articles);
      setTotal(data.total);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  useEffect(() => { fetchArticles(); }, [filters]);

  const deleteArticle = async (id) => {
    await api.delete(`/admin/news/${id}`);
    setArticles((prev) => prev.filter((a) => a.id !== id));
  };

  const addArticle = async () => {
    if (!newArticle.title || !newArticle.article_url) return alert('Title and URL required');
    await api.post('/admin/news', newArticle);
    setShowAdd(false);
    fetchArticles();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-syne font-bold text-2xl text-white">News Management</h1>
          <p className="text-slate-400 text-sm mt-1">{total} articles in database</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn-primary flex items-center gap-2 text-sm py-2 px-4">
          <Plus size={15} /> Add Article
        </button>
      </div>

      <div className="flex gap-3">
        <select value={filters.market} onChange={(e) => setFilters({ ...filters, market: e.target.value })} className="input-dark py-2 text-sm w-auto">
          <option value="">All Markets</option>
          <option value="india">🇮🇳 India</option>
          <option value="international">🌍 International</option>
        </select>
        <select value={filters.sentiment} onChange={(e) => setFilters({ ...filters, sentiment: e.target.value })} className="input-dark py-2 text-sm w-auto">
          <option value="">All Sentiment</option>
          <option value="bullish">Bullish</option>
          <option value="bearish">Bearish</option>
          <option value="neutral">Neutral</option>
        </select>
      </div>

      <div className="glass rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-800/50">
              {['Title', 'Source', 'Market', 'Sentiment', 'Published', 'Actions'].map((h) => (
                <th key={h} className="text-left p-4 text-slate-400 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? Array.from({ length: 5 }).map((_, i) => (
              <tr key={i} className="border-b border-slate-800/30">
                {Array.from({ length: 6 }).map((_, j) => <td key={j} className="p-4"><div className="h-4 bg-slate-800 rounded animate-pulse" /></td>)}
              </tr>
            )) : articles.map((a) => (
              <tr key={a.id} className="border-b border-slate-800/30 hover:bg-white/2">
                <td className="p-4 max-w-xs">
                  <p className="text-white text-xs leading-snug line-clamp-2">{a.title}</p>
                  {a.stock_symbol && <span className="text-cyan-400 font-mono text-xs">{a.stock_symbol}</span>}
                </td>
                <td className="p-4 text-slate-400 text-xs">{a.source_name}</td>
                <td className="p-4 text-xs">{a.market === 'india' ? '🇮🇳' : '🌍'}</td>
                <td className="p-4">
                  <span className={`px-2 py-0.5 rounded-full text-xs ${a.sentiment === 'bullish' ? 'badge-bullish' : a.sentiment === 'bearish' ? 'badge-bearish' : 'badge-neutral'}`}>
                    {a.sentiment}
                  </span>
                </td>
                <td className="p-4 text-slate-500 text-xs">{a.published_at ? new Date(a.published_at).toLocaleDateString() : '—'}</td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <a href={a.article_url} target="_blank" className="text-slate-500 hover:text-cyan-400 transition-colors"><ExternalLink size={14} /></a>
                    <button onClick={() => deleteArticle(a.id)} className="text-slate-500 hover:text-red-400 transition-colors"><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add article modal */}
      {showAdd && (
        <div className="modal-overlay" onClick={() => setShowAdd(false)}>
          <div className="glass rounded-2xl w-full max-w-lg mx-4 p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="font-syne font-bold text-lg text-white mb-5">Add Custom Article</h2>
            <div className="space-y-3">
              <input placeholder="Title *" value={newArticle.title} onChange={(e) => setNewArticle({ ...newArticle, title: e.target.value })} className="input-dark text-sm" />
              <textarea placeholder="Summary" value={newArticle.summary} onChange={(e) => setNewArticle({ ...newArticle, summary: e.target.value })} className="input-dark text-sm h-20 resize-none" />
              <input placeholder="Source Name" value={newArticle.source_name} onChange={(e) => setNewArticle({ ...newArticle, source_name: e.target.value })} className="input-dark text-sm" />
              <input placeholder="Article URL *" value={newArticle.article_url} onChange={(e) => setNewArticle({ ...newArticle, article_url: e.target.value })} className="input-dark text-sm" />
              <div className="grid grid-cols-2 gap-3">
                <select value={newArticle.market} onChange={(e) => setNewArticle({ ...newArticle, market: e.target.value })} className="input-dark text-sm">
                  <option value="india">India</option>
                  <option value="international">International</option>
                </select>
                <select value={newArticle.sentiment} onChange={(e) => setNewArticle({ ...newArticle, sentiment: e.target.value })} className="input-dark text-sm">
                  <option value="neutral">Neutral</option>
                  <option value="bullish">Bullish</option>
                  <option value="bearish">Bearish</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={addArticle} className="btn-primary text-sm py-2.5 px-5">Add Article</button>
              <button onClick={() => setShowAdd(false)} className="btn-secondary text-sm py-2.5 px-5">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
