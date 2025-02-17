import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

const isApiRoute = (pathname) => pathname.startsWith('/api/');

const getAllowedOrigins = () => {
  if (process.env.NODE_ENV === 'production') {
    return process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : [];
  } else {
    return ['http://localhost:3000'];
  }
};

async function middleware(request) {
  const response = NextResponse.next();

  if (isApiRoute(request.nextUrl.pathname)) {
    const allowedOrigins = getAllowedOrigins();
    const origin = request.headers.get('origin');
    

    if (origin && (
      process.env.NODE_ENV === 'development' || 
      allowedOrigins.includes(origin)
    )) {
      response.headers.set('Access-Control-Allow-Origin', origin);
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      response.headers.set('Access-Control-Max-Age', '86400');
    }

    if (request.method === 'OPTIONS') {
      return response;
    }
  }

  response.headers.set('X-DNS-Prefetch-Control', 'on');
  response.headers.set('X-Download-Options', 'noopen');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  if (process.env.NODE_ENV === 'production') {
    response.headers.set(
      'Content-Security-Policy',
      "default-src 'self'; " +
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
      "style-src 'self' 'unsafe-inline'; " +
      "img-src 'self' https://res.cloudinary.com data: blob:; " +
      "font-src 'self' data:; " +
      "connect-src 'self' https://res.cloudinary.com; " +
      "frame-ancestors 'none';"
    );
  }

  return response;
}

export default withAuth(
  function auth(request) {
    try {
      return middleware(request);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        // eslint-disable-next-line no-console
        console.error('Middleware error:', error);
      }
      return NextResponse.next();
    }
  },
  {
    pages: {
      signIn: '/auth/signin',
    },
    callbacks: {
      authorized: ({ token }) => {
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    '/settings/:path*',
    '/admin/:path*',
    '/api/settings/:path*',
    '/api/admin/:path*',
    '/api/links/:path*',
    '/api/upload/:path*'
  ]
};
