'use client';
import { useState, useEffect } from 'react';
import { Search, Eye, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '@/lib/api';

export default function CustomersPage() {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/users', { params: { search, page, limit: 20 } });
      setUsers(data.users);
      setTotal(data.total);
      setPages(data.pages);
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { fetchUsers(); }, [page, search]);

  const deleteUser = async (id) => {
    if (!confirm('Delete this user? This cannot be undone.')) return;
    await api.delete(`/admin/users/${id}`);
    fetchUsers();
  };

  const viewUser = async (id) => {
    const { data } = await api.get(`/admin/users/${id}`);
    setSelected(data);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-syne font-bold text-2xl text-white">Customers</h1>
          <p className="text-slate-400 text-sm mt-1">{total} total users</p>
        </div>
      </div>

      <div className="relative max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        <input type="text" placeholder="Search by name or email..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="input-dark pl-9 text-sm" />
      </div>

      <div className="glass rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-800/50">
              {['Name', 'Email', 'Plan', 'Country', 'Joined', 'Actions'].map((h) => (
                <th key={h} className="text-left p-4 text-slate-400 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-slate-800/30">
                  {Array.from({ length: 6 }).map((_, j) => (
                    <td key={j} className="p-4"><div className="h-4 bg-slate-800 rounded animate-pulse" /></td>
                  ))}
                </tr>
              ))
            ) : users.map((u) => (
              <tr key={u.id} className="border-b border-slate-800/30 hover:bg-white/2 transition-colors">
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                      {u.full_name?.charAt(0)}
                    </div>
                    <span className="text-white">{u.full_name}</span>
                  </div>
                </td>
                <td className="p-4 text-slate-400">{u.email}</td>
                <td className="p-4">
                  <span className={`px-2 py-0.5 rounded-full text-xs capitalize ${u.subscriptions?.[0]?.plan === 'elite' ? 'badge-bullish' : u.subscriptions?.[0]?.plan === 'pro' ? 'text-blue-400 bg-blue-500/10 border border-blue-500/30' : 'text-slate-400 bg-slate-700/50'}`}>
                    {u.subscriptions?.[0]?.plan || 'free'}
                  </span>
                </td>
                <td className="p-4 text-slate-400">{u.country || '—'}</td>
                <td className="p-4 text-slate-500">{new Date(u.created_at).toLocaleDateString()}</td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <button onClick={() => viewUser(u.id)} className="text-slate-500 hover:text-cyan-400 transition-colors p-1"><Eye size={15} /></button>
                    <button onClick={() => deleteUser(u.id)} className="text-slate-500 hover:text-red-400 transition-colors p-1"><Trash2 size={15} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <span className="text-slate-500 text-sm">Page {page} of {pages}</span>
        <div className="flex gap-2">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="btn-secondary py-1.5 px-3 text-sm disabled:opacity-40"><ChevronLeft size={16} /></button>
          <button onClick={() => setPage((p) => Math.min(pages, p + 1))} disabled={page === pages} className="btn-secondary py-1.5 px-3 text-sm disabled:opacity-40"><ChevronRight size={16} /></button>
        </div>
      </div>

      {/* User detail modal */}
      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="glass rounded-2xl w-full max-w-lg mx-4 p-6 max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-syne font-bold text-lg text-white">User Details</h2>
              <button onClick={() => setSelected(null)} className="text-slate-500 hover:text-white">✕</button>
            </div>
            <div className="space-y-3 text-sm">
              {[
                ['Name', selected.full_name],
                ['Email', selected.email],
                ['Phone', selected.phone || '—'],
                ['Country', selected.country || '—'],
                ['Role', selected.role],
                ['Verified', selected.verified ? '✅ Yes' : '❌ No'],
                ['Joined', new Date(selected.created_at).toLocaleString()],
                ['Last Login', selected.last_login ? new Date(selected.last_login).toLocaleString() : 'Never'],
                ['Watchlist Stocks', selected.watchlists?.length || 0],
                ['Active Alerts', selected.alerts?.filter((a) => a.active).length || 0],
                ['Total Payments', selected.payments?.length || 0],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between py-2 border-b border-slate-800/30">
                  <span className="text-slate-400">{k}</span>
                  <span className="text-white">{v}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => api.put(`/admin/users/${selected.id}`, { plan: 'pro' }).then(() => setSelected(null))} className="btn-primary text-sm py-2 px-4">Set Pro</button>
              <button onClick={() => api.put(`/admin/users/${selected.id}`, { plan: 'elite' }).then(() => setSelected(null))} className="btn-secondary text-sm py-2 px-4">Set Elite</button>
              <button onClick={() => { deleteUser(selected.id); setSelected(null); }} className="btn-secondary text-sm py-2 px-4 text-red-400 border-red-500/30">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
