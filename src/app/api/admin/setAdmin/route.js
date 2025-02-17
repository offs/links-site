import clientPromise from '@/lib/mongodb';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { NextResponse } from 'next/server';

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const client = await clientPromise;
    const db = client.db('links-site');

    const user = await db.collection('users').findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // Update user to be admin
    await db.collection('users').updateOne(
      { email: session.user.email },
      { $set: { isAdmin: true } }
    );

    return NextResponse.json({ message: 'User promoted to admin' }, { status: 200 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ message: 'Failed to set admin' }, { status: 500 });
  }
}
