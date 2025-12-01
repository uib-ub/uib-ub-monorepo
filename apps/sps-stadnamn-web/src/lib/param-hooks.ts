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
    const facet = searchParams.get('facet')
    const { isMobile } = useContext(GlobalContext)
    const mode = useMode()
    const resultsParam = parseInt(searchParams.get('results') || '0') || 0
    const results = resultsParam > 0

    const tableOptions = mode == 'table' && !options



    const showLeftPanel = options || facet || tableOptions || !isMobile

    const showResults = mode != 'table' && (results || (isMobile && !showLeftPanel))
    const showRightPanel = mode != 'table' && (isMobile ? !showLeftPanel : true)

    return { showLeftPanel, showRightPanel, options, mapSettings, facet, showResults, tableOptions }

}