// next.config.ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  eslint: {
    // ✅ Don’t fail CI/production builds on lint errors.
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
