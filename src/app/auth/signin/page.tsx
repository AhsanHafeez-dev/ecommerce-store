// src/app/auth/signin/page.tsx
'use client';

import { getCsrfToken } from 'next-auth/react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { signIn } from '@auth/nextjs';

export default function SignInPage() {
  const [csrfToken, setCsrfToken] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCsrfToken() {
      const token = await getCsrfToken();
      setCsrfToken(token);
    }
    fetchCsrfToken();
  }, []);

  const handleEmailSignIn = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const email = (event.currentTarget.elements.namedItem('email') as HTMLInputElement)?.value;
    if (email) {
      await signIn('email', { email, callbackUrl: '/' });
    }
  };

  if (!csrfToken) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2 bg-gray-50">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-lg">
        <h1 className="h1 text-2xl mb-6">Sign In</h1>
        <form onSubmit={handleEmailSignIn}>
          <input type="hidden" name="csrfToken" defaultValue={csrfToken} />
          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              className="input-field"
              required
            />
          </div>
          <div className="flex items-center justify-between">
            <button
              type="submit"
              className="btn-primary"
            >
              Sign in with Email
            </button>
          </div>
        </form>
        <p className="mt-4 text-center text-gray-600">
          <Link href="/" className="text-blue-500 hover:underline">Back to Home</Link>
        </p>
      </div>
    </div>
  );
}
