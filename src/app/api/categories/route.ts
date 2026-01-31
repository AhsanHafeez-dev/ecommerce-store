import { NextResponse } from 'next/server';
import prismadb from '@/lib/prismadb';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';

export async function GET(request: Request) {
  try {
    const categories = await prismadb.category.findMany({
      include: {
        products: true,
      },
    });
    return NextResponse.json(categories);
  } catch (error) {
    console.error('[CATEGORIES_GET]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== 'ADMIN') {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await request.json();
    const { name, image } = body;

    if (!name) {
      return new NextResponse('Name is required', { status: 400 });
    }
    if (!image) {
      return new NextResponse('Image is required', { status: 400 });
    }

    const category = await prismadb.category.create({
      data: {
        name,
        image,
        slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-*|-*$/g, ''),
      },
    });

    return NextResponse.json(category);
  } catch (error) {
    console.error('[CATEGORIES_POST]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
}
