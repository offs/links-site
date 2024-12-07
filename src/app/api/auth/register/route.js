import clientPromise from '@/lib/mongodb';
import bcrypt from 'bcryptjs';

export async function POST(request) {
  try {
    const { username, email, password } = await request.json();

    if (!username || !email || !password) {
      return new Response('Missing required fields', { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db('links-site');

    // Check if registration is enabled
    const settings = await db.collection('globalSettings').findOne({});
    if (settings && !settings.registrationEnabled) {
      return new Response('Registration is currently disabled', { status: 403 });
    }

    // Validate username format
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
      return new Response('Invalid username format', { status: 400 });
    }

    // Check if username is taken
    const existingUsername = await db.collection('users').findOne({ username: username.toLowerCase() });
    if (existingUsername) {
      return new Response('Username already taken', { status: 400 });
    }

    // Check if email is taken
    const existingEmail = await db.collection('users').findOne({ email: email.toLowerCase() });
    if (existingEmail) {
      return new Response('Email already registered', { status: 400 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const result = await db.collection('users').insertOne({
      username: username.toLowerCase(),
      email: email.toLowerCase(),
      password: hashedPassword,
      createdAt: new Date(),
    });

    // Create default settings for the user
    const defaultSettings = {
      userId: result.insertedId.toString(),
      username: '@' + username.toLowerCase(),
      displayName: username,
      profileImage: '/default-profile.png',
      theme: {
        background: 'bg-[#1a1625]',
        accent: 'violet',
        buttonStyle: 'rounded-xl',
        animation: 'scale'
      }
    };

    await db.collection('settings').insertOne(defaultSettings);

    return new Response(JSON.stringify({ message: 'User created successfully' }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Registration error:', error);
    return new Response('Error creating user: ' + error.message, { status: 500 });
  }
}
