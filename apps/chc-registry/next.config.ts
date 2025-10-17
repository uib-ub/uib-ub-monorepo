import { createMDX } from 'fumadocs-mdx/next';

const withMDX = createMDX();

const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.uib.no',
      }
    ],
  },
};

export default withMDX(nextConfig);
