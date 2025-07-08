import nextra from 'nextra';

const withNextra = nextra({
  contentDirBasePath: '/',
  defaultShowCopyCode: true,
  staticImage: true,
})

export default withNextra({
  transpilePackages: ['assets']
})