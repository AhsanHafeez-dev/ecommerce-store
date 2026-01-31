import { NextResponse } from 'next/server';
import prismadb from '@/lib/prismadb';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';

export async function GET(request: Request, { params }: { params: { categoryId: string } }) {
  try {
    if (!params.categoryId) {
      return new NextResponse('Category ID is required', { status: 400 });
    }

    const category = await prismadb.category.findUnique({
      where: {
        id: params.categoryId,
      },
      include: {
        products: true,
      },
    });

    return NextResponse.json(category);
  } catch (error) {
    console.error('[CATEGORY_GET]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: { categoryId: string } }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== 'ADMIN') {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    if (!params.categoryId) {
      return new NextResponse('Category ID is required', { status: 400 });
    }

    const body = await request.json();
    const { name, image } = body;

    if (!name) {
      return new NextResponse('Name is required', { status: 400 });
    }
    if (!image) {
      return new NextResponse('Image is required', { status: 400 });
    }

    const category = await prismadb.category.update({
      where: {
        id: params.categoryId,
      },
      data: {
        name,
        image,
        slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-*|-*$/g, ''),
      },
    });

    return NextResponse.json(category);
  } catch (error) {
    console.error('[CATEGORY_PATCH]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { categoryId: string } }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== 'ADMIN') {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    if (!params.categoryId) {
      return new NextResponse('Category ID is required', { status: 400 });
    }

    const category = await prismadb.category.delete({
      where: {
        id: params.categoryId,
      },
    });

    return NextResponse.json(category);
  } catch (error) {
    console.error('[CATEGORY_DELETE]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
}
