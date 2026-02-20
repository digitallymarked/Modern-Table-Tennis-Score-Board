import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  basePath: '/ttscore',
  eslint: {
    ignoreDuringBuilds: true,
  },
}

export default nextConfig
