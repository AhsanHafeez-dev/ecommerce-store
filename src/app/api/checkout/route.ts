import Stripe from 'stripe';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

import { stripe } from '@/lib/stripe';
import prismadb from '@/lib/prismadb';
import { authOptions } from '../auth/[...nextauth]/route';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(req: Request) {
  try {
    const { productIds } = await req.json();
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    if (!productIds || productIds.length === 0) {
      return new NextResponse('Product IDs are required', { status: 400 });
    }

    const products = await prismadb.product.findMany({
      where: {
        id: {
          in: productIds,
        },
      },
    });

    const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = [];

    for (const product of products) {
      line_items.push({
        quantity: 1,
        price_data: {
          currency: 'USD',
          product_data: {
            name: product.name,
          },
          unit_amount: product.price * 100,
        },
      });
    }

    const order = await prismadb.order.create({
      data: {
        userId: session.user.id,
        status: 'PENDING',
        isPaid: false,
        orderItems: {
          create: productIds.map((productId: string) => ({
            product: {
              connect: { id: productId },
            },
            quantity: 1, // Assuming quantity 1 for now, will be updated with cart integration
            price: products.find(p => p.id === productId)?.price || 0,
          })),
        },
        total: products.reduce((acc, product) => acc + product.price, 0),
      },
    });

    const stripeSession = await stripe.checkout.sessions.create({
      line_items,
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/cart?success=1`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/cart?canceled=1`,
      metadata: {
        orderId: order.id,
      },
    });

    return NextResponse.json({ url: stripeSession.url }, { headers: corsHeaders });
  } catch (error) {
    console.error('[CHECKOUT_POST]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
}
