
import { PiInfoFill, PiMagnifyingGlass, PiTreeView } from 'react-icons/pi'
import { datasetTitles } from '@/config/metadata-config'
import SearchToggle from './SearchToggle'
import { contentSettings } from '@/config/server-config';
import SearchView from './_search-view/search-view';
import IconLink from '@/components/ui/icon-link';
import Link from 'next/link';
import React from 'react';
import TreeView from './_tree-view/tree-view';
import { repeatingSearchParams } from '@/lib/utils';


export default function SearchSection ( { params, searchParams, child }: { params: { dataset: string, uuid: string, manifestId: string }, searchParams: Record<string, string | string[]>, child?: React.ReactNode }) {

    //useQueryStringWithout(['docs', 'popup', 'expanded', 'search'])
    let [mainIndex, subindex] = params.dataset.split("_")
    const showSearch = searchParams.search == 'show'

    const backToSearchLink = () => {
      const newParams = repeatingSearchParams(searchParams)
      newParams.delete('display')
      if (contentSettings[params.dataset].display == 'table') {
        newParams.set('display', 'table')
      }


      const adm = ['adm3', 'adm2', 'adm1'].filter(adm => newParams.has(adm))
      if (newParams.has('adm')) {
        adm.forEach(a => newParams.delete(a))
      }
      else if (adm.length) {
        const admValues = adm.map(a => newParams.get(a))
        newParams.set('adm', admValues.join('__'))

        adm.forEach(a => newParams.delete(a))
      }

      return `/view/${params.dataset}${newParams.toString() ? '?'+newParams.toString() : ''}`
    }

    const treeViewLink = () => {
      
      const newParams = repeatingSearchParams(searchParams)

      if (newParams.getAll('adm').length == 1) {
        const adm = newParams.getAll('adm')[0].split('__').reverse()
        adm.forEach((a, i) => {
          newParams.set(`adm${i+1}`, a)
          }
        )
      }

      newParams.set('display', 'tree')
      return  `/view/${params.dataset}${newParams.toString() ? '?'+newParams.toString() : ''}`
    }

    return (
       <section className={`card flex flex-col xl:col-span-1 gap-3 bg-white py-2 xl:pt-4 !px-0 stable-scrollbar xl:overflow-y-auto w-full relative`} aria-label="Søkepanel">

        <div className='px-4 flex flex-wrap gap-y-2'>
          <h1 className='text-xl font-sans font-semibold flex gap-1'>
            <SearchToggle>
              {datasetTitles[mainIndex] + (subindex ? ' | ' + datasetTitles[params.dataset].charAt(0).toUpperCase() + datasetTitles[params.dataset].slice(1) : '')}
            </SearchToggle>
            <IconLink className='align-middle' 
                          href={`/view/${params.dataset}/info?${repeatingSearchParams(searchParams).toString()}`}
                          label="Info"><PiInfoFill className="text-2xl text-primary-600"/></IconLink>
            
          </h1>
          { searchParams.display == 'tree' ?
          <Link className="btn btn-outline no-underline btn-compact !pl-2 ml-auto" href={backToSearchLink()}>
          <i>
            <PiMagnifyingGlass className="text-xl mr-2" aria-hidden="true"/>
          </i>
          {Object.keys(searchParams).filter(key => !["display", "search", "docs", "adm1", "adm2", "adm3"].includes(key)).length > 0 ? "Tilbake til søk" : "Søkevisning"}
          </Link>
          
          :
          <Link type="button" className="btn btn-outline no-underline btn-compact !pl-2 ml-auto" href={treeViewLink()}>
          <i>
            <PiTreeView className="text-xl mr-2" aria-hidden="true"/>
          </i>
          Register
          </Link>
            
          }

            
        </div>
        
        
        <div id="collapsibleSearch" className={`${showSearch ?  'absolute xl:static z-[2002] xl:z-auto xl:flex top-[100%] bg-white shadow-md xl:shadow-none pb-8' : 'hidden xl:flex'} flex flex-col h-fit gap-4 w-full`} >
        {  searchParams.display == 'tree' ? 
            <TreeView params={params} searchParams={searchParams} />

          : <SearchView/>
            
          }

        </div>        
        </section>

        
    )
}