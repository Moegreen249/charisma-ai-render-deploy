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
  },
  images: {
    domains: [],
  },
  // Enable strict mode
  reactStrictMode: true,
  // Configure redirects
  async redirects() {
    return [];
  },
  // Configure rewrites
  async rewrites() {
    return [];
  },
  // Webpack configuration to exclude Windows system directories
  webpack: (config) => {
    // Exclude Windows system directories that cause permission errors
    config.watchOptions = {
      ...config.watchOptions,
      ignored: [
        '**/node_modules/**',
        '**/.git/**',
        '**/.next/**',
        '**/Application Data/**',
        '**/AppData/**',
        '**/Local Settings/**',
        '**/My Documents/**',
        '**/NTUSER.*',
        '**/ntuser.*',
        '**/*Application Data*/**',
        '**/*AppData*/**',
        '**/*Local Settings*/**',
        '**/*My Documents*/**',
      ],
    };
    
    return config;
  },
};

module.exports = nextConfig;
