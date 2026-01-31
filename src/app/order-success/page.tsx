'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function OrderSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [orderConfirmed, setOrderConfirmed] = useState(false);

  useEffect(() => {
    if (sessionId && !orderConfirmed) {
      const confirmOrder = async () => {
        try {
          await axios.post('/api/confirm-order', { sessionId });
          setOrderConfirmed(true);
        } catch (err) {
          setError('Failed to confirm order.');
          console.error(err);
        } finally {
          setLoading(false);
        }
      };
      confirmOrder();
    } else if (!sessionId) {
      setError('No Stripe session ID found.');
      setLoading(false);
    } else if (orderConfirmed) {
      setLoading(false);
    }
  }, [sessionId, orderConfirmed]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <div className="text-center text-red-500 mt-8">{error}</div>;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2 bg-gray-100">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md text-center">
        <h1 className="text-2xl font-bold mb-4 text-green-600">Order Confirmed!</h1>
        <p className="text-gray-700 mb-6">Thank you for your purchase. Your order has been successfully placed.</p>
        <Link href="/profile">
          <button className="bg-indigo-600 text-white px-6 py-3 rounded-md text-lg font-medium hover:bg-indigo-700 transition duration-300">
            View Your Orders
          </button>
        </Link>
        <p className="mt-4 text-center text-gray-600">
          <Link href="/" className="text-blue-500 hover:underline">Continue Shopping</Link>
        </p>
      </div>
    </div>
  );
}
