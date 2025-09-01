import * as React from 'react';
import { DocsLayout } from 'fumadocs-ui/layouts/notebook';
import { source } from '@/lib/source';
import { baseOptions } from '@/lib/layout.shared';

export default function Layout({ children }: { children: React.ReactNode }) {
  return <DocsLayout tree={source.pageTree} {...baseOptions()}>{children}</DocsLayout>
}
