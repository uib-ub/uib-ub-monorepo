'use client'  
import { datasetTitles } from '@/config/metadata-config';
import TreeViewResults from './tree-view-results';
import { PiCaretRightBold } from 'react-icons/pi';
import { contentSettings } from '@/config/server-config';
import { useParams, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import SearchParamsLink from '@/components/ui/search-params-link';



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



    return <section className={`${searchParams.get('search') == 'show' ?  'absolute xl:static z-[2002] xl:z-auto xl:flex top-[100%] bg-white shadow-md xl:shadow-none' : 'hidden xl:flex'} flex flex-col gap-4 scroll-container w-full`} >
     
        {adm1 && 
          <div className="px-4 py-2 text-lg">
            <SearchParamsLink className="breadcrumb-link" withoutParams={["adm1", "adm2"]}>
            {datasetTitles[params.dataset as string]}
            </SearchParamsLink>
            <span className='mx-2'>/</span>
            {adm2 ?
              <>
              <SearchParamsLink className="breadcrumb-link" withoutParams={["adm2"]}>
              {adm1}
              </SearchParamsLink>
              <span className='mx-2'>/</span>
              {adm2}
              </>
            : adm1
            }
          </div>
        }

          {cadastralData?.aggregations?.adm?.buckets?.length &&
          <ul className="flex-col gap-2 overflow-y-auto stable-scrollbar">
          {cadastralData.aggregations.adm.buckets
                  .filter((item: any) => item.key != '_false')
                  .sort((a: any, b: any)=> a.knr.buckets[0].key.localeCompare(b.knr.buckets[0].key))
                  .map((adm: Record<string, any>) => {

            return <li key={adm.key} className="flex flex-col gap-2">
              <SearchParamsLink addParams={{[adm1 ? 'adm2' : 'adm1']: adm.key}}
                    className="lg:text-lg gap-2 px-4 mx-2 py-2 border-b border-neutral-300 no-underline">
                      {contentSettings[params.dataset as string].tree?.knr?.toLowerCase().endsWith('knr') && (adm1 ? adm.knr.buckets[0].key : adm.knr.buckets[0].key.slice(0,2))} {adm.key}
                      <PiCaretRightBold aria-hidden="true" className='text-primary-600 inline align-middle ml-1'/>
              </SearchParamsLink>
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


