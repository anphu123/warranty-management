import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'refurbest.vn' },
    ],
  },
};

export default nextConfig;
