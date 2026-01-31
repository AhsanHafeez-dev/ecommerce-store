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
    <div className="container py-8">
      <h1 className="h1">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <Link href="/admin/categories" className="card group">
          <div className="p-6 text-center">
            <h2 className="text-2xl font-semibold text-gray-800 mb-2 group-hover:text-indigo-600 transition-colors duration-300">Manage Categories</h2>
            <p className="text-gray-600">Add, edit, or delete product categories.</p>
          </div>
        </Link>
        <Link href="/admin/products" className="card group">
          <div className="p-6 text-center">
            <h2 className="text-2xl font-semibold text-gray-800 mb-2 group-hover:text-indigo-600 transition-colors duration-300">Manage Products</h2>
            <p className="text-gray-600">Add, edit, or delete products.</p>
          </div>
        </Link>
        <Link href="/admin/orders" className="card group">
          <div className="p-6 text-center">
            <h2 className="text-2xl font-semibold text-gray-800 mb-2 group-hover:text-indigo-600 transition-colors duration-300">Monitor Sales</h2>
            <p className="text-gray-600">View and manage customer orders.</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
