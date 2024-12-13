'use client'
import { createContext } from 'react'
import { useState, useEffect } from 'react';
import { useDataset, useSearchQuery } from '@/lib/search-params';
import { useSearchParams } from 'next/navigation';

interface DocContextData {
    docData: any;
    docList: any[] | null;
    docLoading: boolean;
    docDataset: string | null;
    docError: Record<string, string> | null;
    parentData: any | null;
    parentLoading: boolean;
    parentError: Record<string, string> | null;
    docAdm: string | null;
    
  }
 
  export const DocContext = createContext<DocContextData>({
    docData: null,
    docList: null,
    docDataset: null,
    docLoading: true,
    docError: null,
    parentData: null,
    parentLoading: true,
    parentError: null,
    docAdm: null,
    });

 
export default function DocProvider({ children }: {  children: React.ReactNode }) {
    const searchParams = useSearchParams()
    const point = searchParams.get('point')
    const dataset = useDataset()
    const { searchQueryString } = useSearchQuery()
    const [ docList, setDocList ] = useState<any[] | null>(null)
    const [docData, setDocData] = useState<any | null>(null)
    
    
    const doc = searchParams.get('doc')
    const [docLoading, setDocLoading] = useState(true)
    const [docDataset, setDocDataset] = useState<string | null>(null)
    const [docError, setDocError] = useState<Record<string, string> | null>(null)

    const parent = searchParams.get('parent')
    const [parentData, setParentData] = useState<any | null>(null)
    const [parentLoading, setParentLoading] = useState<boolean>(true)
    const [parentError, setParentError] = useState<Record<string, string> | null>(null)
    const [docAdm, setDocAdm] = useState<string | null>(null)

    useEffect(() => {
        if (parent) {
            setParentLoading(true)
            fetch(`/api/doc?uuid=${parent}${dataset != 'search' && dataset ? '&dataset=' + dataset : ''}`).then(res => res.json()).then(data => {
                if (data.hits?.hits?.length) {
                    setParentData(data.hits.hits[0])
                    setDocAdm(data.hits.hits[0]._source.adm2 + '__' + data.hits.hits[0]._source.adm1)
                    setParentLoading(false)
                }
            }).catch(err => {
                setParentError(err)
                setParentLoading(false)
            })
        }
        else {
            setParentData(null)
            setParentLoading(false)
            setDocAdm(null)
        }
    }   
    , [parent, dataset, setParentData])



    useEffect(() => {
        if (doc) {
            setDocLoading(true)
            fetch(`/api/doc?uuid=${doc}${dataset != 'search' && dataset ? '&dataset=' + dataset : ''}`).then(res => res.json()).then(data => {
                if (data.hits?.hits?.length) {
                    setDocData(data.hits.hits[0])
                    setDocDataset(data.hits.hits[0]._index.split('-')[2])
                    setDocAdm(data.hits.hits[0]._source.adm2 + '__' + data.hits.hits[0]._source.adm1)
                    setDocLoading(false)
                }
            }).catch(err => {
                setDocError(err)
                setDocLoading(false)
            })
        }
        else {
            setDocData(null)
            setDocLoading(false)
            setDocAdm(null)
        }
    }   
    , [doc, dataset, setDocData])

    useEffect(() => {
        if (point) {
            fetch(`/api/location?point=${point}&dataset=${dataset || 'search'}&${searchQueryString}`).then(res => 
                res.json()).then(data => {
                    if (data.hits?.hits?.length) {
                        setDocList(data.hits?.hits)
                    }
            })
        }
        else {
            setDocList(null)
        }
    }, [point, dataset, searchQueryString])

    
    


  return <DocContext.Provider value={{
        docData,
        docList,
        docDataset,
        docLoading,
        docError,
        parentData,
        parentLoading,
        parentError,
        docAdm

  }}>{children}</DocContext.Provider>
}




