import type { Metadata } from 'next';
import { Open_Sans, EB_Garamond } from 'next/font/google';
import { RootProvider } from 'fumadocs-ui/provider';
import './globals.css';

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
        className={`${openSans.variable} ${garamond.variable} antialiased`}
      >
        <RootProvider>{children}</RootProvider>
      </body>
    </html>
  );
}
