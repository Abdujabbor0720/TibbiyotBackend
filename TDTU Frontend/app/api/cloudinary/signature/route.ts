import { v2 as cloudinary } from 'cloudinary';
import { NextRequest, NextResponse } from 'next/server';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dm4byivx7',
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY || '192842456244912',
  api_secret: process.env.CLOUDINARY_API_SECRET || '-XLRfAx0HIG3xHselTMUY-tt0vk',
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { folder = 'tsdi-uploads' } = body;

    const timestamp = Math.round(new Date().getTime() / 1000);

    const signature = cloudinary.utils.api_sign_request(
      {
        timestamp,
        folder,
      },
      process.env.CLOUDINARY_API_SECRET || '-XLRfAx0HIG3xHselTMUY-tt0vk'
    );

    return NextResponse.json({
      signature,
      timestamp,
      cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dm4byivx7',
      apiKey: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY || '192842456244912',
      folder,
    });
  } catch (error: any) {
    console.error('Signature error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate signature' },
      { status: 500 }
    );
  }
}
