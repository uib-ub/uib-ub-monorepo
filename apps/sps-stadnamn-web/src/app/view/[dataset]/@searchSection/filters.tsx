import { useState } from 'react';
import ClientFacet from './client-facet';
import ServerFacet from './server-facet';
import { PiCaretDownFill, PiCaretUpFill, PiX, PiTrashFill } from 'react-icons/pi';
import { useRouter, usePathname } from 'next/navigation';
import { useQueryWithout, useQueryStringWithout } from '@/lib/search-params';
import Spinner from '@/components/svg/Spinner'
import IconButton from '@/components/ui/icon-button';


export default function Facets() {
    const router = useRouter()
    const pathname = usePathname()
    const [filterStatus, setFilterStatus] = useState<Record<string, string>>({adm: 'collapsed'})
    const searchQuery = useQueryWithout(['docs', 'view', 'manifest'])
    const activeFilters = searchQuery.filter(item => item[0] != 'q' && item[0] != 'page' && item[0] != 'sort' && item[0] != 'size')
    const [chipsExpanded, setChipsExpanded] = useState(false);

    const filterNames = Array.from(new Set(activeFilters.map(item => item[0])))
    const clearedParams = useQueryStringWithout([...filterNames, 'page', 'sort'])
    
    const toggleExpanded = (filterName: string) => {
      setFilterStatus({
          ...filterStatus,
          [filterName]: filterStatus[filterName] === 'expanded' ? 'collapsed' : 'expanded'
      });
  }

    const removeFilter = (name: string, value: string) => {      
      const updatedParams = new URLSearchParams(searchQuery.filter(item => item[0] != name || item[1] != value)).toString()
      router.push(pathname + "?" + updatedParams, { scroll: false})
    }

    const clearFilters = () => {
      router.push(pathname + '?' + clearedParams, { scroll: false});
    }


  return (
    <section className='flex flex-col w-full'>
    
    <span className="flex px-2 align-bottom"><h2 className='h-full lg:text-xl align-bottom font-semibold small-caps'>Filtre</h2>
    {activeFilters.length ?
    <IconButton type="button" label="Fjern alle filtre" onClick={clearFilters} className="icon-button ml-auto py-0">
      <PiTrashFill className="text-lg lg:text-xl text-neutral-800" aria-hidden="true"/>
    </IconButton> 
    : null
    }
    </span>
    {activeFilters.length ? 
    <div className='py-2 border-b border-neutral-300'>
    {activeFilters.map(([name, value], index) => (
      <input type="hidden" name={name} value={value} key={index}/>
      ))}
    <ul className='flex flex-wrap gap-2 px-2 pb-2'>
      {(chipsExpanded ? activeFilters : activeFilters.slice(0, activeFilters.length > 8 ? 4 : 8)).map(([name, value], index) => (
        <li key={index} className='flex items-center gap-2 border-neutral-600 bg-neutral-50 border p-1 pr-2 pl-3 rounded-full'>
          <span>{ value.split('_')[0] }</span>
          <IconButton type="button" onClick={() => removeFilter(name, value)} label="Fjern filter"><PiX className="text-lg"/></IconButton>
        </li>
        ))}
        {activeFilters.length > 8 && (
          <li>
          <button type="button" onClick={() => setChipsExpanded(!chipsExpanded)} className="btn btn-outline rounded-full ">
            {chipsExpanded ? 'Vis mindre' : 'Vis mer'}
          </button>
          </li>
        )}
      
    </ul>
    </div>
    : null}

    <h3 className='lg:text-lg p-2 border-b border-neutral-300'>
      <button type="button" onClick={() => toggleExpanded('adm')}  className='flex w-full items-center gap-1'>
      {filterStatus.adm === 'loading' ? <Spinner className='w-[1em] h-[1em}'/> : (filterStatus.adm === 'expanded' ? <PiCaretUpFill className='text-neutral-950'/> : <PiCaretDownFill className='text-neutral-950'/>)}
      Område 
      
      </button>
    </h3>
    { filterStatus.adm !== 'collapsed' && <ClientFacet facetName="adm" setFilterStatus={(status: any) => setFilterStatus({...filterStatus, adm: status})}/>}


    <h3 className='lg:text-lg p-2 border-b border-neutral-300'>
      <button type="button" onClick={() => toggleExpanded('facetSearch')}  className='flex w-full items-center gap-1'>
      {filterStatus.facetSearch === 'loading' ? <Spinner className='w-[1em] h-[1em}'/> : (filterStatus.facetSearch === 'expanded' ? <PiCaretUpFill className='text-neutral-950'/> : <PiCaretDownFill className='text-neutral-950'/>)}
      Andre filtre
      
      </button>
    </h3>
    { filterStatus.facetSearch !== 'collapsed' && <ServerFacet setFilterStatus={(status: any) => setFilterStatus({...filterStatus, facetSearch: status})}/>}

    </section>
  )

}