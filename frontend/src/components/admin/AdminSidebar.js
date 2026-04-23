'use client';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Users, CreditCard, Star, Newspaper, BarChart2, FileText, Zap, LogOut } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const NAV = [
  { icon: LayoutDashboard, label: 'Overview', href: '/admin' },
  { icon: Users, label: 'Customers', href: '/admin/customers' },
  { icon: CreditCard, label: 'Payments', href: '/admin/payments' },
  { icon: Star, label: 'Reviews', href: '/admin/reviews' },
  { icon: Newspaper, label: 'News', href: '/admin/news' },
  { icon: BarChart2, label: 'Analytics', href: '/admin/analytics' },
  { icon: FileText, label: 'Activity Log', href: '/admin/logs' },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();

  return (
    <aside className="w-60 bg-navy-900 border-r border-slate-800/50 flex flex-col">
      <div className="p-5 border-b border-slate-800/50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center">
            <Zap size={14} className="text-white" />
          </div>
          <div>
            <div className="font-syne font-bold text-white text-sm">StockPulse</div>
            <div className="text-xs text-cyan-400">Admin Panel</div>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {NAV.map(({ icon: Icon, label, href }) => (
          <button
            key={href}
            onClick={() => router.push(href)}
            className={`sidebar-link w-full ${pathname === href ? 'active' : ''}`}
          >
            <Icon size={17} /> {label}
          </button>
        ))}
      </nav>

      <div className="p-3 border-t border-slate-800/50">
        <button onClick={async () => { await logout(); router.push('/'); }} className="sidebar-link w-full text-red-400 hover:text-red-300 hover:bg-red-500/10">
          <LogOut size={16} /> Logout
        </button>
      </div>
    </aside>
  );
}
