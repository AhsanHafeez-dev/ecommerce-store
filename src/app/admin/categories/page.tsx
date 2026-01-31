'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface Category {
  id: string;
  name: string;
  slug: string;
  image: string;
}

export default function AdminCategoriesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryImage, setNewCategoryImage] = useState('');
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session || session.user?.role !== 'ADMIN') {
      router.push('/auth/signin');
    }
    fetchCategories();
  }, [session, status, router]);

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

  const handleAddCategory = async () => {
    if (!newCategoryName || !newCategoryImage) {
      alert('Category name and image are required.');
      return;
    }
    try {
      const uploadResponse = await axios.post('/api/upload', { image: newCategoryImage });
      const imageUrl = uploadResponse.data.url;

      await axios.post('/api/categories', {
        name: newCategoryName,
        image: imageUrl,
      });
      setNewCategoryName('');
      setNewCategoryImage('');
      fetchCategories();
    } catch (err) {
      setError('Failed to add category.');
      console.error(err);
    }
  };

  const handleEditCategory = async () => {
    if (!editingCategory || !editingCategory.name || !editingCategory.image) {
      alert('Category name and image are required.');
      return;
    }
    try {
      let imageUrl = editingCategory.image;
      if (editingCategory.image.startsWith('data:')) { // Only upload if it's a new base64 image
        const uploadResponse = await axios.post('/api/upload', { image: editingCategory.image });
        imageUrl = uploadResponse.data.url;
      }

      await axios.patch(`/api/categories/${editingCategory.id}`, {
        name: editingCategory.name,
        image: imageUrl,
      });
      setEditingCategory(null);
      fetchCategories();
    } catch (err) {
      setError('Failed to edit category.');
      console.error(err);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category? This will also delete all associated products.')) return;
    try {
      await axios.delete(`/api/categories/${id}`);
      fetchCategories();
    } catch (err) {
      setError('Failed to delete category.');
      console.error(err);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (editingCategory) {
          setEditingCategory({ ...editingCategory, image: reader.result as string });
        } else {
          setNewCategoryImage(reader.result as string);
        }
      };
      reader.readAsDataURL(file);
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
      <h1 className="text-4xl font-bold text-center mb-8">Manage Categories</h1>

      <div className="bg-white p-8 rounded-lg shadow-lg mb-8">
        <h2 className="text-2xl font-semibold mb-4">{editingCategory ? 'Edit Category' : 'Add New Category'}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label htmlFor="categoryName" className="block text-gray-700 text-sm font-bold mb-2">Category Name</label>
            <input
              type="text"
              id="categoryName"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={editingCategory ? editingCategory.name : newCategoryName}
              onChange={(e) => (editingCategory ? setEditingCategory({ ...editingCategory, name: e.target.value }) : setNewCategoryName(e.target.value))}
            />
          </div>
          <div>
            <label htmlFor="categoryImage" className="block text-gray-700 text-sm font-bold mb-2">Category Image</label>
            <input
              type="file"
              id="categoryImage"
              accept="image/*"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              onChange={handleImageChange}
            />
            {(newCategoryImage || (editingCategory && editingCategory.image)) && (
              <div className="relative w-32 h-32 mt-4">
                <Image
                  src={editingCategory ? editingCategory.image : newCategoryImage}
                  alt="Category Image"
                  layout="fill"
                  objectFit="cover"
                  className="rounded-md"
                />
              </div>
            )}
          </div>
        </div>
        <button
          onClick={editingCategory ? handleEditCategory : handleAddCategory}
          className={`bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition duration-300`}
        >
          {editingCategory ? 'Update Category' : 'Add Category'}
        </button>
        {editingCategory && (
          <button
            onClick={() => setEditingCategory(null)}
            className="ml-4 bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition duration-300"
          >
            Cancel Edit
          </button>
        )}
      </div>

      <div className="bg-white p-8 rounded-lg shadow-lg">
        <h2 className="text-2xl font-semibold mb-4">Existing Categories</h2>
        {categories.length === 0 ? (
          <p className="text-center text-gray-600">No categories created yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => (
              <div key={category.id} className="border border-gray-200 rounded-lg p-4">
                <div className="relative w-full h-48 mb-4">
                  <Image
                    src={category.image}
                    alt={category.name}
                    layout="fill"
                    objectFit="cover"
                    className="rounded-md"
                  />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">{category.name}</h3>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setEditingCategory(category)}
                    className="bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600 transition duration-300"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteCategory(category.id)}
                    className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600 transition duration-300"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
