/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@tasklane/shared'],

  // Proxy /api/* requests to the NestJS backend during SSR
  // This avoids CORS issues on the server side and keeps the public
  // NEXT_PUBLIC_API_URL env var as the single source of truth.
  async rewrites() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!apiUrl) return [];
    return [
      {
        source: '/proxy/:path*',
        destination: `${apiUrl}/:path*`,
      },
    ];
  },

  // Improve cold-start performance on Vercel
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      '@dnd-kit/core',
      '@dnd-kit/sortable',
      'recharts',
      'framer-motion',
    ],
  },
};

export default nextConfig;
