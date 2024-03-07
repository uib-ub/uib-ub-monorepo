import type { MDXComponents } from 'mdx/types'
 
export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...components,
    main: ({ children }) => <main className='card'>{children}</main>,
  }
}