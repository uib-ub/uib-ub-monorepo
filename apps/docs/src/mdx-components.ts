import { useMDXComponents as getDocsMDXComponents } from 'nextra-theme-docs'
import { Pre, withIcons, Cards } from 'nextra/components'
import Image from 'next/image'
import { GitHubIcon } from 'nextra/icons'

const docsComponents = getDocsMDXComponents({
  pre: withIcons(Pre, { js: GitHubIcon }),
  Cards,
  Image
})

export const useMDXComponents = <T>(
  components?: T
) => ({
  ...docsComponents,
  ...components
})