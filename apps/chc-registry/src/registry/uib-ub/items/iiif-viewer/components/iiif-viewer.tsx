'use client';

import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

export const IIIFViewerSkeleton = () => (
  <div className='absolute inset-0 flex items-center justify-center'>
    <Skeleton className='flex items-center justify-center w-full h-full fade-in'>
      Loading...
    </Skeleton>
  </div>
);

const Viewer = dynamic(
  () => import('@samvera/clover-iiif/viewer').then((Clover) => Clover.default),
  {
    ssr: false,
    loading: IIIFViewerSkeleton,
  },
);

const customTheme = {
  colors: {
    /**
     * Black and dark grays in a light theme.
     * All must contrast to 4.5 or greater with `secondary`.
     */
    primary: "var(--color-bg-6)",
    primaryMuted: "var(--color-bg-4)",
    primaryAlt: "var(--color-bg-5)",

    /**
     * Key brand color(s).
     * `accent` must contrast to 4.5 or greater with `secondary`.
     */
    accent: "var(--color-fg-4)",
    accentMuted: "var(--color-fg-2)",
    accentAlt: "var(--color-fg-3)",

    /**
     * White and light grays in a light theme.
     * All must must contrast to 4.5 or greater with `primary` and  `accent`.
     */
    secondary: "var(--color-neutral-50)",
    secondaryMuted: "var(--color-neutral-200)",
    secondaryAlt: "var(--color-neutral-300)",
  },
  fonts: {
    sans: "'Myriad Pro', 'Open Sans', sans-serif",
    display: "'EB Garamond', Georgia, serif",
  },
};

const options = {
  canvasHeight: 'auto',
  showIIIFBadge: false,
  customLoadingComponent: () => (
    <IIIFViewerSkeleton />
  ),
};

export const IIIFViewer = ({ iiifContent }: { iiifContent: string }) => {
  return (
    <div className='relative h-[70vh] w-full z-0'>
      <Viewer
        iiifContent={iiifContent}
        customTheme={customTheme}
        options={options}
      />
    </div>
  );
};