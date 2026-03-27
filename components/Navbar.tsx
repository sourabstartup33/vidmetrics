import Link from 'next/link';
import { Play } from 'lucide-react';

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-6 px-4 animate-fade-in">
      <div className="bg-black/80 backdrop-blur-2xl border border-white/10 rounded-full px-6 py-3 flex items-center justify-between w-full max-w-5xl shadow-2xl shadow-black/50">
        <Link href="/" className="flex items-center gap-2">
          <div className="bg-white p-1.5 rounded-md">
            <Play className="w-3 h-3 text-black fill-black" />
          </div>
          <span className="font-semibold text-white tracking-tight">VidMetrics</span>
        </Link>
        
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-400">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#how-it-works" className="hover:text-white transition-colors">Method</a>
          <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
        </div>
        
        <div className="flex items-center gap-4 text-sm font-medium">
          <Link href="/login" className="text-zinc-400 hover:text-white transition-colors">Log in</Link>
          <Link href="/signup" className="bg-white text-black px-4 py-2 rounded-full hover:bg-zinc-200 transition-colors">Sign up</Link>
        </div>
      </div>
    </nav>
  );
}
