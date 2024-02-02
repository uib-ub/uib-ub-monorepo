'use client'
import Leaflet from 'leaflet';
import * as ReactLeaflet from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const { MapContainer } = ReactLeaflet;

const DynamicMap = ({ children, className, width, height, mapRef, onMapLoaded, ...rest }) => {

  return (
    <MapContainer ref={mapRef} whenReady={onMapLoaded} className='w-full aspect-square md:aspec-auto md:h-full' {...rest}>
      {children(ReactLeaflet, Leaflet)}
    </MapContainer>
  )
}

export default DynamicMap;
