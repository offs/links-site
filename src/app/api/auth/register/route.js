import clientPromise from '@/lib/mongodb';
import { NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { authRateLimiter } from '@/lib/rate-limit';
import createDOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';

const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window);

const sanitizeInput = (input) => {
  if (typeof input === 'string') {
    return DOMPurify.sanitize(input.trim(), { ALLOWED_TAGS: [] });
  }
  return input;
};

export async function POST(request) {
  try {
    const isLimited = await authRateLimiter(request);
    if (isLimited) {
      return NextResponse.json(
        { message: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    const client = await clientPromise;
    const db = client.db('links-site');

    // Check if registration is enabled
    const siteSettings = await db.collection('settings').findOne({ _id: 'site' });
    if (siteSettings?.registrationEnabled === false) {
      return NextResponse.json(
        { message: 'Registration is currently disabled' },
        { status: 403 }
      );
    }

    const { email, password, username, name } = await request.json();

    // Validate required fields
    if (!email || !password || !username) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Sanitize inputs
    const sanitizedEmail = sanitizeInput(email).toLowerCase();
    const sanitizedUsername = sanitizeInput(username);
    const sanitizedName = name ? sanitizeInput(name) : '';

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(sanitizedEmail)) {
      return NextResponse.json(
        { message: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Check disallowed domains
    if (siteSettings?.disallowedDomains?.length > 0) {
      const emailDomain = sanitizedEmail.split('@')[1];
      if (siteSettings.disallowedDomains.includes(emailDomain)) {
        return NextResponse.json(
          { message: 'Email domain not allowed' },
          { status: 403 }
        );
      }
    }

    // Validate username format
    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    if (!usernameRegex.test(sanitizedUsername)) {
      return NextResponse.json(
        { message: 'Username can only contain letters, numbers, and underscores' },
        { status: 400 }
      );
    }

    if (sanitizedUsername.length < 3 || sanitizedUsername.length > 30) {
      return NextResponse.json(
        { message: 'Username must be between 3 and 30 characters' },
        { status: 400 }
      );
    }

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json(
        { message: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    // Check for existing user
    const existingUser = await db.collection('users').findOne({
      $or: [
        { email: sanitizedEmail },
        { username: sanitizedUsername.toLowerCase() }
      ]
    });

    if (existingUser) {
      return NextResponse.json(
        { message: 'Email or username already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await hash(password, 12);

    // Create user
    await db.collection('users').insertOne({
      email: sanitizedEmail,
      username: sanitizedUsername.toLowerCase(),
      name: sanitizedName,
      password: hashedPassword,
      createdAt: new Date(),
      isAdmin: false
    });

    return NextResponse.json(
      { message: 'User created successfully' },
      { status: 201 }
    );
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.error('Registration error:', error);
    }
    return NextResponse.json(
      { message: 'Failed to create user' },
      { status: 500 }
    );
  }
}
