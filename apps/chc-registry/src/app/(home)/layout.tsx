import { HomeLayout } from 'fumadocs-ui/layouts/home';
import { baseOptions } from '@/lib/layout.shared';
import { ReactNode } from 'react';

export default function Layout({ children }: { children: ReactNode }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return <HomeLayout {...baseOptions()}>{children as any}</HomeLayout>;
}
