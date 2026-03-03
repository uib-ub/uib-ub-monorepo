'use client'

import { useQuery } from '@tanstack/react-query'
import { useSearchParams } from 'next/navigation'
import useGroupData from './group-data'

export default function useInitData() {
    const searchParams = useSearchParams()
    const init = searchParams.get('init')
    const ungrouped = searchParams.get('ungrouped') === 'on'

    const { groupData: initGroupData, groupLoading: initGroupLoading } = useGroupData(ungrouped ? null : init)

    const { data: initDocData, isLoading: initDocLoading } = useQuery({
        queryKey: ['initDoc', init],
        queryFn: async () => {
            if (!init) return null
            const res = await fetch(`/api/doc?uuid=${init}`)
            if (!res.ok) {
                throw new Error('Failed to fetch init doc')
            }
            const data = await res.json()
            return data?.hits?.hits?.[0] || null
        },
        enabled: !!init && ungrouped,
        staleTime: 1000 * 60 * 5,
    })

    const initData = ungrouped ? initDocData : initGroupData
    const initLoading = ungrouped ? initDocLoading : initGroupLoading
    const initSearchLabel = ungrouped
        ? initDocData?._source?.label?.trim()
        : initGroupData?.fields?.label?.[0]?.trim()
    const groupedInitId = ungrouped ? initDocData?._source?.group?.id : initGroupData?.group?.id
    const ungroupedInitUuid = ungrouped ? init : initGroupData?.fields?.['uuid']?.[0]

    return {
        init,
        ungrouped,
        initData,
        initLoading,
        initSearchLabel,
        initGroupData,
        initDocData,
        groupedInitId,
        ungroupedInitUuid,
    }
}

