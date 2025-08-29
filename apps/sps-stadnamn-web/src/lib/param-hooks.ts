import { useSearchParams } from "next/navigation"
import { base64UrlToString } from "./param-utils"
import { contentSettings } from "@/config/server-config"


export function usePerspective() {
    const searchParams = useSearchParams()
    const datasetParams = searchParams.getAll('indexDataset')
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
    const groupValue = groupCode ? base64UrlToString(groupCode) : null
    return {groupCode, groupValue}
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