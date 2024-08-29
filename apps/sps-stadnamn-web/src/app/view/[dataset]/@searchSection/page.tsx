'use client'

import { useParams, useRouter, useSearchParams, usePathname } from 'next/navigation'
import IconButton from '@/components/ui/icon-button';

import { PiInfoFill, PiMagnifyingGlass, PiTreeView } from 'react-icons/pi'


import { datasetTitles } from '@/config/metadata-config'
import { useQueryStringWithout } from '@/lib/search-params';
import SearchToggle from './SearchToggle'
import { contentSettings } from '@/config/server-config';
import CadastralView from './_cadastral-view/cadastral-view';
import SearchView from '../page';


export default function SearchSection () {
    const params = useParams<{dataset: string, uuid: string, manifestId: string}>()
    const router = useRouter()
    
    const filteredParams = useQueryStringWithout(['docs', 'popup', 'expanded', 'search'])
    let [mainIndex, subindex] = params.dataset.split("_")
    const searchParams = useSearchParams()

    const showSearch = searchParams.get('search') == 'show'


    
    return (
       <section className={`card flex flex-col xl:col-span-1 gap-3 bg-white py-2 xl:pt-4 !px-0 stable-scrollbar xl:overflow-y-auto w-full relative`} aria-label="Søkepanel">

        <div className='px-4 flex flex-wrap gap-y-2'>
          <h1 className='text-xl font-sans font-semibold flex gap-1'>
            <SearchToggle>
              {datasetTitles[mainIndex] + (subindex ? ' | ' + datasetTitles[params.dataset].charAt(0).toUpperCase() + datasetTitles[params.dataset].slice(1) : '')}
            </SearchToggle>
              <IconButton className='align-middle' 
                          onClick={() => router.push(`/view/${params.dataset}/info${filteredParams ? '?' + filteredParams : ''}`)}
                          label="Info"><PiInfoFill className="text-2xl text-primary-600"/></IconButton>
          </h1>
          { searchParams.get('display') == 'cadastre' ?
          <button type="button" className="btn btn-outline btn-compact !pl-2 ml-auto" onClick={() => router.push(`/view/${params.dataset}?display=${(contentSettings[params.dataset]?.display || 'map')}`)}>
          <i>
            <PiMagnifyingGlass className="text-xl mr-2" aria-hidden="true"/>
          </i>
          Søkevisning
          </button>
          
          :
          <button type="button" className="btn btn-outline btn-compact !pl-2 ml-auto" onClick={() => router.push(`/view/${params.dataset}?display=cadastre`)}>
          <i>
            <PiTreeView className="text-xl mr-2" aria-hidden="true"/>
          </i>
          Hierarkisk visning
          </button>
            
          }

            
        </div>
        
        
        <div id="collapsibleSearch" className={`${showSearch ?  'absolute xl:static z-[2002] xl:z-auto xl:flex top-[100%] bg-white shadow-md xl:shadow-none pb-8' : 'hidden xl:flex'} flex flex-col h-fit gap-4 w-full`} >
        {  searchParams.get('display') == 'cadastre' ? 
            <CadastralView dataset={params.dataset}/>

          : <SearchView />
            
          }

        </div>        
        </section>

        
    )
}