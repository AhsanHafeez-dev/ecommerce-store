import { NextResponse } from 'next/server';
import prismadb from '@/lib/prismadb';

export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    if (!slug) {
      return new NextResponse('Product slug is required', { status: 400 });
    }

    const product = await prismadb.product.findUnique({
      where: {
        slug: slug,
      },
      include: {
        category: true,
      },
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error('[PRODUCT_SLUG_GET]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
}
