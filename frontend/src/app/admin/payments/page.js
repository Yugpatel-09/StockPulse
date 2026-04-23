'use client';
import { useState, useEffect } from 'react';
import { Download } from 'lucide-react';
import api from '@/lib/api';

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [total, setTotal] = useState(0);
  const [revenue, setRevenue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: '', from: '', to: '' });

  useEffect(() => {
    setLoading(true);
    api.get('/admin/payments', { params: filters }).then(({ data }) => {
      setPayments(data.payments);
      setTotal(data.total);
      setRevenue(data.totalRevenue);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [filters]);

  const exportCSV = () => window.open(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/payments/export`, '_blank');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-syne font-bold text-2xl text-white">Payments</h1>
          <p className="text-slate-400 text-sm mt-1">{total} transactions · Total Revenue: ₹{revenue?.toLocaleString()}</p>
        </div>
        <button onClick={exportCSV} className="btn-secondary flex items-center gap-2 text-sm py-2 px-4">
          <Download size={15} /> Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })} className="input-dark py-2 text-sm w-auto">
          <option value="">All Status</option>
          <option value="success">Success</option>
          <option value="failed">Failed</option>
          <option value="refunded">Refunded</option>
        </select>
        <input type="date" value={filters.from} onChange={(e) => setFilters({ ...filters, from: e.target.value })} className="input-dark py-2 text-sm w-auto" />
        <input type="date" value={filters.to} onChange={(e) => setFilters({ ...filters, to: e.target.value })} className="input-dark py-2 text-sm w-auto" />
      </div>

      <div className="glass rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-800/50">
              {['Date', 'User', 'Amount', 'Gateway', 'Transaction ID', 'Status', 'Invoice'].map((h) => (
                <th key={h} className="text-left p-4 text-slate-400 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-slate-800/30">
                  {Array.from({ length: 7 }).map((_, j) => <td key={j} className="p-4"><div className="h-4 bg-slate-800 rounded animate-pulse" /></td>)}
                </tr>
              ))
            ) : payments.map((p) => (
              <tr key={p.id} className="border-b border-slate-800/30 hover:bg-white/2">
                <td className="p-4 text-slate-400">{new Date(p.created_at).toLocaleDateString()}</td>
                <td className="p-4">
                  <div className="text-white">{p.user?.full_name}</div>
                  <div className="text-slate-500 text-xs">{p.user?.email}</div>
                </td>
                <td className="p-4 text-white font-medium">{p.currency} {p.amount}</td>
                <td className="p-4 text-slate-400 capitalize">{p.gateway}</td>
                <td className="p-4 text-slate-500 font-mono text-xs truncate max-w-32">{p.transaction_id || '—'}</td>
                <td className="p-4">
                  <span className={`px-2 py-0.5 rounded-full text-xs ${p.status === 'success' ? 'badge-bullish' : p.status === 'refunded' ? 'badge-neutral' : 'badge-bearish'}`}>
                    {p.status}
                  </span>
                </td>
                <td className="p-4">
                  <a href={`${process.env.NEXT_PUBLIC_API_URL}/api/payment/invoice/${p.id}`} target="_blank" className="text-cyan-400 hover:text-cyan-300 text-xs">PDF</a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
