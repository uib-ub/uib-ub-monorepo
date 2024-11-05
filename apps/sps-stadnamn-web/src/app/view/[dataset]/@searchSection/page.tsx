
import { PiInfoFill } from 'react-icons/pi'
import { datasetTitles } from '@/config/metadata-config'
import SearchToggle from './SearchToggle'
import IconLink from '@/components/ui/icon-link';
import React from 'react';
import { repeatingSearchParams } from '@/lib/utils';
import TreeViewToggle from './_tree-view/tree-view-toggle';
import { treeSettings } from '@/config/server-config';
import ClientDisplay from './client-display';


export default async function SearchSection ( { params, searchParams }: { params: Promise<{ dataset: string, uuid: string, manifestId: string }>, searchParams: Promise<Record<string, string | string[]> & { adm1?: string, adm2?: string, adm3: string }> }) {
  const { dataset, uuid, manifestId } = await params

    let [mainIndex, subindex] = dataset.split("_")

    return (
       <section className="card flex flex-col xl:col-span-1 gap-3 bg-white py-2 xl:pt-4 !px-0 xl:overflow-y-auto w-full max-h-full relative" aria-label="Søkepanel">

        <div className='px-4 flex flex-wrap gap-y-2'>
          <h1 className='text-xl font-sans font-semibold flex gap-1'>
            <SearchToggle>
              {datasetTitles[mainIndex] + (subindex ? ' | ' + datasetTitles[dataset].charAt(0).toUpperCase() + datasetTitles[dataset].slice(1) : '')}
            </SearchToggle>
            <IconLink className='align-middle' 
                          href={`/view/${dataset}/info?${repeatingSearchParams(await searchParams).toString()}`}
                          label="Info"><PiInfoFill className="text-2xl text-primary-600"/></IconLink>
            
          </h1>

          { treeSettings[dataset] && <TreeViewToggle/> }
            
        </div>
        
        <ClientDisplay/>
       
        </section>

    )
}