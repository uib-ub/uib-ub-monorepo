'use client'
import { PiCaretDown, PiCaretUp } from 'react-icons/pi';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';

export default function SearchToggle({children}: {children?: React.ReactNode}) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const pathName = usePathname()
    const withoutSearch = new URLSearchParams(searchParams)
    withoutSearch.set("search", "hide")
    const withSearch = new URLSearchParams(searchParams)
    withSearch.set("search", "show")

    const expanded = pathName.startsWith('/view/') && searchParams.get('search') == 'show'

    const toggleSearch = () => {
        if (expanded) {
            router.push(pathName + "?" + withoutSearch)
        } else {
            router.push(pathName + "?" + withSearch)
        }
    }
    


    return ( 
        <>
        <button aria-expanded={expanded} 
                aria-haspopup="true"
                aria-controls={expanded ? "collapsibleSearch" : undefined }
                className="xl:hidden py-2"
                onClick={toggleSearch}>
            {
                expanded ? <><PiCaretUp className='inline mr-2'/>{children}</> 
                : <><PiCaretDown className='inline mr-2'/>{children}</>
            }
            </button>
        <span className="hidden xl:inline">{children}</span>
        </>
    )
    

}
