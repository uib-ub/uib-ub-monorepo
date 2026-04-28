'use client'
import { useDocParam } from '@/lib/param-hooks';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';


const docDataQuery = async (docUuid: string, docParams?: { docData: Record<string, any>, docDataset?: string }) => {
    if (docParams?.docData) {
        return {
            docData: docParams.docData,
            docAdm: docParams.docData._source.adm2 + '__' + docParams.docData._source.adm1,
            docDataset: docParams.docDataset || docParams.docData._index.split('-')[2],
            docGroup: docParams.docData._source.group?.id
        }
    }


    const res = await fetch(`/api/doc?uuid=${docUuid}`)
    if (!res.ok) {
        throw new Error('Failed to fetch doc')
    }
    const data = await res.json()

    if (data.hits?.hits?.length) {
        return {
            docData: data.hits.hits[0],
            docAdm: data.hits.hits[0]._source.adm2 + '__' + data.hits.hits[0]._source.adm1,
            docDataset: data.hits.hits[0]._index.split('-')[2],
            docGroup: data.hits.hits[0]._source.group?.id
        }
    }

    throw new Error('Doc not found')
}

export default function useDocData(docParams?: { docData: Record<string, any>, docDataset?: string }) {
    const searchParams = useSearchParams()
    const doc = useDocParam()

    const { data, error: docError, isLoading: docLoading, isRefetching: docRefetching, isFetchedAfterMount: docFetchedAfterMount } = useQuery({
        queryKey: ['doc', doc],
        placeholderData: (prevData) => prevData,
        queryFn: async () => doc ? docDataQuery(doc, docParams) : null
    })

    const { docData, docAdm, docDataset, docGroup } = data || {}
    return { docData, docAdm, docDataset, docGroup, docError, docLoading, docRefetching, docFetchedAfterMount }

}




