/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'your-supabase-project.supabase.co',
      // Add your actual Supabase project URL here
    ],
  },
  // Remove the experimental.appDir - it's not needed in Next.js 14
  // Remove the custom webpack config unless you specifically need it
}

module.exports = nextConfig
