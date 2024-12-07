import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db('links-site');
    const links = await db.collection('links').find({ userId: session.user.id }).toArray();

    return NextResponse.json(links);
  } catch (error) {
    console.error('Error in GET /api/links:', error);
    return NextResponse.json({ error: 'Failed to fetch links' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const links = await request.json();
    
    // Validate links
    if (!Array.isArray(links)) {
      return NextResponse.json({ error: 'Invalid links format' }, { status: 400 });
    }

    for (const link of links) {
      if (!link.title || !link.url) {
        return NextResponse.json({ error: 'Title and URL are required for all links' }, { status: 400 });
      }

      // Ensure URL is properly formatted
      if (!link.url.startsWith('http://') && !link.url.startsWith('https://')) {
        link.url = `https://${link.url}`;
      }

      // Set default values for new properties if not provided
      link.icon = link.icon || null;
      link.iconPosition = link.iconPosition || 'left';
      link.textColor = link.textColor || 'text-white';
      link.fontSize = link.fontSize || 'text-base';
      link.fontWeight = link.fontWeight || 'font-medium';
      link.padding = link.padding || 'py-4 px-6';
      link.opacity = link.opacity || 100;
      link.border = link.border || '';
      link.shadow = link.shadow || '';
    }

    const client = await clientPromise;
    const db = client.db('links-site');
    
    // Delete existing links and insert new ones
    await db.collection('links').deleteMany({ userId: session.user.id });
    if (links.length > 0) {
      await db.collection('links').insertMany(
        links.map(link => ({ ...link, userId: session.user.id }))
      );
    }

    const updatedLinks = await db.collection('links').find({ userId: session.user.id }).toArray();
    return NextResponse.json(updatedLinks);
  } catch (error) {
    console.error('Error in POST /api/links:', error);
    return NextResponse.json({ error: 'Failed to update links' }, { status: 500 });
  }
}
