import { remarkMermaid } from 'remark-mermaid-nextra';
import nextra from 'nextra';

const withNextra = nextra({
  theme: 'nextra-theme-docs',
  themeConfig: './theme.config.tsx',
  mdxOptions: {
    remarkPlugins: [remarkMermaid],
  }
})

export default withNextra({
  transpilePackages: ['tailwind-ui']
})