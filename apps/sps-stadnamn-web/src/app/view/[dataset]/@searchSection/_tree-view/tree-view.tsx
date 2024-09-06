'use client'  
import Link from 'next/link';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import { datasetTitles } from '@/config/metadata-config';
import TreeViewResults from './tree-view-results';
import { PiCaretRightBold } from 'react-icons/pi';
import { contentSettings } from '@/config/server-config';
import { useParams, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';



export default function TreeView() {
  const searchParams = useSearchParams()
  const params = useParams()
  const [cadastralData, setCadastralData] = useState<any>(null)

// Todo: adapt to datasets with adm3
const adm1 = searchParams.get('adm1')
const adm2 = searchParams.get('adm2')

const groupBy = adm2 ? undefined : adm1 ? 'adm2' : 'adm1'


useEffect(() => {

    fetch(`/api/tree?dataset=${params.dataset}${adm1 ? `&adm1=${adm1}` : ''}${adm2 ? `&adm2=${adm2}` : ''}`)
        .then(response => response.json())
        .then(data => setCadastralData(data))

}, [params.dataset, adm1, adm2, groupBy])

const buildAdmUrl = (adm: string) => {
  const newParams = new URLSearchParams(searchParams)
  if (!groupBy) return "" // To please typescript. The server action won't return aggregations if groupBy is undefined
  newParams.set(groupBy, adm)
  return `/view/${params.dataset}?${newParams.toString()}`
}

    return <section className="flex flex-col gap-4 scroll-container">
     
        {adm1 && 
          <div className="px-4 py-2">
            <Breadcrumbs 
                        currentName={adm2 || adm1}
                        parentName={[datasetTitles[params.dataset as string], ...adm2 ? [adm1] : []]} 
                        parentUrl={[`/view/${params.dataset}?display=tree`, ...adm2 ? [`/view/${params.dataset}?display=tree&adm1=${adm1}`] : []]}
                        />
          </div>}


          {cadastralData?.aggregations?.adm?.buckets?.length &&
          <ul className="flex-col gap-2 overflow-y-auto stable-scrollbar">
          {cadastralData.aggregations.adm.buckets
                  .filter((item: any) => item.key != '_false')
                  .sort((a: any, b: any)=> a.knr.buckets[0].key.localeCompare(b.knr.buckets[0].key))
                  .map((adm: Record<string, any>) => {

            return <li key={adm.key} className="flex flex-col gap-2">
              <Link href={buildAdmUrl(adm.key)} className="lg:text-lg gap-2 px-4 mx-2 py-2 border-b border-neutral-300 no-underline">{contentSettings[params.dataset as string].tree?.knr?.toLowerCase().endsWith('knr') && (adm1 ? adm.knr.buckets[0].key : adm.knr.buckets[0].key.slice(0,2))} {adm.key}<PiCaretRightBold aria-hidden="true" className='text-primary-600 inline align-middle ml-1'/></Link>
            </li>
          })}
          </ul>
          }

        {cadastralData?.hits?.hits?.length ?
        <TreeViewResults hits={cadastralData.hits.hits}/>
        : null
        }




    </section>
    
  
}



