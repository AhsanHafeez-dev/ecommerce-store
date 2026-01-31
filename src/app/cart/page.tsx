'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import LoadingSpinner from '@/components/LoadingSpinner';
import Image from 'next/image';
import Link from 'next/link';
import { useSession } from '@auth/nextjs';

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  images: string[];
  category: { name: string };
  categoryId: string;
  stock: number;
}

interface CartItem {
  id: string;
  productId: string;
  product: Product;
  cartId: string;
  quantity: number;
  price: number;
}

interface Cart {
  id: string;
  userId: string;
  cartItems: CartItem[];
  createdAt: string;
  updatedAt: string;
}

export default function CartPage() {
  const { data: session } = useSession();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCart = async () => {
    if (!session) {
      setLoading(false);
      return;
    }
    try {
      const response = await axios.get('/api/cart');
      setCart(response.data);
    } catch (err) {
      setError('Failed to fetch cart.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [session]);

  const handleRemoveItem = async (cartItemId: string) => {
    try {
      await axios.delete('/api/cart', {
        data: { cartItemId },
      });
      fetchCart(); // Re-fetch cart after removal
    } catch (err) {
      setError('Failed to remove item from cart.');
      console.error(err);
    }
  };

  const handleCheckout = async () => {
    if (!cart || cart.cartItems.length === 0) {
      alert('Your cart is empty.');
      return;
    }

    try {
      const response = await axios.post('/api/checkout', {
        productIds: cart.cartItems.map((item) => item.productId),
      });

      if (response.data.url) {
        window.location.href = response.data.url;
      }

    } catch (err) {
      setError('Failed to initiate checkout.');
      console.error(err);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <div className="text-center text-red-500 mt-8">{error}</div>;
  }

  if (!session) {
    return (
      <div className="text-center text-gray-500 mt-8">
        Please <Link href="/auth/signin" className="text-blue-500 hover:underline">sign in</Link> to view your cart.
      </div>
    );
  }

  if (!cart || cart.cartItems.length === 0) {
    return (
      <div className="text-center text-gray-500 mt-8">
        Your cart is empty. <Link href="/products" className="text-blue-500 hover:underline">Start shopping</Link>.
      </div>
    );
  }

  const total = cart.cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="container py-8">
      <h1 className="h1">Your Shopping Cart</h1>
      <div className="bg-white p-8 rounded-lg shadow-lg">
        {cart.cartItems.map((item) => (
          <div key={item.id} className="flex flex-col sm:flex-row items-center justify-between border-b border-gray-200 py-4 last:border-b-0">
            <div className="flex items-center gap-4 mb-4 sm:mb-0">
              <div className="relative w-24 h-24 flex-shrink-0">
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
                <h3 className="text-xl font-semibold text-gray-800">{item.product.name}</h3>
                <p className="text-gray-600">Quantity: {item.quantity}</p>
                <p className="text-gray-900 font-bold">${item.price.toFixed(2)}</p>
              </div>
            </div>
            <button
              onClick={() => handleRemoveItem(item.id)}
              className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition duration-300"
            >
              Remove
            </button>
          </div>
        ))}
        <div className="flex flex-col sm:flex-row justify-end items-center mt-8 pt-4 border-t border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800 mr-4 mb-4 sm:mb-0">Total: ${total.toFixed(2)}</h2>
          <button
            onClick={handleCheckout}
            className="btn-primary bg-green-600 hover:bg-green-700"
          >
            Checkout
          </button>
        </div>
      </div>
    </div>
  );
}
