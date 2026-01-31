import { NextResponse } from 'next/server';
import prismadb from '@/lib/prismadb';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    let whereClause = {};

    // If the user is not an admin, they can only see their own orders
    if (session.user?.role !== 'ADMIN') {
      whereClause = { userId: session.user.id };
    }

    const orders = await prismadb.order.findMany({
      where: whereClause,
      include: {
        user: true, // Include user information
        orderItems: {
          include: {
            product: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error('[ORDERS_GET]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await request.json();
    const { cartItems, total } = body;

    if (!cartItems || cartItems.length === 0) {
      return new NextResponse('Cart items are required', { status: 400 });
    }
    if (!total) {
      return new NextResponse('Total is required', { status: 400 });
    }

    const order = await prismadb.order.create({
      data: {
        userId: session.user.id,
        total,
        orderItems: {
          createMany: {
            data: cartItems.map((item: any) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.price,
            })),
          },
        },
      },
      include: {
        orderItems: true,
      },
    });

    return NextResponse.json(order);
  } catch (error) {
    console.error('[ORDERS_POST]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
}
