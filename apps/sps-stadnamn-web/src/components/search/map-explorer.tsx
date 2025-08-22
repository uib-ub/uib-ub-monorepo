import { Fragment, useContext, useEffect, useRef, useState, useCallback, useMemo } from "react";
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
import { useSearchParams } from "next/navigation";
import { xDistance, yDistance, getValidDegree } from "@/lib/map-utils";
import { DropdownMenuItem } from "@radix-ui/react-dropdown-menu";
import * as h3 from "h3-js";
import { useRouter } from "next/navigation";
import wkt from 'wellknown';
import { stringToBase64Url } from "@/lib/utils";
import useDocData from "@/state/hooks/doc-data";
import { useQueries } from "@tanstack/react-query";
import { adjustBounds, calculateRadius, boundsFromZoomAndCenter, getGridSize, calculateZoomFromBounds, calculateCenterFromBounds } from "./map-utils";


export default function MapExplorer() {
  const { resultBounds, totalHits, searchError, setCoordinatesError, isLoading, allowFitBounds, setAllowFitBounds } = useContext(SearchContext)
    
  const controllerRef = useRef(new AbortController());
  const [baseMap, setBasemap] = useState<null | string>(null)
  const [markerMode, setMarkerMode] = useState<null | string>(null)
  const [myLocation, setMyLocation] = useState<[number, number] | null>(null)
  const [geoLoading, setGeoLoading] = useState(false)
  const searchParams = useSearchParams()
  const [viewResults, setViewResults] = useState<any>(null)
  const { searchQueryString } = useSearchQuery()
  const perspective = usePerspective()
  const details = searchParams.get('details') || 'doc'
  const urlZoom = searchParams.get('zoom') ? parseInt(searchParams.get('zoom')!) : null
  const urlCenter = searchParams.get('center') ? (searchParams.get('center')!.split(',').map(parseFloat) as [number, number]) : null
  
  // Calculate initial bounds based on zoom level and center before map renders
  const [snappedBounds, setSnappedBounds] = useState<[[number, number], [number, number]]>(() => {
    if (urlCenter && urlCenter.length === 2 && urlZoom !== null) {
      // Calculate bounds based on zoom level and center point
      return boundsFromZoomAndCenter(urlCenter as [number, number], urlZoom);
    }
    if (resultBounds?.length) {
      return resultBounds
    }
    // Fallback to default bounds
    return [[72, -5], [54, 25]];
  });

  const [currentZoom, setCurrentZoom] = useState<number>(urlZoom || calculateZoomFromBounds(snappedBounds))
  const [currentCenter, setCurrentCenter] = useState<[number, number]>(urlCenter ? urlCenter : calculateCenterFromBounds(snappedBounds))


  const gridSize = useRef<number>(getGridSize(snappedBounds))


  
  const router = useRouter()
  const parent = searchParams.get('parent')
  const doc = searchParams.get('doc')

  // Add state for H3 resolution
  const [h3Resolution, setH3Resolution] = useState(8);

      // Add state for geotile cells and intersecting cells
  const [markerCells, setMarkerCells] = useState<number[][][]>([]);
  const [currentPrecision, setCurrentPrecision] = useState<number>(8); // Store current precision

 


  const markerResults = useQueries({
    queries: markerCells.map((cell, index) => ({
      queryKey: ['markerResults', cell],
      queryFn: async () => {
        console.log("FETCHING GEOTILE CELL", cell)
        const res = await fetch(`/api/geo/${queryEndpoint}?topLeftLat=${cell[0][0]}&topLeftLng=${cell[0][1]}&bottomRightLat=${cell[2][0]}&bottomRightLng=${cell[2][1]}&${queryEndpoint == 'sample' ? 'size=100' : 'totalHits=' + totalHits?.value}`)
        if (!res.ok) {
          throw new Error('Failed to fetch geotile cells')
        }
        const data = await res.json()
        return data.hits.hits.map((hit: any) => hit.fields)
      }
    }))
  })



  if (searchParams.get('error') == 'true') {
    throw new Error('Simulated client side error');
  }
  const { docData, docLoading } = useDocData()
  
  const mapInstance = useRef<any>(null);
  
   // Cluster if:
  // Cluster mode
  // Zoom level < 8 - but visualized as labels. Necessary to avoid too large number of markers in border regions or coastal regions where the intersecting cell only covers a small piece of land.
  // Auto mode and ases where it's useful to se clusters of all results: query string or filter with few results
  const autoMode = markerMode === 'auto' ? (searchParams.get('q')?.length || totalHits?.value < 100000 ? 'cluster' : 'sample') : null
  const queryEndpoint = (markerMode == 'cluster' || mapInstance.current?.getZoom() < 8 || autoMode == 'cluster') ? 'cluster' : 'sample'

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
        
        // If current zoom is more than 2 levels out from the result bounds zoom
        if (currentZoom < resultBoundsZoom - 2) {
          setAllowFitBounds(false)
          mapInstance.current?.flyToBounds(resultBounds, { duration: 0.25, maxZoom: 18, padding: [50, 50] });
          return
        }
    }

    if (geoLoading) {
      return
    }
    
    /*
    if (!tiles && !viewResults?.hits?.markers?.length) {
      setAllowFitBounds(false)
      mapInstance.current?.flyToBounds(resultBounds, { duration: 0.25, maxZoom: 18, padding: [50, 50] });
    }
      */
    
    
  }, [resultBounds, allowFitBounds, setAllowFitBounds, isLoading, geoLoading, viewResults])





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
          //setSameMarkerList([...hits].sort((a, b) => a.fields.label[0].localeCompare(b.fields.label[0], 'nb')))
        }
        else {
          
          //setSameMarkerList([])
        }
      }
    }
  }

    // Add this state for toggling the grid
    const [showH3Grid, setShowH3Grid] = useState(false);
    const [showGeotileGrid, setShowGeotileGrid] = useState(true);
    
    // State to store debug viewport bounds for real-time updates
    const [debugViewportBounds, setDebugViewportBounds] = useState<[[number, number], [number, number]] | null>(null);
  
    // Function to check if a polygon intersects with a rectangle
    const checkPolygonIntersection = useCallback((polygon: number[][], bounds: [[number, number], [number, number]]) => {
      if (!polygon || !bounds || polygon.length < 4) return false;
      
      const [[rectNorth, rectWest], [rectSouth, rectEast]] = bounds;
      
      // Get polygon bounds
      const polygonLats = polygon.map(p => p[0]);
      const polygonLngs = polygon.map(p => p[1]);
      const polyNorth = Math.max(...polygonLats);
      const polySouth = Math.min(...polygonLats);
      const polyEast = Math.max(...polygonLngs);
      const polyWest = Math.min(...polygonLngs);
      
      // Check if rectangles overlap (simple bounding box intersection)
      return !(rectEast < polyWest || rectWest > polyEast || rectNorth < polySouth || rectSouth > polyNorth);
    }, []);




  // No cleanup needed for the new smart update system

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

  // Function to convert geotile key to bounds
  const geotileKeyToBounds = useCallback((key: string) => {
    console.log('Converting geotile key:', key);
    const parts = key.split('/');
    if (parts.length !== 3) {
      console.log('Invalid key format:', key, 'parts:', parts);
      return null;
    }
    
    const zoom = parseInt(parts[0]);
    const x = parseInt(parts[1]);
    const y = parseInt(parts[2]);
    
    console.log('Tile coordinates:', { zoom, x, y });
    
    // Web Mercator tile bounds calculation (same as used by most web mapping services)
    const n = Math.pow(2, zoom);
    
    // Longitude bounds
    const west = (x / n) * 360 - 180;
    const east = ((x + 1) / n) * 360 - 180;
    
    // Latitude bounds using Web Mercator inverse
    const latRad1 = Math.atan(Math.sinh(Math.PI * (1 - 2 * y / n)));
    const latRad2 = Math.atan(Math.sinh(Math.PI * (1 - 2 * (y + 1) / n)));
    
    const north = (latRad1 * 180) / Math.PI;
    const south = (latRad2 * 180) / Math.PI;
    
    const bounds = [[north, west], [south, east]] as [[number, number], [number, number]];
    console.log('Calculated bounds:', bounds);
    return bounds;
  }, []);

  return <>
     <>
      <Map        
        whenReady={(e: any) => {
            if (!mapInstance.current) {
              mapInstance.current = e.target;
            }
        }}
        zoomControl={false}
        bounds={ snappedBounds }
        className='w-full h-full'>
        {({ TileLayer, CircleMarker, Marker, useMapEvents, useMap, Rectangle, Polygon }: any, leaflet: any) => {

          function EventHandlers() {
            const map = useMap();
            useMapEvents({
              move: () => {
                const liveBounds = map.getBounds();
                const [[north, west], [south, east]] = [[liveBounds.getNorth(), liveBounds.getWest()], [liveBounds.getSouth(), liveBounds.getEast()]]
                const liveZoom = map.getZoom();
                if (liveZoom < 10) {
                  return
                  
                  // Set marker cells to whole world if it isn't already one cell covering the world
                  if (!markerCells[0] || markerCells[0][0][0] !== 72 || markerCells[0][0][1] !== -180) {
                    setMarkerCells([[[72, -180], [72, 180], [-72, 180], [-72, -180]]])
                  }

                  
                }
                
                if (liveZoom != currentZoom) {
                  console.log("ZOOM", liveZoom, currentZoom)
                  const newPrecision = getGridSize([[north, west], [south, east]]);
                  setCurrentPrecision(newPrecision);
                  console.log("NEW PRECISION", newPrecision)
                }

                // Calculate grid resolution based on current precision
                
                // Calculate tile coordinates for the viewport bounds
                const xMin = Math.floor(((west + 180) / 360) * currentPrecision);
                const xMax = Math.floor(((east + 180) / 360) * currentPrecision);
                
                // Convert latitude to tile Y coordinates (Web Mercator projection)
                const yMin = Math.floor(((1 - Math.log(Math.tan(north * Math.PI / 180) + 1 / Math.cos(north * Math.PI / 180)) / Math.PI) / 2) * currentPrecision);
                const yMax = Math.floor(((1 - Math.log(Math.tan(south * Math.PI / 180) + 1 / Math.cos(south * Math.PI / 180)) / Math.PI) / 2) * currentPrecision);
                
                // Ensure bounds are within valid range
                const clampedXMin = Math.max(0, xMin);
                const clampedXMax = Math.min(currentPrecision - 1, xMax);
                const clampedYMin = Math.max(0, yMin);
                const clampedYMax = Math.min(currentPrecision - 1, yMax);
                
                const newCells: number[][][] = [];
                
                // Generate only the cells that intersect with the viewport
                for (let x = clampedXMin; x <= clampedXMax; x++) {
                  for (let y = clampedYMin; y <= clampedYMax; y++) {
                    // Convert tile coordinates back to lat/lng bounds
                    const tileWest = (x / currentPrecision) * 360 - 180;
                    const tileEast = ((x + 1) / currentPrecision) * 360 - 180;
                    
                    const tileNorth = (Math.atan(Math.sinh(Math.PI * (1 - 2 * y / currentPrecision))) * 180 / Math.PI);
                    const tileSouth = (Math.atan(Math.sinh(Math.PI * (1 - 2 * (y + 1) / currentPrecision))) * 180 / Math.PI);
                    
                    // Create cell polygon (clockwise order)
                    const cell = [
                      [tileNorth, tileWest],
                      [tileNorth, tileEast],
                      [tileSouth, tileEast],
                      [tileSouth, tileWest],
                      [tileNorth, tileWest] // Close the polygon
                    ];
                    
                    newCells.push(cell);
                  }
                }
                
                console.log("NEW CELLS", newCells);
                
                // Only update state if the cells have actually changed
                if (markerCells.length !== newCells.length || 
                    !markerCells.every((cell, index) => 
                      cell.length === newCells[index].length &&
                      cell.every((coord, coordIndex) => 
                        coord[0] === newCells[index][coordIndex][0] && 
                        coord[1] === newCells[index][coordIndex][1]
                      )
                    )) {
                      console.log("NEW CELLS", newCells)
                  setMarkerCells(newCells);
                }
                

              },
              moveend: () => {
                const mapBounds = map.getBounds();
                const mapCenter = mapBounds.getCenter();
                const mapZoom = map.getZoom();
                const newBounds: [[number, number], [number, number]] = [[mapBounds.getNorth(), mapBounds.getWest()], [mapBounds.getSouth(), mapBounds.getEast()]]
                setSnappedBounds(newBounds)
                setCurrentZoom(mapZoom)
                setCurrentCenter([mapCenter.lat, mapCenter.lng])
                const newParams = new URLSearchParams(searchParams)
                newParams.set('zoom', map.getZoom().toString())
                newParams.set('center', `${mapCenter.lat},${mapCenter.lng}`)
                
                // Update URL without triggering router events
                const newUrl = `${window.location.pathname}?${newParams.toString()}`;
                window.history.replaceState({ ...window.history.state, as: newUrl, url: newUrl }, '', newUrl);
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
                  key={`h3-${index}`}
                  positions={polygon}
                  pathOptions={{
                    color: '#666',
                    weight: 2,
                    opacity: 1,
                    fillOpacity: 0
                  }}
                />
              ))}

              {/* Draw geotile query results */}
              {showGeotileGrid && markerResults.filter(result => result.isSuccess).map(result => result.data).map((dataArray, index) => {
                if (dataArray?.length > 0) {                  
                  // Function to check if a point is within the debug viewport bounds
                  const isPointInDebugViewport = (lat: number, lng: number) => {
                    if (!debugViewportBounds) return false;
                    const [[north, west], [south, east]] = debugViewportBounds;
                    return lat <= north && lat >= south && lng >= west && lng <= east;
                  };

                  return (
                    <Fragment key={`result-group-${index}`}>
                      {/* Individual result markers with labels - only render if within debug viewport */}
                      {dataArray.filter((item: any) => {
                        const lat = item.location?.[0]?.coordinates?.[1];
                        const lng = item.location?.[0]?.coordinates?.[0];
                        return lat && lng && isPointInDebugViewport(lat, lng);
                      }).map((item: any) => (
                        <Marker
                          key={`result-${item.uuid?.[0] || Math.random()}`}
                          position={[item.location?.[0]?.coordinates?.[1], item.location?.[0]?.coordinates?.[0]]}
                          icon={new leaflet.DivIcon(getLabelMarkerIcon(item.label?.[0] || 'Unknown', 'black', undefined, true))}
                          riseOnHover={true}
                          eventHandlers={selectDocHandler(item)}
                        />
                      ))}
                    </Fragment>
                  );
                }
                return null;
              })}

              {/* Add Geotile grid overlay */}
              {markerCells?.map((cell, index) => {
                // Check if this cell intersects with the debug viewport using efficient index lookup

                
                return (

                    <Rectangle
                      key={`geotile-${index}`}
                      bounds={[[cell[0][0], cell[0][1]], [cell[2][0], cell[2][1]]]}
                      pathOptions={{
                        color: '#00ff00',
                        weight: 3,
                        fill: false,
                        dashArray: '5, 5'
                      }}
                    />
                );
              })}
                {/* Add debug viewport rectangle (current view minus 10%) */}
              {showGeotileGrid && mapInstance.current && debugViewportBounds && (
                <Rectangle 
                  bounds={debugViewportBounds}
                  pathOptions={{ 
                    color: '#ff0066', 
                    weight: 3,
                    fill: false,
                    dashArray: '15, 10'
                  }}
                />
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
    </>

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
            H3 Rutenett
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
          <DropdownMenuItem
            onClick={() => setShowGeotileGrid(!showGeotileGrid)}
            className={`flex items-center py-2 px-4 cursor-pointer justify-between ${showGeotileGrid ? "bg-neutral-100" : ""}`}
          >
            Geotile Rutenett
            {showGeotileGrid && <PiCheckCircleFill className="ml-2 text-neutral-800" aria-hidden="true" />}
          </DropdownMenuItem>
          {showGeotileGrid && (
            <div className="px-4 py-2">
              <div className="text-xs text-neutral-600 mb-1">
                Auto-precision: {currentPrecision}
              </div>
              <div className="text-xs text-neutral-500">
                Rødt rektangel viser zoom +2 nivå
              </div>
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
      <IconButton onClick={() => mapInstance.current?.zoomIn()} side="top" className="p-2 lg:p-2.5 rounded-full border bg-neutral-900 border-white shadow-sm" label="Zoom inn">
        <PiMagnifyingGlassPlusFill className="lg:text-xl" />
      </IconButton>
      <IconButton onClick={() => mapInstance.current?.zoomOut()} side="top" className="p-2 lg:p-2.5 rounded-full border bg-neutral-900 border-white shadow-sm" label="Zoom ut">
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