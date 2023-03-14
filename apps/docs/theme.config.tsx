import { UiBIcon } from '@components/UiBIcon';
import { useRouter } from 'next/router';
import type { DocsThemeConfig } from 'nextra-theme-docs'
import { UIBUBLeftEngLogo } from 'tailwind-ui';

// eslint-disable-next-line import/no-anonymous-default-export
export default {
  docsRepositoryBase: 'https://github.com/uib-ub/uib-ub-monorepo',
  logo:
    <div style={{ display: 'flex', gap: '.5em' }}>
      <UiBIcon className='fill-current' style={{ width: '1.5em', height: '1.5em' }} />
      <span>Dev @ UiB-UB</span>
    </div>,
  project: {
    link: 'https://github.com/uib-ub/uib-ub-monorepo',
  },
  useNextSeoProps() {
    const { asPath } = useRouter()
    if (asPath !== '/') {
      return {
        titleTemplate: '%s – UiB-UB'
      }
    }
  },
  head: (
    <>
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta property="og:title" content="Dev @ UiB-UB" />
      <meta property="og:description" content="Resources for developers using data and services from The university of Bergen Library." />
      <link rel="icon" href="/favicon.svg" />
    </>
  ),
  footer: {
    text:
      <div style={{ display: 'flex', gap: '.5em', alignItems: 'center' }}>
        <UIBUBLeftEngLogo className='fill-current' style={{ width: '25em', height: 'auto' }} />
        {/* <span>University of Bergen Library</span> */}
      </div>
  }
} as DocsThemeConfig

