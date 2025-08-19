import { Fragment, useContext, useEffect, useRef, useState, useCallback } from "react";
import Map from "../map/map";
import { baseMaps, baseMapKeys, baseMapProps, defaultBaseMap } from "@/config/basemap-config";
import { PiCheckCircleFill, PiCornersOut, PiCrop, PiMagnifyingGlassMinusFill, PiMagnifyingGlassPlusFill, PiMapPinLineFill, PiNavigationArrowFill,  PiStackSimpleFill } from "react-icons/pi";
import IconButton from "../ui/icon-button";
import { SearchContext } from "@/app/search-provider";
import Spinner from "../svg/Spinner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { usePerspective, useSearchQuery } from "@/lib/search-params";
import { getClusterMarker, getLabelMarkerIcon, getUnlabeledMarker } from "./markers";
import { DocContext } from "@/app/doc-provider";
import { useSearchParams } from "next/navigation";
import { xDistance, yDistance, getValidDegree } from "@/lib/map-utils";
import { DropdownMenuItem } from "@radix-ui/react-dropdown-menu";
import * as h3 from "h3-js";
import { useRouter } from "next/navigation";
import wkt from 'wellknown';
import { stringToBase64Url } from "@/lib/utils";


export default function MapExplorer() {
  const { resultBounds, totalHits, searchError, setCoordinatesError, isLoading, allowFitBounds, setAllowFitBounds } = useContext(SearchContext)
  const [markerBounds, setMarkerBounds] = useState<[[number, number], [number, number]] | null>()
  const controllerRef = useRef(new AbortController());
  const [baseMap, setBasemap] = useState<null | string>(null)
  const [markerMode, setMarkerMode] = useState<null | string>(null)
  const [myLocation, setMyLocation] = useState<[number, number] | null>(null)
  const [geoLoading, setGeoLoading] = useState(false)
  const searchParams = useSearchParams()
  const zoom = searchParams.get('zoom') ? parseInt(searchParams.get('zoom')!) : null
  const center = searchParams.get('center') ? searchParams.get('center')!.split(',').map(parseFloat) : null
  const [viewResults, setViewResults] = useState<any>(null)
  const { searchQueryString } = useSearchQuery()
  const perspective = usePerspective()
  const details = searchParams.get('details') || 'doc'



  
  const router = useRouter()

  const parent = searchParams.get('parent')
  const doc = searchParams.get('doc')

  
  // NB: cluster mode has sampling within each cluster if many results, and sample mode has clustering of results with the same coordinates.
  // Tiles are only used in cluster mode
  const tiles = viewResults?.aggregations?.clusterSample?.tiles?.buckets || viewResults?.aggregations?.tiles?.buckets


  const maxDocCount = tiles?.reduce((acc: number, cur: any) => Math.max(acc, cur.doc_count), 0);
  const minDocCount = tiles?.reduce((acc: number, cur: any) => Math.min(acc, cur.doc_count), Infinity);

  const setViewUrlParams = useCallback((zoom: number, center?: [number, number]) => {
      const params = new URLSearchParams(searchParams)
      params.set('zoom', zoom.toString())
      if (center && center.length == 2) {
        params.set('center', center.join(','))
      }
      router.replace(`?${params.toString()}`)
    }, [router, searchParams])
  
  
  

  if (searchParams.get('error') == 'true') {
    throw new Error('Simulated client side error');
  }
  const { docData, parentData, setSameMarkerList, docLoading } = useContext(DocContext)
  
  const mapInstance = useRef<any>(null);
  const autoMode = markerMode === 'auto' ? (searchParams.get('q')?.length && totalHits?.value < 100000 ? 'cluster' : 'sample') : null

  // NB: sample mode, but clustering of results with the same coordinates
  const sampleClusters = useCallback((data: any) => {
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
          const yDist = yDistance(mapInstance.current, firstHit.fields.location[0].coordinates[1], hit.fields.location[0].coordinates[1]);
          const xDist = xDistance(mapInstance.current, firstHit.fields.location[0].coordinates[0], hit.fields.location[0].coordinates[0]);
          if (yDist < 2 && xDist < 2) {
            group.grouped.push(hit);
            added = true;
            break;
          }
          if (yDist < 32 && xDist < (64 + (4 * firstHit.fields.label[0].length))) {
            added = true;
            const mapZoom = mapInstance.current?.getZoom()
            if (mapZoom && mapZoom == 18) {
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
  }, [])

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

  // Fly to doc
  useEffect(() => {
    if (!mapInstance.current || isLoading ) return
    
      if (doc && docData?._source?.location?.coordinates?.length && docData?._source.uuid == doc) {
        const currentBounds = mapInstance.current.getBounds();
        const center = [docData?._source?.location?.coordinates[1], docData?._source?.location?.coordinates[0]]
          if (currentBounds && !currentBounds.contains(center)) {
            mapInstance.current.setView(center, mapInstance.current.getZoom());
          }
      }

    }, [mapInstance, isLoading, doc, docData])

  // Fly to results

  useEffect(() => {
    const mapBounds = mapInstance.current?.getBounds();
    if (!mapBounds || isLoading || geoLoading || !resultBounds?.length || !allowFitBounds) return
    

    // Check if result bounds are contained in map bounds
    const boundsContained = mapBounds.contains(resultBounds)

    if (boundsContained) {
        // Get zoom levels for both current view and result bounds
        const resultBoundsZoom = mapInstance.current.getBoundsZoom(resultBounds);
        const currentZoom = mapInstance.current.getZoom();
        
        // If current zoom is more than 2 levels out from the result bounds zoom
        if (currentZoom < resultBoundsZoom - 2) {
          setAllowFitBounds(false)
          mapInstance.current?.flyToBounds(resultBounds, { duration: 0.25, maxZoom: 18, padding: [50, 50] });
          setViewUrlParams(resultBoundsZoom, [mapBounds.getCenter().lat, mapBounds.getCenter().lng])
        }
    }

    if (geoLoading) {
      return
    }
    setAllowFitBounds(false)

    if (!tiles && !viewResults?.hits?.markers?.length) {
      console.log("Bounds not contained", JSON.stringify(resultBounds), JSON.stringify(mapBounds))
      console.log("Tiles", tiles)
      
      mapInstance.current?.flyToBounds(resultBounds, { duration: 0.25, maxZoom: 18, padding: [50, 50] });
      setViewUrlParams(mapInstance.current.getZoom(), [mapBounds.getCenter().lat, mapBounds.getCenter().lng])
    }
    
    
  }, [resultBounds, allowFitBounds, setAllowFitBounds, isLoading, geoLoading, tiles, viewResults, setViewUrlParams])



  useEffect(() => {
    // Check if the bounds are initialized
    if (!markerBounds?.length || !totalHits || isLoading) {
      return;
    }

    setGeoLoading(true)
    setCoordinatesError(false)
    
    //const [[topLeftLat, topLeftLng], [bottomRightLat, bottomRightLng]] = bounds
    const [[north, west], [south, east]] =  markerBounds

    
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
      cache: 'no-store',
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
          setViewResults((autoMode == 'sample' || markerMode == 'sample') ? sampleClusters(data) : data)
      })

      .catch(error => {
        if (error.name != 'AbortError') {
          console.log("NAME", error.name)
          console.log("ERROR", error.stack)
          setCoordinatesError(true)
          setGeoLoading(false)
        }
        
      })
      .finally(() => {
        setGeoLoading(false)
      })

  }, [ markerBounds, searchError, searchQueryString, totalHits, markerMode, parent, perspective, isLoading, autoMode, sampleClusters, setCoordinatesError, resultBounds, zoom]);





  useEffect(() => { 
    if (baseMap === null) {
      const storedSettings = localStorage.getItem('mapSettings')
      const settings = storedSettings ? JSON.parse(storedSettings) : {}
      
      if (settings[perspective]?.baseMap && baseMapKeys.includes(settings[perspective].baseMap)) {
        setBasemap(settings[perspective].baseMap)
      } else {
        setBasemap(defaultBaseMap[perspective] || baseMaps[0].key)
        // Remove old format if it exists
        localStorage.removeItem('baseMap')
      }
    } else {
      const storedSettings = localStorage.getItem('mapSettings')
      const settings = storedSettings ? JSON.parse(storedSettings) : {}
      
      settings[perspective] = {
        ...settings[perspective],
        baseMap: baseMap
      }
      
      localStorage.setItem('mapSettings', JSON.stringify(settings))
    }
  }, [baseMap, perspective])

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

      setViewUrlParams((zoom || 5) + 1);
    }
  };
  
  const zoomOut = () => {
    if (mapInstance.current) {
      mapInstance.current.zoomOut();
    } else {
      setViewUrlParams(Math.max((zoom || 5) - 1, 1));
      
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

 




  const selectDocHandler = (selected: Record<string, any>, hits?: Record<string, any>[]) => {
    return {
      click: () => {

        const newQueryParams = new URLSearchParams(searchParams)
        

          newQueryParams.set('doc', selected?.fields?.uuid[0])
          newQueryParams.set('details', details)

          if (selected.fields?.["group.id"]) {
            newQueryParams.set('group', stringToBase64Url(selected.fields["group.id"][0]))
          }
          else {
            newQueryParams.delete('group')
          }

        router.push(`?${newQueryParams.toString()}`)

        if (hits && hits.length > 1) {
          setSameMarkerList([...hits].sort((a, b) => a.fields.label[0].localeCompare(b.fields.label[0], 'nb')))
        }
        else {
          
          setSameMarkerList([])
        }
      }
    }
  }

  // Add this state for toggling the grid
  const [showH3Grid, setShowH3Grid] = useState(false);

  // Add state for H3 resolution
  const [h3Resolution, setH3Resolution] = useState(8);

  // Modify getH3Cells to use the resolution state
  const getH3Cells = useCallback((bounds: any) => {
    if (!bounds) return [];
    
    const zoomLevel = mapInstance.current?.getZoom() || 0;
    // Don't show high resolution grids when zoomed out
    if (zoomLevel < 5) return [];
    if (zoomLevel < 7 && h3Resolution > 4) return [];
    if (zoomLevel < 9 && h3Resolution > 5) return [];
    if (zoomLevel < 11 && h3Resolution > 6) return [];
    if (zoomLevel < 13 && h3Resolution > 7) return [];
    if (zoomLevel < 15 && h3Resolution > 8) return [];
    
    const north = bounds.getNorth();
    const south = bounds.getSouth();
    const west = bounds.getWest();
    const east = bounds.getEast();
    
    const bboxPolygon = [
      [north, west],
      [north, east],
      [south, east],
      [south, west],
      [north, west]
    ];
    
    const hexagons = h3.polygonToCells(bboxPolygon, h3Resolution);
    
    return hexagons.map((hexId: string) => {
      const boundary = h3.cellToBoundary(hexId);
      return boundary;
    });
  }, [h3Resolution]);

  return <>
    {(!isLoading || markerBounds || (center && zoom) || searchError) ? <>
      <Map        
        whenReady={(e: any) => {
            const currentBounds = e.target.getBounds();
            setMarkerBounds([[currentBounds.getNorth(), currentBounds.getWest()], [currentBounds.getSouth(), currentBounds.getEast()]]);
            if (!mapInstance.current) {
              mapInstance.current = e.target
            }
            setViewUrlParams(e.target.getZoom(), [currentBounds.getCenter().lat, currentBounds.getCenter().lng])
          
          
        }}
        zoomControl={false}
        {...center && zoom ?
          { center, zoom }
          : { bounds: resultBounds || [[72, -5], [54, 25]] }
        }
        className='w-full h-full'>
        {({ TileLayer, CircleMarker, Marker, useMapEvents, useMap, Rectangle, Polygon }: any, leaflet: any) => {

          function EventHandlers() {
            const map = useMap();

            useMapEvents({
              moveend: () => {
                controllerRef.current.abort();
                controllerRef.current = new AbortController();
                const bounds = map.getBounds();
                const boundsCenter = bounds.getCenter();
                console.log("MOVE END")
                setViewUrlParams(map.getZoom(), [boundsCenter.lat, boundsCenter.lng])
                setMarkerBounds([[bounds.getNorth(), bounds.getWest()], [bounds.getSouth(), bounds.getEast()]]);
              },
            })          
            return null
          }


          return (

            <>
              <EventHandlers />
              {baseMap && <TileLayer maxZoom={18} maxNativeZoom={18} {...baseMapProps[baseMap]} />}

              {/* Add H3 grid overlay */}
              {showH3Grid && mapInstance.current && getH3Cells(mapInstance.current.getBounds()).map((polygon, index) => (
                <Polygon
                  key={index}
                  positions={polygon}
                  pathOptions={{
                    color: '#666',
                    weight: 2,
                    opacity: 1,
                    fillOpacity: 0
                  }}
                />
              ))}

              {/* Add blue hexagon for parent h3 cell */}
              {showH3Grid && parentData?._source?.h3 && (
                <>
                  <Polygon
                    positions={h3.cellToBoundary(parentData._source.h3)}
                    pathOptions={{
                      color: '#0066ff',
                      weight: 2,
                      opacity: 1,
                      fillOpacity: 0.5
                    }}
                  />
                  {/* Add surrounding hexagons with lighter color */}
                  {h3.gridDisk(parentData._source.h3, 1)
                    .filter(hexId => hexId !== parentData._source.h3)
                    .map(hexId => (
                      <Polygon
                        key={hexId}
                        positions={h3.cellToBoundary(hexId)}
                        pathOptions={{
                          color: '#0066ff',
                          weight: 1,
                          opacity: 0.5,
                          fillOpacity: 0.2
                        }}
                      />
                    ))
                  }
                </>
              )}

              {true ? null : markerBounds && markerBounds?.length === 2 && (
                <Rectangle 
                  bounds={markerBounds}
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
                    
                    const icon = new leaflet.DivIcon(getLabelMarkerIcon(hit.fields.label, 'black', undefined, false, (bucket.doc_count > 2 && (zoom && zoom < 18)) ? true : false))
                    

                  
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

              {docData?._source?.area && (
                <Fragment>
                  {(() => {
                    try {
                      const geoJSON = wkt.parse(docData._source.area);
                      if (!geoJSON) return null;

                      // Handle both Polygon and MultiPolygon types
                      const coordinates = geoJSON.type === 'MultiPolygon' 
                        ? (geoJSON as any).coordinates 
                        : [(geoJSON as any).coordinates];

                      return coordinates.map((polygon: number[][][], index: number) => (
                        <Polygon
                          key={`area-${index}`}
                          positions={polygon.map(ring => 
                            // WKT uses [lon, lat] while Leaflet uses [lat, lon]
                            ring.map(([lon, lat]) => [lat, lon])
                          )}
                          pathOptions={{
                            color: '#0066ff',
                            weight: 2,
                            opacity: 0.8,
                            fillOpacity: 0.2
                          }}
                        />
                      ));
                    } catch (error) {
                      console.error('Failed to parse WKT:', error);
                      return null;
                    }
                  })()}
                </Fragment>
              )}

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

    <div className={`absolute top-12 lg:top-auto right-0 flex-col lg:flex-row p-2 gap-2 lg:bottom-0 lg:left-1/2 lg:transform lg:-translate-x-1/2 flex justify-center p-2 gap-2 text-white z-[3001]`}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <IconButton label="Bakgrunnskart" className="p-2 lg:p-2.5 rounded-full border bg-neutral-900 border-white shadow-sm cursor-pointer">
            <PiStackSimpleFill className="lg:text-xl" />
          </IconButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="z-[4000] bg-white">
          <DropdownMenuLabel>Bakgrunnskart</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {baseMap != null && baseMaps.map((item) => (
            <DropdownMenuItem
              key={item.key}
              onClick={() => setBasemap(item.key)}
              className={`flex items-center py-2 px-4 cursor-pointer justify-between ${baseMap === item.key ? "bg-neutral-100" : ""}`}
              aria-selected={baseMap === item.key}
            >
              {item.name}
              {baseMap === item.key && <PiCheckCircleFill className="ml-2 text-neutral-800" aria-hidden="true" />}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuLabel>Overlegg</DropdownMenuLabel>
          <DropdownMenuItem
            onClick={() => setShowH3Grid(!showH3Grid)}
            className={`flex items-center py-2 px-4 cursor-pointer justify-between ${showH3Grid ? "bg-neutral-100" : ""}`}
          >
            Rutenett
            {showH3Grid && <PiCheckCircleFill className="ml-2 text-neutral-800" aria-hidden="true" />}
          </DropdownMenuItem>
          {showH3Grid && (
            <div className="px-4 py-2 flex items-center gap-2">
              <button 
                onClick={() => setH3Resolution(Math.max(0, h3Resolution - 1))}
                className="p-1 rounded bg-neutral-100 hover:bg-neutral-200 disabled:opacity-50"
                disabled={h3Resolution <= 0}
              >
                -
              </button>
              <span className="text-sm">Res: {h3Resolution}</span>
              <button 
                onClick={() => setH3Resolution(Math.min(9, h3Resolution + 1))}
                className="p-1 rounded bg-neutral-100 hover:bg-neutral-200 disabled:opacity-50"
                disabled={h3Resolution >= 9}
              >
                +
              </button>
            </div>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <IconButton label="Markørar" className="p-2 lg:p-2.5 rounded-full border bg-neutral-900 border-white shadow-sm cursor-pointer">
            <PiMapPinLineFill className="lg:text-xl" />
          </IconButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="z-[4000] bg-white">
          <DropdownMenuLabel>Markørar</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {markerMode != null && (
            <>
              <DropdownMenuItem
                onClick={() => setMarkerMode('auto')}
                className={`flex items-center py-2 px-4 cursor-pointer justify-between ${markerMode === 'auto' ? "bg-neutral-100" : ""}`}
                aria-selected={markerMode === 'auto'}
              >
                Automatisk
                {markerMode === 'auto' && <PiCheckCircleFill className="ml-2 text-neutral-800" aria-hidden="true" />}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setMarkerMode('cluster')}
                className={`flex items-center py-2 px-4 cursor-pointer justify-between ${markerMode === 'cluster' ? "bg-neutral-100" : ""}`}
                aria-selected={markerMode === 'cluster'}
              >
                Klynger
                {markerMode === 'cluster' && <PiCheckCircleFill className="ml-2 text-neutral-800" aria-hidden="true" />}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setMarkerMode('sample')}
                className={`flex items-center py-2 px-4 cursor-pointer justify-between ${markerMode === 'sample' ? "bg-neutral-100" : ""}`}
                aria-selected={markerMode === 'sample'}
              >
                Punkter
                {markerMode === 'sample' && <PiCheckCircleFill className="ml-2 text-neutral-800" aria-hidden="true" />}
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      <IconButton onClick={zoomIn} side="top" className="p-2 lg:p-2.5 rounded-full border bg-neutral-900 border-white shadow-sm" label="Zoom inn">
        <PiMagnifyingGlassPlusFill className="lg:text-xl" />
      </IconButton>
      <IconButton onClick={zoomOut} side="top" className="p-2 lg:p-2.5 rounded-full border bg-neutral-900 border-white shadow-sm" label="Zoom ut">
        <PiMagnifyingGlassMinusFill className="lg:text-xl" />
      </IconButton>
      <IconButton onClick={getMyLocation} side="top" className="p-2 lg:p-2.5 rounded-full border bg-neutral-900 border-white shadow-sm" label="Min posisjon">
        <PiNavigationArrowFill className="lg:text-xl" />
      </IconButton>
      <IconButton className="p-2 lg:p-2.5 rounded-full border bg-neutral-900 border-white shadow-sm" label="Zoom til søkeresultat" onClick={() => {
        if (resultBounds?.length) {
          mapInstance.current?.flyToBounds(resultBounds, { duration: 0.25, maxZoom: 18, padding: [50, 50] });
        }
      }}>
        <PiCrop className="lg:text-xl" />
      </IconButton>
    </div>
  </>
}