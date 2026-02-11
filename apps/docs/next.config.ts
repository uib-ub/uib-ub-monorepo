import nextra from 'nextra';

const withNextra = nextra({
  // contentDirBasePath: '/',
  defaultShowCopyCode: true,
  staticImage: true,
  unstable_shouldAddLocaleToLinks: true,
})

const nextConfig = withNextra({
  i18n: {
    locales: ['nb', 'en'],
    defaultLocale: 'nb',
  },
  transpilePackages: ['assets'],
})

export default nextConfig
