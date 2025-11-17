'use client'
import { useMode } from '@/lib/param-hooks'
import { useSearchQuery } from '@/lib/search-params'
import { usePathname, useSearchParams, useRouter } from 'next/navigation'
export default function MiscOptions() {
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const fulltext = searchParams.get('fulltext')
    const mode = useMode()
    const { datasetFilters } = useSearchQuery()
    const router = useRouter()
    return <div className="flex flex-wrap gap-4 px-4 pb-6 pt-2">{false &&<label className="flex items-center gap-3 text-lg">
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
</label>}
<label className="flex gap-3 items-start text-lg">
  <input
    type="checkbox"
    name="datasetTag"
    value="deep"
    checked={searchParams.get('datasetTag') == 'deep'}
    className="mt-1 h-3 w-3 xl:h-4 xl:w-4"
    onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
      const newUrl = new URLSearchParams(searchParams);
      if (event.target.checked) {
        newUrl.set('datasetTag', 'deep');
      }
      else {
        newUrl.delete('datasetTag');
      }
      router.push(`?${newUrl.toString()}`);
    }}
  />
  <div className="flex flex-col">
    <span className="text-lg">Stadnamnsamlingar</span>
    <span className="text-sm text-neutral-700">
      Oppslagsverk og innsamla stadnamn
    </span>
  </div>
</label>
{mode == 'map' && (
  <label className="flex gap-3 items-start text-lg">
    <input
      type="checkbox"
      name="filterSources"
      value="on"
      checked={searchParams.get('filterSources') == 'on'}
      className="mt-1 h-3 w-3 xl:h-4 xl:w-4"
      onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
        const newUrl = new URLSearchParams(searchParams);
        if (event.target.checked) {
          newUrl.set('filterSources', 'on');
        } else {
          newUrl.delete('filterSources');
        }
        router.push(`?${newUrl.toString()}`);
      }}
    />
    <div className="flex flex-col">
      <span className="text-lg">Avgrens namnegruppene</span>
      <span className="text-sm text-neutral-700">Vis berre underoppslag som passar med søket</span>
    </div>
  </label>
)}

</div>
}