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
import { useSearchQuery } from "@/lib/search-params";


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
    const [doc, setDoc] = useQueryState('doc')
    const [viewResults, setViewResults] = useState<any>(null)
    const { searchQueryString } = useSearchQuery()

    const [bounds, setBounds] = useState<null|[[number, number], [number, number]]>(null)
    useEffect(() => {
        if (resultData && resultData.aggregations.viewport.bounds) {
            const resultBounds = resultData.aggregations.viewport.bounds;
            setBounds([[resultBounds.top_left.lat, resultBounds.top_left.lon],
              [resultBounds.bottom_right.lat, resultBounds.bottom_right.lon]])

            mapInstance?.current?.fitBounds([[resultBounds.top_left.lat, resultBounds.top_left.lon], [resultBounds.bottom_right.lat, resultBounds.bottom_right.lon]], {padding: [100, 50]});
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
        const queryParams = new URLSearchParams(searchQueryString);
        queryParams.set('topLeftLat', topLeftLat.toString());
        queryParams.set('topLeftLng', topLeftLng.toString());
        queryParams.set('bottomRightLat', bottomRightLat.toString());
        queryParams.set('bottomRightLng', bottomRightLng.toString());

        if (zoom) {
          queryParams.set('zoom', zoom.toString())
        }
        




        const query = `/api/geo/cluster?${queryParams.toString()}`;
  
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
          setViewResults(data)
          //const markers = groupMarkers(data.hits.hits);
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
  const calculateRadius = (docCount, maxDocCount, minDocCount) => {
    const minRadius = .75; // Minimum radius for a marker
    const maxRadius = 1; // Maximum radius for a marker
  
    // Ensure docCount is within the range
    docCount = Math.max(minDocCount, Math.min(maxDocCount, docCount));
  
    if (maxDocCount === minDocCount) return minRadius;
  
    // Use a logarithmic scale for a wider distribution
    const logMax = Math.log(maxDocCount - minDocCount + 1);
    const logValue = Math.log(docCount - minDocCount + 1);
    const scaledRadius = (logValue / logMax) * (maxRadius - minRadius) + minRadius;
  
    return scaledRadius;
  };


  const maxDocCount = viewResults?.aggregations?.tiles?.buckets.reduce((acc: number, cur: any) => Math.max(acc, cur.doc_count), 0);
  const minDocCount = viewResults?.aggregations?.tiles?.buckets.reduce((acc: number, cur: any) => Math.min(acc, cur.doc_count), Infinity);
  


    return <>
    {bounds?.length || (center && zoom ) ? <>
    <Map mapRef={mapRef} zoomControl={false} {...center && zoom ? {center, zoom} : {bounds}}
        className='w-full h-full'>
    {({ TileLayer, CircleMarker, Marker, Tooltip }: any, leaflet: any) => (

  <>
  { baseMap && <TileLayer {...baseMapProps[baseMap]}/>}

  {viewResults?.aggregations?.tiles?.buckets.map((bucket: any) => {
    const latitudes = bucket.docs.hits.hits.map(hit => hit.fields.location[0].coordinates[1]);
    const longitudes = bucket.docs.hits.hits.map(hit => hit.fields.location[0].coordinates[0]);

    const latSum = latitudes.reduce((acc, cur) => acc + cur, 0);
    const lonSum = longitudes.reduce((acc, cur) => acc + cur, 0);

    const itemCount = bucket.docs.hits.hits.length;
    const lat = latSum / itemCount;
    const lon = lonSum / itemCount;

    
    // If no coordinates are different from the average
    if (bucket.docs?.hits?.hits?.length != 1 && !latitudes.some(lat => lat !== latitudes[0]) && !longitudes.some(lon => lon !== longitudes[0])) {
      const myCustomIcon = new leaflet.DivIcon({
        className: 'my-custom-icon', // You can define styles in your CSS
        html: `<div class="text-white" style="position: relative; top: -3rem; left: -1.5rem;"><img src="/markerBlackFill.svg" style="width: 3rem; height: 3rem;"/><span class="absolute top-[1.16rem] left-0 w-[3rem] text-center text-xs font-bold">${itemCount}</span></div>`
      });
      return <Marker key={bucket.key} className="drop-shadow-xl" icon={myCustomIcon} position={[lat, lon]}/>

    }

    
    else if (bucket.docs?.hits?.hits?.length == 1 || zoom && zoom > 15) {
      
      
      return <>{bucket.docs?.hits?.hits?.map(hit => {
        const myCustomIcon = new leaflet.DivIcon({
          className: 'my-custom-icon', // Ensure this class is defined in your CSS
          html: `
            <div style="display: flex; align-items: center; justify-content: center; position: relative; top: -2rem; height: 2rem;">
              <img src="/markerBlack.svg" style="width: 2rem; height: 2rem;"/>
              <div style="position: absolute; top: 2rem; left: 50%; transform: translateX(-50%); background-color: white; opacity: 75%; white-space: nowrap; border-radius: 9999px; text-align: center; font-size: 12px; font-weight: bold; padding: 0 8px;">
                ${hit.fields.label}
              </div>
            </div>`
        });


        return <Marker className="drop-shadow-xl" key={hit.key} icon={myCustomIcon}
        position={[hit.fields.location[0].coordinates[1], hit.fields.location[0].coordinates[0]]}/>



      }
      )}</>
    }

    



    const myCustomIcon = new leaflet.DivIcon({
      className: 'my-custom-icon', // You can define styles in your CSS
      html: `<div class="bg-white text-neutral-900 drop-shadow-xl shadow-md font-bold" style="border-radius: 50%; width: ${(calculateRadius(bucket.doc_count, maxDocCount, minDocCount) * 2) + (bucket.doc_count > 99 ? bucket.doc_count.toString().length / 4 : 0) }rem; font-size: ${calculateRadius(bucket.doc_count, maxDocCount, minDocCount) * 0.8}rem; height: ${calculateRadius(bucket.doc_count, maxDocCount, minDocCount) * 2}rem; display: flex; align-items: center; justify-content: center;">${bucket.doc_count}</div>`
    });


    

    return <Marker key={bucket.key} position={[lat, lon]} icon={myCustomIcon}/>
    


  }
  )}


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
{false && <div className="absolute bottom-0 left-0 z-[6000] w-[600px] h-[200px] overflow-auto bg-white">
  {JSON.stringify(viewResults, null,  2)}
</div>}
    </>
}