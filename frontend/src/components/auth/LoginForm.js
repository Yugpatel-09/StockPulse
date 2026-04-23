'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Zap } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';

export default function LoginForm({ onClose, onSwitch }) {
  const { login } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '', remember: false });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [forgotMode, setForgotMode] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const user = await login(form.email, form.password);
      onClose();
      router.push(user.role === 'admin' ? '/admin' : '/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgot = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email: forgotEmail });
      setForgotSent(true);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (forgotMode) {
    return (
      <div>
        <div className="flex items-center gap-2 mb-6">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center">
            <Zap size={14} className="text-white" />
          </div>
          <span className="font-syne font-bold text-lg text-white">Reset Password</span>
        </div>

        {forgotSent ? (
          <div className="text-center py-4">
            <div className="text-green-400 text-4xl mb-3">✓</div>
            <p className="text-white font-semibold mb-2">Check your email</p>
            <p className="text-slate-400 text-sm">We sent a reset link to {forgotEmail}. It expires in 15 minutes.</p>
            <button onClick={() => { setForgotMode(false); setForgotSent(false); }} className="btn-secondary mt-6 w-full py-2.5 text-sm">Back to Login</button>
          </div>
        ) : (
          <form onSubmit={handleForgot} className="space-y-4">
            <p className="text-slate-400 text-sm mb-4">Enter your email and we'll send you a reset link.</p>
            {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm p-3 rounded-lg">{error}</div>}
            <input type="email" placeholder="Email address" value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} className="input-dark" required />
            <button type="submit" disabled={loading} className="btn-primary w-full py-3">{loading ? 'Sending...' : 'Send Reset Link'}</button>
            <button type="button" onClick={() => setForgotMode(false)} className="btn-secondary w-full py-2.5 text-sm">Back to Login</button>
          </form>
        )}
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center">
          <Zap size={14} className="text-white" />
        </div>
        <span className="font-syne font-bold text-lg text-white">Welcome back</span>
      </div>

      {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm p-3 rounded-lg mb-4">{error}</div>}

      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="text-slate-400 text-xs mb-1.5 block">Email Address</label>
          <input type="email" placeholder="you@example.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input-dark" required />
        </div>

        <div>
          <label className="text-slate-400 text-xs mb-1.5 block">Password</label>
          <div className="relative">
            <input type={showPass ? 'text' : 'password'} placeholder="••••••••" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="input-dark pr-10" required />
            <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
              {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm text-slate-400 cursor-pointer">
            <input type="checkbox" checked={form.remember} onChange={(e) => setForm({ ...form, remember: e.target.checked })} className="rounded" />
            Remember me
          </label>
          <button type="button" onClick={() => setForgotMode(true)} className="text-cyan-400 text-sm hover:text-cyan-300">Forgot password?</button>
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full py-3">
          {loading ? 'Signing in...' : 'Login'}
        </button>
      </form>

      <div className="relative my-5">
        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-700" /></div>
        <div className="relative flex justify-center"><span className="bg-navy-800 px-3 text-slate-500 text-xs">or continue with</span></div>
      </div>

      <button className="w-full flex items-center justify-center gap-3 py-2.5 glass rounded-lg text-sm text-slate-300 hover:text-white hover:border-slate-600 transition-all border border-slate-700">
        <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
        Continue with Google
      </button>

      <p className="text-center text-slate-500 text-sm mt-5">
        Don't have an account?{' '}
        <button onClick={onSwitch} className="text-cyan-400 hover:text-cyan-300">Sign Up</button>
      </p>
    </div>
  );
}
