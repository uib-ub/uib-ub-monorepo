import { use, useCallback, useContext, useEffect, useRef, useState } from "react";
import Map from "../Map/Map";
import { baseMaps, baseMapKeys, baseMapProps} from "@/config/basemap-config";
import { PiGps, PiGpsFill, PiGpsFix, PiMagnifyingGlassMinus, PiMagnifyingGlassMinusFill, PiMagnifyingGlassPlus, PiMagnifyingGlassPlusFill, PiStack } from "react-icons/pi";
import IconButton from "../ui/icon-button";
import { SearchContext } from "@/app/simple-search-provider";
import Spinner from "../svg/Spinner";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
  } from "@/components/ui/dropdown-menu"
import { parseAsArrayOf, parseAsFloat, parseAsInteger, parseAsString, useQueryState } from "nuqs";
import { useSearchParams } from "next/navigation";


export default function MapExplorer({isMobile}: {isMobile: boolean}) {


    const mapInstance = useRef<any>(null);

    const { resultData, isLoading, searchError } = useContext(SearchContext)
    const controllerRef = useRef(new AbortController());

    const [baseMap, setBasemap] = useState<null|string>(null)

    const [myLocation, setMyLocation] = useState<[number, number] | null>(null)
    const searchParams = useSearchParams()
    const [markers, setMarkers] = useState<any[]>([]);
    const [resultCount, setResultCount] = useState(null); // Labels are only shown if the result count is less than 20


    const [zoom, setZoom] = useQueryState('zoom', parseAsInteger);
    const [center, setCenter] = useQueryState('center', parseAsArrayOf(parseAsFloat));
    const [docs, setDocs] = useQueryState('docs', parseAsArrayOf(parseAsString));

    const [bounds, setBounds] = useState<null|[[number, number], [number, number]]>(null)
    useEffect(() => {
        if (resultData && resultData.aggregations.viewport.bounds) {
            const resultBounds = resultData.aggregations.viewport.bounds;
            setBounds([[resultBounds.top_left.lat, resultBounds.top_left.lon],
              [resultBounds.bottom_right.lat, resultBounds.bottom_right.lon]])

            mapInstance?.current?.fitBounds([[resultBounds.top_left.lat, resultBounds.top_left.lon], [resultBounds.bottom_right.lat, resultBounds.bottom_right.lon]]);
        }

    }, [resultData])

    function groupMarkers(markers: any) {
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


    useEffect(() => {
      // Check if the bounds are initialized
      if (!isLoading && bounds?.length) {
        //console.log("Fetching geodata", props.mapBounds, leafletBounds, mapQueryString, params.dataset, props.isLoading)
        const [[topLeftLat, topLeftLng], [bottomRightLat, bottomRightLng]] = bounds;
  
        // Fetch data based on the new bounds
        const queryParams = "q=" + searchParams.get('q')
        const query = `/api/geo?dataset=${'tot'}&${ queryParams?
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
    }, [bounds, isLoading]);






    useEffect(() => {
        if (baseMap === null) {
            const storedBasemap = localStorage.getItem('baseMap')
            if (storedBasemap && baseMapKeys.includes(storedBasemap)) {
                setBasemap(storedBasemap)
            }
                
            else {
                setBasemap(baseMaps[0].key)
                localStorage.removeItem('baseMap')
            }
        }
        else {
            localStorage.setItem('baseMap', baseMap)
        }
    }, [baseMap])


    const mapRef = useCallback((node: any) => {
        if (node !== null) {
          mapInstance.current = node;
          node.on('moveend', () => {  
            controllerRef.current.abort();
            controllerRef.current = new AbortController();

            const bounds = node.getBounds();
            const boundsCenter = bounds.getCenter();
            setCenter([boundsCenter.lat, boundsCenter.lng]);
            setZoom(node.getZoom());
            setBounds([[bounds.getNorth(), bounds.getWest()], [bounds.getSouth(), bounds.getEast()]]);
          });
          
        }
    
      }, [setCenter, setZoom]);

    


    const zoomIn = () => {
        if (mapInstance.current) {
            const currentZoom = mapInstance.current.getZoom();
            mapInstance.current.setZoom(currentZoom + 1);
        } else {
            setZoom(prev => prev + 1);
        }
    };
    
    const zoomOut = () => {
        if (mapInstance.current) {
            const currentZoom = mapInstance.current.getZoom();
            mapInstance.current.setZoom(currentZoom - 1);
        } else {
            setZoom(prev => prev - 1);
        }
    };



    function getMyLocation() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    // Assuming mapInstance is a ref to your map instance
                    mapInstance.current.setView([latitude, longitude], 15); // Zoom level 13 is just an example
                    setMyLocation([latitude, longitude]);
                },
                (error) => {
                    console.error("Error getting the location: ", error);
                    // Handle error or notify user here
                }
            );
        } else {
            console.error("Geolocation is not supported by this browser.");
            // Notify user that geolocation is not supported
        }
    }

    // Get bounds from resultdata
    /*
    useEffect(() => {
      if (resultData && resultData.aggregations.viewport.bounds) {
          const bounds = resultData.aggregations.viewport.bounds;
          console.log("BOUNDS")
          
          const boundsCenter = [(bounds.top_left.lat + bounds.bottom_right.lat) / 2, (bounds.top_left.lon + bounds.bottom_right.lon) / 2];
          setCenter(boundsCenter);

          // Calculate zoom level
          mapInstance?.current?.fitBounds([[bounds.top_left.lat, bounds.top_left.lon], [bounds.bottom_right.lat, bounds.bottom_right.lon]]);



          
        
      }
  }, [resultData, mapInstance.current, setCenter])
  */

 
    return <>
    {bounds?.length || (center && zoom ) ? <>
    <Map mapRef={mapRef} zoomControl={false} {...center && zoom ? {center, zoom} : {bounds}}
        className='w-full h-full'>
    {({ TileLayer, CircleMarker, Marker, Tooltip }: any, leaflet: any) => (

  <>
  { baseMap && <TileLayer {...baseMapProps[baseMap]}/>}

  {markers.map(marker => (
              <CircleMarker role="button"
                            pathOptions={{color:'white', weight: 2, opacity: 1, fillColor: 'black', fillOpacity: 1}}
                            key={`${marker.lat} ${marker.lon} ${marker.hits.length}${(zoom > 14 || resultCount < 20) && markers.length < 100  ? 'labeled' : ''}`}
                            center={[marker.lat, marker.lon]}
                            radius={marker.hits.length == 1 ? 8 : marker.hits.length == 1 && 9 || marker.hits.length < 4 && 10 || marker.hits.length >= 4 && 12}
                            eventHandlers={{click: () => {
                              const uuids = marker.hits.map(item => item.id)
                              setDocs(marker.hits.map(item => item.id))
                              
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

  {myLocation && <CircleMarker center={myLocation} radius={10} color="#cf3c3a"/>}

  </>)}

</Map>
</> : isLoading ?
<div className="flex h-full items-center justify-center">
              <div>
                <Spinner status="Laster inn kartet" className="w-20 h-20"/>
              </div>
</div> 
:  null
    }
    { baseMap != null &&
    <div className={`absolute ${isMobile ? 'top-12 right-0 flex-col p-2 gap-4' : 'bottom-0 w-full'} flex justify-center p-2 gap-2 text-white z-[3001]`}>

<DropdownMenu>
    <DropdownMenuTrigger asChild><button className="p-2 rounded-full border bg-neutral-900 border-white shadow-sm" aria-label="Bakgrunnskart"><PiStack/></button></DropdownMenuTrigger>
    <DropdownMenuContent className="z-[4000] bg-white">
        <DropdownMenuLabel>Bakgrunnskart</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup value={baseMap} onValueChange={setBasemap}>
          {baseMaps.map((item) => (
            <DropdownMenuRadioItem key={item.key} value={item.key} className="text-nowrap cursor-pointer">
              {item.name}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
    <IconButton onClick={zoomIn}  className="p-2 rounded-full border bg-neutral-900 border-white shadow-sm" label="Zoom inn"><PiMagnifyingGlassPlusFill/></IconButton>
  <IconButton onClick={zoomOut} className="p-2 rounded-full border bg-neutral-900 border-white shadow-sm" label="Zoom ut"><PiMagnifyingGlassMinusFill/></IconButton>
    <IconButton onClick={getMyLocation} className="p-2 rounded-full border bg-neutral-900 border-white shadow-sm" label="Min posisjon"><PiGpsFix/></IconButton>
    
    

    

    </div>
}
{JSON.stringify(markers)}
    </>
}