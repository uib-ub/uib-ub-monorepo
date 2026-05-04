
import type { Metadata } from 'next';
import { Open_Sans, EB_Garamond } from 'next/font/google';
import localFont from 'next/font/local'
import { RootProvider } from 'fumadocs-ui/provider/next';
import { CloverI18nProvider } from '@/lib/clover-i18n';
import { PaletteProvider } from '@/components/theme/palette-provider';
import { TailwindIndicator } from '@/components/tailwind-indicator';
import { PaletteSwitcher } from '@/components/theme/palette-switcher';

import "../../(fuma)/globals.css";

const myriadPro = localFont({
  src: [
    {
      path: '../../../../public/fonts/MyriadPro/MyriadPro-Regular.otf',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../../../../public/fonts/MyriadPro/MyriadPro-It.otf',
      weight: '400',
      style: 'italic',
    },
    {
      path: '../../../../public/fonts/MyriadPro/MyriadPro-SemiBold.otf',
      weight: '600',
      style: 'normal',
    }
  ],
})

const openSans = Open_Sans({
  variable: '--font-open-sans',
  subsets: ['latin'],
});

const garamond = EB_Garamond({
  variable: '--font-garamond',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'CHC Registry',
  description: 'CHC Registry is a collection of UI primitives, components and blocks for use in CHC applications.',
};

export default function Layout({ children }: LayoutProps<'/'>) {
  return (
    <html lang='en' suppressHydrationWarning>
      <body
        className={`${myriadPro.className} ${openSans.className} ${garamond.className}  antialiased min-h-screen @container/body`}
      >
        <CloverI18nProvider />
        <PaletteProvider>
          <RootProvider>
            {children}
            <TailwindIndicator />
            <PaletteSwitcher />
          </RootProvider>
        </PaletteProvider>
      </body>
    </html>
  );
}

