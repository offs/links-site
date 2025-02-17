import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { MongoDBAdapter } from '@auth/mongodb-adapter';
import clientPromise from '@/lib/mongodb';
import bcrypt from 'bcryptjs';

export const authOptions = {
  adapter: MongoDBAdapter(clientPromise),
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            throw new Error('Please provide both email and password');
          }
          
          const client = await clientPromise;
          const db = client.db('links-site');
          const user = await db.collection('users').findOne({ 
            email: credentials.email.toLowerCase() 
          });
          
          if (!user) {
            throw new Error('No user found with this email');
          }
          
          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          );
          
          if (!isPasswordValid) {
            throw new Error('Invalid password');
          }
          
          return {
            id: user._id.toString(),
            email: user.email,
            username: user.username,
            isAdmin: user.isAdmin || false
          };
        } catch (error) {
          if (process.env.NODE_ENV === 'development') {
            // eslint-disable-next-line no-console
            console.error('Authorization error:', error);
          }
          throw new Error('Invalid credentials');
        }
      }
    })
  ],
  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours
    secure: process.env.NODE_ENV === 'production',
  },
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (trigger === 'signIn' && user) {
        token.id = user.id;
        token.email = user.email;
        token.username = user.username;
        token.isAdmin = user.isAdmin;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.email = token.email;
        session.user.username = token.username;
        session.user.isAdmin = token.isAdmin;
      }
      return session;
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
