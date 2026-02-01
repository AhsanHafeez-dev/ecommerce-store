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
}

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  images: string[];
  categoryId: string;
  stock: number;
  category: Category;
}

export default function AdminProductsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [newProductName, setNewProductName] = useState('');
  const [newProductDescription, setNewProductDescription] = useState('');
  const [newProductPrice, setNewProductPrice] = useState<number>(0);
  const [newProductCategory, setNewProductCategory] = useState('');
  const [newProductImages, setNewProductImages] = useState<string[]>([]);
  const [newProductStock, setNewProductStock] = useState<number>(0);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session || session.user?.role !== 'ADMIN') {
      router.push('/auth/signin');
    }
    fetchData();
  }, [session, status, router]);

  const fetchData = async () => {
    try {
      const [productsResponse, categoriesResponse] = await Promise.all([
        axios.get('/api/products'),
        axios.get('/api/categories'),
      ]);
      setProducts(productsResponse.data);
      setCategories(categoriesResponse.data);
    } catch (err) {
      setError('Failed to fetch data.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = async () => {
    if (!newProductName || !newProductPrice || !newProductCategory || newProductImages.length === 0 || newProductStock === 0) {
      alert('All fields are required.');
      return;
    }
    try {
      const uploadedImageUrls = await Promise.all(
        newProductImages.map(async (image) => {
          if (image.startsWith('data:')) {
            const uploadResponse = await axios.post('/api/upload', { image });
            return uploadResponse.data.url;
          }
          return image;
        })
      );

      await axios.post('/api/products', {
        name: newProductName,
        description: newProductDescription,
        price: newProductPrice,
        categoryId: newProductCategory,
        images: uploadedImageUrls,
        stock: newProductStock,
      });
      resetForm();
      fetchData();
    } catch (err) {
      setError('Failed to add product.');
      console.error(err);
    }
  };

  const handleEditProduct = async () => {
    if (!editingProduct || !editingProduct.name || !editingProduct.price || !editingProduct.categoryId || editingProduct.images.length === 0 || editingProduct.stock === 0) {
      alert('All fields are required.');
      return;
    }
    try {
      const uploadedImageUrls = await Promise.all(
        editingProduct.images.map(async (image) => {
          if (image.startsWith('data:')) {
            const uploadResponse = await axios.post('/api/upload', { image });
            return uploadResponse.data.url;
          }
          return image;
        })
      );

      await axios.patch(`/api/products/${editingProduct.id}`, {
        name: editingProduct.name,
        description: editingProduct.description,
        price: editingProduct.price,
        categoryId: editingProduct.categoryId,
        images: uploadedImageUrls,
        stock: editingProduct.stock,
      });
      setEditingProduct(null);
      fetchData();
    } catch (err) {
      setError('Failed to edit product.');
      console.error(err);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      await axios.delete(`/api/products/${id}`);
      fetchData();
    } catch (err) {
      setError('Failed to delete product.');
      console.error(err);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (editingProduct) {
            setEditingProduct((prev) => ({
              ...prev!,
              images: [...prev!.images, reader.result as string],
            }));
          } else {
            setNewProductImages((prev) => [...prev, reader.result as string]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index: number, isEditing: boolean) => {
    if (isEditing) {
      setEditingProduct((prev) => ({
        ...prev!,
        images: prev!.images.filter((_, i) => i !== index),
      }));
    } else {
      setNewProductImages((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const resetForm = () => {
    setNewProductName('');
    setNewProductDescription('');
    setNewProductPrice(0);
    setNewProductCategory('');
    setNewProductImages([]);
    setNewProductStock(0);
    setEditingProduct(null);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <div className="text-center text-red-500 mt-8">{error}</div>;
  }

  return (
    <div className="container py-8">
      <h1 className="h1">Manage Products</h1>

      <div className="bg-white p-8 rounded-lg shadow-lg mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label htmlFor="productName" className="block text-gray-700 text-sm font-bold mb-2">Product Name</label>
            <input
              type="text"
              id="productName"
              className="input-field"
              value={editingProduct ? editingProduct.name : newProductName}
              onChange={(e) => (editingProduct ? setEditingProduct({ ...editingProduct, name: e.target.value }) : setNewProductName(e.target.value))}
            />
          </div>
          <div>
            <label htmlFor="productDescription" className="block text-gray-700 text-sm font-bold mb-2">Description</label>
            <textarea
              id="productDescription"
              rows={3}
              className="textarea-field"
              value={editingProduct ? editingProduct.description : newProductDescription}
              onChange={(e) => (editingProduct ? setEditingProduct({ ...editingProduct, description: e.target.value }) : setNewProductDescription(e.target.value))}
            ></textarea>
          </div>
          <div>
            <label htmlFor="productPrice" className="block text-gray-700 text-sm font-bold mb-2">Price</label>
            <input
              type="number"
              id="productPrice"
              step="0.01"
              className="input-field"
              value={editingProduct ? editingProduct.price : newProductPrice}
              onChange={(e) => (editingProduct ? setEditingProduct({ ...editingProduct, price: parseFloat(e.target.value) }) : setNewProductPrice(parseFloat(e.target.value)))}
            />
          </div>
          <div>
            <label htmlFor="productCategory" className="block text-gray-700 text-sm font-bold mb-2">Category</label>
            <select
              id="productCategory"
              className="select-field"
              value={editingProduct ? editingProduct.categoryId : newProductCategory}
              onChange={(e) => (editingProduct ? setEditingProduct({ ...editingProduct, categoryId: e.target.value }) : setNewProductCategory(e.target.value))}
            >
              <option value="">Select a category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="productStock" className="block text-gray-700 text-sm font-bold mb-2">Stock</label>
            <input
              type="number"
              id="productStock"
              className="input-field"
              value={editingProduct ? editingProduct.stock : newProductStock}
              onChange={(e) => (editingProduct ? setEditingProduct({ ...editingProduct, stock: parseInt(e.target.value) }) : setNewProductStock(parseInt(e.target.value)))}
            />
          </div>
          <div>
            <label htmlFor="productImages" className="block text-gray-700 text-sm font-bold mb-2">Product Images</label>
            <input
              type="file"
              id="productImages"
              accept="image/*"
              multiple
              className="input-field file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
              onChange={handleImageChange}
            />
            <div className="flex flex-wrap gap-2 mt-4">
              {(editingProduct ? editingProduct.images : newProductImages).map((image, index) => (
                <div key={index} className="relative w-24 h-24 border border-gray-200 rounded-md overflow-hidden">
                  <Image
                    src={image}
                    alt="Product Image"
                    fill
                    sizes="96px"
                    style={{ objectFit: 'cover' }}
                    className="rounded-md"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index, !!editingProduct)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 text-xs"
                  >
                    X
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
        <button
          onClick={editingProduct ? handleEditProduct : handleAddProduct}
          className="btn-primary"
        >
          {editingProduct ? 'Update Product' : 'Add Product'}
        </button>
        {editingProduct && (
          <button
            onClick={resetForm}
            className="ml-4 btn-secondary"
          >
            Cancel Edit
          </button>
        )}
      </div>

      <div className="bg-white p-8 rounded-lg shadow-lg">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">Existing Products</h2>
        {products.length === 0 ? (
          <p className="text-center text-gray-600">No products created yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <div key={product.id} className="card group">
                <div className="relative w-full h-48 mb-4">
                  <Image
                    src={product.images[0]}
                    alt={product.name}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    style={{ objectFit: 'cover' }}
                    className="rounded-t-lg group-hover:opacity-75 transition-opacity duration-300"
                  />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2 group-hover:text-indigo-600 transition-colors duration-300 text-center">{product.name}</h3>
                <p className="text-gray-600 text-sm text-center">Category: {product.category.name}</p>
                <p className="text-gray-900 font-bold mt-2 text-center">${product.price.toFixed(2)}</p>
                <p className="text-gray-600 text-center">Stock: {product.stock}</p>
                <div className="flex justify-center gap-2 mt-4">
                  <button
                    onClick={() => setEditingProduct(product)}
                    className="bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600 transition duration-300"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteProduct(product.id)}
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
