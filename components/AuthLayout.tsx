import { ReactNode } from 'react';
import Link from 'next/link';
import { Play } from 'lucide-react';

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle: string;
}

export default function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex bg-black text-white">
      {/* Left side - Branding (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#050505] border-r border-white/5 flex-col justify-between p-12 relative overflow-hidden">
        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-20 bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)]"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-indigo-500/10 to-transparent pointer-events-none"></div>
        
        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-2 mb-12">
            <div className="bg-white p-1.5 rounded-md">
              <Play className="w-4 h-4 text-black fill-black" />
            </div>
            <span className="font-semibold text-xl text-white tracking-tight">VidMetrics</span>
          </Link>
          
          <h1 className="text-4xl font-bold text-white leading-tight mb-6 tracking-tight">
            The intelligence layer <br />
            for YouTube growth.
          </h1>
          <p className="text-lg text-zinc-400 max-w-md">
            Join 500+ enterprise content teams using VidMetrics to outsmart their competition.
          </p>
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-4">
            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-10 h-10 rounded-full border-2 border-[#050505] overflow-hidden bg-zinc-800">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={`https://i.pravatar.cc/150?img=${i + 20}`} alt="User" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
              ))}
            </div>
            <div className="text-sm text-zinc-400">
              <span className="text-white font-medium">500+</span> teams joined
            </div>
          </div>
        </div>
      </div>
      
      {/* Right side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-8 bg-black">
        <div className="w-full max-w-sm">
          {/* Mobile-only logo */}
          <div className="lg:hidden mb-8 flex justify-center">
            <Link href="/" className="flex items-center gap-2">
              <div className="bg-white p-1.5 rounded-md">
                <Play className="w-4 h-4 text-black fill-black" />
              </div>
              <span className="font-semibold text-xl text-white tracking-tight">VidMetrics</span>
            </Link>
          </div>
          
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">{title}</h2>
            <p className="text-zinc-400 text-sm">{subtitle}</p>
          </div>
          
          {children}
          
        </div>
      </div>
    </div>
  );
}
