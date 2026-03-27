/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Prevents mongoose from being bundled into every serverless function
    // Keeps bundle size small and reduces cold start time on Vercel
    serverComponentsExternalPackages: ['mongoose'],
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
  },
};

export default nextConfig;
