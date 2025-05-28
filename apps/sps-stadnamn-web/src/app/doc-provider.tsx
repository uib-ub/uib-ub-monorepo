'use client'
import { createContext, MutableRefObject, useRef } from 'react'
import { useState, useEffect } from 'react';
import { useDataset } from '@/lib/search-params';
import { useSearchParams } from 'next/navigation';

interface DocContextData {
    docData: any;
    sameMarkerList: any[] | null;
    setSameMarkerList: (sameMarkerList: any[] | null) => void;
    docLoading: boolean;
    docDataset: string | null;
    docError: Record<string, string> | null;
    parentData: any | null;
    parentLoading: boolean;
    parentError: Record<string, string> | null;
    docAdm: string | null;
    snidParent: string | null;
    docView: MutableRefObject<Record<string, string> | null> | null;
}

export const DocContext = createContext<DocContextData>({
    docData: null,
    sameMarkerList: null,
    setSameMarkerList: () => {},
    docDataset: null,
    docLoading: true,
    docError: null,
    parentData: null,
    parentLoading: true,
    parentError: null,
    docAdm: null,
    snidParent: null,
    docView: null,
});

export default function DocProvider({ children }: {  children: React.ReactNode }) {
    const searchParams = useSearchParams()
    const dataset = useDataset()
    const [ sameMarkerList, setSameMarkerList ] = useState<any[] | null>(null)
    const [docData, setDocData] = useState<any | null>(null)
    const docView = useRef<Record<string, string> | null>(null)
    
    
    const doc = searchParams.get('doc')
    const [docLoading, setDocLoading] = useState(true)
    const [docDataset, setDocDataset] = useState<string | null>(null)
    const [docError, setDocError] = useState<Record<string, string> | null>(null)

    const parent = searchParams.get('parent')
    const parentData = useRef<any | null>(null)
    const [parentLoading, setParentLoading] = useState<boolean>(true)
    const [parentError, setParentError] = useState<Record<string, string> | null>(null)
    const [docAdm, setDocAdm] = useState<string | null>(null)
    const [snidParent, setSnidParent] = useState<string | null>(null)

    const childDocDataset = searchParams.get('docDataset')

    useEffect(() => {
        if (parent) {
            setParentLoading(true)
            fetch(`/api/doc?uuid=${parent}${(dataset != 'search' && dataset) ? '&dataset=' + dataset : ''}`).then(res => res.json()).then(data => {
                if (data.hits?.hits?.length) {
                    parentData.current = data.hits.hits[0]
                    setDocAdm(data.hits.hits[0]._source.adm2 + '__' + data.hits.hits[0]._source.adm1)
                }
            }).catch(err => {
                setParentError(err)
            }).finally(() => {
                setParentLoading(false)
            })
        }
        else {
            parentData.current = null
            setParentLoading(false)
            setDocAdm(null)
        }
    }   
    , [parent, dataset])

    // fetch snid uuid if the doc itself is not a snid
    useEffect(() => { 

        if (!doc || doc != docData?._source?.uuid || docDataset == 'search') {
            setSnidParent(null)
            
        }
        else {
            
            fetch(`/api/snid?uuid=${doc}`).then(res => res.json()).then(data => {
                if (data?.hits?.hits?.length && data.hits.hits[0].fields.children.length > 1) {
                    setSnidParent(data.hits.hits[0].fields.uuid[0])
                }
                else {
                    setSnidParent(null)
                }
        })
    }
    }, [doc, docDataset, docData?._source?.uuid])



    useEffect(() => {
        if (doc) {
            setDocLoading(true)
            fetch(`/api/doc?uuid=${doc}&dataset=${childDocDataset || dataset}`).then(res => res.json()).then(data => {
                if (data.hits?.hits?.length) {
                    setDocData(data.hits.hits[0])
                    setDocDataset(data.hits.hits[0]._index.split('-')[2])
                    setDocAdm(data.hits.hits[0]._source.adm2 + '__' + data.hits.hits[0]._source.adm1)
                }
            }).catch(err => {
                setDocError(err)

            }).finally(() => {
                setDocLoading(false)
            })
        }
        else {
            setDocData(null)
            setDocLoading(false)
            setDocAdm(null)
        }
    }   
    , [doc, dataset, childDocDataset, setDocData])

    
    /*

    useEffect(() => {
        if (!parent && !sameMarkerList && docData?._source?.location?.coordinates) {
            const coordinates = [...docData._source.location.coordinates]
            const point = coordinates.reverse().join(',')
            fetch(`/api/location?point=${point}&doc=${doc}&${searchQueryString}`).then(res => 
                res.json()).then(data => {
                    if (data.hits?.hits?.length && data.hits?.hits.some((hit: any) => hit.fields.uuid[0] != doc)) {
                        setSameMarkerList(data.hits?.hits)
                    }
                    else {
                        setSameMarkerList([])
                    }
            })
        }
    }, [dataset, searchQueryString, docData, parent, doc, sameMarkerList])
    */


    
    
    


  return <DocContext.Provider value={{
        docData,
        sameMarkerList,
        setSameMarkerList,
        docDataset,
        docLoading,
        docError,
        parentData: parentData.current,
        parentLoading,
        parentError,
        docAdm,
        snidParent,
        docView,
  }}>{children}</DocContext.Provider>
}




