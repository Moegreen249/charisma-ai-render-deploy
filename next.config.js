/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Warning: This allows production builds to successfully complete even if
    // your project has type errors.
    ignoreBuildErrors: false,
  },
  experimental: {
    // Enable React 19 features
    optimizeCss: true, // Enable CSS optimization
    optimizePackageImports: [
      'lucide-react',
      '@radix-ui/react-*',
      'framer-motion',
      'recharts',
      '@xyflow/react',
      '@google/generative-ai',
      'openai',
      '@anthropic-ai/sdk'
    ],
  },
  // Server components external packages (moved from experimental)
  serverExternalPackages: [
    '@prisma/client',
    '@google-cloud/aiplatform',
    '@google-cloud/common'
  ],
  images: {
    domains: [],
    formats: ['image/avif', 'image/webp'], // Use modern image formats
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
    dangerouslyAllowSVG: false,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  // Enable strict mode
  reactStrictMode: true,
  // Production optimizations
  productionBrowserSourceMaps: false, // Disable source maps in production
  compress: true, // Enable gzip compression
  poweredByHeader: false, // Remove X-Powered-By header
  
  // Bundle analyzer and optimizations
  webpack: (config, { isServer, dev, webpack }) => {
    // Production optimizations
    if (!dev) {
      // Tree-shake unused icons from lucide-react
      if (!isServer) {
        config.resolve.alias = {
          ...config.resolve.alias,
          'lucide-react': 'lucide-react/dist/esm/icons',
        };
      }
      
      // Optimize chunks for better caching
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          ...config.optimization.splitChunks,
          cacheGroups: {
            ...config.optimization.splitChunks.cacheGroups,
            // AI SDKs in separate chunk (they're heavy)
            ai: {
              name: 'ai-sdks',
              test: /[\\/]node_modules[\\/](@google\/generative-ai|openai|@anthropic-ai\/sdk)/,
              chunks: 'async',
              priority: 50,
              reuseExistingChunk: true,
            },
            // UI libraries
            ui: {
              name: 'ui-libs',
              test: /[\\/]node_modules[\\/](@radix-ui|framer-motion|recharts)/,
              chunks: 'all',
              priority: 40,
              reuseExistingChunk: true,
            },
          },
        },
      };
    }
    
    // Bundle analyzer
    if (process.env.ANALYZE === 'true') {
      const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'static',
          reportFilename: isServer ? '../analyze-server.html' : './analyze-client.html',
          openAnalyzer: false,
        })
      );
    }
    
    return config;
  },
  
  // Add response headers for better performance
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          }
        ]
      },
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=300, stale-while-revalidate=60'
          }
        ]
      }
    ];
  },
  
  // Configure redirects
  async redirects() {
    return [];
  },
  // Configure rewrites
  async rewrites() {
    return [];
  },
};

module.exports = nextConfig;
