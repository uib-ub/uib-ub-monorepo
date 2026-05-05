'use client'
import { contentSettings } from "@/config/server-config"
import { GlobalContext } from "@/state/providers/global-provider"
import { useSearchParams } from "next/navigation"
import { useContext } from "react"
import { base64UrlToString } from "./param-utils"


export function usePerspective() {
    const searchParams = useSearchParams()
    const datasetParams = searchParams.getAll('dataset')
    const datasetTag = searchParams.get('datasetTag')
    if (datasetTag == 'base') {
        return 'base'
    }
    if (datasetParams.length == 1) {
        return datasetParams[0]
    }

    return 'all'
}


export function useDocIndex(): number {
    const searchParams = useSearchParams()
    return parseInt(searchParams.get('docIndex') || '0')
}

export function useGroup() {
    const searchParams = useSearchParams()
    const groupCode = searchParams.get('group')
    const initCode = searchParams.get('init')
    const initValue = initCode ? base64UrlToString(initCode) : null
    const groupValue = groupCode ? base64UrlToString(groupCode) : null
    const activeGroupValue = groupValue || initValue
    const activeGroupCode = groupCode || initCode

    return { initCode, initValue, activeGroupValue, activeGroupCode }
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
    const searchParams = useSearchParams()
    const rawPoint = searchParams.get('point')
    if (!rawPoint) {
        return null
    }
    return validatePoint(rawPoint)
}

export function useActivePoint(): [number, number] | null {
    const searchParams = useSearchParams()
    const rawPoint = searchParams.get('activePoint') || searchParams.get('point')
    if (!rawPoint) {
        return null
    }
    return validatePoint(rawPoint)
}


export function useMode() {
    const searchParams = useSearchParams()
    const datasetTag = searchParams.get('datasetTag')
    const perspective = usePerspective()

    if (datasetTag == 'base') {
        return 'list'
    }


    return searchParams?.get('mode') || contentSettings[perspective]?.display || 'map'
}


export function useOverlayParams() {
    const searchParams = useSearchParams()
    const options = searchParams.get('options') == 'on'
    const mapSettings = searchParams.get('mapSettings') == 'on'
    const overlaySelector = searchParams.get('overlaySelector') == 'on'
    const facet = searchParams.get('facet')
    const { isMobile } = useContext(GlobalContext)
    const mode = useMode()
    const maxResults = searchParams.get('maxResults')

    const tableOptions = mode == 'table' && !options

    // On mobile, when map settings are open, give them priority and hide the left panel
    const showLeftPanel = (options || facet || tableOptions) && (!isMobile || !mapSettings)

    const showResults = mode != 'table' && (maxResults || (isMobile && !showLeftPanel))
    // On mobile, always show the right panel if map settings are active, even if the left panel would otherwise be visible
    const showRightPanel = mode != 'table' && (isMobile ? (mapSettings || !showLeftPanel) : true)

    return { showLeftPanel, showRightPanel, options, mapSettings, overlaySelector, facet, showResults, tableOptions }

}