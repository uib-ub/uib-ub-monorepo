'use client'
import { Fragment, useEffect, useRef, useState, useCallback, useMemo, useContext } from "react";
import Map from "./leaflet/map";
import { baseMaps, baseMapKeys, defaultBaseMap, baseMapLookup } from "@/config/basemap-config";
import { PiBookOpen, PiBookOpenFill, PiCheckCircleFill, PiCrop, PiGpsFix, PiMagnifyingGlassMinusFill, PiMagnifyingGlassPlusFill, PiMapPinLineFill, PiNavigationArrowFill, PiStackPlus, PiStackPlusFill, PiStackSimpleFill } from "react-icons/pi";
import { useSearchQuery } from "@/lib/search-params";
import { getClusterMarker, getLabelMarkerIcon, getUnlabeledMarker } from "./markers";
import { useSearchParams } from "next/navigation";

import { useRouter } from "next/navigation";
import wkt from 'wellknown';
import { base64UrlToString, stringToBase64Url } from "@/lib/param-utils";
import useDocData from "@/state/hooks/doc-data";
import { useQueries } from "@tanstack/react-query";
import { boundsFromZoomAndCenter, getGridSize, calculateZoomFromBounds, calculateRadius, getMyLocation, MAP_DRAWER_BOTTOM_HEIGHT_REM, getLabelBounds, panPointIntoView } from "@/lib/map-utils";
import useSearchData from "@/state/hooks/search-data";
import { useGroup, usePerspective } from "@/lib/param-hooks";
import { GlobalContext } from "@/state/providers/global-provider";
import Clickable from "../ui/clickable/clickable";
import useGroupData from "@/state/hooks/group-data";
import { useSessionStore } from "@/state/zustand/session-store";
import { useMapSettings } from '@/state/zustand/persistent-map-settings'
import { RoundIconButton } from "../ui/clickable/round-icon-button";
import DynamicMap from "./leaflet/dynamic-map";
import MapToolbar from "./map-toolbar";
import { useDebugStore } from '../../state/zustand/debug-store';
import dynamic from "next/dynamic";

const DynamicDebugLayers = dynamic(() => import('@/components/map/debug-layers'), {
  ssr: false
});



const rootFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize);



export default function MapExplorer() {
  
  const showMarkerBounds = useDebugStore(state => state.showMarkerBounds);
  // Add state for H3 resolution





  const { totalHits, searchBounds, searchLoading, searchUpdatedAt } = useSearchData()
  const myLocation = useSessionStore((s) => s.myLocation)
  const setMyLocation = useSessionStore((s) => s.setMyLocation)


  const controllerRef = useRef(new AbortController());
  const { baseMap, markerMode, setBaseMap, setMarkerMode, initializeSettings } = useMapSettings()
  const searchParams = useSearchParams()
  const { searchQueryString, searchFilterParamsString } = useSearchQuery()
  const perspective = usePerspective()
  const urlZoom = searchParams.get('zoom') ? parseInt(searchParams.get('zoom')!) : null
  const urlCenter = searchParams.get('center') ? (searchParams.get('center')!.split(',').map(parseFloat) as [number, number]) : null
  const allowFitBounds = useRef(false)
  const { activeGroupValue, initValue, initCode } = useGroup()
  const { groupLoading, groupData } = useGroupData()
  const { groupData: initGroupData } = useGroupData(initCode)

  const { isMobile, mapFunctionRef } = useContext(GlobalContext)
  const mapInstance = useRef<any>(null)
  const doc = searchParams.get('doc')
  const datasetTag = searchParams.get('datasetTag')
  const setDrawerContent = useSessionStore((s) => s.setDrawerContent)
  const mapSettings = searchParams.get('mapSettings') == 'on'
  const point = searchParams.get('point') ? (searchParams.get('point')!.split(',').map(parseFloat) as [number, number]) : null
  const urlRadius = searchParams.get('radius') ? parseInt(searchParams.get('radius')!) : null
  const displayRadius = useSessionStore((s) => s.displayRadius)
  const displayPoint = useSessionStore((s) => s.displayPoint)

  const tapHoldRef = useRef<null | number>(null)
  const setDebugChildren = useDebugStore((s) => s.setDebugChildren)
  const locations = searchParams.get('locations') == 'on'
  const debug = useDebugStore((s) => s.debug)
  const showGeotileGrid = useDebugStore(state => state.showGeotileGrid);
  const showDebugGroups = useDebugStore(state => state.showDebugGroups);



  const defaultZoom = isMobile ? 4 : 5
  const defaultCenter: [number, number] = isMobile ? [62, 16] :  [62, 16]



  const [snappedBounds, setSnappedBounds] = useState<[[number, number], [number, number]]>(() => {
    const center = urlCenter || defaultCenter
    const zoom = urlZoom || defaultZoom
    if (center && center.length === 2 && zoom !== null) {
      // Calculate bounds based on zoom level and center point
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      
      // Get the computed value of 3rem in pixels
      const rootFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize);
      const headerHeight = rootFontSize * 3;

      return boundsFromZoomAndCenter({width: viewportWidth, height: viewportHeight - headerHeight}, center, zoom);
    }
    if (searchBounds?.length) {
      return searchBounds
    }
    // Fallback to default bounds
    return [[72, -5], [54, 25]];
  });
  




  const [zoomState, setZoomState] = useState<number>(urlZoom || defaultZoom)
  const suspendMarkerDiscoveryRef = useRef(false)

  const gridSizeRef = useRef<{ gridSize: number, precision: number }>(getGridSize(snappedBounds, zoomState));
  const router = useRouter()


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
        queryKey: ['markerResults', key, searchQueryString, showDebugGroups],
        placeHolder: (prevData: any) => prevData,
        enabled: !showDebugGroups,
        queryFn: async () => {
          const existingParams = new URLSearchParams(searchQueryString)
    
          const newParams = existingParams.toString() ? existingParams : new URLSearchParams()
          if (searchFilterParamsString) {
            newParams.set('totalHits', totalHits.value)
          }
          if (datasetTag == 'tree' && !searchParams.get('within')) {
            newParams.set('sosi', 'gard')
          }
          


          const res = await fetch(`/api/markers/${cell.precision}/${cell.x}/${cell.y}${newParams.toString() ? `?${newParams.toString()}` : ''}`, { signal: controllerRef.current.signal })
          const data = await res.json()
          return data.aggregations.grid.buckets
        }
      })
    })
  })


  const markerResultsRef = useRef<any[]>([]) // Prevents empty array while loading new cells
  //console.log("MARKER RESULTS", markerResults, markerResultsRef.current)



  const processedMarkerResults = useMemo(() => {
    if (markerResults.some((result: any) => result.isLoading)) {
      return markerResultsRef?.current
    }

    const buckets = markerResults.flatMap((result: any) => result.isSuccess && result.data ? result.data : [])
    //("BUCKETS", buckets)


    const countItems: Record<string, any>[] = []
    let minDocCount = Infinity
    let maxDocCount = 0
    const labeledMarkersLookup: Record<string, Record<string, any>[]> = {}
    const seenGroups = new Set<string>()

    buckets.forEach((bucket: any) => {
      if ( zoomState > 15 || activeMarkerMode == 'labels' || bucket.doc_count == 1) {


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

          const selfLat = self.fields.location[0].coordinates[1]
          const selfLon = self.fields.location[0].coordinates[0]
          const selfLabel: string = self.fields.label?.[0] ?? ''
          self.labelBounds = self.labelBounds || getLabelBounds(mapInstance.current, selfLabel, selfLat, selfLon, rootFontSize)
          const selfBounds = self.labelBounds

          for (const other of neighbourMarkers) {
            const otherBounds = other.labelBounds

            if (selfBounds && otherBounds) {
              const [[aN, aW], [aS, aE]] = selfBounds
              const [[bN, bW], [bS, bE]] = otherBounds
              // Rectangles overlap if they are not separated along any axis
              const separated = (aE < bW) || (aW > bE) || (aS > bN) || (aN < bS)
              if (!separated) {
                return { other, otherIndex }
              }
            }
            otherIndex++
          }
          return { other: null, otherIndex: null }
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
                labeledMarkersLookup[neighborTile][otherIndex] = {...top_hit, labelBounds: top_hit.labelBounds, children: [childlessOther, ...stolenChildren]}
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

    // Flatten
    const markers = Object.entries(labeledMarkersLookup).flatMap(([key, items]: [string, Record<string, any>[]]) => 
      items.map(item => {


        return ({ tile: key, ...item })
      })
    )
    const clusters = countItems.map((item: any) => ({...item, radius: calculateRadius(item.doc_count, maxDocCount, minDocCount )}))

    //console.log("MARKERS", markers)
    //console.log("CLUSTERS", clusters)




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
    initializeSettings(perspective)
  }, [perspective])

  useEffect(() => {
    updateMarkerGrid(snappedBounds, zoomState, gridSizeRef.current, markerCells)
    //console.log("INITIALIZE MARKER GRID")
  }, [])




  // Fly to doc
  /*
  useEffect(() => {
    if (!mapInstance.current || searchLoading) return

    if (docData?._source?.location?.coordinates?.length && (docData?._source?.group?.id == groupValue || docData?._source?.uuid == doc)) {
      const currentBounds = mapInstance.current.getBounds();
      const center = [docData?._source?.location?.coordinates[1], docData?._source?.location?.coordinates[0]]
      if (currentBounds && !currentBounds.contains(center)) {
        mapInstance.current.setView(center, mapInstance.current.getZoom());
      }
    }

  }, [mapInstance, searchLoading, groupValue, docData, doc])
  */

  // Fly to results
  useEffect(() => {
    allowFitBounds.current = true
  }, [searchUpdatedAt])


  /*
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
  */




  const selectDocHandler = (selected: Record<string, any>, markerPoint: [number, number], hits?: Record<string, any>[]) => {
    return {
      click: () => {
        const newQueryParams = new URLSearchParams(searchParams)
        const fields = selected.fields || {}
        if (selected._source?.misc?.children && debug) {
          setDebugChildren(selected._source?.misc?.children)
        }
        else {
          //setDebugChildren([])
        }
        if (!newQueryParams.get('results')) {
          newQueryParams.set('results', 'on')
        }
        newQueryParams.delete('mapSettings')
        newQueryParams.set('point', `${markerPoint[0]},${markerPoint[1]}`)
        newQueryParams.delete('doc')

        newQueryParams.set('init', stringToBase64Url(fields["group.id"][0]))
        newQueryParams.delete('group')

        if (datasetTag == 'tree') {
          newQueryParams.set('doc', fields.uuid[0])
        }
        router.push(`?${newQueryParams.toString()}`)
          

        }
    }
  }



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
      const bounds = [[mapBounds.getNorth(), mapBounds.getWest()], [mapBounds.getSouth(), mapBounds.getEast()],];
      if (!bounds) return false;
      const [[north, west], [south, east]] = bounds;
      return lat <= north && lat >= south && lng >= west && lng <= east;
    },
    []
  );




  return <>
  <MapToolbar/>
    <DynamicMap
      whenReady={(e: any) => {
        if (!mapInstance.current) {
          mapInstance.current = e.target;
          mapFunctionRef.current = e.target;
        }

      }}
      tapHold={true}
      zoomControl={false}
      attributionControl={false}
      zoomSnap={0.5}
      zoomDelta={0.5}
      zoom={urlZoom || defaultZoom}
      center={urlCenter || defaultCenter}
      className={`absolute top-0 right-0 left-0 select-none`}
      style={{
        bottom: isMobile ? `${MAP_DRAWER_BOTTOM_HEIGHT_REM-0.5}rem` : '0',
      }}
      >
      {({ TileLayer, CircleMarker, Popup, Circle, Marker, useMapEvents, useMap, Rectangle, Polygon, MultiPolygon, Polyline }: any, leaflet: any) => {

        function EventHandlers() {
          const map = useMap();
          useMapEvents({
            movestart: () => {
              tapHoldRef.current = null
              const attribution = map.attributionControl;
              if (attribution) {
                attribution.getContainer().style.display = mapSettings ? "block" : "none";
              }
            }, 

            contextmenu: (event: any) => {


                
                const point = event.latlng
                

                    const newParams = new URLSearchParams(searchParams)
                    newParams.delete('group')
                    newParams.delete('init')

                    newParams.set('point', `${point.lat},${point.lng}`)
                    router.push(`?${newParams.toString()}`)
                  
                
            },




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
            
            {baseMap[perspective] && <TileLayer maxZoom={18} maxNativeZoom={18} {...baseMapLookup[baseMap[perspective]].props} />}


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
                const selected = activeGroupValue && item.fields?.["group.id"]?.[0] == activeGroupValue && !groupLoading
                if (selected) return null

                const childCount = undefined //zoomState > 15 && item.children?.length > 0 ? item.children?.length: undefined
                const icon = getLabelMarkerIcon(item.fields.label?.[0] || '[utan namn]', selected ? 'accent' : 'white', childCount, false, false, !!(selected))


                return (
                <Fragment key={`result-frag-${item.fields.uuid[0]}`}>
                  { showMarkerBounds && item.labelBounds && (
                    <Rectangle
                      bounds={item.labelBounds}
                      pathOptions={{ color: '#ff00ff', weight: 1, opacity: 0.8, fillOpacity: 0.05 }}
                    />
                  )}
                  {
                    showMarkerBounds && <CircleMarker
                    center={[lat, lng]}
                    radius={2}
                    pathOptions={{ color: '#ff00ff', weight: 1, opacity: 0.8, fillOpacity: 0.05 }}
                  />
                  }
                  {
                    showMarkerBounds && item.children?.map((child: any) => (
                      <CircleMarker
                        key={`child-${child.fields.uuid[0]}`}
                        center={[child.fields.location[0].coordinates[1], child.fields.location[0].coordinates[0]]}
                        radius={2}
                        pathOptions={{ color: '#0000ff', weight: 1, opacity: 0.8, fillOpacity: 0.05 }}
                      />
                    ))
                  }
                  {activeGroupValue != item.fields?.["group.id"]?.[0] && <Marker
                    key={`result-${item.fields.uuid[0]}`}
                    position={[lat, lng]}
                    icon={new leaflet.DivIcon(icon)}
                    riseOnHover={true}
                    eventHandlers={selectDocHandler(item, [lat, lng])}
                  >
                  </Marker>}
                </Fragment>
              )
            }


            })}

            {/* Debug: draw rectangle for each backend bucket/tile */}
            {debug && showGeotileGrid && processedMarkerResults && markerResults.map((result: any) => result.data?.map((bucket: any) => {
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



            {groupData && groupData.fields?.location?.[0]?.coordinates && <Marker
              zIndexOffset={2000}
              icon={new leaflet.DivIcon(getLabelMarkerIcon(groupData.fields.label[0] || '[utan namn]', 'accent', undefined, true, false, true))}
              position={[groupData.fields.location[0].coordinates[1], groupData.fields.location[0].coordinates[0]]}
            />
            }

            {
              locations && groupData?.sources.map((source: Record<string, any>, index: number) => {
                if (!source?.location?.coordinates?.length) {
                  console.log("NO MARKERS", source?.location)
                  return null;
                }
                const lat = source.location.coordinates[1];
                const lng = source.location.coordinates[0];
                return <CircleMarker key={`location-marker-${index}`} center={[lat, lng]} radius={6} color="black" />
              })
            }

            {debug && <DynamicDebugLayers mapInstance={mapInstance} Polygon={Polygon} Polyline={Polyline} Rectangle={Rectangle} CircleMarker={CircleMarker} Popup={Popup} geotileKeyToBounds={geotileKeyToBounds} groupData={groupData} markerCells={markerCells} />}



            {docData?._source?.area && (
              <>
                {(() => {
                  try {
                    const geoJSON = wkt.parse(docData._source.area);
                    if (!geoJSON) return null;

                    switch (geoJSON.type) {
                      case 'Polygon':
                        return <Polygon
                          positions={geoJSON.coordinates[0]}
                          pathOptions={{
                            color: '#0066ff',
                            weight: 2,
                            opacity: 0.8,
                            fillOpacity: 0.2
                          }}
                        />;
                      case 'MultiPolygon':
                        return <MultiPolygon
                          positions={geoJSON.coordinates}
                          pathOptions={{
                            color: '#0066ff',
                            weight: 2,
                            opacity: 0.8,
                            fillOpacity: 0.2
                          }}
                        />;
                        case 'LineString':
                          return <Polyline
                            positions={geoJSON.coordinates.map(coord => [coord[1], coord[0]])} // Swap to [lat, lon] for Leaflet
                            pathOptions={{
                              color: '#0066ff',
                              weight: 5,
                              opacity: 0.8,
                              fillOpacity: 0.2
                            }}
                          />;
                        
                        case 'MultiLineString':
                          return (
                            <>
                              {geoJSON.coordinates.map((lineCoords, index) => (
                                <Polyline
                                  key={index}
                                  positions={lineCoords.map(coord => [coord[1], coord[0]])} // Swap to [lat, lon] for Leaflet
                                  pathOptions={{
                                    color: '#0066ff',
                                    weight: 5,
                                    opacity: 0.8,
                                    fillOpacity: 0.2
                                  }}
                                />
                              ))}
                            </>
                          );
                      default:
                        return null;
                    }
                  } catch (error) {
                    console.error('Failed to parse WKT:', error);
                    return null;
                  }
                })()}
              </>
            )}

            { myLocation && <CircleMarker center={myLocation} radius={10} color="#cf3c3a" />}
            { urlRadius && point && <Circle center={point} radius={urlRadius} color="#0061ab" />}
            { displayRadius && (point || displayPoint) && <Circle center={point || displayPoint} radius={displayRadius} color="#cf3c3a" />}
            { point && <Marker icon={new leaflet.DivIcon(getUnlabeledMarker("primary"))} position={point.reverse()} />}





            {doc && docData?._source?.within && <Marker 
              zIndexOffset={1000}
              icon={new leaflet.DivIcon(getUnlabeledMarker("accent"))}
              position={[docData?._source?.location?.coordinates[1], docData?._source?.location?.coordinates[0]]}
            >
              {docData?._source?.label}
            </Marker>
            }

          </>)
      }}


    </DynamicMap>

  </>
}