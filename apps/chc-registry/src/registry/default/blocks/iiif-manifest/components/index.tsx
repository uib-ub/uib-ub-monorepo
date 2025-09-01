'use client';

import dynamic from 'next/dynamic';

const Viewer = dynamic(
  () => import('@samvera/clover-iiif/viewer').then((Clover) => Clover.default),
  {
    ssr: false,
  },
);

const customTheme = {
  colors: {
    /**
     * Black and dark grays in a light theme.
     * All must contrast to 4.5 or greater with `secondary`.
     */
    primary: "var(--color-core-600)",
    primaryMuted: "var(--color-core-700)",
    primaryAlt: "var(--color-core-800)",

    /**
     * Key brand color(s).
     * `accent` must contrast to 4.5 or greater with `secondary`.
     */
    accent: "var(--color-core-500)",
    accentMuted: "var(--color-core-400)",
    accentAlt: "var(--color-core-600)",

    /**
     * White and light grays in a light theme.
     * All must must contrast to 4.5 or greater with `primary` and  `accent`.
     */
    secondary: "var(--color-white)",
    secondaryMuted: "var(--color-core-100)",
    secondaryAlt: "var(--color-core-200)",
  },
  fonts: {
    sans: "'Open Sans', sans-serif",
    display: "Optima, Georgia, Arial, sans-serif",
  },
};

const options = {
  canvasHeight: 'auto',
  showIIIFBadge: false,
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