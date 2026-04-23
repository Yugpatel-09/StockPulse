'use client';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { User, Shield, Bell, CreditCard, Upload } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';

const TABS = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'billing', label: 'Billing', icon: CreditCard },
];

function ProfileTab({ user }) {
  const { setUser } = useAuth();
  const [form, setForm] = useState({ full_name: user?.full_name || '', phone: user?.phone || '', country: user?.country || '' });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const save = async () => {
    setSaving(true);
    try {
      const { data } = await api.put('/user/profile', form);
      setUser((prev) => ({ ...prev, ...data }));
      localStorage.setItem('user', JSON.stringify({ ...user, ...data }));
      setMsg('Profile updated successfully');
    } catch { setMsg('Failed to update profile'); }
    finally { setSaving(false); setTimeout(() => setMsg(''), 3000); }
  };

  return (
    <div className="space-y-5 max-w-lg">
      <h2 className="font-syne font-semibold text-lg text-white">Profile Settings</h2>
      {msg && <div className="bg-green-500/10 border border-green-500/30 text-green-400 text-sm p-3 rounded-lg">{msg}</div>}
      <div>
        <label className="text-slate-400 text-xs mb-1.5 block">Full Name</label>
        <input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} className="input-dark" />
      </div>
      <div>
        <label className="text-slate-400 text-xs mb-1.5 block">Email (cannot change)</label>
        <input value={user?.email} disabled className="input-dark opacity-50 cursor-not-allowed" />
      </div>
      <div>
        <label className="text-slate-400 text-xs mb-1.5 block">Phone</label>
        <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input-dark" placeholder="+91 98765 43210" />
      </div>
      <div>
        <label className="text-slate-400 text-xs mb-1.5 block">Country</label>
        <input value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} className="input-dark" />
      </div>
      <button onClick={save} disabled={saving} className="btn-primary py-2.5 px-6 text-sm">
        {saving ? 'Saving...' : 'Save Changes'}
      </button>
    </div>
  );
}

function SecurityTab() {
  const [form, setForm] = useState({ current_password: '', new_password: '', confirm: '' });
  const [msg, setMsg] = useState({ text: '', type: '' });
  const [loading, setLoading] = useState(false);

  const changePassword = async () => {
    if (form.new_password !== form.confirm) return setMsg({ text: 'Passwords do not match', type: 'error' });
    setLoading(true);
    try {
      await api.post('/user/change-password', { current_password: form.current_password, new_password: form.new_password });
      setMsg({ text: 'Password changed successfully', type: 'success' });
      setForm({ current_password: '', new_password: '', confirm: '' });
    } catch (err) {
      setMsg({ text: err.response?.data?.error || 'Failed', type: 'error' });
    } finally { setLoading(false); }
  };

  return (
    <div className="space-y-5 max-w-lg">
      <h2 className="font-syne font-semibold text-lg text-white">Security</h2>
      {msg.text && <div className={`text-sm p-3 rounded-lg ${msg.type === 'success' ? 'bg-green-500/10 border border-green-500/30 text-green-400' : 'bg-red-500/10 border border-red-500/30 text-red-400'}`}>{msg.text}</div>}
      <div>
        <label className="text-slate-400 text-xs mb-1.5 block">Current Password</label>
        <input type="password" value={form.current_password} onChange={(e) => setForm({ ...form, current_password: e.target.value })} className="input-dark" />
      </div>
      <div>
        <label className="text-slate-400 text-xs mb-1.5 block">New Password</label>
        <input type="password" value={form.new_password} onChange={(e) => setForm({ ...form, new_password: e.target.value })} className="input-dark" />
      </div>
      <div>
        <label className="text-slate-400 text-xs mb-1.5 block">Confirm New Password</label>
        <input type="password" value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} className="input-dark" />
      </div>
      <button onClick={changePassword} disabled={loading} className="btn-primary py-2.5 px-6 text-sm">
        {loading ? 'Updating...' : 'Change Password'}
      </button>
    </div>
  );
}

function BillingTab() {
  const [sub, setSub] = useState(null);
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    Promise.all([api.get('/user/subscription'), api.get('/user/payments')]).then(([s, p]) => {
      setSub(s.data);
      setPayments(p.data);
    }).catch(() => {});
  }, []);

  const PLAN_PRICES = { free: '₹0', pro: '₹499', elite: '₹999' };

  return (
    <div className="space-y-6 max-w-2xl">
      <h2 className="font-syne font-semibold text-lg text-white">Billing & Subscription</h2>

      {sub && (
        <div className="glass rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-slate-400 text-xs mb-1">Current Plan</div>
              <div className="font-syne font-bold text-xl text-white capitalize">{sub.plan} Plan</div>
              <div className="text-slate-400 text-sm">{PLAN_PRICES[sub.plan]}/month</div>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${sub.status === 'active' ? 'badge-bullish' : 'badge-bearish'}`}>
              {sub.status}
            </span>
          </div>
          {sub.end_date && <div className="text-slate-500 text-sm">Renews on {new Date(sub.end_date).toLocaleDateString()}</div>}
          <div className="flex gap-3 mt-4">
            {sub.plan !== 'elite' && (
              <button className="btn-primary text-sm py-2 px-5">Upgrade Plan</button>
            )}
            {sub.plan !== 'free' && (
              <button className="btn-secondary text-sm py-2 px-5 text-red-400 border-red-500/30 hover:border-red-400">Cancel Subscription</button>
            )}
          </div>
        </div>
      )}

      {payments.length > 0 && (
        <div>
          <h3 className="font-syne font-semibold text-white mb-3">Payment History</h3>
          <div className="glass rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800/50">
                  <th className="text-left p-4 text-slate-400 font-medium">Date</th>
                  <th className="text-left p-4 text-slate-400 font-medium">Amount</th>
                  <th className="text-left p-4 text-slate-400 font-medium">Gateway</th>
                  <th className="text-left p-4 text-slate-400 font-medium">Status</th>
                  <th className="text-left p-4 text-slate-400 font-medium">Invoice</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p.id} className="border-b border-slate-800/30 hover:bg-white/2">
                    <td className="p-4 text-slate-300">{new Date(p.created_at).toLocaleDateString()}</td>
                    <td className="p-4 text-white font-medium">{p.currency} {p.amount}</td>
                    <td className="p-4 text-slate-400 capitalize">{p.gateway}</td>
                    <td className="p-4"><span className={`px-2 py-0.5 rounded-full text-xs ${p.status === 'success' ? 'badge-bullish' : 'badge-bearish'}`}>{p.status}</span></td>
                    <td className="p-4">
                      <a href={`/api/payment/invoice/${p.id}`} target="_blank" className="text-cyan-400 hover:text-cyan-300 text-xs">Download</a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SettingsPage() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'profile');
  const { user } = useAuth();

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-syne font-bold text-2xl text-white">⚙️ Settings</h1>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Tab nav */}
        <div className="lg:w-48 flex lg:flex-col gap-1">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`sidebar-link ${activeTab === id ? 'active' : ''}`}
            >
              <Icon size={16} /> {label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="flex-1 glass rounded-2xl p-6">
          {activeTab === 'profile' && <ProfileTab user={user} />}
          {activeTab === 'security' && <SecurityTab />}
          {activeTab === 'notifications' && (
            <div className="space-y-4 max-w-lg">
              <h2 className="font-syne font-semibold text-lg text-white">Notifications</h2>
              {[
                { label: 'Email alerts for new stock news', key: 'email_alerts' },
                { label: 'In-app notifications', key: 'in_app' },
                { label: 'Weekly digest (every Monday)', key: 'weekly_digest' },
                { label: 'Subscription renewal reminders', key: 'renewal_reminders' },
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between glass rounded-xl p-4">
                  <span className="text-slate-300 text-sm">{item.label}</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-10 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-5 peer-checked:bg-cyan-500 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all" />
                  </label>
                </div>
              ))}
            </div>
          )}
          {activeTab === 'billing' && <BillingTab />}
        </div>
      </div>
    </div>
  );
}
