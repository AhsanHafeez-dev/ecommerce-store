'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';

interface OrderItem {
  id: string;
  productId: string;
  product: { name: string; images: string[] };
  orderId: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  userId: string;
  orderItems: OrderItem[];
  total: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      setLoading(false);
      return;
    }

    const fetchOrders = async () => {
      try {
        const response = await axios.get('/api/orders');
        setOrders(response.data);
      } catch (err) {
        setError('Failed to fetch orders.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [session, status]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <div className="text-center text-red-500 mt-8">{error}</div>;
  }

  if (!session) {
    return (
      <div className="text-center text-gray-500 mt-8">
        Please <Link href="/auth/signin" className="text-blue-500 hover:underline">sign in</Link> to view your profile.
      </div>
    );
  }

  return (
    <div className="container py-8">
      <h1 className="h1">Your Profile</h1>

      <div className="bg-white p-8 rounded-lg shadow-lg mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">User Information</h2>
        <div className="flex items-center mb-4">
          <div className="relative w-24 h-24 rounded-full overflow-hidden mr-4 border-2 border-indigo-500">
            <Image
              src={session.user?.image || 'https://images.pexels.com/photos/209841/pexels-photo-209841.jpeg'}
              alt={session.user?.name || 'User Avatar'}
              fill
              sizes="100px"
              style={{ objectFit: 'cover' }}
            />
          </div>
          <div>
            <p className="text-xl font-semibold text-gray-800">Name: <span className="font-normal">{session.user?.name}</span></p>
            <p className="text-gray-600">Email: <span className="font-normal">{session.user?.email}</span></p>
            <p className="text-gray-600">Role: <span className="font-normal">{session.user?.role}</span></p>
          </div>
        </div>
      </div>

      <div className="bg-white p-8 rounded-lg shadow-lg">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">Your Orders</h2>
        {orders.length === 0 ? (
          <p className="text-center text-gray-600">No orders found.</p>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.id} className="border border-gray-200 rounded-lg p-4 shadow-sm">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2">
                  <h3 className="text-xl font-semibold text-gray-800">Order ID: <span className="font-normal text-indigo-600">{order.id}</span></h3>
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 mt-2 sm:mt-0">{order.status}</span>
                </div>
                <p className="text-gray-600 mb-2">Total: <span className="font-medium">${order.total.toFixed(2)}</span></p>
                <p className="text-gray-600 mb-4">Order Date: <span className="font-medium">{new Date(order.createdAt).toLocaleDateString()}</span></p>
                <div className="border-t border-gray-100 pt-4">
                  <h4 className="text-lg font-semibold mb-3 text-gray-700">Items:</h4>
                  <div className="space-y-3">
                    {order.orderItems.map((item) => (
                      <div key={item.id} className="flex items-center gap-4 bg-gray-50 p-3 rounded-md">
                        <div className="relative w-16 h-16 flex-shrink-0">
                          <Image
                            src={item.product.images[0]}
                            alt={item.product.name}
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            style={{ objectFit: 'cover' }}
                            className="rounded-md"
                          />
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">{item.product.name}</p>
                          <p className="text-sm text-gray-600">Quantity: {item.quantity} x ${item.price.toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
