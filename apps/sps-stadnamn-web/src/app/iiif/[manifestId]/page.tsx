
'use client'
import dynamic from 'next/dynamic';

const DynamicImageViewer = dynamic(() => import('@/components/image-viewer/dynamic-image-viewer'), {
  ssr: false
});


const ImageViewer = (props: any) => {
  return (
    <div className="bg-white h-full w-full">
      <DynamicImageViewer {...props} />
    </div>
  )
}

export default ImageViewer;