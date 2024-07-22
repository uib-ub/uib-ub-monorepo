'use client'
import { useEffect, useRef } from 'react';
import Map from './Map'
import 'leaflet/dist/leaflet.css';
import { backgroundMap, baseMapProps, baseMapKeys } from '@/config/basemap-config'

export default function EmbeddedMap(props) {

  const mapRef = useRef(null);

  useEffect(() => {
    if (mapRef.current && props.doc?.location) {
      const { coordinates } = props.doc.location;
      const newCenter = [coordinates[1], coordinates[0]];
      mapRef.current.setView(newCenter);
    }
  }, [props.doc]);


  return (
    <Map mapRef={mapRef} zoom={8} center={[props.doc.location.coordinates[1], props.doc.location.coordinates[0]]} className="aspect-square max-w-xl lg:aspect-video">
            {({ TileLayer, Marker }, leaflet) => (
                <>
          
          <TileLayer {...backgroundMap} />
          <TileLayer {...baseMapProps[localStorage.getItem('baseLayer') || baseMapKeys[0]]} />
            
            {props.doc?.location ? <Marker className="text-primary-600 bg-primary-600" icon={new leaflet.icon({iconUrl: '/markerAccent.svg', iconSize: [48, 48], iconAnchor: [24, 48]})}
                            key={props.doc.uuid} position={[props.doc.location.coordinates[1], props.doc.location.coordinates[0]]}>

              </Marker> : null}
            </>
            )}
    </Map>
  )
}

