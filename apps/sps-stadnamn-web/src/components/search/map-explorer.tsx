import { Fragment, useEffect, useRef, useState, useCallback, useMemo, useContext } from "react";
import Map from "../map/map";
import { baseMaps, baseMapKeys, defaultBaseMap, baseMapLookup } from "@/config/basemap-config";
import { PiBookOpen, PiBookOpenFill, PiCheckCircleFill, PiCrop, PiMagnifyingGlassMinusFill, PiMagnifyingGlassPlusFill, PiMapPinLineFill, PiNavigationArrowFill, PiStackSimpleFill } from "react-icons/pi";
import IconButton from "../ui/icon-button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useSearchQuery } from "@/lib/search-params";
import { getClusterMarker, getLabelMarkerIcon } from "./markers";
import { useSearchParams } from "next/navigation";
import { DropdownMenuItem } from "@radix-ui/react-dropdown-menu";
import * as h3 from "h3-js";
import { useRouter } from "next/navigation";
import wkt from 'wellknown';
import { stringToBase64Url } from "@/lib/param-utils";
import useDocData from "@/state/hooks/doc-data";
import { useQueries } from "@tanstack/react-query";
import { xDistance, yDistance, boundsFromZoomAndCenter, getGridSize, calculateZoomFromBounds, calculateRadius } from "@/lib/map-utils";
import useSearchData from "@/state/hooks/search-data";
import { useGroup, usePerspective } from "@/lib/param-hooks";
import { GlobalContext } from "@/app/global-provider";
import Clickable from "../ui/clickable/clickable";
import useGroupData from "@/state/hooks/group-data";
const debug = process.env.NODE_ENV === 'development'



export default function MapExplorer({ containerDimensions }: { containerDimensions: { width: number, height: number } }) {
  const { totalHits, searchBounds, searchLoading, searchUpdatedAt } = useSearchData()

  const controllerRef = useRef(new AbortController());
  const [baseMap, setBasemap] = useState<null | string>(null)
  const [markerMode, setMarkerMode] = useState<null | string>(null)
  const [myLocation, setMyLocation] = useState<[number, number] | null>(null)
  const searchParams = useSearchParams()
  const { searchQueryString, searchFilterParamsString } = useSearchQuery()
  const perspective = usePerspective()
  const urlZoom = searchParams.get('zoom') ? parseInt(searchParams.get('zoom')!) : null
  const urlCenter = searchParams.get('center') ? (searchParams.get('center')!.split(',').map(parseFloat) as [number, number]) : null
  const allowFitBounds = useRef(false)
  const { groupValue } = useGroup()
  const { groupLoading } = useGroupData()
  const { isMobile } = useContext(GlobalContext)
  


  // Calculate initial bounds based on zoom level and center before map renders
  const [snappedBounds, setSnappedBounds] = useState<[[number, number], [number, number]]>(() => {
    if (urlCenter && urlCenter.length === 2 && urlZoom !== null) {
      // Calculate bounds based on zoom level and center point

      return boundsFromZoomAndCenter(containerDimensions, urlCenter as [number, number], urlZoom);
    }
    if (searchBounds?.length) {
      return searchBounds
    }
    // Fallback to default bounds
    return [[72, -5], [54, 25]];
  });

  const [zoomState, setZoomState] = useState<number>(urlZoom || calculateZoomFromBounds(snappedBounds))
  const suspendMarkerDiscoveryRef = useRef(false)


  const gridSizeRef = useRef<{ gridSize: number, precision: number }>(getGridSize(snappedBounds, zoomState));



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

  // Cluster if:
  // Cluster mode
  // Zoom level < 8 - but visualized as labels. Necessary to avoid too large number of markers in border regions or coastal regions where the intersecting cell only covers a small piece of land.
  // Auto mode and ases where it's useful to se clusters of all results: query string or filter with few results
  const activeMarkerMode = markerMode === 'auto' ? ((!searchParams.get('q')?.length || totalHits?.value > 10000) ? 'labels' : 'counts') : markerMode



  const markerResults = useQueries({
    queries: markerCells.map(cell => {
      const key = `${cell.precision}/${cell.x}/${cell.y}`

      return ({
        queryKey: ['markerResults', key, searchQueryString],
        placeHolder: (prevData: any) => prevData,
        queryFn: async () => {
          const queryParams = new URLSearchParams(searchQueryString);
          const res = await fetch(`/api/markers/${cell.precision}/${cell.x}/${cell.y}${queryParams.toString() ? `?${queryParams.toString()}` : ''}${searchFilterParamsString ? `&totalHits=${totalHits.value}` : ''}`, { signal: controllerRef.current.signal })
          const data = await res.json()
          return data.aggregations.grid.buckets
        }
      })
    })
  })


  const markerResultsRef = useRef<any[]>([]) // Prevents empty array while loading new cells
  //console.log("MARKER RESULTS", markerResults, markerResultsRef.current)



  const processedMarkerResults = useMemo(() => {
    if (markerResults.some(result => result.isLoading)) {
      return markerResultsRef?.current
    }

    const buckets = markerResults.flatMap((result) => result.isSuccess && result.data ? result.data : [])
    //("BUCKETS", buckets)


    const countItems: Record<string, any>[] = []
    let minDocCount = Infinity
    let maxDocCount = 0
    const labeledMarkersLookup: Record<string, Record<string, any>[]> = {}
    const seenGroups = new Set<string>()

    buckets.forEach((bucket) => {
      if ( zoomState > 16 || activeMarkerMode == 'labels' || bucket.doc_count == 1) {


        const [z, x, y] = bucket.key.split('/').map(Number);
        const neighborTiles = [
          `${z}/${x}/${y}`,     // Center
          `${z}/${x - 1}/${y}`,     // West
          `${z}/${x + 1}/${y}`,     // East
          `${z}/${x}/${y - 1}`,     // North
          `${z}/${x}/${y + 1}`,     // South
          `${z}/${x - 1}/${y - 1}`,   // North-West
          `${z}/${x + 1}/${y - 1}`,   // North-East
          `${z}/${x - 1}/${y + 1}`,   // South-West
          `${z}/${x + 1}/${y + 1}`    // South-East
        ];

        const evaluateNeighborMarkers = (self: Record<string, any>, neighbourMarkers: Record<string, any>[]): {other: Record<string, any> | null, otherIndex: number | null} => {
          let otherIndex = 0
          for (const other of neighbourMarkers) {
            const yDist = yDistance(
              mapInstance.current,
              other.fields.location[0].coordinates[1],
              self.fields.location[0].coordinates[1]
            );
            const xDist = xDistance(
              mapInstance.current,
              other.fields.location[0].coordinates[0],
              self.fields.location[0].coordinates[0]
            );

            if (yDist < 32 && xDist < 64 + 4 * other.fields.label[0].length) {
              return {other, otherIndex}
            }
            otherIndex++
          }
          return {other: null, otherIndex: null}
        }

        bucket.groups.buckets.forEach((group: any) => {
          const top_hit: Record<string, any> = group.top.hits.hits[0]
          let otherFound = false
          if (seenGroups.has(top_hit.fields["group.id"]?.[0])) {
            return
          }
          else {
            seenGroups.add(top_hit.fields["group.id"]?.[0])
          }


          for (const neighborTile of neighborTiles) {
            const neighborMarkers = labeledMarkersLookup[neighborTile]
            const {other, otherIndex} = evaluateNeighborMarkers(top_hit, neighborMarkers || []) 
            if (other && otherIndex !== null) {
              if ((other.fields.boost || 0) < (top_hit.fields.boost || 0)) {
                const stolenChildren = other.children || []
                const childlessOther = { ...other, children: undefined}
                labeledMarkersLookup[neighborTile][otherIndex] = {...top_hit, children: [childlessOther, ...stolenChildren]}
              }
              else {
                const lostChildren = top_hit.children || []
                const childlessTopHit = { ...top_hit, children: undefined}
                labeledMarkersLookup[neighborTile][otherIndex] = {...other, children: [childlessTopHit, ...lostChildren]}
              }
              otherFound = true
              break
            }
          }

          if (!otherFound) {
            if (!labeledMarkersLookup[bucket.key]) {
              labeledMarkersLookup[bucket.key] = []
            }
            labeledMarkersLookup[bucket.key].push(top_hit)
          }


        


          ///labelItems.push({key: bucket.key, ...top_hit})
          
        })
      } else {
        countItems.push(bucket)
        maxDocCount = Math.max(maxDocCount, bucket.doc_count)
        minDocCount = Math.min(minDocCount, bucket.doc_count)

      }
    })

    //("LABELED MARKERS LOOKUP", JSON.stringify(labeledMarkersLookup, null, 2))
    const markers = Object.entries(labeledMarkersLookup).flatMap(([key, items]: [string, Record<string, any>[]]) => 
      items.map(item => ({tile: key, ...item}))
    )
    const clusters = countItems.map((item: any) => ({...item, radius: calculateRadius(item.doc_count, maxDocCount, minDocCount )}))

    //console.log("MARKERS", markers)
    console.log("CLUSTERS", clusters)




    const allMarkers = [...markers, ...clusters]


    markerResultsRef.current = allMarkers

    return allMarkers
  }, [markerResults, activeMarkerMode, zoomState])





  if (searchParams.get('error') == 'true') {
    throw new Error('Simulated client side error');
  }
  const { docData } = useDocData()






  const updateMarkerGrid = useCallback((liveBounds: [[number, number], [number, number]], liveZoom: number, gridSizeData: { gridSize: number, precision: number }, currentCells: GeotileCell[]) => {
   // console.log("UPDATE MARKER GRID", liveBounds, liveZoom, gridSizeData, currentCells)
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

    suspendMarkerDiscoveryRef.current = false
    setMarkerCells(newCells);
  }, [setMarkerCells]);



  useEffect(() => {
    updateMarkerGrid(snappedBounds, zoomState, gridSizeRef.current, markerCells)
    //console.log("INITIALIZE MARKER GRID")
  }, [])




  // Fly to doc
  useEffect(() => {
    if (!mapInstance.current || searchLoading) return

    if (doc && docData?._source?.location?.coordinates?.length && docData?._source.uuid == doc) {
      const currentBounds = mapInstance.current.getBounds();
      const center = [docData?._source?.location?.coordinates[1], docData?._source?.location?.coordinates[0]]
      if (currentBounds && !currentBounds.contains(center)) {
        mapInstance.current.setView(center, mapInstance.current.getZoom());
      }
    }

  }, [mapInstance, searchLoading, doc, docData])

  // Fly to results
  useEffect(() => {
    allowFitBounds.current = true
  }, [searchUpdatedAt])

  useEffect(() => {
    if (!allowFitBounds.current || markerResults.some(result => result.isSuccess && result.data.aggregations?.grid.buckets.length > 0)) {
      return
    }
    else if (markerResults.every(result => result.isSuccess)) {
      allowFitBounds.current = false
      if (searchBounds?.length) {
        mapInstance.current?.flyToBounds(searchBounds, { duration: 0.25, maxZoom: 18, padding: [50, 50] });
      }
    }


  }, [markerResults, searchBounds])




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
        if (hits?.length) {
          const newQueryParams = new URLSearchParams(searchParams)
          newQueryParams.delete('doc')
          newQueryParams.delete('group')
          newQueryParams.delete('docIndex')
          newQueryParams.delete('details')
          router.push(`?${newQueryParams.toString()}`)
        }
        else {
        const newQueryParams = new URLSearchParams(searchParams)
        newQueryParams.delete('doc')
        newQueryParams.delete('docIndex')
        newQueryParams.set('details', 'group')
        newQueryParams.set('group', stringToBase64Url(selected["group.id"][0]))
        router.push(`?${newQueryParams.toString()}`)
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
      throw new Error('Invalid geotile key format: ' + key);
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


  const isPointInViewport = useCallback(
    (lat: number, lng: number) => {
      const mapBounds = mapInstance?.current?.getBounds();
      if (!mapBounds) return false;
      const bounds = suspendMarkerDiscoveryRef.current
        ? snappedBounds
        : [
          [mapBounds.getNorth(), mapBounds.getWest()],
          [mapBounds.getSouth(), mapBounds.getEast()],
        ];
      if (!bounds) return false;
      const [[north, west], [south, east]] = bounds;
      return lat <= north && lat >= south && lng >= west && lng <= east;
    },
    [snappedBounds]
  );




  const memoizedPopupData = useMemo(() => {
    if (docData?._source?.location?.coordinates?.[1] && docData?._source?.group?.id == groupValue) {
      return {
        position: [
          docData._source.location.coordinates[1],
          docData._source.location.coordinates[0]
        ] as [number, number],
        label: docData._source.label
      };
    }
    return null;
  }, [docData?._source?.location?.coordinates, docData?._source?.group?.id, docData?._source?.label, groupValue]);


  return <>
    <Map
      whenReady={(e: any) => {
        if (!mapInstance.current) {
          mapInstance.current = e.target;
        }

      }}
      zoomControl={false}
      zoomSnap={0.5}
      zoomDelta={0.5}
      bounds={snappedBounds}
      className='w-full h-full'>
      {({ TileLayer, CircleMarker, Marker, useMapEvents, useMap, Rectangle, Polygon, Popup }: any, leaflet: any) => {

        function EventHandlers() {
          const map = useMap();
          useMapEvents({
            zoomstart: () => {

              suspendMarkerDiscoveryRef.current = true
            },
            moveend: () => {

              const mapBounds = map.getBounds();
              const mapCenter = mapBounds.getCenter();
              const mapZoom = map.getZoom();
              const newBounds: [[number, number], [number, number]] = [[mapBounds.getNorth(), mapBounds.getWest()], [mapBounds.getSouth(), mapBounds.getEast()]]
              setSnappedBounds(newBounds)

              const [[north, west], [south, east]] = [[mapBounds.getNorth(), mapBounds.getWest()], [mapBounds.getSouth(), mapBounds.getEast()]]

              const mapBoundsPoints = [
                [north, west],
                [north, east],
                [south, east],
                [south, west]
              ]

              if (mapZoom != zoomState) {
                if (zoomState >= 4) {
                  const [[north, west], [south, east]] = [[mapBounds.getNorth(), mapBounds.getWest()], [mapBounds.getSouth(), mapBounds.getEast()]]
                  gridSizeRef.current = getGridSize([[north, west], [south, east]], mapZoom);;
                }
                else {
                  gridSizeRef.current = { gridSize: 1, precision: 0 }
                }

                // Always update marker grid after zoom
                //console.log("ZOOM UPDATE")
                updateMarkerGrid([[mapBounds.getNorth(), mapBounds.getWest()], [mapBounds.getSouth(), mapBounds.getEast()]], mapZoom, gridSizeRef.current, markerCells);
                setZoomState(mapZoom);
              }
              else if (!mapBoundsPoints.every((point) => {
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




              const newParams = new URLSearchParams(searchParams)
              newParams.set('zoom', mapZoom)
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
            {processedMarkerResults?.map((item: any) => {

              if (item.doc_count) {
                console.log(item)

                const clusterBounds = geotileKeyToBounds(item.key)

                let latSum = 0, lngSum = 0;
                const flattenedTopHits = item.groups.buckets.map((bucket: any) => bucket.top.hits.hits[0])
                flattenedTopHits.forEach((hit: any) => {
                  latSum += hit.fields.location[0].coordinates?.[1] ?? 0;
                  lngSum += hit.fields.location[0].coordinates?.[0] ?? 0;
                });
                const avgLocation: [number, number] = [
                  latSum / flattenedTopHits.length,
                  lngSum / flattenedTopHits.length
                ];


                //const boundsWidth = 
                const boundsHeight = clusterBounds[0][0] - clusterBounds[1][0]; // north - south
                const boundsWidth = clusterBounds[1][1] - clusterBounds[0][1]; // east - west


                // Zoom target must be centered around the average location if it's too far from the cell center
                const zoomTarget = [[avgLocation[0] + boundsHeight / 3, avgLocation[1] - boundsWidth / 3],
                [avgLocation[0] - boundsHeight / 3, avgLocation[1] + boundsWidth / 3]]




                const clusterIcon = new leaflet.DivIcon(getClusterMarker(item.doc_count, item.radius * 2 + (item.doc_count > 99 ? item.doc_count.toString().length / 4 : 0),
                  item.radius * 2,
                  item.radius * 0.8))

                return (
                  <Fragment key={`cluster-fragment-${item.key}`}>
                    {debug && showGeotileGrid && <><Rectangle
                      key={`cluster-rect-${item.key}`}
                      bounds={clusterBounds!}
                      pathOptions={{
                        color: '#00aa00',
                        weight: 2,
                        opacity: 0.5,
                        fillOpacity: 0.1
                      }}
                    />
                      <Rectangle
                        key={`cluster-rect-inner-${item.key}`}
                        bounds={zoomTarget}
                        pathOptions={{
                          color: 'blue',
                          weight: 2,
                          opacity: 0.5,
                          fillOpacity: 0.05
                        }}
                      />
                    </>}
                    <Marker
                      key={`cluster-${item.key}`}
                      position={avgLocation}
                      icon={clusterIcon}
                      eventHandlers={{
                        click: () => {
                          // Zoom in to the cell bounds when cluster is clicked
                          if (mapInstance.current) {
                            mapInstance.current.fitBounds(zoomTarget, { maxZoom: 18 });
                          }
                        }
                      }}
                    />
                  </Fragment>
                );
              }

              const lat = item.fields.location?.[0]?.coordinates?.[1];
              const lng = item.fields.location?.[0]?.coordinates?.[0];
              // Ensure lat/lng exist (0 is a valid value) and are finite
              
              if (lat == undefined || lng == undefined || !isPointInViewport(lat, lng)) {
                return null;
              }
              else {
                const childCount = zoomState > 16 && item.children?.length > 0 ? item.children?.length: undefined
                const icon = getLabelMarkerIcon(item.fields.label?.[0] || '[utan namn]', baseMap && baseMapLookup[baseMap]?.bright ? 'black' : 'white', childCount)

                if (docData?._source?.group?.id && item.fields?.["group.id"]?.[0] == docData?._source?.group?.id && !groupLoading) {
                  return null
                }

                return (
                <Marker
                  key={`result-${item.fields.uuid[0]}`}
                  position={[lat, lng]}
                  icon={new leaflet.DivIcon(icon)}
                  riseOnHover={true}
                  eventHandlers={selectDocHandler(item.fields, childCount ? [item, ...(item.children || [])] : [])}
                >
                    {childCount && item.fields?.["group.id"]?.[0] && <Popup>
                      <ul className="list-none p-0 m-0 max-h-[50svh] overflow-y-auto stable-scrollbar text-lg divide-y divide-neutral-200 flex flex-col">
                        {[item, ...(item.children || [])].map((entry: any) => (
                          <li key={`entry-${entry.fields.uuid[0]}`} className="!p-0 !m-0">
                            <Clickable className="no-underline !text-black flex gap-2 items-center py-2" link add={{group: stringToBase64Url(entry.fields["group.id"]?.[0])}}>{groupValue == entry.fields["group.id"]?.[0] ? <PiBookOpenFill className="text-accent-700" /> : <PiBookOpen className="text-primary-600" />}{entry.fields.label?.[0]}</Clickable>
                          </li>
                        ))}
                      </ul>
                    </Popup>}
                </Marker>
              )
            }


            })}

            {/* Debug: draw rectangle for each backend bucket/tile */}
            {debug && showGeotileGrid && processedMarkerResults && markerResults.map((result) => result.data?.map((bucket: any) => {
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

            {debug && showGeotileGrid && markerCells.map((cell) => {
              const bounds = geotileKeyToBounds(cell.key)
              if (!bounds) return null;
              return <Rectangle
                key={`cell-${cell.key}`}
                bounds={bounds}
                pathOptions={{
                  color: '#0078ff',
                  weight: 2,
                  opacity: 0.8,
                  fillOpacity: 0
                }}
              />
            })}



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

            {myLocation && <CircleMarker center={myLocation} radius={10} color="#cf3c3a" />}

            {memoizedPopupData && (
              <Popup 
                closeButton={false}
                closeOnEscape={false}
                autoClose={false}
                position={memoizedPopupData.position}
              >
                <div className="text-sm text-neutral-600">
                  {memoizedPopupData.label}
                </div>
              </Popup>
            )}

          </>)
      }}


    </Map>
    {/* Canvas overlay for label mode */}
    <div className={`absolute right-0 p-2 gap-3 bottom-5 left-1/2 transform -translate-x-1/2 flex justify-center p-2 gap-2 text-white z-[3001]`}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <IconButton label="Bakgrunnskart" className="p-2 lg:p-2.5 rounded-full border bg-neutral-900 border-white shadow-sm cursor-pointer">
            <PiStackSimpleFill className="text-xl" />
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
          {debug && (
            <>
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
          </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <IconButton label="Markørar" className="p-2 lg:p-2.5 rounded-full border bg-neutral-900 border-white shadow-sm cursor-pointer">
            <PiMapPinLineFill className="text-xl" />
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
        <PiMagnifyingGlassPlusFill className="text-xl" />
      </IconButton>
      <IconButton onClick={() => mapInstance.current?.zoomOut()} side="top" className="p-2 lg:p-2.5 rounded-full border bg-neutral-900 border-white shadow-sm" label="Zoom ut">
        <PiMagnifyingGlassMinusFill className="text-xl" />
      </IconButton>
      <IconButton onClick={getMyLocation} side="top" className="p-2 lg:p-2.5 rounded-full border bg-neutral-900 border-white shadow-sm" label="Min posisjon">
        <PiNavigationArrowFill className="text-xl" />
      </IconButton>
      <IconButton className="p-2 lg:p-2.5 rounded-full border bg-neutral-900 border-white shadow-sm" label="Zoom til søkeresultat" onClick={() => {
        if (searchBounds?.length) {
          mapInstance.current?.flyToBounds(searchBounds, { duration: 0.25, maxZoom: 18, padding: [50, 50] });
        }
      }}>
        <PiCrop className="text-xl" />
      </IconButton>
    </div>
  </>
}