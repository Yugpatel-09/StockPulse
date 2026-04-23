'use client';
import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import api from '@/lib/api';

export default function AdminLogsPage() {
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get('/admin/logs', { params: { search } }).then(({ data }) => {
      setLogs(data.logs);
      setTotal(data.total);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [search]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-syne font-bold text-2xl text-white">Activity Log</h1>
        <p className="text-slate-400 text-sm mt-1">{total} admin actions recorded</p>
      </div>

      <div className="relative max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        <input type="text" placeholder="Search actions..." value={search} onChange={(e) => setSearch(e.target.value)} className="input-dark pl-9 text-sm" />
      </div>

      <div className="glass rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-800/50">
              {['Timestamp', 'Admin', 'Action', 'Target Type', 'Target ID'].map((h) => (
                <th key={h} className="text-left p-4 text-slate-400 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? Array.from({ length: 8 }).map((_, i) => (
              <tr key={i} className="border-b border-slate-800/30">
                {Array.from({ length: 5 }).map((_, j) => <td key={j} className="p-4"><div className="h-4 bg-slate-800 rounded animate-pulse" /></td>)}
              </tr>
            )) : logs.map((log) => (
              <tr key={log.id} className="border-b border-slate-800/30 hover:bg-white/2">
                <td className="p-4 text-slate-500 text-xs">{new Date(log.timestamp).toLocaleString()}</td>
                <td className="p-4 text-slate-400 font-mono text-xs truncate max-w-24">{log.admin_id?.slice(0, 8)}...</td>
                <td className="p-4 text-white">{log.action}</td>
                <td className="p-4 text-slate-400 capitalize">{log.target_type || '—'}</td>
                <td className="p-4 text-slate-500 font-mono text-xs truncate max-w-24">{log.target_id?.slice(0, 8) || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
