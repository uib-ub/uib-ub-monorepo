import { useEffect, useState } from 'react';
import { useRouter, useSearchParams, useParams } from 'next/navigation';
import Spinner from '@/components/svg/Spinner';
import ErrorMessage from '@/components/ErrorMessage';
import Link from 'next/link';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import { datasetTitles } from '@/config/metadata-config';




export default function CadastralView({ dataset }: { dataset: string }) {
  const params = useParams()
  const searchParams = useSearchParams()
  const [admAggregations, setAdmAggregations] = useState<Record<string, any>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const admParam = searchParams.get('adm') || ''
  const admItems = admParam.length ? admParam.split('__').reverse() : []
  
  const parents = admItems?.slice(0, admItems.length - 1) || []
  const parentUrls = parents?.map((_, i) => `/view/${params.dataset}?display=cadastre&sosi=gard&adm=${admItems?.slice(0, i + 1).join('__')}`) || []
  

  useEffect(() => {
     
      fetch(`/api/facet?dataset=${params.dataset}&facets=adm${(admItems?.length || 0) + 1}${admItems?.length ? '&adm=' + admParam : ''}`).then(response => response.json()).then(es_data => {

      setAdmAggregations(es_data.aggregations?.[`adm${(admItems?.length || 0) + 1}`])
      setIsLoading(false);
    }).catch((error) => {
      setError(error)
    })

    }, [params.dataset, admParam, admItems?.length]
    )

    return <section className="flex flex-col gap-4">
    {!isLoading &&
      <div className="flex flex-col gap-2">
        {admParam && admItems && admItems.length > 0 && 
          <div className="px-4 py-2">
            <Breadcrumbs 
                        currentName={admItems?.[admItems.length - 1]}
                        parentName={[datasetTitles[params.dataset as string], ...parents]} 
                        parentUrl={[`/view/${params.dataset}?display=cadastre&sosi=gard`, ...parentUrls]} />
          </div>}

        <div className="flex flex-col gap-2">
          {admAggregations?.buckets.length > 1 &&
          <ul>
          {admAggregations?.buckets.filter((item: any) => item.key != '_false').map((adm: Record<string, any>) => {

            return <li key={adm.key} className="flex flex-col gap-2">
              <Link href={`/view/${dataset}?display=cadastre&sosi=gard&adm=${[adm.key, ...admItems].join('__')}`} className="lg:text-lg py-2 px-4 border-b border-neutral-300">{adm.key}</Link>
            </li>
          })}
          </ul>
          }
          {admAggregations?.buckets.length == 1 &&
          <div className="flex flex-col gap-2">
            <div className="text-lg font-semibold">Ingen underinndeling</div>
          
          </div>
          }
        </div>
      </div>
    }

    </section>
  
}



