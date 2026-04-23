'use client';
import { useState, useEffect } from 'react';
import { Check, X, Trash2, Star } from 'lucide-react';
import api from '@/lib/api';

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/reviews').then(({ data }) => { setReviews(data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const approve = async (id) => {
    await api.put(`/admin/reviews/${id}/approve`);
    setReviews((prev) => prev.map((r) => r.id === id ? { ...r, approved: true } : r));
  };

  const remove = async (id) => {
    await api.delete(`/admin/reviews/${id}`);
    setReviews((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-syne font-bold text-2xl text-white">Reviews</h1>
        <p className="text-slate-400 text-sm mt-1">{reviews.filter((r) => !r.approved).length} pending approval</p>
      </div>

      <div className="space-y-4">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => <div key={i} className="glass rounded-xl p-5 animate-pulse h-24" />)
        ) : reviews.map((r) => (
          <div key={r.id} className={`glass rounded-xl p-5 ${!r.approved ? 'border-yellow-500/20' : ''}`}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3 flex-1">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                  {r.user?.full_name?.charAt(0)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-white font-medium text-sm">{r.user?.full_name}</span>
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} size={12} className={i < r.rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-600'} />
                      ))}
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-xs ${r.approved ? 'badge-bullish' : 'badge-neutral'}`}>
                      {r.approved ? 'Approved' : 'Pending'}
                    </span>
                  </div>
                  <p className="text-slate-400 text-sm">{r.comment}</p>
                  <span className="text-slate-600 text-xs">{new Date(r.created_at).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {!r.approved && (
                  <button onClick={() => approve(r.id)} className="w-8 h-8 rounded-lg bg-green-500/10 text-green-400 hover:bg-green-500/20 flex items-center justify-center transition-colors">
                    <Check size={15} />
                  </button>
                )}
                <button onClick={() => remove(r.id)} className="w-8 h-8 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 flex items-center justify-center transition-colors">
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
