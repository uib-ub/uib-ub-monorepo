import { urlForImage } from '@/sanity/lib/image'
import { SanityImageAssetDocument } from 'next-sanity'
import Image from 'next/image'

interface ImageBoxProps {
  image?: SanityImageAssetDocument
  alt?: string
  width?: number
  height?: number
  size?: string
  classesWrapper?: string
}

export default function ImageBox({
  image,
  alt = 'Cover image',
  width = 3500,
  height = 2000,
  size = '100vw',
  classesWrapper,
}: ImageBoxProps) {
  const imageUrl =
    image && urlForImage(image)?.height(height).width(width).fit('crop').url()

  return (
    <div
      className={`w-full overflow-hidden rounded-[3px] bg-gray-50 ${classesWrapper}`}
    >
      {imageUrl && (
        <Image
          className="absolute h-full w-full"
          alt={alt}
          width={width}
          height={height}
          sizes={size}
          src={imageUrl}
        />
      )}
    </div>
  )
}