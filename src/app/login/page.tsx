'use client';

import { Suspense, useState, useRef, useSyncExternalStore } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useRouter, useSearchParams } from 'next/navigation';

const subscribe = () => () => {};
const getSnapshot = () => true;
const getServerSnapshot = () => false;

function LoginContent() {
  const mounted = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const login = useAuthStore((state) => state.login);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/';
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError('Please enter a valid email address.');
      inputRef.current?.focus();
      return;
    }
    login(trimmed);
    router.push(redirectUrl);
  };

  if (!mounted) return null;

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)] bg-[#fcfbf8] px-4 py-12">
      <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200 w-full max-w-md">
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#4a1c1c] mb-2 text-center">
          Welcome Back
        </h1>
        <p className="text-slate-500 mb-6 text-center text-sm">
          Demo login &mdash; no password required, no account is created.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <label htmlFor="login-email" className="block text-sm font-medium text-slate-700 mb-1">
              Email Address
            </label>
            <input
              ref={inputRef}
              id="login-email"
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(''); }}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#b8860b] focus:border-[#b8860b] outline-none transition-colors text-base"
              placeholder="you@example.com"
              autoComplete="email"
              autoFocus
              aria-invalid={!!error}
              aria-describedby={error ? 'login-error' : undefined}
            />
            {error && (
              <p id="login-error" role="alert" className="text-red-500 text-sm mt-1">
                {error}
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-[#4a1c1c] hover:bg-[#602323] text-white font-medium py-2.5 px-4 rounded-lg transition-colors text-base"
          >
            Sign In
          </button>
        </form>

        <p className="text-xs text-slate-400 text-center mt-4">
          Your email is stored in session storage only and is never saved to any database.
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#fcfbf8] flex items-center justify-center">Loading...</div>}>
      <LoginContent />
    </Suspense>
  );
}
