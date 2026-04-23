'use client';
import { useState } from 'react';
import { Eye, EyeOff, Zap } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const COUNTRIES = ['India', 'United States', 'United Kingdom', 'Singapore', 'UAE', 'Canada', 'Australia', 'Germany', 'Other'];

const getPasswordStrength = (p) => {
  if (!p) return { label: '', color: '', width: '0%' };
  let score = 0;
  if (p.length >= 8) score++;
  if (/[A-Z]/.test(p)) score++;
  if (/[0-9]/.test(p)) score++;
  if (/[^A-Za-z0-9]/.test(p)) score++;
  if (score <= 1) return { label: 'Weak', color: 'bg-red-500', width: '25%' };
  if (score === 2) return { label: 'Medium', color: 'bg-yellow-500', width: '50%' };
  if (score === 3) return { label: 'Strong', color: 'bg-blue-500', width: '75%' };
  return { label: 'Very Strong', color: 'bg-green-500', width: '100%' };
};

export default function SignupForm({ onClose, onSwitch }) {
  const { signup } = useAuth();
  const [form, setForm] = useState({ full_name: '', email: '', password: '', confirm_password: '', phone: '', country: 'India', agree: false });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const strength = getPasswordStrength(form.password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirm_password) return setError('Passwords do not match');
    if (!form.agree) return setError('Please agree to the Terms of Service');

    setLoading(true);
    try {
      await signup({ full_name: form.full_name, email: form.email, password: form.password, phone: form.phone, country: form.country });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.errors?.[0]?.msg || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center py-4">
        <div className="text-5xl mb-4">🎉</div>
        <h3 className="font-syne font-bold text-xl text-white mb-2">Account Created!</h3>
        <p className="text-slate-400 text-sm mb-6">We sent a verification email to <span className="text-cyan-400">{form.email}</span>. Please verify your email to activate your account.</p>
        <button onClick={onSwitch} className="btn-primary w-full py-3">Go to Login</button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center">
          <Zap size={14} className="text-white" />
        </div>
        <span className="font-syne font-bold text-lg text-white">Create your account</span>
      </div>

      {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm p-3 rounded-lg mb-4">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="text-slate-400 text-xs mb-1.5 block">Full Name</label>
          <input type="text" placeholder="Your full name" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} className="input-dark" required />
        </div>

        <div>
          <label className="text-slate-400 text-xs mb-1.5 block">Email Address</label>
          <input type="email" placeholder="you@example.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input-dark" required />
        </div>

        <div>
          <label className="text-slate-400 text-xs mb-1.5 block">Password</label>
          <div className="relative">
            <input type={showPass ? 'text' : 'password'} placeholder="Min. 8 characters" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="input-dark pr-10" required minLength={8} />
            <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
              {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {form.password && (
            <div className="mt-1.5">
              <div className="h-1 bg-slate-700 rounded-full overflow-hidden">
                <div className={`h-full ${strength.color} transition-all duration-300`} style={{ width: strength.width }} />
              </div>
              <span className="text-xs text-slate-500 mt-0.5 block">{strength.label}</span>
            </div>
          )}
        </div>

        <div>
          <label className="text-slate-400 text-xs mb-1.5 block">Confirm Password</label>
          <input type="password" placeholder="Repeat password" value={form.confirm_password} onChange={(e) => setForm({ ...form, confirm_password: e.target.value })} className={`input-dark ${form.confirm_password && form.password !== form.confirm_password ? 'border-red-500/50' : ''}`} required />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-slate-400 text-xs mb-1.5 block">Phone (optional)</label>
            <input type="tel" placeholder="+91 98765 43210" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input-dark" />
          </div>
          <div>
            <label className="text-slate-400 text-xs mb-1.5 block">Country</label>
            <select value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} className="input-dark">
              {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <label className="flex items-start gap-2 cursor-pointer">
          <input type="checkbox" checked={form.agree} onChange={(e) => setForm({ ...form, agree: e.target.checked })} className="mt-0.5 rounded" />
          <span className="text-slate-400 text-xs leading-relaxed">
            I agree to the <a href="#" className="text-cyan-400 hover:underline">Terms of Service</a> and <a href="#" className="text-cyan-400 hover:underline">Privacy Policy</a>
          </span>
        </label>

        <button type="submit" disabled={loading} className="btn-primary w-full py-3">
          {loading ? 'Creating account...' : 'Create Account'}
        </button>
      </form>

      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-700" /></div>
        <div className="relative flex justify-center"><span className="bg-navy-800 px-3 text-slate-500 text-xs">or</span></div>
      </div>

      <button className="w-full flex items-center justify-center gap-3 py-2.5 glass rounded-lg text-sm text-slate-300 hover:text-white transition-all border border-slate-700">
        <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
        Continue with Google
      </button>

      <p className="text-center text-slate-500 text-sm mt-4">
        Already have an account?{' '}
        <button onClick={onSwitch} className="text-cyan-400 hover:text-cyan-300">Login</button>
      </p>
    </div>
  );
}
