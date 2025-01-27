import createNextIntlPlugin from 'next-intl/plugin';

const nextConfig = {
  basePath: process.env.NEXT_PUBLIC_BASE_PATH,
  transpilePackages: ['@samvera/clover-iiif'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
      },
    ],
  },
};

const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);