'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import LoadingSpinner from '@/components/LoadingSpinner';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';

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

interface Category {
  id: string;
  name: string;
  slug: string;
  image: string;
  products: Product[];
}

export default function CategoryDetailPage() {
  const { slug } = useParams() as { slug: string };
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;

    const fetchCategory = async () => {
      try {
        const response = await axios.get(`/api/categories/slug/${slug}`);
        setCategory(response.data);
      } catch (err) {
        setError('Failed to fetch category.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCategory();
  }, [slug]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <div className="text-center text-red-500 mt-8">{error}</div>;
  }

  if (!category) {
    return <div className="text-center text-gray-500 mt-8">Category not found.</div>;
  }

  return (
    <div className="container py-8">
      <h1 className="h1">Category: {category.name}</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {category.products.length === 0 ? (
          <p className="col-span-full text-center text-gray-600">No products found in this category.</p>
        ) : (
          category.products.map((product) => (
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
                <p className="text-gray-900 font-bold mt-2">${product.price.toFixed(2)}</p>
                {product.stock === 0 ? (
                  <p className="text-red-500 font-semibold mt-2">Out of Stock</p>
                ) : (
                  <p className="text-green-600 font-semibold mt-2">In Stock ({product.stock})</p>
                )}
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
