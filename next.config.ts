import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Vercel deployment optimizations
  serverExternalPackages: ['@prisma/client', 'bcryptjs'],
  
  // Enable Turbopack (default in Next.js 16)
  turbopack: {},
  
  // Image optimization for Vercel
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
    ],
  },
};

export default nextConfig;
