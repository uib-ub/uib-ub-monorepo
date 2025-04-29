
'use client'
import dynamic from 'next/dynamic';

const DynamicImageViewer = dynamic(() => import('@/components/image-viewer/dynamic-image-viewer'), {
  ssr: false
});


const ImageViewer = ({images, manifestDataset, manifestId}: {images: Record<string, any>[], manifestDataset: string, manifestId: string}) => {
  return (
    <div className="h-full w-full">
        <DynamicImageViewer images={images} manifestDataset={manifestDataset} manifestId={manifestId} />
    </div>
  )
}

export default ImageViewer;