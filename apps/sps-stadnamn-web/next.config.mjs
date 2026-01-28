
import createMDX from '@next/mdx'
 
/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ['js', 'jsx', 'mdx', 'ts', 'tsx'],
  transpilePackages: ['next-mdx-remote'],
  env: {
    NEXT_PUBLIC_SN_ENV: process.env.SN_ENV,
  },
  redirects: async () => {
    return [
      {
        source: '/datasets',
        destination: '/info/datasets',
        permanent: true,
      },
      {
        source: '/view/:dataset/info',
        destination: '/info/datasets/:dataset',
        permanent: true,
      },
    ]
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.ubbe.no',

      },
      {
        protocol: 'https',
        hostname: '**.spraksamlingane.no',
      },
      {
        protocol: 'https',
        hostname: 'iiif.io',
      }
    ],
  },
}
 
const withMDX = createMDX({
  // Add markdown plugins here, as desired
  options: {
    remarkPlugins: [],
    rehypePlugins: [],
  },
})
 
// Merge MDX config with Next.js config
export default withMDX(nextConfig)