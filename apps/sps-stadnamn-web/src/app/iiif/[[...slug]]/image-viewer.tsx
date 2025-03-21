
'use client'
import dynamic from 'next/dynamic';

const DynamicImageViewer = dynamic(() => import('@/components/image-viewer/dynamic-image-viewer'), {
  ssr: false
});


const ImageViewer = ({canvases}: {canvases: Record<string, any>[]}) => {
  return (
    <div className="h-full w-full">
        <DynamicImageViewer canvases={canvases} />
    </div>
  )
}

export default ImageViewer;