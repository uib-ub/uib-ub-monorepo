'use client'
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { PiCaretLeftBold, PiMagnifyingGlass, PiMapPinFill, PiSliders, PiWall, PiX } from 'react-icons/pi';
import { useSearchQuery } from '@/lib/search-params';
import Form from 'next/form'
import { GlobalContext } from '@/state/providers/global-provider';
import IconButton from '@/components/ui/icon-button';
import { usePerspective } from '@/lib/param-hooks';
import { useMode } from '@/lib/param-hooks';
import { useQuery } from '@tanstack/react-query';
import Menu from '@/app/menu';
import { useSessionStore } from '@/state/zustand/session-store';
import ClickableIcon from '@/components/ui/clickable/clickable-icon';
import { formatNumber } from '@/lib/utils';
import { useContext, useEffect, useRef, useState } from 'react';

export async function autocompleteQuery(searchFilterParamsString: string, inputState: string, isMobile: boolean) {
    if (!inputState) return null
    const newQuery = new URLSearchParams(searchFilterParamsString)
    newQuery.set('q', inputState)
    const autocompleteQuery = newQuery.toString()
    
    
    const res = await fetch(`/api/autocomplete?${autocompleteQuery}&size=${isMobile ? 5 : 20}`)
    if (!res.ok) {
        throw new Error(res.status.toString())
    }
    const data = await res.json()
    return data
}


export default function SearchForm() {
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const { isMobile, preferredTabs, inputValue } = useContext(GlobalContext)    //const autocompleteOpen = searchParams.get('nav') == 'results'
    const menuOpen = useSessionStore((s: any) => s.menuOpen)
    const autocompleteOpen = useSessionStore((s: any) => s.autocompleteOpen)
    const setAutocompleteOpen = useSessionStore((s: any) => s.setAutocompleteOpen)
    const setDrawerContent = useSessionStore((s: any) => s.setDrawerContent)
    const setSnappedPosition = useSessionStore((s: any) => s.setSnappedPosition)
    const setCurrentPosition = useSessionStore((s: any) => s.setCurrentPosition)
    const datasetTag = searchParams.get('datasetTag')
    const router = useRouter()
    const [selectedGroup, setSelectedGroup] = useState<string | null>(null)
    


    const input = useRef<HTMLInputElement | null>(null)
    const form = useRef<HTMLFormElement | null>(null)
    const perspective = usePerspective()

    const { facetFilters, datasetFilters, searchFilterParamsString } = useSearchQuery()
    const filterCount = facetFilters.length + datasetFilters.length


    const mode = useMode()
   

    const [inputState, setInputState] = useState<string>(inputValue.current || '') // Ensure updates within the component
    const [autocompleteFacetFilters, setAutocompleteFacetFilters] = useState<[string, string][]>(facetFilters)
    const [autocompleteDatasetFilters, setAutocompleteDatasetFilters] = useState<[string, string][]>(datasetFilters)

    const { data, isLoading } = useQuery({
        queryKey: ['autocomplete', inputState],
        placeholderData: (prevData: any) => prevData,
        queryFn: () => autocompleteQuery(searchFilterParamsString, inputState, isMobile)
    })


    const dropdownSelect = (event: React.MouseEvent<HTMLLIElement>, group: string, label: string) => {
        inputValue.current = label
        setSelectedGroup(group)
        setInputState(label)
        if (input.current) {
            input.current.value = label // ensure the form control has the new value
        }
        if (form.current) {
            requestAnimationFrame(() => form.current?.requestSubmit())
        }
    }


    const clearQuery = () => {
        inputValue.current = '';
        setInputState('')
        if (input.current) {
            input.current.value = '';
            if (pathname == '/search') {
                input.current.focus();
            }

        }
        const newSearchParams = new URLSearchParams(searchParams)
        if (isMobile) {
            newSearchParams.delete('q')
            newSearchParams.delete('nav')
            router.push(`?${newSearchParams.toString()}`)
        }
        
    }

    useEffect(() => {
        if (input.current?.value && !isMobile) {
            input.current.select();
        }
    }, [isMobile]);

    // Handle back button on mobile - close autocomplete instead of navigating
    useEffect(() => {
        if (!isMobile) return

        const handlePopState = () => {
            if (autocompleteOpen) {
                // Close autocomplete and blur input
                setAutocompleteOpen(false)
                setAutocompleteFacetFilters(facetFilters)
                setAutocompleteDatasetFilters(datasetFilters)
                // Blur the input to remove focus
                if (input.current) {
                    input.current.blur()
                }
                // Push current URL back to prevent navigation
                window.history.pushState(null, '', window.location.href)
            }
        }

        window.addEventListener('popstate', handlePopState)
        return () => window.removeEventListener('popstate', handlePopState)
    }, [isMobile, autocompleteOpen, facetFilters, datasetFilters, setAutocompleteOpen])

    // Add history entry when autocomplete opens on mobile
    useEffect(() => {
        if (!isMobile || !autocompleteOpen) return

        // Add a history entry when autocomplete opens so we can intercept back button
        window.history.pushState({ autocomplete: true }, '', window.location.href)
    }, [isMobile, autocompleteOpen])


    if (pathname != "/search") {
        return <div className="flex gap-6">
            <Link href="/" scroll={false} className="text-xl px-4 ml-2 self-center no-underline">stadnamn.no</Link>

        </div>
    }




    return <div className="flex">
        <header className={`${isMobile && autocompleteOpen ? 'sr-only' : 'flex xl:absolute xl:top-2 xl:left-2 w-14 h-14 xl:h-12 xl:w-auto'} ${(autocompleteOpen || menuOpen) ? 'z-[6000] xl:!rounded-b-none' : 'z-[3000] shadow-lg'} bg-neutral-50 xl:rounded-l-md`}><Menu shadow/></header>
        <Form ref={form} action="/search" id="search-form" aria-label="Stadnamnsøk"
                className={`h-14 xl:h-12 ${isMobile && autocompleteOpen ? 'w-[100svw]' : 'w-[calc(100svw-3.5rem)] xl:w-[calc(25svw-4rem)] xl:absolute xl:top-2 xl:left-[3.5rem]'} ${(autocompleteOpen || menuOpen) ? 'z-[6000] xl:!rounded-b-none' : 'z-[3000]'}`}
            
            onBlur={(e) => { 
                return
                //if (e.relatedTarget && e.relatedTarget.getAttribute('data-autocomplete-option')) return;
                //setAutocompleteOpen(false)
            }}

            onSubmit={() => {
                if (!input.current) return;
                if (isMobile) {
                    input.current.blur();
                }
                else {
                    input.current.select();
                }
                setAutocompleteOpen(false)

            }}>

            <div className='flex w-full h-full pr-1 bg-white shadow-lg xl:shadow-l-none xl:rounded-l-none xl:rounded-md items-center relative group'>
                
                <label htmlFor="search-input" className="sr-only">Søk</label>
            { datasetTag != 'tree' && !(isMobile && autocompleteOpen) && <ClickableIcon onClick={() => {setDrawerContent('filters'); setSnappedPosition('max')}} add={{nav: 'filters'}} label={`Filter: ${filterCount}`} className={`flex items-center justify-center relative py-2 px-3`}>
            <PiSliders className="text-3xl xl:text-2xl" aria-hidden="true"/>
            {filterCount > 0 && <span className={`results-badge bg-primary-500 absolute top-1 left-1 rounded-full text-white text-xs ${filterCount < 10 ? 'px-1.5' : 'px-1'}`}>
                        {formatNumber(filterCount)}
                    </span>}
            </ClickableIcon>}
            {isMobile && autocompleteOpen && <ClickableIcon label="Tilbake" onClick={() => setAutocompleteOpen(false)} className={`flex items-center justify-center relative py-2 px-3`}><PiCaretLeftBold className="text-3xl xl:text-2xl" aria-hidden="true"/></ClickableIcon>}
                
                
                <input
                    id="search-input"
                    type="text"
                    role="combobox"
                    aria-controls="autocomplete-results"
                    aria-expanded={autocompleteOpen}
                    maxLength={20}
                    ref={input}
                    name="q"
                    defaultValue={searchParams.get('q') || inputValue.current || ''}
                    autoComplete="off"
                    autoFocus={!isMobile && pathname == '/search'}
                    onFocus={() => {setAutocompleteOpen(true)}}
                    onBlur={() => setAutocompleteOpen(false)}


                    onChange={(event) => { inputValue.current = event.target.value; setInputState(event.target.value); setAutocompleteOpen(true) }}
                    className={`bg-transparent pr-4 focus:outline-none flex w-full shrink text-lg xl:text-base`}
                />

                {searchParams.getAll('dataset')?.map((dataset, index) => <input type="hidden" key={index} name="dataset" value={dataset} />)}
                {searchParams.get('datasetTag') && <input type="hidden" name="datasetTag" value={searchParams.get('datasetTag') || ''} />}
                {false && `${JSON.stringify(autocompleteFacetFilters)}${JSON.stringify(autocompleteDatasetFilters)}`}

                {(inputState || searchFilterParamsString?.length > 0) &&
                    <IconButton onClick={() => { clearQuery() }}

                        // Replace results with filters if no facetFilters

                        label="Nullstill søket"><PiX className="text-3xl lg:text-2xl text-neutral-800 group-focus-within:text-neutral-800 m-1" /></IconButton>}
                <button className="mr-1 p-1" type="submit" aria-label="Søk"> <PiMagnifyingGlass className="text-3xl lg:text-2xl shrink-0 text-neutral-800" aria-hidden="true" /></button>
            </div>

            {searchParams.get('facet') && <input type="hidden" name="facet" value={searchParams.get('facet') || ''} />}
            <input type="hidden" name="nav" value={'results'} />
            {facetFilters.map(([key, value], index) => <input type="hidden" key={index} name={key} value={value} />)}
            {searchParams.get('fulltext') && <input type="hidden" name="fulltext" value={searchParams.get('fulltext') || ''} />}
            {mode && mode != 'doc' && <input type="hidden" name="mode" value={mode || ''} />}
            {mode == 'doc' && preferredTabs[perspective] && preferredTabs[perspective] != 'map' && <input type="hidden" name="mode" value={preferredTabs[perspective] || ''} />}
            {(false || autocompleteOpen) && <ul className="absolute top-[3.5rem] xl:top-[3rem] xl:-left-12 border-t border-neutral-200 w-full max-h-[calc(100svh-4rem)] min-h-24 bg-neutral-50 xl:shadow-lg overflow-y-auto overscroll-none xl:w-[calc(25svw-1rem)] left-0 xl-p-2 xl xl:rounded-lg xl:rounded-t-none divide-y divide-neutral-300">
                {data?.hits?.hits?.map((hit: any) => (
                    <li key={hit._id} 
                        tabIndex={-1} 
                        role="option" 
                        data-autocomplete-option 
                        onMouseDown={(event) => { dropdownSelect(event, hit.fields["group.id"][0], hit.fields.label[0])}}
                        aria-selected={selectedGroup == hit.fields["group.id"][0]}>
                        <div className="cursor-pointer flex items-center h-14 xl:h-12 px-2 hover:bg-neutral-100">
                        {hit.fields.location?.length ? (
                            <PiMapPinFill aria-hidden="true" className="flex-shrink-0 mt-1 mr-2 text-neutral-700" />
                        ) : null}
                        {hit._index.split('-')[2].endsWith('_g') && <PiWall aria-hidden="true" className="flex-shrink-0 mt-1 mr-2" />}
                        <div>
                            <strong>{hit.fields.label[0]}</strong>{' '}
                            <span className="text-neutral-900">
                            {hit.fields["group.adm2"]?.[0] ? hit.fields["group.adm2"]?.[0] + ', ' : ''}
                            {hit.fields["group.adm1"]?.[0]}
                            </span>
                        </div>
                        </div>
                    </li>
                ))}
            </ul>}
        </Form>

    </div>


}