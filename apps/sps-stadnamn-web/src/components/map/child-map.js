'use client'
import { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, usePathname, useRouter, useSearchParams } from 'next/navigation'
import Map from './map'
import 'leaflet/dist/leaflet.css';
import PopupList from './popup-list';
import { baseMapKeys, baseMapProps } from '@/config/basemap-config'
import Spinner from '../svg/Spinner';


export default function ChildMap(props) {


  const [markers, setMarkers] = useState([])
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const params = useParams()
  const [leafletBounds, setLeafletBounds] = useState(null);
  const { uuid } = props.doc
  const mapInstance = useRef(null);
  const [baseLayer, setBaseLayer] = useState(null)
  

  const mapRef = useCallback(node => {
    if (node !== null) {
      mapInstance.current = node;
    }
  }, []);


  const coordinateUrl = (lat, lon) => {
    const params = new URLSearchParams(searchParams)
    params.set('popup', lat + "," + lon)
    return pathname + "?" + params.toString()
  }




  function groupMarkers(markers) {
    const grouped = {};

    markers.forEach(marker => {
      const lat = marker._source.location?.coordinates[1];
      const lon = marker._source.location?.coordinates[0];
      const key = `${lat},${lon}`;
      if (lat && lon) {
      if (!grouped[key]) {
        grouped[key] = { lat, lon, hits: [] };
      }
        grouped[key].hits.push(marker);
      }
      
    });

    return Object.values(grouped);
  }

 /*

  useEffect(() => {
    if (leafletBounds && mapInstance.current) {
      mapInstance.current.fitBounds(leafletBounds, {padding: [100, 100], maxZoom: 11});
    }
  }, [leafletBounds, isMapInstanceReady])

  */


  useEffect(() => {
    fetch(`/api/children?${props.doc.snid ? 'snid=' + props.doc.snid : 'uuid=' + props.doc.uuid }&geo=true`)
    .then(response => response.json())
    .then(data => {

      setBaseLayer(localStorage?.getItem('baseLayer') && baseMapProps[localStorage.getItem('baseLayer')] || baseMapProps[baseMapKeys[0]])

    const markers = groupMarkers(data.hits.hits);
    setMarkers(markers)
    if (data.aggregations.viewport) {
      const bounds = data.aggregations.viewport.bounds
      setLeafletBounds([
        [bounds.bottom_right.lat, bounds.top_left.lon], // SouthWest (lat, lon)
        [bounds.top_left.lat, bounds.bottom_right.lon]  // NorthEast (lat, lon)
      ])

    }
    
    }
    ).catch(error => console.error(error))

}, [uuid, props.doc.snid, props.doc.uuid])


  return  (
    <div className="bg-neutral-100 h-full w-full">
    { leafletBounds && props.doc.location.coordinates[1] && baseLayer ?
    
    
    <Map mapRef={mapRef} className="w-full h-full" bounds={leafletBounds} center={[props.doc.location.coordinates[1], props.doc.location.coordinates[0]]}>
            {({ TileLayer, Marker, Tooltip, Popup }, leaflet) => (
                <>
          
            <TileLayer {...baseLayer} />
            
            

              { markers.map((marker, idx) => {
                const highlighted = searchParams.get('popup') == marker.lat + "," + marker.lon
                
                return (
              <Marker key={idx} 
                      icon={new leaflet.divIcon({className: highlighted ? 'count-marker-highlight' : 'count-marker', html: `<img aria-hidden="true" src="/marker${highlighted ? 'Accent' : 'Primary'}Fill.svg"/><span>${marker.hits.length}</span>`})}
                      position={[marker.lat, marker.lon]}
                      eventHandlers={{click: () => {
                        router.push(coordinateUrl(marker.lat, marker.lon), { scroll: false})
                      }}}>

                      
                     { false && searchParams.get('popup') == marker.lat + "," + marker.lon ? <Tooltip className='!text-white !border-0 !shadow-none !bg-transparent !font-semibold !p-0 !m-0 before:hidden'
                             permanent={true}
                             direction="top"
                             offset={[0, -10]}>{marker.hits.length} {searchParams.get('popup') != marker.lat + "," + marker.lon  }</Tooltip>

                    : false && <Tooltip className='!text-white !border-0 !shadow-none !bg-transparent !font-semibold !p-0 !m-0 before:hidden'
                                permanent={true}
                                direction="top"
                                offset={[0, -12]}>{marker.hits.length}{searchParams.get('popup') != marker.lat + "," + marker.lon}</Tooltip>
                  
                  }

              <Popup minWidth={256} maxWidth={300} autoPan={false} open={highlighted ? true : false}>
                  <div className="max-h-64 overflow-y-auto"><PopupList docs={marker.hits} view={params.dataset} /></div>
              </Popup>

            </Marker>
            
            )})}


            </>
            )}
    </Map>
    : <div className="w-full h-full flex items-center justify-center"><Spinner status="Laster inn treff" className="w-20 h-20"/></div>}

    </div>
  )
}

