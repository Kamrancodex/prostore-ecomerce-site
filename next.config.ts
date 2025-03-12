import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true, // ✅ Skips ESLint errors in production builds
  },
  typescript: {
    ignoreBuildErrors: true, // ✅ Skips TypeScript errors in production
  },
};

export default nextConfig;
