import { useState } from 'react';
import ClientFacet from './client-facet';
import ServerFacet from './server-facet';
import { PiCaretDown, PiCaretUp, PiX, PiTrashFill } from 'react-icons/pi';
import { useRouter, useParams } from 'next/navigation';
import { useQueryWithout, useQueryStringWithout } from '@/lib/search-params';
import Spinner from '@/components/svg/Spinner'
import IconButton from '@/components/ui/icon-button';
import { facetConfig, miscSettings } from '@/config/search-config';
import { datasetTitles } from '@/config/metadata-config';


export default function Facets() {
    const router = useRouter()
    const params = useParams<{dataset: string}>()
    const searchQuery = useQueryWithout(['docs', 'popup', 'search', 'manifest', 'field', 'expanded'])
    const activeFilters = searchQuery.filter(item => item[0] != 'q' && item[0] != 'page' && item[0] != 'display' && item[0] != 'asc' && item[0] != 'desc' && item[0] != 'size' && item[0] != 'search')
    const [chipsExpanded, setChipsExpanded] = useState(false);
    const filterNames = Array.from(new Set(activeFilters.map(item => item[0])))
    const clearedParams = useQueryStringWithout([...filterNames, 'page', 'asc', 'desc'])
    const [expandedFacet, setExpandedFacet] = useState<string | null>(null)
    const [loadingFacet, setLoadingFacet] = useState<string | null>(null)

    
    const fieldNames: Record<string, string> = facetConfig[params.dataset]?.reduce((acc: Record<string, string>, item: any) => {
      if (item.omitLabel) return acc;
      acc[item.key] = item.label;
      return acc;
    }, {});

    const getFieldLabel = (name: string, value: string) => {
      // Add any special cases here
      if (name == "datasets") {
        return datasetTitles[value] || value
      }
      return value.split('__')[0]
    }


    const removeFilter = (name: string, value: string) => {      
      const updatedParams = new URLSearchParams(searchQuery.filter(item => item[0] != name || item[1] != value)).toString()
      router.push(`/view/${params.dataset}${updatedParams ? '?' + updatedParams : '' }`, { scroll: false})
    }

    const clearFilters = () => {
      router.push(`/view/${params.dataset}${clearedParams ? '?' + clearedParams : ''}`, { scroll: false})
    }

    const toggleFacet = (facet: string) => {
      if (expandedFacet != facet) {
        setLoadingFacet(facet)

      }
      setExpandedFacet(currentFacet => currentFacet == facet? null : facet)
    }


  return (
    <section className='flex flex-col w-full'>
    
    <span className="flex px-4 align-bottom"><h2 className='h-full text-xl align-bottom font-semibold small-caps'>Filtre</h2>
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
    <ul className='flex flex-wrap gap-2 px-4 pb-2'>
      {(chipsExpanded ? activeFilters : activeFilters.slice(0, activeFilters.length > 8 ? 4 : 8)).map(([name, value], index) => (
        <li key={index} className='flex items-center gap-2 border-neutral-600 bg-neutral-50 border pr-2 py-1 pl-3 rounded-full text-sm'>
          { fieldNames?.[name] ? fieldNames[name] + ": " : null} { getFieldLabel(name, value) }
          <IconButton type="button" onClick={() => removeFilter(name, value)} label="Fjern filter"><PiX className="text-base"/></IconButton>
        </li>
        ))}
        {activeFilters.length > 8 && (
          <li>
          <button type="button" onClick={() => setChipsExpanded(!chipsExpanded)} className="btn btn-outline rounded-full p-1 px-3">
            {chipsExpanded ? 'Vis mindre' : 'Vis mer'}
          </button>
          </li>
        )}
      
    </ul>
    </div>
    : null}

    { !miscSettings[params.dataset]?.noAdm && <>
      <h3 className='lg:text-lg py-2 px-4 border-b border-neutral-300'>
      <button type="button" onClick={() => toggleFacet('adm')}  className='flex w-full items-center gap-1'>
      { expandedFacet == 'adm' ? <PiCaretUp className='text-neutral-950'/> : <PiCaretDown className='text-neutral-950'/>}
      Distrikt
      { loadingFacet == 'adm' ? <Spinner status="Laster inn geografisk inndeling" className='w-[1em] h-[1em}'/> : null}
       
      </button>
    </h3>
    { expandedFacet == 'adm' ? <ClientFacet facetName='adm' showLoading={(facet: string | null) => setLoadingFacet(facet)}/> : null}
    </>
    }

    { facetConfig[params.dataset] && 
        <>
        <h3 className='lg:text-lg py-2 px-4 border-b border-neutral-300'>
          <button type="button" onClick={() => toggleFacet('server')} className='flex w-full items-center gap-1'>
          { expandedFacet == 'server' ? <PiCaretUp className='text-neutral-950'/> : <PiCaretDown className='text-neutral-950'/>}
          Andre filtre
          { loadingFacet == 'server' ? <Spinner status="Laster inn fasetter" className='w-[1em] h-[1em}'/> : null}
          
          </button>
        </h3>
        { expandedFacet == 'server' && <ServerFacet showLoading={(facet: string | null) => setLoadingFacet(facet)}/>}
        </>
      }

    </section>
  )

}