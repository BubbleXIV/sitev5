/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'your-supabase-project.supabase.co',
      // Add other domains as needed
    ],
  },
  experimental: {
    appDir: true,
  },
  // Ensure webpack can resolve the aliases
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': require('path').resolve(__dirname),
    }
    return config
  },
}

module.exports = nextConfig
