/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
      },
    ],
  },
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  webpack: (config, { isServer }) => {
    // Handle native modules
    config.resolve.fallback = {
      ...config.resolve.fallback,
      'rdf-canonize-native': false,
    };

    return config;
  },
}

module.exports = nextConfig
