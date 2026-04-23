'use client';
import NewsFeed from '@/components/dashboard/NewsFeed';

export default function DashboardHome() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="font-syne font-bold text-2xl text-white">Home Feed</h1>
        <p className="text-slate-400 text-sm mt-1">Live news from Indian and International markets</p>
      </div>
      <NewsFeed />
    </div>
  );
}
