import { Fragment, useContext, useEffect, useRef, useState, useCallback, useMemo } from "react";
import Map from "../map/map";
import { baseMaps, baseMapKeys, defaultBaseMap, baseMapLookup } from "@/config/basemap-config";
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
import { DropdownMenuItem } from "@radix-ui/react-dropdown-menu";
import * as h3 from "h3-js";
import { useRouter } from "next/navigation";
import wkt from 'wellknown';
import { stringToBase64Url } from "@/lib/utils";
import useDocData from "@/state/hooks/doc-data";
import { useInfiniteQuery, useQueries } from "@tanstack/react-query";
import { xDistance, yDistance, boundsFromZoomAndCenter, getGridSize, calculateZoomFromBounds, calculateCenterFromBounds } from "@/lib/map-utils";


export default function MapExplorer({containerDimensions}: {containerDimensions: {width: number, height: number}}) {
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
      
      return boundsFromZoomAndCenter(containerDimensions, urlCenter as [number, number], urlZoom);
    }
    if (resultBounds?.length) {
      return resultBounds
    }
    // Fallback to default bounds
    return [[72, -5], [54, 25]];
  });

  const [currentZoom, setCurrentZoom] = useState<number>(urlZoom || calculateZoomFromBounds(snappedBounds))
  const [currentCenter, setCurrentCenter] = useState<[number, number]>(urlCenter ? urlCenter : calculateCenterFromBounds(snappedBounds))


  const gridSizeRef = useRef<{ gridSize: number, precision: number}>(getGridSize(snappedBounds, currentZoom));


  
  const router = useRouter()
  const parent = searchParams.get('parent')
  const doc = searchParams.get('doc')
  const mapInstance = useRef<any>(null);

  // Add state for H3 resolution
  const [h3Resolution, setH3Resolution] = useState(8);

      // Add state for geotile cells and intersecting cells
  interface GeotileCell {
    key: string; // Add this property
    precision: number;
    x: number;
    y: number;
    bounds?: [[number, number], [number, number]]; // Add optional bounds property
  }

  const [markerCells, setMarkerCells] = useState<GeotileCell[]>([])
  //console.log("MARKER CELLS", markerCells)

    // Cluster if:
  // Cluster mode
  // Zoom level < 8 - but visualized as labels. Necessary to avoid too large number of markers in border regions or coastal regions where the intersecting cell only covers a small piece of land.
  // Auto mode and ases where it's useful to se clusters of all results: query string or filter with few results
  const autoMode = markerMode === 'auto' ? (searchParams.get('q')?.length || totalHits?.value < 100000 ? 'counts' : 'labels') : null
  const activeMarkerMode = (markerMode == 'counts' || mapInstance.current?.getZoom() < 8 || autoMode == 'counts') ? 'counts' : 'labels'



  const markerResults = useQueries({
    queries: markerCells.map(cell => {
      const key = `${cell.precision}/${cell.x}/${cell.y}`
      
      return ({
        queryKey: ['markerResults', key, searchQueryString],
        onError: (error: any) => {
          console.error("Error fetching geotile cell data:", error);
          setGeoLoading(false);
          setCoordinatesError(true);
        },
        //placeHolder: (prevData: any) => prevData,
        queryFn: async () => {
          const queryParams = new URLSearchParams(searchQueryString);
          console.log("FETCH MARKERS", cell, searchQueryString)

          const res = await fetch(`/api/markers/labels/${cell.precision}/${cell.x}/${cell.y}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`)
          if (!res.ok) {
            throw new Error('Failed to fetch geotile cells')
          }
          const data = await res.json()
            //console.log("BUCKETS", data.aggregations.grid.buckets)
            return data.aggregations.grid.buckets
            


        }
      })
    })
  })


  const markerResultsRef = useRef<any[]>([]) // Prevents empty array while loading new cells



  const processedMarkerResults = useMemo(() => {
    if (markerResults.some(result => result.isLoading)) {
      return markerResultsRef?.current
    }
    console.log("PROCESS MARKERS", markerResults)

    const buckets = markerResults.flatMap((result) => result.isSuccess && result.data ? result.data : [])
    
    const labeledMarkersLookup: Record<string, Record<string, any>[]> = {}
    const bucketNeighbourMap: Record<string, any[]> = buckets.reduce<Record<string, any[]>>((acc, bucket) => {
      const [z, x, y] = bucket.key.split('/').map(Number);
      const neighbors = [
        `${z}/${x-1}/${y}`,     // West
        `${z}/${x+1}/${y}`,     // East
        `${z}/${x}/${y-1}`,     // North
        `${z}/${x}/${y+1}`,     // South
        `${z}/${x-1}/${y-1}`,   // North-West
        `${z}/${x+1}/${y-1}`,   // North-East
        `${z}/${x-1}/${y+1}`,   // South-West
        `${z}/${x+1}/${y+1}`    // South-East
      ];
      acc[bucket.key] = neighbors;
      return acc;
    }, {})



    const markers: Record<string, any>[] = buckets.flatMap((bucket: any) => {
      return bucket.top.hits.hits.map((hit: Record<string, any>, markerIndex: number) => {
      return {markerIndex, tile: bucket.key, ...hit}
    })
    })
    .sort((a: any, b: any) => a.markerIndex - b.markerIndex) // process the first hit in all buckets first, then the second hit etc.
    .map((hit: Record<string, any>) => {

      const tileArea = [hit.tile, ...bucketNeighbourMap[hit.tile]]
      

      const hasOverlappingLabel = tileArea.some(tileKey => {
        return labeledMarkersLookup[tileKey]?.some((otherHit: Record<string, any>) => {

          const yDist = yDistance(mapInstance.current, otherHit.fields.location[0].coordinates[1], hit.fields.location[0].coordinates[1]);
          const xDist = xDistance(mapInstance.current, otherHit.fields.location[0].coordinates[0], hit.fields.location[0].coordinates[0]);
          return yDist < 32 && xDist < (64 + (4 * otherHit.fields.label[0].length));
        })
      })

      if (!hasOverlappingLabel) {
        if (!labeledMarkersLookup[hit.tile]) {
          labeledMarkersLookup[hit.tile] = []
        }
        labeledMarkersLookup[hit.tile].push(hit)
        return {...hit, showLabel: true}
      }
      return hit
    })


      markerResultsRef.current = markers

    return markers
  }, [markerResults, markerMode]);




  if (searchParams.get('error') == 'true') {
    throw new Error('Simulated client side error');
  }
  const { docData } = useDocData()
  
  
  



  const updateMarkerGrid = useCallback((liveBounds: [[number, number], [number, number]], liveZoom: number, gridSizeData: {gridSize: number, precision: number}, currentCells: GeotileCell[]) => {
    const { gridSize, precision } = gridSizeData
    const [[north, west], [south, east]] = liveBounds
    
    if (liveZoom <= 4 || gridSize === 1) {
      // Set marker cells to whole world if it isn't already one cell covering the world
      if (currentCells.length === 0 || currentCells[0]?.key != '0/0/0') {
        setMarkerCells([{
          key: '0/0/0',
          precision: 0,
          x: 0,
          y: 0,
          bounds: [[90, -180], [-90, 180]] // Add world bounds
        }])
      }
      return
    }
      
    // Calculate tile coordinates for the viewport bounds
    const xMin = Math.floor(((west + 180) / 360) * gridSize);
    const xMax = Math.floor(((east + 180) / 360) * gridSize);
    
    // Convert latitude to tile Y coordinates (Web Mercator projection)
    const yMin = Math.floor(((1 - Math.log(Math.tan(north * Math.PI / 180) + 1 / Math.cos(north * Math.PI / 180)) / Math.PI) / 2) * gridSize);
    const yMax = Math.floor(((1 - Math.log(Math.tan(south * Math.PI / 180) + 1 / Math.cos(south * Math.PI / 180)) / Math.PI) / 2) * gridSize);
    
    // Ensure bounds are within valid range
    const clampedXMin = Math.max(0, xMin);
    const clampedXMax = Math.min(gridSize - 1, xMax);
    const clampedYMin = Math.max(0, yMin);
    const clampedYMax = Math.min(gridSize - 1, yMax); // Fixed: should use gridSize-1, not 0
    
    const newCells: GeotileCell[] = [];
    
    // Generate only the cells that intersect with the viewport
    for (let x = clampedXMin; x <= clampedXMax; x++) {
      for (let y = clampedYMin; y <= clampedYMax; y++) {
        // Calculate bounds for the cell
        const n = Math.pow(2, precision);
        
        // Longitude bounds
        const tileWest = (x / n) * 360 - 180;
        const tileEast = ((x + 1) / n) * 360 - 180;
        
        // Latitude bounds using Web Mercator inverse
        const latRad1 = Math.atan(Math.sinh(Math.PI * (1 - 2 * y / n)));
        const latRad2 = Math.atan(Math.sinh(Math.PI * (1 - 2 * (y + 1) / n)));
        
        const tileNorth = (latRad1 * 180) / Math.PI;
        const tileSouth = (latRad2 * 180) / Math.PI;
        
        // Create cell with zoom, x, y coordinates and bounds
        const key = `${precision}/${x}/${y}`;
        const cell: GeotileCell = {
          key,
          precision,
          x,
          y,
          bounds: [[tileNorth, tileWest], [tileSouth, tileEast]]
        }
        
        newCells.push(cell);
      }
    }

    setMarkerCells(newCells);
  }, [setMarkerCells]);



    useEffect(() => {
      updateMarkerGrid(snappedBounds, currentZoom, gridSizeRef.current, markerCells)
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
    
    
  }, [resultBounds, allowFitBounds, setAllowFitBounds, isLoading, geoLoading, viewResults, currentZoom])





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
      if (storedMarkerMode && ['auto', 'counts', 'labels'].includes(storedMarkerMode)) {
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
        

          newQueryParams.set('doc', selected?.uuid[0])
          newQueryParams.set('details', details)

          if (selected?.["group.id"]) {
            newQueryParams.set('group', stringToBase64Url(selected["group.id"][0]))
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
    const [showGeotileGrid, setShowGeotileGrid] = useState(false);
    


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
    const parts = key.split('/');
    if (parts.length !== 3) {
      return null;
    }
    
    const precision = parseInt(parts[0]);
    const x = parseInt(parts[1]);
    const y = parseInt(parts[2]);
    
    
    // Web Mercator tile bounds calculation (same as used by most web mapping services)
    const n = Math.pow(2, precision);
    
    // Longitude bounds
    const west = (x / n) * 360 - 180;
    const east = ((x + 1) / n) * 360 - 180;
    
    // Latitude bounds using Web Mercator inverse
    const latRad1 = Math.atan(Math.sinh(Math.PI * (1 - 2 * y / n)));
    const latRad2 = Math.atan(Math.sinh(Math.PI * (1 - 2 * (y + 1) / n)));
    
    const north = (latRad1 * 180) / Math.PI;
    const south = (latRad2 * 180) / Math.PI;
    
    const bounds = [[north, west], [south, east]] as [[number, number], [number, number]];
    return bounds;
  }, []);

  const isPointInViewport = useCallback((lat: number, lng: number) => {
                    const bounds = mapInstance?.current?.getBounds();
                    if (!bounds) return false;
                    const [[north, west], [south, east]] = [[bounds.getNorth(), bounds.getWest()], [bounds.getSouth(), bounds.getEast()]];
                    return lat <= north && lat >= south && lng >= west && lng <= east;
                  }, [mapInstance]);



  return <>
      <Map        
        whenReady={(e: any) => {
            if (!mapInstance.current) {
              mapInstance.current = e.target;
            }
            //console.log("MAP READY")
            //console.log("SNAP BOUNDS", snappedBounds)
            //console.log("RESULT BOUNDS", mapInstance.current.getBounds())
        }}
        zoomControl={false}
        bounds={ snappedBounds }
        className='w-full h-full'>
        {({ TileLayer, CircleMarker, Marker, useMapEvents, useMap, Rectangle, Polygon }: any, leaflet: any) => {

          function EventHandlers() {
            const map = useMap();
            useMapEvents({
              zoomend: () => {
                //console.log("ZOOMEND")
                // Update precision if zoom level changes
                const mapZoom = map.getZoom();
                if (mapZoom != currentZoom) {
                  const mapBounds = map.getBounds();
                  if (currentZoom >= 4) {
                    const [[north, west], [south, east]] = [[mapBounds.getNorth(), mapBounds.getWest()], [mapBounds.getSouth(), mapBounds.getEast()]] 
                    gridSizeRef.current = getGridSize([[north, west], [south, east]], mapZoom);;
                  }
                  
                  // Always update marker grid after zoom
                  //console.log("ZOOM UPDATE")
                  updateMarkerGrid([[mapBounds.getNorth(), mapBounds.getWest()], [mapBounds.getSouth(), mapBounds.getEast()]], mapZoom, gridSizeRef.current, markerCells);
                  setCurrentZoom(mapZoom);
                }
              },
              move: () => {
                
                const mapBounds = map.getBounds();
                const mapZoom = map.getZoom();
                if (currentZoom != mapZoom) {
                  return
                }
              
                // Check if we have any cells
                if (markerCells.length === 0) {
                  return
                }
                
                // For the world tile case, no need to update
                if (markerCells.length === 1 && markerCells[0].precision === 0) {
                  return
                }
              
                const [[north, west], [south, east]] = [[mapBounds.getNorth(), mapBounds.getWest()], [mapBounds.getSouth(), mapBounds.getEast()]]
              
                const mapBoundsPoints = [
                  [north, west],
                  [north, east],
                  [south, east],
                  [south, west]
                ]
              
                // Check if all map bounds corners are contained within our current cell collection
              if (!mapBoundsPoints.every((point) => {
                return markerCells.some((cell) => {
                  if (!cell.bounds) return false;
                  const [[cellNorth, cellWest], [cellSouth, cellEast]] = cell.bounds;
                  return point[0] <= cellNorth && point[0] >= cellSouth && 
                        point[1] >= cellWest && point[1] <= cellEast;
                });
              })) {
                //console.log("MOVE UPDATE - map bounds not fully covered by current cells")
                updateMarkerGrid([[north, west], [south, east]], map.getZoom(), gridSizeRef.current, markerCells);
              }
              },
              moveend: () => {
                const mapBounds = map.getBounds();
                const mapCenter = mapBounds.getCenter();
                const newBounds: [[number, number], [number, number]] = [[mapBounds.getNorth(), mapBounds.getWest()], [mapBounds.getSouth(), mapBounds.getEast()]]
                setSnappedBounds(newBounds)
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
              {baseMap && <TileLayer maxZoom={18} maxNativeZoom={18} {...baseMapLookup[baseMap].props} />}

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
              { processedMarkerResults?.map((item: any) => {

     
                     const lat = item.fields.location?.[0]?.coordinates?.[1];
                      const lng = item.fields.location?.[0]?.coordinates?.[0];

                      // Ensure lat/lng exist (0 is a valid value) and are finite
                      if (lat == undefined || lng == undefined || !isPointInViewport(lat, lng)) {
                        return null;
                      }
                      return (
                      <Fragment key={`result-${item.fields.group?.id || item.fields.uuid[0]}`}>
                      { item.showLabel ?   (
                        <Marker
                          position={[lat, lng]}
                          icon={new leaflet.DivIcon(getLabelMarkerIcon(item.fields.label?.[0] || 'Unknown', baseMap && baseMapLookup[baseMap]?.markers ? 'white' : 'black', undefined, true))}
                          riseOnHover={true}
                          eventHandlers={selectDocHandler(item.fields)}
                        />
                      ) : <CircleMarker 
                          // render the circle in the same pane as HTML markers so it is on top
                          pane="markerPane"
                          center={[lat, lng]} 
                          radius={6} 
                          stroke={true}
                          weight={1}
                          color={baseMap && baseMapLookup[baseMap]?.markers ? '#fff' : '#000'} 
                          fillColor={baseMap && baseMapLookup[baseMap]?.markers ? '#000' : '#fff'} 
                          fillOpacity={1}
                          eventHandlers={selectDocHandler(item.fields)}
                        />
                    }
                      </Fragment>
                )
              }
              )}

              {/* Debug: draw rectangle for each backend bucket/tile */}
              {showGeotileGrid && processedMarkerResults && markerResults.map((result) => result.data?.map((bucket: any) => {
                return <Rectangle
                  key={`bucket-${bucket.key}`}
                  bounds={geotileKeyToBounds(bucket.key)!}
                  pathOptions={{
                    color: '#ff7800',
                    weight: 1,
                    opacity: 0.8,
                    fillOpacity: 0
                  }}
                />
              }))}



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
                Auto-precision: {gridSizeRef.current?.gridSize}
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
                onClick={() => setMarkerMode('counts')}
                className={`flex items-center py-2 px-4 cursor-pointer justify-between ${markerMode === 'counts' ? "bg-neutral-100" : ""}`}
                aria-selected={markerMode === 'counts'}
              >
                Klynger
                {markerMode === 'counts' && <PiCheckCircleFill className="ml-2 text-neutral-800" aria-hidden="true" />}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setMarkerMode('labels')}
                className={`flex items-center py-2 px-4 cursor-pointer justify-between ${markerMode === 'labels' ? "bg-neutral-100" : ""}`}
                aria-selected={markerMode === 'labels'}
              >
                Etiketter
                {markerMode === 'labels' && <PiCheckCircleFill className="ml-2 text-neutral-800" aria-hidden="true" />}
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