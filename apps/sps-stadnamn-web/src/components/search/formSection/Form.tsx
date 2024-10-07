'use client'
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { PiDatabase, PiDotsThreeVertical, PiMagnifyingGlass } from 'react-icons/pi';

import { useRouter } from 'next/navigation';
import { useQueryState } from 'nuqs';
import Options from '../Options';


export default function Form({isMobile}: {isMobile?: boolean}) {
    const pathname = usePathname()
    const router = useRouter()
    const searchParams = useSearchParams()
    const [expanded, setExpanded] = useQueryState('expanded')

    const handleSubmit = async (event: any) => {
        event.preventDefault()
        const q = event.target.q.value
        router.push(`/search?q=${q}&dataset=tot`)
    }
    
    
    return pathname == '/search' ? <>    
        <Link href="/" className="text-lg lg:min-w-[25svw] pt-1 font-serif sr-only lg:not-sr-only self-center lg:!px-4 uppercase">Stadnamnportalen</Link>   
        <div className="relative h-full flex w-full">
        <form action="/search" onSubmit={handleSubmit} className="flex w-full items-center shrink bg-white px-2 border-x-2 border-neutral-200 group">
  
            
            <PiMagnifyingGlass className="text-2xl shrink-0 ml-1 text-neutral-400 group-focus-within:text-neutral-900"/>
            <input type="text" name="q" className="px-4 bg-transparent focus:outline-none flex w-full shrink"/>
            
            
            <input type="hidden"   
                   name="dataset" 
                   value={searchParams.get('dataset') || 'search'}/>
            
            {!isMobile && <button type="button" onClick={() => setExpanded(prev => prev != 'options' ? 'options' : null)} className="flex border-l pl-4 items-center border-neutral-300 flex-nowrap">
            <span className="whitespace-nowrap max-w-[20svw] truncate">{datasetTitles[searchParams.get('dataset') || 'search']}</span>
            <PiDotsThreeVertical className="text-2xl inline text-neutral-800"/>
            
            
            </button>}
            
            <button className="sr-only" type="submit">Søk</button>

        </form>

        { !isMobile && expanded == 'options' && <section aria-labelledby="doc-title" className="absolute top-12  right-0 w-full rounded-b-md border-t shadow-md h-fit border-2 border-neutral-200 bg-white overflow-y-auto max-h-[calc(100svh-6rem)] px-4">
                    
                    <Options isMobile={false}/>
                </section>

        }

        </div>
        </>
     : <Link href="/" className="text-md px-4 font-serif self-center uppercase">Stadnamnportalen</Link>
          



}