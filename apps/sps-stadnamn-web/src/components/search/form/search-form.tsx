'use client'
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { PiCaretLeft, PiCaretLeftBold, PiFunnel, PiMagnifyingGlass, PiMapTrifold, PiX } from 'react-icons/pi';
import { datasetTitles, modes } from '@/config/metadata-config';
import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useSearchQuery } from '@/lib/search-params';
import Form from 'next/form'
import Options from './options';
import { GlobalContext } from '@/app/global-provider';
import IconButton from '@/components/ui/icon-button';
import { usePerspective } from '@/lib/param-hooks';
import { useMode } from '@/lib/param-hooks';
import FulltextToggle from '@/app/fulltext-toggle';
import { useQuery } from '@tanstack/react-query';
import ResultItem from '../nav/results/result-item';
import Menu from '@/app/menu';
import { useSessionStore } from '@/app/session-store';
import Clickable from '@/components/ui/clickable/clickable';

export async function autocompleteQuery(inputState: string, isMobile: boolean) {
    if (!inputState) return null
    const res = await fetch(`/api/search/collapsed?q=${inputState}&size=${isMobile ? 5 : 20}`)
    if (!res.ok) {
        throw new Error(res.status.toString())
    }
    const data = await res.json()
    return data
}


export default function SearchForm() {
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const { isMobile, currentUrl, preferredTabs, inputValue } = useContext(GlobalContext)    //const autocompleteOpen = searchParams.get('nav') == 'results'
    const menuOpen = useSessionStore((s) => s.menuOpen)
    const autocompleteOpen = useSessionStore((s) => s.autocompleteOpen)
    const setAutocompleteOpen = useSessionStore((s) => s.setAutocompleteOpen)


    const input = useRef<HTMLInputElement | null>(null)
    const form = useRef<HTMLFormElement | null>(null)
    const perspective = usePerspective()

    const { facetFilters, datasetFilters } = useSearchQuery()
    const mode = useMode()
    const nav = searchParams.get('nav')

    const [inputState, setInputState] = useState<string>(inputValue.current || '') // Ensure updates within the component
    const [autocompleteFacetFilters, setAutocompleteFacetFilters] = useState<[string, string][]>(facetFilters)
    const [autocompleteDatasetFilters, setAutocompleteDatasetFilters] = useState<[string, string][]>(datasetFilters)

    const { data, isLoading } = useQuery({
        queryKey: ['autocomplete', inputState],
        placeholderData: (prevData: any) => prevData,
        queryFn: () => autocompleteQuery(inputState, isMobile)
    })


    const clearQuery = () => {
        inputValue.current = '';
        setInputState('')
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




    return <>

        <div className={`${(autocompleteOpen || menuOpen) ? 'z-[6000]' : 'z-[3000]'} h-full w-full w-full flex xl:gap-2`}>

        {(!isMobile || !autocompleteOpen) && <Menu shadow/>}
                
                {isMobile && autocompleteOpen &&
                    <IconButton
                        onClick={() => { setAutocompleteOpen(false) }}
                        label="Tilbake"
                        className="items-center justify-center flex h-full shadow-lg aspect-square xl:rounded-md bg-neutral-50 border-r-2 xl:border-r-0  border-neutral-200">
                        <PiCaretLeftBold className="text-2xl" />
                    </IconButton>}

            <Form ref={form} action="/search" id="search-form" className="flex w-full h-full"
                onFocus={() => setAutocompleteOpen(Boolean(inputState))}
                onBlur={() => setAutocompleteOpen(false)}

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

                <div className='flex w-full pr-1 bg-white shadow-lg xl:rounded-md items-center relative group'>
                    
                    <label htmlFor="search-input" className="sr-only">Søk</label>
                    <input
                        id="search-input"
                        required
                        type="text"
                        role="combobox"
                        maxLength={20}
                        ref={input}
                        name="q"
                        defaultValue={searchParams.get('q') || inputValue.current || ''}
                        autoComplete="off"
                        autoFocus={!isMobile && pathname == '/search'}


                        onChange={(event) => { inputValue.current = event.target.value; setInputState(event.target.value); setAutocompleteOpen(Boolean(event.target.value)) }}
                        className={`bg-transparent pr-4 pl-4 focus:outline-none flex w-full shrink text-lg xl:text-base`}
                    />

                    {searchParams.getAll('dataset')?.map((dataset, index) => <input type="hidden" key={index} name="dataset" value={dataset} />)}
                    {searchParams.get('datasetTag') && <input type="hidden" name="datasetTag" value={searchParams.get('datasetTag') || ''} />}
                    {false && `${JSON.stringify(autocompleteFacetFilters)}${JSON.stringify(autocompleteDatasetFilters)}`}

                    {inputState &&
                        <IconButton onClick={() => { clearQuery() }}

                            // Replace results with filters if no facetFilters

                            label="Tøm søkefelt"><PiX className="text-3xl lg:text-xl text-neutral-600 group-focus-within:text-neutral-800 m-1" /></IconButton>}
                    <button className="mr-1 p-1" type="submit" aria-label="Søk"> <PiMagnifyingGlass className="text-3xl lg:text-xl shrink-0 text-neutral-600 group-focus-within:text-neutral-800" aria-hidden="true" /></button>
                </div>
                {!isMobile && false && <FulltextToggle />}

                {searchParams.get('facet') && <input type="hidden" name="facet" value={searchParams.get('facet') || ''} />}
                <input type="hidden" name="nav" value={'results'} />
                {facetFilters.map(([key, value], index) => <input type="hidden" key={index} name={key} value={value} />)}
                {searchParams.get('fulltext') && <input type="hidden" name="fulltext" value={searchParams.get('fulltext') || ''} />}
                {mode && mode != 'doc' && <input type="hidden" name="mode" value={mode || ''} />}
                {mode == 'doc' && preferredTabs[perspective] && preferredTabs[perspective] != 'map' && <input type="hidden" name="mode" value={preferredTabs[perspective] || ''} />}
                {autocompleteOpen && <ul className="absolute top-[3.5rem] left-0 xl:left-2 border-t border-neutral-200 w-full max-h-[calc(100svh-4rem)] xl:h-auto bg-white xl:shadow-lg overflow-y-auto overscroll-none xl:max-w-[calc(25svw-0.5rem)] left-0 xl-p-2 xl xl:rounded-lg">
                    {data?.hits?.hits?.map((hit: any) => (
                        <li key={hit._id} role="option"><ResultItem hit={hit} /></li>
                    ))}
                </ul>}
            </Form>
        </div>

    </>


}