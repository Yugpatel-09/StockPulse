'use client';
import { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Zap, Eye, EyeOff } from 'lucide-react';
import api from '@/lib/api';

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [form, setForm] = useState({ password: '', confirm: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) return setError('Passwords do not match');
    setLoading(true);
    setError('');
    try {
      await api.post('/auth/reset-password', { token: searchParams.get('token'), password: form.password });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Reset failed. Link may have expired.');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen mesh-bg flex items-center justify-center px-4">
      <div className="glass rounded-2xl w-full max-w-sm p-8">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center">
            <Zap size={14} className="text-white" />
          </div>
          <span className="font-syne font-bold text-xl text-white">Reset Password</span>
        </div>

        {success ? (
          <div className="text-center">
            <div className="text-5xl mb-4">✅</div>
            <h3 className="font-syne font-bold text-lg text-white mb-2">Password Reset!</h3>
            <p className="text-slate-400 text-sm mb-6">Your password has been updated. Please login with your new password.</p>
            <button onClick={() => router.push('/')} className="btn-primary w-full py-3">Go to Login</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm p-3 rounded-lg">{error}</div>}
            <div>
              <label className="text-slate-400 text-xs mb-1.5 block">New Password</label>
              <div className="relative">
                <input type={showPass ? 'text' : 'password'} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="input-dark pr-10" required minLength={8} placeholder="Min. 8 characters" />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div>
              <label className="text-slate-400 text-xs mb-1.5 block">Confirm Password</label>
              <input type="password" value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} className="input-dark" required placeholder="Repeat password" />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-3">
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
