// src/app/auth/verify-request/page.tsx
import Link from 'next/link';

export default function VerifyRequest() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2 bg-gray-100">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md text-center">
        <h1 className="text-2xl font-bold mb-4">Check your email</h1>
        <p className="text-gray-700">A sign-in link has been sent to your email address.</p>
        <p className="mt-4 text-center text-gray-600">
          <Link href="/" className="text-blue-500 hover:underline">Back to Home</Link>
        </p>
      </div>
    </div>
  );
}
