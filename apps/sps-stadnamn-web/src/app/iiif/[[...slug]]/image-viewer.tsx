
'use client'
import dynamic from 'next/dynamic';

const DynamicImageViewer = dynamic(() => import('@/components/image-viewer/dynamic-image-viewer'), {
  ssr: false
});


const ImageViewer = ({canvases, manifestDataset, manifestId}: {canvases: Record<string, any>[], manifestDataset: string, manifestId: string}) => {
  return (
    <div className="h-full w-full">
        <DynamicImageViewer canvases={canvases} manifestDataset={manifestDataset} manifestId={manifestId} />
    </div>
  )
}

export default ImageViewer;