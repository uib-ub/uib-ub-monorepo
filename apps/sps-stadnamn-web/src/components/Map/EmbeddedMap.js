'use client'
import { useEffect, useRef } from 'react';
import Map from './Map'
import 'leaflet/dist/leaflet.css';

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
    <Map mapRef={mapRef} zoom={8} center={[props.doc.location.coordinates[1], props.doc.location.coordinates[0]]} className="w-full aspect-square lg:aspect-video">
            {({ TileLayer, Marker }, leaflet) => (
                <>
          
            <TileLayer
              key="map_topo4"
              url="https://opencache{s}.statkart.no/gatekeeper/gk/gk.open_gmaps?layers=topo4&zoom={z}&x={x}&y={y}"
              attribution="<a href='http://www.kartverket.no/'>Kartverket</a>"
              subdomains={['', '2', '3']} 
            />
            
            {props.doc?.location ? <Marker className="text-primary-600 bg-primary-600" icon={new leaflet.icon({iconUrl: '/marker.svg', iconSize: [48, 48], iconAnchor: [24, 48]})}
                            key={props.doc._id} position={[props.doc.location.coordinates[1], props.doc.location.coordinates[0]]}>

              </Marker> : null}
            </>
            )}
    </Map>
  )
}

