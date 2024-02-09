import { useState } from 'react';
import AdmFacet from './adm-facet';
import { PiCaretDown, PiCaretUp, PiX, PiTrashFill } from 'react-icons/pi';
import { useRouter, usePathname } from 'next/navigation';
import { useQueryWithout, useQueryStringWithout } from '@/lib/search-params';
import Spinner from '@/components/svg/Spinner'


export default function Facets() {
    const router = useRouter()
    const pathname = usePathname()
    const [filterStatus, setFilterStatus] = useState<Record<string, string>>({adm: 'collapsed'})
    const searchQuery = useQueryWithout(['document', 'view'])
    const activeFilters = searchQuery.filter(item => item[0] != 'q' && item[0] != 'page' && item[0] != 'size')
    const [chipsExpanded, setChipsExpanded] = useState(false);

    const filterNames = Array.from(new Set(activeFilters.map(item => item[0])))
    const clearedParams = useQueryStringWithout(filterNames)
    
    const toggleExpanded = (filterName: string) => {
      setFilterStatus({
          ...filterStatus,
          [filterName]: filterStatus[filterName] === 'expanded' ? 'collapsed' : 'expanded'
      });
  }

    const removeFilter = (name: string, value: string) => {      
      const updatedParams = new URLSearchParams(searchQuery.filter(item => item[0] != name || item[1] != value)).toString()
      router.push(pathname + "?" + updatedParams)
    }

    const clearFilters = () => {
      router.push(pathname + '?' + clearedParams);
    }


  return (
    <section className='flex flex-col w-full gap-3'>
    <span className="flex"><h2 className='text-xl font-semibold'>Filtre</h2>
    {activeFilters.length ? 
    <button type="button" aria-label="Fjern alle filtre" onClick={clearFilters} className="icon-button ml-auto">
      <PiTrashFill className="text-xl" aria-hidden="true"/>
    </button> 
    : null
    }
    </span>
    {activeFilters.map(([name, value], index) => (
      <input type="hidden" name={name} value={value} key={index}/>
      ))}
    <ul className='flex flex-wrap gap-2'>
      {(chipsExpanded ? activeFilters : activeFilters.slice(0, 10)).map(([name, value], index) => (
        <li key={index} className='flex items-center gap-2 border-neutral-600 bg-neutral-50 border p-1 px-2 rounded-sm'>
          <span>{name}: { value.split('_')[0] }</span>
          <button type="button" onClick={() => removeFilter(name, value)} aria-label="Fjern filter"><PiX className="text-lg"/></button>
        </li>
        ))}
        {activeFilters.length > 5 && (
          <li>
          <button type="button" onClick={() => setChipsExpanded(!chipsExpanded)} className="btn btn-outline ">
            {chipsExpanded ? 'Vis mindre' : 'Vis mer'}
          </button>
          </li>
        )}
      
    </ul>

    <h3 className='text-lg'>
      <button type="button" onClick={() => toggleExpanded('adm')}  className='flex w-full items-center justify-between'>Område 
      {filterStatus.adm === 'loading' ? <Spinner className='w-5 h-5'/> : (filterStatus.adm === 'expanded' ? <PiCaretUp/> : <PiCaretDown/>)}
      </button>
    </h3>
    { filterStatus.adm !== 'collapsed' && <AdmFacet setFilterStatus={(status: any) => setFilterStatus({...filterStatus, adm: status})}/>}

    </section>
  )

}