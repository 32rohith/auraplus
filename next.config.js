/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configure experimental features
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000'],
      bodySizeLimit: '2mb',
    },
  },
  // Ensure API key is available to API routes
  env: {
    NEXT_PUBLIC_GOOGLE_AI_STUDIO_API_KEY: process.env.NEXT_PUBLIC_GOOGLE_AI_STUDIO_API_KEY,
  },
  // Disable ESLint checking during build
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Customize server behavior if needed
  async headers() {
    return [
      {
        // Apply these headers to all routes
        source: '/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, must-revalidate',
          },
        ],
      },
    ]
  },
};

module.exports = nextConfig;