'use server';

import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db('links-site');

    // Get the current user
    const user = await db.collection('users').findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Update user to be admin
    await db.collection('users').updateOne(
      { email: session.user.email },
      { $set: { isAdmin: true } }
    );

    return NextResponse.json({ message: 'Admin status updated successfully' });
  } catch (error) {
    console.error('Error setting admin status:', error);
    return NextResponse.json({ error: 'Failed to set admin status' }, { status: 500 });
  }
}
