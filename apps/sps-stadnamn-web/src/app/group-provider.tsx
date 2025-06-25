'use client'
import { createContext } from 'react'
import { useState, useEffect } from 'react';
import { useSearchQuery } from '@/lib/search-params';
import { useSearchParams } from 'next/navigation';

interface GroupContextData {
    groupData: any[] | null;
    groupLoading: boolean;
    groupError: Record<string, string> | null;
    groupTotal: { value: number, relation: string } | null;
}

export const GroupContext = createContext<GroupContextData>({
    groupData: null,
    groupLoading: true,
    groupError: null,
    groupTotal: null
});

export default function DocProvider({ children }: {  children: React.ReactNode }) {
    const searchParams = useSearchParams()
    const group = searchParams.get('group')
    const [groupLoading, setGroupLoading] = useState<boolean>(true)
    const [groupError, setGroupError] = useState<Record<string, string> | null>(null)
    const [groupData, setGroupData] = useState<any[] | null>(null)
    const [groupTotal, setGroupTotal] = useState<{ value: number; relation: string } | null>(null)

    const {searchQueryString } = useSearchQuery()


    useEffect(() => {
        if (group) {
            setGroupLoading(true)
            const url = `/api/search?${searchQueryString}&size=1000&group=${group}`
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
    }, [group, searchQueryString])
            
    

  return <GroupContext.Provider value={{
        groupData,
        groupLoading,
        groupError,
        groupTotal,
  }}>{children}</GroupContext.Provider>
}




