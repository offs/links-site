import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { requireAdmin } from '@/lib/admin';
import { ObjectId } from 'mongodb';

// GET /api/admin/users - Get all users
export async function GET() {
  try {
    await requireAdmin();
    
    const client = await clientPromise;
    const db = client.db('links-site');
    const users = await db.collection('users')
      .find({})
      .project({
        username: 1,
        email: 1,
        isAdmin: 1,
        createdAt: 1
      })
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json(users);
  } catch (error) {
    if (error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT /api/admin/users - Update user (toggle admin status)
export async function PUT(request) {
  try {
    await requireAdmin();
    
    const { userId, isAdmin } = await request.json();
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db('links-site');
    
    const result = await db.collection('users').updateOne(
      { _id: new ObjectId(userId) },
      { $set: { isAdmin: isAdmin } }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE /api/admin/users - Delete user
export async function DELETE(request) {
  try {
    await requireAdmin();
    
    const { userId } = await request.json();
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db('links-site');
    
    // Delete user's links
    await db.collection('links').deleteMany({ userId: new ObjectId(userId) });
    
    // Delete user's settings
    await db.collection('settings').deleteMany({ userId: new ObjectId(userId) });
    
    // Delete the user
    const result = await db.collection('users').deleteOne({ _id: new ObjectId(userId) });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
