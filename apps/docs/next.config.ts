import nextra from 'nextra';
import bundleAnalyzer from '@next/bundle-analyzer'

const withNextra = nextra({
  // contentDirBasePath: '/',
  defaultShowCopyCode: true,
  staticImage: true,
  unstable_shouldAddLocaleToLinks: true,
})

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true'
})

const nextConfig = withBundleAnalyzer(
  withNextra({
    i18n: {
      locales: ['nb', 'en'],
      defaultLocale: 'nb',
    },
    transpilePackages: ['assets'],
  })
)

export default nextConfig
