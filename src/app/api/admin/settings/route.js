import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { requireAdmin } from '@/lib/admin';

// GET /api/admin/settings - Get global settings
export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db('links-site');
    
    let settings = await db.collection('globalSettings').findOne({});
    if (!settings) {
      // Initialize default settings if they don't exist
      settings = {
        registrationEnabled: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      await db.collection('globalSettings').insertOne(settings);
    }
    
    return NextResponse.json(settings);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT /api/admin/settings - Update global settings
export async function PUT(request) {
  try {
    await requireAdmin();
    
    const updates = await request.json();
    const client = await clientPromise;
    const db = client.db('links-site');
    
    const result = await db.collection('globalSettings').updateOne(
      {},
      { 
        $set: {
          ...updates,
          updatedAt: new Date()
        }
      },
      { upsert: true }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
