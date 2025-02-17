import clientPromise from '@/lib/mongodb';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { NextResponse } from 'next/server';
import rateLimiter from '@/lib/rate-limit';
import createDOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';

const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window);

const sanitizeInput = (input) => {
  if (typeof input === 'string') {
    return DOMPurify.sanitize(input.trim(), { ALLOWED_TAGS: [] });
  }
  return input;
};

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db('links-site');
    const user = await db.collection('users').findOne({ 
      email: session.user.email.toLowerCase() 
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const settings = {
      name: user.name || '',
      username: user.username || '',
      profileImage: user.profileImage || '/default-profile.png'
    };

    return NextResponse.json(settings);
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.error('Error in GET /api/settings:', error);
    }
    return NextResponse.json({ error: 'Error fetching settings' }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const isLimited = await rateLimiter(request);
    if (isLimited) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const body = await request.json();
    const updates = {};

    if (body.username !== undefined) {
      const username = sanitizeInput(body.username);

      if (!username || typeof username !== 'string') {
        return NextResponse.json({ error: 'Username is required' }, { status: 400 });
      }

      if (username.length < 3 || username.length > 30) {
        return NextResponse.json({
          error: 'Username must be between 3 and 30 characters long'
        }, { status: 400 });
      }

      const usernameRegex = /^[a-zA-Z0-9_]+$/;
      if (!usernameRegex.test(username)) {
        return NextResponse.json({
          error: 'Username can only contain letters, numbers, and underscores'
        }, { status: 400 });
      }

      const client = await clientPromise;
      const db = client.db('links-site');
      const existingUser = await db.collection('users').findOne({
        username: username.toLowerCase()
      });

      if (existingUser && existingUser._id.toString() !== session.user.id) {
        return NextResponse.json({
          error: 'Username already taken'
        }, { status: 400 });
      }

      updates.username = username.toLowerCase();
    }

    if (body.name !== undefined) {
      updates.name = sanitizeInput(body.name);
    }

    if (body.profileImage !== undefined) {
      updates.profileImage = sanitizeInput(body.profileImage);
    }

    const client = await clientPromise;
    const db = client.db('links-site');

    const result = await db.collection('users').updateOne(
      { email: session.user.email.toLowerCase() },
      { $set: updates }
    );

    if (result.modifiedCount === 0) {
      return NextResponse.json({ error: 'Failed to update settings' }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.error('Error in PUT /api/settings:', error);
    }
    return NextResponse.json({ error: 'Error updating settings' }, { status: 500 });
  }
}
