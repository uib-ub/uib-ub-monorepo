'use client'
import { usePathname, useSearchParams, useRouter } from 'next/navigation'
export default function FulltextToggle() {
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const fulltext = searchParams.get('fulltext')
    const router = useRouter()
    return <label className="flex items-center gap-3 my-3 text-2xl xl:text-lg self-center px-4">
    <input form="search-form"
           type="checkbox" 
           id="menu_navbar_checkbox" 
           name="fulltext" 
           className="h-6 w-6 xl:h-4 xl:w-4" 
           checked={pathname == '/search' ? !!fulltext : undefined}

           onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              if (pathname == '/search') {
                const newUrl = new URLSearchParams(searchParams);
                
                if (event.target.checked) {
                    newUrl.set('fulltext', 'on');
                }
                else {
                    newUrl.delete('fulltext');
                }
                router.push(`?${newUrl.toString()}`);
              }

            }} />
    Fulltekstsøk
</label>
}