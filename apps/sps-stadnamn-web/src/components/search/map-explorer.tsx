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
  const { searchQueryString, searchFilterParamsString } = useSearchQuery()
  const dataset = useDataset()
  const { childrenData, childrenLoading, childrenBounds } = useContext(ChildrenContext)
  const { isMobile  } = useContext(GlobalContext)

  const { docData, parentData, setSameMarkerList, docLoading, parentLoading, docView } = useContext(DocContext)
  const [parent, setParent] = useQueryState('parent', { history: 'push' })
  const mapInstance = useRef<any>(null);
  const userHasMoved = useRef(false);

  //const prevPaddedBounds = useRef<[[number, number], [number, number]] | null>(null)
  //const prevZoom = useRef<number | null>(null)


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
    if (parent || !bounds || !totalHits || isLoading) {
      return;
    }
    //const [[topLeftLat, topLeftLng], [bottomRightLat, bottomRightLng]] = bounds
    const [[north, west], [south, east]] = bounds

    /*
    if (prevZoom.current) {
      return
    }
   
    if (zoom && prevZoom.current && Math.abs(zoom - prevZoom.current) < 6) {
      console.log("HERE", zoom, prevZoom.current)
      return
    }
    console.log("HERE2", zoom, prevZoom.current)
     
    
    
    //if (prevPaddedBounds.current && zoom && prevZoom.current && prevZoom.current == zoom) {

      //const [[prevNorth, prevWest], [prevSouth, prevEast]] = prevPaddedBounds.current;
      // Check if new bounds are within previous padded bounds
      
      if (north <= prevNorth && south >= prevSouth && 
          west >= prevWest && east <= prevEast) {
        return;
      }
    }
      */
    
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
    const query = `/api/geo/cluster?${queryParams.toString()}&totalHits=${totalHits?.value}`;

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
        setViewResults(data)

      })

      .catch(error => {
        if (error.name !== 'AbortError') {
          console.error('Fetch request failed:', error);
        }
      }
      );

    //console.log("DEPENDENCY", bounds, searchError, geoViewport, zoom, searchQueryString, totalHits, markerMode)
  }, [bounds, searchError, zoom, searchQueryString, totalHits, markerMode, parent, dataset, isLoading]);


// Fly to results, doc or children
useEffect(() => {
  if (!mapInstance.current || isLoading || parentLoading || childrenLoading) return
  
    if (doc && !parent && docData?._source?.location?.coordinates?.length && (docData?._source.uuid == doc || docData._source.children?.includes(doc))) {
      console.log("FLY 1")
      const bounds = mapInstance.current.getBounds();
      const center = [docData?._source?.location?.coordinates[1], docData?._source?.location?.coordinates[0]]
        if (bounds && !bounds.contains(center)) {
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
    else if (resultBounds?.length && !parent && !doc && userHasMoved.current && !docView?.current) {
      console.log("FLY 3")
      mapInstance.current.flyToBounds(resultBounds, { duration: 0.25, maxZoom: 18 });
    }

  }, [mapInstance, isLoading, resultBounds, setCenter, parentLoading, childrenLoading, childrenBounds, parent, doc, docData, docView])







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
          setDoc(selected?.fields?.uuid[0])
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
    {(bounds?.length || (center && zoom) || searchError || (totalHits && totalHits.value > 0)) ? <>
      <Map        
        whenReady={(e: any) => {
            const bounds = e.target.getBounds();
            if (!mapInstance.current) {
              mapInstance.current = e.target
            }
            setBounds([[bounds.getNorth(), bounds.getWest()], [bounds.getSouth(), bounds.getEast()]]);
          
          
        }}
        zoomControl={false}
        {...center && zoom ?
          { center, zoom }
          : resultBounds?.length ? 
            { bounds: resultBounds }
            : { center: [63.4, 10.4], zoom: 5 }
        }
        className='w-full h-full'>
        {({ TileLayer, CircleMarker, Marker, useMapEvents, useMap, Rectangle }: any, leaflet: any) => {

          function EventHandlers() {
            const map = useMap();

            useMapEvents({
              moveend: () => {
                controllerRef.current.abort();
                controllerRef.current = new AbortController();

                console.log("MOVEEND")
                userHasMoved.current = true;
                const bounds = map.getBounds();
                const boundsCenter = bounds.getCenter();
                const mapZoom = map.getZoom()
                if (doc && docView && boundsCenter && mapZoom) {
                  console.log("DOCVIEW", docView)
                  docView.current = {center: [boundsCenter.lat, boundsCenter.lng].join(','), zoom: mapZoom.toString()}
                }
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

              {tiles?.map((bucket: any) => {

                // Sort bucket by children length if dataset is search
                if (dataset == 'search') {
                  bucket.docs.hits.hits.sort((a: any, b: any) => (b.fields.children?.length || 0) - (a.fields.children?.length || 0));
                }

                const latitudes = bucket.docs.hits.hits.map((hit: { fields: { location: { coordinates: any[]; }[]; }; }) => hit.fields.location[0].coordinates[1]);
                const longitudes = bucket.docs.hits.hits.map((hit: { fields: { location: { coordinates: any[]; }[]; }; }) => hit.fields.location[0].coordinates[0]);

                const latSum = latitudes.reduce((acc: any, cur: any) => acc + cur, 0);
                const lonSum = longitudes.reduce((acc: any, cur: any) => acc + cur, 0);

                const hitCount = bucket.docs.hits.hits.length;
                const lat = latSum / hitCount;
                const lon = lonSum / hitCount;

                const autoModeSample = markerMode === 'auto' && !searchFilterParamsString?.length

                if ((markerMode === 'sample') || (autoModeSample && bucket.doc_count > bucket.docs.hits.hits.length) ) {
                  const primary = dataset != 'search' || bucket.docs.hits.hits.some((hit: any) => hit.fields.children?.length && hit.fields.children.length > 1) 
                  return <Fragment key={bucket.key}>{bucket.docs?.hits?.hits?.map((hit: { _id: string, fields: { label: any; uuid: string, children?: string[], location: { coordinates: any[]; }[]; }; key: string; }) => {
                    return <CircleMarker key={hit.fields.uuid}
                    center={[hit.fields.location[0].coordinates[1], hit.fields.location[0].coordinates[0]]}
                    radius={(zoom && zoom < 10 ? 4 : 5) * (primary ? 1 : 1)}
                    pathOptions={{ color: primary ? 'black' : '#494646', weight: zoom && zoom < 10 ? 2 : 3, opacity: 1, fillColor: primary ? 'white' : '#a39a95', fillOpacity: 1 }}
                    eventHandlers={selectDocHandler(hit)} />
                  })}</Fragment>
                }


                // Check if any of the points are within 32 pixels of each other on the y axis. Use "some" to return the first hit
                const tooClose = bucket.docs.hits.hits.length > 1 && bucket.docs.hits.hits.some((hit: any) => {
                  const point = mapInstance.current.latLngToContainerPoint([
                    hit.fields.location[0].coordinates[1],
                    hit.fields.location[0].coordinates[0]
                  ]);

                  return bucket.docs.hits.hits.some((other: any) => {
                    const otherPoint = mapInstance.current.latLngToContainerPoint([
                      other.fields.location[0].coordinates[1],
                      other.fields.location[0].coordinates[0]
                    ]);
                    return Math.abs(point.y - otherPoint.y) < 32;
                  })
      
                });

                /*
                const closestDistances = bucket.docs.hits.hits.length > 1 && bucket.docs.hits.hits.map((hit: any, index: number) => {
                  const point = mapInstance.current.latLngToContainerPoint([
                    hit.fields.location[0].coordinates[1],
                    hit.fields.location[0].coordinates[0]
                  ]);
                  
                  let closestDistance = Infinity;
                  let closestIndex = -1;
                  
                  bucket.docs.hits.hits.forEach((other: any, otherIndex: number) => {
                    if (index === otherIndex) return;
                    
                    const otherPoint = mapInstance.current.latLngToContainerPoint([
                      other.fields.location[0].coordinates[1],
                      other.fields.location[0].coordinates[0]
                    ]);
                    
                    const distance = Math.abs(point.y - otherPoint.y);
                    if (distance < closestDistance) {
                      closestDistance = distance;
                      closestIndex = otherIndex;
                    }
                  });
                  
                  return {
                    distance: closestDistance,
                    index: index,
                    closestIndex: closestIndex
                  };
                });

                console.log(closestDistances)
                */

                const labels = bucket.docs.hits.hits.map((hit: { fields: { label: any; }; }) => hit.fields.label[0]);
                const allLabelsSame = labels.every((label: any, index: number, array: any[]) => label === array[0]);

                

                if (bucket.docs?.hits?.hits?.length > 1 && tooClose && bucket.doc_count == bucket.docs?.hits?.hits?.length && (allLabelsSame || (zoom && zoom > 10))) { //} &&bucket.docs?.hits?.hits?.length > 1 && bucket.doc_count == bucket.docs?.hits?.hits?.length && (zoom && zoom > 8) && ((zoom && zoom < 18 && adjustedDeviation > 0 && adjustedDeviation < 0.1) || (!latitudes.some((lat: any) => lat !== latitudes[0]) && !longitudes.some((lon: any) => lon !== longitudes[0])))) {
                  
                  if (bucket.docs?.hits?.hits?.some((hit: any) => hit.fields.uuid[0] === doc || hit.fields.children?.includes(doc))) {
                    // Return blue marker for other hits than doc
                    return <Fragment key={bucket.key}>{bucket.docs?.hits?.hits?.map((hit: { _id: string, fields: { label: any; uuid: string, children?: string[], location: { coordinates: any[]; }[]; }; key: string; }) => {
                      

                      return <CircleMarker key={hit._id} 
                                           center={[hit.fields.location[0].coordinates[1], hit.fields.location[0].coordinates[0]]} 
                                           radius={5}
                                           fillColor="white"
                                           fillOpacity={1}
                                           color="#00528d"
                                           eventHandlers={selectDocHandler(hit, bucket.docs.hits.hits)}/>
                    })}</Fragment>
                  }
                  else {
                    // Label: add dots if different labels
                  const label = labels[0] + (allLabelsSame ? '' : '...');

                  const icon = new leaflet.DivIcon(getLabelMarkerIcon(label, 'black', bucket.doc_count > 1 ? bucket.doc_count : undefined))

                  return <Marker key={bucket.key} className="drop-shadow-xl" icon={icon} position={[lat, lon]} riseOnHover={true} eventHandlers={selectDocHandler(bucket.docs.hits.hits[0], bucket.docs.hits.hits)} />

                  }


                }
                else if (bucket.doc_count == bucket.docs.hits.hits.length &&  bucket.doc_count < 5 && !tooClose) {  //(false && zoom && zoom > 10) || (bucket.doc_count == 1 || (zoom && (bucket.doc_count == bucket.docs.hits.hits.length || markerMode === 'sample' || (markerMode === 'auto' && searchFilterParamsString?.length)) && adjustedDeviation > 60))) {


                  return <Fragment key={bucket.key}>{bucket.docs?.hits?.hits?.map((hit: { _id: string, fields: { label: any; uuid: string, children?: string[], location: { coordinates: any[]; }[]; }; key: string; }, currentIndex: number) => {
                    /*
                    const point = mapInstance.current.latLngToContainerPoint([
                      hit.fields.location[0].coordinates[1],
                      hit.fields.location[0].coordinates[0]
                    ]);
  
                    // Find others within 32 pixels in the y axis, and don't include the point itself
                    
                    const others = bucket.docs.hits.hits.filter((other: { _id: string, fields: { location: { coordinates: any[]; }[]; }; }, otherIndex: number) => {
                      if (other._id == hit._id) return false
                      const otherPoint = mapInstance.current.latLngToContainerPoint([
                        other.fields.location[0].coordinates[1],
                        other.fields.location[0].coordinates[0]
                      ]);
                      return Math.abs(otherPoint.y - point.y) < 36 && otherIndex > currentIndex
                    });
                    */



                    

                    const icon = new leaflet.DivIcon(getLabelMarkerIcon(hit.fields.label, hit.fields?.children?.length && hit.fields.children.length > 1 ? 'primary' : 'black', undefined, false, (bucket.doc_count > 2 && (zoom && zoom < 18)) ? true : false))
                    

                  
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
                          // Go to center of cluster and zoom in three levels
                          mapInstance.current.setView([(centerLat + lat) / 2, (centerLon + lon) / 2], zoom ? zoom + 3 : 18);
                        }
                      }
                    }} />

                }
              }
              )}

              {parent && childrenData?.length > 0 && viewResults?.hits?.clientGroups?.map((group: { label: string, uuid: string, lat: number; lon: number; children: any[]; }) => {
                let icon
                    
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