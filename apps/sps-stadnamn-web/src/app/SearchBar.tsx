
'use client'

import { usePathname, useSearchParams } from "next/navigation"
import { PiMagnifyingGlass, PiCaretDown } from 'react-icons/pi';

export default function SearchBar() {
    const pathname = usePathname()
    const searchParams = useSearchParams()
    if (pathname.slice(0, 7) != '/search') return (<></>)
    return (
        <div className="flex flex-wrap md:flex-nowrap gap-1">
        <button className="btn flex-grow">Hordanamn <PiCaretDown className="text-lg"/></button>
        <div className="flex gap-1 flex-grow min-h-[2rem]">
        <input type="text" form="search_form" name="q" defaultValue={searchParams.get('q') || ''} className='border border-neutral-500 w-full rounded-sm px-2'/>
        <button type="submit" form="search_form" className='btn btn-primary p-1 px-3 text-lg'><PiMagnifyingGlass className="text-lg"/></button>
        </div>
        </div>
    )

}

