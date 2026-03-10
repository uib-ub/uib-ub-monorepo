'use client'

import { useQuery } from '@tanstack/react-query'
import { useSearchParams } from 'next/navigation'
import useGroupData from './group-data'

export default function useInitData() {
    const searchParams = useSearchParams()
    const init = searchParams.get('init')
    const sourceView = searchParams.get('sourceView') === 'on'

    const { groupData: initGroupData, groupLoading: initGroupLoading } = useGroupData(sourceView ? null : init)

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
        enabled: !!init && sourceView,
        staleTime: 1000 * 60 * 5,
    })

    const initData = sourceView ? initDocData : initGroupData
    const initLoading = sourceView ? initDocLoading : initGroupLoading
    const initSearchLabel = sourceView
        ? initDocData?._source?.label?.trim()
        : initGroupData?.fields?.label?.[0]?.trim()
    const groupedInitId = sourceView ? initDocData?._source?.group?.id : initGroupData?.group?.id
    const sourceViewInitUuid = sourceView ? init : initGroupData?.fields?.['uuid']?.[0]

    return {
        init,
        sourceView,
        initData,
        initLoading,
        initSearchLabel,
        initGroupData,
        initDocData,
        groupedInitId,
        sourceViewInitUuid,
    }
}

