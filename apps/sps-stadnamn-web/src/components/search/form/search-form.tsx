'use client'
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { PiCaretLeft, PiMagnifyingGlass, PiMapTrifold, PiX } from 'react-icons/pi';
import { datasetTitles } from '@/config/metadata-config';
import { useContext, useEffect, useRef, useState } from 'react';
import { useSearchQuery } from '@/lib/search-params';
import Form from 'next/form'
import Options from './options';
import { GlobalContext } from '@/app/global-provider';
import IconButton from '@/components/ui/icon-button';
import { usePerspective } from '@/lib/param-hooks';
import { useMode } from '@/lib/param-hooks';


export default function SearchForm() {
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const { isMobile, currentUrl, preferredTabs, inputValue } = useContext(GlobalContext)
    
    const input = useRef<HTMLInputElement | null>(null)
    const form = useRef<HTMLFormElement | null>(null)
    const perspective = usePerspective()

    const { facetFilters } = useSearchQuery()
    const mode = useMode()

    const [inputState, setInputState] = useState<string>('') // Ensure updates within the component
    

    const clearQuery = () => {
        inputValue.current = ''; 
        setInputState('')
        if (input.current) {
            input.current.value = '';
            input.current.focus();
            
        }
    }  

    useEffect(() => {
        if (input.current?.value && !isMobile) {
            input.current.select();
        }
    }, []);
    

    return pathname != '/' ? <>   
        <div className={`sr-only xl:not-sr-only flex !px-4  ${pathname=='/search' ? 'divide-primary-400 divide-x-2' : ''} gap-4 overflow-clip items-center content-center !w-[calc(25svw-0.5rem)]`}>
            <Link href="/" scroll={false} className="text-base font-serif uppercase no-underline">Stadnamnportalen</Link>
            
            { pathname == '/search' ?
            <h1 className="!text-lg text-neutral-800 px-3 truncate">{datasetTitles[perspective]}</h1>
            : !isMobile ? 
            <>{currentUrl.current ? 
            <Link scroll={false} href={currentUrl.current} className='text-lg flex !justify-self-start items-center gap-2 no-underline invisible lg:visible'><PiCaretLeft className="text-primary-600" aria-hidden="true"/>Tilbake til søket</Link>
        : <Link scroll={false} href="/search" className='text-lg flex !justify-self-start items-center gap-2 no-underline invisible lg:visible'><PiMapTrifold className="text-neutral-700" aria-hidden="true"/>Vis kartet</Link>
        }</> : null
            
            }
            </div>   
        <div className="h-full flex grow">

            <Form ref={form} action="/search" className="flex w-full h-full" onSubmit={() => {
                if (!input.current) return;
                if (isMobile) {
                    input.current.blur();
                }
                else {
                    input.current.select();
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
                defaultValue={searchParams.get('q') || inputValue.current || ''}
                autoFocus={true}
                onChange={(event) => {inputValue.current = event.target.value; setInputState(event.target.value)}} 
                className={`bg-transparent pr-4 pl-4 focus:outline-none flex w-full shrink text-lg xl:text-base`}
            />
            
            {searchParams.getAll('indexDataset')?.map((dataset, index) => <input type="hidden" key={index} name="indexDataset" value={dataset}/>)}
            {searchParams.get('datasetTag') && <input type="hidden" name="datasetTag" value={searchParams.get('datasetTag') || ''}/>}
            
            { inputState && 
            <IconButton  onClick={() => { clearQuery() }} 

                            // Replace results with filters if no facetFilters

                            label="Tøm søkefelt"><PiX className="text-3xl lg:text-xl text-neutral-600 group-focus-within:text-neutral-800 m-1"/></IconButton> }
            <button className="mr-1 p-1" type="submit" aria-label="Søk"> <PiMagnifyingGlass className="text-3xl lg:text-xl shrink-0 text-neutral-600 group-focus-within:text-neutral-800" aria-hidden="true"/></button>
            </div>
            <Options/>
            
            {searchParams.get('facet') && <input type="hidden" name="facet" value={searchParams.get('facet') || ''}/>}
            <input type="hidden" name="nav" value={ 'results'}/>
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
     
     </div>
     </>
          
}