'use client';

import dynamic from 'next/dynamic';
import { cn } from '@/lib/utils';

const Image = dynamic(
  () => import('@samvera/clover-iiif/image').then((Clover) => Clover.default),
  {
    ssr: false,
  },
);

const customTheme = {
  showNavigator: false,
  showHomeControl: true,
  showControlPanel: true,
  showZoomControl: true,
  showFullPageControl: true,
  showNavigationControl: true,
  showRotationControl: false,
};

export const IIIFImage = ({ src, className }: { src: string, className?: string }) => {
  return (
    <div className={cn('iiif-image-wrapper block w-full', className)}>
      <Image
        src={src}
        openSeadragonConfig={customTheme}
      />
    </div>
  );
};
