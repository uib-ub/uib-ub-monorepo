import { source } from '@/lib/source';
import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import { baseOptions } from '@/lib/layout.shared';
import { PaletteSwitcher } from '@/components/ui/palette-switcher';

export default function Layout({ children }: LayoutProps<'/docs'>) {
  return (
    <DocsLayout
      tree={source.pageTree}
      sidebar={{
        footer: <div className="items-center">
          <PaletteSwitcher />
        </div>,
      }}
      {...baseOptions()}
    >
      {children}
    </DocsLayout>
  );
}