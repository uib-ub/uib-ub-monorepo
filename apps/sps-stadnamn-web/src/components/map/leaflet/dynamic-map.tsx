import Leaflet from 'leaflet';
import * as ReactLeaflet from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import React from 'react';

const { MapContainer } = ReactLeaflet;

const DynamicMap = ({ children, mapRef, ...rest }: any) => {

  return (
    <MapContainer ref={mapRef} {...rest}>
      {children(ReactLeaflet, Leaflet)}
    </MapContainer>
  )
}

export default DynamicMap;
