

import Link from 'next/link';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import { datasetTitles } from '@/config/metadata-config';
import { fetchCadastralView } from '@/app/api/_utils/actions';
import { repeatingSearchParams } from '@/lib/utils';
import TreeViewResults from './tree-view-results';
import { PiCaretRightBold } from 'react-icons/pi';
import { contentSettings } from '@/config/server-config';



export default async function TreeView({ params, searchParams }: { params: { dataset:string, uuid?: string }, searchParams: Record<string, string | string[]> & { adm1?: string, adm2?: string, adm3: string } }) {

// Todo: adapt to datasets with adm3
const {adm1, adm2 } = searchParams

const groupBy = adm1 ? adm2 ? undefined : 'adm2' : 'adm1'
const parents = Object.entries(searchParams).reduce<Record<string, string>>((acc, [key, value]) => {
  if (["adm1", "adm2", "adm3"].includes(key) && key !== groupBy) {
    // Ensure value is treated as a string, taking the first element if it's an array
    const stringValue = Array.isArray(value) ? value[0] : value;
    acc[key] = stringValue;
  }
  return acc;
}, {});

const parentsNames = Object.values(parents).reverse().slice(1)
const parentsUrls = parentsNames.map((_, i) => `/view/${params.dataset}?display=tree&${Object.entries(parents).slice(0, i + 1).map(([key, value]) => `${key}=${value}`).join('&')}`)


const cadastralData = await fetchCadastralView(params.dataset, groupBy, parents)

const buildAdmUrl = (adm: string) => {
  const newParams = repeatingSearchParams(searchParams)
  if (!groupBy) return "" // To please typescript. The server action won't return aggregations if groupBy is undefined
  newParams.set(groupBy, adm)
  return `/view/${params.dataset}?${newParams.toString()}`
}

    return <section className="flex flex-col gap-4 scroll-container">
     
        {adm1 && 
          <div className="px-4 py-2">
            <Breadcrumbs 
                        currentName={adm2 || adm1}
                        parentName={[datasetTitles[params.dataset as string], ...parentsNames]} 
                        parentUrl={[`/view/${params.dataset}?display=tree`, ...parentsUrls]} />
          </div>}


          {cadastralData?.aggregations?.adm?.buckets?.length &&
          <ul className="flex-col gap-2 overflow-y-auto stable-scrollbar">
          {cadastralData.aggregations.adm.buckets
                  .filter((item: any) => item.key != '_false')
                  .sort((a: any, b: any)=> a.knr.buckets[0].key.localeCompare(b.knr.buckets[0].key))
                  .map((adm: Record<string, any>) => {

            return <li key={adm.key} className="flex flex-col gap-2">
              <Link href={buildAdmUrl(adm.key)} className="lg:text-lg gap-2 px-4 mx-2 py-2 border-b border-neutral-300 no-underline">{contentSettings[params.dataset].tree?.knr?.toLowerCase().endsWith('knr') && (adm1 ? adm.knr.buckets[0].key : adm.knr.buckets[0].key.slice(0,2))} {adm.key}<PiCaretRightBold aria-hidden="true" className='text-primary-600 inline align-middle ml-1'/></Link>
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



