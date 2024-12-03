'use client'
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { PiCaretDown, PiCaretUp, PiMagnifyingGlass, PiX } from 'react-icons/pi';
import { useRouter } from 'next/navigation';
import { parseAsBoolean, parseAsString, useQueryState } from 'nuqs';
import { datasetTitles } from '@/config/metadata-config';
import { useEffect, useRef, useState } from 'react';
import IconButton from '@/components/ui/icon-button';
import { searchableFields } from '@/config/search-config';
import { useDataset } from '@/lib/search-params';
import Form from 'next/form'
import { DropdownMenu } from '@radix-ui/react-dropdown-menu';
import Options from './options';



export default function SearchForm({isMobile}: {isMobile: boolean}) {
    const pathname = usePathname()
    const router = useRouter()
    const searchParams = useSearchParams()
    const [expanded, setExpanded] = useQueryState('expanded')
    const [inputValue, setInputValue] = useState(searchParams.get('q') || '');
    const input = useRef<HTMLInputElement | null>(null)
    const form = useRef<HTMLFormElement | null>(null)
    const dataset = useDataset()
    


    const handleSubmit = async (event: any) => {
        event.preventDefault()
        const formParams = new URLSearchParams()
        if (expanded != 'filters') {
            formParams.set('expanded', 'results')
        }
        else {
            formParams.set('expanded', 'filters')
        }

        const facet = searchParams.get('facet')
        if (facet) {
            formParams.set('facet', facet)
        }
        
        for (const [key, value] of new FormData(event.target)) {
            if (value) {
                formParams.append(key, value as string)
            }
            
        }
        router.push(`?${formParams.toString()}`)
    }

    

    useEffect(() => {
        setInputValue(searchParams.get('q') || '')
    }, [searchParams])

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setExpanded(null);
            }
        };
    
        document.addEventListener('keydown', handleKeyDown);
    
        // Cleanup function to remove the event listener
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [setExpanded]);
    
    return pathname == '/search' ? <>    
        <div className=""><Link href="/" className="text-lg lg:min-w-[25svw] pt-1 font-serif sr-only lg:not-sr-only self-center lg:!px-4 uppercase no-underline">Stadnamnportalen</Link></div>   
        <div className="h-full flex w-full lg:w-1/2">
        <Form ref={form} action="/search" className="flex w-full items-center h-full">
        {isMobile ? <h1 className="sr-only">{datasetTitles[searchParams.get('dataset') || 'search']}</h1>
            : <h1 className="text-lg font-sans px-4">
                <button aria-expanded={expanded == 'datasets'} aria-controls="dataset_list" type="button" onClick={() => setExpanded(prev => prev != 'datasets' ? 'datasets' : null)} className="flex gap-2 items-center border-neutral-300 flex-nowrap">
                {expanded == 'datasets' ? <PiCaretUp className="text-2xl inline text-primary-600"/> : <PiCaretDown className="text-2xl inline text-primary-600"/>}
                <span className="whitespace-nowrap max-w-[20svw] truncate font-semibold">{datasetTitles[searchParams.get('dataset') || 'search']}</span>
                    
                </button>
              </h1>
            }
            
            <div className='flex w-full h-full items-center bg-white border-x-2 border-neutral-200 group px-2'>
            <PiMagnifyingGlass className="text-2xl shrink-0 ml-2 text-neutral-400 group-focus-within:text-neutral-900"/>
            <input type="text" ref={input} name="q" value={inputValue} onChange={(event) => setInputValue(event.target.value)} className="px-4 bg-transparent focus:outline-none flex w-full shrink"/>
            
            {searchParams.get('dataset') && <input type="hidden" name="dataset" value={searchParams.get('dataset') || ''}/>}
            
            { inputValue && 
            <IconButton type="button" onClick={() => { setInputValue(''); input.current?.focus()}} label="Tøm søk" className="px-2"><PiX className="text-lg"/></IconButton> }
            </div>
            {searchableFields[dataset]?.length > 0 && 
                <Options isMobile={isMobile}/>
            }
            {searchParams.get('facet') && <input type="hidden" name="facet" value={searchParams.get('facet') || ''}/>}
            <input type="hidden" name="expanded" value={expanded != 'filters' ? 'results' : 'filters'}/>
            <button className="sr-only" type="submit">Søk</button>
        </Form>

        { expanded == 'options' && <section aria-labelledby="doc-title" className="absolute top-12 left-10 pt-4  right-0 rounded-b-md border-t w-[30svw] shadow-md h-fit border-2 border-neutral-200 bg-white overflow-y-auto max-h-[calc(100svh-3rem)]">        
                    
                </section>
        }

        </div>
        
        </>
     : <Link href="/" className="text-md px-4 font-serif self-center uppercase no-underline">Stadnamnportalen</Link>
          
}