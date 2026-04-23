'use client';
import { useAuth } from '@/context/AuthContext';
import { Shield } from 'lucide-react';

export default function AdminTopbar() {
  const { user } = useAuth();
  return (
    <header className="h-14 bg-navy-900 border-b border-slate-800/50 flex items-center justify-between px-6">
      <div className="flex items-center gap-2 text-slate-400 text-sm">
        <Shield size={15} className="text-cyan-400" />
        Admin Dashboard
      </div>
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white text-xs font-bold">
          {user?.full_name?.charAt(0)}
        </div>
        <span className="text-sm text-slate-300">{user?.full_name}</span>
      </div>
    </header>
  );
}
