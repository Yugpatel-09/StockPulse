'use client';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Menu, Search, Bell, ChevronDown, User, Settings, CreditCard, LogOut } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function DashboardTopbar({ onMenuClick }) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (!dropdownRef.current?.contains(e.target)) setDropdownOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  return (
    <header className="h-16 bg-navy-900 border-b border-slate-800/50 flex items-center gap-4 px-4 sm:px-6">
      <button onClick={onMenuClick} className="lg:hidden text-slate-400 hover:text-white">
        <Menu size={22} />
      </button>

      {/* Search */}
      <div className="flex-1 max-w-md relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          type="text"
          placeholder="Search stocks, news, symbols..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-dark pl-9 py-2 text-sm"
        />
      </div>

      <div className="flex items-center gap-3 ml-auto">
        {/* Notifications */}
        <button className="relative w-9 h-9 glass rounded-lg flex items-center justify-center text-slate-400 hover:text-white transition-colors">
          <Bell size={18} />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">3</span>
        </button>

        {/* User dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button onClick={() => setDropdownOpen(!dropdownOpen)} className="flex items-center gap-2 glass rounded-lg px-3 py-2 hover:border-slate-600 transition-all">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white text-xs font-bold">
              {user?.full_name?.charAt(0) || 'U'}
            </div>
            <span className="text-sm text-white hidden sm:block max-w-24 truncate">{user?.full_name}</span>
            <ChevronDown size={14} className="text-slate-400" />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 glass rounded-xl border border-slate-700/50 py-1 z-50 shadow-2xl">
              {[
                { icon: User, label: 'Profile', href: '/dashboard/settings' },
                { icon: Settings, label: 'Settings', href: '/dashboard/settings' },
                { icon: CreditCard, label: 'Billing', href: '/dashboard/settings?tab=billing' },
              ].map(({ icon: Icon, label, href }) => (
                <button key={label} onClick={() => { router.push(href); setDropdownOpen(false); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-400 hover:text-white hover:bg-white/5 transition-colors">
                  <Icon size={15} /> {label}
                </button>
              ))}
              <div className="border-t border-slate-700/50 my-1" />
              <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/5 transition-colors">
                <LogOut size={15} /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
