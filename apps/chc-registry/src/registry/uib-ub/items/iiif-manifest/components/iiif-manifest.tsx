'use client';

import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

export const IIIFManifestSkeleton = () => (
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
    loading: IIIFManifestSkeleton,
  },
);

const customTheme = {
  colors: {
    /**
     * Black and dark grays in a light theme.
     * All must contrast to 4.5 or greater with `secondary`.
     */
    primary: "var(--color-neutral-800)",
    primaryMuted: "var(--color-neutral-600)",
    primaryAlt: "var(--color-neutral-700)",

    /**
     * Key brand color(s).
     * `accent` must contrast to 4.5 or greater with `secondary`.
     */
    accent: "var(--color-red-600)",
    accentMuted: "var(--color-red-400)",
    accentAlt: "var(--color-red-500)",

    /**
     * White and light grays in a light theme.
     * All must must contrast to 4.5 or greater with `primary` and  `accent`.
     */
    secondary: "var(--color-neutral-100)",
    secondaryMuted: "var(--color-neutral-200)",
    secondaryAlt: "var(--color-neutral-300)",
  },
  fonts: {
    sans: "'Open Sans', sans-serif",
    display: "Optima, Georgia, Arial, sans-serif",
  },
};

const options = {
  canvasHeight: 'auto',
  showIIIFBadge: false,
  customLoadingComponent: () => (
    <IIIFManifestSkeleton />
  ),
};

export const IIIFManifest = ({ iiifContent }: { iiifContent: string | Record<string, unknown> }) => {
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