
'use client'

import { usePathname, useSearchParams } from "next/navigation"
import { PiMagnifyingGlass, PiCaretDownFill } from 'react-icons/pi';
import IconButton from "@/components/ui/icon-button";

export default function SearchBar() {
    const pathname = usePathname()
    const searchParams = useSearchParams()
    if (pathname.slice(0, 7) != '/search') return (<></>)
    return (
        <div className="flex flex-wrap lg:flex-nowrap gap-1">
        <button className="btn flex-grow">Hordanamn <PiCaretDownFill className="text-lg"/></button>
        <div className="flex gap-1 flex-grow min-h-[2rem]">
        <input type="text" form="search_form" name="q" defaultValue={searchParams.get('q') || ''} className='border border-neutral-500 w-full rounded-sm px-2'/>
        <IconButton type="submit" form="search_form" label="Søk" className='btn btn-primary text-lg'><PiMagnifyingGlass className="text-lg"/></IconButton>
        </div>
        </div>
    )

}

