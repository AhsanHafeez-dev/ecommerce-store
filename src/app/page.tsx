'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import LoadingSpinner from '@/components/LoadingSpinner';
import Image from 'next/image';
import Link from 'next/link';

interface Category {
  id: string;
  name: string;
  slug: string;
  image: string;
}

export default function HomePage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get('/api/categories');
        setCategories(response.data);
      } catch (err) {
        setError('Failed to fetch categories.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <div className="text-center text-red-500 mt-8">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section
        className="relative bg-cover bg-center h-[500px] flex items-center justify-center text-white"
        style={{ backgroundImage: 'url(https://images.pexels.com/photos/380769/pexels-photo-380769.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2)' }}
      >
        <div className="absolute inset-0 bg-black opacity-50"></div>
        <div className="relative z-10 text-center">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-4 animate-fade-in-up">Welcome to Our General Store!</h1>
          <p className="text-xl md:text-2xl mb-8 animate-fade-in-up delay-200">Your one-stop shop for everything you need.</p>
          <Link href="/products" className="btn-primary animate-fade-in-up delay-400">
            Shop Now
          </Link>
        </div>
      </section>

      {/* Shop by Category Section */}
      <section className="container py-12">
        <h2 className="h2">Shop by Category</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {categories.map((category) => (
            <Link href={`/categories/${category.slug}`} key={category.id} className="card group">
              <div className="relative w-full h-56">
                <Image
                  src={category.image}
                  alt={category.name}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  style={{ objectFit: 'cover' }}
                  className="rounded-t-lg group-hover:opacity-75 transition-opacity duration-300"
                />
              </div>
              <div className="card-body text-center">
                <h3 className="text-xl font-semibold text-gray-800 group-hover:text-indigo-600 transition-colors duration-300">{category.name}</h3>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Call to Action: Explore All Products */}
      <section className="bg-indigo-700 text-white py-16 text-center">
        <div className="container">
          <h2 className="text-4xl font-bold mb-4">Discover Our Full Collection</h2>
          <p className="text-lg mb-8">Explore a wide variety of high-quality products curated just for you.</p>
          <Link href="/products" className="btn-secondary bg-white text-indigo-600 hover:bg-gray-100">
            View All Products
          </Link>
        </div>
      </section>

      {/* Placeholder for future sections, e.g., Featured Products */}
      <section className="container py-12">
        <h2 className="h2">Featured Products (Coming Soon!)</h2>
        <p className="text-center text-gray-600">Check back soon for our handpicked selection of top products.</p>
      </section>
    </div>
  );
}
