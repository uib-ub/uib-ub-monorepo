import dynamic from 'next/dynamic';

const DynamicMap = dynamic(() => import('./dynamic-map'), {
  ssr: false
});


const Map = (props) => {
  return (
      <DynamicMap {...props} />
  )
}

export default Map;