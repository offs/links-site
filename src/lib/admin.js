import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import clientPromise from './mongodb';

export async function isAdmin() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return false;
  }

  try {
    const client = await clientPromise;
    const db = client.db('links-site');
    const user = await db.collection('users').findOne({ 
      email: session.user.email.toLowerCase() 
    });

    return user?.isAdmin === true;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.error('Error checking admin status:', error);
    }
    return false;
  }
}

export async function requireAdmin() {
  const isUserAdmin = await isAdmin();
  if (!isUserAdmin) {
    throw new Error('Unauthorized: Admin access required');
  }
  return true;
}
