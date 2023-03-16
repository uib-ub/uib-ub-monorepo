/** @type {import('next').NextConfig} */

const withNextIntl = require('next-intl/plugin')(
  // This is the default (also the `src` folder is supported out of the box)
  './i18n.ts'
);


const config = {
  // @TODO turn swcMinify back on once the agressive dead code elimination bug that casues
  // `ReferenceError: FieldPresenceWithOverlay is not defined` is fixed
  swcMinify: false,
  experimental: {
    appDir: true,
  },

  images: {
    remotePatterns: [
      { hostname: 'cdn.sanity.io' },
      { hostname: 'source.unsplash.com' },
    ],
  },
  typescript: {
    // Set this to false if you want production builds to abort if there's type errors
    ignoreBuildErrors: process.env.VERCEL_ENV === 'production',
  },
  eslint: {
    /// Set this to false if you want production builds to abort if there's lint errors
    ignoreDuringBuilds: process.env.VERCEL_ENV === 'production',
  },
}

module.exports = withNextIntl({
  // Other Next.js configuration ...
  ...config
});