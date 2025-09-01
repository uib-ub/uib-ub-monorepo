'use client';

import dynamic from 'next/dynamic';

const Image = dynamic(
  () => import('@samvera/clover-iiif/image').then((Clover) => Clover.default),
  {
    ssr: false,
  },
);

const customTheme = {
  showNavigator: false,
  showHomeControl: false,
  showControlPanel: false,
  showZoomControl: false,
  showFullPageControl: false,
  showNavigationControl: false,
  showRotationControl: false,
};

export const IIIFImage = ({ src }: { src: string }) => {
  return (
    // eslint-disable-next-line jsx-a11y/alt-text
    <Image
      src={src}
      openSeadragonConfig={customTheme}
    />
  );
};
