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
import { stringToBase64Url } from '@/lib/param-utils';
import { MAP_DRAWER_BOTTOM_HEIGHT_REM, panPointIntoView } from '@/lib/map-utils';

export async function autocompleteQuery(searchFilterParamsString: string, inputState: string, isMobile: boolean) {
    if (!inputState) return null
    const newQuery = new URLSearchParams(searchFilterParamsString)
    newQuery.set('q', inputState)
    const autocompleteQuery = newQuery.toString()
    
    
    const res = await fetch(`/api/autocomplete?${autocompleteQuery}&size=20`)
    if (!res.ok) {
        throw new Error(res.status.toString())
    }
    const data = await res.json()
    return data
}


export default function SearchForm() {
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const { isMobile, preferredTabs, inputValue, mapFunctionRef } = useContext(GlobalContext)    //const autocompleteOpen = searchParams.get('nav') == 'results'
    const menuOpen = useSessionStore((s: any) => s.menuOpen)
    const autocompleteOpen = useSessionStore((s: any) => s.autocompleteOpen)
    const setAutocompleteOpen = useSessionStore((s: any) => s.setAutocompleteOpen)
    const setSnappedPosition = useSessionStore((s: any) => s.setSnappedPosition)
    const setDrawerOpen = useSessionStore((s) => s.setDrawerOpen)
    const snappedPosition = useSessionStore((s: any) => s.snappedPosition)
    const currentPosition = useSessionStore((s: any) => s.currentPosition)
    const datasetTag = searchParams.get('datasetTag')
    const router = useRouter()
    const [selectedGroup, setSelectedGroup] = useState<string | null>(null)
    const options = searchParams.get('options')


    const input = useRef<HTMLInputElement | null>(null)
    const form = useRef<HTMLFormElement | null>(null)
    const perspective = usePerspective()

    const { facetFilters, datasetFilters, searchFilterParamsString } = useSearchQuery()
    const filterCount = facetFilters.length + datasetFilters.length


    const mode = useMode()
   

    const [inputState, setInputState] = useState<string>(inputValue.current || '') // Ensure updates within the component
    const [point, setPoint] = useState<string>()
    const [autocompleteFacetFilters, setAutocompleteFacetFilters] = useState<[string, string][]>(facetFilters)
    const [autocompleteDatasetFilters, setAutocompleteDatasetFilters] = useState<[string, string][]>(datasetFilters)
    const [activeIndex, setActiveIndex] = useState<number>(-1)
    const listRef = useRef<HTMLUListElement | null>(null)

    const { data, isLoading } = useQuery({
        queryKey: ['autocomplete', inputState],
        placeholderData: (prevData: any) => prevData,
        queryFn: () => autocompleteQuery(searchFilterParamsString, inputState, isMobile)
    })


    const dropdownSelect = (event: React.MouseEvent<HTMLLIElement>, inputString: string, group?: string, coordinates?: [number, number]) => {
        inputValue.current = inputString
        if (group) {
            setSelectedGroup(group)
            setInputState(inputString)
            if (coordinates?.length == 2) {
                panPointIntoView(mapFunctionRef.current, [coordinates[1], coordinates[0]], isMobile, false)
            } 
        }

        if (input.current) {
            input.current.value = inputString // ensure the form control has the new value
        }
        if (form.current) {
            requestAnimationFrame(() => form.current?.requestSubmit())
        }
    }


    const clearQuery = () => {
        inputValue.current = '';
        setInputState('')
        setSelectedGroup(null) // Clear the selected group when clearing query
        if (input.current) {
            input.current.value = '';
            if (pathname == '/search') {
                input.current.focus();
            }

        }
        
    }

    // Keep the active option scrolled into view
    useEffect(() => {
        if (!autocompleteOpen || activeIndex < 0) return
        const el = document.getElementById(`autocomplete-option-${activeIndex}`)
        el?.scrollIntoView({ block: 'nearest' })
    }, [activeIndex, autocompleteOpen])

    // Reset active index when input changes or menu closes
    useEffect(() => {
        setActiveIndex(-1)
    }, [inputState, autocompleteOpen])

    const selectOption = (index: number) => {
        if (!data?.hits?.hits?.length) return
        if (index === 0) {
            const label = data.hits.hits[0].fields.label[0]
            inputValue.current = label
            setInputState(label)
            setSelectedGroup(null)
        } else {
            const hit = data.hits.hits[index - 1]
            const label = hit.fields.label[0]
            inputValue.current = label
            setInputState(label)
            const groupId = hit.fields["group.id"]?.[0]
            if (groupId) {
                setSelectedGroup(stringToBase64Url(groupId))
            }
            const coords = hit.fields.location?.[0]?.coordinates
            if (coords?.length === 2) {
                panPointIntoView(mapFunctionRef.current, [coords[1], coords[0]], isMobile, false)
            }
        }

        if (input.current) {
            input.current.value = inputValue.current
        }

        // Submit form after value is set
        if (form.current) {
            requestAnimationFrame(() => form.current?.requestSubmit())
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




    return <div
        className="flex"
        style={{
            position: (!isMobile || currentPosition <= MAP_DRAWER_BOTTOM_HEIGHT_REM)    ? undefined : 'absolute',
            top: (!isMobile || currentPosition <= MAP_DRAWER_BOTTOM_HEIGHT_REM) ? undefined : (snappedPosition === 'top' ? '0rem' : `calc(${-currentPosition + MAP_DRAWER_BOTTOM_HEIGHT_REM}rem * (1 - max(0, min(1, (${currentPosition}rem - 60svh) / (100svh - 60svh - 8rem)))))`),
            left: (!isMobile || currentPosition <= MAP_DRAWER_BOTTOM_HEIGHT_REM) ? undefined : `0`
        }}>
        <header className={`${isMobile && autocompleteOpen ? 'sr-only' : 'flex xl:absolute xl:top-2 xl:left-2 w-14 h-14 xl:h-12 xl:w-auto'} ${(autocompleteOpen || menuOpen) ? 'xl:!rounded-b-none' : 'shadow-lg'} bg-neutral-50 xl:rounded-l-md`}><Menu shadow/></header>
        <Form ref={form} action="/search" id="search-form" aria-label="Stadnamnsøk"
                className={`h-14 xl:h-12 ${isMobile && autocompleteOpen ? 'w-[100svw]' : 'w-[calc(100svw-3.5rem)] xl:w-[calc(25svw-4rem)] xl:absolute xl:top-2 xl:left-[3.5rem]'} ${(autocompleteOpen || menuOpen) ? 'z-[6000] xl:!rounded-b-none' : 'z-[4001]'}`}
            

            onSubmit={() => {
                if (!input.current) return;
                if (isMobile) {
                    input.current.blur();
                }
                else {
                    input.current.select();
                }
                setAutocompleteOpen(false)
                setDrawerOpen(true)

            }}>

            <div className='flex w-full h-full pr-1 bg-white shadow-lg xl:shadow-l-none xl:rounded-l-none xl:rounded-md items-center relative group'>
                
                <label htmlFor="search-input" className="sr-only">Søk</label>
            { false && datasetTag != 'tree' && !(isMobile && autocompleteOpen) && <ClickableIcon onClick={() => { setSnappedPosition('middle')}} add={{options: options ? null : 'on'}} label={`Filter: ${filterCount}`} className={`flex items-center justify-center relative py-2 px-3`}>
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
                    aria-activedescendant={autocompleteOpen && activeIndex >= 0 ? `autocomplete-option-${activeIndex}` : undefined}
                    aria-expanded={autocompleteOpen}
                    maxLength={20}
                    ref={input}
                    name="q"
                    defaultValue={searchParams.get('q') || inputValue.current || ''}
                    autoComplete="off"
                    autoFocus={!isMobile && pathname == '/search'}
                    onFocus={() => { 
                        if (!input.current?.value) return; setInputState(input.current?.value || ''); setAutocompleteOpen(true);
                    }}
                    onBlur={() => setAutocompleteOpen(false)}


                    onChange={(event) => { inputValue.current = event.target.value; setInputState(event.target.value); setActiveIndex(-1); setAutocompleteOpen(true) }}
                    onKeyDown={(e) => {
                        if (e.key === 'Escape') {
                            e.preventDefault()
                            setAutocompleteOpen(false)
                            setActiveIndex(-1)
                            return
                        }
                        if (!data?.hits?.hits?.length) return
                        const optionsCount = 1 + data.hits.hits.length
                        if (e.key === 'ArrowDown') {
                            e.preventDefault()
                            if (!autocompleteOpen) setAutocompleteOpen(true)
                            setActiveIndex((prev) => ((prev + 1 + optionsCount) % optionsCount))
                        } else if (e.key === 'ArrowUp') {
                            e.preventDefault()
                            if (!autocompleteOpen) setAutocompleteOpen(true)
                            setActiveIndex((prev) => ((prev - 1 + optionsCount) % optionsCount))
                        } else if (e.key === 'Enter') {
                            if (autocompleteOpen && activeIndex >= 0) {
                                e.preventDefault()
                                selectOption(activeIndex)
                            }
                        } else {
                            // Reset active selection on any character key
                            if (e.key.length === 1 || e.key === ' ') setActiveIndex(-1)
                        }
                    }}
                    className={`bg-transparent pr-2 ${autocompleteOpen && isMobile ? 'px-1' : 'px-4'} focus:outline-none flex w-full shrink text-lg xl:text-base`}
                />

                {searchParams.getAll('dataset')?.map((dataset, index) => <input type="hidden" key={index} name="dataset" value={dataset} />)}
                {point && <input type="hidden" name="point" value={point} />}
                {searchParams.get('datasetTag') && <input type="hidden" name="datasetTag" value={searchParams.get('datasetTag') || ''} />}

                {(inputState || searchFilterParamsString?.length > 0) && !menuOpen &&
                    <ClickableIcon label="Tøm" remove={['q']} onClick={() => { clearQuery() }}>
                        <PiX className="text-3xl lg:text-2xl text-neutral-800 group-focus-within:text-neutral-800 m-1" /></ClickableIcon>}
                <button className="mr-1 p-1" type="submit" aria-label="Søk"> <PiMagnifyingGlass className="text-3xl lg:text-2xl shrink-0 text-neutral-800" aria-hidden="true" /></button>
            </div>

            {searchParams.get('facet') && <input type="hidden" name="facet" value={searchParams.get('facet') || ''} />}
            {selectedGroup && <input type="hidden" name="init" value={selectedGroup} />}
            <input type="hidden" name="results" value={'on'} />
            {options && <input type="hidden" name="options" value={'on'} />}
            {facetFilters.map(([key, value], index) => <input type="hidden" key={index} name={key} value={value} />)}
            {searchParams.get('fulltext') && <input type="hidden" name="fulltext" value={searchParams.get('fulltext') || ''} />}
            {mode && mode != 'doc' && <input type="hidden" name="mode" value={mode || ''} />}
            {mode == 'doc' && preferredTabs[perspective] && preferredTabs[perspective] != 'map' && <input type="hidden" name="mode" value={preferredTabs[perspective] || ''} />}
            {autocompleteOpen && data?.hits?.hits?.length > 0 && <ul id="autocomplete-results" ref={listRef} role="listbox" className="absolute top-[3.5rem] xl:top-[3rem] xl:-left-12 border-t border-neutral-200 w-full max-h-[calc(100svh-4rem)] min-h-24 bg-neutral-50 xl:shadow-lg overflow-y-auto overscroll-none xl:w-[calc(25svw-1rem)] left-0 xl-p-2 xl xl:rounded-lg xl:rounded-t-none divide-y divide-neutral-300">
                <li id={`autocomplete-option-0`} className={`cursor-pointer flex items-center h-12 px-2 hover:bg-neutral-100 ${activeIndex === 0 ? 'bg-neutral-100' : ''}`}
                    tabIndex={-1} 
                    role="option" 
                    onMouseDown={(event) => { dropdownSelect(event, data.hits.hits[0].fields.label[0]) }}
                    data-autocomplete-option 
                    aria-selected={activeIndex === 0}
                >
                    
                        <PiMagnifyingGlass className="flex-shrink-0 mr-2 text-neutral-700" aria-hidden="true" /> { data.hits.hits[0].fields.label[0] }
                
                </li>
                {data?.hits?.hits?.map((hit: any) => (
                    <li key={hit._id} 
                        tabIndex={-1} 
                        role="option" 
                        data-autocomplete-option 
                        id={`autocomplete-option-${1 + data.hits.hits.findIndex((x: any) => x._id === hit._id)}`}
                        className={`cursor-pointer flex items-center h-12 px-2 hover:bg-neutral-100 ${activeIndex === 1 + data.hits.hits.findIndex((x: any) => x._id === hit._id) ? 'bg-neutral-100' : ''}`}
                        onMouseDown={(event) => { dropdownSelect(event, hit.fields.label[0], stringToBase64Url(hit.fields["group.id"][0]), hit.fields.location?.[0].coordinates) }}
                        aria-selected={activeIndex === 1 + data.hits.hits.findIndex((x: any) => x._id === hit._id)}>
                        {hit.fields.location?.length ? (
                            <PiMapPinFill aria-hidden="true" className="flex-shrink-0 mr-2 text-neutral-700" />
                        ) : null}
                        {hit._index.split('-')[2].endsWith('_g') && <PiWall aria-hidden="true" className="flex-shrink-0 mt-1 mr-2" />}
                        <div>
                            <strong>{hit.fields.label[0]}</strong>{' '}
                            <span className="text-neutral-900">
                            {hit.fields["group.adm2"]?.[0] ? hit.fields["group.adm2"]?.[0] + ', ' : ''}
                            {hit.fields["group.adm1"]?.[0]}
                            </span>
                        </div>
                    </li>
                ))}
            </ul>}
        </Form>

    </div>


}