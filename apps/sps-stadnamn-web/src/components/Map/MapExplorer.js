'use client'
import { useEffect, useState, useCallback } from 'react';
import Map from './Map'
import { useSearchParams, usePathname, useRouter, useParams } from 'next/navigation'
import 'leaflet/dist/leaflet.css';
import { useQueryStringWithout } from '@/lib/search-params'

const DEFAULT_CENTER = [60.3913, 5.3221];
const DEFAULT_ZOOM = 5;

export default function MapExplorer(props) {

  const [markers, setMarkers] = useState([]);
  const [mapInstance, setMapInstance] = useState(null);
  const mapRef = useCallback(node => {
    if (node !== null) {
      node.on('moveend', () => {
        setBounds(node.getBounds());
      });
      setMapInstance(node);
      setBounds(node.getBounds());
    }
  }, []);
  const [bounds, setBounds] = useState(null);
  const searchParams = useSearchParams()
  const params = useParams()
  const pathname = usePathname()
  const router = useRouter();
  const mapQueryString = useQueryStringWithout(["document", "view", "manifest", "size", "page", "sort"])

  const documentUrl = (uuid) => {
    const params = new URLSearchParams(searchParams)
    params.set('document', String(uuid))
    return pathname + "?" + params.toString()
  }

  useEffect(() => {
    if (mapInstance && props.mapBounds.length) {
      mapInstance.fitBounds(props.mapBounds, {maxZoom: 8})
    }
  }, [props.mapBounds, props.center, mapInstance]);


  useEffect(() => {
    // Check if the bounds are initialized
    if (bounds) {
      // Fetch data based on the new bounds
      const queryParams = mapQueryString
      const query = `/api/geo?dataset=${params.dataset}&${ queryParams? 
                                            queryParams + "&" : "" 
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
  }, [bounds, mapQueryString, params.dataset]);



  return (
    <Map mapRef={mapRef} zoom={DEFAULT_ZOOM} center={DEFAULT_CENTER} className='w-full aspect-square lg:aspect-auto lg:h-full'>
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

