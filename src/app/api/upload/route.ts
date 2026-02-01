import { NextResponse } from 'next/server';
import cloudinary from '@/lib/cloudinary';
import { auth } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session || session.user?.role !== 'ADMIN') {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await request.json();
    const { image } = body;

    if (!image) {
      return new NextResponse('Image is required', { status: 400 });
    }

    const uploadedResponse = await cloudinary.uploader.upload(image, {

    });

    return NextResponse.json({ url: uploadedResponse.secure_url });
  } catch (error) {
    console.error('[UPLOAD_POST]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
}
