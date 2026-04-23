'use client';
import { useState, useEffect } from 'react';
import { Plus, Trash2, Bell, BellOff } from 'lucide-react';
import api from '@/lib/api';

export default function AlertsPage() {
  const [alerts, setAlerts] = useState([]);
  const [adding, setAdding] = useState('');
  const [plan, setPlan] = useState('free');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/user/alerts'),
      api.get('/user/subscription'),
    ]).then(([alertsRes, subRes]) => {
      setAlerts(alertsRes.data);
      setPlan(subRes.data.plan || 'free');
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const addAlert = async () => {
    if (!adding.trim()) return;
    try {
      const { data } = await api.post('/user/alerts', { stock_symbol: adding.toUpperCase() });
      setAlerts((prev) => [...prev, data]);
      setAdding('');
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to add alert');
    }
  };

  const deleteAlert = async (id) => {
    await api.delete(`/user/alerts/${id}`);
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  };

  const toggleAlert = async (id) => {
    const { data } = await api.put(`/user/alerts/${id}/toggle`);
    setAlerts((prev) => prev.map((a) => a.id === id ? data : a));
  };

  if (plan === 'free') {
    return (
      <div>
        <div className="mb-6">
          <h1 className="font-syne font-bold text-2xl text-white">🔔 My Alerts</h1>
        </div>
        <div className="glass rounded-2xl p-12 text-center">
          <Bell size={48} className="text-slate-600 mx-auto mb-4" />
          <h3 className="font-syne font-bold text-xl text-white mb-2">Alerts require Pro plan</h3>
          <p className="text-slate-400 text-sm mb-6">Upgrade to Pro to set up to 10 custom stock alerts. Elite users get unlimited alerts.</p>
          <button onClick={() => window.location.href = '/dashboard/settings?tab=billing'} className="btn-primary py-3 px-8">Upgrade to Pro — ₹499/month</button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-syne font-bold text-2xl text-white">🔔 My Alerts</h1>
        <p className="text-slate-400 text-sm mt-1">
          {plan === 'pro' ? `${alerts.length}/10 alerts used` : 'Unlimited alerts (Elite)'}
        </p>
      </div>

      <div className="flex gap-3 mb-6">
        <input
          type="text"
          placeholder="Stock symbol (e.g. AAPL, RELIANCE)"
          value={adding}
          onChange={(e) => setAdding(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addAlert()}
          className="input-dark flex-1 max-w-sm text-sm"
        />
        <button onClick={addAlert} className="btn-primary flex items-center gap-2 text-sm py-2 px-4">
          <Plus size={16} /> Add Alert
        </button>
      </div>

      {alerts.length === 0 && !loading ? (
        <div className="glass rounded-2xl p-12 text-center">
          <Bell size={40} className="text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400">No alerts set. Add a stock symbol above to get started.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert) => (
            <div key={alert.id} className="glass rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${alert.active ? 'bg-cyan-500/20' : 'bg-slate-700/50'}`}>
                  {alert.active ? <Bell size={16} className="text-cyan-400" /> : <BellOff size={16} className="text-slate-500" />}
                </div>
                <div>
                  <div className="font-mono font-semibold text-white">{alert.stock_symbol}</div>
                  <div className="text-xs text-slate-500">{alert.active ? 'Active — notifying on new articles' : 'Paused'}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => toggleAlert(alert.id)} className={`text-xs px-3 py-1.5 rounded-full transition-colors ${alert.active ? 'bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20' : 'bg-slate-700 text-slate-400 hover:bg-slate-600'}`}>
                  {alert.active ? 'Pause' : 'Resume'}
                </button>
                <button onClick={() => deleteAlert(alert.id)} className="text-slate-600 hover:text-red-400 transition-colors p-1.5">
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
