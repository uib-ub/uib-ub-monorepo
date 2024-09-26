'use client'
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { PiMagnifyingGlass, PiSliders } from 'react-icons/pi';
import SearchForm from './Form';




export default function DesktopFormSection({showLink = false}: {showLink?: boolean}) {
    const pathname = usePathname()
    
    
    return pathname == '/search' ? <>
        { showLink && <Link href="/" className="text-2xl pt-1 small-caps font-serif sr-only lg:not-sr-only self-center lg:!ml-4">Stadnamnportalen</Link>}
        <div className="flex h-full w-full lg:w-auto lg:ml-auto items-center">
        <Link href="" className="p-2 rounded-sm lg:justify-self-center"><PiSliders aria-hidden="true" className="text-3xl"/></Link>
        <SearchForm className="relative h-full grow lg:grow-0 lg:rounded-sm lg:my-1 lg:h-10 border-x-2 lg:border-2 border-neutral-200 focus-within:border-2 focus-within:border-neutral-500 box-content lg:box-border focus-within:rounded-sm">
            
            <input type="text" name="q" className="h-full pl-12 lg:pl-8 w-full focus:outline-none"/>
            <button className="sr-only" type="submit">Søk</button>
            <PiMagnifyingGlass className="absolute text-2xl left-3 top-3 lg:left-1 lg:top-1"/>
        </SearchForm>
        </div>
        </>
     : <Link href="/" className="text-2xl pt-1 small-caps font-serif self-center lg:!ml-4">Stadnamnportalen</Link>
          



}