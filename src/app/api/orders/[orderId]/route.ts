import { NextResponse } from 'next/server';
import prismadb from '@/lib/prismadb';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';

export async function PATCH(request: Request, { params }: { params: { orderId: string } }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== 'ADMIN') {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    if (!params.orderId) {
      return new NextResponse('Order ID is required', { status: 400 });
    }

    const body = await request.json();
    const { status } = body;

    if (!status) {
      return new NextResponse('Status is required', { status: 400 });
    }

    const order = await prismadb.order.update({
      where: {
        id: params.orderId,
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
