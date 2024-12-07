import { withAuth } from 'next-auth/middleware';

export default withAuth({
  callbacks: {
    authorized: ({ token }) => !!token
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
