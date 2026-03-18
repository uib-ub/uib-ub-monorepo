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
    const initCode = init ? init : null
    return { initValue, initCode }
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




export function usePoint(): [number, number] | null {
    const point = useGetParam('point')
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

export function useCenterParam() {
    return useGetParam('center')
}

export function useDatasetTag() {
    return useGetParam('datasetTag')
}

export function useFulltextOn() {
    return useGetParam('fulltext') == 'on'
}

export function useOptionsOn() {
    return useGetParam('options') == 'on'
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

export function useSourceViewOn() {
    return useGetParam('sourceView') == 'on'
}



export function useMode() {
    const datasetTag = useDatasetTag()
    const perspective = usePerspective()
    const mode = useGetParam('mode')

    if (datasetTag == 'base') {
        return 'list'
    }


    return mode || contentSettings[perspective]?.display || 'map'
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