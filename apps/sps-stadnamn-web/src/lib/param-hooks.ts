/**
 * Naming conventions
 * 
 * Hooks that only verify the parameter and return the value:
 * <param>Param()
 * 
 * 
 * Hooks that decode base64Url before returning the value:
 * <param>Decoded()
 * 
 * Hooks that return a boolean value:
 * <param>On()
 * 
 *
 */

'use client'
import { contentSettings } from "@/config/server-config"
import { GlobalContext } from "@/state/providers/global-provider"
import { useSearchParams } from "next/navigation"
import { useContext } from "react"
import { base64UrlToString } from "./param-utils"
import type { ReservedSearchParamKey } from "./reserved-param-types"

export const useGetParam = (key: ReservedSearchParamKey) => {
    const searchParams = useSearchParams()
    return searchParams.get(key)
}

export const useGetAllParam = (keys: ReservedSearchParamKey) => {
    const searchParams = useSearchParams()
    return searchParams.getAll(keys) as string[]
}

export function usePerspective() {
    const searchParams = useSearchParams()
    const datasetParams = searchParams.getAll('dataset')
    const datasetTag = useGetParam('datasetTag')
    if (datasetTag == 'base') {
        return 'base'
    }
    if (datasetParams.length == 1) {
        return datasetParams[0]
    }

    return 'all'
}



export function useGroupParam() {
    return useGetParam('group')
}

export function useGroupDecoded() {
    const group = useGroupParam()
    const groupValue = group ? base64UrlToString(group) : null
    return groupValue
}

export function useInitParam() {
    return useGetParam('init')
}

export function useInitDecoded() {
    const init = useInitParam()
    const initValue = init ? base64UrlToString(init) : null
    return initValue
}


const validatePoint = (point: string): [number, number] | null => {
    const splitPoint = point.split(',')
    if (splitPoint.length !== 2) {
        return null
    }
    const lat = parseFloat(splitPoint[0])
    const lon = parseFloat(splitPoint[1])
    if (isNaN(lat) || isNaN(lon)) {
        return null
    }
    return [lat, lon] as [number, number]
}



export function usePointParam() {
    return useGetParam('point')
}


export function usePoint(): [number, number] | null {
    const point = usePointParam()
    if (!point) {
        return null
    }
    return validatePoint(point)
}

export function useActivePoint(): [number, number] | null {
    const activePoint = useGetParam('activePoint')
    if (!activePoint) {
        return null
    }
    return validatePoint(activePoint)
}


export function useMaxResults() {
    const maxResults = useGetParam('maxResults')
    return parseInt(maxResults || "10")

}

export function useResultsCollapsed() {
    const resultsCollapsed = useGetParam('collapsed')
    return resultsCollapsed == 'on'
}

export function useTreeParam() {
    return useGetParam('tree')
}

export function useQParam() {
    return useGetParam('q')
}

export function useMapSettingsOn() {
    return useGetParam('mapSettings') == 'on'
}

export function useOverlaySelectorOn() {
    return useGetParam('overlaySelector') === 'on'
}

export function useFacetParam() {
    return useGetParam('facet')
}

export function useZoomParam() {
    return useGetParam('zoom')
}

export function useZoomNumber() {
    const zoom = useZoomParam()
    if (!zoom) {
        return null
    }
    return parseInt(zoom)
}


export function useCenterParam() {
    return useGetParam('center')
}

export function useCenterNumber() {
    const center = useCenterParam()
    if (!center) {
        return null
    }
    return center.split(',').map(parseFloat) as [number, number]
}

export function useDatasetTagParam() {
    return useGetParam('datasetTag')
}

export function useFulltextOn() {
    return useGetParam('fulltext') == 'on'
}

export function useOptionsOn() {
    return useGetParam('options') == 'on'
}

export function useOptionsParam() {
    return useGetParam('options')
}

export function useDebugParamOn() {
    return useGetParam('debug') == 'on'
}

export function useDebugGroupsOn() {
    return useGetParam('debugGroups') == 'on'
}

export function useRadiusParam() {
    return useGetParam('radius')
}

export function useRadiusNumber() {
    const radius = useRadiusParam()
    if (!radius) {
        return null
    }
    return parseInt(radius)
}

export function useSourceViewOn() {
    return useGetParam('sourceView') == 'on'
}

export function useFuzzyOn() {
    return useGetParam('fuzzy') == 'on'
}

export function useDocParam() {
    return useGetParam('doc')
}



export function useMode() {
    const datasetTag = useDatasetTagParam()
    const perspective = usePerspective()
    const mode = useGetParam('mode')

    if (datasetTag == 'base') {
        return 'list'
    }


    return mode || contentSettings[perspective]?.display || 'map'
}

export function useSearchSortParam() {
    return useGetParam('searchSort')
}

export function useNoGeoOn() {
    return useGetParam('noGeo') == 'on'
}

export function usePageParam() {
    return useGetParam('page')
}

export function usePerPageParam() {
    return useGetParam('perPage')
}

export function usePageNumber() {
    const page = usePageParam()
    if (!page) {
        return 1
    }
    return parseInt(page) || 1
}

export function usePerPageNumber() {
    const perPage = usePerPageParam()
    if (!perPage) {
        return 10
    }
    return parseInt(perPage) || 10
}

export function useDescParam() {
    return useGetParam('desc')
}

export function useAscParam() {
    return useGetParam('asc')
}

export function useWithinParam() {
    return useGetParam('within')
}


export function useOverlayParams() {
    const optionsOn = useOptionsOn()
    const mapSettingsOn = useMapSettingsOn()
    const overlaySelectorOn = useOverlaySelectorOn()
    const facet = useFacetParam()
    const { isMobile } = useContext(GlobalContext)
    const mode = useMode()
    const maxResults = useMaxResults()
    const tree = useTreeParam()

    const tableOptions = mode == 'table' && !optionsOn

    let showLeftPanel: boolean


    if (isMobile) {
        // On mobile, when map settings are open, give them priority and hide the left panel
        showLeftPanel = (!!optionsOn || !!facet || !!tableOptions) && !mapSettingsOn
    } else {
        // On desktop, mirror mobile behavior in table mode, otherwise always show.
        showLeftPanel = mode === 'table'
            ? (!!optionsOn || !!facet || !!tableOptions)
            : true
    }

    if (tree) {
        showLeftPanel = false
    }

    const showResults = mode != 'table' && (maxResults || (isMobile && !showLeftPanel))
    // On mobile, always show the right panel if map settings are active, even if the left panel would otherwise be visible
    const showRightPanel = mode != 'table' && (isMobile ? (mapSettingsOn || !showLeftPanel) : true)

    return { showLeftPanel, showRightPanel, optionsOn, mapSettingsOn, overlaySelectorOn, facet, showResults, tableOptions }

}