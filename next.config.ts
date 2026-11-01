import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  typescript: {
    // Type checking is handled separately (tsc --noEmit)
    // This allows Vercel to build without blocking on type errors
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
  },
}

export default nextConfig
