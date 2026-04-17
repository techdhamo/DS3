/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['picsum.photos', 'localhost'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  async redirects() {
    return [
      // Redirect ds3.store to ds3.world/store
      {
        source: '/:path*',
        has: [
          {
            type: 'header',
            key: 'host',
            value: 'ds3.store',
          },
        ],
        destination: 'https://ds3.world/store/:path*',
        permanent: true,
      },
      {
        source: '/:path*',
        has: [
          {
            type: 'header',
            key: 'host',
            value: 'www.ds3.store',
          },
        ],
        destination: 'https://ds3.world/store/:path*',
        permanent: true,
      },
    ]
  },
  async rewrites() {
    return [
      // Allow standalone store access
      {
        source: '/standalone-store',
        destination: '/store',
      },
    ]
  },
  // PWA configuration
  pwa: {
    dest: 'public',
    register: true,
    skipWaiting: true,
    disable: process.env.NODE_ENV === 'development',
  },
}

module.exports = nextConfig
