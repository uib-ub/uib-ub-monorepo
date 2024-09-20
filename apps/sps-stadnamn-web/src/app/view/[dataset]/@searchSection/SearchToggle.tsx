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

    const expanded = pathName.startsWith('/view/') && searchParams.get('search') == 'show' || !searchParams.get('search')

    const toggleSearch = () => {
        if (expanded) {
            router.push(pathName + "?" + withoutSearch)
        } else {
            router.push(pathName + "?" + withSearch)
        }
    }
    

    // Temporary workaround in case someone shares a mobile link with a desktop user
    return searchParams.get('search') ? ( 
        <>
        <button aria-expanded={expanded} 
                aria-haspopup="true"
                aria-controls={expanded ? "collapsibleView" : undefined }
                className="py-2 xl:py-0"
                onClick={toggleSearch}>
            {
                expanded ? <><PiCaretUp className='inline mr-2'/>{children}</> 
                : <><PiCaretDown className='inline mr-2'/>{children}</>
            }
            </button>
        </>
    )
    : ( 
        <>
        <button aria-expanded={expanded} 
                aria-haspopup="true"
                aria-controls={expanded ? "collapsibleView" : undefined }
                className="py-2 xl:py-0 xl:hidden"
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
