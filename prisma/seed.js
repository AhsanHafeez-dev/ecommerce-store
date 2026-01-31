import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Create admin user
  const hashedPassword = await bcrypt.hash('123456', 10);
  const adminUser = await prisma.user.upsert({
    where: { email: 'ahsan@example.com' },
    update: {},
    create: {
      name: 'Ahsan',
      email: 'ahsan@example.com',
      hashedPassword,
      role: 'ADMIN',
    },
  });

  console.log({ adminUser });

  // Create categories
  const categories = [
    { name: 'Electronics', slug: 'electronics', image: 'https://images.pexels.com/photos/4218823/pexels-photo-4218823.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2' },
    { name: 'Books', slug: 'books', image: 'https://images.pexels.com/photos/159711/books-bookstore-book-reading-159711.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2' },
    { name: 'Home & Kitchen', slug: 'home-kitchen', image: 'https://images.pexels.com/photos/2088167/pexels-photo-2088167.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2' },
    { name: 'Sports', slug: 'sports', image: 'https://images.pexels.com/photos/4761794/pexels-photo-4761794.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2' },
    { name: 'Fashion', slug: 'fashion', image: 'https://images.pexels.com/photos/1036623/pexels-photo-1036623.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2' },
  ];

  for (const categoryData of categories) {
    await prisma.category.upsert({
      where: { slug: categoryData.slug },
      update: {},
      create: categoryData,
    });
  }

  const createdCategories = await prisma.category.findMany();
  console.log({ createdCategories });

  // Create products
  const products = [
    {
      name: 'Wireless Mouse',
      slug: 'wireless-mouse',
      description: 'Ergonomic wireless mouse with long battery life.',
      price: 25.99,
      images: ['https://images.pexels.com/photos/706509/pexels-photo-706509.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', 'https://images.pexels.com/photos/205926/pexels-photo-205926.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'],
      categoryId: createdCategories.find(cat => cat.slug === 'electronics')?.id || '',
      stock: 100,
    },
    {
      name: 'Mechanical Keyboard',
      slug: 'mechanical-keyboard',
      description: 'RGB mechanical keyboard with blue switches.',
      price: 79.99,
      images: ['https://images.pexels.com/photos/5926392/pexels-photo-5926392.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', 'https://images.pexels.com/photos/5926388/pexels-photo-5926388.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'],
      categoryId: createdCategories.find(cat => cat.slug === 'electronics')?.id || '',
      stock: 50,
    },
    {
      name: 'Laptop Stand',
      slug: 'laptop-stand',
      description: 'Adjustable aluminum laptop stand.',
      price: 35.00,
      images: ['https://images.pexels.com/photos/3408354/pexels-photo-3408354.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'],
      categoryId: createdCategories.find(cat => cat.slug === 'electronics')?.id || '',
      stock: 120,
    },
    {
      name: 'The Great Gatsby',
      slug: 'the-great-gatsby',
      description: 'Classic novel by F. Scott Fitzgerald.',
      price: 12.50,
      images: ['https://images.pexels.com/photos/1112048/pexels-photo-1112048.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'],
      categoryId: createdCategories.find(cat => cat.slug === 'books')?.id || '',
      stock: 200,
    },
    {
      name: 'Sapiens: A Brief History of Humankind',
      slug: 'sapiens',
      description: 'A book by Yuval Noah Harari.',
      price: 18.00,
      images: ['https://images.pexels.com/photos/220301/pexels-photo-220301.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'],
      categoryId: createdCategories.find(cat => cat.slug === 'books')?.id || '',
      stock: 150,
    },
    {
      name: 'Cookbook: Italian Cuisine',
      slug: 'italian-cookbook',
      description: 'Delicious Italian recipes for every occasion.',
      price: 29.99,
      images: ['https://images.pexels.com/photos/4053896/pexels-photo-4053896.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'],
      categoryId: createdCategories.find(cat => cat.slug === 'home-kitchen')?.id || '',
      stock: 80,
    },
    {
      name: 'Coffee Maker',
      slug: 'coffee-maker',
      description: 'Automatic drip coffee maker with a 12-cup capacity.',
      price: 49.99,
      images: ['https://images.pexels.com/photos/1487232/pexels-photo-1487232.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'],
      categoryId: createdCategories.find(cat => cat.slug === 'home-kitchen')?.id || '',
      stock: 60,
    },
    {
      name: 'Yoga Mat',
      slug: 'yoga-mat',
      description: 'Non-slip yoga mat for all types of yoga and fitness.',
      price: 20.00,
      images: ['https://images.pexels.com/photos/4034262/pexels-photo-4034262.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'],
      categoryId: createdCategories.find(cat => cat.slug === 'sports')?.id || '',
      stock: 90,
    },
    {
      name: 'Running Shoes',
      slug: 'running-shoes',
      description: 'Lightweight and comfortable running shoes.',
      price: 89.99,
      images: ['https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'],
      categoryId: createdCategories.find(cat => cat.slug === 'sports')?.id || '',
      stock: 75,
    },
    {
      name: "Men's T-Shirt",
      slug: "mens-t-shirt",
      description: "Comfortable cotton t-shirt for men.",
      price: 15.00,
      images: ['https://images.pexels.com/photos/991509/pexels-photo-991509.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'],
      categoryId: createdCategories.find(cat => cat.slug === 'fashion')?.id || '',
      stock: 150,
    },
    {
      name: "Women's Jeans",
      slug: "womens-jeans",
      description: "Stylish skinny jeans for women.",
      price: 45.00,
      images: ['https://images.pexels.com/photos/1036623/pexels-photo-1036623.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'],
      categoryId: createdCategories.find(cat => cat.slug === 'fashion')?.id || '',
      stock: 100,
    },
  ];

  for (const productData of products) {
    await prisma.product.upsert({
      where: { slug: productData.slug },
      update: {},
      create: productData,
    });
  }

  const createdProducts = await prisma.product.findMany();
  console.log({ createdProducts });
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
