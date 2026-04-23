'use client';
import { useState, useEffect } from 'react';
import { Users, DollarSign, TrendingUp, Newspaper } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import api from '@/lib/api';

const StatCard = ({ icon: Icon, label, value, color }) => (
  <div className="glass rounded-xl p-5">
    <div className="flex items-center justify-between mb-3">
      <span className="text-slate-400 text-sm">{label}</span>
      <div className={`w-9 h-9 rounded-lg ${color} flex items-center justify-center`}>
        <Icon size={18} className="text-white" />
      </div>
    </div>
    <div className="font-syne font-bold text-2xl text-white">{value}</div>
  </div>
);

const PIE_COLORS = ['#00d4ff', '#0066ff', '#f5c518'];

export default function AdminOverview() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/dashboard-stats').then(({ data }) => { setData(data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" /></div>;

  const pieData = data?.usersByPlan?.map((p) => ({ name: p.plan, value: p._count.plan })) || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-syne font-bold text-2xl text-white">Overview</h1>
        <p className="text-slate-400 text-sm mt-1">Platform health at a glance</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Total Users" value={data?.stats?.totalUsers?.toLocaleString() || 0} color="bg-blue-500/20" />
        <StatCard icon={DollarSign} label="Total Revenue" value={`₹${(data?.stats?.totalRevenue || 0).toLocaleString()}`} color="bg-green-500/20" />
        <StatCard icon={TrendingUp} label="Active Subscribers" value={data?.stats?.activeSubscribers || 0} color="bg-cyan-500/20" />
        <StatCard icon={Newspaper} label="Articles Today" value={data?.stats?.todayArticles || 0} color="bg-purple-500/20" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Signups chart */}
        <div className="lg:col-span-2 glass rounded-xl p-5">
          <h3 className="font-syne font-semibold text-white mb-4">New Signups (Last 30 Days)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={data?.signupsByDay || []}>
              <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 11 }} tickFormatter={(v) => v?.slice(5)} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
              <Tooltip contentStyle={{ background: '#0d1526', border: '1px solid #1e3a5f', borderRadius: 8, color: '#e2e8f0' }} />
              <Line type="monotone" dataKey="count" stroke="#00d4ff" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Plan distribution */}
        <div className="glass rounded-xl p-5">
          <h3 className="font-syne font-semibold text-white mb-4">Users by Plan</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: '#0d1526', border: '1px solid #1e3a5f', borderRadius: 8, color: '#e2e8f0' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Revenue chart */}
      <div className="glass rounded-xl p-5">
        <h3 className="font-syne font-semibold text-white mb-4">Monthly Revenue</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data?.revenueByMonth || []}>
            <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 11 }} />
            <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
            <Tooltip contentStyle={{ background: '#0d1526', border: '1px solid #1e3a5f', borderRadius: 8, color: '#e2e8f0' }} formatter={(v) => [`₹${v}`, 'Revenue']} />
            <Bar dataKey="revenue" fill="#00d4ff" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Recent tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass rounded-xl p-5">
          <h3 className="font-syne font-semibold text-white mb-4">Recent Payments</h3>
          <div className="space-y-3">
            {(data?.recentPayments || []).map((p) => (
              <div key={p.id} className="flex items-center justify-between text-sm">
                <div>
                  <div className="text-white">{p.user?.full_name}</div>
                  <div className="text-slate-500 text-xs">{new Date(p.created_at).toLocaleDateString()}</div>
                </div>
                <div className="text-right">
                  <div className="text-green-400 font-medium">₹{p.amount}</div>
                  <div className="text-slate-500 text-xs capitalize">{p.gateway}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass rounded-xl p-5">
          <h3 className="font-syne font-semibold text-white mb-4">Recent Signups</h3>
          <div className="space-y-3">
            {(data?.recentUsers || []).map((u) => (
              <div key={u.id} className="flex items-center gap-3 text-sm">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  {u.full_name?.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-white truncate">{u.full_name}</div>
                  <div className="text-slate-500 text-xs">{u.country || 'Unknown'}</div>
                </div>
                <div className="text-slate-500 text-xs">{new Date(u.created_at).toLocaleDateString()}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
