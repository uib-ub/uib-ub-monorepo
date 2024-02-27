'use client'
import { useEffect, useState, useCallback } from 'react';
import Map from './Map'
import { useSearchParams, usePathname, useRouter, useParams } from 'next/navigation'
import 'leaflet/dist/leaflet.css';
import { useQueryStringWithout } from '@/lib/search-params'
import IconButton  from '@/components/ui/icon-button'
import { PiInfoFill } from 'react-icons/pi'

const DEFAULT_CENTER = [60.3913, 5.3221];
const DEFAULT_ZOOM = 5;

export default function MapExplorer(props) {
  const [markers, setMarkers] = useState([]);
  const [mapInstance, setMapInstance] = useState(null);
  const [bounds, setBounds] = useState(null);
  const [zoom, setZoom] = useState(DEFAULT_ZOOM);

  console.log(props.docs)
  
  const searchParams = useSearchParams()
  const params = useParams()
  const router = useRouter()
  const pathname = usePathname()
  const mapQueryString = useQueryStringWithout(["docs", "view", "manifest", "size", "page", "sort"])
  const mapRef = useCallback(node => {
    if (node !== null) {
      node.on('moveend', () => {
        setBounds(node.getBounds());
        setZoom(node.getZoom());

      });
      setMapInstance(node);
      setBounds(node.getBounds());
      setZoom(node.getZoom());
    }
  }, []);
  


  function groupMarkers(markers) {
    const grouped = {};

    markers.forEach(marker => {
      const lat = marker.fields.location[0].coordinates[1];
      const lon = marker.fields.location[0].coordinates[0];
      const key = `${lat},${lon}`;

      if (!grouped[key]) {
        grouped[key] = { lat, lon, hits: [] };
      }
      grouped[key].hits.push({id: marker._id, label: marker.fields.label});
    });
  
    return Object.values(grouped);
  }



  const documentUrl = (uuid) => {
    const params = new URLSearchParams(searchParams)
    params.set('docs', String(uuid))
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
        
        const markers = groupMarkers(data.hits.hits);
        setMarkers(markers)})
        

      .catch(error => console.error('Error:', error));
    }
  }, [bounds, mapQueryString, params.dataset]);

  useEffect(() => {
    if (props.docs?.[0].location && mapInstance) {
      const { coordinates } = props.docs[0].location;
      const latLng = L.latLng(coordinates[1], coordinates[0]);
      if (!mapInstance.getBounds().contains(latLng)) {
        mapInstance.setView(latLng, 8);
      }
    }
  }, [props.docs, mapInstance]);

  /*
   <Popup minWidth={256} maxWidth={300}>
                    
              <PopupInfo uuids={marker.hits.map(item => item.id)} />
                  

            </Popup>

  */


  return (
    <Map mapRef={mapRef} zoom={DEFAULT_ZOOM} center={DEFAULT_CENTER} className='w-full aspect-square lg:aspect-auto lg:h-full'>
            {({ TileLayer, CircleMarker, Marker, Popup, Tooltip }, leaflet) => (
                <>
          
            <TileLayer
              key="map_topo4"
              url="https://opencache{s}.statkart.no/gatekeeper/gk/gk.open_gmaps?layers=topo4&zoom={z}&x={x}&y={y}"
              attribution="<a href='http://www.kartverket.no/'>Kartverket</a>"
              subdomains={['', '2', '3']} 
            />
            
            {markers.map(marker => (
              <CircleMarker role="button" 
                            pathOptions={{color:'white', weight: 2, opacity: 1, fillColor: 'black', fillOpacity: 1}}
                            key={`${marker.lat} ${marker.lon} ${marker.hits.length}${(zoom > 14 || props.resultCount < 20) && markers.length < 100  ? 'labeled' : ''}`} 
                            center={[marker.lat, marker.lon]} 
                            radius={marker.hits.length == 1 ? 8 : marker.hits.length == 1 && 9 || marker.hits.length < 4 && 10 || marker.hits.length >= 4 && 12}
                            eventHandlers={{click: () => {
                              router.push(documentUrl(marker.hits.map(item => item.id).join(",")))
                            },
                                    }}>
                  
                    {  (zoom > 14 || props.resultCount < 20) && markers.length < 100 ? <Tooltip className="!text-black !text-lg !border-0 !shadow-none !bg-white !font-semibold !bg-opacity-75 !rounded-full !px-3 !pt-0 !pb-0 !mt-3 before:hidden" direction="bottom" permanent={true}>
                      {marker.hits[0].label}{marker.hits.length > 1 ? `...` : ''}

                      </Tooltip>  : null}

                  

              </CircleMarker>
            ))}
            
           
            {props.docs?.[0]?._source?.location ? ( <Marker className="text-primary-600 bg-primary-600" icon={new leaflet.icon({iconUrl: '/marker.svg', iconSize: [48, 48], iconAnchor: [24, 48]})}
                            key={props.docs[0]._id} position={[props.docs[0]._source.location.coordinates[1], props.docs[0]._source.location.coordinates[0]]}>


              <Popup minWidth={256} maxWidth={300} keepInView={true}>
                                    
              <ul className="flex flex-col">

                {  props.docs.map(doc => (
                    <li key={doc._id} className='flex text-lg justify-between align-middle'>
                        <strong className="">{doc._source.label}</strong>
                        <span>
                        <IconButton label="Infoside"><PiInfoFill className='text-2xl text-primary-600'/></IconButton>
                        </span>

                    </li>
                    
                    )) }
                    
                    
                    
                </ul>
                    
              </Popup>

              </Marker> )
              : null}
              
              
            </>
            )}
    </Map>
  )
}

