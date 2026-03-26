import Link from 'next/link';
import { Play, Bell, Search } from 'lucide-react';

export default function DashboardNav() {
  return (
    <nav className="sticky top-0 z-40 bg-black/80 backdrop-blur-md border-b border-white/10 h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8">
      <div className="flex items-center gap-8">
        <Link href="/" className="flex items-center gap-2">
          <div className="bg-indigo-500 p-1.5 rounded-md">
            <Play className="w-4 h-4 text-white fill-white" />
          </div>
          <span className="font-bold text-xl text-white tracking-tight hidden sm:block">VidMetrics</span>
        </Link>
        
        <div className="relative hidden md:block w-96">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-zinc-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-white/10 rounded-lg leading-5 bg-[#0A0A0A] placeholder-zinc-500 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors"
            placeholder="Search channels..."
          />
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <button className="p-2 text-zinc-400 hover:text-white transition-colors relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-500 rounded-full border-2 border-black"></span>
        </button>
        <div className="w-8 h-8 rounded-full bg-zinc-800 border border-white/10 overflow-hidden cursor-pointer">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="https://i.pravatar.cc/150?img=33" alt="User" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
        </div>
      </div>
    </nav>
  );
}
