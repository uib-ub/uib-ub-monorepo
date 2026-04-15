'use client'
import { baseMapLookup } from "@/config/basemap-config";
import { useSearchQuery } from "@/lib/search-params";
import { useSearchParams } from "next/navigation";
import { Fragment, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { getAreaLabelMarkerIcon, getBrukMarkerIcon, getClusterMarker, getInitAnchorMarker, getLabelMarkerIcon, getUnlabeledMarker } from "./markers";

import { boundsFromZoomAndCenter, calculateRadius, getGridSize, getLabelBounds, MAP_DRAWER_BOTTOM_HEIGHT_REM } from "@/lib/map-utils";
import { useActivePoint, useCenterNumber, useDebugGroupsOn, useDocParam, useGroupParam, useMapSettingsOn, usePoint, useQParam, useRadiusNumber, useSourceViewOn, useTreeParam, useZoomNumber, useInitDecoded, useInitParam } from "@/lib/param-hooks";
import { stringToBase64Url } from "@/lib/param-utils";
import { parseTreeParam } from "@/lib/tree-param";
import { getBnr, indexToCode } from "@/lib/utils";
import useDocData from "@/state/hooks/doc-data";
import useResultCardData from "@/state/hooks/result-card-data";
import useSearchData from "@/state/hooks/search-data";
import { GlobalContext } from "@/state/providers/global-provider";
import { useMapSettings } from '@/state/zustand/persistent-map-settings';
import { useNotificationStore } from "@/state/zustand/notification-store";
import { useSessionStore } from "@/state/zustand/session-store";
import { useQueries } from "@tanstack/react-query";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import wkt from 'wellknown';
import { useDebugStore } from '../../state/zustand/debug-store';
import DynamicMap from "./leaflet/dynamic-map";
import MapToolbar from "./map-toolbar";
import { treeSettings } from "@/config/server-config";
import useTreeModeMapData from "./hooks/use-tree-mode-map-data";
import useGroupModeMapData from "./hooks/use-group-mode-map-data";

const DynamicDebugLayers = dynamic(() => import('@/components/map/debug-layers'), {
  ssr: false
});

function geotileKeyToBoundsRaw(key: string): [[number, number], [number, number]] {
  const parts = key.split('/')
  if (parts.length !== 3) {
    throw new Error('Invalid geotile key format: ' + key)
  }

  const precision = parseInt(parts[0])
  const x = parseInt(parts[1])
  const y = parseInt(parts[2])

  // Web Mercator tile bounds calculation (same as used by most web mapping services)
  const n = Math.pow(2, precision)

  // Longitude bounds
  const west = (x / n) * 360 - 180
  const east = ((x + 1) / n) * 360 - 180

  // Latitude bounds using Web Mercator inverse
  const latRad1 = Math.atan(Math.sinh(Math.PI * (1 - 2 * y / n)))
  const latRad2 = Math.atan(Math.sinh(Math.PI * (1 - 2 * (y + 1) / n)))

  const north = (latRad1 * 180) / Math.PI
  const south = (latRad2 * 180) / Math.PI

  return [[north, west], [south, east]]
}



const rootFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize);



export default function MapExplorer() {

  const showMarkerBounds = useDebugStore(state => state.showMarkerBounds);
  // Add state for H3 resolution





  const { totalHits, searchBounds, searchLoading, searchUpdatedAt } = useSearchData()
  const myLocation = useSessionStore((s) => s.myLocation)
  const setMyLocation = useSessionStore((s) => s.setMyLocation)


  const controllerRef = useRef(new AbortController());
  const { baseMap, overlayMaps, markerMode, labelCollisionDetectionEnabled, setMarkerMode, initializeSettings } = useMapSettings()
  const searchParams = useSearchParams()
  const { searchQueryString, searchFilterParamsString } = useSearchQuery()
  const urlZoom = useZoomNumber()
  const urlCenter = useCenterNumber()
  const allowFitBounds = useRef(false)
  const { resultCardData } = useResultCardData()
  const initGroupLabel = useSessionStore((s) => s.initGroupLabel)
  const initGroupPoint = useSessionStore((s) => s.initGroupPoint)
  const setInitGroupLabel = useSessionStore((s) => s.setInitGroupLabel)
  const { docData, docDataset } = useDocData()

  const { isMobile, mapFunctionRef, scrollToBrukRef } = useContext(GlobalContext)
  const mapInstance = useRef<any>(null)
  const doc = useDocParam()
  const tree = useTreeParam()
  const treeState = useMemo(() => parseTreeParam(tree), [tree])
  const setDrawerContent = useSessionStore((s) => s.setDrawerContent)
  const mapSettingsOn = useMapSettingsOn()
  const point = usePoint()
  const activePoint = useActivePoint()
  const urlRadius = useRadiusNumber()
  const displayRadius = useSessionStore((s) => s.displayRadius)
  const displayPoint = useSessionStore((s) => s.displayPoint)

  const tapHoldRef = useRef<null | number>(null)
  const setDebugChildren = useDebugStore((s) => s.setDebugChildren)
  const debug = useDebugStore((s) => s.debug)
  const showGeotileGrid = useDebugStore(state => state.showGeotileGrid);
  const showDebugGroupsOn = useDebugGroupsOn()
  const sourceViewOn = useSourceViewOn()
  const initDecoded = useInitDecoded()
  const init = useInitParam()
  const group = useGroupParam()


  const getDisplayLabel = (fields?: Record<string, any> | null): string => {
    if (sourceViewOn || tree) {
      return fields?.label?.[0] ?? '[utan namn]'
    }
    else {
      return fields?.["group.label"]?.[0] || fields?.["label"]?.[0] || '[utan namn]'
    }

  }

  const areSamePoint = (a: [number, number] | null, b: [number, number] | null) =>
    Boolean(
      a &&
      b &&
      Math.abs(a[0] - b[0]) < 0.000001 &&
      Math.abs(a[1] - b[1]) < 0.000001
    )

  const treeDataset = treeState?.dataset
  const treeAdm1 = treeState?.adm1
  const treeAdm2 = treeState?.adm2
  const treeUuid = treeState?.uuid
  const { treeUnitDoc, treeSubunitsData } = useTreeModeMapData({
    mapInstance,
    isMobile,
    treeDataset,
    treeAdm1,
    treeAdm2,
    treeUuid,
  })
  const { groupMembersData } = useGroupModeMapData({
    mapInstance,
    isMobile,
    groupEncoded: group,
  })
  const areaSource = useMemo(
    () =>
      (initDecoded
        ? resultCardData?.sources?.find(
            (source: Record<string, any>) =>
              (source.uuid === initDecoded || source.group?.id === initDecoded) && source.area
          )
        : undefined) ??
      resultCardData?.sources?.find((source: Record<string, any>) => source.area),
    [initDecoded, resultCardData?.sources]
  )
  const activeResultCardHasArea = Boolean(areaSource?.area)

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
  const [hideMarkersDuringGridTransition, setHideMarkersDuringGridTransition] = useState(false)

  // Cluster if:
  // Cluster mode
  // Zoom level < 8 - but visualized as labels. Necessary to avoid too large number of markers in border regions or coastal regions where the intersecting cell only covers a small piece of land.
  // Auto mode and ases where it's useful to se clusters of all results: query string or filter with few results
  const hasQuery = Boolean(useQParam())


  if (markerMode === 'circles') {
    setMarkerMode('points')
  }


  const activeMarkerMode = group ? 'points' : markerMode === 'auto'
    ? (hasQuery ? (zoomState < 15 ? 'counts' : 'points') : 'labels')
     : markerMode


  const markerResults = useQueries({
    queries: markerCells.map(cell => {
      const key = `${cell.precision}/${cell.x}/${cell.y}`

      return ({
        queryKey: ['markerResults', key, searchQueryString, showDebugGroupsOn, tree],
        placeHolder: (prevData: any) => prevData,
        enabled: !group && !showDebugGroupsOn && (!tree || tree.split('_').length < 4),
        queryFn: async () => {
          // In tree mode, marker queries must be driven solely by the `tree`
          // param (dataset/adm) and not by the regular search query.
          const newParams = new URLSearchParams()

          if (tree) {
            // Tree mode: markers are always limited to cadastral farms.
            newParams.set('sosi', 'gard')

            if (tree === 'root') {
              // Root: fetch from all datasets that support tree/cadastral view.
              Object.keys(treeSettings).forEach((datasetKey) => {
                newParams.append('dataset', datasetKey)
              })
            } else if (treeDataset && treeSettings[treeDataset]) {
              // Tree mode with a valid tree dataset: restrict by dataset + optional adm1/adm2 from the tree param.
              newParams.set('dataset', treeDataset)
              if (treeAdm1) newParams.set('adm1', treeAdm1)
              if (treeAdm2) newParams.set('adm2', treeAdm2)
            } else {
              // Dataset in the tree param does not support tree view: do not fetch markers.
              return []
            }
          } else {
            // Non-tree mode: fall back to the regular search-driven marker query.
            const existingParams = new URLSearchParams(searchQueryString)
            const baseParams = existingParams.toString() ? existingParams : new URLSearchParams()
            if (searchFilterParamsString) {
              baseParams.set('totalHits', totalHits.value)
            }
            baseParams.forEach((value, key) => {
              newParams.append(key, value)
            })
          }

          const medium = 100
          const max = 2000
          let clusterSize = 1

          if (activeMarkerMode != 'counts') {
            if (totalHits.value < 1000 || zoomState > 15) {
              clusterSize = max
            }
            else if (totalHits.value < 10000 && zoomState > 9) {
              clusterSize = medium
            }
        }
          newParams.set('markerClusterSize', String(clusterSize));

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
      if (hideMarkersDuringGridTransition) {
        return []
      }
      return markerResultsRef?.current
    }

    const buckets = markerResults.flatMap((result: any) => result.isSuccess && result.data ? result.data : [])
    //("BUCKETS", buckets)


    const countItems: Record<string, any>[] = []
    let minDocCount = Infinity
    let maxDocCount = 0
    const labeledMarkersLookup: Record<string, Record<string, any>[]> = {}
    const seenMarkerIds = new Set<string>()

    buckets.forEach((bucket: any) => {
      const clusterCount = sourceViewOn
        ? bucket.doc_count
        : (bucket.group_count?.value ?? bucket.doc_count)

      if (
        zoomState > 15 ||
        activeMarkerMode === 'labels' ||
        activeMarkerMode === 'points' ||
        clusterCount === 1
      ) {


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
          const dedupeKey = sourceViewOn
            ? top_hit.fields?.uuid?.[0]
            : top_hit.fields?.["group.id"]?.[0]
          if (!dedupeKey) return
          if (seenMarkerIds.has(dedupeKey)) {
            return
          }
          seenMarkerIds.add(dedupeKey)

          // Points mode and disabled collision handling: no overlap logic.
          if (activeMarkerMode === 'points' || !labelCollisionDetectionEnabled) {
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
        maxDocCount = Math.max(maxDocCount, clusterCount)
        minDocCount = Math.min(minDocCount, clusterCount)

      }
    })

    // Flatten
    const markers = Object.entries(labeledMarkersLookup).flatMap(([key, items]: [string, Record<string, any>[]]) =>
      items.map(item => {


        return ({ tile: key, ...item })
      })
    )

    type CountCluster = Record<string, any> & {
      clusterCount: number
      position: [number, number]
      zoomTarget: [[number, number], [number, number]]
      radius: number
      bubbleRadiusPx: number
    }

    const buildClusterMeta = (item: any): Omit<CountCluster, 'radius' | 'bubbleRadiusPx'> => {
      const clusterCount = sourceViewOn ? item.doc_count : (item.group_count?.value ?? item.doc_count)
      const clusterBounds = geotileKeyToBoundsRaw(item.key)

      const flattenedTopHits = item.groups?.buckets?.map((bucket: any) => bucket?.top?.hits?.hits?.[0]).filter(Boolean) ?? []
      let latSum = 0
      let lngSum = 0
      flattenedTopHits.forEach((hit: any) => {
        latSum += hit.fields.location?.[0]?.coordinates?.[1] ?? 0
        lngSum += hit.fields.location?.[0]?.coordinates?.[0] ?? 0
      })

      const centroidLat = item?.centroid?.location?.lat
      const centroidLng = item?.centroid?.location?.lon
      const centroidPos: [number, number] | null =
        typeof centroidLat === 'number' && typeof centroidLng === 'number' ? [centroidLat, centroidLng] : null

      const fallbackCenter: [number, number] = clusterBounds
        ? [
            (clusterBounds[0][0] + clusterBounds[1][0]) / 2,
            (clusterBounds[0][1] + clusterBounds[1][1]) / 2,
          ]
        : [0, 0]

      // When markerClusterSize=1 we only get one top hit, which may be an outlier.
      // Prefer the geotile bucket centroid (all docs in bucket) in that case.
      const position: [number, number] = flattenedTopHits.length > 1
        ? [latSum / flattenedTopHits.length, lngSum / flattenedTopHits.length]
        : (centroidPos ?? (flattenedTopHits.length === 1
          ? [latSum, lngSum]
          : fallbackCenter))

      const boundsHeight = clusterBounds?.[0]?.[0] != null && clusterBounds?.[1]?.[0] != null
        ? (clusterBounds[0][0] - clusterBounds[1][0])
        : 0
      const boundsWidth = clusterBounds?.[1]?.[1] != null && clusterBounds?.[0]?.[1] != null
        ? (clusterBounds[1][1] - clusterBounds[0][1])
        : 0

      const zoomTarget: [[number, number], [number, number]] = [
        [position[0] + boundsHeight / 3, position[1] - boundsWidth / 3],
        [position[0] - boundsHeight / 3, position[1] + boundsWidth / 3],
      ]

      return { ...item, clusterCount, position, zoomTarget }
    }

    const getBubbleRadiusPx = (clusterCount: number, radius: number) => {
      // Keep this in sync with the icon sizing in render.
      const extraDiameter = clusterCount > 99 ? clusterCount.toString().length / 4 : 0
      const diameter = radius * 2 + extraDiameter
      return diameter / 2 + 4 // padding to avoid "nearly touching" overlaps
    }

    const recomputeClusterRadii = (items: Array<Omit<CountCluster, 'radius' | 'bubbleRadiusPx'> | CountCluster>): CountCluster[] => {
      let min = Infinity
      let max = 0
      items.forEach((c: any) => {
        const count = c.clusterCount ?? 0
        max = Math.max(max, count)
        min = Math.min(min, count)
      })
      if (!Number.isFinite(min)) min = 0

      return items.map((c: any) => {
        const radius = calculateRadius(c.clusterCount, max, min)
        return { ...c, radius, bubbleRadiusPx: getBubbleRadiusPx(c.clusterCount, radius) }
      })
    }

    const rawClusters = countItems.map(buildClusterMeta)
    const clusters: CountCluster[] = recomputeClusterRadii(rawClusters)

    //console.log("MARKERS", markers)
    //console.log("CLUSTERS", clusters)




    const allMarkers = [...markers, ...clusters]


    markerResultsRef.current = allMarkers

    return allMarkers
  }, [markerResults, activeMarkerMode, zoomState, sourceViewOn, hideMarkersDuringGridTransition, labelCollisionDetectionEnabled])

  useEffect(() => {
    if (!hideMarkersDuringGridTransition) return
    if (markerResults.length === 0) return
    if (markerResults.some((result: any) => result.isLoading)) return
    setHideMarkersDuringGridTransition(false)
  }, [markerResults, hideMarkersDuringGridTransition])




  const updateMarkerGrid = useCallback((liveBounds: [[number, number], [number, number]], liveZoom: number, gridSizeData: { gridSize: number, precision: number }, currentCells: GeotileCell[], hideDuringTransition = false) => {
    // console.log("UPDATE MARKER GRID", liveBounds, liveZoom, gridSizeData, currentCells)
    const { gridSize, precision } = gridSizeData
    const [[north, west], [south, east]] = liveBounds

    if (liveZoom <= 4 || gridSize === 1) {
      // Set marker cells to whole world if it isn't already one cell covering the world
      if (currentCells.length === 0 || currentCells[0]?.key != '0/0/0') {
        if (hideDuringTransition && currentCells.length > 0 && currentCells[0]?.precision !== 0) {
          setHideMarkersDuringGridTransition(true)
        }
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
    const precisionChanged = currentCells.length > 0 && currentCells[0]?.precision !== precision
    if (hideDuringTransition && precisionChanged) {
      setHideMarkersDuringGridTransition(true)
    }
    setMarkerCells(newCells);
  }, [setMarkerCells]);



  useEffect(() => {
    initializeSettings()
  }, [])

  useEffect(() => {
    updateMarkerGrid(snappedBounds, zoomState, gridSizeRef.current, markerCells, false)
    //console.log("INITIALIZE MARKER GRID")
  }, [])





  // Fly to results
  useEffect(() => {
    allowFitBounds.current = true
  }, [searchUpdatedAt])





  const selectDocHandler = (selected: Record<string, any>, markerPoint: [number, number], showLabel: Boolean) => {
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

        // Immediately cache label + init + point for the anchor marker so we
        // can render it without waiting for group-data. This cache is keyed
        // by both init and point to avoid any flicker on old markers.
        const clickedLabel = sourceViewOn
          ? (fields.label?.[0] ?? fields["group.label"]?.[0] ?? '[utan namn]')
          : (fields["group.label"]?.[0] ?? fields.label?.[0] ?? '[utan namn]')
        setInitGroupLabel(clickedLabel, markerPoint)


        newQueryParams.delete('mapSettings')
        //newQueryParams.set('point', `${markerPoint[0]},${markerPoint[1]}`)
        newQueryParams.delete('doc')
        const newInit = stringToBase64Url(
          sourceViewOn
            ? fields["uuid"][0]
            : fields["group.id"][0]
        )
        newQueryParams.set('init', newInit)
        newQueryParams.delete('resultLimit')
        newQueryParams.delete('group')
        newQueryParams.delete('activePoint')
        newQueryParams.delete('activeYear')
        newQueryParams.delete('options')
        newQueryParams.delete('mapSettings')
        newQueryParams.delete('facet')
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



  // Stable ref for components expecting a callback.
  const geotileKeyToBounds = useCallback(geotileKeyToBoundsRaw, []);


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
          const dismissNotification = useNotificationStore((s) => s.dismissNotification);
          // In case the map remounts, ensure panes exist.
          useEffect(() => {
            ensureTreeOverlayPanes(map)
          }, [map]);
          useMapEvents({
            movestart: () => {
              tapHoldRef.current = null
              const attribution = map.attributionControl;
              if (attribution) {
                attribution.getContainer().style.display = mapSettingsOn ? "block" : "none";
              }
            },

            contextmenu: (event: any) => {
              if (tree) return;
              const point = event.latlng
              // User actively chose a new point; hide the "how to move point" hint.
              dismissNotification("point-hint", true)

              const newParams = new URLSearchParams(searchParams)
              newParams.delete('init')
              newParams.delete('activePoint')
              newParams.delete('resultLimit')

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
                const zoomingOut = mapZoom < zoomState
                updateMarkerGrid([[mapBounds.getNorth(), mapBounds.getWest()], [mapBounds.getSouth(), mapBounds.getEast()]], mapZoom, gridSizeRef.current, markerCells, zoomingOut);
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
                updateMarkerGrid([[north, west], [south, east]], map.getZoom(), gridSizeRef.current, markerCells, false);
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
                //console.log(item)

                const avgLocation: [number, number] = item.position
                const zoomTarget: [[number, number], [number, number]] = item.zoomTarget




                const count = item.clusterCount ?? item.doc_count
                const clusterIcon = new leaflet.DivIcon(getClusterMarker(count, item.radius * 2 + (count > 99 ? count.toString().length / 4 : 0),
                  item.radius * 2,
                  item.radius * 0.8))
                const clusterBounds = typeof item.key === 'string' && !item.key.includes('+')
                  ? geotileKeyToBoundsRaw(item.key)
                  : null

                return (
                  <Fragment key={`cluster-fragment-${item.key}`}>
                    {debug && showGeotileGrid && clusterBounds && <><Rectangle
                      key={`cluster-rect-${item.key}`}
                      bounds={clusterBounds}
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
                          if (mapInstance.current) {
                            mapInstance.current.fitBounds(zoomTarget, { maxZoom: 18 });
                            // Ensure the view is centered on the cluster centroid/position.
                            mapInstance.current.panTo(avgLocation, { animate: false });
                          }
                        },
                        keydown: (e: KeyboardEvent & { originalEvent?: KeyboardEvent }) => {
                          const key = e.originalEvent?.key ?? e.key
                          if (key === 'Enter' || key === ' ') {
                            ;(e.originalEvent ?? e).preventDefault()
                            if (mapInstance.current) {
                              mapInstance.current.fitBounds(zoomTarget, { maxZoom: 18 });
                              mapInstance.current.panTo(avgLocation, { animate: false });
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
                const isAtPoint = Boolean(point && areSamePoint([lat, lng], point))
                const isAtActivePoint = Boolean(activePoint && areSamePoint([lat, lng], activePoint))
                const isInit = Boolean(
                  initDecoded &&
                  (
                    sourceViewOn
                      ? item.fields?.["uuid"]?.[0] == initDecoded
                      : item.fields?.["group.id"]?.[0] == initDecoded
                  )
                )

                if (isInit || isAtPoint || isAtActivePoint) {
                  return
                }

                const markerUuid = item.fields?.uuid?.[0]
                const isActiveDoc = Boolean(
                  tree &&
                  doc &&
                  markerUuid &&
                  doc.trim() === String(markerUuid).trim()
                )
                const childCount = zoomState > 15 && item.children?.length > 0 ? item.children?.length: undefined
                const labelText = getDisplayLabel(item.fields)
                const pointMarkerTooltip = (!isMobile) ? (
                  <Tooltip direction="top" offset={[0, -20]} opacity={1} className="point-marker-tooltip">
                    <div className="px-2 py-0.5 text-sm tracking-wide text-black bg-white/90 rounded-md shadow-lg whitespace-nowrap">
                      {labelText}
                    </div>
                  </Tooltip>
                ) : null
                
                const showLabel = activeMarkerMode != 'points' && (!hasQuery || activeMarkerMode === 'labels')
                const icon = showLabel
                  ? getLabelMarkerIcon(labelText, isActiveDoc ? 'accent' : 'white', childCount, false)
                  : getUnlabeledMarker(isActiveDoc ? 'accent' : 'black')

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

                          <Marker
                            key={`result-${item.fields.uuid[0]}`}
                            position={[lat, lng]}
                            icon={new leaflet.DivIcon(icon)}
                            zIndexOffset={isActiveDoc ? 200 : 0}
                            riseOnHover={true}
                            eventHandlers={selectDocHandler(item, [lat, lng], showLabel)}
                          >
                            {showLabel ? null : pointMarkerTooltip }
                          </Marker>

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

            {
              (() => {
                // When tree mode is active (and a cadastral unit is selected), show connected markers for
                // the cadastral unit (gård) and its subunits (bruk) instead of "sources in init group".
                const isTreeActive = !!tree && !!treeDataset && !!treeUuid
                

                const subunitHits: any[] = treeSubunitsData?.hits?.hits || []
                const subunitWithCoords = subunitHits.filter((h: any) => h?._source?.location?.coordinates?.length === 2)

                // Prefer the explicitly selected tree unit when tree mode is active.
                // Otherwise, fall back to the currently active doc when it is a cadastral unit (gård)
                // in a dataset that supports tree view. This allows the gård label marker to appear
                // when the document is highlighted via the `doc` param, even if the tree is not expanded.
                const treeCentralSource =
                  (isTreeActive && treeUnitDoc)
                    ? treeUnitDoc
                    : (docData?._source?.sosi === 'gard' && docDataset && treeSettings[docDataset])
                      ? docData._source
                      : null

                const farmCoord = treeCentralSource?.location?.coordinates?.length === 2
                  ? [treeCentralSource.location.coordinates[1], treeCentralSource.location.coordinates[0]]
                  : null

                // The central point MUST be the cadastral unit's own coordinate (gård).
                // If we don't have that coordinate, we don't render this overlay.
                const central = farmCoord

                if (isTreeActive && central && subunitWithCoords.length > 0) {
                  const [centralLat, centralLng] = central as [number, number]

                  const coordKeyFor = (lat: number, lng: number) => `${lat},${lng}`

                  // Group subunits by coordinate so a single marker can
                  // represent multiple bruk that share the same point.
                  const subunitsByCoord: Record<string, { lat: number; lng: number; hits: any[] }> = {}
                  for (const hit of subunitWithCoords) {
                    const coords = hit?._source?.location?.coordinates
                    if (!coords?.length) continue
                    const lat = coords[1]
                    const lng = coords[0]
                    const key = coordKeyFor(lat, lng)
                    if (!subunitsByCoord[key]) {
                      subunitsByCoord[key] = { lat, lng, hits: [] }
                    }
                    subunitsByCoord[key].hits.push(hit)
                  }

                  return (
                    <>
                      {/* Lines + subunit markers */}
                      {Object.entries(subunitsByCoord).map(([coordKey, group], index) => {
                        const { lat, lng, hits } = group
                        const isCentral = lat === centralLat && lng === centralLng
                        //if (isCentral) return null

                        const bnrs = treeDataset
                          ? hits
                            .map((h: any) => getBnr(h))
                            .filter((b: any) => b !== null && b !== undefined && `${b}`.trim().length > 0)
                          : []

                        const fallbackLabel = hits
                          .map((h: any) => h?._source?.label)
                          .find((value: any) => typeof value === "string" && value.trim().length > 0)

                        const hasMultiple = hits.length > 1
                        const firstText = (bnrs[0] ?? '').toString().trim()
                        const baseText = firstText || fallbackLabel || '?'
                        const displayText = hasMultiple ? `${baseText}…` : baseText

                        const isActiveBruk = Boolean(
                          activePoint &&
                          Math.abs(lat - activePoint[0]) < 0.000001 &&
                          Math.abs(lng - activePoint[1]) < 0.000001
                        )

                        return (
                          <Fragment key={`tree-subunit-${index}-${coordKey}`}>
                            {isActiveBruk && <Polyline
                              key={`tree-line-${index}-${coordKey}`}
                              positions={[[lat, lng], [centralLat, centralLng]]}
                              pane="treeLinePane"
                              pathOptions={{
                                color: isActiveBruk ? '#0061ab' : '#000000',
                                weight: 3,
                                opacity: 0.75
                              }}
                            />}
                            <Marker
                              key={`tree-marker-${index}-${coordKey}`}
                              position={[lat, lng]}
                              pane="treeCirclePane"
                              zIndexOffset={isActiveBruk ? 100 : 0}
                              icon={new leaflet.DivIcon(getBrukMarkerIcon(displayText, { isActive: isActiveBruk, isMulti: hasMultiple }))}
                              eventHandlers={{
                                click: () => {
                                  const activePointStr = `${lat},${lng}`;
                                  const newParams = new URLSearchParams(searchParams);
                                  const firstHit = hits[0]
                                  if (firstHit?._source?.uuid) {
                                    newParams.set('doc', firstHit._source.uuid);
                                  }
                                  newParams.set('activePoint', activePointStr);
                                  router.push(`?${newParams.toString()}`);
                                  scrollToBrukRef.current?.(activePointStr);
                                },
                                keydown: (e: KeyboardEvent & { originalEvent?: KeyboardEvent }) => {
                                  const key = e.originalEvent?.key ?? e.key
                                  if (key === 'Enter' || key === ' ') {
                                    ;(e.originalEvent ?? e).preventDefault()
                                    const activePointStr = `${lat},${lng}`;
                                    const newParams = new URLSearchParams(searchParams);
                                    const firstHit = hits[0]
                                    if (firstHit?._source?.uuid) {
                                      newParams.set('doc', firstHit._source.uuid);
                                    }
                                    newParams.set('activePoint', activePointStr);
                                    router.push(`?${newParams.toString()}`);
                                    scrollToBrukRef.current?.(activePointStr);
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
              })()
            }

            {(() => {
              if (!group || !groupMembersData) return null
              const hits: any[] = groupMembersData?.hits?.hits || []
              const withCoords = hits.filter((h: any) => h?._source?.location?.coordinates?.length === 2)
              if (!withCoords.length) return null

              return (
                <>
                  {withCoords.map((hit: any, index: number) => {
                    const coords = hit._source.location.coordinates
                    const lat = coords[1]
                    const lng = coords[0]
                    const isAtActivePoint = Boolean(
                      activePoint &&
                      Math.abs(lat - activePoint[0]) < 0.000001 &&
                      Math.abs(lng - activePoint[1]) < 0.000001
                    )
                    const label = hit._source?.label || '[utan namn]'
                    const uuid = hit._source?.uuid
                    const groupId = hit._source?.group?.id
                    // Grouped-map markers represent concrete source records, so
                    // init should prefer the source uuid (not group.id).
                    const initId = uuid || groupId

                    const pointMarkerTooltip = (!isMobile) ? (
                      <Tooltip direction="top" offset={[0, -20]} opacity={1} className="point-marker-tooltip">
                        <div className="px-2 py-0.5 text-sm tracking-wide text-black bg-white/90 rounded-md shadow-lg whitespace-nowrap">
                          {label}
                        </div>
                      </Tooltip>
                    ) : null

                    return (
                      <Marker
                        key={`group-member-${uuid || index}`}
                        position={[lat, lng]}
                        zIndexOffset={isAtActivePoint ? 100 : 0}
                        icon={new leaflet.DivIcon(getUnlabeledMarker(isAtActivePoint ? 'accent' : 'black'))}
                        eventHandlers={{
                          click: () => {
                            const newParams = new URLSearchParams(searchParams)
                            if (initId) newParams.set('init', stringToBase64Url(initId))
                            newParams.set('activePoint', `${lat},${lng}`)
                            router.push(`?${newParams.toString()}`)
                          },
                          keydown: (e: KeyboardEvent & { originalEvent?: KeyboardEvent }) => {
                            const key = e.originalEvent?.key ?? e.key
                            if (key === 'Enter' || key === ' ') {
                              ;(e.originalEvent ?? e).preventDefault()
                              const newParams = new URLSearchParams(searchParams)
                              if (initId) newParams.set('init', stringToBase64Url(initId))
                              newParams.set('activePoint', `${lat},${lng}`)
                              router.push(`?${newParams.toString()}`)
                            }
                          }
                        }}
                      >
                        {pointMarkerTooltip}
                      </Marker>
                    )
                  })}
                </>
              )
            })()}

            {debug && <DynamicDebugLayers mapInstance={mapInstance} Polygon={Polygon} Rectangle={Rectangle} CircleMarker={CircleMarker} geotileKeyToBounds={geotileKeyToBounds} markerCells={markerCells} />}

            {(() => {
              if (!areaSource?.area) return null;

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

            
            { activePoint && !tree && (
              <>
                <Marker
                  zIndexOffset={2500}
                  icon={new leaflet.DivIcon(getUnlabeledMarker("accent", { activeOval: true }))}
                  position={activePoint }
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
                />
              </>
            )}
            {point && !activePoint && !init && <Marker icon={new leaflet.DivIcon(getInitAnchorMarker())} position={point} />}
            {point && !activePoint && init && (() => {
              const cachedInitLabel =
                initGroupLabel && initGroupPoint && areSamePoint(initGroupPoint, point)
                  ? initGroupLabel
                  : undefined

              const resolvedInitLabel =
                cachedInitLabel ??
                (sourceViewOn
                  ? (resultCardData?.label ?? resultCardData?.fields?.label?.[0])
                  : (resultCardData?.fields?.["group.label"]?.[0] ?? resultCardData?.fields?.label?.[0]))

              const shouldUseUnlabeled =
                activeMarkerMode == 'points' ||
                (activeMarkerMode == 'counts' && hasQuery) ||
                !resolvedInitLabel

              return (
                <Marker
                  zIndexOffset={1000}
                  icon={new leaflet.DivIcon(
                    shouldUseUnlabeled
                      ? getUnlabeledMarker('accent', { activeOval: true })
                      : getLabelMarkerIcon(resolvedInitLabel, 'accent', undefined, true)
                  )}
                  position={point}
                />
              )
            })()}

          </>)
      }}


    </DynamicMap>

  </>
}