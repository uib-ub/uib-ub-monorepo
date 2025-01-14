import { Fragment, useContext, useEffect, useRef, useState } from "react";
import Map from "../map/map";
import { baseMaps, baseMapKeys, baseMapProps, defaultBaseMap } from "@/config/basemap-config";
import { PiMagnifyingGlassMinusFill, PiMagnifyingGlassPlusFill, PiMapPinLineFill, PiNavigationArrowFill,  PiStackSimpleFill } from "react-icons/pi";
import IconButton from "../ui/icon-button";
import { SearchContext } from "@/app/search-provider";
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
import { useDataset, useSearchQuery } from "@/lib/search-params";
import { getClusterMarker, getLabelMarkerIcon, getUnlabeledMarker } from "./markers";
import { DocContext } from "@/app/doc-provider";
import { ChildrenContext } from "@/app/children-provider";
import { GlobalContext } from "@/app/global-provider";


export default function MapExplorer() {
  const { resultBounds, totalHits, searchError, isLoading } = useContext(SearchContext)
  const [bounds, setBounds] = useState<[[number, number], [number, number]] | null>()
  const controllerRef = useRef(new AbortController());
  const [baseMap, setBasemap] = useState<null | string>(null)
  const [markerMode, setMarkerMode] = useState<null | string>(null)
  const [myLocation, setMyLocation] = useState<[number, number] | null>(null)
  const [zoom, setZoom] = useQueryState('zoom', parseAsInteger);
  const [center, setCenter] = useQueryState('center', parseAsArrayOf(parseAsFloat));
  const [doc, setDoc] = useQueryState('doc', { history: 'push', scroll: true })
  const [viewResults, setViewResults] = useState<any>(null)
  const { searchQueryString } = useSearchQuery()
  const dataset = useDataset()
  const { childrenData } = useContext(ChildrenContext)
  const { isMobile } = useContext(GlobalContext)

  const { docData, parentData, setSameMarkerList, docLoading } = useContext(DocContext)
  const [parent, setParent] = useQueryState('parent', { history: 'push' })
  const initialBoundsSet = useRef(false);
  const mapInstance = useRef<any>(null);




  const getValidDegree = (degrees: number, maxValue: number): string => {
    if (Math.abs(degrees) > Math.abs(maxValue)) {
      return maxValue.toString()
    }
    return degrees.toString()
  }

  useEffect(() => {
    if (parent && childrenData?.length) {

      const childrenWithCoordinates = childrenData.filter((child: any) => child.fields?.location?.[0]?.coordinates?.length)
      const clientGroups: any[] = []
      const markerOutput = { hits: { total: { value: childrenWithCoordinates.length }, clientGroups } }
      const markerLookup: Record<string, any> = {}

      childrenWithCoordinates.forEach((child: any) => {
        const lat = child.fields?.location[0].coordinates[1] || child._source.location.coordinates[1]
        const lon = child.fields?.location[0].coordinates[0] || child._source.location.coordinates[0]
        const uuid = child.fields.uuid || child._source.uuid
        let marker = markerLookup[lat + "_" + lon]
        if (!marker) {
          marker = { children: [], lat, lon, uuid }
          markerLookup[lat + "_" + lon] = marker
          markerOutput.hits.clientGroups.push(marker)
        }

        const label = child.fields.label || child._source.label

        if (typeof marker.label == 'string' && marker.label !== label && !marker.label.endsWith('...')) {
          marker.label = marker.label + "..."
        } else {
          marker.label = label
        }

        marker.children.unshift(child)
      })

      setViewResults(markerOutput)





      
    }
  }, [parent, childrenData, dataset])



  useEffect(() => {
    // Check if the bounds are initialized
    if (parent || !bounds || isLoading) {
      return;
    }

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




    const query = `/api/geo/${(zoom && zoom > 14 && 'cluster' ) || (markerMode === 'cluster' && 'cluster') || (markerMode === 'sample' && 'sample') || (totalHits?.value < 10000 ? 'cluster' : 'sample')}?${queryParams.toString()}`;

    fetch(query, {
      signal: controllerRef.current.signal,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },

    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Request failed: ' + response.statusText);
        }
        return response.json(); 
      })
       
      .then(data => {

        if (data.hits.hits.length > 0) {

          const clientGroups: any[] = []
          const markerOutput = { hits: { total: { value: data.hits.total.value }, clientGroups } }
          const markerLookup: Record<string, any> = {}

          data.hits.hits.forEach((hit: { fields: { label: any; uuid: string, location: { coordinates: any[]; }[]; }; key: string; }) => {
            const lat = hit.fields.location[0].coordinates[1]
            const lon = hit.fields.location[0].coordinates[0]
            const uuid = hit.fields.uuid
            let marker = markerLookup[lat + "_" + lon]
            if (!marker) {
              marker = { children: [], lat, lon, uuid }
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

    //console.log("DEPENDENCY", bounds, searchError, geoViewport, zoom, searchQueryString, totalHits, markerMode)
  }, [bounds, resultBounds, searchError, zoom, searchQueryString, totalHits, markerMode, parent, dataset, parentData, isLoading]);



useEffect(() => {
  if (!mapInstance.current || isLoading || (zoom && center)
  ) return
  console.log("USEEFFECT", mapInstance.current, isLoading, zoom, center)
    if (resultBounds?.length) {
      console.log("FITTING BOUNDS", resultBounds)
      mapInstance.current.flyToBounds(resultBounds, { duration: 0.25, maxZoom: 18 });
    }
    else {
      console.log("ADDING MISSING PARAMS", center, zoom)
        const bounds = mapInstance.current.getBounds();
        const boundsCenter = bounds.getCenter();
        setCenter([boundsCenter.lat, boundsCenter.lng]);
      setZoom(mapInstance.current.getZoom());
    }
  }, [mapInstance, isLoading, center, zoom, resultBounds, setCenter, setZoom])


  
  useEffect(() => {
    // Only proceed if we have all required properties and the map is fully loaded
    if (!center || 
        !mapInstance?.current) {  // Add this check
      return;
    }
    
    const bounds = mapInstance.current.getBounds();
    if (bounds && !bounds.pad(-0.5).contains(center)) {
      mapInstance.current.setView(center, zoom);
    }
  }, [center, zoom, mapInstance]);




  useEffect(() => {
    if (baseMap === null) {
      const storedSettings = localStorage.getItem('mapSettings')
      const settings = storedSettings ? JSON.parse(storedSettings) : {}
      
      if (settings[dataset]?.baseMap && baseMapKeys.includes(settings[dataset].baseMap)) {
        setBasemap(settings[dataset].baseMap)
      } else {
        setBasemap(defaultBaseMap[dataset] || baseMaps[0].key)
        // Remove old format if it exists
        localStorage.removeItem('baseMap')
      }
    } else {
      const storedSettings = localStorage.getItem('mapSettings')
      const settings = storedSettings ? JSON.parse(storedSettings) : {}
      
      settings[dataset] = {
        ...settings[dataset],
        baseMap: baseMap
      }
      
      localStorage.setItem('mapSettings', JSON.stringify(settings))
    }
  }, [baseMap, dataset])

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



  const zoomIn = () => {
    if (mapInstance.current) {
      mapInstance.current.zoomIn();
    } else {
      setZoom(prev => (prev || 5) + 1);
    }
  };
  
  const zoomOut = () => {
    if (mapInstance.current) {
      mapInstance.current.zoomOut();
    } else {
      setZoom(prev => Math.max((prev || 5) - 1, 1));
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


  const selectDocHandler = (hits: Record<string, any>[]) => {
    return {
      click: () => {
        if (hits?.[0]?.fields?.children?.length == 1) {
          console.log("redirect to child")
          setDoc(hits[0].fields.children[0])
        }
        else {
          console.log("select self", hits)
          setDoc(hits?.[0]?.fields?.uuid[0])
        }

        if (hits.length > 1) {
          setSameMarkerList(hits)
        }
        else {
          
          setSameMarkerList([])
        }
      }
    }
  }



  return <>
    {(bounds?.length || (center && zoom) || searchError || (totalHits && totalHits.value > 0)) ? <>
      <Map        
        whenReady={(e: any) => {
            const bounds = e.target.getBounds();
            if (!mapInstance.current) {
              mapInstance.current = e.target
            }
            console.log("SETTING BOUNDS", bounds)
            setBounds([[bounds.getNorth(), bounds.getWest()], [bounds.getSouth(), bounds.getEast()]]);
          
          
        }}
        zoomControl={false}
        {...center && zoom ?
          { center, zoom }
          : { center: [63.4, 10.4], zoom: 5 }
        }
        className='w-full h-full'>
        {({ TileLayer, CircleMarker, Marker, useMapEvents, useMap }: any, leaflet: any) => {

          function EventHandlers() {
            const map = useMap();

            useMapEvents({
              moveend: () => {
                if (isLoading) return
                console.log("MOVEEND")
                const bounds = map.getBounds();
                const boundsCenter = bounds.getCenter();
                setCenter([boundsCenter.lat, boundsCenter.lng]);
                setZoom(map.getZoom());
                setBounds([[bounds.getNorth(), bounds.getWest()], [bounds.getSouth(), bounds.getEast()]]);
              },
            })          

            return null
          }




          return (

            <>
              <EventHandlers />
              {baseMap && <TileLayer maxZoom={18} maxNativeZoom={18} {...baseMapProps[baseMap]} />}


              {viewResults?.aggregations?.tiles?.buckets.map((bucket: any) => {

                const latitudes = bucket.docs.hits.hits.map((hit: { fields: { location: { coordinates: any[]; }[]; }; }) => hit.fields.location[0].coordinates[1]);
                const longitudes = bucket.docs.hits.hits.map((hit: { fields: { location: { coordinates: any[]; }[]; }; }) => hit.fields.location[0].coordinates[0]);

                const latSum = latitudes.reduce((acc: any, cur: any) => acc + cur, 0);
                const lonSum = longitudes.reduce((acc: any, cur: any) => acc + cur, 0);

                const hitCount = bucket.docs.hits.hits.length;
                const lat = latSum / hitCount;
                const lon = lonSum / hitCount;

                


                // If no coordinates are different from the average
                if (bucket.docs?.hits?.hits?.length > 1 && (zoom && zoom > 14) && !latitudes.some((lat: any) => lat !== latitudes[0]) && !longitudes.some((lon: any) => lon !== longitudes[0])) {
                  
                  if (docData?._source?.uuid && bucket.docs.hits.hits.some((hit: any) => hit.fields.uuid[0] == docData?._source?.uuid)) {
                    return null
                  }

                  // Label: add dots if different labels
                  const labels = bucket.docs.hits.hits.map((hit: { fields: { label: any; }; }) => hit.fields.label);
                  const label = labels[0] + (labels.slice(1, labels.length).some((label: any) => label !== labels[0]) ? '...' : '');

                  const icon = new leaflet.DivIcon(getLabelMarkerIcon(label, 'black', bucket.doc_count > 1 ? bucket.doc_count : undefined))

                  return <Marker key={bucket.key} className="drop-shadow-xl" icon={icon} position={[lat, lon]} riseOnHover={true} eventHandlers={selectDocHandler(bucket.docs.hits.hits)} />

                }
                // If point view
                else if (markerMode === 'sample' && bucket.docs?.hits?.hits?.length > 1) {
                  return <Fragment key={bucket.key}>{bucket.docs?.hits?.hits?.map((hit: { _id: string, fields: { label: any; uuid: string, children?: string[], location: { coordinates: any[]; }[]; }; key: string; }) => {
                    return <CircleMarker key={hit.fields.uuid}
                    center={[hit.fields.location[0].coordinates[1], hit.fields.location[0].coordinates[0]]}
                    radius={(zoom && zoom < 10 ? 4 : 8) * (hit.fields?.children?.length && hit.fields.children.length > 1 ? 1.25 : 1)}
                    pathOptions={{ color: 'black', weight: zoom && zoom < 10 ? 2 : 3, opacity: 1, fillColor: hit.fields?.children?.length && hit.fields.children.length > 1 ? '#cf3c3a' : 'white', fillOpacity: 1 }}
                    eventHandlers={selectDocHandler([hit])} />
                  })}</Fragment>
                }

                else if (bucket.docs?.hits?.hits?.length == 1 || (zoom && zoom > 14 && bucket.doc_count == bucket.docs.hits.hits.length)) {

                  return <Fragment key={bucket.key}>{bucket.docs?.hits?.hits?.map((hit: { _id: string, fields: { label: any; uuid: string, children?: string[], location: { coordinates: any[]; }[]; }; key: string; }) => {
                    const icon = new leaflet.DivIcon(getLabelMarkerIcon(hit.fields.label, hit.fields?.children?.length && hit.fields.children.length > 1 ? 'primary' : 'black', undefined, false, (bucket.doc_count > 2 && (zoom && zoom < 18)) ? true : false))

                    return (docLoading || hit.fields.uuid[0] != doc) && <Marker key={hit._id}
                      position={[hit.fields.location[0].coordinates[1], hit.fields.location[0].coordinates[0]]}
                      icon={icon}
                      riseOnHover={true}
                      eventHandlers={selectDocHandler([hit])}
                    />

                  }
                  )}</Fragment>
                }

                else {
                  // Calculate center of bounds
                  const centerLat = (bucket.viewport.bounds.top_left.lat + bucket.viewport.bounds.bottom_right.lat) / 2;
                  const centerLon = (bucket.viewport.bounds.top_left.lon + bucket.viewport.bounds.bottom_right.lon) / 2;


                  // getClusterMarker(docCount: number, width: number, height: number, fontSize: number) {
                  const clusterIcon = new leaflet.DivIcon(getClusterMarker(bucket.doc_count, 
                                                                            calculateRadius(bucket.doc_count, maxDocCount, minDocCount) * 2 + (bucket.doc_count > 99 ? bucket.doc_count.toString().length / 4 : 0),
                                                                            calculateRadius(bucket.doc_count, maxDocCount, minDocCount) * 2,
                                                                            calculateRadius(bucket.doc_count, maxDocCount, minDocCount) * 0.8))


                  return <Marker key={bucket.key} position={[(centerLat + lat) / 2, (centerLon + lon) / 2]} icon={clusterIcon}
                    eventHandlers={{
                      click: () => {
                        const newBounds: [[number, number], [number, number]] = [[bucket.viewport.bounds.top_left.lat, bucket.viewport.bounds.top_left.lon], [bucket.viewport.bounds.bottom_right.lat, bucket.viewport.bounds.bottom_right.lon]];
                        mapInstance.current.flyToBounds(isMobile ? newBounds : adjustBounds(newBounds, 0.5), { duration: 0.25, maxZoom: 18 });

                      }
                    }} />

                }
              }
              )}

              {viewResults?.hits?.clientGroups?.map((group: { label: string, uuid: string, lat: number; lon: number; children: any[]; }) => {

                if (viewResults.hits.total.value < 200 || (zoom && zoom > 16)) {
                  let icon
                  if (parent) {

                    
                    if (group.children.length > 1) {
                      icon = new leaflet.DivIcon(getClusterMarker(group.children.length, 
                        calculateRadius(group.children.length, maxDocCount, minDocCount) * 2.5 + (group.children.length > 99 ? group.children.length.toString().length / 4 : 0),
                        calculateRadius(group.children.length, maxDocCount, minDocCount) * 2.5,
                        calculateRadius(group.children.length, maxDocCount, minDocCount) * 1,
                        'bg-primary-600 text-white border-2 border-white'))
                    }
                    else {
                      icon = new leaflet.DivIcon(getUnlabeledMarker('primary', group.children.length))
                    }
                  }
                  else {
                    icon = new leaflet.DivIcon(getLabelMarkerIcon(group.label, group.children.length == 1 && group.children[0].fields?.children?.length > 1 ? 'primary' : 'black', group.children.length > 1 ? group.children.length : undefined, false, (viewResults.hits.total.value > 100 && (zoom && zoom < 18)) ? true : false))
                  }
                  

                  if (docData?._source?.uuid && group.children.some((hit: any) => hit.fields.uuid[0] == docData?._source?.uuid)) {
                    return null
                  }


                  return <Marker key={group.uuid} position={[group.lat, group.lon]} icon={icon} riseOnHover={true} eventHandlers={selectDocHandler(group.children)} />

                }
                else {
                  return <CircleMarker key={group.uuid}
                    center={[group.lat, group.lon]}
                    radius={(zoom && zoom < 10 ? 4 : 8) * (group.children.length > 1 || group.children[0].fields?.children?.length > 1 ? 1.25 : 1)}
                    pathOptions={{ color: 'black', weight: zoom && zoom < 10 ? 2 : 3, opacity: 1, fillColor: group.children.length == 1 && group.children[0].fields?.children?.length > 1 ? '#cf3c3a' : 'white', fillOpacity: 1 }}
                    eventHandlers={ selectDocHandler(group.children)} />
                }


              })}

              { myLocation && <CircleMarker center={myLocation} radius={10} color="#cf3c3a" />}
              
              { docData?._source?.location?.coordinates?.[1] && doc != parent && <Marker 
                  zIndexOffset={1000}
                  position={[
                    docData._source.location.coordinates[1],
                    docData._source.location.coordinates[0]
                  ]} 
                  icon={new leaflet.DivIcon(getLabelMarkerIcon(docData._source.label, 'accent', 0, true))}/>
                }

            </>)
        }}
        

      </Map>
    </> : <div className="flex h-full items-center justify-center">
      <div>
        <Spinner status="Laster inn kartet" className="w-20 h-20" />
      </div>
    </div>
    }

    <div className={`absolute ${isMobile ? 'top-12 right-0 flex-col p-2 gap-4' : 'bottom-0 left-1/2 transform -translate-x-1/2'} flex justify-center p-2 gap-2 text-white z-[3001]`}>

      <DropdownMenu>
        <DropdownMenuTrigger asChild><IconButton label="Bakgrunnskart" className="p-2 rounded-full border bg-neutral-900 border-white shadow-sm"><PiStackSimpleFill /></IconButton></DropdownMenuTrigger>
        <DropdownMenuContent className="z-[4000] bg-white">
          <DropdownMenuLabel>Bakgrunnskart</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {baseMap != null &&
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
        <DropdownMenuTrigger asChild><IconButton label="Markører" className="p-2 rounded-full border bg-neutral-900 border-white shadow-sm"><PiMapPinLineFill /></IconButton></DropdownMenuTrigger>
        <DropdownMenuContent className="z-[4000] bg-white">
          <DropdownMenuLabel>Markører</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {markerMode != null &&
            <DropdownMenuRadioGroup value={markerMode} onValueChange={setMarkerMode}>

              <DropdownMenuRadioItem value='auto' className="text-nowrap cursor-pointer">
                Automatisk
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value='cluster' className="text-nowrap cursor-pointer">
                Klynger
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value='sample' className="text-nowrap cursor-pointer">
                Punkter
              </DropdownMenuRadioItem>

            </DropdownMenuRadioGroup>
          }
        </DropdownMenuContent>
      </DropdownMenu>
      <IconButton onClick={zoomIn} side="top" className="p-2 rounded-full border bg-neutral-900 border-white shadow-sm" label="Zoom inn"><PiMagnifyingGlassPlusFill /></IconButton>
      <IconButton onClick={zoomOut} side="top" className="p-2 rounded-full border bg-neutral-900 border-white shadow-sm" label="Zoom ut"><PiMagnifyingGlassMinusFill /></IconButton>
      <IconButton onClick={getMyLocation} side="top" className="p-2 rounded-full border bg-neutral-900 border-white shadow-sm" label="Min posisjon"><PiNavigationArrowFill/></IconButton>
    </div>
  </>
}