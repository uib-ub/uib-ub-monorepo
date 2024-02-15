import { useState } from 'react';
import AdmFacet from './adm-facet';
import { PiCaretDownFill, PiCaretUpFill, PiX, PiTrashFill } from 'react-icons/pi';
import { useRouter, usePathname } from 'next/navigation';
import { useQueryWithout, useQueryStringWithout } from '@/lib/search-params';
import Spinner from '@/components/svg/Spinner'
import IconButton from '@/components/ui/icon-button';


export default function Facets() {
    const router = useRouter()
    const pathname = usePathname()
    const [filterStatus, setFilterStatus] = useState<Record<string, string>>({adm: 'collapsed'})
    const searchQuery = useQueryWithout(['document', 'view', 'manifest'])
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
      router.push(pathname + "?" + updatedParams)
    }

    const clearFilters = () => {
      router.push(pathname + '?' + clearedParams);
    }


  return (
    <section className='flex flex-col w-full gap-3'>
    <span className="flex px-4"><h2 className='text-2xl small-caps font-semibold'>Filtre</h2>
    {activeFilters.length ? 
    <IconButton type="button" label="Fjern alle filtre" onClick={clearFilters} className="icon-button ml-auto">
      <PiTrashFill className="text-xl text-neutral-800" aria-hidden="true"/>
    </IconButton> 
    : null
    }
    </span>
    {activeFilters.map(([name, value], index) => (
      <input type="hidden" name={name} value={value} key={index}/>
      ))}
    <ul className='flex flex-wrap gap-2 px-4'>
      {(chipsExpanded ? activeFilters : activeFilters.slice(0, 10)).map(([name, value], index) => (
        <li key={index} className='flex items-center gap-2 border-neutral-600 bg-neutral-50 border p-1 pr-2 pl-3 rounded-full'>
          <span>{name}: { value.split('_')[0] }</span>
          <IconButton type="button" onClick={() => removeFilter(name, value)} label="Fjern filter"><PiX className="text-lg"/></IconButton>
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

    <h3 className='text-lg px-4 py-2 border-y border-y-neutral-300'>
      <button type="button" onClick={() => toggleExpanded('adm')}  className='flex w-full items-center justify-between'>Område 
      {filterStatus.adm === 'loading' ? <Spinner className='w-5 h-5'/> : (filterStatus.adm === 'expanded' ? <PiCaretUpFill className='text-neutral-950'/> : <PiCaretDownFill className='text-neutral-950'/>)}
      </button>
    </h3>
    { filterStatus.adm !== 'collapsed' && <AdmFacet setFilterStatus={(status: any) => setFilterStatus({...filterStatus, adm: status})}/>}

    </section>
  )

}