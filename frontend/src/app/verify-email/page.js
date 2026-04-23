'use client';
import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Zap, CheckCircle, XCircle } from 'lucide-react';
import api from '@/lib/api';

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) { setStatus('error'); return; }

    api.get(`/auth/verify-email/${token}`)
      .then(() => setStatus('success'))
      .catch(() => setStatus('error'));
  }, [searchParams]);

  return (
    <div className="min-h-screen mesh-bg flex items-center justify-center px-4">
      <div className="glass rounded-2xl w-full max-w-sm p-8 text-center">
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center">
            <Zap size={14} className="text-white" />
          </div>
          <span className="font-syne font-bold text-xl text-white">StockPulse</span>
        </div>

        {status === 'loading' && (
          <div>
            <div className="w-10 h-10 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-400">Verifying your email...</p>
          </div>
        )}

        {status === 'success' && (
          <div>
            <CheckCircle size={48} className="text-green-400 mx-auto mb-4" />
            <h2 className="font-syne font-bold text-xl text-white mb-2">Email Verified!</h2>
            <p className="text-slate-400 text-sm mb-6">Your account is now fully activated. You can access all features.</p>
            <button onClick={() => router.push('/')} className="btn-primary w-full py-3">Go to Dashboard</button>
          </div>
        )}

        {status === 'error' && (
          <div>
            <XCircle size={48} className="text-red-400 mx-auto mb-4" />
            <h2 className="font-syne font-bold text-xl text-white mb-2">Verification Failed</h2>
            <p className="text-slate-400 text-sm mb-6">This link is invalid or has expired. Please request a new verification email.</p>
            <button onClick={() => router.push('/')} className="btn-secondary w-full py-3">Back to Home</button>
          </div>
        )}
      </div>
    </div>
  );
}
