import clientPromise from '@/lib/mongodb';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { authRateLimiter } from '@/lib/rate-limit';

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const limited = await authRateLimiter(request);
    if (!limited) {
      return NextResponse.json(
        { message: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    const client = await clientPromise;
    const db = client.db('links-site');
    const users = await db.collection('users').find({}, {
      projection: {
        _id: 1,
        email: 1,
        username: 1,
        name: 1,
        isAdmin: 1,
        createdAt: 1
      }
    }).toArray();

    return NextResponse.json(users);
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Admin users fetch error:', error);
    }
    return NextResponse.json(
      { message: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const limited = await authRateLimiter(request);
    if (!limited) {
      return NextResponse.json(
        { message: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    const { userId } = await request.json();
    if (!userId) {
      return NextResponse.json(
        { message: 'User ID is required' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db('links-site');

    // Don't allow deleting the last admin
    const adminCount = await db.collection('users').countDocuments({ isAdmin: true });
    const userToDelete = await db.collection('users').findOne({ _id: userId });

    if (adminCount <= 1 && userToDelete?.isAdmin) {
      return NextResponse.json(
        { message: 'Cannot delete the last admin user' },
        { status: 400 }
      );
    }

    const result = await db.collection('users').deleteOne({ _id: userId });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'User deleted successfully' });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Admin user delete error:', error);
    }
    return NextResponse.json(
      { message: 'Failed to delete user' },
      { status: 500 }
    );
  }
}
