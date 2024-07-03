
'use client'
import dynamic from 'next/dynamic';

const DynamicImageViewer = dynamic(() => import('@/components/DynamicImageViewer'), {
  ssr: false
});


const ImageViewer = (props: any) => {
  return (
      <DynamicImageViewer {...props} />
  )
}

export default ImageViewer;