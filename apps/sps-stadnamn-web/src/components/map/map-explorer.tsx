'use client'
import { baseMapLookup } from "@/config/basemap-config";
import { defaultMaxResultsParam } from "@/config/max-results";
import { useSearchQuery } from "@/lib/search-params";
import { useSearchParams } from "next/navigation";
import { Fragment, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { getAreaLabelMarkerIcon, getClusterMarker, getInitAnchorMarker, getLabelMarkerIcon, getUnlabeledMarker } from "./markers";

import { boundsFromZoomAndCenter, calculateRadius, fitBoundsToGroupSources, getGridSize, getLabelBounds, MAP_DRAWER_BOTTOM_HEIGHT_REM } from "@/lib/map-utils";
import { useActivePoint, useGroup, usePoint } from "@/lib/param-hooks";
import { stringToBase64Url } from "@/lib/param-utils";
import { parseTreeParam } from "@/lib/tree-param";
import { getBnr, getGnr, indexToCode } from "@/lib/utils";
import useDocData from "@/state/hooks/doc-data";
import useGroupData from "@/state/hooks/group-data";
import useSearchData from "@/state/hooks/search-data";
import { GlobalContext } from "@/state/providers/global-provider";
import { useMapSettings } from '@/state/zustand/persistent-map-settings';
import { useSessionStore } from "@/state/zustand/session-store";
import { useQueries, useQuery } from "@tanstack/react-query";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import wkt from 'wellknown';
import { useDebugStore } from '../../state/zustand/debug-store';
import DynamicMap from "./leaflet/dynamic-map";
import MapToolbar from "./map-toolbar";
import { treeSettings } from "@/config/server-config";

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
  const { baseMap, overlayMaps, markerMode, initializeSettings } = useMapSettings()
  const searchParams = useSearchParams()
  const { searchQueryString, searchFilterParamsString } = useSearchQuery()
  const urlZoom = searchParams.get('zoom') ? parseInt(searchParams.get('zoom')!) : null
  const urlCenter = searchParams.get('center') ? (searchParams.get('center')!.split(',').map(parseFloat) as [number, number]) : null
  const allowFitBounds = useRef(false)
  const { activeGroupValue, initValue, initCode } = useGroup()
  const { groupLoading, groupData } = useGroupData()
  const { groupData: initGroupData } = useGroupData(initCode)
  const { docData } = useDocData()

  const { isMobile, mapFunctionRef, scrollableContentRef } = useContext(GlobalContext)
  const mapInstance = useRef<any>(null)
  const doc = searchParams.get('doc')
  const datasetTag = searchParams.get('datasetTag')
  const datasetParams = searchParams.getAll('dataset')
  const singleDatasetSelected = datasetParams.length === 1
  const tree = searchParams.get('tree')
  const treeState = useMemo(() => parseTreeParam(tree), [tree])
  const setDrawerContent = useSessionStore((s) => s.setDrawerContent)
  const mapSettings = searchParams.get('mapSettings') == 'on'
  const hasGroupParam = Boolean(searchParams.get('group'))
  const point = usePoint()
  const activePoint = useActivePoint()
  const coordinateInfo = searchParams.get('coordinateInfo') == 'on'
  const urlRadius = searchParams.get('radius') ? parseInt(searchParams.get('radius')!) : null
  const displayRadius = useSessionStore((s) => s.displayRadius)
  const displayPoint = useSessionStore((s) => s.displayPoint)

  const tapHoldRef = useRef<null | number>(null)
  const setDebugChildren = useDebugStore((s) => s.setDebugChildren)
  const debug = useDebugStore((s) => s.debug)
  const showGeotileGrid = useDebugStore(state => state.showGeotileGrid);
  const showDebugGroups = searchParams.get('debugGroups') == 'on';

  const getDisplayLabel = (fields?: Record<string, any> | null): string => {
    const label = fields?.label?.[0]
    const groupLabel = fields?.["group.label"]?.[0]
    return (
      (
        singleDatasetSelected
          ? (label || groupLabel)
          : (groupLabel || label)
      ) || '[utan namn]'
    )
  }

  const treeDataset = treeState?.dataset
  const treeUuid = treeState?.uuid
  const lastTreeFitKeyRef = useRef<string | null>(null)
  const areaSource = useMemo(
    () =>
      (doc
        ? groupData?.sources?.find((source: Record<string, any>) => source.uuid === doc && source.area)
        : undefined) ??
      groupData?.sources?.find((source: Record<string, any>) => source.area),
    [doc, groupData?.sources]
  )
  const activeGroupHasArea = Boolean(areaSource?.area)

  // Tree mode overlay data: selected cadastral unit + its subunits (bruk)
  const { data: treeUnitDoc } = useQuery({
    queryKey: ['treeSelectedDoc', treeDataset, treeUuid],
    enabled: !!treeDataset && !!treeUuid,
    queryFn: async () => {
      const params = new URLSearchParams({ uuid: treeUuid as string, dataset: treeDataset as string })
      const res = await fetch(`/api/tree?${params.toString()}`)
      if (!res.ok) return null
      const data = await res.json()
      return data?.hits?.hits?.[0]?._source || null
    },
    staleTime: 1000 * 60 * 5,
  })

  const { data: treeSubunitsData } = useQuery({
    queryKey: ['cadastral', treeDataset, treeUuid],
    enabled: !!treeDataset && !!treeUuid,
    queryFn: async () => {
      const params = new URLSearchParams({
        perspective: treeDataset as string,
        within: treeUuid as string,
        size: '1000',
      })
      const res = await fetch(`/api/search/table?${params.toString()}`)
      if (!res.ok) return null
      return res.json()
    },
    staleTime: 1000 * 60 * 5,
  })

  // In tree mode, fit bounds to the selected cadastral unit + its subunits,
  // similar to how selecting a collapsed result fits to a group's sources.
  useEffect(() => {
    if (!mapInstance.current) return
    if (!treeDataset || !treeUuid) return

    const key = `${treeDataset}:${treeUuid}`
    if (lastTreeFitKeyRef.current === key) return

    const sources: Array<{ location: { coordinates: [number, number] } }> = []

    if (treeUnitDoc?.location?.coordinates?.length === 2) {
      const [lng, lat] = treeUnitDoc.location.coordinates as [number, number]
      sources.push({ location: { coordinates: [lng, lat] } })
    }

    const subHits: any[] = treeSubunitsData?.hits?.hits || []
    subHits.forEach((h: any) => {
      const coords = h?._source?.location?.coordinates
      if (coords?.length === 2) {
        const [lng, lat] = coords as [number, number]
        sources.push({ location: { coordinates: [lng, lat] } })
      }
    })

    if (!sources.length) return

    fitBoundsToGroupSources(
      mapInstance.current,
      {
        sources,
        ...(treeUnitDoc?.location?.coordinates?.length === 2
          ? { fields: { location: [{ coordinates: treeUnitDoc.location.coordinates }] } }
          : {}),
      },
      { duration: 0.25, padding: [50, 50], maxZoom: 18 }
    )
    lastTreeFitKeyRef.current = key
  }, [treeDataset, treeUuid, treeUnitDoc, treeSubunitsData])



  const defaultZoom = isMobile ? 4 : 5
  const defaultCenter: [number, number] = isMobile ? [62, 16] : [62, 16]



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

      return boundsFromZoomAndCenter({ width: viewportWidth, height: viewportHeight - headerHeight }, center, zoom);
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

  // Ensure consistent stacking order for the tree-mode connected overlay:
  // label markers (top) > numbered circles/dots > connecting lines (bottom).
  const ensureTreeOverlayPanes = useCallback((map: any) => {
    if (!map?.createPane) return

    const ensure = (name: string, zIndex: number) => {
      const existing = map.getPane?.(name)
      const pane = existing || map.createPane(name)
      if (pane?.style) {
        pane.style.zIndex = String(zIndex)
        // Avoid panes catching clicks; let Marker/Circle/Polyline handle pointer events.
        // (Leaflet defaults are fine, but this keeps it predictable.)
        pane.style.pointerEvents = 'auto'
      }
    }

    ensure('treeLinePane', 350)
    ensure('treeCirclePane', 450)
    ensure('treeLabelPane', 650)
  }, [])


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
  const activeMarkerMode = markerMode === 'auto'
    ? (searchParams.get('q') ? (zoomState < 14 ? 'counts' : 'points') : 'labels')
    : (markerMode === 'circles' ? 'points' : markerMode)



  const markerResults = useQueries({
    queries: markerCells.map(cell => {
      const key = `${cell.precision}/${cell.x}/${cell.y}`

      return ({
        queryKey: ['markerResults', key, searchQueryString, showDebugGroups, tree, coordinateInfo],
        placeHolder: (prevData: any) => coordinateInfo ? null : prevData,
        enabled: !coordinateInfo && !showDebugGroups && (!tree || tree.split('_').length < 4),
        queryFn: async () => {
          const existingParams = new URLSearchParams(searchQueryString)

          const newParams = existingParams.toString() ? existingParams : new URLSearchParams()
          if (searchFilterParamsString) {
            newParams.set('totalHits', totalHits.value)
          }
          else if (tree) {
            newParams.set('sosi', 'gard')
            if (tree == 'root') {
              // Add a dataset param for each dataset in treeSettings
              Object.keys(treeSettings).forEach((dataset) => {
                newParams.append('dataset', dataset)
              })
            }
            else {
              const parts = tree.split('_')
              //if (parts.length > 3) return {}
              const [dataset, adm1, adm2] = parts

              newParams.set('dataset', dataset)
              
              if (adm1) newParams.set('adm1', adm1)
              if (adm2) newParams.set('adm2', adm2)
            }
            
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
      if (zoomState > 15 || activeMarkerMode == 'labels' || activeMarkerMode == 'points' || bucket.doc_count == 1) {


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

        const evaluateNeighborMarkers = (self: Record<string, any>, neighbourMarkers: Record<string, any>[]): { other: Record<string, any> | null, otherIndex: number | null } => {
          let otherIndex = 0

          const selfLat = self.fields.location[0].coordinates[1]
          const selfLon = self.fields.location[0].coordinates[0]
          const selfLabel: string = getDisplayLabel(self.fields)
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
          const top_hit: Record<string, any> = {
            ...group.top.hits.hits[0],
            // In cluster mode, singletons should render as black pin markers.
            isClusterSingleton: activeMarkerMode === 'counts' && bucket.doc_count === 1,
          }
          if (seenGroups.has(top_hit.fields["group.id"]?.[0])) {
            return
          }
          seenGroups.add(top_hit.fields["group.id"]?.[0])

          // Points mode: no overlap logic – show every group as its own marker, allow them close together.
          if (activeMarkerMode === 'points') {
            if (!labeledMarkersLookup[bucket.key]) {
              labeledMarkersLookup[bucket.key] = []
            }
            labeledMarkersLookup[bucket.key].push(top_hit)
            return
          }

          let otherFound = false
          for (const neighborTile of neighborTiles) {
            const neighborMarkers = labeledMarkersLookup[neighborTile]
            const { other, otherIndex } = evaluateNeighborMarkers(top_hit, neighborMarkers || [])
            if (other && otherIndex !== null) {
              if ((other.fields.boost || 0) < (top_hit.fields.boost || 0)) {
                const stolenChildren = other.children || []
                const childlessOther = { ...other, children: undefined }
                labeledMarkersLookup[neighborTile][otherIndex] = { ...top_hit, labelBounds: top_hit.labelBounds, children: [childlessOther, ...stolenChildren] }
              }
              else {
                const lostChildren = top_hit.children || []
                const childlessTopHit = { ...top_hit, children: undefined }
                labeledMarkersLookup[neighborTile][otherIndex] = { ...other, children: [childlessTopHit, ...lostChildren] }
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
    const clusters = countItems.map((item: any) => ({ ...item, radius: calculateRadius(item.doc_count, maxDocCount, minDocCount) }))

    //console.log("MARKERS", markers)
    //console.log("CLUSTERS", clusters)




    const allMarkers = [...markers, ...clusters]


    markerResultsRef.current = allMarkers

    return allMarkers
  }, [markerResults, activeMarkerMode, zoomState])





  if (searchParams.get('error') == 'true') {
    throw new Error('Simulated client side error');
  }






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
    initializeSettings()
  }, [])

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
    const openMarker = () => {
      const newQueryParams = new URLSearchParams(searchParams)
      const fields = selected.fields || {}
      if (selected._source?.misc?.children && debug) {
        setDebugChildren(selected._source?.misc?.children)
      }
      else {
        //setDebugChildren([])
      }

      if (tree) {
        newQueryParams.set('doc', fields["uuid"][0])
        const datasetCode = indexToCode(selected._index)[0]
        const adm1 = fields["adm1"][0]
        const adm2 = fields["adm2"][0]
        newQueryParams.set('tree', `${datasetCode}_${adm1}_${adm2}`)
        //if (indexToCode(selected._index) 
        console.log("SELECED", selected)
      }
      else {
        newQueryParams.set('maxResults', defaultMaxResultsParam)
        newQueryParams.delete('mapSettings')
        //newQueryParams.set('point', `${markerPoint[0]},${markerPoint[1]}`)
        newQueryParams.delete('doc')
        newQueryParams.set('init', stringToBase64Url(fields["group.id"][0]))
        newQueryParams.delete('group')
        newQueryParams.delete('activePoint')
        newQueryParams.delete('activeYear')
        newQueryParams.delete('activeName')
        newQueryParams.set('point', `${markerPoint[0]},${markerPoint[1]}`)

      }






      router.push(`?${newQueryParams.toString()}`)


    }
    return {
      click: openMarker,
      keydown: (e: KeyboardEvent & { originalEvent?: KeyboardEvent }) => {
        const key = e.originalEvent?.key ?? e.key
        if (key === 'Enter' || key === ' ') {
          ;(e.originalEvent ?? e).preventDefault()
          openMarker()
        }
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
    <MapToolbar />
    <DynamicMap
      tapHold={true}
      zoomControl={false}
      whenReady={(e: any) => {
        if (!mapInstance.current) {
          mapInstance.current = e.target;
          mapFunctionRef.current = e.target;
          ensureTreeOverlayPanes(e.target)
        }
      }}
      attributionControl={false}
      zoomSnap={0.5}
      zoomDelta={1}
      wheelPxPerZoomLevel={30}
      zoom={urlZoom || defaultZoom}
      center={urlCenter || defaultCenter}
      className={`absolute top-0 right-0 left-0 select-none`}
      style={{
        bottom: isMobile ? `${MAP_DRAWER_BOTTOM_HEIGHT_REM - 0.5}rem` : '0',
      }}
    >
      {({ TileLayer, WMSTileLayer, CircleMarker, Popup, Circle, Marker, Tooltip, useMapEvents, useMap, Rectangle, Polygon, MultiPolygon, Polyline, AttributionControl }: any, leaflet: any) => {

        function EventHandlers() {
          const map = useMap();
          // In case the map remounts, ensure panes exist.
          useEffect(() => {
            ensureTreeOverlayPanes(map)
          }, [map]);
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


        const focusGroupMarker = () => {
          const pointFocusTarget =
            (activeMarkerMode === 'labels' || activeMarkerMode === 'points') && point
              ? point
              : null
          const groupFocusTarget = groupData?.fields?.location?.[0]?.coordinates
            ? [groupData.fields.location[0].coordinates[1], groupData.fields.location[0].coordinates[0]] as [number, number]
            : null

          const focusTarget = pointFocusTarget || groupFocusTarget
          if (!focusTarget) return

          if (mapInstance.current) {
            const currentZoom = mapInstance.current.getZoom?.() ?? 18
            const maxZoom = mapInstance.current.getMaxZoom?.() ?? 20
            const nextZoom = Math.min(currentZoom + 2, maxZoom)
            mapInstance.current.setView(focusTarget, nextZoom)
          }

          const newParams = new URLSearchParams(searchParams)
          const hasMaxResults = newParams.has('maxResults')
          const hasMapSettings = newParams.has('mapSettings')

          if (!hasMaxResults) {
            newParams.set('maxResults', defaultMaxResultsParam)
          }
          if (hasMapSettings) {
            newParams.delete('mapSettings')
          }
          if (!hasMaxResults || hasMapSettings) {
            router.push(`?${newParams.toString()}`)
          }
        }

        return (

          <>
            <AttributionControl prefix={false} position={isMobile ? "bottomleft" : "bottomright"} />
            <EventHandlers />

            {baseMap && baseMapLookup[baseMap] && (
              <TileLayer
                key={`base-${baseMap}`}
                maxZoom={baseMapLookup[baseMap].maxZoom ?? 18}
                maxNativeZoom={baseMapLookup[baseMap].maxNativeZoom ?? 18}
                zIndex={100}
                {...baseMapLookup[baseMap].props}
              />
            )}
            {(overlayMaps || []).map((overlayKey) => {
              const overlayMap = baseMapLookup[overlayKey]
              if (!overlayMap) return null
              if (overlayMap.wms) {
                return (
                  <WMSTileLayer
                    key={`overlay-wms-${overlayKey}`}
                    url={overlayMap.props.url}
                    attribution={overlayMap.props.attribution}
                    layers={overlayMap.wms.layers}
                    format={overlayMap.wms.format ?? 'image/png'}
                    transparent={overlayMap.wms.transparent ?? true}
                    version={overlayMap.wms.version ?? '1.3.0'}
                    opacity={overlayMap.opacity ?? 1}
                    zIndex={200}
                  />
                )
              }
              return (
                <TileLayer
                  key={`overlay-${overlayKey}`}
                  maxZoom={18}
                  maxNativeZoom={18}
                  opacity={overlayMap.opacity ?? 1}
                  zIndex={200}
                  {...overlayMap.props}
                />
              )
            })}


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
                        },
                        keydown: (e: KeyboardEvent & { originalEvent?: KeyboardEvent }) => {
                          const key = e.originalEvent?.key ?? e.key
                          if (key === 'Enter' || key === ' ') {
                            ;(e.originalEvent ?? e).preventDefault()
                            if (mapInstance.current) {
                              mapInstance.current.fitBounds(zoomTarget, { maxZoom: 18 });
                            }
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
                const selected = Boolean(activeGroupValue && item.fields?.["group.id"]?.[0] == groupData?.fields?.["group.id"]?.[0] && !groupLoading)
                const selectedInCadastre = Boolean(tree && docData && item.fields?.["uuid"]?.[0] == docData._source.uuid)
                const isActiveGroupMarker = Boolean(activeGroupValue && item.fields?.["group.id"]?.[0] == activeGroupValue)
                const isAtActivePoint = Boolean(activePoint && Math.abs(lat - activePoint[0]) < 0.000001 && Math.abs(lng - activePoint[1]) < 0.000001)
                const shouldHideUnlabeledActiveAreaMarker = activeGroupHasArea && (isActiveGroupMarker || isAtActivePoint)
                //if (activePoint) return null
                if (selected || selectedInCadastre) return null

                const isInit = initValue && item.fields?.["group.id"]?.[0] == initValue
                if (hasGroupParam && isInit) return null
                const markerColor = isInit ? 'black' : 'white'

                const childCount = undefined //zoomState > 15 && item.children?.length > 0 ? item.children?.length: undefined
                const labelText = getDisplayLabel(item.fields)
                const pointMarkerTooltip = (!isMobile) ? (
                  <Tooltip direction="top" offset={[0, -20]} opacity={1} className="point-marker-tooltip">
                    <div className="px-2 py-0.5 text-sm tracking-wide text-black bg-white/90 rounded-md shadow-lg whitespace-nowrap">
                      {labelText}
                    </div>
                  </Tooltip>
                ) : null
                
                const icon = getLabelMarkerIcon(labelText, markerColor, childCount, false, false, false)


                return (
                  <Fragment key={`result-frag-${item.fields.uuid[0]}`}>
                    {showMarkerBounds && item.labelBounds && (
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
                    {(activeMarkerMode === 'points' || activeGroupValue != item.fields?.["group.id"]?.[0]) && (
                      <>
                        {activeMarkerMode === 'points' ? (
                          shouldHideUnlabeledActiveAreaMarker ? null : (
                            <Marker
                              key={`result-${item.fields.uuid[0]}`}
                              position={[lat, lng]}
                              icon={new leaflet.DivIcon(getUnlabeledMarker('black'))}
                              riseOnHover={true}
                              eventHandlers={selectDocHandler(item, [lat, lng])}
                            >
                              {pointMarkerTooltip}
                            </Marker>
                          )
                        ) : activeMarkerMode === 'counts' && item.isClusterSingleton ? (
                          shouldHideUnlabeledActiveAreaMarker ? null : (
                            <Marker
                              key={`result-${item.fields.uuid[0]}`}
                              position={[lat, lng]}
                              icon={new leaflet.DivIcon(getUnlabeledMarker('black'))}
                              riseOnHover={true}
                              eventHandlers={selectDocHandler(item, [lat, lng])}
                            >
                              {pointMarkerTooltip}
                            </Marker>
                          )
                        ) : (
                          <Marker
                            key={`result-${item.fields.uuid[0]}`}
                            position={[lat, lng]}
                            icon={new leaflet.DivIcon(icon)}
                            riseOnHover={true}
                            eventHandlers={selectDocHandler(item, [lat, lng])}
                          />
                        )}
                      </>
                    )}
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



            {groupData && !coordinateInfo && activePoint && (
              <Marker
                zIndexOffset={2000}
                icon={new leaflet.DivIcon(
                  activeGroupHasArea
                    ? getAreaLabelMarkerIcon(getDisplayLabel(groupData.fields))
                    : getLabelMarkerIcon(
                      getDisplayLabel(groupData.fields),
                      'accent',
                      undefined,
                      true,
                      false,
                      true
                    )
                )}
                position={activePoint}
                eventHandlers={{
                  click: focusGroupMarker,
                  keydown: (e: KeyboardEvent & { originalEvent?: KeyboardEvent }) => {
                    const key = e.originalEvent?.key ?? e.key
                    if (key === 'Enter' || key === ' ') {
                      ;(e.originalEvent ?? e).preventDefault()
                      focusGroupMarker()
                    }
                  }
                }}
              >
              </Marker>
            )}
            {hasGroupParam && !coordinateInfo && point && (point != activePoint) && (
              <Marker
                zIndexOffset={1500}
                icon={new leaflet.DivIcon(getInitAnchorMarker())}
                position={point}
                eventHandlers={{
                  click: () => {
                    const newParams = new URLSearchParams(searchParams)
                    newParams.delete('group')
                    newParams.delete('activePoint')
                    router.push(`?${newParams.toString()}`)
                    if (scrollableContentRef?.current) {
                      requestAnimationFrame(() => {
                        scrollableContentRef.current?.scrollTo({
                          top: 0,
                          behavior: 'smooth'
                        })
                      })
                    }
                  },
                  keydown: (e: KeyboardEvent & { originalEvent?: KeyboardEvent }) => {
                    const key = e.originalEvent?.key ?? e.key
                    if (key === 'Enter' || key === ' ') {
                      ;(e.originalEvent ?? e).preventDefault()
                      const newParams = new URLSearchParams(searchParams)
                      newParams.delete('activePoint')
                      newParams.delete('group')
                      router.push(`?${newParams.toString()}`)
                      if (scrollableContentRef?.current) {
                        requestAnimationFrame(() => {
                          scrollableContentRef.current?.scrollTo({
                            top: 0,
                            behavior: 'smooth'
                          })
                        })
                      }
                    }
                  }
                }}
              />
            )}

            {
              (() => {
                // When tree mode is active (and a cadastral unit is selected), show connected markers for
                // the cadastral unit (gård) and its subunits (bruk) instead of "sources in init group".
                const isTreeActive = !!tree && !!treeDataset && !!treeUuid

                const subunitHits: any[] = treeSubunitsData?.hits?.hits || []
                const subunitWithCoords = subunitHits.filter((h: any) => h?._source?.location?.coordinates?.length === 2)
                const farmCoord = treeUnitDoc?.location?.coordinates?.length === 2
                  ? [treeUnitDoc.location.coordinates[1], treeUnitDoc.location.coordinates[0]]
                  : null

                // The central point MUST be the cadastral unit's own coordinate (gård).
                // If we don't have that coordinate, we don't render this overlay.
                const central = farmCoord

                if (isTreeActive && central && subunitWithCoords.length > 0) {
                  const [centralLat, centralLng] = central as [number, number]

                  // De-duplicate subunits by coordinate (so we don't draw multiple identical lines)
                  const uniqueCoordKey = (lat: number, lng: number) => `${lat},${lng}`
                  const uniqueCoords = new Set<string>()

                  const numberCircleIcon = (value: string, variant: 'black' | 'white' = 'white') => {
                    const bg = variant === 'black' ? '#000000' : '#ffffff'
                    const fg = variant === 'black' ? '#ffffff' : '#000000'
                    const border = '#000000'
                    return new leaflet.DivIcon({
                      className: '',
                      html: `
                        <div role="button" tabindex="0" style="
                          width: 22px;
                          height: 22px;
                          border-radius: 9999px;
                          border: 2px solid ${border};
                          background: ${bg};
                          color: ${fg};
                          display: flex;
                          align-items: center;
                          justify-content: center;
                          font-size: 12px;
                          font-weight: 700;
                          box-shadow: 0 1px 4px rgba(0,0,0,0.2);
                          transform: translate(-50%, -50%);
                        ">
                          ${value}
                        </div>
                      `,
                      iconSize: [22, 22],
                      iconAnchor: [0, 0],
                    })
                  }

                  return (
                    <>
                      {/* Farm (cadastral unit) marker */}
                      {farmCoord && (
                        <>
                          {/* Circle (dot) at farm coordinate */}
                          <CircleMarker
                            key={`tree-farm-dot-${treeUuid}`}
                            center={[centralLat, centralLng]}
                            radius={7}
                            weight={3}
                            opacity={1}
                            fillOpacity={1}
                            color="#000000"
                            fillColor="#ffffff"
                            pane="treeCirclePane"
                            eventHandlers={{
                              click: () => {
                                const newParams = new URLSearchParams(searchParams);
                                if (treeUnitDoc?.group?.id) {
                                  newParams.set('init', stringToBase64Url(treeUnitDoc.group.id));
                                  newParams.delete('group');
                                }
                                newParams.set('activePoint', `${centralLat},${centralLng}`);
                                newParams.set('maxResults', defaultMaxResultsParam);
                                router.push(`?${newParams.toString()}`);
                              },
                              keydown: (e: KeyboardEvent & { originalEvent?: KeyboardEvent }) => {
                                const key = e.originalEvent?.key ?? e.key
                                if (key === 'Enter' || key === ' ') {
                                  ;(e.originalEvent ?? e).preventDefault()
                                  const newParams = new URLSearchParams(searchParams);
                                  if (treeUnitDoc?.group?.id) {
                                    newParams.set('init', stringToBase64Url(treeUnitDoc.group.id));
                                    newParams.delete('group');
                                  }
                                  newParams.set('activePoint', `${centralLat},${centralLng}`);
                                  newParams.set('maxResults', defaultMaxResultsParam);
                                  router.push(`?${newParams.toString()}`);
                                }
                              }
                            }}
                          />

                          {/* Label marker (number + label) */}
                          <Marker
                            key={`tree-farm-label-${treeUuid}`}
                            zIndexOffset={2500}
                            pane="treeLabelPane"
                            icon={new leaflet.DivIcon(
                              getLabelMarkerIcon(
                                `${treeDataset ? (getGnr({ _source: treeUnitDoc }, treeDataset) || '') : ''} ${treeUnitDoc?.label || '[utan namn]'}`
                                  .trim() || '[utan namn]',
                                'black',
                                undefined,
                                true,
                                false,
                                false
                              )
                            )}
                            position={[centralLat, centralLng]}
                            eventHandlers={{
                              click: () => {
                                const newParams = new URLSearchParams(searchParams);
                                if (treeUnitDoc?.group?.id) {
                                  newParams.set('init', stringToBase64Url(treeUnitDoc.group.id));
                                  newParams.delete('group');
                                }
                                newParams.set('activePoint', `${centralLat},${centralLng}`);
                                newParams.set('maxResults', defaultMaxResultsParam);
                                router.push(`?${newParams.toString()}`);
                              },
                              keydown: (e: KeyboardEvent & { originalEvent?: KeyboardEvent }) => {
                                const key = e.originalEvent?.key ?? e.key
                                if (key === 'Enter' || key === ' ') {
                                  ;(e.originalEvent ?? e).preventDefault()
                                  const newParams = new URLSearchParams(searchParams);
                                  if (treeUnitDoc?.group?.id) {
                                    newParams.set('init', stringToBase64Url(treeUnitDoc.group.id));
                                    newParams.delete('group');
                                  }
                                  newParams.set('activePoint', `${centralLat},${centralLng}`);
                                  newParams.set('maxResults', defaultMaxResultsParam);
                                  router.push(`?${newParams.toString()}`);
                                }
                              }
                            }}
                          />
                        </>
                      )}

                      {/* Lines + subunit markers */}
                      {subunitWithCoords.map((hit: any, index: number) => {
                        const coords = hit?._source?.location?.coordinates
                        if (!coords?.length) return null
                        const lat = coords[1]
                        const lng = coords[0]
                        const coordKey = uniqueCoordKey(lat, lng)
                        const isCentral = lat === centralLat && lng === centralLng
                        if (isCentral) return null
                        if (uniqueCoords.has(coordKey)) return null
                        uniqueCoords.add(coordKey)

                        const bnr = treeDataset ? getBnr(hit, treeDataset) : null
                        const numberText = (bnr || '').toString().trim() || '?'

                        return (
                          <Fragment key={`tree-subunit-${index}-${coordKey}`}>
                            <Polyline
                              key={`tree-line-${index}-${coordKey}`}
                              positions={[[lat, lng], [centralLat, centralLng]]}
                              pane="treeLinePane"
                              pathOptions={{
                                color: '#000000',
                                weight: 3,
                                opacity: 0.5
                              }}
                            />
                            <Marker
                              key={`tree-marker-${index}-${coordKey}`}
                              position={[lat, lng]}
                              pane="treeCirclePane"
                              icon={numberCircleIcon(numberText, 'white')}
                              eventHandlers={{
                                click: () => {
                                  const newParams = new URLSearchParams(searchParams);
                                  if (hit?._source?.uuid) {
                                    newParams.set('doc', hit._source.uuid);
                                  }
                                  newParams.set('activePoint', `${lat},${lng}`);
                                  router.push(`?${newParams.toString()}`);
                                },
                                keydown: (e: KeyboardEvent & { originalEvent?: KeyboardEvent }) => {
                                  const key = e.originalEvent?.key ?? e.key
                                  if (key === 'Enter' || key === ' ') {
                                    ;(e.originalEvent ?? e).preventDefault()
                                    const newParams = new URLSearchParams(searchParams);
                                    if (hit?._source?.uuid) {
                                      newParams.set('doc', hit._source.uuid);
                                    }
                                    newParams.set('activePoint', `${lat},${lng}`);
                                    router.push(`?${newParams.toString()}`);
                                  }
                                }
                              }}
                            />
                          </Fragment>
                        )
                      })}
                    </>
                  )
                }

                // Default mode: show lines and dots for the init group only when there is an activePoint
                if (!coordinateInfo || !initValue || !initGroupData?.sources) return null;

                // Find the first source with coordinates - this is the central coordinate
                const centralSource = initGroupData.sources.find((source: Record<string, any>) =>
                  source?.location?.coordinates?.length === 2
                );

                if (!centralSource) return null;

                const centralLat = centralSource.location.coordinates[1];
                const centralLng = centralSource.location.coordinates[0];

                // Collect all unique coordinates to check if there are multiple
                const uniqueCoordinates = new Set<string>();
                initGroupData.sources.forEach((source: Record<string, any>) => {
                  if (source?.location?.coordinates?.length === 2) {
                    const lat = source.location.coordinates[1];
                    const lng = source.location.coordinates[0];
                    uniqueCoordinates.add(`${lat},${lng}`);
                  }
                });

                // Only show lines and dots if there are multiple coordinates
                if (uniqueCoordinates.size < 2) return null;

                // Create a set of unique coordinates for rendering
                const coordinatesToRender = new Set<string>();
                initGroupData.sources.forEach((source: Record<string, any>) => {
                  if (source?.location?.coordinates?.length === 2) {
                    const lat = source.location.coordinates[1];
                    const lng = source.location.coordinates[0];
                    coordinatesToRender.add(`${lat},${lng}`);
                  }
                });

                return (
                  <>
                    {/* Render all lines first (so they appear behind) */}
                    {initGroupData.sources.map((source: Record<string, any>, index: number) => {
                      if (!source?.location?.coordinates?.length) {
                        return null;
                      }
                      const lat = source.location.coordinates[1];
                      const lng = source.location.coordinates[0];

                      const isCentral = centralLat === lat && centralLng === lng;

                      // Only render line if not central
                      if (isCentral) return null;

                      return (
                        <Polyline
                          key={`line-${index}`}
                          positions={[[lat, lng], [centralLat, centralLng]]}
                          pathOptions={{
                            color: '#000000',
                            weight: 3,
                            opacity: 0.5
                          }}
                        />
                      );
                    })}
                    {/* Render all dots after lines (so they appear on top) */}
                    {initGroupData.sources.map((source: Record<string, any>, index: number) => {
                      if (!source?.location?.coordinates?.length) {
                        return null;
                      }
                      const lat = source.location.coordinates[1];
                      const lng = source.location.coordinates[0];

                      // Create a unique key for this coordinate
                      const coordKey = `${lat},${lng}`;

                      // Skip if we've already rendered this coordinate (remove from set as we render)
                      if (!coordinatesToRender.has(coordKey)) {
                        return null;
                      }

                      // Remove from set so we only render each unique coordinate once
                      coordinatesToRender.delete(coordKey);

                      return (
                        <CircleMarker
                          key={`marker-${index}`}
                          center={[lat, lng]}
                          radius={6}
                          weight={2}
                          opacity={1}
                          fillOpacity={1}
                          color="#000000"
                          fillColor="white"
                          eventHandlers={{
                            click: () => {
                              const newParams = new URLSearchParams(searchParams);
                              newParams.set('activePoint', `${lat},${lng}`);
                              router.push(`?${newParams.toString()}`);
                            },
                            keydown: (e: KeyboardEvent & { originalEvent?: KeyboardEvent }) => {
                              const key = e.originalEvent?.key ?? e.key
                              if (key === 'Enter' || key === ' ') {
                                ;(e.originalEvent ?? e).preventDefault()
                                const newParams = new URLSearchParams(searchParams);
                                newParams.set('activePoint', `${lat},${lng}`);
                                router.push(`?${newParams.toString()}`);
                              }
                            }
                          }}
                        />
                      );
                    })}
                  </>
                );
              })()
            }

            {debug && <DynamicDebugLayers mapInstance={mapInstance} Polygon={Polygon} Rectangle={Rectangle} CircleMarker={CircleMarker} geotileKeyToBounds={geotileKeyToBounds} markerCells={markerCells} />}

            {(() => {
              if (!areaSource?.area || coordinateInfo) return null;

              try {
                const geoJSON = wkt.parse(areaSource.area);
                if (!geoJSON) return null;
                const toLatLng = (coord: [number, number] | [number, number, number]): [number, number] => [coord[1], coord[0]];

                switch (geoJSON.type) {
                  case 'Polygon':
                    return <Polygon
                      positions={geoJSON.coordinates[0].map(toLatLng)}
                      interactive={false}
                      pathOptions={{
                        color: '#0061ab',
                        weight: 2,
                        opacity: 0.9,
                        fillOpacity: 0.2
                      }}
                    />;
                  case 'MultiPolygon':
                    return <MultiPolygon
                      positions={geoJSON.coordinates.map((polygon) =>
                        polygon.map((ring) =>
                          ring.map(toLatLng)
                        )
                      )}
                      interactive={false}
                      pathOptions={{
                        color: '#0061ab',
                        weight: 2,
                        opacity: 0.9,
                        fillOpacity: 0.2
                      }}
                    />;
                  case 'LineString':
                    return <Polyline
                      positions={geoJSON.coordinates.map(toLatLng)}
                      interactive={false}
                      pathOptions={{
                        color: '#0061ab',
                        weight: 5,
                        opacity: 0.9,
                        fillOpacity: 0.2
                      }}
                    />;
                  case 'MultiLineString':
                    return (
                      <>
                        {geoJSON.coordinates.map((lineCoords, index) => (
                          <Polyline
                            key={index}
                            positions={lineCoords.map(toLatLng)}
                            interactive={false}
                            pathOptions={{
                              color: '#0061ab',
                              weight: 5,
                              opacity: 0.9,
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
            {myLocation && <CircleMarker center={myLocation} radius={10} color="#cf3c3a" interactive={false} />}
            {urlRadius && point && <Circle center={point} radius={urlRadius} color="#0061ab" interactive={false} />}
            {displayRadius && (point || displayPoint) && <Circle center={point || displayPoint} radius={displayRadius} color="#cf3c3a" interactive={false} />}
            {point && !initValue && !activeGroupHasArea && <Marker icon={new leaflet.DivIcon(getUnlabeledMarker("primary"))} position={point} />}
            {coordinateInfo && <Marker icon={new leaflet.DivIcon(getUnlabeledMarker("accent"))} position={activePoint} 
            eventHandlers={{
              click: () => {
                // Center view
                if (mapInstance.current) {
                  mapInstance.current.setView(activePoint, 18);
                }
              },
              keydown: (e: KeyboardEvent & { originalEvent?: KeyboardEvent }) => {
                const key = e.originalEvent?.key ?? e.key
                if (key === 'Enter' || key === ' ') {
                  ;(e.originalEvent ?? e).preventDefault()
                  if (mapInstance.current) {
                    mapInstance.current.setView(activePoint, 18);
                  }
                }
              }
            }}
            />}

          </>)
      }}


    </DynamicMap>

  </>
}