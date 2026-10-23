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
    <AuthLayout title="Create your account" subtitle="Start your 14-day free trial. No credit card required.">
      <p className="auth__notice">This is a demo: the fields are filled in, so just create the account.</p>

      <form onSubmit={handleSubmit} className="auth__fields">
        <div>
          <label htmlFor="signup-name">Full name</label>
          <input id="signup-name" type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Your name" autoComplete="name" />
        </div>
        <div>
          <label htmlFor="signup-email">Work email</label>
          <input id="signup-email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@company.com" autoComplete="email" />
        </div>
        <div>
          <label htmlFor="signup-company">Company</label>
          <input id="signup-company" type="text" value={company} onChange={e => setCompany(e.target.value)} placeholder="Your company" autoComplete="organization" />
        </div>
        <div>
          <label htmlFor="signup-password">Password</label>
          <input id="signup-password" type="password" value={password} onChange={e => setPassword(e.target.value)} autoComplete="new-password" />
        </div>
        <button type="submit" className="auth__submit">
          Create account
        </button>
      </form>

      <p className="auth__switch">
        Already have an account? <Link href="/login" className="app-link">Log in</Link>
      </p>
    </AuthLayout>
  );
}
