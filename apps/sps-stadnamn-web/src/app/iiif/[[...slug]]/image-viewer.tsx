
'use client'
import dynamic from 'next/dynamic';

const DynamicImageViewer = dynamic(() => import('@/components/image-viewer/dynamic-image-viewer'), {
  ssr: false
});


const ImageViewer = ({images, manifestDataset, manifestId}: {images: Record<string, any>[], manifestDataset: string, manifestId: string}) => {
  return (
    <div className="w-screen h-[calc(100svh-3.5rem)] lg:w-full lg:h-full">
        <DynamicImageViewer images={images} manifestDataset={manifestDataset} manifestId={manifestId} />
    </div>
  )
}

export default ImageViewer;