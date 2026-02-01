// src/app/auth/signin/page.tsx
'use client';

import { getCsrfToken } from 'next-auth/react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { checkUserStatus, getUserRole } from '../actions';
import { useRouter } from 'next/navigation';

export default function SignInPage() {
  const [csrfToken, setCsrfToken] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    async function fetchCsrfToken() {
      const token = await getCsrfToken();
      setCsrfToken(token);
    }
    fetchCsrfToken();
  }, []);

  const handleRedirect = async () => {
    try {
      const role = await getUserRole();
      if (role === 'ADMIN') {
        router.push('/admin/dashboard');
      } else {
        router.push('/');
      }
    } catch (error) {
      console.error("Failed to get user role", error);
      router.push('/');
    }
  }

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const status = await checkUserStatus(email);

      if (status.error) {
        setError(status.error);
        setIsLoading(false);
        return;
      }

      if (status.exists && status.hasPassword) {
        setShowPassword(true);
        setIsLoading(false);
      } else {
        const result = await signIn('email', { email, redirect: false });
        if (result?.error) {
          console.log(result.error);
          setError('Failed to send magic link. Please try again.');
        } else {
          // For magic link we can't easily check role on client immediately without polling or page load
          // Default behavior or custom page is needed.
          // However, if we assume magic link works, next-auth handles the link click.
          // The redirection happens after clicking the link in email.
          alert('Check your email for the magic link!');
        }
        setIsLoading(false);
      }
    } catch (err) {
      console.error(err);
      setError('An unexpected error occurred.');
      setIsLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError('Invalid email or password');
      setIsLoading(false);
    } else {
      await handleRedirect();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2 bg-gray-50">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-lg">
        <h1 className="h1 text-2xl mb-6">Sign In</h1>
        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

        {!showPassword ? (
          <form onSubmit={handleEmailSubmit}>
            <input type="hidden" name="csrfToken" defaultValue={csrfToken || ""} />
            <div className="mb-4">
              <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                className="input-field w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="flex items-center justify-between">
              <button
                type="submit"
                className="btn-primary w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition duration-200"
                disabled={isLoading}
              >
                {isLoading ? 'Checking...' : 'Continue with Email'}
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handlePasswordSubmit}>
            <div className="mb-4">
              <p className="text-gray-600 mb-2">Signing in as {email}</p>
              <label htmlFor="password" className="block text-gray-700 text-sm font-bold mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                className="input-field w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => setShowPassword(false)}
                className="btn-secondary w-full bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition duration-200"
                disabled={isLoading}
              >
                Back
              </button>
              <button
                type="submit"
                className="btn-primary w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition duration-200"
                disabled={isLoading}
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </button>
            </div>
          </form>
        )}

        <p className="mt-4 text-center text-gray-600">
          <Link href="/" className="text-blue-500 hover:underline">Back to Home</Link>
        </p>
      </div>
    </div>
  );
}
