'use client'
import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query'


const docDataQuery = async (docUuid: string, docParams?: {docData: Record<string, any>, docDataset: string}) => {

    if (docParams) {
        return {
            docData: docParams.docData,
            docAdm: docParams.docData.adm2 + '__' + docParams.docData.adm1,
            docDataset: docParams.docDataset,
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

export default function useDocData(docParams?: {docData: Record<string, any>, docDataset: string}) {
    const searchParams = useSearchParams()
    const docUuid = docParams?.docData?._source?.uuid || searchParams.get('doc')

    const { data, error: docError, isLoading: docLoading } = useQuery({
        queryKey: ['doc', docUuid],
        queryFn: async () => docUuid ? docDataQuery(docUuid, docParams) : null
    })

    const { docData, docAdm, docDataset, docGroup } = data || {}
    return { docData, docAdm, docDataset, docGroup, docError, docLoading }

}




