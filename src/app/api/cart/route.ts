import { NextResponse } from 'next/server';
import prismadb from '@/lib/prismadb';
import { auth } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const session = await auth();

    if (!session || !session.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const cart = await prismadb.cart.findUnique({
      where: {
        userId: session.user.id,
      },
      include: {
        cartItems: {
          include: {
            product: true,
          },
        },
      },
    });

    return NextResponse.json(cart);
  } catch (error) {
    console.error('[CART_GET]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session || !session.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await request.json();
    const { productId, quantity } = body;

    if (!productId) {
      return new NextResponse('Product ID is required', { status: 400 });
    }
    if (!quantity || quantity <= 0) {
      return new NextResponse('Quantity must be at least 1', { status: 400 });
    }

    let userCart = await prismadb.cart.findUnique({
      where: {
        userId: session.user.id,
      },
    });

    if (!userCart) {
      userCart = await prismadb.cart.create({
        data: {
          userId: session.user.id,
        },
      });
    }

    const existingCartItem = await prismadb.cartItem.findFirst({
      where: {
        cartId: userCart.id,
        productId,
      },
    });

    if (existingCartItem) {
      await prismadb.cartItem.update({
        where: {
          id: existingCartItem.id,
        },
        data: {
          quantity: existingCartItem.quantity + quantity,
        },
      });
    } else {
      const product = await prismadb.product.findUnique({
        where: { id: productId },
      });

      if (!product) {
        return new NextResponse('Product not found', { status: 404 });
      }

      await prismadb.cartItem.create({
        data: {
          cartId: userCart.id,
          productId,
          quantity,
          price: product.price,
        },
      });
    }

    const updatedCart = await prismadb.cart.findUnique({
      where: {
        userId: session.user.id,
      },
      include: {
        cartItems: {
          include: {
            product: true,
          },
        },
      },
    });

    return NextResponse.json(updatedCart);
  } catch (error) {
    console.error('[CART_POST]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await auth();

    if (!session || !session.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await request.json();
    const { cartItemId } = body;

    if (!cartItemId) {
      return new NextResponse('Cart item ID is required', { status: 400 });
    }

    await prismadb.cartItem.delete({
      where: {
        id: cartItemId,
        cart: {
          userId: session.user.id,
        },
      },
    });

    const updatedCart = await prismadb.cart.findUnique({
      where: {
        userId: session.user.id,
      },
      include: {
        cartItems: {
          include: {
            product: true,
          },
        },
      },
    });

    return NextResponse.json(updatedCart);
  } catch (error) {
    console.error('[CART_DELETE]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
}
