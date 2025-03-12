import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true, // ✅ Ignores TypeScript errors during production build
  },
};

export default nextConfig;
