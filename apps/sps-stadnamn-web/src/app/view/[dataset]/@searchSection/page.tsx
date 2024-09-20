
import { PiInfoFill } from 'react-icons/pi'
import { datasetTitles } from '@/config/metadata-config'
import SearchToggle from './SearchToggle'
import IconLink from '@/components/ui/icon-link';
import React from 'react';
import { repeatingSearchParams } from '@/lib/utils';
import TreeViewToggle from './_tree-view/tree-view-toggle';
import { treeSettings } from '@/config/server-config';
import ClientDisplay from './client-display';


export default function SearchSection ( { params, searchParams }: { params: { dataset: string, uuid: string, manifestId: string }, searchParams: Record<string, string | string[]> & { adm1?: string, adm2?: string, adm3: string } }) {

    let [mainIndex, subindex] = params.dataset.split("_")
    

    

    return (
       <section className="card flex flex-col xl:col-span-1 gap-3 bg-white py-2 xl:pt-4 !px-0 xl:overflow-y-auto w-full h-full relative" aria-label="Søkepanel">

        <div className='px-4 flex flex-wrap gap-y-2'>
          <h1 className='text-xl font-sans font-semibold flex gap-1'>
            <SearchToggle>
              {datasetTitles[mainIndex] + (subindex ? ' | ' + datasetTitles[params.dataset].charAt(0).toUpperCase() + datasetTitles[params.dataset].slice(1) : '')}
            </SearchToggle>
            <IconLink className='align-middle' 
                          href={`/view/${params.dataset}/info?${repeatingSearchParams(searchParams).toString()}`}
                          label="Info"><PiInfoFill className="text-2xl text-primary-600"/></IconLink>
            
          </h1>

          { treeSettings[params.dataset as string] && <TreeViewToggle/> }
            
        </div>
        
        <ClientDisplay/>
       
        </section>

    )
}