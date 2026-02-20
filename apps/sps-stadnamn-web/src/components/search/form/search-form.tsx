'use client'
import Menu from '@/app/menu';
import { defaultMaxResultsParam, getClampedMaxResultsFromParam } from '@/config/max-results';
import ClickableIcon from '@/components/ui/clickable/clickable-icon';
import { MAP_DRAWER_BOTTOM_HEIGHT_REM, panPointIntoView } from '@/lib/map-utils';
import { useMode, usePerspective } from '@/lib/param-hooks';
import { stringToBase64Url } from '@/lib/param-utils';
import { useSearchQuery } from '@/lib/search-params';
import { detailsRenderer } from '@/lib/text-utils';
import { formatNumber } from '@/lib/utils';
import { GlobalContext } from '@/state/providers/global-provider';
import { useSessionStore } from '@/state/zustand/session-store';
import { useQuery } from '@tanstack/react-query';
import Form from 'next/form';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { PiCaretLeftBold, PiMagnifyingGlass, PiMapPinFill, PiSliders, PiWall, PiX } from 'react-icons/pi';

export async function autocompleteQuery(searchFilterParamsString: string, inputState: string, isMobile: boolean, datasetFilters: [string, string][] = []) {
    if (!inputState) return null
    const newQuery = new URLSearchParams(searchFilterParamsString)
    newQuery.delete('q')
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
    const { isMobile, preferredTabs, inputValue, mapFunctionRef } = useContext(GlobalContext)
    const menuOpen = useSessionStore((s: any) => s.menuOpen)
    const autocompleteOpen = useSessionStore((s: any) => s.autocompleteOpen)
    const setAutocompleteOpen = useSessionStore((s: any) => s.setAutocompleteOpen)
    const setSnappedPosition = useSessionStore((s: any) => s.setSnappedPosition)
    const setDrawerOpen = useSessionStore((s) => s.setDrawerOpen)
    const snappedPosition = useSessionStore((s: any) => s.snappedPosition)
    const currentPosition = useSessionStore((s: any) => s.currentPosition)
    const datasetTag = searchParams.get('datasetTag')
    const [selectedGroup, setSelectedGroup] = useState<string | null>(null)
    const options = searchParams.get('options')
    const maxResults = searchParams.get('maxResults')
    const normalizedMaxResultsParam = maxResults
        ? String(getClampedMaxResultsFromParam(maxResults) || Number(defaultMaxResultsParam))
        : null


    const input = useRef<HTMLInputElement | null>(null)
    const form = useRef<HTMLFormElement | null>(null)
    const perspective = usePerspective()

    const { facetFilters, datasetFilters, searchFilterParamsString } = useSearchQuery()
    const filterCount = facetFilters.length + datasetFilters.length


    const mode = useMode()

    // Initialize from URL params - this is the source of truth
    const urlQuery = searchParams.get('q') || ''
    const [inputState, setInputState] = useState<string>(urlQuery)
    const [point, setPoint] = useState<string>()
    const [autocompleteFacetFilters, setAutocompleteFacetFilters] = useState<[string, string][]>(facetFilters)
    const [autocompleteDatasetFilters, setAutocompleteDatasetFilters] = useState<[string, string][]>(datasetFilters)
    const [activeIndex, setActiveIndex] = useState<number>(-1)
    const listRef = useRef<HTMLUListElement | null>(null)

    const { data, isLoading } = useQuery({
        queryKey: ['autocomplete', inputState, datasetFilters],
        placeholderData: (prevData: any) => prevData,
        queryFn: () => autocompleteQuery(searchFilterParamsString, inputState, isMobile, datasetFilters)
    })


    // Client-side ranking of autocomplete results based on similarity to the
    // current input. The API only enforces coarse matching; here we prefer:
    // - exact label == full query,
    // - then label == first part + adm2 == last token,
    // - then other combinations, keeping the rest of the ES ordering.
    const rankedHits = useMemo(() => {
        const hits: any[] = data?.hits?.hits || []
        const q = (inputState || '').trim().toLowerCase()
        if (!q || !hits.length) return hits

        const parts = q.split(/\s+/).filter(Boolean)
        const lastToken = parts[parts.length - 1] || ''
        const firstPart = parts.slice(0, -1).join(' ').trim()

        const firstLower = firstPart.toLowerCase()
        const lastLower = lastToken.toLowerCase()

        return [...hits]
            .map((hit) => {
                const label: string = hit.fields?.label?.[0] || ''
                const adm2: string =
                    hit.fields?.adm2?.[0] ||
                    hit.fields?.['group.adm2']?.[0] ||
                    ''

                const labelLc = label.toLowerCase()
                const adm2Lc = adm2.toLowerCase()

                let score = 0

                // Strong preference for exact label match on full query.
                if (labelLc === q) score += 1000

                // Next: label equals first part and adm2 equals last token.
                if (firstLower && labelLc === firstLower && lastLower && adm2Lc === lastLower) {
                    score += 900
                }

                // Label equals first part.
                if (firstLower && labelLc === firstLower) score += 400

                // adm2 equals last token.
                if (lastLower && adm2Lc === lastLower) score += 300

                // Prefix matches as weaker signals.
                if (firstLower && labelLc.startsWith(firstLower)) score += 200
                if (lastLower && adm2Lc.startsWith(lastLower)) score += 150

                // Slight bias toward shorter labels.
                score -= label.length * 0.01

                return { ...hit, __clientScore: score }
            })
            .sort((a, b) => (b.__clientScore ?? 0) - (a.__clientScore ?? 0))
    }, [data, inputState])

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
        if (!rankedHits.length) return
        if (index === 0) {
            const label = rankedHits[0].fields.label[0]
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
            position: (!isMobile || currentPosition <= MAP_DRAWER_BOTTOM_HEIGHT_REM) ? undefined : 'absolute',
            top: (!isMobile || currentPosition <= MAP_DRAWER_BOTTOM_HEIGHT_REM) ? undefined : (snappedPosition === 'top' ? '0rem' : `calc(${-currentPosition + MAP_DRAWER_BOTTOM_HEIGHT_REM}rem * (1 - max(0, min(1, (${currentPosition}rem - 60svh) / (100svh - 60svh - 8rem)))))`),
            left: (!isMobile || currentPosition <= MAP_DRAWER_BOTTOM_HEIGHT_REM) ? undefined : `0`,
            // Fade only between 'middle' and 'top' on mobile when above bottom threshold
            opacity: (!isMobile || currentPosition <= MAP_DRAWER_BOTTOM_HEIGHT_REM)
                ? 1
                : ((snappedPosition === 'top' || snappedPosition === 'middle')
                    ? (snappedPosition === 'top' ? 1 : 0)
                    : 1)
        }}>
        <header className={`${isMobile && autocompleteOpen ? 'sr-only' : `flex flex-none ${isMobile ? 'w-14 h-14' : 'absolute top-2 left-2 h-12 w-auto'}`} ${(autocompleteOpen || menuOpen) ? '' : 'shadow-lg'} bg-neutral-50`}><Menu shadow autocompleteShowing={autocompleteOpen && data?.hits?.hits?.length > 0} /></header>
        <Form ref={form} onSubmitCapture={() => setSelectedGroup(null)} action="/search" id="search-form" aria-label="Stadnamnsøk"
            className={`${isMobile ? 'h-14' : 'h-12'} ${isMobile && autocompleteOpen ? 'w-[100svw]' : isMobile ? 'w-[calc(100svw-3.5rem)]' : 'w-[calc(30svw-4rem)] lg:w-[calc(25svw-4rem)] absolute top-2 left-[3.5rem]'} ${(autocompleteOpen || menuOpen) ? `z-[7000] ${!isMobile && '!rounded-b-none'}` : 'z-[3001]'}`}


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

            <div className={`flex w-full h-full pr-1 bg-white ${isMobile ? 'shadow-lg' : `shadow-l-none rounded-l-none ${autocompleteOpen && data?.hits?.hits?.length > 0 ? 'rounded-tr-md' : 'rounded-r-md'} shadow-lg`} items-center relative group`}>

                <label htmlFor="search-input" className="sr-only">Søk</label>
                {false && !(isMobile && autocompleteOpen) && <ClickableIcon onClick={() => { setSnappedPosition('middle') }} add={{ options: options ? null : 'on' }} label={`Filter: ${filterCount}`} className={`flex items-center justify-center relative py-2 px-3`}>
                    <PiSliders className="text-3xl xl:text-2xl" aria-hidden="true" />
                    {filterCount > 0 && <span className={`results-badge bg-primary-500 absolute top-1 left-1 rounded-full text-white text-xs ${filterCount < 10 ? 'px-1.5' : 'px-1'}`}>
                        {formatNumber(filterCount)}
                    </span>}
                </ClickableIcon>}
                {isMobile && autocompleteOpen && <ClickableIcon label="Tilbake" onClick={() => setAutocompleteOpen(false)} className={`flex items-center justify-center relative py-2 px-3`}><PiCaretLeftBold className="text-3xl xl:text-2xl" aria-hidden="true" /></ClickableIcon>}


                <input
                    id="search-input"
                    type="text"
                    role="combobox"
                    aria-controls="autocomplete-results"
                    aria-activedescendant={autocompleteOpen && activeIndex >= 0 ? `autocomplete-option-${activeIndex}` : undefined}
                    aria-expanded={autocompleteOpen}
                    maxLength={200}
                    ref={input}
                    name={inputState.trim() ? 'q' : undefined}
                    key={urlQuery}
                    defaultValue={urlQuery}
                    autoComplete="off"
                    autoFocus={!isMobile && pathname == '/search'}
                    onBlur={() => setAutocompleteOpen(false)}
                    onChange={(event) => {
                        const v = event.target.value
                        inputValue.current = v
                        setInputState(v)
                        setActiveIndex(-1)
                        setAutocompleteOpen(!!v.trim())
                    }}
                    onKeyDown={(e) => {
                        if (e.key === 'Escape') {
                            e.preventDefault()
                            setAutocompleteOpen(false)
                            setActiveIndex(-1)
                            return
                        }
                        if (!rankedHits.length) return
                        const optionsCount = 1 + rankedHits.length
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

                {inputState && !menuOpen &&
                    <ClickableIcon label="Tøm" remove={['q', 'maxResults']} replace onClick={() => { clearQuery() }}>
                        <PiX className="text-3xl lg:text-2xl text-neutral-800 group-focus-within:text-neutral-800 m-1" /></ClickableIcon>}
                <button className="mr-1 p-1" type="submit" aria-label="Søk"> <PiMagnifyingGlass className="text-3xl lg:text-2xl shrink-0 text-neutral-800" aria-hidden="true" /></button>
            </div>

            {searchParams.get('facet') && <input type="hidden" name="facet" value={searchParams.get('facet') || ''} />}
            {selectedGroup && <input type="hidden" name="init" value={selectedGroup} />}
            {/* results: integer – minimum is 5 when present. */}
            {normalizedMaxResultsParam && <input type="hidden" name="maxResults" value={normalizedMaxResultsParam} />}
            {options && <input type="hidden" name="options" value={'on'} />}
            <input type="hidden" name="maxResults" value={defaultMaxResultsParam} />
            {facetFilters.map(([key, value], index) => <input type="hidden" key={index} name={key} value={value} />)}
            {searchParams.get('fulltext') && <input type="hidden" name="fulltext" value={searchParams.get('fulltext') || ''} />}
            {mode && mode != 'doc' && <input type="hidden" name="mode" value={mode || ''} />}
            {mode == 'doc' && preferredTabs[perspective] && preferredTabs[perspective] != 'map' && <input type="hidden" name="mode" value={preferredTabs[perspective] || ''} />}
            {autocompleteOpen && rankedHits.length > 0 && <ul id="autocomplete-results" ref={listRef} role="listbox" className={`absolute ${isMobile ? 'top-[3.5rem] left-0 w-full' : 'top-[3rem] -left-12 x-[30svw] lg:w-[calc(25svw-1rem)] shadow-lg rounded-lg rounded-t-none'} border-t border-neutral-200 max-h-[calc(100svh-4rem)] min-h-24 bg-neutral-50 overflow-y-auto overscroll-none xl-p-2 xl divide-y divide-neutral-300`}>
                <li id={`autocomplete-option-0`} className={`cursor-pointer flex items-start gap-2 min-h-12 py-3 px-2 hover:bg-neutral-100 ${activeIndex === 0 ? 'bg-neutral-100' : ''}`}
                    tabIndex={-1}
                    role="option"
                    onMouseDown={(event) => { dropdownSelect(event, rankedHits[0].fields.label[0]) }}
                    data-autocomplete-option
                    aria-selected={activeIndex === 0}
                >

                    <span className="flex items-center h-6 flex-shrink-0">
                        <PiMagnifyingGlass className="text-neutral-700" aria-hidden="true" />
                    </span>
                    <span className="flex-1 leading-6">{rankedHits[0].fields.label[0]}</span>

                </li>
                {rankedHits.map((hit: any, index: number) => {
                    return (
                        <li key={hit._id}
                            tabIndex={-1}
                            role="option"
                            data-autocomplete-option
                            id={`autocomplete-option-${1 + index}`}
                            className={`cursor-pointer flex items-start gap-2 min-h-12 py-3 px-2 hover:bg-neutral-100 ${activeIndex === 1 + index ? 'bg-neutral-100' : ''}`}
                            onMouseDown={(event) => { dropdownSelect(event, hit.fields.label[0], stringToBase64Url(hit.fields["group.id"][0]), hit.fields.location?.[0].coordinates) }}
                            aria-selected={activeIndex === 1 + data.hits.hits.findIndex((x: any) => x._id === hit._id)}>
                            {hit.fields.location?.length ? (
                                <span className="flex items-center h-6 flex-shrink-0">
                                    <PiMapPinFill aria-hidden="true" className="text-neutral-700" />
                                </span>
                            ) : null}
                            {hit._index.split('-')[2].endsWith('_g') && (
                                <span className="flex items-center h-6 flex-shrink-0">
                                    <PiWall aria-hidden="true" />
                                </span>
                            )}
                            <div className="flex-1 leading-6">
                                <strong>{hit.fields.label[0]} {hit.fields["group.label"] && hit.fields["group.label"]?.[0] != hit.fields.label[0] && `(${hit.fields["group.label"]?.[0]})`} </strong>{' '}
                                <span className="text-neutral-900">
                                    {detailsRenderer(hit)}


                                </span>
                            </div>
                        </li>
                    )
                })}
            </ul>}
        </Form>

    </div>


}