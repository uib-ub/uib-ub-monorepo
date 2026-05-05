
import type { Metadata } from 'next';
import { Open_Sans, EB_Garamond } from 'next/font/google';
import { RootProvider } from 'fumadocs-ui/provider/next';
import { CloverI18nProvider } from '@/lib/clover-i18n';
import { PaletteProvider } from '@/components/theme/palette-provider';
import { TailwindIndicator } from '@/components/tailwind-indicator';
import { PaletteSwitcher } from '@/components/theme/palette-switcher';

import "../../(fuma)/globals.css";

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
        className={`${openSans.variable} ${garamond.variable} antialiased min-h-screen @container/body`}
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

