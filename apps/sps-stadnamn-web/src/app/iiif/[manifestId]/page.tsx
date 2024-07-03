
'use client'
import dynamic from 'next/dynamic';

const DynamicImageViewer = dynamic(() => import('@/components/DynamicImageViewer'), {
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