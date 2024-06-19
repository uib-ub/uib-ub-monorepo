

'use client'
import IconButton from '@/components/ui/icon-button';
import { PiArrowLeftBold, PiCaretDown, PiCaretUp, PiMagnifyingGlass } from 'react-icons/pi';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';

export default function SearchToggle() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const pathName = usePathname()
    const withoutSearch = new URLSearchParams(searchParams)
    withoutSearch.set("search", "hide")
    const withSearch = new URLSearchParams(searchParams)
    withSearch.set("search", "show")

    const expanded = pathName.startsWith('/view/') && searchParams.get('search') == 'show'
    


    return ( 
        <button className="btn btn-secondary ml-auto !px-2 md:!pr-4" 
                aria-expanded={expanded} 
                aria-controls="searchForm"
                onClick={() => expanded ? router.push(pathName + (withoutSearch && '?' + withoutSearch)) : pathName + "?" + withSearch}>
            {
                expanded ? <><PiCaretUp className='inline mr-2'/><span className="sr-only md:not-sr-only">Skjul søk</span></> 
                : <><PiCaretDown className='inline mr-2'/><span className="sr-only md:not-sr-only">Vis søk</span></>
            }
            <PiMagnifyingGlass className="text-lg inline md:hidden"/></button>
    )
    

}
