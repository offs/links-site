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

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    
    // Remove _id if it exists in the update data
    const { _id, ...updateData } = body;
    
    const client = await clientPromise;
    const db = client.db('links-site');
    
    // Get existing settings first
    let existingSettings = await db.collection('settings').findOne({ userId: session.user.id });
    
    // If no existing settings, use default theme
    if (!existingSettings) {
      existingSettings = {
        userId: session.user.id,
        theme: {
          background: 'bg-[#1a1625]',
          accent: 'violet',
          buttonStyle: 'rounded-xl',
          animation: 'scale'
        }
      };
    }
    
    // Merge existing settings with new updates
    const updatedSettings = {
      ...existingSettings,
      ...updateData,
      updatedAt: new Date(),
      userId: session.user.id, // ensure userId is always set
    };

    // Remove _id from the update operation
    const { _id: _, ...settingsToUpdate } = updatedSettings;

    await db.collection('settings').updateOne(
      { userId: session.user.id },
      { $set: settingsToUpdate },
      { upsert: true }
    );

    // Return the complete updated settings
    return NextResponse.json(settingsToUpdate);
  } catch (error) {
    console.error('Error in POST /api/settings:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const updates = await request.json();
    
    // Validate username if it's being updated
    if (updates.username) {
      // Remove @ if present at the start
      updates.username = updates.username.replace(/^@/, '');
      
      // Add @ back
      updates.username = `@${updates.username}`;

      // Validate username format
      if (!/^@[\w\d_-]+$/.test(updates.username)) {
        return NextResponse.json({ 
          error: 'Username can only contain letters, numbers, underscores, and dashes' 
        }, { status: 400 });
      }

      if (updates.username.length < 3) {
        return NextResponse.json({ 
          error: 'Username must be at least 3 characters long' 
        }, { status: 400 });
      }

      if (updates.username.length > 30) {
        return NextResponse.json({ 
          error: 'Username cannot be longer than 30 characters' 
        }, { status: 400 });
      }

      // Check if username is already taken
      const client = await clientPromise;
      const db = client.db('links-site');
      
      const existingUser = await db.collection('settings').findOne({
        username: updates.username,
        userId: { $ne: session.user.id } // Exclude current user
      });

      if (existingUser) {
        return NextResponse.json({ 
          error: 'Username is already taken' 
        }, { status: 400 });
      }
    }

    const client = await clientPromise;
    const db = client.db('links-site');
    
    // Get existing settings
    const existingSettings = await db.collection('settings').findOne({ userId: session.user.id });
    
    if (!existingSettings) {
      return NextResponse.json({ error: 'Settings not found' }, { status: 404 });
    }

    // Merge updates with existing settings
    const updatedSettings = {
      ...existingSettings,
      ...updates,
      // If name is being updated, also update displayName
      ...(updates.name ? { displayName: updates.name } : {}),
      updatedAt: new Date(),
      userId: session.user.id
    };

    // Remove _id before update
    const { _id, ...settingsToUpdate } = updatedSettings;

    // Update settings
    await db.collection('settings').updateOne(
      { userId: session.user.id },
      { $set: settingsToUpdate }
    );

    // Verify the update
    const verifiedSettings = await db.collection('settings').findOne({ userId: session.user.id });

    return NextResponse.json({ 
      message: 'Settings updated successfully',
      settings: verifiedSettings
    });
  } catch (error) {
    console.error('Error in PUT /api/settings:', error);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
