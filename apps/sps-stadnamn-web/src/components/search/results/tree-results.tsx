'use client'
import { useContext, useEffect } from "react"
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { useDataset } from "@/lib/search-params";
import TreeItem from "./tree-item";
import { treeSettings } from "@/config/server-config";
import Clickable from "@/components/ui/clickable/clickable";
import { PiHouseFill } from "react-icons/pi";
import { DocContext } from "@/app/doc-provider";
import { GlobalContext } from "@/app/global-provider";

export default function TreeResults() {
  const [cadastralData, setCadastralData] = useState<any>(null)
  const [fetchError, setFetchError] = useState<any>(null)

  const dataset = useDataset()
  const { docAdm, docLoading, parentLoading } = useContext(DocContext)
  const { preferredTabs } = useContext(GlobalContext)

  const searchParams = useSearchParams()
  

  // Overriding adm in the tree view should not show up as a filter, and should only temporarily affect the map view - treeAdm should be replaced when switching doc or parentDoc
  // How to handle it in in the map: 
  // Alternatively: useState depending on selected doc or parentDoc. FIlters removed when navigating in the tree view.
  
  const adm = searchParams.get('adm')
  const [treeAdm, setTreeAdm] = useState<string | null>(adm)
  const [groupBy, setGroupBy] = useState<string | null>('adm1')
  const [isLoading, setIsLoading] = useState<boolean>(false)

  useEffect(() => {
    setTreeAdm(adm)
    const [adm1, adm2] = adm?.split('__').reverse() || [null, null]
    setTreeAdm(adm)
    setGroupBy(adm2 ? null : adm1 ? 'adm2' : 'adm1')
  }, [adm])

  useEffect(() => {
    if (docAdm) {
      const [adm1, adm2] = docAdm?.split('__').reverse() || [null, null]
      setTreeAdm(docAdm)
      setGroupBy(adm2 ? null : adm1 ? 'adm2' : 'adm1')
    }
  }, [docAdm])


  useEffect(() => {
    if (docLoading || parentLoading) return
    if (groupBy == 'adm1' && treeAdm) return // Workaround for invalid state

    const url = new URLSearchParams({dataset})
    if (groupBy) url.set('groupBy', groupBy)
    if (treeAdm) url.set('adm', treeAdm)
    setIsLoading(true)
    fetch(`/api/tree?${url.toString()}`).then(res => res.json()).then(data => {
      setCadastralData(data)
      setIsLoading(false)
    }).catch(err => {
      setFetchError(err)
      setIsLoading(false)
    })

    
  }, [groupBy, treeAdm, dataset, docLoading, parentLoading, docAdm])



  return <>
  { treeAdm &&
  <div className="pt-2 pb-4 mx-2 !text-base flex">
  <Clickable link id="tree-title" aria-label="Innholdsfortegnelse" 
                    className="breadcrumb-link self-center  text-base" 
                    only={{dataset, adm: null, nav: 'tree', mode: searchParams.get('mode')}}>
      <PiHouseFill aria-hidden="true" className="text-base"/>
      </Clickable>
      &nbsp;/&nbsp;
      {groupBy == 'adm2' ? <>{treeAdm}</>
      : <Clickable link className="breadcrumb-link !text-base" only={{dataset, adm: treeAdm.split("__")[1], nav: 'tree', mode: searchParams.get('mode')}}>
              {treeAdm.split("__")[1]}
          </Clickable>}
          {!groupBy && <>
          &nbsp;/&nbsp;
          
              {treeAdm.split("__")[0]}
          
          </>}

  </div>

  } 
  { groupBy == 'adm1' && <h2 className="text-lg m-2 font-serif">Fylker</h2> }
  { groupBy == 'adm2' && <h2 className="text-lg m-2 font-serif">Kommuner</h2> }
  { !groupBy && <h2 className="text-lg mx-2 font-serif">Garder</h2> }

  <ul className="flex flex-col">

  {groupBy ? cadastralData?.aggregations?.[groupBy]?.buckets
  .sort((a: any, b: any)=> treeSettings[dataset]?.aggSort ? a.aggNum.buckets[0].key.localeCompare(b.aggNum.buckets[0].key) : a.aggNum.localeCompare(b.key))
  .map((item: Record<string, any>) => {
    return <li key={item.key}>
      <Clickable link 
                 className="no-underline px-4 p-2 inline-block" 
                 only={{dataset, 
                        adm: groupBy == 'adm2' ? item.key + "__" + treeAdm : item.key, 
                        nav: 'tree', 
                        mode: searchParams.get('mode') == 'doc' ? preferredTabs[dataset] : searchParams.get('mode')}}>  
      {treeSettings[dataset].showNumber && (treeAdm ? item.aggNum.buckets[0]?.key : item.aggNum.buckets[0]?.key.slice(0,2))} {item.key}
        <span className="bg-neutral-100 rounded-full px-2 ml-2">{item.doc_count}</span></Clickable></li>
  })


  : cadastralData?.hits?.hits?.map((item: Record<string, any>) => {
    return <TreeItem key={item._id} hit={item}/>
  })}

  </ul>


  </>
}