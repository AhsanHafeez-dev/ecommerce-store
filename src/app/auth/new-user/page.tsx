// src/app/auth/new-user/page.tsx
import Link from 'next/link';

export default function NewUser() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2 bg-gray-50">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-lg text-center">
        <h1 className="h1 text-2xl mb-4">Welcome!</h1>
        <p className="text-gray-700 mb-6">Your account has been created successfully.</p>
        <Link href="/" className="text-blue-500 hover:underline">
          <button className="btn-primary">Go to Home</button>
        </Link>
      </div>
    </div>
  );
}
