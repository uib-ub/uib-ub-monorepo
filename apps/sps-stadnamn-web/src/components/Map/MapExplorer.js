'use client'
import { useEffect, useState, useRef } from 'react';
import Map from './Map'
import { useSearchParams, usePathname, useRouter } from 'next/navigation'
import 'leaflet/dist/leaflet.css';
import { queryStringWithout } from '@/lib/search-params'

const DEFAULT_CENTER = [60.3913, 5.3221];
const DEFAULT_ZOOM = 5;

export default function MapExplorer(props) {

  const [markers, setMarkers] = useState([]);
  const mapRef = useRef(null);
  const [bounds, setBounds] = useState(null);
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const router = useRouter();
  const mapQueryString = queryStringWithout(["document", "size", "page"])

  const documentUrl = (uuid) => {
    const params = new URLSearchParams(searchParams)
    params.set('document', String(uuid))
    return pathname + "?" + params.toString()
  }

  const onMapLoaded = (mapInstance) => {
    setBounds(mapInstance.target.getBounds());
  };

  useEffect(() => {
    if (mapRef.current) {
        if (props.mapBounds.length) {
            mapRef.current.fitBounds(props.mapBounds, {maxZoom: 8})
        }
      //mapRef.current.setView(props.center || DEFAULT_CENTER, props.bounds.length ? mapRef.current.getBoundsZoom(props.bounds) : DEFAULT_ZOOM);
    }
  }, [mapRef.current, props.center, props.mapBounds]);

  useEffect(() => {
    // Check if the map is initialized
    if (mapRef.current) {
      
      // Update the bounds state when the map's view changes
      mapRef.current.on('moveend', () => {
        const newBounds = mapRef.current.getBounds();
        setBounds(newBounds);
      });
    }
  }, [mapRef.current]);


  useEffect(() => {
    // Check if the bounds are initialized
    if (bounds) {
      // Fetch data based on the new bounds
      const params = mapQueryString
      const query = `/api/geo?dataset=hord&${ params? 
                                             params + "&" : "" 
                                            }topLeftLat=${
                                              bounds.getNorthEast().lat
                                            }&topLeftLng=${
                                              bounds.getSouthWest().lng
                                            }&bottomRightLat=${
                                              bounds.getSouthWest().lat
                                            }&bottomRightLng=${
                                              bounds.getNorthEast().lng
                                            }`

      fetch(query, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },

      })
      .then(response => response.json())
      .then(data => {

        setMarkers(data.hits.hits)})

      .catch(error => console.error('Error:', error));
    }
  }, [bounds, mapQueryString]);



  return (
    <Map mapRef={mapRef} whenReady={onMapLoaded} zoom={DEFAULT_ZOOM} center={DEFAULT_CENTER} className='w-full aspect-square md:aspec-auto md:h-full'>
            {({ TileLayer, CircleMarker, Marker }, leaflet) => (
                <>
          
            <TileLayer
              key="map_topo4"
              url="https://opencache{s}.statkart.no/gatekeeper/gk/gk.open_gmaps?layers=topo4&zoom={z}&x={x}&y={y}"
              attribution="<a href='http://www.kartverket.no/'>Kartverket</a>"
              subdomains={['', '2', '3']} 
            />
            
            {markers.map((marker, index) => (
              <CircleMarker role="button" circleClick={() => {
                console.log("CLICKED")
                router.push(documentUrl(props.doc._id))

              } } pathOptions={{color:'white', weight: 2, opacity: 1, fillColor: 'black', fillOpacity: 1}}
                            key={index} center={[marker.fields.location[0].coordinates[1], marker.fields.location[0].coordinates[0]]} radius={7}>


              </CircleMarker>
                
            ))}
            {props.doc?.location ? <Marker className="text-primary-600 bg-primary-600" icon={new leaflet.icon({iconUrl: '/marker.svg', iconSize: [48, 48], iconAnchor: [24, 48]})}
                            key={props.doc._id} position={[props.doc.location.coordinates[1], props.doc.location.coordinates[0]]}>

              </Marker> : null}
            </>
            )}
    </Map>
  )
}

