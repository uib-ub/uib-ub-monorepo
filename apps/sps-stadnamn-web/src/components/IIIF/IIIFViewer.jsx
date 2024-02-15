import dynamic from 'next/dynamic';

const DynamicIIIFViewer = dynamic(() => import('./DynamicIIIFViewer'), {
  ssr: false
});


const IIIFViewer = (props) => {
  return (
      <DynamicIIIFViewer {...props} />
  )
}

export default IIIFViewer;