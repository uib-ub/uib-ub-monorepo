import { Fragment, useCallback, useContext, useEffect, useRef, useState } from "react";
import Map from "../Map/Map";
import { baseMaps, baseMapKeys, baseMapProps} from "@/config/basemap-config";
import {  PiGpsFix, PiMagnifyingGlassMinusFill, PiMagnifyingGlassPlusFill, PiMapPinLine, PiStackSimple } from "react-icons/pi";
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
import { parseAsArrayOf, parseAsFloat, parseAsInteger, useQueryState } from "nuqs";
import { useSearchQuery } from "@/lib/search-params";
import { getLabelMarkerIcon } from "./markers";


export default function MapExplorer({isMobile}: {isMobile: boolean}) {
    const mapInstance = useRef<any>(null);
    const { resultData, isLoading, searchError } = useContext(SearchContext)
    const controllerRef = useRef(new AbortController());
    const [baseMap, setBasemap] = useState<null|string>(null)
    const [markerMode, setMarkerMode] = useState<null|string>(null)
    const [myLocation, setMyLocation] = useState<[number, number] | null>(null)
    const [zoom, setZoom] = useQueryState('zoom', parseAsInteger);
    const [center, setCenter] = useQueryState('center', parseAsArrayOf(parseAsFloat));
    const setDoc = useQueryState('doc', {history: 'push', scroll: true})[1]
    const [point, setPoint] = useQueryState('point', {history: 'push', scroll: true})
    const [viewResults, setViewResults] = useState<any>(null)
    const { searchQueryString } = useSearchQuery()
    const [ expanded, setExpanded ] = useQueryState('expanded', {history: 'push'})

    const [bounds, setBounds] = useState<null|[[number, number], [number, number]]>(null)
    useEffect(() => {
        if (resultData && resultData.aggregations.viewport.bounds) {
            const resultBounds = resultData.aggregations.viewport.bounds;
            setBounds([[resultBounds.top_left.lat, resultBounds.top_left.lon],
              [resultBounds.bottom_right.lat, resultBounds.bottom_right.lon]])

            mapInstance?.current?.fitBounds([[resultBounds.top_left.lat, resultBounds.top_left.lon], [resultBounds.bottom_right.lat, resultBounds.bottom_right.lon]], {padding: [100, 50]});
        }

    }, [resultData])


    const getValidDegree = (degrees: number, maxValue: number): string => {
      if (Math.abs(degrees) > Math.abs(maxValue)) {
        return maxValue.toString()
      }
      return degrees.toString()
    }



    useEffect(() => {
      // Check if the bounds are initialized
      if (!isLoading && bounds?.length) {
        //console.log("Fetching geodata", props.mapBounds, leafletBounds, mapQueryString, params.dataset, props.isLoading)
        const [[topLeftLat, topLeftLng], [bottomRightLat, bottomRightLng]] = bounds;
  
        // Fetch data based on the new bounds
        const queryParams = new URLSearchParams(searchQueryString);
        queryParams.set('topLeftLat', getValidDegree(topLeftLat, 90));
        queryParams.set('topLeftLng', getValidDegree(topLeftLng, -180));
        queryParams.set('bottomRightLat', getValidDegree(bottomRightLat, -90));
        queryParams.set('bottomRightLng', getValidDegree(bottomRightLng, 180));
        if (zoom) {
          queryParams.set('zoom', zoom.toString());
        }

        if (zoom) {
          queryParams.set('zoom', zoom.toString())
        }
        




        const query = `/api/geo/${ (markerMode === 'cluster' && 'cluster') || (markerMode === 'sample' && 'sample') || (resultData?.hits.total.value < 10000 ? 'cluster' : 'sample')}?${queryParams.toString()}`;
  
        fetch(query, {
          signal: controllerRef.current.signal,
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          },
  
        })
        .then(response => response.json())
        .then(data => {

          if (data.hits.hits.length > 0) {

            const clientGroups: any[] = []
            const markerOutput = {hits: {total: {value: data.hits.total.value}, clientGroups}}
            const markerLookup: Record<string,any> = {}

            data.hits.hits.forEach((hit: { fields: { label: any; uuid: string, location: { coordinates: any[]; }[]; }; key: string; }) => {
              const lat = hit.fields.location[0].coordinates[1]
              const lon = hit.fields.location[0].coordinates[0]
              const uuid = hit.fields.uuid
              let marker = markerLookup[lat + "_" + lon]
              if (!marker) {
                marker = {children: [], lat, lon, uuid}
                markerLookup[lat + "_" + lon] = marker
                markerOutput.hits.clientGroups.push(marker)
              }


              const label = hit.fields.label

              if (typeof marker.label == 'string' && marker.label !== label && !marker.label.endsWith('...')) {
                marker.label = marker.label + "..."
                
              } else {
                marker.label = label
              }
                

              marker.children.unshift(hit)
            })

            setViewResults(markerOutput)
          }
          else {
            setViewResults(data)
          }
          
          
          })
  
          .catch(error => {
            if (error.name !== 'AbortError') {
              console.error('Fetch request failed:', error);
            }
          }
        );
  
      }
      else {
        setViewResults(null)
      }
    }, [bounds, isLoading, zoom, searchQueryString, resultData?.hits.total.value, markerMode]);






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

    useEffect(() => {
      if (markerMode === null) {
          const storedMarkerMode = localStorage.getItem('markerMode')
          if (storedMarkerMode && ['auto', 'cluster', 'sample'].includes(storedMarkerMode)) {
              setMarkerMode(storedMarkerMode)
          }
              
          else {
              setMarkerMode('auto')
              localStorage.removeItem('markerMode')
          }
      }
      else {
          localStorage.setItem('markerMode', markerMode)
      }
  }, [markerMode])


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
            setZoom(prev => prev ? prev + 1 : 1);
        }
    };
    
    const zoomOut = () => {
        if (mapInstance.current) {
            const currentZoom = mapInstance.current.getZoom();
            mapInstance.current.setZoom(currentZoom - 1);
        } else {
            setZoom(prev => prev ? prev - 1 : 1);
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

  const calculateRadius = (docCount: number, maxDocCount: number, minDocCount: number) => {
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

  function adjustBounds(bounds: [[number, number], [number, number]], adjustmentFactor: number): [[number, number], [number, number]] {
    // Calculate the center of the bounds
    const centerLat = (bounds[0][0] + bounds[1][0]) / 2;
    const centerLon = (bounds[0][1] + bounds[1][1]) / 2;
  
    // Calculate the distance from the center to each corner and apply the adjustment factor
    const latDiff = (bounds[1][0] - bounds[0][0]) * (1 + adjustmentFactor) / 2;
    const lonDiff = (bounds[1][1] - bounds[0][1]) * (1 + adjustmentFactor) / 2;
  
    // Calculate and return the new bounds
    const newTopLeft: [number, number] = [centerLat - latDiff, centerLon - lonDiff];
    const newBottomRight: [number, number] = [centerLat + latDiff, centerLon + lonDiff];
  
    return [newTopLeft, newBottomRight];
  }


  const maxDocCount = viewResults?.aggregations?.tiles?.buckets.reduce((acc: number, cur: any) => Math.max(acc, cur.doc_count), 0);
  const minDocCount = viewResults?.aggregations?.tiles?.buckets.reduce((acc: number, cur: any) => Math.min(acc, cur.doc_count), Infinity);


  const openDocHandler = (selected: string | [number, number], hits?: any[]) => {
    return {
      click: (e: any) => {
        // if string
        if (typeof selected === 'string') {
          setPoint(null)
          setDoc(selected)
          setExpanded('info')
        }
        else if (hits?.length) {
          setDoc(null)
          setPoint(selected.join(','))
          setExpanded('info')
        }
      }

    }
  }


    return <>
    {bounds?.length || (center && zoom ) ? <>
    <Map mapRef={mapRef} zoomControl={false} {...center && zoom ? {center, zoom} : {bounds}}
        className='w-full h-full'>
    {({ TileLayer, CircleMarker, Marker }: any, leaflet: any) => {



      return (

  <>
  { baseMap && <TileLayer maxZoom={18} maxNativeZoom={18} {...baseMapProps[baseMap]}/>}


  { viewResults?.aggregations?.tiles?.buckets.map((bucket: any) => {
    const latitudes = bucket.docs.hits.hits.map((hit: { fields: { location: { coordinates: any[]; }[]; }; }) => hit.fields.location[0].coordinates[1]);
    const longitudes = bucket.docs.hits.hits.map((hit: { fields: { location: { coordinates: any[]; }[]; }; }) => hit.fields.location[0].coordinates[0]);

    const latSum = latitudes.reduce((acc: any, cur: any) => acc + cur, 0);
    const lonSum = longitudes.reduce((acc: any, cur: any) => acc + cur, 0);

    const hitCount = bucket.docs.hits.hits.length;
    const lat = latSum / hitCount;
    const lon = lonSum / hitCount;

    
    // If no coordinates are different from the average
    if (bucket.docs?.hits?.hits?.length > 1 && (zoom && zoom > 15) && !latitudes.some((lat: any) => lat !== latitudes[0]) && !longitudes.some((lon: any) => lon !== longitudes[0])) {

      // Label: add dots if they are different
      const labels = bucket.docs.hits.hits.map((hit: { fields: { label: any; }; }) => hit.fields.label);
      const label = labels[0] + (labels.slice(1, labels.length).some((label: any) => label !== labels[0]) ? '...' : '');
      
      const icon = new leaflet.DivIcon(getLabelMarkerIcon(label, 'black', bucket.doc_count > 1 ? bucket.doc_count : undefined))
      
      return <Marker key={bucket.key} className="drop-shadow-xl" icon={icon} position={[lat, lon]} riseOnHover={true} eventHandlers={openDocHandler([lat, lon], bucket.docs.hits.hits)}/>

    }

    else if (bucket.docs?.hits?.hits?.length == 1 || (zoom && zoom > 15 && bucket.doc_count == bucket.docs.hits.hits.length)) {      
      
      return <Fragment key={bucket.key}>{bucket.docs?.hits?.hits?.map((hit: { fields: { label: any; uuid: string, location: { coordinates: any[]; }[]; }; key: string; }) => {
        const icon = new leaflet.DivIcon(getLabelMarkerIcon(hit.fields.label, 'black'))
        return <Marker key={hit.fields.uuid} 
                       position={[hit.fields.location[0].coordinates[1], hit.fields.location[0].coordinates[0]]} 
                      icon={icon} 
                      riseOnHover={true}
                      eventHandlers={openDocHandler(hit.fields.uuid[0])}
                      />
                      
      }
      )}</Fragment>
    }

    else {
      // Calculate center of bounds
      const centerLat = (bucket.viewport.bounds.top_left.lat + bucket.viewport.bounds.bottom_right.lat) / 2;
      const centerLon = (bucket.viewport.bounds.top_left.lon + bucket.viewport.bounds.bottom_right.lon) / 2;


      
      const myCustomIcon = new leaflet.DivIcon({
        className: '',
        html: `<div class="bg-white text-neutral-950 drop-shadow-xl shadow-md font-bold" style="border-radius: 50%; width: ${(calculateRadius(bucket.doc_count, maxDocCount, minDocCount) * 2) + (bucket.doc_count > 99 ? bucket.doc_count.toString().length / 4 : 0) }rem; font-size: ${calculateRadius(bucket.doc_count, maxDocCount, minDocCount) * 0.8}rem; height: ${calculateRadius(bucket.doc_count, maxDocCount, minDocCount) * 2}rem; display: flex; align-items: center; justify-content: center;">${bucket.doc_count}</div>`
      });


  
      return <Marker key={bucket.key} position={[(centerLat + lat) / 2, (centerLon + lon)/ 2]} icon={myCustomIcon}
               eventHandlers={{
                  click: (e: any) => {                 
                      const newBounds: [[number, number], [number, number]] = [[bucket.viewport.bounds.top_left.lat, bucket.viewport.bounds.top_left.lon], [bucket.viewport.bounds.bottom_right.lat, bucket.viewport.bounds.bottom_right.lon]];
                      mapInstance.current.flyToBounds( isMobile ? newBounds : adjustBounds(newBounds, 0.5), {duration: 0.25, maxZoom: 18});

                  }
                }}/>

    }
  }
  )}

  {viewResults?.hits?.clientGroups?.map((group: { label: string, uuid: string, lat: number; lon: number; children: any[]; }) => {
    
    if (viewResults.hits.total.value < 200 || (zoom && zoom == 18)) {
      const icon = new leaflet.DivIcon(getLabelMarkerIcon(group.label, 'black', group.children.length > 1 ? group.children.length : undefined))


      return <Marker key={group.uuid} position={[group.lat, group.lon]} icon={icon} riseOnHover={true} eventHandlers={openDocHandler(group.children.length > 1 ? [group.lat, group.lon] : group.uuid[0], group.children)}/>

    }
    else {
      return <CircleMarker key={group.uuid} 
                           center={[group.lat, group.lon]} 
                           radius={zoom && zoom < 10 ? 4 : 8} 
                           pathOptions={{color:'black', weight: zoom && zoom < 10 ? 2 : 3, opacity: 1, fillColor: 'white', fillOpacity: 1}}
                           eventHandlers={openDocHandler(group.children.length > 1 ? [group.lat, group.lon] : group.uuid[0], group.children)}/>
    }
    

  })}
    




  {myLocation && <CircleMarker center={myLocation} radius={10} color="#cf3c3a"/>}

  </>)}}

</Map>
</> : isLoading ?
<div className="flex h-full items-center justify-center">
              <div>
                <Spinner status="Laster inn kartet" className="w-20 h-20"/>
              </div>
</div> 
:  null
    }
    
    <div className={`absolute ${isMobile ? 'top-12 right-0 flex-col p-2 gap-4' : 'bottom-0 w-full'} flex justify-center p-2 gap-2 text-white z-[3001]`}>

<DropdownMenu>
    <DropdownMenuTrigger asChild><button className="p-2 rounded-full border bg-neutral-900 border-white shadow-sm" aria-label="Bakgrunnskart"><PiStackSimple/></button></DropdownMenuTrigger>
    <DropdownMenuContent className="z-[4000] bg-white">
        <DropdownMenuLabel>Bakgrunnskart</DropdownMenuLabel>
        <DropdownMenuSeparator />
        { baseMap != null &&
        <DropdownMenuRadioGroup value={baseMap} onValueChange={setBasemap}>
          {baseMaps.map((item) => (
            <DropdownMenuRadioItem key={item.key} value={item.key} className="text-nowrap cursor-pointer">
              {item.name}
            </DropdownMenuRadioItem>
          ))}
      </DropdownMenuRadioGroup>
        }
    </DropdownMenuContent>
</DropdownMenu>
<DropdownMenu>
    <DropdownMenuTrigger asChild><button className="p-2 rounded-full border bg-neutral-900 border-white shadow-sm" aria-label="Bakgrunnskart"><PiMapPinLine/></button></DropdownMenuTrigger>
    <DropdownMenuContent className="z-[4000] bg-white">
        <DropdownMenuLabel>Markører</DropdownMenuLabel>
        <DropdownMenuSeparator />
        { markerMode != null &&
        <DropdownMenuRadioGroup value={markerMode} onValueChange={setMarkerMode}>
          
            <DropdownMenuRadioItem value='auto' className="text-nowrap cursor-pointer">
              Tilpass ettter antall treff
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value='cluster' className="text-nowrap cursor-pointer">
              Klynger
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value='sample' className="text-nowrap cursor-pointer">
              Tilfeldig utvalg
            </DropdownMenuRadioItem>

      </DropdownMenuRadioGroup>
      }
    </DropdownMenuContent>
</DropdownMenu>
<IconButton onClick={zoomIn}  className="p-2 rounded-full border bg-neutral-900 border-white shadow-sm" label="Zoom inn"><PiMagnifyingGlassPlusFill/></IconButton>
<IconButton onClick={zoomOut} className="p-2 rounded-full border bg-neutral-900 border-white shadow-sm" label="Zoom ut"><PiMagnifyingGlassMinusFill/></IconButton>
<IconButton onClick={getMyLocation} className="p-2 rounded-full border bg-neutral-900 border-white shadow-sm" label="Min posisjon"><PiGpsFix/></IconButton>
    
    

    

    </div>

{false && <div className="absolute bottom-0 left-0 z-[6000] w-[600px] h-[200px] overflow-auto bg-white">
  {JSON.stringify(viewResults, null,  2)}
</div>}
    </>
}