import clientPromise from '@/lib/mongodb';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { NextResponse } from 'next/server';
import { authRateLimiter } from '@/lib/rate-limit';

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db('links-site');
    
    const settings = await db.collection('settings').findOne({ _id: 'site' }) || {
      registrationEnabled: true,
      disallowedDomains: []
    };

    return NextResponse.json(settings);
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error fetching site settings:', error);
    }
    return NextResponse.json(
      { message: 'Failed to fetch site settings' },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.isAdmin) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const limited = await authRateLimiter(request);
    if (!limited) {
      return NextResponse.json(
        { message: 'Too many requests' },
        { status: 429 }
      );
    }

    const updates = await request.json();
    const validUpdates = {};

    // Handle registration enabled
    if (updates.registrationEnabled !== undefined) {
      validUpdates.registrationEnabled = !!updates.registrationEnabled;
    }

    // Handle disallowed domains
    if (updates.disallowedDomains !== undefined) {
      if (!Array.isArray(updates.disallowedDomains)) {
        return NextResponse.json(
          { message: 'disallowedDomains must be an array' },
          { status: 400 }
        );
      }

      // Validate each domain
      const validDomains = updates.disallowedDomains.filter(domain => {
        return typeof domain === 'string' && 
               domain.includes('.') && 
               !domain.includes(' ') &&
               domain.length > 3;
      });

      validUpdates.disallowedDomains = validDomains;
    }

    if (Object.keys(validUpdates).length === 0) {
      return NextResponse.json(
        { message: 'No valid fields to update' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db('links-site');

    await db.collection('settings').updateOne(
      { _id: 'site' },
      { $set: validUpdates },
      { upsert: true }
    );

    const updatedSettings = await db.collection('settings').findOne({ _id: 'site' });
    return NextResponse.json(updatedSettings);
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error updating site settings:', error);
    }
    return NextResponse.json(
      { message: 'Failed to update site settings' },
      { status: 500 }
    );
  }
}
