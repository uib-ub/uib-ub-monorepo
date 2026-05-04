import { source } from '@/lib/source';
import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import { baseOptions } from '@/lib/layout.shared';
import { PaletteSwitcher } from '@/components/theme/palette-switcher';

export default function Layout({ children }: LayoutProps<'/docs'>) {
  return (
    <DocsLayout
      {...baseOptions()}
      tree={source.pageTree}
      sidebar={{
        footer: <div className="flex justify-end">
          <PaletteSwitcher />
        </div>,
      }}
    >
      {children}
    </ DocsLayout>
  );
}