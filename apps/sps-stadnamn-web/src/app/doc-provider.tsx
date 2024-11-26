'use client'
import { createContext } from 'react'
import { useState, useEffect } from 'react';
import { useDataset, useSearchQuery } from '@/lib/search-params';
import { useQueryState } from 'nuqs';

interface DocContextData {
    docData: any;
    docList: any[] | null;
    docLoading: boolean;
    docDataset: string | null;
    docError: Record<string, string> | null;
    
  }
 
  export const DocContext = createContext<DocContextData>({
    docData: null,
    docList: null,
    docDataset: null,
    docLoading: true,
    docError: null,
    });

 
export default function DocProvider({ children }: {  children: React.ReactNode }) {
    const point = useQueryState('point')[0]
    const dataset = useDataset()
    const { searchQueryString } = useSearchQuery()
    const [ docList, setDocList ] = useState<any[] | null>(null)
    const [docData, setDocData] = useState<any | null>(null)
    const doc = useQueryState('doc')[0]

    const [docLoading, setDocLoading] = useState(true)
    const [docDataset, setDocDataset] = useState<string | null>(null)



    useEffect(() => {
        if (doc) {
            setDocLoading(true)
            fetch(`/api/doc?uuid=${doc}${dataset != 'search' && dataset ? '&dataset=' + dataset : ''}`).then(res => res.json()).then(data => {
                if (data.hits?.hits?.length) {
                    setDocData(data.hits.hits[0])
                    setDocDataset(data.hits.hits[0]._index.split('-')[2])
                    setDocLoading(false)
                }
            })
        }
        else {
            setDocData(null)
            setDocLoading(false)
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
        docError: null,

  }}>{children}</DocContext.Provider>
}




