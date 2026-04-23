'use client';
import { useState, useEffect } from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import api from '@/lib/api';

const PIE_COLORS = ['#22c55e', '#ef4444', '#eab308'];

export default function AnalyticsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch news stats for the user
    Promise.all([
      api.get('/news', { params: { limit: 100 } }),
    ]).then(([newsRes]) => {
      const articles = newsRes.data.articles;
      const sentimentCounts = articles.reduce((acc, a) => {
        acc[a.sentiment] = (acc[a.sentiment] || 0) + 1;
        return acc;
      }, {});
      const marketCounts = articles.reduce((acc, a) => {
        acc[a.market] = (acc[a.market] || 0) + 1;
        return acc;
      }, {});
      const sourceCounts = articles.reduce((acc, a) => {
        acc[a.source_name] = (acc[a.source_name] || 0) + 1;
        return acc;
      }, {});

      setData({
        sentiment: Object.entries(sentimentCounts).map(([name, value]) => ({ name, value })),
        market: Object.entries(marketCounts).map(([name, value]) => ({ name, value })),
        sources: Object.entries(sourceCounts).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([name, value]) => ({ name: name.split(' ')[0], value })),
      });
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-syne font-bold text-2xl text-white">📊 Analytics</h1>
        <p className="text-slate-400 text-sm mt-1">News sentiment and market breakdown</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="glass rounded-xl p-5">
          <h3 className="font-syne font-semibold text-white mb-4">Sentiment Distribution</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={data?.sentiment || []} cx="50%" cy="50%" outerRadius={70} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false} fontSize={11}>
                {(data?.sentiment || []).map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: '#0d1526', border: '1px solid #1e3a5f', borderRadius: 8, color: '#e2e8f0' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="glass rounded-xl p-5">
          <h3 className="font-syne font-semibold text-white mb-4">Market Split</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={data?.market || []} cx="50%" cy="50%" outerRadius={70} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false} fontSize={11}>
                <Cell fill="#00d4ff" />
                <Cell fill="#0066ff" />
              </Pie>
              <Tooltip contentStyle={{ background: '#0d1526', border: '1px solid #1e3a5f', borderRadius: 8, color: '#e2e8f0' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="glass rounded-xl p-5 lg:col-span-1">
          <h3 className="font-syne font-semibold text-white mb-4">Top Sources</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data?.sources || []} layout="vertical">
              <XAxis type="number" tick={{ fill: '#64748b', fontSize: 10 }} />
              <YAxis type="category" dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10 }} width={60} />
              <Tooltip contentStyle={{ background: '#0d1526', border: '1px solid #1e3a5f', borderRadius: 8, color: '#e2e8f0' }} />
              <Bar dataKey="value" fill="#00d4ff" radius={[0, 3, 3, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
