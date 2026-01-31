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
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-center mb-8">Your Profile</h1>

      <div className="bg-white p-8 rounded-lg shadow-lg mb-8">
        <h2 className="text-2xl font-semibold mb-4">User Information</h2>
        <div className="flex items-center mb-4">
          <div className="relative w-24 h-24 rounded-full overflow-hidden mr-4">
            <Image
              src={session.user?.image || 'https://via.placeholder.com/150'}
              alt={session.user?.name || 'User Avatar'}
              layout="fill"
              objectFit="cover"
            />
          </div>
          <div>
            <p className="text-xl font-semibold text-gray-800">Name: {session.user?.name}</p>
            <p className="text-gray-600">Email: {session.user?.email}</p>
            <p className="text-gray-600">Role: {session.user?.role}</p>
          </div>
        </div>
      </div>

      <div className="bg-white p-8 rounded-lg shadow-lg">
        <h2 className="text-2xl font-semibold mb-4">Your Orders</h2>
        {orders.length === 0 ? (
          <p className="text-center text-gray-600">No orders found.</p>
        ) : (
          orders.map((order) => (
            <div key={order.id} className="border border-gray-200 rounded-lg p-4 mb-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-xl font-semibold">Order ID: {order.id}</h3>
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">{order.status}</span>
              </div>
              <p className="text-gray-600 mb-2">Total: ${order.total.toFixed(2)}</p>
              <p className="text-gray-600 mb-4">Order Date: {new Date(order.createdAt).toLocaleDateString()}</p>
              <div className="border-t border-gray-200 pt-4">
                <h4 className="text-lg font-semibold mb-2">Items:</h4>
                {order.orderItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 mb-2">
                    <div className="relative w-16 h-16">
                      <Image
                        src={item.product.images[0]}
                        alt={item.product.name}
                        layout="fill"
                        objectFit="cover"
                        className="rounded-md"
                      />
                    </div>
                    <div>
                      <p className="font-medium">{item.product.name}</p>
                      <p className="text-sm text-gray-600">Quantity: {item.quantity} x ${item.price.toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
