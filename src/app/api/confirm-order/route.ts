import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import prismadb from '@/lib/prismadb';
import { stripe } from '@/lib/stripe';

export async function POST(req: Request) {
  try {
    const { sessionId } = await req.json();

    if (!sessionId) {
      return new NextResponse('Session ID is required', { status: 400 });
    }

    const stripeSession = await stripe.checkout.sessions.retrieve(sessionId);

    if (stripeSession.payment_status !== 'paid') {
      return new NextResponse('Payment not successful', { status: 400 });
    }

    const userId = stripeSession.metadata?.userId;
    const cartItemsString = stripeSession.metadata?.cartItems;
    const total = parseFloat(stripeSession.metadata?.total || '0');

    if (!userId || !cartItemsString) {
      return new NextResponse('Missing metadata in Stripe session', { status: 400 });
    }

    const cartItems = JSON.parse(cartItemsString);

    const order = await prismadb.order.create({
      data: {
        userId: userId,
        total: total,
        status: 'DELIVERED',
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

    // Clear the user's cart after creating the order
    await prismadb.cart.update({
      where: {
        userId: userId,
      },
      data: {
        cartItems: { deleteMany: {} },
      },
    });

    return NextResponse.json(order);
  } catch (error) {
    console.error('[CONFIRM_ORDER_POST]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
}
