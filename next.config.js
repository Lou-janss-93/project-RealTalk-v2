/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: { 
    unoptimized: true,
    domains: ['images.unsplash.com', 'ncocyhlpipgwfoetjhbp.supabase.co']
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  webpack: (config, { isServer }) => {
    // Ignore optional WebSocket dependencies that cause warnings in WebContainer
    config.externals = config.externals || [];
    config.externals.push({
      'bufferutil': 'bufferutil',
      'utf-8-validate': 'utf-8-validate',
      'ws': 'ws',
      'socket.io-client': 'socket.io-client'
    });

    // Suppress critical dependency warnings from Supabase realtime
    config.module = config.module || {};
    config.module.exprContextCritical = false;

    // Handle dynamic imports properly
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };

    return config;
  },
  // Optimize for production
  experimental: {
    optimizeCss: true,
  },
  // Compress output
  compress: true,
  // Generate sitemap
  generateBuildId: async () => {
    return 'realtalk-' + Date.now();
  }
};

module.exports = nextConfig;