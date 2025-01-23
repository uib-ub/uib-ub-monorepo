import { getImageDimensions } from '@sanity/asset-utils';
import Image from "next/image";

interface SanityImageProps {
  image: any;
  priority?: boolean;
  className?: string;
}

export default function SanityImage(props: SanityImageProps) {
  const { image: source, priority, className } = props;
  const alt = source?.alt ?? "An image without an alt, whoops";

  if (!source?.asset) {
    return <div className="bg-zinc-400 dark:bg-zinc-800" />;
  }

  const dimensions = getImageDimensions(source);

  return (
    <div className={`relative w-full ${className}`} style={{ aspectRatio: `${dimensions.width} / ${dimensions.height}` }}>
      <Image
        src={source.asset.url}
        alt={alt}
        fill
        placeholder="blur"
        blurDataURL={source.asset.metadata.lqip}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 40vw"
        priority={priority}
        className="object-contain"
      />
    </div>
  );
}
