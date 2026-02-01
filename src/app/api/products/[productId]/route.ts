import { NextResponse } from 'next/server';
import prismadb from '@/lib/prismadb';
import { auth } from '@/lib/auth';

export async function GET(request: Request, { params }: { params: Promise<{ productId: string }> }) {
  try {
    const { productId } = await params;
    if (!productId) {
      return new NextResponse('Product ID is required', { status: 400 });
    }

    const product = await prismadb.product.findUnique({
      where: {
        id: productId,
      },
      include: {
        category: true,
      },
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error('[PRODUCT_GET]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ productId: string }> }) {
  try {
    const session = await auth();
    const { productId } = await params;

    if (!session || session.user?.role !== 'ADMIN') {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    if (!productId) {
      return new NextResponse('Product ID is required', { status: 400 });
    }

    const body = await request.json();
    const { name, description, price, categoryId, images, stock } = body;

    if (!name) {
      return new NextResponse('Name is required', { status: 400 });
    }
    if (!price) {
      return new NextResponse('Price is required', { status: 400 });
    }
    if (!categoryId) {
      return new NextResponse('Category ID is required', { status: 400 });
    }
    if (!images || images.length === 0) {
      return new NextResponse('Images are required', { status: 400 });
    }
    if (!stock) {
      return new NextResponse('Stock is required', { status: 400 });
    }

    const product = await prismadb.product.update({
      where: {
        id: productId,
      },
      data: {
        name,
        description,
        price,
        categoryId,
        images,
        stock,
        slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-*|-*$/g, ''),
      },
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error('[PRODUCT_PATCH]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ productId: string }> }) {
  try {
    const session = await auth();
    const { productId } = await params;

    if (!session || session.user?.role !== 'ADMIN') {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    if (!productId) {
      return new NextResponse('Product ID is required', { status: 400 });
    }

    const product = await prismadb.product.delete({
      where: {
        id: productId,
      },
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error('[PRODUCT_DELETE]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
}
