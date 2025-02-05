import { Fragment, useContext, useEffect, useRef, useState, useCallback } from "react";
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
import { useSearchParams } from "next/navigation";
import { xDistance, yDistance, getValidDegree } from "@/lib/map-utils";


// Clusters where labels are shown if there is enough space
const labelClusters = (currentMap: any, data: any, zoom: number | null) => {
  const markers: {topHit: any, grouped: any[], unlabeled: any[]}[] = []

  data.hits.hits.forEach((hit: any) => {
    let added = false;
    const cadastralParent = hit.fields.within?.[0]
    if (cadastralParent?.length && data.hits.hits.some((hit: any) => hit.fields.uuid[0] == cadastralParent)) {
      return
    }

    for (const group of markers) {
      const firstHit = group.topHit
      if (firstHit) {
      const yDist = yDistance(currentMap, firstHit.fields.location[0].coordinates[1], hit.fields.location[0].coordinates[1]);
      const xDist = xDistance(currentMap, firstHit.fields.location[0].coordinates[0], hit.fields.location[0].coordinates[0]);
      if (yDist < 2 && xDist < 2) {
        group.grouped.push(hit);
        added = true;
        break;
      }
      if (yDist < 32 && xDist < (64 + (4*firstHit.fields.label[0].length))) {
        added = true;
        if (zoom && zoom == 18) {
          group.grouped.push(hit);
        }
        else {
          group.unlabeled.push(hit);
        }
      }

    }
  }
  if (!added) {
    markers.push({topHit: hit, grouped: [], unlabeled: []});
  }
  })

  return {...data, hits: {markers}}
}


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
  const { searchQueryString, searchFilterParamsString } = useSearchQuery()
  const dataset = useDataset()
  const { childrenData, childrenMarkers, childrenLoading, childrenBounds } = useContext(ChildrenContext)
  const { isMobile } = useContext(GlobalContext)
  const programmaticChange = useRef(false)
  const searchParams = useSearchParams()
  const sourceLabel = searchParams.get('sourceLabel')
  const sourceDataset = searchParams.get('sourceDataset')

  const { docData, parentData, setSameMarkerList, docLoading, parentLoading, docView } = useContext(DocContext)
  const [parent, setParent] = useQueryState('parent', { history: 'push' })
  const mapInstance = useRef<any>(null);
  const autoMode = markerMode === 'auto' ? (searchParams.get('q')?.length && totalHits?.value < 100000 ? 'cluster' : 'sample') : null

  //const prevPaddedBounds = useRef<[[number, number], [number, number]] | null>(null)
  //const prevZoom = useRef<number | null>(null)


  

  const isTooClose = (hits: any[], map: any) => {
    if (hits.length <= 1) return false;

    return hits.some((hit) => {
      const point = map.latLngToContainerPoint([
        hit.fields.location[0].coordinates[1],
        hit.fields.location[0].coordinates[0]
      ]);

      return hits.some((other) => {
        const otherPoint = map.latLngToContainerPoint([
          other.fields.location[0].coordinates[1],
          other.fields.location[0].coordinates[0]
        ]);
        return Math.abs(point.y - otherPoint.y) < 32;
      });
    });
  };

  

  const coordinatesSelected = (lat: number, lon: number) => {
    return docData?._source?.location?.coordinates[1] == lat && docData?._source?.location?.coordinates[0] == lon
  }

  

  useEffect(() => {
    // Check if the bounds are initialized
    if (parent || !bounds?.length || !totalHits || isLoading) {
      return;
    }
    //const [[topLeftLat, topLeftLng], [bottomRightLat, bottomRightLng]] = bounds
    const [[north, west], [south, east]] = bounds

    
    // Fetch data based on the new bounds
    const queryParams = new URLSearchParams(searchQueryString);
    // Calculate padding based on height of bounds
    //const yPadding = 0//Math.abs(north - south) /4 ;
    //const xPadding = 0//Math.abs(east - west) /4 ;
    const paddedTopLeftLat = getValidDegree(north, 90);
    const paddedBottomRightLat = getValidDegree(south, -90);
    const paddedTopLeftLng = getValidDegree(west, -180);
    const paddedBottomRightLng = getValidDegree(east, 180);

    queryParams.set('topLeftLat', paddedTopLeftLat);
    queryParams.set('topLeftLng', paddedTopLeftLng); 
    queryParams.set('bottomRightLat', paddedBottomRightLat);
    queryParams.set('bottomRightLng', paddedBottomRightLng);
    if (zoom) {
      queryParams.set('zoom', zoom.toString());
    }

    
    //prevPaddedBounds.current = [[north + yPadding/2, west - xPadding/2], [south - yPadding/2, east + xPadding/2]]
    //prevZoom.current = zoom

    // Both cluster map and sample map use cluster data above zoom 10
    const query = `/api/geo/${autoMode || markerMode}?${queryParams.toString()}&totalHits=${totalHits?.value}`;

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
        setViewResults((autoMode == 'sample' || markerMode == 'sample') ? labelClusters(mapInstance.current, data, zoom) : data)
        console.log((autoMode == 'sample' || markerMode == 'sample') ? labelClusters(mapInstance.current, data, zoom) : data)

      })

      .catch(error => {
        if (error.name !== 'AbortError') {
          console.error('Fetch request failed:', error);
        }
      }
      );

  }, [bounds, searchError, zoom, searchQueryString, totalHits, markerMode, parent, dataset, isLoading, autoMode]);


// Fly to results, doc or children
useEffect(() => {
  if (!mapInstance.current || isLoading || parentLoading || childrenLoading) return
  
    if (doc && !parent && docData?._source?.location?.coordinates?.length && (docData?._source.uuid == doc || docData._source.children?.includes(doc))) {
      const bounds = mapInstance.current.getBounds();
      const center = [docData?._source?.location?.coordinates[1], docData?._source?.location?.coordinates[0]]
        if (bounds && !bounds.contains(center)) {
          console.log("FLY 1")
          mapInstance.current.setView(center, mapInstance.current.getZoom());
        }
    }
    else if (childrenBounds?.length) {
      
      console.log("FLY 2")
      
      const currentBounds = mapInstance.current.getBounds();
      const [[lat1, lon1], [lat2, lon2]] = childrenBounds;
      
      if (!currentBounds.contains([[lat1, lon1], [lat2, lon2]])) {
        mapInstance.current.flyToBounds(childrenBounds, { duration: 0.25, maxZoom: 18 });
      }
    }

  }, [mapInstance, isLoading, setCenter, parentLoading, childrenLoading, childrenBounds, parent, doc, docData])


  // When resultBounds changes
  useEffect(() => {
    //console.log("RESULTBOUNDS", resultBounds)
    if (resultBounds?.length && !zoom && !center) {
      console.log("FLY 3");
      mapInstance.current?.flyToBounds(resultBounds, { duration: 0.25, maxZoom: 18 });

    }
  }, [resultBounds, zoom, center]);



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

  /*
  useEffect(() => {
    return
    //console.log("ZOOM", programmaticChange.current)
    if (!programmaticChange.current && center && zoom) {
      mapInstance.current?.setView([center[0], center[1]], zoom)
    }
    programmaticChange.current = false

  }, [zoom, center])
  */



  const zoomIn = () => {
    if (mapInstance.current) {
      mapInstance.current.zoomIn();
    } else {
      programmaticChange.current = true
      setZoom(prev => (prev || 5) + 1);
    }
  };
  
  const zoomOut = () => {
    if (mapInstance.current) {
      mapInstance.current.zoomOut();
    } else {
      programmaticChange.current = true
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

  const tiles = viewResults?.aggregations?.sample?.tiles?.buckets || viewResults?.aggregations?.tiles?.buckets


  const maxDocCount = tiles?.reduce((acc: number, cur: any) => Math.max(acc, cur.doc_count), 0);
  const minDocCount = tiles?.reduce((acc: number, cur: any) => Math.min(acc, cur.doc_count), Infinity);




  const selectDocHandler = (selected: Record<string, any>, hits?: Record<string, any>[]) => {
    return {
      click: () => {
        
        if (selected.fields?.children?.length == 1) {
          setDoc(selected.fields.children[0])
        }
        else {
          setDoc(selected?.fields?.uuid[0] || selected?._source?.uuid)
        }

        if (hits && hits.length > 1) {
          setSameMarkerList(hits)
        }
        else {
          
          setSameMarkerList([])
        }
      }
    }
  }


  return <>
    {(resultBounds?.length || bounds?.length || (center && zoom) || searchError) ? <>
      <Map        
        whenReady={(e: any) => {
            const bounds = e.target.getBounds();
            if (!mapInstance.current) {
              mapInstance.current = e.target
            }
            setBounds([[bounds.getNorth(), bounds.getWest()], [bounds.getSouth(), bounds.getEast()]]);
            programmaticChange.current = true
            setZoom(e.target.getZoom())
            setCenter([bounds.getCenter().lat, bounds.getCenter().lng])
          
          
        }}
        zoomControl={false}
        {...center && zoom ?
          { center, zoom }
          : { bounds: resultBounds }
        }
        className='w-full h-full'>
        {({ TileLayer, CircleMarker, Marker, useMapEvents, useMap, Rectangle }: any, leaflet: any) => {

          function EventHandlers() {
            const map = useMap();

            useMapEvents({
              moveend: () => {
                controllerRef.current.abort();
                controllerRef.current = new AbortController();

                //console.log("MOVEEND")
                
                const bounds = map.getBounds();
                const boundsCenter = bounds.getCenter();
                const mapZoom = map.getZoom()
                if (doc && docView && boundsCenter && mapZoom) {
                  docView.current = {center: [boundsCenter.lat, boundsCenter.lng].join(','), zoom: mapZoom.toString()}
                }
                programmaticChange.current = true
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

              {true ? null : bounds && bounds?.length === 2 && (
                <Rectangle 
                  bounds={bounds}
                  pathOptions={{ 
                    color: '#ff0000', 
                    weight: 2,
                    fillOpacity: 0.1,
                    dashArray: '5, 5'
                  }}
                />
              )}

              {true ? null : resultBounds?.length === 2 && (
                <Rectangle 
                  bounds={resultBounds}
                  pathOptions={{ 
                    color: '#ff0000', 
                    weight: 2,
                    fillOpacity: 0.1,
                    dashArray: '5, 5'
                  }}
                />
              )}

              {!parent && (markerMode == 'sample' || autoMode == 'sample') && viewResults?.hits?.markers?.map((marker: any) => {
                return <Fragment key={marker.topHit._id}>
                 {![marker.topHit, ...marker.grouped].some((item: any) => coordinatesSelected(item.fields.location[0].coordinates[1], item.fields.location[0].coordinates[0])) ? <Marker key={marker.topHit._id} 
                          position={[marker.topHit.fields.location[0].coordinates[1], marker.topHit.fields.location[0].coordinates[0]]} 
                          icon={new leaflet.DivIcon(getLabelMarkerIcon(marker.topHit.fields.label, 'black', marker.grouped.length ? marker.grouped.length +1 : undefined, true))} 
                          riseOnHover={true} 
                          eventHandlers={selectDocHandler(marker.topHit, [marker.topHit, ...marker.grouped])} />
                          : null}
                  
                  {marker.unlabeled.map((hit: any) => <CircleMarker key={hit._id} center={[hit.fields.location[0].coordinates[1], hit.fields.location[0].coordinates[0]]} radius={5} pathOptions={{ color: 'white', weight: 2, fillColor: 'black', fillOpacity: 0.8 }} eventHandlers={selectDocHandler(hit)} />)}
                </Fragment>
              })}

              {!parent && (markerMode == 'cluster' || autoMode == 'cluster' ) && tiles?.map((bucket: any) => {

                // Sort bucket by children length if dataset is search

                const latitudes = bucket.docs.hits.hits.map((hit: { fields: { location: { coordinates: any[]; }[]; }; }) => hit.fields.location[0].coordinates[1]);
                const longitudes = bucket.docs.hits.hits.map((hit: { fields: { location: { coordinates: any[]; }[]; }; }) => hit.fields.location[0].coordinates[0]);

                const latSum = latitudes.reduce((acc: any, cur: any) => acc + cur, 0);
                const lonSum = longitudes.reduce((acc: any, cur: any) => acc + cur, 0);

                const hitCount = bucket.docs.hits.hits.length;
                const lat = latSum / hitCount;
                const lon = lonSum / hitCount;


                // Check if any of the points are within 32 pixels of each other on the y axis. Use "some" to return the first hit
                const tooClose = isTooClose(bucket.docs.hits.hits, mapInstance.current);

                const labels = bucket.docs.hits.hits.map((hit: { fields: { label: any; }; }) => hit.fields.label[0]);
                const allLabelsSame = labels.every((label: any, index: number, array: any[]) => label === array[0]);

                

                if (bucket.docs?.hits?.hits?.length > 1 && tooClose && bucket.doc_count == bucket.docs?.hits?.hits?.length && (allLabelsSame || (zoom && zoom > 10)) || (zoom && zoom == 18 && bucket.doc_count != bucket.docs?.hits?.hits?.length)) { //} &&bucket.docs?.hits?.hits?.length > 1 && bucket.doc_count == bucket.docs?.hits?.hits?.length && (zoom && zoom > 8) && ((zoom && zoom < 18 && adjustedDeviation > 0 && adjustedDeviation < 0.1) || (!latitudes.some((lat: any) => lat !== latitudes[0]) && !longitudes.some((lon: any) => lon !== longitudes[0])))) {
                  
                  if (bucket.docs?.hits?.hits?.some((hit: any) => coordinatesSelected(hit.fields.location[0].coordinates[1], hit.fields.location[0].coordinates[0]))) {
                    // Return blue marker for other hits than doc
                    return <Fragment key={bucket.key}>
                      
                      {bucket.docs?.hits?.hits?.map((hit: { _id: string, fields: { label: any; uuid: string, children?: string[], location: { coordinates: any[]; }[]; }; key: string; }) => {
                      
                      const primary = hit.fields.children?.length && hit.fields.children.length > 1
                      
                      return <CircleMarker key={hit._id} 
                                           center={[hit.fields.location[0].coordinates[1], hit.fields.location[0].coordinates[0]]} 
                                           radius={primary ? 6 : 4}
                                           fillColor="white"
                                           fillOpacity={1}
                                           color="black"
                                           weight={primary ? 3 : 2}
                                           eventHandlers={selectDocHandler(hit, bucket.docs.hits.hits)}/>
                    })}</Fragment>
                  }
                  else {
                    // Label: add dots if different labels
                  const label = labels[0] + (allLabelsSame ? '' : '...');

                  const icon = new leaflet.DivIcon(getLabelMarkerIcon(label, 'white', bucket.doc_count > 1 ? bucket.doc_count : undefined))

                  return <Marker key={bucket.key} className="drop-shadow-xl" icon={icon} position={[lat, lon]} riseOnHover={true} eventHandlers={selectDocHandler(bucket.docs.hits.hits[0], bucket.docs.hits.hits)} />

                  }


                }
                else if (bucket.doc_count == bucket.docs.hits.hits.length &&  bucket.doc_count < 5 && !tooClose) {  //(false && zoom && zoom > 10) || (bucket.doc_count == 1 || (zoom && (bucket.doc_count == bucket.docs.hits.hits.length || markerMode === 'sample' || (markerMode === 'auto' && searchFilterParamsString?.length)) && adjustedDeviation > 60))) {


                  return <Fragment key={bucket.key}>{bucket.docs?.hits?.hits?.map((hit: { _id: string, fields: { label: any; uuid: string, children?: string[], location: { coordinates: any[]; }[]; }; key: string; }, currentIndex: number) => {
                    
                    let icon
                    if (dataset != 'search' || hit.fields?.children?.length && hit.fields.children.length > 1) {
                      icon = new leaflet.DivIcon(getLabelMarkerIcon(hit.fields.label, 'black', undefined, false, (bucket.doc_count > 2 && (zoom && zoom < 18)) ? true : false))
                    }
                    else {
                      icon = new leaflet.DivIcon(getUnlabeledMarker('black', false))
                    }
                    

                  
                    return (docLoading || hit.fields.uuid[0] != doc) && <Marker key={hit._id}
                      position={[hit.fields.location[0].coordinates[1], hit.fields.location[0].coordinates[0]]}
                      icon={icon}
                      riseOnHover={true}
                      eventHandlers={selectDocHandler(hit)}
                    />

                  }
                  )}</Fragment>
                }

                else {
                  // Calculate center of bounds
                  const centerLat = (bucket.viewport.bounds.top_left.lat + bucket.viewport.bounds.bottom_right.lat) / 2;
                  const centerLon = (bucket.viewport.bounds.top_left.lon + bucket.viewport.bounds.bottom_right.lon) / 2;


                  // getClusterMarker(docCount: number, width: number, height: number, fontSize: number) {
                  const clusterIcon = new leaflet.DivIcon(getClusterMarker(bucket.doc_count, //bucket.doc_count, 
                                                                            calculateRadius(bucket.doc_count, maxDocCount, minDocCount) * 2 + (bucket.doc_count > 99 ? bucket.doc_count.toString().length / 4 : 0),
                                                                            calculateRadius(bucket.doc_count, maxDocCount, minDocCount) * 2,
                                                                            calculateRadius(bucket.doc_count, maxDocCount, minDocCount) * 0.8))

                  return <Marker key={bucket.key} position={[(centerLat + lat) / 2, (centerLon + lon) / 2]} icon={clusterIcon}
                    eventHandlers={{
                      click: () => {
                        // If doc count is same as
                        
                        if (bucket.doc_count == bucket.docs.hits.hits.length || (zoom && zoom > 12)) {
                          const newBounds: [[number, number], [number, number]] = [[bucket.viewport.bounds.top_left.lat, bucket.viewport.bounds.top_left.lon], [bucket.viewport.bounds.bottom_right.lat, bucket.viewport.bounds.bottom_right.lon]];
                          // Get zoom level for bounds
                          const boundsZoom = mapInstance.current.getBoundsZoom(newBounds);
                          // Fly to bounds if zoom level is different, otherwise zoom in one level
                          if (boundsZoom != mapInstance.current.getZoom()) {
                            mapInstance.current.flyToBounds(newBounds, { duration: 0.1, maxZoom: 18 });
                          }
                          else {
                            mapInstance.current.setView([(centerLat + lat) / 2, (centerLon + lon) / 2], zoom ? zoom + 1 : 18);
                          }
                        }
                        else {
                          // Go to center of cluster and zoom in two levels
                          mapInstance.current.setView([(centerLat + lat) / 2, (centerLon + lon) / 2], zoom ? zoom + 2 : 18);
                        }
                      }
                    }} />

                }
              }
              )}

              {parent && childrenMarkers?.map((group: { label: string, uuid: string, lat: number; lon: number; children: any[]; }) => {
                let icon
                if (group.children.length > 1) {
                  icon = new leaflet.DivIcon(getClusterMarker(group.children.length, 
                    calculateRadius(group.children.length, maxDocCount, minDocCount) * 2.5 + (group.children.length > 99 ? group.children.length.toString().length / 4 : 0),
                    calculateRadius(group.children.length, maxDocCount, minDocCount) * 2.5,
                    calculateRadius(group.children.length, maxDocCount, minDocCount) * 1,
                    'bg-primary-600 text-white border-2 border-white'))
                }
                else {
                  icon = new leaflet.DivIcon(getUnlabeledMarker('primary', false))
                }

                return <Marker key={group.uuid} position={[group.lat, group.lon]} icon={icon} riseOnHover={true} eventHandlers={selectDocHandler(group.children[0], group.children)} />
              })}



                  
                  

              { myLocation && <CircleMarker center={myLocation} radius={10} color="#cf3c3a" />}
              
              { docData?._source?.location?.coordinates?.[1] && doc != parent && docData?._source?.uuid == doc && <Marker 
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
        <Spinner status="Lastar inn kartet" className="w-20 h-20" />
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
        <DropdownMenuTrigger asChild><IconButton label="Markørar" className="p-2 rounded-full border bg-neutral-900 border-white shadow-sm"><PiMapPinLineFill /></IconButton></DropdownMenuTrigger>
        <DropdownMenuContent className="z-[4000] bg-white">
          <DropdownMenuLabel>Markørar</DropdownMenuLabel>
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