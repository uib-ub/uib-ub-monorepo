'use client'
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { PiCaretLeft, PiMagnifyingGlass, PiX } from 'react-icons/pi';
import { useQueryState } from 'nuqs';
import { datasetTitles } from '@/config/metadata-config';
import { useContext, useEffect, useRef, useState } from 'react';
import { searchableFields } from '@/config/search-config';
import { useDataset, useSearchQuery } from '@/lib/search-params';
import Form from 'next/form'
import Options from './options';
import { GlobalContext } from '@/app/global-provider';
import ClickableIcon from '@/components/ui/clickable/clickable-icon';



export default function SearchForm() {
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const { isMobile, currentUrl } = useContext(GlobalContext)
    const [nav, setNav] = useQueryState('nav')
    const [inputValue, setInputValue] = useState(searchParams.get('q') || '');
    const input = useRef<HTMLInputElement | null>(null)
    const form = useRef<HTMLFormElement | null>(null)
    const dataset = useDataset()

    const { facetFilters } = useSearchQuery()
    const mode = searchParams.get('mode') || 'map'
    

    const clearQuery = () => {
        setInputValue(''); 
        input.current?.focus()
    }  
    

    useEffect(() => {
        setInputValue(searchParams.get('q') || '')
    }, [searchParams])

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
        <div className="sr-only xl:not-sr-only flex !mx-4 divide-x-2 divide-primary-300 gap-2 overflow-clip items-center content-center"><Link href="/" className="text-base font-serif uppercase no-underline">Stadnamnportalen</Link><h1 className="!text-base text-neutral-800 px-2 truncate">{datasetTitles[dataset]}</h1></div>   
        <div className="h-full flex grow">
        <Form ref={form} action="/search" className="flex w-full items-center h-full">
            
            <div className='flex w-full h-full items-center bg-white border-x-2 border-neutral-200 group px-2'>
            <PiMagnifyingGlass className="text-2xl shrink-0 ml-2 text-neutral-400 group-focus-within:text-neutral-900"/>
            <input required type="text" ref={input} name="q" value={inputValue} onChange={(event) => setInputValue(event.target.value)} className="px-4 bg-transparent focus:outline-none flex w-full shrink"/>
            
            {searchParams.get('dataset') && <input type="hidden" name="dataset" value={searchParams.get('dataset') || ''}/>}
            
            { inputValue && 
            <ClickableIcon type="button" 
                            link
                            onClick={() => { clearQuery() }} 
                            remove={['q', 'center', 'zoom']}
                            // Replace results with filters if no facetFilters
                            add={{nav: nav == 'results' && facetFilters.length == 0 ? 'filters' : 'results'}}
                            label="Tøm søk" className="px-2"><PiX className="text-lg"/></ClickableIcon> }
            </div>
            {searchableFields[dataset]?.length > 0 && 
                <Options/>
            }
            {searchParams.get('facet') && <input type="hidden" name="facet" value={searchParams.get('facet') || ''}/>}
            <input type="hidden" name="nav" value={ mode == 'map' ? 'results' : 'filters'}/>
            {facetFilters.map(([key, value], index) => <input type="hidden" key={index} name={key} value={value}/>)}
            {mode && <input type="hidden" name="mode" value={mode || ''}/>}
            <button className="sr-only" type="submit">Søk</button>
        </Form>
        </div>
        
        </>
     : <>
     <div className="flex gap-6">
     <Link href="/" className="text-md px-4 font-serif self-center uppercase no-underline">Stadnamnportalen</Link>
     {currentUrl && !isMobile && <Link href={currentUrl} className='text-lg flex !justify-self-start items-center gap-2 no-underline invisible lg:visible'><PiCaretLeft className="text-primary-600" aria-hidden="true"/>Tilbake til søket</Link>}
     </div>
     </>
          
}