'use client'
import { useEffect, useState, useCallback, useRef } from 'react';
import Map from './Map'
import { useSearchParams, usePathname, useRouter, useParams } from 'next/navigation'
import 'leaflet/dist/leaflet.css';
import { useQueryStringWithout } from '@/lib/search-params'
import PopupList from './PopupList'

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
  const mapQueryString = useQueryStringWithout(["docs", "search", "size", "page", "sort"])
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
        const layerCode = {"Norgeskart": "map_topo4", "Norgeskart, gråtoner": "map_topo4graatone", "Terrengkart": "map_terreng", "Verdenskart": "map_carto_labels"}[layer.name] || "map_topo4"
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
      const queryParams = mapQueryString
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
  }, [props.mapBounds, leafletBounds, mapQueryString, params.dataset, props.isLoading]);

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
           <TileLayer
                key="map_cartodb"
                url="https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png"
                attribution="&copy; <a href=&quot;https://www.openstreetmap.org/copyright&quot;>OpenStreetMap</a> contributors &copy; <a href=&quot;https://carto.com/attributions&quot;>CARTO</a>"
              />
           <LayersControl collapsed={layerControlCollapsed} >
            <LayersControl.BaseLayer checked={localStorage.getItem('baseLayer') == 'map_topo4'} name="Norgeskart">
              <TileLayer
                key="map_topo4"
                url="https://opencache{s}.statkart.no/gatekeeper/gk/gk.open_gmaps?layers=topo4&zoom={z}&x={x}&y={y}"
                attribution="<a href='http://www.kartverket.no/'>Kartverket</a>"
                subdomains={['', '2', '3']}
              />
            </LayersControl.BaseLayer>
            <LayersControl.BaseLayer checked={localStorage.getItem('baseLayer') == 'map_topo4graatone'} name="Norgeskart, gråtoner">
              <TileLayer
                key="map_topo4graatone"
                url="https://opencache{s}.statkart.no/gatekeeper/gk/gk.open_gmaps?layers=topo4graatone&zoom={z}&x={x}&y={y}"
                attribution="<a href='http://www.kartverket.no/'>Kartverket</a>"
                subdomains={['', '2', '3']}
              />
            </LayersControl.BaseLayer>
            <LayersControl.BaseLayer checked={localStorage.getItem('baseLayer') == 'map_terreng'} name="Terrengkart">
              <TileLayer
                key="map_terreng"
                url="https://opencache{s}.statkart.no/gatekeeper/gk/gk.open_gmaps?layers=terreng_norgeskart&zoom={z}&x={x}&y={y}"
                attribution="<a href='http://www.kartverket.no/'>Kartverket</a>"
                subdomains={['', '2', '3']}
              />
            </LayersControl.BaseLayer>
            <LayersControl.BaseLayer checked={localStorage.getItem('baseLayer') == 'map_carto_labels'} name="Verdenskart">
              <TileLayer
                key="map_carto_labels"
                url="https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png"
                attribution="&copy; <a href=&quot;https://www.openstreetmap.org/copyright&quot;>OpenStreetMap</a> contributors &copy; <a href=&quot;https://carto.com/attributions&quot;>CARTO</a>"
              />
            </LayersControl.BaseLayer>
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

            ( <Marker ref={selectedMarker} icon={new leaflet.icon({iconUrl: '/marker.svg', iconSize: [48, 48], iconAnchor: [24, 48]})}
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

