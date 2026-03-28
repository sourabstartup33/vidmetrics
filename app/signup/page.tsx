'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AuthLayout from '@/components/AuthLayout';

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState('Jordan');
  const [email, setEmail] = useState('jordan@vidmetrics.io');
  const [company, setCompany] = useState('VidMetrics');
  const [password, setPassword] = useState('VidMetrics@2026');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    router.push('/dashboard');
  };

  return (
    <AuthLayout 
      title="Create your account" 
      subtitle="Start your 14-day free trial. No credit card required."
    >
      <div className="mb-6 p-3 bg-[#EFF6FF] border border-[#BFDBFE] rounded-lg text-sm text-blue-800 font-medium">
        👋 Demo mode — fields are pre-filled. Just hit Create Account.
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1.5">Full Name</label>
          <input 
            type="text" 
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3 bg-[#0A0A0A] rounded-lg border border-white/10 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-sm"
            placeholder="Jane Doe"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1.5">Work Email</label>
          <input 
            type="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 bg-[#0A0A0A] rounded-lg border border-white/10 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-sm"
            placeholder="jane@company.com"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1.5">Company Name</label>
          <input 
            type="text" 
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            className="w-full px-4 py-3 bg-[#0A0A0A] rounded-lg border border-white/10 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-sm"
            placeholder="Acme Corp"
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
          />
        </div>
        
        <button 
          type="submit" 
          className="w-full py-3 px-4 bg-white text-black font-medium rounded-lg hover:bg-zinc-200 transition-colors mt-4 text-sm"
        >
          Create Free Account
        </button>
      </form>
      
      <p className="mt-6 text-center text-sm text-zinc-400">
        Already have an account? <Link href="/login" className="font-medium text-indigo-400 hover:text-indigo-300 transition-colors">Sign in</Link>
      </p>
      
      <p className="mt-8 text-center text-xs text-zinc-500">
        By creating an account, you agree to our <a href="#" className="underline hover:text-zinc-300 transition-colors">Terms of Service</a> and <a href="#" className="underline hover:text-zinc-300 transition-colors">Privacy Policy</a>.
      </p>
    </AuthLayout>
  );
}
