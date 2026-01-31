// src/app/auth/verify-request/page.tsx
import Link from 'next/link';

export default function VerifyRequest() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2 bg-gray-50">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-lg text-center">
        <h1 className="h1 text-2xl mb-4">Check your email</h1>
        <p className="text-gray-700 mb-6">A sign-in link has been sent to your email address.</p>
        <Link href="/" className="text-blue-500 hover:underline">
          <button className="btn-secondary">Back to Home</button>
        </Link>
      </div>
    </div>
  );
}
