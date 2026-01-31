import { NextResponse } from 'next/server';
import prismadb from '@/lib/prismadb';

export async function GET(request: Request, { params }: { params: { slug: string } }) {
  try {
    if (!params.slug) {
      return new NextResponse('Category slug is required', { status: 400 });
    }

    const category = await prismadb.category.findUnique({
      where: {
        slug: params.slug,
      },
      include: {
        products: true,
      },
    });

    return NextResponse.json(category);
  } catch (error) {
    console.error('[CATEGORY_SLUG_GET]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
}
