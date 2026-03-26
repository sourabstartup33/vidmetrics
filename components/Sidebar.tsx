'use client';

import { LayoutDashboard, Users, FileText, TrendingUp, Download, Settings } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar() {
  const pathname = usePathname();
  
  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { name: 'Competitors', icon: Users, path: '/dashboard/competitors' },
    { name: 'Reports', icon: FileText, path: '/dashboard/reports' },
    { name: 'Trends', icon: TrendingUp, path: '/dashboard/trends' },
    { name: 'Exports', icon: Download, path: '/dashboard/exports' },
    { name: 'Settings', icon: Settings, path: '/dashboard/settings' },
  ];

  return (
    <aside className="w-64 bg-black border-r border-white/10 h-[calc(100vh-4rem)] flex flex-col justify-between sticky top-16 overflow-y-auto hidden md:flex">
      <div className="p-4">
        <div className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.path || (item.path === '/dashboard' && pathname === '/dashboard');
            const Icon = item.icon;
            
            return (
              <Link
                key={item.name}
                href={item.path}
                className={`flex items-center gap-3 px-3 py-2 text-sm font-medium transition-colors ${
                  isActive 
                    ? 'bg-indigo-500/10 text-white border-l-[3px] border-indigo-500 rounded-r-lg rounded-l-none' 
                    : 'text-zinc-500 hover:bg-white/5 hover:text-white border-l-[3px] border-transparent rounded-lg'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-indigo-400' : 'text-zinc-600'}`} />
                {item.name}
              </Link>
            );
          })}
        </div>
      </div>
      
      <div className="p-4 border-t border-white/10 bg-[#0A0A0A]">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-zinc-800 overflow-hidden border border-white/10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="https://i.pravatar.cc/150?img=33" alt="User" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          </div>
          <div>
            <p className="text-sm font-bold text-white">Jane Doe</p>
            <p className="text-xs text-zinc-500">Acme Corp</p>
          </div>
        </div>
        <button className="w-full py-2 px-3 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-lg shadow-indigo-500/20 text-sm font-bold rounded-lg hover:to-indigo-500 transition-colors">
          Upgrade Plan
        </button>
      </div>
    </aside>
  );
}
