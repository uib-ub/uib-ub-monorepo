'use client'
import { createContext } from 'react'
import { useState, useEffect } from 'react';
import { useSearchQuery } from '@/lib/search-params';
import { useSearchParams } from 'next/navigation';
import { base64UrlToString } from '@/lib/utils';
import * as h3 from 'h3-js';

interface GroupContextData {
    groupData: any[] | null;
    groupLoading: boolean;
    groupError: Record<string, string> | null;
    groupTotal: { value: number, relation: string } | null;
    fuzzyGroup: any[] | null;
    fuzzyGroupLoading: boolean;
    fuzzyGroupError: Record<string, string> | null;
    fuzzyGroupTotal: { value: number, relation: string } | null;
}

export const GroupContext = createContext<GroupContextData>({
    groupData: null,
    groupLoading: true,
    groupError: null,
    groupTotal: null,
    fuzzyGroup: null,
    fuzzyGroupLoading: false,
    fuzzyGroupError: null,
    fuzzyGroupTotal: null
});

export default function DocProvider({ children }: {  children: React.ReactNode }) {
    const searchParams = useSearchParams()
    const group = searchParams.get('group')
    const [groupLoading, setGroupLoading] = useState<boolean>(true)
    const [groupError, setGroupError] = useState<Record<string, string> | null>(null)
    const [groupData, setGroupData] = useState<any[] | null>(null)
    const [groupTotal, setGroupTotal] = useState<{ value: number; relation: string } | null>(null)

    const [fuzzyGroup, setFuzzyGroup] = useState<any[] | null>(null)
    const [fuzzyGroupTotal, setFuzzyGroupTotal] = useState<{ value: number; relation: string } | null>(null)
    const [fuzzyGroupError, setFuzzyGroupError] = useState<Record<string, string> | null>(null)
    const [fuzzyGroupLoading, setFuzzyGroupLoading] = useState<boolean>(false)

    const {searchQueryString } = useSearchQuery()

    const details = searchParams.get('details') || 'doc'

    const [groupType, groupId, groupLabel] = base64UrlToString(group || '').split('_') || []


    useEffect(() => {
        if (group) {
            setGroupLoading(true)
            let url = `/api/search/collapsed?${searchQueryString}&size=1000&group=${group}`

            fetch(url).then(res => res.json()).then(data => {
                if (data.hits?.hits?.length) {
                    setGroupData(data.hits.hits)
                    setGroupTotal(data.hits.total)
                }
            }).catch(err => {
                setGroupError(err)
            }).finally(() => {
                setGroupLoading(false)
            })
        }
        else {
            setGroupData(null)
            setGroupLoading(false)
            setGroupTotal(null)
        }
    }, [group, searchQueryString, details])


    useEffect(() => {
        if (group && details != 'doc') {
            setFuzzyGroupLoading(true)
            let url = `/api/search/group?${searchQueryString}&size=1000&collapse=label.keyword&${groupType}=${groupId}`

            // replace q and its value if it's in the url
            url = url.replace(/q=([^&]*)/, `q=${groupLabel}`)
            if (groupType == 'h3') {
                // Find neighbouring h3 cells 
                const neighbours = h3.gridDisk(groupId, 1)
                const additionalParams = neighbours.map(neighbor => `h3=${neighbor}`).join('&')
                url = url + '&' + additionalParams
            }
            fetch(url).then(res => res.json()).then(data => {
                setFuzzyGroup(data.hits.hits)
                setFuzzyGroupTotal(data.hits.total)

            }).catch(err => {
                setFuzzyGroupError(err)
            }).finally(() => {
                setFuzzyGroupLoading(false)
            })
        }
        else {  
            setFuzzyGroup(null)
            setFuzzyGroupLoading(false)
            setFuzzyGroupTotal(null)
            setFuzzyGroupError(null)
        }
    }, [group, searchQueryString, details, groupType, groupId, groupLabel])
            
    

  return <GroupContext.Provider value={{
        groupData,
        groupLoading,
        groupError,
        groupTotal,
        fuzzyGroup,
        fuzzyGroupLoading,
        fuzzyGroupError,
        fuzzyGroupTotal
  }}>{children}</GroupContext.Provider>
}




