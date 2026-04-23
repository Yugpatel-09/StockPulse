'use client';
import { useState, useEffect, useCallback } from 'react';
import { RefreshCw, ExternalLink, Bookmark, Share2, ChevronDown, Filter } from 'lucide-react';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import NewsDetailModal from './NewsDetailModal';

const SentimentBadge = ({ s }) => (
  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${s === 'bullish' ? 'badge-bullish' : s === 'bearish' ? 'badge-bearish' : 'badge-neutral'}`}>
    {s === 'bullish' ? '🟢 Bullish' : s === 'bearish' ? '🔴 Bearish' : '🟡 Neutral'}
  </span>
);

const timeAgo = (date) => {
  if (!date) return '';
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};

export default function NewsFeed({ market, stockSymbol }) {
  const { user } = useAuth();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [filters, setFilters] = useState({ sentiment: '', sector: '' });
  const [newCount, setNewCount] = useState(0);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [plan, setPlan] = useState('free');

  useEffect(() => {
    api.get('/user/subscription').then(({ data }) => setPlan(data.plan || 'free')).catch(() => {});
  }, []);

  const fetchNews = useCallback(async (reset = false) => {
    try {
      setLoading(true);
      const params = { page: reset ? 1 : page, limit: 12, ...(market && { market }), ...(stockSymbol && { stock_symbol: stockSymbol }), ...(filters.sentiment && { sentiment: filters.sentiment }), ...(filters.sector && { sector: filters.sector }) };
      const { data } = await api.get('/news', { params });
      setArticles(reset ? data.articles : (prev) => [...prev, ...data.articles]);
      setHasMore(data.pagination.page < data.pagination.pages);
      if (reset) setPage(1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, market, stockSymbol, filters]);

  useEffect(() => { fetchNews(true); }, [market, stockSymbol, filters]);

  const isLocked = (index) => plan === 'free' && index >= 5;

  return (
    <div>
      {/* Live indicator + new articles banner */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          Live — Updates every 10 min
        </div>
        {newCount > 0 && (
          <button onClick={() => { setNewCount(0); fetchNews(true); }} className="text-xs bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 px-3 py-1.5 rounded-full hover:bg-cyan-500/20 transition-colors">
            🔴 {newCount} new articles — Click to load
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <select value={filters.sentiment} onChange={(e) => setFilters({ ...filters, sentiment: e.target.value })} className="input-dark py-2 text-sm w-auto">
          <option value="">All Sentiment</option>
          <option value="bullish">🟢 Bullish</option>
          <option value="bearish">🔴 Bearish</option>
          <option value="neutral">🟡 Neutral</option>
        </select>
        <select value={filters.sector} onChange={(e) => setFilters({ ...filters, sector: e.target.value })} className="input-dark py-2 text-sm w-auto">
          <option value="">All Sectors</option>
          {['Technology', 'Banking', 'Energy', 'Pharma', 'Automobile', 'FMCG', 'Telecom'].map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <button onClick={() => fetchNews(true)} className="flex items-center gap-2 btn-secondary py-2 px-4 text-sm">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* News grid */}
      {loading && articles.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="news-card animate-pulse">
              <div className="h-4 bg-slate-700 rounded mb-3 w-3/4" />
              <div className="h-3 bg-slate-800 rounded mb-2" />
              <div className="h-3 bg-slate-800 rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {articles.map((article, i) => (
              <div key={article.id} className="relative">
                {isLocked(i) && (
                  <div className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-xl bg-navy-900/80 backdrop-blur-sm border border-cyan-500/20">
                    <span className="text-2xl mb-2">🔒</span>
                    <p className="text-white font-semibold text-sm mb-1">Pro Feature</p>
                    <p className="text-slate-400 text-xs text-center px-4">Upgrade to read unlimited articles</p>
                    <button onClick={() => window.location.href = '/dashboard/settings?tab=billing'} className="btn-primary text-xs py-1.5 px-4 mt-3">Upgrade Now</button>
                  </div>
                )}
                <div className={`news-card h-full flex flex-col ${isLocked(i) ? 'blur-locked' : ''}`} onClick={() => !isLocked(i) && setSelectedArticle(article)}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500 truncate max-w-24">{article.source_name}</span>
                      <span className="text-xs px-1.5 py-0.5 rounded glass text-slate-400">
                        {article.market === 'india' ? '🇮🇳' : '🌍'}
                      </span>
                    </div>
                    <SentimentBadge s={article.sentiment} />
                  </div>

                  <h3 className="font-semibold text-white text-sm leading-snug mb-2 flex-1">{article.title}</h3>

                  {article.summary && (
                    <p className="text-slate-500 text-xs leading-relaxed mb-3 line-clamp-2">{article.summary}</p>
                  )}

                  <div className="flex items-center justify-between mt-auto pt-3 border-t border-slate-800/50">
                    <div className="flex items-center gap-2">
                      {article.stock_symbol && (
                        <span className="text-xs font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded">{article.stock_symbol}</span>
                      )}
                      <span className="text-xs text-slate-600">{timeAgo(article.published_at)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={(e) => { e.stopPropagation(); api.post(`/news/save/${article.id}`); }} className="text-slate-600 hover:text-cyan-400 transition-colors">
                        <Bookmark size={14} />
                      </button>
                      <a href={article.article_url} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="text-slate-600 hover:text-cyan-400 transition-colors">
                        <ExternalLink size={14} />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {hasMore && !loading && (
            <div className="text-center mt-8">
              <button onClick={() => { setPage((p) => p + 1); fetchNews(); }} className="btn-secondary py-2.5 px-8 text-sm">
                Load More
              </button>
            </div>
          )}
        </>
      )}

      {selectedArticle && (
        <NewsDetailModal article={selectedArticle} onClose={() => setSelectedArticle(null)} />
      )}
    </div>
  );
}
