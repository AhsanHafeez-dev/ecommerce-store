import { NextResponse } from 'next/server';
import cloudinary from '@/lib/cloudinary';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== 'ADMIN') {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await request.json();
    const { image } = body;

    if (!image) {
      return new NextResponse('Image is required', { status: 400 });
    }

    const uploadedResponse = await cloudinary.uploader.upload(image, {
      upload_preset: 'ecommerce_upload', // You'll need to create this upload preset in Cloudinary
    });

    return NextResponse.json({ url: uploadedResponse.secure_url });
  } catch (error) {
    console.error('[UPLOAD_POST]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
}
