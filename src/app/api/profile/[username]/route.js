import clientPromise from '@/lib/mongodb';
import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
  try {
    const username = (await params).username;
    
    const formattedUsername = username.toLowerCase();
    const client = await clientPromise;
    const db = client.db('links-site');

    const cacheControl = process.env.NODE_ENV === 'production'
      ? 'public, max-age=300, stale-while-revalidate=60'
      : 'no-cache';

    const user = await db.collection('users').findOne(
      { username: formattedUsername },
      {
        projection: {
          _id: 1,
          name: 1,
          username: 1,
          profileImage: 1,
          links: 1
        }
      }
    );

    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { 
          status: 404,
          headers: {
            'Cache-Control': 'no-cache'
          }
        }
      );
    }

    const settings = {
      userId: user._id.toString(),
      name: user.name || 'Your Name',
      username: user.username || 'username',
      profileImage: user.profileImage || '/default-profile.png'
    };

    const links = user.links || [];

    const response = NextResponse.json({
      settings,
      links
    });

    // Add cache headers
    response.headers.set('Cache-Control', cacheControl);

    return response;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.error('Profile fetch error:', error);
    }
    return NextResponse.json(
      { message: 'An error occurred while fetching the profile' },
      { 
        status: 500,
        headers: {
          'Cache-Control': 'no-cache'
        }
      }
    );
  }
}
