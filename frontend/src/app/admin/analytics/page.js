'use client';
import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import api from '@/lib/api';

export default function AdminAnalyticsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/analytics').then(({ data }) => { setData(data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-syne font-bold text-2xl text-white">Analytics</h1>
        <p className="text-slate-400 text-sm mt-1">Platform insights and trends</p>
      </div>

      {/* Conversion rate */}
      <div className="glass rounded-xl p-5 max-w-xs">
        <div className="text-slate-400 text-sm mb-1">Free → Paid Conversion</div>
        <div className="font-syne font-bold text-3xl text-cyan-400">{data?.conversionRate}%</div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top stocks */}
        <div className="glass rounded-xl p-5">
          <h3 className="font-syne font-semibold text-white mb-4">Most Covered Stocks (7 days)</h3>
          <div className="space-y-2">
            {(data?.topStocks || []).map((s, i) => (
              <div key={s.stock_symbol} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 w-5">{i + 1}</span>
                  <span className="font-mono text-cyan-400">{s.stock_symbol}</span>
                </div>
                <span className="text-slate-400">{s._count.stock_symbol} articles</span>
              </div>
            ))}
          </div>
        </div>

        {/* News by source */}
        <div className="glass rounded-xl p-5">
          <h3 className="font-syne font-semibold text-white mb-4">News Volume by Source</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={(data?.newsBySource || []).map((s) => ({ name: s.source_name?.split(' ')[0], count: s._count.source_name }))}>
              <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 10 }} />
              <YAxis tick={{ fill: '#64748b', fontSize: 10 }} />
              <Tooltip contentStyle={{ background: '#0d1526', border: '1px solid #1e3a5f', borderRadius: 8, color: '#e2e8f0' }} />
              <Bar dataKey="count" fill="#00d4ff" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Users by country */}
        <div className="glass rounded-xl p-5">
          <h3 className="font-syne font-semibold text-white mb-4">Users by Country</h3>
          <div className="space-y-2">
            {(data?.usersByCountry || []).map((c) => (
              <div key={c.country} className="flex items-center justify-between text-sm">
                <span className="text-slate-300">{c.country || 'Unknown'}</span>
                <span className="text-slate-400">{c._count.country} users</span>
              </div>
            ))}
          </div>
        </div>

        {/* Most active users */}
        <div className="glass rounded-xl p-5">
          <h3 className="font-syne font-semibold text-white mb-4">Most Active Users</h3>
          <div className="space-y-3">
            {(data?.topUsers || []).map((u, i) => (
              <div key={u.id} className="flex items-center gap-3 text-sm">
                <span className="text-slate-500 w-5">{i + 1}</span>
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white text-xs font-bold">
                  {u.full_name?.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-white truncate">{u.full_name}</div>
                  <div className="text-slate-500 text-xs">{u.last_login ? new Date(u.last_login).toLocaleDateString() : 'Never'}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
