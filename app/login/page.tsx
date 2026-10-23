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
    <AuthLayout title="Welcome back" subtitle="Log in to your workspace.">
      <p className="auth__notice">This is a demo: the details are filled in, so just log in.</p>

      <form onSubmit={handleSubmit} className="auth__fields">
        <div>
          <label htmlFor="login-email">Email</label>
          <input
            id="login-email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="name@company.com"
            autoComplete="email"
            required
          />
        </div>
        <div>
          <label htmlFor="login-password">Password</label>
          <input
            id="login-password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
        </div>
        <label className="auth__check">
          <input type="checkbox" />
          <span>Keep me logged in</span>
        </label>
        <button type="submit" className="auth__submit">
          Log in
        </button>
      </form>

      <p className="auth__switch">
        New to VidMetrics? <Link href="/signup" className="app-link">Start a free trial</Link>
      </p>
    </AuthLayout>
  );
}
