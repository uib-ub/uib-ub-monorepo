'use client'
import { usePathname, useSearchParams, useRouter } from 'next/navigation'
export default function FulltextToggle() {
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const fulltext = searchParams.get('fulltext')
    const router = useRouter()
    return <div className="flex flex-wrap xl:px-3 gap-4"><label className="flex items-center h-14 gap-3 text-xl xl:text-lg">
    <input form="search-form"
           type="checkbox" 
           id="menu_navbar_checkbox" 
           name="fulltext" 
           className="h-3 w-3 xl:h-4 xl:w-4" 
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
<label className="flex items-center gap-3 h-14 text-xl xl:text-lg">
  <input type="checkbox" 
        name="datasetTag" value="deep"
        checked={searchParams.get('datasetTag') == 'deep'}
        className="h-3 w-3 xl:h-4 xl:w-4"
        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
          const newUrl = new URLSearchParams(searchParams);
          if (event.target.checked) {
            newUrl.set('datasetTag', 'deep');
          }
          else {
            newUrl.delete('datasetTag');
          }
          router.push(`?${newUrl.toString()}`);
        }}/>
  Djupinnsamlingar
</label>
</div>
}