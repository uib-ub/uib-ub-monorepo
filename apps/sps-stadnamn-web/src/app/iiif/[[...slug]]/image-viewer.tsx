
'use client'
import dynamic from 'next/dynamic';

const DynamicImageViewer = dynamic(() => import('@/components/image-viewer/dynamic-image-viewer'), {
  ssr: false
});


const ImageViewer = ({canvases, manifestDataset}: {canvases: Record<string, any>[], manifestDataset: string}) => {
  return (
    <div className="h-full w-full">
        <DynamicImageViewer canvases={canvases} manifestDataset={manifestDataset} />
    </div>
  )
}

export default ImageViewer;