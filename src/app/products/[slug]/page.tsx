'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import LoadingSpinner from '@/components/LoadingSpinner';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';

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

export default function ProductDetailPage() {
  const { slug } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { data: session } = useSession();

  useEffect(() => {
    if (!slug) return;

    const fetchProduct = async () => {
      try {
        const response = await axios.get(`/api/products/slug/${slug}`);
        setProduct(response.data);
      } catch (err) {
        setError('Failed to fetch product.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [slug]);

  const handleAddToCart = async () => {
    if (!product) return;
    if (!session) {
      setError('You need to be logged in to add to cart.');
      return;
    }
    try {
      await axios.post('/api/cart', {
        productId: product.id,
        quantity: 1,
      });
      alert('Product added to cart!');
    } catch (err) {
      setError('Failed to add product to cart.');
      console.error(err);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <div className="text-center text-red-500 mt-8">{error}</div>;
  }

  if (!product) {
    return <div className="text-center text-gray-500 mt-8">Product not found.</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8 bg-white p-8 rounded-lg shadow-lg">
        <div className="md:w-1/2 relative h-96">
          <Image
            src={product.images[0]}
            alt={product.name}
            layout="fill"
            objectFit="contain"
            className="rounded-lg"
          />
        </div>
        <div className="md:w-1/2">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">{product.name}</h1>
          <p className="text-gray-600 text-lg mb-2">Category: {product.category.name}</p>
          <p className="text-gray-700 mb-4">{product.description}</p>
          <p className="text-5xl font-extrabold text-indigo-600 mb-6">${product.price.toFixed(2)}</p>
          {product.stock === 0 ? (
            <p className="text-red-500 font-semibold text-xl mb-6">Out of Stock</p>
          ) : (
            <p className="text-green-600 font-semibold text-xl mb-6">In Stock ({product.stock})</p>
          )}
          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0 || !session}
            className={`w-full py-3 rounded-md text-lg font-medium transition duration-300 ${product.stock === 0 || !session
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-indigo-600 text-white hover:bg-indigo-700'
              }`}
          >
            {product.stock === 0 ? 'Out of Stock' : session ? 'Add to Cart' : 'Sign in to Add to Cart'}
          </button>
        </div>
      </div>
    </div>
  );
}
