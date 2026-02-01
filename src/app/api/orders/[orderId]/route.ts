import { NextResponse } from 'next/server';
import prismadb from '@/lib/prismadb';
import { auth } from '@/lib/auth';

export async function PATCH(request: Request, { params }: { params: Promise<{ orderId: string }> }) {
  try {
    const session = await auth();
    const { orderId } = await params;

    if (!session || session.user?.role !== 'ADMIN') {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    if (!orderId) {
      return new NextResponse('Order ID is required', { status: 400 });
    }

    const body = await request.json();
    const { status } = body;

    if (!status) {
      return new NextResponse('Status is required', { status: 400 });
    }

    const order = await prismadb.order.update({
      where: {
        id: orderId,
      },
      data: {
        status,
      },
    });

    return NextResponse.json(order);
  } catch (error) {
    console.error('[ORDER_PATCH]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
}
