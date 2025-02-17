import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import cloudinary from '@/lib/cloudinary';
import rateLimiter from '@/lib/rate-limit';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const CLOUDINARY_CONFIG = {
  folder: 'profile-images',
  transformation: [
    { width: 400, height: 400, crop: 'fill' },
    { quality: 'auto:good' }
  ],
  allowed_formats: ['jpg', 'png', 'webp'],
  resource_type: 'image'
};

function validateFile(file) {
  if (!file) {
    throw new Error('No file provided');
  }

  if (!ALLOWED_FILE_TYPES.includes(file.type)) {
    throw new Error('Invalid file type. Only JPEG, PNG and WebP images are allowed');
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new Error('File size exceeds 5MB limit');
  }
}

async function fileToDataUri(file) {
  const buffer = Buffer.from(await file.arrayBuffer());
  const base64Data = buffer.toString('base64');
  return `data:${file.type};base64,${base64Data}`;
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const isLimited = await rateLimiter(request);
    if (isLimited) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file');

    try {
      validateFile(file);
    } catch (validationError) {
      return NextResponse.json(
        { error: validationError.message },
        { status: 400 }
      );
    }

    const dataUri = await fileToDataUri(file);

    try {
      // Verify Cloudinary configuration
      if (!process.env.CLOUDINARY_CLOUD_NAME || 
          !process.env.CLOUDINARY_API_KEY || 
          !process.env.CLOUDINARY_API_SECRET) {
        throw new Error('Cloudinary configuration is incomplete');
      }

      const result = await cloudinary.uploader.upload(dataUri, CLOUDINARY_CONFIG);

      return NextResponse.json({
        url: result.secure_url,
        public_id: result.public_id
      });

    } catch (uploadError) {
      console.error('Cloudinary upload error:', uploadError);
      
      if (uploadError.message.includes('cloud_name')) {
        return NextResponse.json(
          { error: 'Cloudinary configuration error' },
          { status: 500 }
        );
      }

      return NextResponse.json(
        { error: 'Failed to upload image. Please try again.' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
