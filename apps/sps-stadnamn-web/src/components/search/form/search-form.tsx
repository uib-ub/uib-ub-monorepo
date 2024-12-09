'use client'
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { PiMagnifyingGlass, PiX } from 'react-icons/pi';
import { useRouter } from 'next/navigation';
import { useQueryState } from 'nuqs';
import { datasetTitles } from '@/config/metadata-config';
import { useEffect, useRef, useState } from 'react';
import IconButton from '@/components/ui/icon-button';
import { searchableFields } from '@/config/search-config';
import { useDataset } from '@/lib/search-params';
import Form from 'next/form'
import Options from './options';



export default function SearchForm({isMobile}: {isMobile: boolean}) {
    const pathname = usePathname()
    const router = useRouter()
    const searchParams = useSearchParams()
    const [nav, setNav] = useQueryState('nav')
    const [inputValue, setInputValue] = useState(searchParams.get('q') || '');
    const input = useRef<HTMLInputElement | null>(null)
    const form = useRef<HTMLFormElement | null>(null)
    const dataset = useDataset()
    const setQuery = useQueryState('q')[1]
    

    const clearQuery = () => {
        setInputValue(''); 
        input.current?.focus()
        setQuery(null)
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
        <div className="sr-only xl:not-sr-only xl:w-[25svw] flex divide-x-2 divide-primary-300 gap-2 overflow-clip items-center content-center"><Link href="/" className="text-base font-serif lg:!pl-4 uppercase no-underline">Stadnamnportalen</Link><h1 className="!text-base text-neutral-800 px-2 truncate">{datasetTitles[dataset]}</h1></div>   
        <div className="h-full flex grow">
        <Form ref={form} action="/search" className="flex w-full items-center h-full">
            
            <div className='flex w-full h-full items-center bg-white border-x-2 border-neutral-200 group px-2'>
            <PiMagnifyingGlass className="text-2xl shrink-0 ml-2 text-neutral-400 group-focus-within:text-neutral-900"/>
            <input required type="text" ref={input} name="q" value={inputValue} onChange={(event) => setInputValue(event.target.value)} className="px-4 bg-transparent focus:outline-none flex w-full shrink"/>
            
            {searchParams.get('dataset') && <input type="hidden" name="dataset" value={searchParams.get('dataset') || ''}/>}
            
            { inputValue && 
            <IconButton type="button" onClick={() => { clearQuery() }} label="Tøm søk" className="px-2"><PiX className="text-lg"/></IconButton> }
            </div>
            {searchableFields[dataset]?.length > 0 && 
                <Options isMobile={isMobile}/>
            }
            {searchParams.get('facet') && <input type="hidden" name="facet" value={searchParams.get('facet') || ''}/>}
            <input type="hidden" name="nav" value={nav != 'filters' ? 'results' : 'filters'}/>
            <button className="sr-only" type="submit">Søk</button>
        </Form>
        </div>
        
        </>
     : <Link href="/" className="text-md px-4 font-serif self-center uppercase no-underline">Stadnamnportalen</Link>
          
}