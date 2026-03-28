'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AuthLayout from '@/components/AuthLayout';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('demo@vidmetrics.io');
  const [password, setPassword] = useState('VidMetrics@2026');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    router.push('/dashboard');
  };

  return (
    <AuthLayout 
      title="Welcome back" 
      subtitle="Log in to your account to continue"
    >
      <div className="mb-6 p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-lg flex items-start gap-3">
        <div className="mt-0.5">
          <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <p className="text-sm text-indigo-300 font-medium mb-1">
            Demo Mode Active
          </p>
          <p className="text-xs text-indigo-400/80 leading-relaxed">
            We&apos;ve pre-filled the credentials so you can explore the dashboard immediately. Just click <strong>Sign In</strong>.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1.5">Email</label>
          <input 
            type="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 bg-[#0A0A0A] rounded-lg border border-white/10 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-sm"
            placeholder="name@company.com"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1.5">Password</label>
          <input 
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 bg-[#0A0A0A] rounded-lg border border-white/10 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-sm"
            placeholder="••••••••"
            required
          />
        </div>
        
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" className="w-4 h-4 rounded border-white/10 bg-[#0A0A0A] text-indigo-500 focus:ring-indigo-500 focus:ring-offset-black" />
            <span className="text-sm text-zinc-400">Remember me</span>
          </label>
          <a href="#" className="text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors">Forgot password?</a>
        </div>
        
        <button 
          type="submit" 
          className="w-full py-3 px-4 bg-white text-black font-medium rounded-lg hover:bg-zinc-200 transition-colors mt-2 text-sm"
        >
          Sign In
        </button>
      </form>
      
      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/10"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-black text-zinc-500">Or continue with</span>
          </div>
        </div>
        
        <button className="mt-6 w-full py-3 px-4 bg-[#0A0A0A] border border-white/10 text-white font-medium rounded-lg hover:bg-white/5 transition-colors flex items-center justify-center gap-2 text-sm">
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Google
        </button>
      </div>
      
      <p className="mt-8 text-center text-sm text-zinc-400">
        Don&apos;t have an account? <Link href="/signup" className="font-medium text-indigo-400 hover:text-indigo-300 transition-colors">Start free trial</Link>
      </p>
    </AuthLayout>
  );
}
