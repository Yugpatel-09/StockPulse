'use client';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Home, TrendingUp, Globe, Star, Bell, Briefcase, BarChart2, Settings, Zap, X, LogOut } from 'lucide-react';

const NAV_ITEMS = [
  { icon: Home, label: 'Home Feed', href: '/dashboard' },
  { icon: TrendingUp, label: 'Indian Markets', href: '/dashboard/india' },
  { icon: Globe, label: 'International', href: '/dashboard/international' },
  { icon: Star, label: 'My Watchlist', href: '/dashboard/watchlist' },
  { icon: Bell, label: 'My Alerts', href: '/dashboard/alerts' },
  { icon: Briefcase, label: 'My Portfolio', href: '/dashboard/portfolio' },
  { icon: BarChart2, label: 'Analytics', href: '/dashboard/analytics' },
  { icon: Settings, label: 'Settings', href: '/dashboard/settings' },
];

export default function DashboardSidebar({ open, onClose }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  return (
    <>
      {/* Mobile overlay */}
      {open && <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={onClose} />}

      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-navy-900 border-r border-slate-800/50 flex flex-col transition-transform duration-300 ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        {/* Logo */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center">
              <Zap size={14} className="text-white" />
            </div>
            <span className="font-syne font-bold text-white">StockPulse</span>
          </div>
          <button onClick={onClose} className="lg:hidden text-slate-500 hover:text-white"><X size={18} /></button>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map(({ icon: Icon, label, href }) => (
            <button
              key={href}
              onClick={() => { router.push(href); onClose(); }}
              className={`sidebar-link w-full ${pathname === href ? 'active' : ''}`}
            >
              <Icon size={18} />
              {label}
            </button>
          ))}
        </nav>

        {/* Plan badge + logout */}
        <div className="p-4 border-t border-slate-800/50 space-y-3">
          <div className="glass rounded-lg p-3">
            <div className="text-xs text-slate-500 mb-1">Current Plan</div>
            <div className="text-sm font-semibold text-cyan-400 capitalize">Free Plan</div>
            <button onClick={() => router.push('/dashboard/settings?tab=billing')} className="text-xs text-slate-500 hover:text-cyan-400 mt-1 block">Upgrade to Pro →</button>
          </div>
          <button onClick={handleLogout} className="sidebar-link w-full text-red-400 hover:text-red-300 hover:bg-red-500/10">
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>
    </>
  );
}
