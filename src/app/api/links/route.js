import clientPromise from '@/lib/mongodb';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db('links-site');

    const user = await db.collection('users').findOne({ email: session.user.email });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user.links || []);
  } catch (error) {
    console.error('Error in GET /api/links:', error);
    return NextResponse.json({ error: 'Error fetching links' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db('links-site');
    const links = await req.json();

    // Update user's links
    await db.collection('users').updateOne(
      { email: session.user.email },
      { $set: { links } }
    );

    const updatedUser = await db.collection('users').findOne({ email: session.user.email });
    return NextResponse.json(updatedUser.links || []);
  } catch (error) {
    console.error('Error in POST /api/links:', error);
    return NextResponse.json({ error: 'Error saving links' }, { status: 500 });
  }
}
