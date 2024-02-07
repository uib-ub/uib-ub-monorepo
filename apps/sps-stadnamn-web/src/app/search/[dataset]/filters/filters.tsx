import { useState } from 'react';
import AdmFacet from './adm-facet';
import { PiCaretDown, PiCaretUp, PiX } from 'react-icons/pi';
import { useRouter, usePathname } from 'next/navigation';
import { useQueryWithout } from '@/lib/search-params';
import Spinner from '@/components/svg/Spinner'


export default function Facets() {
    const router = useRouter()
    const pathname = usePathname()
    const [filterStatus, setFilterStatus] = useState<Record<string, string>>({adm: 'collapsed'})
    const searchQuery = useQueryWithout(['document', 'view'])
    const activeFilters = searchQuery.filter(item => item[0] != 'q' && item[0] != 'page' && item[0] != 'size')
    
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


  return (
    <section className='flex flex-col w-full gap-3'>
    <h2 className='text-xl font-semibold'>Filtre</h2>
    <ul className='flex flex-wrap gap-2'>
        {activeFilters.map(([name, value], index) => (
          <li key={index} className='flex items-center gap-2 border-neutral-600 bg-neutral-50 border p-1 px-2 rounded-sm'>
            <span>{name}: { value.split('_')[0] }</span>
            <input type="hidden" name={name} value={value} />
            <button type="button" onClick={() => removeFilter(name, value)} aria-label="Fjern filter"><PiX className="text-lg"/></button>
          </li>
        ))}
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