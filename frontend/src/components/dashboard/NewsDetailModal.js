'use client';
import { useState, useEffect } from 'react';
import { X, ExternalLink, Bookmark, Share2, Clock } from 'lucide-react';
import api from '@/lib/api';

const SentimentBadge = ({ s }) => (
  <span className={`px-3 py-1 rounded-full text-sm font-medium ${s === 'bullish' ? 'badge-bullish' : s === 'bearish' ? 'badge-bearish' : 'badge-neutral'}`}>
    {s === 'bullish' ? '🟢 Bullish' : s === 'bearish' ? '🔴 Bearish' : '🟡 Neutral'}
  </span>
);

export default function NewsDetailModal({ article, onClose }) {
  const [related, setRelated] = useState([]);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api.get(`/news/${article.id}`).then(({ data }) => setRelated(data.related || [])).catch(() => {});
  }, [article.id]);

  const handleSave = async () => {
    await api.post(`/news/save/${article.id}`);
    setSaved(true);
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="glass rounded-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 glass border-b border-slate-800/50 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-400">{article.source_name}</span>
            <span className="text-xs px-2 py-0.5 rounded glass text-slate-400">
              {article.market === 'india' ? '🇮🇳 India' : '🌍 International'}
            </span>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white"><X size={20} /></button>
        </div>

        <div className="p-6">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <SentimentBadge s={article.sentiment} />
            {article.stock_symbol && (
              <span className="text-sm font-mono text-cyan-400 bg-cyan-500/10 px-3 py-1 rounded-full">{article.stock_symbol}</span>
            )}
            {article.sector && (
              <span className="text-xs text-slate-500 bg-slate-800 px-2 py-1 rounded">{article.sector}</span>
            )}
          </div>

          <h2 className="font-syne font-bold text-xl text-white leading-tight mb-4">{article.title}</h2>

          <div className="flex items-center gap-2 text-slate-500 text-sm mb-6">
            <Clock size={14} />
            {article.published_at ? new Date(article.published_at).toLocaleString() : 'Unknown date'}
          </div>

          <div className="text-slate-300 leading-relaxed text-sm mb-6">
            {article.summary || 'Click "Read Full Article" to view the complete story on the source website.'}
          </div>

          <div className="flex flex-wrap gap-3 mb-8">
            <a href={article.article_url} target="_blank" rel="noopener noreferrer" className="btn-primary flex items-center gap-2 text-sm py-2.5 px-5">
              <ExternalLink size={15} /> Read Full Article
            </a>
            <button onClick={handleSave} className={`btn-secondary flex items-center gap-2 text-sm py-2.5 px-5 ${saved ? 'text-cyan-400 border-cyan-500/50' : ''}`}>
              <Bookmark size={15} /> {saved ? 'Saved' : 'Save'}
            </button>
            <button onClick={() => navigator.share?.({ title: article.title, url: article.article_url })} className="btn-secondary flex items-center gap-2 text-sm py-2.5 px-5">
              <Share2 size={15} /> Share
            </button>
          </div>

          {related.length > 0 && (
            <div>
              <h3 className="font-syne font-semibold text-white mb-4">Related News</h3>
              <div className="space-y-3">
                {related.map((r) => (
                  <div key={r.id} className="glass rounded-xl p-4 cursor-pointer hover:border-cyan-500/20 transition-colors">
                    <p className="text-sm text-white leading-snug">{r.title}</p>
                    <span className="text-xs text-slate-500 mt-1 block">{r.source_name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
