import Image, { ImageProps } from "next/image";
import { imageClient } from "../../lib/sanity.image";
import { useNextSanityImage } from "next-sanity-image";

interface SanityImage {
  _type: string;
  asset: {
    _ref: string;
    _type: "reference";
    metadata: any
  };
  caption: string;
}

type ImagePropsWithoutSrc = Omit<ImageProps, "src">;

type SanityImageProps = {
  image: SanityImage;
  type?: string
} & ImagePropsWithoutSrc;

export default function SanityImage({
  image,
  type = 'responsive',
  alt = '',
  placeholder = 'blur',
  style = {
    objectFit: 'contain'
  },
  className
}: SanityImageProps) {
  const imageProps = useNextSanityImage(imageClient, image);

  if (type === 'fill') {
    return (
      <Image
        src={imageProps.src}
        loader={imageProps.loader}
        className={className}
        alt={alt}
        fill
        sizes='(max-width: 768px) 100vw,
              (max-width: 1200px) 50vw,
              33vw'
        style={style}
      />

    )
  }

  return (
    <Image
      {...imageProps}
      className={className}
      style={{ width: '100%', height: 'auto' }}
      alt={alt}
      placeholder={placeholder}
      blurDataURL={image?.asset.metadata.lqip}
    />
  );
}