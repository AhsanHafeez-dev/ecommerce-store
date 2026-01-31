// src/app/auth/signin/page.tsx
'use client';

import { getCsrfToken } from 'next-auth/react';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function SignInPage() {
  const [csrfToken, setCsrfToken] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCsrfToken() {
      const token = await getCsrfToken();
      setCsrfToken(token);
    }
    fetchCsrfToken();
  }, []);

  if (!csrfToken) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2 bg-gray-100">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center mb-6">Sign In</h1>
        <form method="post" action="/api/auth/signin/email">
          <input type="hidden" name="csrfToken" defaultValue={csrfToken} />
          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>
          <div className="flex items-center justify-between">
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
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
