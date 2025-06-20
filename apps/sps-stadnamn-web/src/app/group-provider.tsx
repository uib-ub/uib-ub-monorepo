'use client'
import { createContext, MutableRefObject, useRef } from 'react'
import { useState, useEffect } from 'react';
import { useDataset } from '@/lib/search-params';
import { useSearchParams } from 'next/navigation';
import { base64UrlToString } from '@/lib/utils';

interface GroupContextData {
    groupData: any[] | null;
    groupLoading: boolean;
    groupError: Record<string, string> | null;
    groupTotal: { value: number, relation: string } | null;
    groupFuzzyResult: any[] | null;
    groupFuzzyLoading: boolean;
    groupFuzzyError: Record<string, string> | null;
}

export const GroupContext = createContext<GroupContextData>({
    groupData: null,
    groupLoading: true,
    groupError: null,
    groupTotal: null,
    groupFuzzyResult: null,
    groupFuzzyLoading: true,
    groupFuzzyError: null,
});

export default function DocProvider({ children }: {  children: React.ReactNode }) {
    const searchParams = useSearchParams()
    const group = searchParams.get('group')
    const [groupLoading, setGroupLoading] = useState<boolean>(true)
    const [groupError, setGroupError] = useState<Record<string, string> | null>(null)
    const [groupData, setGroupData] = useState<any[] | null>(null)
    const [groupTotal, setGroupTotal] = useState<{ value: number; relation: string } | null>(null)
    const details = searchParams.get('details') || 'doc'

    const [groupFuzzyResult, setGroupFuzzyResult] = useState<any[] | null>(null)
    const [groupFuzzyLoading, setGroupFuzzyLoading] = useState<boolean>(true)
    const [groupFuzzyError, setGroupFuzzyError] = useState<Record<string, string> | null>(null)

    const [groupType, groupId, groupLabel] = base64UrlToString(group || '').split('_') || []

    console.log(groupType, groupId, groupLabel)



    useEffect(() => {
        if (group && groupType == 'snid') {
            setGroupLoading(true)
            const url = `/api/group?groupType=snid.keyword&groupId=${groupId}&groupLabel=${groupLabel}&fuzzy=0`
            console.log("URL", url)
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
            console.log("NO GROUP")
            setGroupData(null)
            setGroupLoading(false)
        }
    }, [group])

    useEffect(() => {
        if (false && details == "group") {
            setGroupFuzzyLoading(true)
            const url = `/api/group?groupType=gnidu&groupId=${groupId}&groupLabel=${groupLabel}&fuzzy=1&size=20`
            fetch(url).then(res => res.json()).then(data => {
                if (data.hits?.hits?.length) {
                    setGroupFuzzyResult(data.hits.hits)
                }
            }).catch(err => {
                setGroupFuzzyError(err)
            }).finally(() => {
                setGroupFuzzyLoading(false)
            })
        }
        else {
            setGroupFuzzyResult(null)
            setGroupFuzzyLoading(false)
            setGroupFuzzyError(null)
        }
    }, [group])
            
    

  return <GroupContext.Provider value={{
        groupData,
        groupLoading,
        groupError,
        groupTotal,
        groupFuzzyResult,
        groupFuzzyLoading,
        groupFuzzyError,
  }}>{children}</GroupContext.Provider>
}




