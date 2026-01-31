'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import LoadingSpinner from '@/components/LoadingSpinner';
import Link from 'next/link';

export default function AdminDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;
    if (!session || session.user?.role !== 'ADMIN') {
      router.push('/auth/signin'); // Redirect non-admin users
    }
  }, [session, status, router]);

  if (status === 'loading' || !session || session.user?.role !== 'ADMIN') {
    return <LoadingSpinner />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-center mb-8">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link href="/admin/categories">
          <div className="bg-white rounded-lg shadow-lg p-6 text-center transform transition duration-300 hover:scale-105 cursor-pointer">
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">Manage Categories</h2>
            <p className="text-gray-600">Add, edit, or delete product categories.</p>
          </div>
        </Link>
        <Link href="/admin/products">
          <div className="bg-white rounded-lg shadow-lg p-6 text-center transform transition duration-300 hover:scale-105 cursor-pointer">
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">Manage Products</h2>
            <p className="text-gray-600">Add, edit, or delete products.</p>
          </div>
        </Link>
        <Link href="/admin/orders">
          <div className="bg-white rounded-lg shadow-lg p-6 text-center transform transition duration-300 hover:scale-105 cursor-pointer">
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">Monitor Sales</h2>
            <p className="text-gray-600">View and manage customer orders.</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
