'use client'
import { useEffect, useState, useCallback, useRef } from 'react';
import Map from './Map'
import { useSearchParams, usePathname, useRouter, useParams } from 'next/navigation'
import 'leaflet/dist/leaflet.css';
import { useQueryStringWithout } from '@/lib/search-params'
import PopupList from './PopupList'
import { backgroundMap, baseMaps, baseMapNames, baseMapKeys } from '@/config/basemap-config'

export default function MapExplorer(props) {
  const [markers, setMarkers] = useState([]);
  const mapInstance = useRef(null);
  const [leafletBounds, setLeafletBounds] = useState(null);
  const [resultCount, setResultCount] = useState(null);
  const initialRender = useRef(true);
  const [zoom, setZoom] = useState(null);
  const searchParams = useSearchParams()
  const params = useParams()
  const router = useRouter()
  const pathname = usePathname()
  const treeMapQueryString = searchParams.get('display') == 'tree' ? `sosi=gard&${searchParams.get('adm1') ? "&adm=" : ""}${["adm3", "adm2", "adm1"].filter(item => searchParams.get(item)).map(item => searchParams.get(item)).join("__")}` : null
  const mapQueryString =  useQueryStringWithout(["docs", "popup", "expanded", "search", "size", "page", "sort"])
  const controllerRef = useRef(new AbortController());
  const selectedMarker = useRef(null);
  const [layerControlCollapsed, setLayerControlCollapsed] = useState(true);



  const mapRef = useCallback(node => {
    if (node !== null) {
      mapInstance.current = node;
      node.on('moveend', () => {
        controllerRef.current.abort();
        controllerRef.current = new AbortController();

        setLeafletBounds(node.getBounds());
        setZoom(node.getZoom());
      });

      node.on('baselayerchange', (layer) => {
        const layerCode = baseMapKeys[baseMapNames.indexOf(layer.name)]
        localStorage.setItem('baseLayer', layerCode);
        setLayerControlCollapsed(true);
      });

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
      grouped[key].hits.push({id: marker.fields.uuid, label: marker.fields.label});
    });

    return Object.values(grouped);
  }


  const documentUrl = (uuid) => {
    const params = new URLSearchParams(searchParams)
    params.set('docs', String(uuid))
    return pathname + "?" + params.toString()
  }


  useEffect(() => {
    // Make sure popup is opened when the docs chance
    selectedMarker.current?.openPopup();
  }, [props.docs]);




  useEffect(() => {
    // Check if the bounds are initialized
    if (!props.isLoading) {
      //console.log("Fetching geodata", props.mapBounds, leafletBounds, mapQueryString, params.dataset, props.isLoading)
      const topLeftLat = leafletBounds ? leafletBounds.getNorthEast().lat : props.mapBounds[0][0];
      const topLeftLng = leafletBounds ? leafletBounds.getSouthWest().lng : props.mapBounds[0][1];
      const bottomRightLat = leafletBounds ? leafletBounds.getSouthWest().lat : props.mapBounds[1][0];
      const bottomRightLng = leafletBounds ? leafletBounds.getNorthEast().lng : props.mapBounds[1][1];

      // Fetch data based on the new bounds
      const queryParams = treeMapQueryString !== null ? treeMapQueryString : mapQueryString
      const query = `/api/geo?dataset=${params.dataset}&${ queryParams?
                                            queryParams + "&" : ""
                                            }topLeftLat=${
                                             topLeftLat
                                            }&topLeftLng=${
                                              topLeftLng
                                            }&bottomRightLat=${
                                              bottomRightLat
                                            }&bottomRightLng=${
                                              bottomRightLng
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

        setResultCount(data.hits.total.value);
        const markers = groupMarkers(data.hits.hits);
        setMarkers(markers)})


        .catch(error => {
          if (error.name !== 'AbortError') {
            console.error('Fetch request failed:', error);
          }
        }
      );

    }
  }, [props.mapBounds, leafletBounds, mapQueryString, treeMapQueryString, params.dataset, props.isLoading]);

  // Fit map to bounds when searching
  useEffect(() => {
    if (initialRender.current) {
      initialRender.current = false;
    }
    else if (mapInstance.current && props.mapBounds?.length && !props.isLoading) {
      mapInstance.current.fitBounds(props.mapBounds, {maxZoom: 8})
    }
  }, [props.mapBounds, props.isLoading]);


  // Move view to selected marker if it is not in view
  useEffect(() => {
    if (props.docs?.[0]?._source.location && mapInstance.current) {
      const { coordinates } = props.docs[0]._source.location;
      const latLng = L.latLng(coordinates[1], coordinates[0]);
      if (!mapInstance.current.getBounds().contains(latLng)) {
        mapInstance.current.setView(latLng, 10);
      }
    }
  }, [props.docs]);


  return (
    <Map mapRef={mapRef} bounds={props.mapBounds} className='w-full h-full'>
            {({ TileLayer, LayersControl, CircleMarker, Marker, Popup, Tooltip }, leaflet) => (

          <>
           { false && <TileLayer {...backgroundMap}/>}
           <LayersControl collapsed={layerControlCollapsed} >
           <LayersControl.BaseLayer checked={localStorage.getItem('baseLayer') == baseMaps[0].key || !localStorage.getItem('baseLayer') || !baseMapKeys.includes(localStorage.getItem('baseLayer'))} name={baseMapNames[0]}>
              <TileLayer key={baseMaps[0].key} {...baseMaps[0].props} />
            </LayersControl.BaseLayer>
            {baseMaps.slice(1).map((item, index) => (
              <LayersControl.BaseLayer checked={localStorage.getItem('baseLayer') == item.key} key={item.key} name={item.name}>
                <TileLayer key={item.key} {...item.props} />
              </LayersControl.BaseLayer>
            ))
            }
            </LayersControl>

            {markers.map(marker => (
              <CircleMarker role="button"
                            pathOptions={{color:'white', weight: 2, opacity: 1, fillColor: 'black', fillOpacity: 1}}
                            key={`${marker.lat} ${marker.lon} ${marker.hits.length}${(zoom > 14 || resultCount < 20) && markers.length < 100  ? 'labeled' : ''}`}
                            center={[marker.lat, marker.lon]}
                            radius={marker.hits.length == 1 ? 8 : marker.hits.length == 1 && 9 || marker.hits.length < 4 && 10 || marker.hits.length >= 4 && 12}
                            eventHandlers={{click: () => {
                              const uuids = marker.hits.map(item => item.id).join(",")
                              router.push(documentUrl(uuids), { scroll: false})
                            }}}>

                    {  (zoom > 14 || resultCount < 20) && markers.length < 100 ?

                    <Tooltip className="!text-black !border-0 !shadow-none !bg-white !font-semibold !rounded-full !px-2 !pt-0 !pb-0 !mt-3 before:hidden"
                             direction="bottom"
                             permanent={true}
                             eventHandlers={{click: () => {
                              // TODO: open popup
                            }}}>
                          {marker.hits[0].label}{marker.hits.length > 1 ? `...` : ''}

                      </Tooltip>  : null}

              </CircleMarker>
            ))}


            {props.docs?.length && props.docs[0]._source?.location ?

            ( <Marker ref={selectedMarker} icon={new leaflet.icon({iconUrl: '/markerAccent.svg', iconSize: [48, 48], iconAnchor: [24, 48]})}
                             position={[props.docs[0]._source.location.coordinates[1], props.docs[0]._source.location.coordinates[0]]}
                             eventHandlers={{
                              add: () => selectedMarker.current.openPopup(),
                              popupopen: () => selectedMarker.current.setOpacity(0),
                              popupclose: () => selectedMarker.current?.setOpacity(1),
                            }}>

              <Popup open={true} minWidth={256} maxWidth={300} autoPan={false}>
                  <div className="max-h-64 overflow-y-auto"><PopupList docs={props.docs} view={params.dataset} /></div>
              </Popup>

              </Marker> )
              : null}


            </>
            )}
    </Map>
  )
}

