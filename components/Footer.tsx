'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import { Play } from 'lucide-react';

export default function Footer() {
  return (
    <motion.footer 
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="bg-black border-t border-white/5 pt-16 pb-8"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-6">
              <div className="bg-white p-1.5 rounded-md">
                <Play className="w-3 h-3 text-black fill-black" />
              </div>
              <span className="font-semibold text-white tracking-tight">VidMetrics</span>
            </Link>
            <p className="text-zinc-400 text-sm max-w-xs">
              YouTube competitor analytics for content teams and creators.
            </p>
          </div>
          
          <div>
            <h4 className="font-medium mb-4 text-zinc-100 text-sm">Product</h4>
            <ul className="space-y-3 text-sm">
              <li><a href="#features" className="text-zinc-400 hover:text-white transition-colors">Features</a></li>
              <li><a href="#how-it-works" className="text-zinc-400 hover:text-white transition-colors">Method</a></li>
              <li><a href="#pricing" className="text-zinc-400 hover:text-white transition-colors">Pricing</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-4 text-zinc-100 text-sm">Account</h4>
            <ul className="space-y-3 text-sm">
              <li><Link href="/dashboard" className="text-zinc-400 hover:text-white transition-colors">Live demo</Link></li>
              <li><Link href="/login" className="text-zinc-400 hover:text-white transition-colors">Log in</Link></li>
              <li><Link href="/signup" className="text-zinc-400 hover:text-white transition-colors">Sign up</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-zinc-500 text-xs">
            © {new Date().getFullYear()} VidMetrics Inc. All rights reserved.
          </p>
          <p className="text-zinc-500 text-xs">Built on the public YouTube Data API</p>
        </div>
      </div>
    </motion.footer>
  );
}
