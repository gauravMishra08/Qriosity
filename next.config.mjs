/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,  // Disables ESLint during build
  },
  typescript: {
    ignoreBuildErrors: true,  // Keeps build going even if there are TypeScript errors
  },
  images: {
    unoptimized: true,  // Disables image optimization
  },
  devIndicators: {
    buildActivity: false,  // Hides the "Build Activity" indicator
    autoPrerender: false,  // Hides the "Auto Prerender" indicator
  },
}

export default nextConfig
