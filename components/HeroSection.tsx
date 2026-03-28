'use client';

import { ChevronRight, Play, Lock, Search, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { useState, useEffect, FormEvent } from 'react';

export default function HeroSection() {
  const router = useRouter();
  const [channelUrl, setChannelUrl] = useState('');
  const [inputError, setInputError] = useState('');

  const [particles, setParticles] = useState<Array<{
    x: string;
    yStart: string;
    yEnd: string;
    opacity: number;
    scale: number;
    duration: number;
    delay: number;
  }>>([]);

  useEffect(() => {
    setParticles(
      Array.from({ length: 30 }).map(() => ({
        x: `${Math.random() * 100}vw`,
        yStart: `${Math.random() * 100 + 20}vh`,
        yEnd: `-${Math.random() * 20 + 10}vh`,
        opacity: Math.random() * 0.3 + 0.1,
        scale: Math.random() * 0.5 + 0.5,
        duration: Math.random() * 15 + 15,
        delay: Math.random() * 10,
      }))
    );
  }, []);

  const handleAnalyze = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = channelUrl.trim();
    if (!trimmed) {
      setInputError('Please enter a YouTube channel URL');
      return;
    }
    setInputError('');
    const encoded = encodeURIComponent(trimmed);
    router.push(`/dashboard?channel=${encoded}`);
  };

  return (
    <section className="relative pt-24 sm:pt-40 pb-20 overflow-hidden min-h-screen flex flex-col items-center justify-center bg-black">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1], 
            opacity: [0.3, 0.5, 0.3],
            rotate: [0, 90, 0]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-[-10%] left-[-10%] w-[800px] h-[800px] bg-indigo-500/20 blur-[120px] rounded-full"
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.5, 1], 
            opacity: [0.2, 0.4, 0.2],
            x: [0, 100, 0],
            y: [0, -50, 0]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-purple-500/20 blur-[100px] rounded-full"
        />
        
        {/* Particles */}
        {particles.map((p, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full"
            initial={{
              x: p.x,
              y: p.yStart,
              opacity: p.opacity,
              scale: p.scale,
            }}
            animate={{
              y: [p.yStart, p.yEnd],
              opacity: [0, p.opacity * 2, 0],
            }}
            transition={{
              duration: p.duration,
              repeat: Infinity,
              ease: "linear",
              delay: p.delay,
            }}
          />
        ))}
      </div>
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none"></div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-xs font-medium text-indigo-300 mb-8 shadow-[0_0_15px_rgba(99,102,241,0.2)]"
        >
          <span className="flex h-2 w-2 rounded-full bg-indigo-500 animate-pulse"></span>
          V2 with AI-powered insights — coming soon <ChevronRight className="w-3 h-3" />
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter mb-6 text-gradient"
        >
          The new standard for <br className="hidden md:block" />YouTube analytics.
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
          className="text-base sm:text-lg md:text-xl text-zinc-400 mb-10 max-w-2xl mx-auto tracking-tight px-2"
        >
          Track competitors, surface viral trends, and make data-driven decisions at the speed of thought. Built for creators who treat their channel like a business.
        </motion.p>

        {/* ── Functional Channel URL Input ──────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
          className="mb-8 max-w-2xl mx-auto"
        >
          <form onSubmit={handleAnalyze} className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-zinc-400" />
              </div>
              <input
                type="text"
                value={channelUrl}
                onChange={(e) => { setChannelUrl(e.target.value); setInputError(''); }}
                className="block w-full pl-11 pr-4 py-4 border border-white/10 rounded-xl bg-white/5 backdrop-blur-sm placeholder-zinc-500 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm transition-all"
                placeholder="youtube.com/@MrBeast or @handle"
              />
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.15 }}
              type="submit"
              className="btn-primary w-full sm:w-auto px-6 py-4 bg-white text-black font-semibold rounded-xl hover:bg-zinc-200 transition-all text-sm flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:shadow-[0_0_30px_rgba(255,255,255,0.4)] whitespace-nowrap min-h-[44px]"
            >
              Analyze <ArrowRight className="w-4 h-4" />
            </motion.button>
          </form>
          {inputError && (
            <p className="mt-2 text-sm text-red-400 text-left pl-1">{inputError}</p>
          )}
          <p className="mt-2 text-xs text-zinc-500 text-left pl-1">
            Try: @MrBeast · @mkbhd · @tseries
          </p>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} className="w-full sm:w-auto">
            <Link href="/signup" className="w-full sm:w-auto px-8 py-3.5 bg-white/10 text-white font-medium rounded-full hover:bg-white/20 transition-all flex items-center justify-center gap-2 border border-white/10">
              Get started for free
            </Link>
          </motion.div>
          <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} className="w-full sm:w-auto">
            <Link href="/dashboard" className="w-full sm:w-auto px-8 py-3.5 glass-panel text-white font-medium rounded-full hover:bg-white/10 transition-all flex items-center justify-center gap-2 group">
              <Play className="w-4 h-4 text-zinc-400 group-hover:text-white transition-colors" />
              View live demo
            </Link>
          </motion.div>
        </motion.div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 40, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.5 }}
        className="mt-24 w-full max-w-5xl mx-auto px-4 relative z-10 perspective-[2000px] hidden sm:block"
        style={{ transformOrigin: 'top center', marginBottom: '-10%' }}
      >
        <div className="rounded-xl border border-white/10 bg-[#1C1C1C] shadow-2xl shadow-indigo-500/20 overflow-hidden flex flex-col transform scale-[0.85] md:scale-90 lg:scale-[0.85] origin-top">
          {/* Browser Chrome */}
          <div className="h-10 border-b border-white/10 bg-[#2D2D2D] flex items-center px-4 gap-4">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-[#FF5F56]"></div>
              <div className="w-3 h-3 rounded-full bg-[#FFBD2E]"></div>
              <div className="w-3 h-3 rounded-full bg-[#27C93F]"></div>
            </div>
            <div className="flex-1 flex justify-center">
              <div className="bg-black/20 text-zinc-400 text-[11px] px-3 py-1 rounded-md flex items-center gap-2 font-mono border border-white/5">
                <Lock className="w-3 h-3" /> app.vidmetrics.io/dashboard/@MrBeast
              </div>
            </div>
            <div className="w-12"></div>
          </div>

          {/* Inside Mockup */}
          <div className="bg-zinc-50 p-6 text-zinc-900 font-sans">
            {/* Top Row - Channel Header */}
            <div className="flex items-center justify-between pb-4 border-b border-zinc-200">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-lg shadow-inner">MB</div>
                <div>
                  <div className="font-bold text-lg leading-tight text-zinc-900">MrBeast</div>
                  <div className="text-zinc-500 text-sm">@MrBeast</div>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="px-4 py-2 bg-white rounded-lg border border-zinc-200 text-sm font-bold text-zinc-900 shadow-sm"><span className="text-zinc-500 font-medium mr-1.5">Subscribers</span> 342M</div>
                <div className="px-4 py-2 bg-white rounded-lg border border-zinc-200 text-sm font-bold text-zinc-900 shadow-sm"><span className="text-zinc-500 font-medium mr-1.5">Total Views</span> 45.2B</div>
                <div className="px-4 py-2 bg-white rounded-lg border border-zinc-200 text-sm font-bold text-zinc-900 shadow-sm"><span className="text-zinc-500 font-medium mr-1.5">Videos</span> 847</div>
              </div>
            </div>

            {/* Middle Row - 3 Metric Cards */}
            <div className="grid grid-cols-3 gap-5 mt-5">
              <div className="p-5 rounded-xl border border-zinc-200 bg-white shadow-sm">
                <div className="text-sm text-zinc-500 font-medium mb-1">Top Video Views</div>
                <div className="text-4xl font-bold text-blue-600 mb-1 tracking-tight">89.2M</div>
                <div className="text-xs text-zinc-500 truncate mb-3">I Spent 7 Days Buried Alive</div>
                <div className="text-xs text-emerald-700 font-medium bg-emerald-50 inline-flex px-2 py-1 rounded-md border border-emerald-100">+12.4% this month</div>
              </div>
              <div className="p-5 rounded-xl border border-zinc-200 bg-white shadow-sm">
                <div className="text-sm text-zinc-500 font-medium mb-1">Avg Engagement Rate</div>
                <div className="text-4xl font-bold text-zinc-900 mb-1 tracking-tight">4.2%</div>
                <div className="text-xs text-zinc-500 truncate mb-3">Across top 10 videos</div>
                <div className="text-xs text-emerald-700 font-medium bg-emerald-50 inline-flex px-2 py-1 rounded-md border border-emerald-100">+0.8% vs last month</div>
              </div>
              <div className="p-5 rounded-xl border border-zinc-200 bg-white shadow-sm">
                <div className="text-sm text-zinc-500 font-medium mb-1">Trending Score</div>
                <div className="text-4xl font-bold text-amber-500 mb-1 tracking-tight">94<span className="text-lg text-zinc-400 font-normal">/100</span></div>
                <div className="text-xs text-red-600 font-medium bg-red-50 inline-flex px-2 py-1 rounded-md border border-red-100 items-center gap-1 mt-3">🔥 Viral velocity detected</div>
              </div>
            </div>

            {/* Bottom Row */}
            <div className="flex gap-5 mt-5">
              <div className="w-[60%] p-5 rounded-xl border border-zinc-200 bg-white shadow-sm flex flex-col h-[280px]">
                <div className="text-sm font-bold text-zinc-800 mb-4">Views This Month</div>
                <div className="flex-1 relative mt-2">
                  <div className="absolute left-0 top-0 bottom-6 flex flex-col justify-between text-xs text-zinc-400 font-medium">
                    <span>80M</span><span>60M</span><span>40M</span><span>20M</span>
                  </div>
                  <div className="absolute left-10 right-0 top-2 bottom-6 border-b border-zinc-100">
                    <div className="absolute inset-0 flex flex-col justify-between">
                      <div className="border-t border-zinc-100 w-full"></div>
                      <div className="border-t border-zinc-100 w-full"></div>
                      <div className="border-t border-zinc-100 w-full"></div>
                      <div className="border-t border-zinc-100 w-full"></div>
                    </div>
                    <svg className="absolute inset-0 w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 100">
                      <defs>
                        <linearGradient id="blueGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.2" />
                          <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      <path d="M0,80 L15,70 L30,75 L45,50 L60,10 L75,30 L90,20 L100,25 L100,100 L0,100 Z" fill="url(#blueGradient)" />
                      <path d="M0,80 L15,70 L30,75 L45,50 L60,10 L75,30 L90,20 L100,25" fill="none" stroke="#3b82f6" strokeWidth="2.5" vectorEffect="non-scaling-stroke" />
                      <circle cx="60" cy="10" r="4" fill="white" stroke="#3b82f6" strokeWidth="2.5" vectorEffect="non-scaling-stroke" />
                    </svg>
                    <div className="absolute left-[60%] top-[10%] -translate-x-1/2 -translate-y-[130%] bg-zinc-900 text-white text-xs font-medium px-3 py-1.5 rounded-md shadow-lg whitespace-nowrap z-10">
                      Mar 24 · 89.2M views
                      <div className="absolute bottom-[-4px] left-1/2 -translate-x-1/2 w-2 h-2 bg-zinc-900 rotate-45"></div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="w-[40%] p-5 rounded-xl border border-zinc-200 bg-white shadow-sm flex flex-col h-[280px]">
                <div className="flex justify-between items-center mb-4">
                  <div className="text-sm font-bold text-zinc-800">Top Videos</div>
                  <div className="text-xs bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full font-medium border border-blue-100">This Month</div>
                </div>
                <div className="flex flex-col gap-3 flex-1 justify-center">
                  <div className="flex items-center justify-between p-2.5 rounded-lg hover:bg-zinc-50 transition-colors border border-transparent hover:border-zinc-100">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="w-8 h-8 rounded-md bg-amber-100 text-amber-600 flex items-center justify-center text-xs font-bold shrink-0"><span className="w-2 h-2 rounded-full inline-block mr-1" style={{backgroundColor: '#10B981'}} />94</div>
                      <div className="text-sm text-zinc-800 font-medium truncate">I Spent 7 Days...</div>
                    </div>
                    <div className="text-sm text-zinc-500 font-medium shrink-0 ml-2">89.2M views</div>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-lg hover:bg-zinc-50 transition-colors border border-transparent hover:border-zinc-100">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="w-8 h-8 rounded-md bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold shrink-0"><span className="w-2 h-2 rounded-full inline-block mr-1" style={{backgroundColor: '#F59E0B'}} />87</div>
                      <div className="text-sm text-zinc-800 font-medium truncate">$1 vs $1,000,000...</div>
                    </div>
                    <div className="text-sm text-zinc-500 font-medium shrink-0 ml-2">76.4M views</div>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-lg hover:bg-zinc-50 transition-colors border border-transparent hover:border-zinc-100">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="w-8 h-8 rounded-md bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs font-bold shrink-0"><span className="w-2 h-2 rounded-full inline-block mr-1" style={{backgroundColor: '#10B981'}} />82</div>
                      <div className="text-sm text-zinc-800 font-medium truncate">Last To Leave...</div>
                    </div>
                    <div className="text-sm text-zinc-500 font-medium shrink-0 ml-2">71.2M views</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

    </section>
  );
}
