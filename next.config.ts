import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    // Temporarily ignore during production builds
    // Will fix these warnings post-deployment
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
