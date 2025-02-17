
'use client'
import dynamic from 'next/dynamic';

const DynamicImageViewer = dynamic(() => import('@/components/image-viewer/dynamic-image-viewer'), {
  ssr: false
});


const ImageViewer = ({manifest}: {manifest: any}) => {
  return (
    <div className="h-full w-full">
        <DynamicImageViewer manifest={manifest} />
    </div>
  )
}

export default ImageViewer;