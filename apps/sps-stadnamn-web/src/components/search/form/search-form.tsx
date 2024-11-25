'use client'
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { PiCaretDown, PiCaretUp, PiMagnifyingGlass, PiX } from 'react-icons/pi';
import { useRouter } from 'next/navigation';
import { useQueryState } from 'nuqs';
import Options from '../options/search-options';
import { datasetTitles } from '@/config/metadata-config';
import { useEffect, useRef, useState } from 'react';
import IconButton from '@/components/ui/icon-button';


export default function SearchForm({isMobile}: {isMobile: boolean}) {
    const pathname = usePathname()
    const router = useRouter()
    const searchParams = useSearchParams()
    const [expanded, setExpanded] = useQueryState('expanded')
    const [inputValue, setInputValue] = useState(searchParams.get('q') || '');
    const input = useRef<HTMLInputElement | null>(null)

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
        router.push(`/search?${formParams.toString()}`)
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
        <Link href="/" className="text-lg lg:min-w-[25svw] pt-1 font-serif sr-only lg:not-sr-only self-center lg:!px-4 uppercase no-underline">Stadnamnportalen</Link>   
        <div className="relative h-full flex w-full">
        <form action="/search" onSubmit={handleSubmit} className="flex w-full items-center gap-4 h-full">
        {isMobile ? <h1 className="sr-only">{datasetTitles[searchParams.get('dataset') || 'search']}</h1>
            : <h1 className="text-lg font-sans">
                <button type="button" onClick={() => setExpanded(prev => prev != 'options' ? 'options' : null)} className="flex gap-2 items-center border-neutral-300 flex-nowrap">
                {expanded == 'options' ? <PiCaretUp className="text-2xl inline text-primary-600"/> : <PiCaretDown className="text-2xl inline text-primary-600"/>}
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
            
            <button className="sr-only" type="submit">Søk</button>
        </form>

        { !isMobile && expanded == 'options' && <section aria-labelledby="doc-title" className="absolute top-12  right-0 w-full rounded-b-md border-t shadow-md h-fit border-2 border-neutral-200 bg-white overflow-y-auto max-h-[calc(100svh-6rem)] px-4">        
                    <Options isMobile={false}/>
                </section>
        }

        </div>
        
        </>
     : <Link href="/" className="text-md px-4 font-serif self-center uppercase no-underline">Stadnamnportalen</Link>
          
}