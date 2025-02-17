import bundleAnalyzer from '@next/bundle-analyzer';

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  compress: true,

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
    ],
    minimumCacheTTL: 60 * 60 * 24, // 24 hours
    formats: ['image/avif', 'image/webp'],
  },

  headers: async () => [
    {
      source: '/:path*',
      headers: [
        {
          key: 'X-Frame-Options',
          value: 'DENY',
        },
        {
          key: 'X-Content-Type-Options',
          value: 'nosniff',
        },
        {
          key: 'Referrer-Policy',
          value: 'strict-origin-when-cross-origin',
        },
        {
          key: 'Permissions-Policy',
          value: 'camera=(), microphone=(), geolocation=(), interest-cohort=(), payment=(), usb=(), vr=(), accelerometer=(), gyroscope=()',
        },
        {
          key: 'X-XSS-Protection',
          value: '1; mode=block',
        },
        {
          key: 'Content-Security-Policy',
          value: process.env.NODE_ENV === 'production'
            ? [
                "default-src 'self'",
                "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
                "style-src 'self' 'unsafe-inline'",
                "img-src 'self' https://res.cloudinary.com data: blob:",
                "font-src 'self' data:",
                "connect-src 'self' https://res.cloudinary.com",
                "frame-ancestors 'none'",
                "base-uri 'self'",
                "form-action 'self'",
                "manifest-src 'self'",
                "upgrade-insecure-requests",
                "block-all-mixed-content",
              ].join('; ')
            : '',
        },
        {
          key: 'Strict-Transport-Security',
          value: 'max-age=31536000; includeSubDomains; preload',
        },
        {
          key: 'X-DNS-Prefetch-Control',
          value: 'on',
        },
      ],
    },
  ],

  reactStrictMode: true,

  productionBrowserSourceMaps: false,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },


  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['react-icons'],
    turbo: {
      loaders: {
        '.svg': ['@svgr/webpack'],
      },
    },
  },

  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      config.optimization = {
        ...config.optimization,
        mergeDuplicateChunks: true,
        minimize: true,
        moduleIds: 'deterministic',
      };
    }
    return config;
  },

  env: {
    NEXT_PUBLIC_APP_ENV: process.env.NODE_ENV,
  },

  output: 'standalone',
};

export default withBundleAnalyzer(nextConfig);
