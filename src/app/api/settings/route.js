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
    const settings = await db.collection('settings').findOne({ userId: session.user.id });

    if (!settings) {
      const defaultSettings = {
        userId: session.user.id,
        name: session.user.name || 'Your Name',
        username: '@username',
        profileImage: '/default-profile.png',
        theme: {
          background: 'bg-[#1a1625]',
          accent: 'violet',
          buttonStyle: 'rounded-xl',
          animation: 'scale'
        }
      };
      await db.collection('settings').insertOne(defaultSettings);
      return NextResponse.json(defaultSettings);
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error in GET /api/settings:', error);
    return NextResponse.json({ error: 'Error fetching settings: ' + error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const settings = await request.json();
    
    // Validate settings object
    if (!settings || typeof settings !== 'object') {
      return NextResponse.json({ error: 'Invalid settings format' }, { status: 400 });
    }

    // Ensure theme object exists and has required properties
    if (settings.theme && typeof settings.theme === 'object') {
      const { background, accent, buttonStyle, animation } = settings.theme;
      if (!background || !accent || !buttonStyle || !animation) {
        return NextResponse.json({ error: 'Missing required theme properties' }, { status: 400 });
      }
    }

    const client = await clientPromise;
    const db = client.db('links-site');
    
    // Get existing settings
    const existingSettings = await db.collection('settings').findOne({ userId: session.user.id });
    
    // Merge existing settings with new settings
    const updatedSettings = {
      ...existingSettings,
      ...settings,
      userId: session.user.id, // Always ensure userId is set
      updatedAt: new Date().toISOString(),
    };
    
    // Remove any undefined values
    Object.keys(updatedSettings).forEach(key => 
      updatedSettings[key] === undefined && delete updatedSettings[key]
    );

    await db.collection('settings').updateOne(
      { userId: session.user.id },
      { $set: updatedSettings },
      { upsert: true }
    );

    return NextResponse.json(updatedSettings);
  } catch (error) {
    console.error('Error in POST /api/settings:', error);
    return NextResponse.json({ error: 'Error saving settings: ' + error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const settings = await request.json();
    
    // Validate settings object
    if (!settings || typeof settings !== 'object') {
      return NextResponse.json({ error: 'Invalid settings format' }, { status: 400 });
    }

    if (!settings.displayName || settings.displayName.trim() === '') {
      return NextResponse.json({ error: 'Display name is required' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db('links-site');
    
    // Add updatedAt timestamp
    const updatedSettings = {
      ...settings,
      updatedAt: new Date().toISOString(),
      userId: session.user.id
    };

    const result = await db.collection('settings').updateOne(
      { userId: session.user.id },
      { $set: updatedSettings },
      { upsert: true }
    );

    return NextResponse.json({ 
      message: 'Settings updated successfully',
      settings: updatedSettings
    });
  } catch (error) {
    console.error('Error in PUT /api/settings:', error);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
