import { withAuth } from 'next-auth/middleware';

export default withAuth({
  callbacks: {
    authorized: ({ token }) => !!token,
    async jwt({ token, user }) {
      // Update the token with the latest user data
      if (user) {
        token.name = user.name;
      }
      return token;
    },
    async session({ session, token }) {
      // Keep the session in sync with the token
      if (token) {
        session.user.name = token.name;
      }
      return session;
    }
  },
});

export const config = {
  matcher: [
    '/settings/:path*', 
    '/api/settings/:path*', 
    '/api/links/:path*', 
    '/api/upload/:path*',
    '/admin/:path*',
    '/api/admin/:path*'
  ],
};
