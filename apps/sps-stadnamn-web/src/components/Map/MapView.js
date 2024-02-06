'use client'
import { useEffect, useState, useRef } from 'react';
import Map from './Map'
import { useSearchParams, usePathname, useRouter } from 'next/navigation'
import 'leaflet/dist/leaflet.css';
import { queryStringWithout } from '@/lib/search-params'

export default function MapExplorer(props) {

  const mapRef = useRef(null);

  useEffect(() => {
    if (mapRef.current && props.doc?.location) {
      const { coordinates } = props.doc.location;
      const newCenter = [coordinates[1], coordinates[0]];
      mapRef.current.setView(newCenter);
    }
  }, [props.doc]);


  return (
    <Map mapRef={mapRef} zoom={8} center={[props.doc.location.coordinates[1], props.doc.location.coordinates[0]]} className="w-[480px] h-[480px]">
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

