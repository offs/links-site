import cloudinary from '@/lib/cloudinary';
import clientPromise from '@/lib/mongodb';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new Response('Unauthorized', { status: 401 });
    }

    const data = await request.formData();
    const file = data.get('file');

    if (!file) {
      return new Response('No file uploaded', { status: 400 });
    }

    // Validate file type
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return new Response(
        'Invalid file type. Allowed types: JPG, PNG, GIF, WebP',
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return new Response(
        'File too large. Maximum size is 5MB',
        { status: 400 }
      );
    }

    // Convert the file to base64
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64File = `data:${file.type};base64,${buffer.toString('base64')}`;

    try {
      // Upload to Cloudinary with user-specific folder and optimization
      const result = await cloudinary.uploader.upload(base64File, {
        folder: `profile-pictures/${session.user.id}`,
        transformation: [
          { width: 400, height: 400, crop: 'fill' },
          { quality: 'auto:good' },
          { fetch_format: 'auto' }
        ],
        allowed_formats: ['jpg', 'png', 'gif', 'webp'],
        unique_filename: true,
        overwrite: true
      });

      // Update user settings in MongoDB
      const client = await clientPromise;
      const db = client.db('links-site');
      
      await db.collection('settings').updateOne(
        { userId: session.user.id },
        { 
          $set: { 
            profileImage: result.secure_url,
            updatedAt: new Date().toISOString()
          }
        },
        { upsert: true }
      );

      return new Response(
        JSON.stringify({ 
          filename: result.secure_url,
          width: result.width,
          height: result.height,
          format: result.format
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    } catch (uploadError) {
      console.error('Error uploading to Cloudinary:', uploadError);
      return new Response(
        'Error uploading image to cloud storage',
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in POST /api/upload:', error);
    return new Response(
      'Server error processing upload',
      { status: 500 }
    );
  }
}
