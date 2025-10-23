import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Prevent type errors from failing Vercel builds
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
