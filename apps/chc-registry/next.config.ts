import { createMDX } from 'fumadocs-mdx/next';

const withMDX = createMDX();

const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default withMDX(nextConfig);
