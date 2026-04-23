'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Zap, Eye, EyeOff, Shield } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function AdminLoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const user = await login(form.email, form.password);
      if (user.role !== 'admin') {
        setError('Access denied. Admin accounts only.');
        return;
      }
      router.push('/admin');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen mesh-bg flex items-center justify-center px-4">
      <div className="glass rounded-2xl w-full max-w-sm p-8">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center mx-auto mb-4">
            <Shield size={24} className="text-white" />
          </div>
          <h1 className="font-syne font-bold text-2xl text-white">Admin Access</h1>
          <p className="text-slate-400 text-sm mt-1">StockPulse Admin Panel</p>
        </div>

        {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm p-3 rounded-lg mb-4">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-slate-400 text-xs mb-1.5 block">Email</label>
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input-dark" required />
          </div>
          <div>
            <label className="text-slate-400 text-xs mb-1.5 block">Password</label>
            <div className="relative">
              <input type={showPass ? 'text' : 'password'} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="input-dark pr-10" required />
              <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500">
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full py-3">
            {loading ? 'Authenticating...' : 'Access Admin Panel'}
          </button>
        </form>

        <p className="text-center text-slate-600 text-xs mt-6">Restricted access. Unauthorized entry is prohibited.</p>
      </div>
    </div>
  );
}
