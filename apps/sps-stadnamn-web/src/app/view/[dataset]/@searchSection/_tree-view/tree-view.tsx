

import Link from 'next/link';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import { datasetTitles } from '@/config/metadata-config';
import { fetchCadastralView } from '@/app/api/_utils/actions';
import { repeatingSearchParams } from '@/lib/utils';
import CoordinateButton from '@/components/results/coordinateButton';
import InfoButton from '@/components/results/infoButton';
import { PiInfoFill } from 'react-icons/pi';
import IconLink from '@/components/ui/icon-link';



export default async function TreeView({ params, searchParams }: { params: { dataset:string, uuid?: string }, searchParams: Record<string, string | string[]> & { adm1?: string, adm2?: string, adm3: string } }) {

// Todo: adapt to datasets with adm3
const {adm1, adm2 } = searchParams

const groupBy = adm1 ? adm2 ? undefined : 'adm2' : 'adm1'
const parents = Object.entries(searchParams).reduce<Record<string, string>>((acc, [key, value]) => {
  if (["adm1", "adm2", "adm3"].includes(key) && key !== groupBy) {
    acc[key] = value;
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

    return <section className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        {adm1 && 
          <div className="px-4 py-2">
            <Breadcrumbs 
                        currentName={adm2 || adm1}
                        parentName={[datasetTitles[params.dataset as string], ...parentsNames]} 
                        parentUrl={[`/view/${params.dataset}?display=tree`, ...parentsUrls]} />
          </div>}

        <div className="flex flex-col gap-2">
          {cadastralData?.aggregations?.unique_values?.buckets?.length &&
          <ul className="pb-16">
          {cadastralData.aggregations.unique_values.buckets.filter((item: any) => item.key != '_false').map((adm: Record<string, any>) => {

            return <li key={adm.key} className="flex flex-col gap-2">
              <Link href={buildAdmUrl(adm.key)} className="lg:text-lg py-2 px-4">{adm.key}</Link>
            </li>
          })}
          </ul>
          }
        </div>
        {cadastralData?.hits?.hits.map((hit: any) => {
          return <div key={hit._id} className="flex gap-2 px-4 pb-3 pt-1 border-b border-neutral-300">
            <div className="lg:text-lg">{hit.fields.cadastre?.map((item: any) => item.gnr.join(", "))}&nbsp;{hit.fields.label}</div>
            <div className='flex gap-2 ml-auto'>


        {hit.fields?.location &&
          <CoordinateButton doc={hit} iconClass="text-3xl text-neutral-700"/>
        }

         <IconLink label="Infoside" 
                   href={`/view/${params.dataset}/doc/${hit.fields.uuid}?${repeatingSearchParams(searchParams).toString()}`}
                   aria-current={params.uuid && params.uuid == hit.fields.uuid  ? 'page': undefined} 
                   aria-describedby={"resultText_" + hit.fields.uuid}
                   className="inline-flex items-center justify-center text-primary-600 group">
                    <PiInfoFill className={"group-aria-[current=page]:text-accent-800 align-text-bottom text-3xl text-primary-600"}/></IconLink>
    
        
        
        </div>
            </div>
        })}



      </div>

    </section>
    
  
}



