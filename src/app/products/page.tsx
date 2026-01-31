'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import LoadingSpinner from '@/components/LoadingSpinner';
import Image from 'next/image';
import Link from 'next/link';

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

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get('/api/products');
        setProducts(response.data);
      } catch (err) {
        setError('Failed to fetch products.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <div className="text-center text-red-500 mt-8">{error}</div>;
  }

  return (
    <div className="container py-8">
      <h1 className="h1">Our Products</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {products.map((product) => (
          <Link href={`/products/${product.slug}`} key={product.id} className="card group">
            <div className="relative w-full h-56">
              <Image
                src={product.images[0]}
                alt={product.name}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                style={{ objectFit: 'cover' }}
                className="rounded-t-lg group-hover:opacity-75 transition-opacity duration-300"
              />
            </div>
            <div className="card-body">
              <h3 className="text-xl font-semibold text-gray-800 group-hover:text-indigo-600 transition-colors duration-300">{product.name}</h3>
              <p className="text-gray-600 text-sm">{product.category.name}</p>
              <p className="text-gray-900 font-bold mt-2">${product.price.toFixed(2)}</p>
              {product.stock === 0 ? (
                <p className="text-red-500 font-semibold mt-2">Out of Stock</p>
              ) : (
                <p className="text-green-600 font-semibold mt-2">In Stock ({product.stock})</p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
