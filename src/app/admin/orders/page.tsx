'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

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
  user: { name: string; email: string };
  orderItems: OrderItem[];
  total: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export default function AdminOrdersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session || session.user?.role !== 'ADMIN') {
      router.push('/auth/signin');
    }
    fetchOrders();
  }, [session, status, router]);

  const fetchOrders = async () => {
    try {
      const response = await axios.get('/api/orders'); // Assuming admin can fetch all orders
      setOrders(response.data);
    } catch (err) {
      setError('Failed to fetch orders.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      await axios.patch(`/api/orders/${orderId}`, { status: newStatus });
      fetchOrders();
    } catch (err) {
      setError('Failed to update order status.');
      console.error(err);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <div className="text-center text-red-500 mt-8">{error}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-center mb-8">Manage Orders</h1>

      <div className="bg-white p-8 rounded-lg shadow-lg">
        <h2 className="text-2xl font-semibold mb-4">All Orders</h2>
        {orders.length === 0 ? (
          <p className="text-center text-gray-600">No orders found.</p>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-xl font-semibold">Order ID: {order.id}</h3>
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">{order.status}</span>
                </div>
                <p className="text-gray-600 mb-2">User: {order.user.name} ({order.user.email})</p>
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
                <div className="mt-4">
                  <label htmlFor={`status-${order.id}`} className="block text-gray-700 text-sm font-bold mb-2">Update Status</label>
                  <select
                    id={`status-${order.id}`}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    value={order.status}
                    onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                  >
                    <option value="PENDING">Pending</option>
                    <option value="PROCESSING">Processing</option>
                    <option value="SHIPPED">Shipped</option>
                    <option value="DELIVERED">Delivered</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
