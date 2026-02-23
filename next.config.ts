import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'cdn.dashnet.org',
      },
      {
        protocol: 'https',
        hostname: 'staticg.sportskeeda.com',
      },
      {
        protocol: 'https',
        hostname: 'images.chesscomfiles.com',
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
};

export default nextConfig;
