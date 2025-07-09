import nextra from 'nextra';

const withNextra = nextra({
  contentDirBasePath: '/',
  defaultShowCopyCode: true,
  staticImage: true,
  unstable_shouldAddLocaleToLinks: true,
})

export default withNextra({
  i18n: {
    locales: ['nb', 'en'],
    defaultLocale: 'nb',
  },
  redirects: async () => {
    return [
      {
        source: '/',
        destination: '/nb',
        permanent: false,
      },
    ]
  },
  transpilePackages: ['assets'],
})
