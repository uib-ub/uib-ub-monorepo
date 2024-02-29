'use client'
import { useEffect, useState, useCallback, useRef } from 'react';
import Map from './Map'
import { useSearchParams, usePathname, useRouter, useParams } from 'next/navigation'
import 'leaflet/dist/leaflet.css';
import { useQueryStringWithout } from '@/lib/search-params'
import PopupList from './PopupList'
import { indexToCode } from '@/lib/datasets';
import { datasetTitles } from '@/config/client-config';
import Link from 'next/link';

const DEFAULT_CENTER = [60.3913, 5.3221];
const DEFAULT_ZOOM = 5;

export default function MapExplorer(props) {
  const [markers, setMarkers] = useState([]);
  const [mapInstance, setMapInstance] = useState(null);
  const [bounds, setBounds] = useState(null);
  const [zoom, setZoom] = useState(DEFAULT_ZOOM);
  const searchParams = useSearchParams()
  const params = useParams()
  const router = useRouter()
  const pathname = usePathname()
  const mapQueryString = useQueryStringWithout(["docs", "view", "manifest", "size", "page", "sort"])
  const controllerRef = useRef(new AbortController());
  const openPopup = useRef(false);
  const selectedMarker = useRef(null);

  const mapRef = useCallback(node => {
    if (node !== null) {
      node.on('moveend', () => {
        controllerRef.current.abort();
        controllerRef.current = new AbortController();

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

  const groupByIndex = (docs) => {
    return docs.reduce((grouped, doc) => {
      const key = doc._index;
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(doc);
      return grouped;
    }, {});
  };



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
    // This code will run whenever the marker's position is changed
    if (props.docs?.[0]?._source?.location) {

      if (openPopup.current) {
        console.log("Opening popup")
        selectedMarker.current.openPopup();
        openPopup.current = false;
      }
      else {
        selectedMarker.current?.closePopup();
      }
      
      //console.log("Marker position changed", selectedMarker.current, props.docs);
    }
  }, [props.docs]);

  


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
        signal: controllerRef.current.signal,
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },

      })
      .then(response => response.json())
      .then(data => {
        
        const markers = groupMarkers(data.hits.hits);
        setMarkers(markers)})
        

        .catch(error => {
          if (error.name !== 'AbortError') {
            console.error('Fetch request failed:', error);
          }
        }
      );
        
    }
  }, [bounds, mapQueryString, params.dataset]);

  
  useEffect(() => {
    if (props.docs?.[0]._source.location && mapInstance) {
      const { coordinates } = props.docs[0]._source.location;
      const latLng = L.latLng(coordinates[1], coordinates[0]);
      if (!mapInstance.getBounds().contains(latLng)) {
        mapInstance.setView(latLng, 10);
      }
    }
  }, [props.docs, mapInstance]);



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
                              const uuids = marker.hits.map(item => item.id).join(",")
                              openPopup.current = true
                              router.push(documentUrl(uuids), { scroll: false})
                            }}}>
                  
                    {  (zoom > 14 || props.resultCount < 20) && markers.length < 100 ? 
                    
                    <Tooltip className="!text-black !text-lg !border-0 !shadow-none !bg-white !font-semibold !bg-opacity-75 !rounded-full !px-3 !pt-0 !pb-0 !mt-3 before:hidden" 
                             direction="bottom" 
                             permanent={true}
                             eventHandlers={{click: () => {
                              // TOODO: open popup
                            }}}>
                      {marker.hits[0].label}{marker.hits.length > 1 ? `...` : ''}

                      </Tooltip>  : null}

                  

              </CircleMarker>
            ))}
            
           
            {props.docs?.[0]?._source?.location ?
            
            ( <Marker ref={selectedMarker} className="text-primary-600 bg-primary-600" icon={new leaflet.icon({iconUrl: '/marker.svg', iconSize: [48, 48], iconAnchor: [24, 48]})}
                             position={[props.docs[0]._source.location.coordinates[1], props.docs[0]._source.location.coordinates[0]]}>


              <Popup minWidth={256} maxWidth={300} autoPan={false}>
                                    
              <ul className="flex flex-col gap-1">
                {Object.entries(groupByIndex(props.docs)).map(([index, docs]) => (
                  <li key={index}>
                    <h3 className="text-lg flex  justify-between"><Link className="!text-black" href={'/search/' + indexToCode(index)}>{datasetTitles[indexToCode(index)]}</Link></h3>
                      <PopupList docs={props.docs} dataset={params.dataset} />
                  </li>
                ))}
              </ul>
                    
              </Popup>

              </Marker> )
              : null}
              
              
            </>
            )}
    </Map>
  )
}

