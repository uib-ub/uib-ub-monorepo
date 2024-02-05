import { useState } from 'react';
import AdmFacet from './adm-facet';
import { PiCaretDown, PiCaretUp, PiX } from 'react-icons/pi';
import { useRouter, usePathname } from 'next/navigation';
import { queryWithout } from '@/lib/search-params';


export default function Facets() {
    const router = useRouter()
    const pathname = usePathname()
    const [expanded, setExpanded] = useState<Record<string,boolean>>({adm: false})

    const searchQuery = queryWithout(['document'])

    const activeFilters = searchQuery.filter(item => item[0] != 'q' && item[0] != 'page' && item[0] != 'perPage')
    const toggleExpanded = (filterName: string) => {
      setExpanded({...expanded, [filterName]: !expanded[filterName]});
    }

    const removeFilter = (name: string, value: string) => {      
      const updatedParams = new URLSearchParams(searchQuery.filter(item => item[0] != name || item[1] != value)).toString()
      router.push(pathname + "?" + updatedParams)
    }

  return (
    <div className='flex flex-col w-full gap-2'>
    <h2 className='text-xl font-semibold'>Filtre</h2>
    <ul className='flex flex-wrap gap-2'>
        {activeFilters.map((filter, index) => (
          <li key={index} className='flex items-center gap-2 border-neutral-600 bg-neutral-50 border p-1 px-2 rounded-sm'>
            <span>{filter[0]}: {filter[1]}</span>
            <input type="hidden" name={filter[0]} value={filter[1]} />
            <button type="button" onClick={() => removeFilter(filter[0], filter[1])} aria-label="Fjern filter"><PiX className="text-lg"/></button>
          </li>
        ))}
      </ul>
    <h3 className='text-lg'>
      <button type="button" onClick={() => toggleExpanded('adm')}  className='flex w-full items-center justify-between'>Område { expanded.adm ? <PiCaretUp/> : <PiCaretDown/>}</button>
    </h3>
    { expanded.adm && <AdmFacet/>}

    </div>
  )

}