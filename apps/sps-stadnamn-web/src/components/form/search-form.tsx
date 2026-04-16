'use client'
import Menu from '@/app/menu';
import ClickableIcon from '@/components/ui/clickable/clickable-icon';
import Clickable from '@/components/ui/clickable/clickable';
import { MAP_DRAWER_BOTTOM_HEIGHT_REM, mobileSearchChromeWrapperTopStyle, panPointIntoView } from '@/lib/map-utils';
import { useDatasetTagParam, useFacetParam, useFulltextOn, useFuzzyOn, useGroupParam, useInitParam, useMode, useNoGeoOn, useOptionsOn, usePerspective, usePoint, usePointParam, useQParam, useSourceViewOn, useTreeParam } from '@/lib/param-hooks';
import { useSearchQuery } from '@/lib/search-params';
import { formatNumber } from '@/lib/utils';
import { GlobalContext } from '@/state/providers/global-provider';
import { useSessionStore } from '@/state/zustand/session-store';
import AutocompleteDropdown from './autocomplete-dropdown';
import Form from 'next/form';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useContext, useEffect, useRef, useState } from 'react';
import { PiCaretLeftBold, PiMagnifyingGlass, PiSliders, PiX } from 'react-icons/pi';
export default function SearchForm() {
    const pathname = usePathname()
    const router = useRouter()
    const searchParams = useSearchParams()
    const { isMobile, preferredTabs, inputValue, mapFunctionRef } = useContext(GlobalContext)
    const menuOpen = useSessionStore((s: any) => s.menuOpen)
    const autocompleteOpen = useSessionStore((s: any) => s.autocompleteOpen)
    const autocompleteActiveIndex = useSessionStore((s: any) => s.autocompleteActiveIndex)
    const autocompleteHasResults = useSessionStore((s: any) => s.autocompleteHasResults)
    const setAutocompleteOpen = useSessionStore((s: any) => s.setAutocompleteOpen)
    const setSnappedPosition = useSessionStore((s: any) => s.setSnappedPosition)
    const setDrawerOpen = useSessionStore((s) => s.setDrawerOpen)
    const snappedPosition = useSessionStore((s: any) => s.snappedPosition)
    const currentPosition = useSessionStore((s: any) => s.currentPosition)
    const [selectedGroup, setSelectedGroup] = useState<string | null>(null)
    const optionsOn = useOptionsOn()
    const group = useGroupParam()
    const fuzzyOn = useFuzzyOn()
    const sourceViewOn = useSourceViewOn()
    const init = useInitParam()
    const pointParam = usePointParam()
    const facet = useFacetParam()
    const fulltextOn = useFulltextOn()
    const datasetTag = useDatasetTagParam()
    const noGeoOn = useNoGeoOn()


    const input = useRef<HTMLInputElement | null>(null)
    const form = useRef<HTMLFormElement | null>(null)
    const submitQRef = useRef<HTMLInputElement | null>(null)
    const perspective = usePerspective()

    const { facetFilters, datasetFilters } = useSearchQuery()
    const filterCount = facetFilters.length + datasetFilters.length


    const mode = useMode()

    // Initialize from URL params - this is the source of truth
    const urlQuery = useQParam() || ''
    const [inputState, setInputState] = useState<string>(urlQuery)
    const [submittedPoint, setSubmittedPoint] = useState<string | null>(null)

    const tree = useTreeParam()

    const dropdownSelect = (
        inputString: string,
        group?: string | null,
        coordinates?: [number, number],
        submitQ?: string,
    ) => {
        inputValue.current = inputString
        if (group) {
            setSelectedGroup(group)
            setInputState(inputString)
            if (coordinates?.length == 2) {
                const [lon, lat] = coordinates
                panPointIntoView(mapFunctionRef.current, [lat, lon], isMobile, false, undefined, tree ? 0.40 : 0.25)
                setSubmittedPoint(`${lat},${lon}`)
            }
        }

        if (input.current) {
            input.current.value = inputString // ensure the form control has the new value
        }
        if (form.current) {
            if (submitQ && submitQRef.current && input.current) {
                // Submit a different `q` than what’s shown in the input.
                submitQRef.current.disabled = false
                submitQRef.current.value = submitQ
                input.current.removeAttribute('name')
            }

            requestAnimationFrame(() => form.current?.requestSubmit())

            if (submitQ && submitQRef.current && input.current) {
                setTimeout(() => {
                    submitQRef.current!.disabled = true
                    // Restore default: submit whatever the user typed.
                    if (inputState.trim()) input.current!.name = 'q'
                }, 0)
            }
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

    useEffect(() => {
        if (input.current?.value && !isMobile) {
            input.current.select();
        }
    }, [isMobile]);


    if (pathname != "/search") {
        return <div className="flex gap-6">
            <Link href="/" scroll={false} className="text-xl px-4 ml-2 self-center no-underline">stadnamn.no</Link>

        </div>
    }






    return <div
        className="flex"
        style={{
            position: (!isMobile || currentPosition <= MAP_DRAWER_BOTTOM_HEIGHT_REM) ? undefined : 'absolute',
            top: (!isMobile || currentPosition <= MAP_DRAWER_BOTTOM_HEIGHT_REM)
                ? undefined
                : mobileSearchChromeWrapperTopStyle(currentPosition, snappedPosition),
            left: (!isMobile || currentPosition <= MAP_DRAWER_BOTTOM_HEIGHT_REM) ? undefined : `0`,
            // Fade only between 'middle' and 'top' on mobile when above bottom threshold
            opacity: (!isMobile || currentPosition <= MAP_DRAWER_BOTTOM_HEIGHT_REM)
                ? 1
                : ((snappedPosition === 'top' || snappedPosition === 'middle')
                    ? (snappedPosition === 'top' ? 1 : 0)
                    : 1)
        }}>
        <header className={`${isMobile && autocompleteOpen ? 'sr-only' : `flex flex-none ${isMobile ? 'w-14 h-14' : 'absolute top-2 left-2 h-12 w-auto'}`} ${(autocompleteOpen || menuOpen) ? '' : 'shadow-lg'} bg-neutral-50`}><Menu shadow autocompleteShowing={autocompleteOpen && autocompleteHasResults} /></header>
        <Form ref={form} suppressHydrationWarning={true} onSubmitCapture={() => { setSelectedGroup(null); setSubmittedPoint(null) }} action="/search" id="search-form" aria-label="Stadnamnsøk"
            className={`${isMobile ? 'h-14' : 'h-12'} ${isMobile && autocompleteOpen ? 'w-[100svw]' : isMobile ? 'w-[calc(100svw-3.5rem)]' : 'w-[calc(100svw-4rem)] lg:w-[calc(30svw-4rem)] xl:w-[calc(25svw-4rem)] absolute top-2 left-[3.5rem]'} ${(autocompleteOpen || menuOpen) ? `z-[7000] ${!isMobile && '!rounded-b-none'}` : 'z-[3001]'}`}


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

            <div className={`flex h-full pr-1 bg-white ${isMobile ? 'shadow-lg' : `shadow-l-none rounded-l-none w-full ${autocompleteOpen && autocompleteHasResults ? 'rounded-tr-md' : 'rounded-r-md'} shadow-lg`} items-center relative group`}>
                <label htmlFor="search-input" className="sr-only">Søk</label>
                {false && !(isMobile && autocompleteOpen) && <ClickableIcon onClick={() => { setSnappedPosition('middle') }} add={{ options: optionsOn ? null : 'on' }} label={`Filter: ${filterCount}`} className={`flex items-center justify-center relative py-2 px-3`}>
                    <PiSliders className="text-3xl xl:text-2xl" aria-hidden="true" />
                    {filterCount > 0 && <span className={`results-badge bg-primary-500 absolute top-1 left-1 rounded-full text-white text-xs ${filterCount < 10 ? 'px-1.5' : 'px-1'}`}>
                        {formatNumber(filterCount)}
                    </span>}
                </ClickableIcon>}
                {isMobile && autocompleteOpen && <ClickableIcon label="Tilbake" onClick={() => setAutocompleteOpen(false)} className={`flex shrink-0 items-center justify-end relative py !h-14 !w-14 border-r border-transparent`}><PiCaretLeftBold className="text-3xl xl:text-2xl" aria-hidden="true" /></ClickableIcon>}

                <input
                    suppressHydrationWarning={true}
                    id="search-input"
                    type="text"
                    role="combobox"
                    aria-controls="autocomplete-results"
                    aria-activedescendant={autocompleteOpen && autocompleteActiveIndex >= 0 ? `autocomplete-option-${autocompleteActiveIndex}` : undefined}
                    aria-expanded={autocompleteOpen}
                    maxLength={200}
                    ref={input}
                    name={inputState.trim() ? 'q' : undefined}
                    defaultValue={urlQuery}
                    autoComplete="off"
                    autoFocus={!isMobile && pathname == '/search'}
                    onChange={(event) => {
                        const v = event.target.value
                        inputValue.current = v
                        setInputState(v)
                    }}
                    className={`bg-transparent px-4 focus:outline-none flex w-full shrink text-lg xl:text-base`}
                />
                <input ref={submitQRef} type="hidden" name="q" defaultValue="" disabled />

                {searchParams.getAll('dataset')?.map((dataset, index) => <input type="hidden" key={index} name="dataset" value={dataset} />)}
                {submittedPoint && <input type="hidden" name="point" value={submittedPoint} />}
                {datasetTag && <input type="hidden" name="datasetTag" value={datasetTag || ''} />}
                

                {(inputState || urlQuery || group) && !menuOpen &&
                    <ClickableIcon label="Tøm" remove={ ['q', 'resultLimit']} replace onClick={() => { clearQuery() }}>
                        <PiX className="text-3xl lg:text-2xl text-neutral-800 group-focus-within:text-neutral-800 m-1" /></ClickableIcon>}
                <button className="mr-1 p-1" type="submit" aria-label="Søk"> <PiMagnifyingGlass className="text-3xl lg:text-2xl shrink-0 text-neutral-800" aria-hidden="true" /></button>
            </div>

            {facet && <input type="hidden" name="facet" value={facet || ''} />}
            {selectedGroup && <input type="hidden" name="init" value={selectedGroup} />}
            {/* results: integer – minimum is 5 when present. */}
            {optionsOn && <input type="hidden" name="options" value={'on'} />}
            {noGeoOn && <input type="hidden" name="noGeo" value={'on'} />}
            
            {sourceViewOn && !group && <input type="hidden" name="sourceView" value={'on'} />}
            {!submittedPoint && !init && pointParam && <input type="hidden" name="point" value={pointParam || ''} />}
            {facetFilters.map(([key, value], index) => <input type="hidden" key={index} name={key} value={value} />)}
            {fulltextOn && <input type="hidden" name="fulltext" value={'on'} />}
            {fuzzyOn && <input type="hidden" name="fuzzy" value={'on'} />}
            {mode && mode != 'map' && <input type="hidden" name="mode" value={mode || ''} />}
            {mode == 'doc' && preferredTabs[perspective] && preferredTabs[perspective] != 'map' && <input type="hidden" name="mode" value={preferredTabs[perspective] || ''} />}
            <AutocompleteDropdown
                inputState={inputState}
                inputRef={input}
                onSelect={(selection) =>
                    dropdownSelect(
                        selection.inputString,
                        selection.group,
                        selection.coordinates,
                        selection.submitQ,
                    )
                }
            />
        </Form>

    </div>


}