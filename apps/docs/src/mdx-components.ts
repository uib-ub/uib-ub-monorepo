import { useMDXComponents as getDocsMDXComponents } from 'nextra-theme-docs'
import { Pre, withIcons, Cards, FileTree } from 'nextra/components'
import Image from 'next/image'
import { GitHubIcon } from 'nextra/icons'

const docsComponents = getDocsMDXComponents({
  pre: withIcons(Pre, { js: GitHubIcon }),
  Cards,
  Image,
  FileTree
})

export const useMDXComponents = <T>(
  components?: T
) => ({
  ...docsComponents,
  ...components
})