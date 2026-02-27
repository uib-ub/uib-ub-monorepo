import type { Metadata } from 'next';
import { Open_Sans, EB_Garamond } from 'next/font/google';
import { RootProvider } from 'fumadocs-ui/provider/next';
import './globals.css';
import { CloverI18nProvider } from '@/lib/clover-i18n';

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
    <html lang='nb' suppressHydrationWarning>
      <body
        className={`${openSans.variable} ${garamond.variable} antialiased`}
      >
        <CloverI18nProvider />
        <RootProvider>{children}</RootProvider>
      </body>
    </html>
  );
}

