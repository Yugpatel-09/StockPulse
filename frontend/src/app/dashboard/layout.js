'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import DashboardTopbar from '@/components/dashboard/DashboardTopbar';

export default function DashboardLayout({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.push('/');
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen mesh-bg flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
          <span className="text-slate-400 text-sm">Loading StockPulse...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-navy-950 flex">
      <DashboardSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0">
        <DashboardTopbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 p-4 sm:p-6 overflow-auto">
          {!user.verified && (
            <div className="mb-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 flex items-center justify-between">
              <span className="text-yellow-400 text-sm">⚠️ Please verify your email to unlock all features.</span>
              <button className="text-yellow-400 text-sm underline hover:text-yellow-300">Resend link</button>
            </div>
          )}
          {children}
        </main>
      </div>
    </div>
  );
}
