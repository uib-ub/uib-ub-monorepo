'use client'
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { PiCaretLeft, PiMagnifyingGlass, PiX } from 'react-icons/pi';
import { useQueryState } from 'nuqs';
import { datasetTitles } from '@/config/metadata-config';
import { useContext, useEffect, useRef, useState } from 'react';
import { fulltextFields } from '@/config/search-config';
import { usePerspective, useMode, useSearchQuery } from '@/lib/search-params';
import Form from 'next/form'
import Options from './options';
import { GlobalContext } from '@/app/global-provider';
import ClickableIcon from '@/components/ui/clickable/clickable-icon';
import Clickable from '@/components/ui/clickable/clickable';


export default function SearchForm() {
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const { isMobile, currentUrl, preferredTabs } = useContext(GlobalContext)
    const [nav, setNav] = useQueryState('nav')
    const [inputValue, setInputValue] = useState(searchParams.get('q') || '');
    const input = useRef<HTMLInputElement | null>(null)
    const form = useRef<HTMLFormElement | null>(null)
    const perspective = usePerspective()

    const { facetFilters } = useSearchQuery()
    const mode = useMode()
    

    const clearQuery = () => {
        setInputValue(''); 
        input.current?.focus()
    }  
    


    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setNav(null);
            }
        };
    
        document.addEventListener('keydown', handleKeyDown);
    
        // Cleanup function to remove the event listener
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [setNav]);




    return pathname == '/search' ? <>   
        <div className="sr-only xl:not-sr-only flex !px-4 divide-x-2 divide-primary-400 gap-4 overflow-clip items-center content-center !w-[calc(25svw-0.5rem)]">
            <Link href="/" scroll={false} className="text-base font-serif uppercase no-underline">Stadnamnportalen</Link>
            <h1 className="!text-lg text-neutral-800 px-3 truncate">{datasetTitles[perspective]}</h1></div>   
        <div className="h-full flex grow">

            <Form ref={form} action="/search" className="flex w-full h-full" onSubmit={() => {
                if (isMobile && input.current) {
                    input.current.blur();
                }
            }}>

            <div className='flex w-full pr-1 bg-white focus-within:border-b-2 focus-within:border-primary-600 xl:border-none xl:outline xl:outline-1 xl:outline-neutral-300 xl:focus-within:border-neutral-200 xl:rounded-md xl:m-1 items-center relative group focus-within:xl:outline-2 focus-within:xl:outline-neutral-600'>
            <label htmlFor="search-input" className="sr-only">Søk</label>
            <input 
                id="search-input"
                required 
                type="text" 
                ref={input} 
                name="q" 
                autoFocus={true}
                value={inputValue} 
                onChange={(event) => setInputValue(event.target.value)} 
                className={`bg-transparent pr-4 pl-4 focus:outline-none flex w-full shrink`}
            />
            
            {searchParams.getAll('indexDataset')?.map((dataset, index) => <input type="hidden" key={index} name="indexDataset" value={dataset}/>)}
            
            { inputValue && 
            <ClickableIcon  onClick={() => { clearQuery() }} 
                            remove={['q']}
                            // Replace results with filters if no facetFilters
                            add={{nav: (nav == 'results' && facetFilters.length == 0) ? 'filters' : 'results'}}
                            label="Tøm søk"><PiX className="text-2xl lg:text-xl text-neutral-600 group-focus-within:text-neutral-800 m-1"/></ClickableIcon> }
            <button className="mr-1 p-1" type="submit" aria-label="Søk"> <PiMagnifyingGlass className="text-2xl lg:text-xl shrink-0 text-neutral-600 group-focus-within:text-neutral-800" aria-hidden="true"/></button>
            </div>
            <Options/>
            
            {searchParams.get('facet') && <input type="hidden" name="facet" value={searchParams.get('facet') || ''}/>}
            <input type="hidden" name="nav" value={ mode == 'map' ? 'results' : 'filters'}/>
            {facetFilters.map(([key, value], index) => <input type="hidden" key={index} name={key} value={value}/>)}
            {searchParams.get('fulltext') && <input type="hidden" name="fulltext" value={searchParams.get('fulltext') || ''}/>}
            {mode && mode != 'doc' && <input type="hidden" name="mode" value={mode || ''}/>}
            {mode == 'doc' && preferredTabs[perspective] && preferredTabs[perspective] != 'map' && <input type="hidden" name="mode" value={preferredTabs[perspective] || ''}/>}
            
        </Form>
        </div>
        
        </>
     : <>
     <div className="flex gap-6">
     <Link href="/" scroll={false} className="text-md px-4 font-serif self-center uppercase no-underline">Stadnamnportalen</Link>
     {currentUrl && !isMobile && <Link scroll={false} href={currentUrl} className='text-lg flex !justify-self-start items-center gap-2 no-underline invisible lg:visible'><PiCaretLeft className="text-primary-600" aria-hidden="true"/>Tilbake til søket</Link>}
     </div>
     </>
          
}