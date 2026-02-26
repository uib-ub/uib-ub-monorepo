'use client'
import ClickableIcon from "@/components/ui/clickable/clickable-icon"
import ToggleButton from "@/components/ui/toggle-button"
import { stringToBase64Url } from "@/lib/param-utils"
import useGroupData from "@/state/hooks/group-data"
import { useSessionStore } from "@/state/zustand/session-store"
import { useRouter, useSearchParams } from "next/navigation"
import { PiMagnifyingGlass, PiXBold } from "react-icons/pi"

export default function SearchQueryDisplay() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const searchQ = searchParams.get('q')
  const init = searchParams.get('init')
  const { groupData: initGroupData } = useGroupData(init)
  const qParam = searchParams.get('q')
  const initHasCoordinates = !!initGroupData?.sources?.some((source: any) => source.location?.coordinates)
  const searchSort = searchParams.get('searchSort')


  // Check if query is single word (only letters) for fuzzy search toggle
  const isSingleWord = searchQ ? /^\p{L}+$/u.test(searchQ) : false
  const isFuzzy = searchParams.get('fuzzy') === 'on'
  const fulltext = searchParams.get('fulltext')

  const handleFuzzyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newParams = new URLSearchParams(searchParams)
    if (e.target.checked) {
      newParams.set('fuzzy', 'on')
    } else {
      newParams.delete('fuzzy')
    }
    router.push(`?${newParams.toString()}`)
  }

  const handleFulltextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newParams = new URLSearchParams(searchParams)
    if (e.target.checked) {
      newParams.set('fulltext', 'on')
    } else {
      newParams.delete('fulltext')
    }
    router.push(`?${newParams.toString()}`)
  }

  if (!searchQ) return null

  return (
    <section className={`p-3 flex flex-wrap gap-x-6 gap-y-3 items-center border-b border-neutral-200`} aria-labelledby="search-query-title">
      <div className="flex items-center gap-3 text-sm flex-wrap">
        {isSingleWord && (
          <label className="flex items-center gap-2 p-1">
            <input
              type="checkbox"
              checked={isFuzzy}
              onChange={handleFuzzyChange}
              className="h-3 w-3 xl:h-4 xl:w-4"
            />
            Omtrentleg
          </label>
        )}
        <label className="flex items-center gap-2 p-1">
          <input
            type="checkbox"
            checked={!!fulltext}
            onChange={handleFulltextChange}
            className="h-3 w-3 xl:h-4 xl:w-4"
          />
          Fulltekst
        </label>
        
        {qParam && initHasCoordinates && init && (
              <div
                className="ml-auto flex items-center gap-3 xl:gap-2 text-sm"
                role="radiogroup"
                aria-label="Sorter treff"
              >
                <ToggleButton
                  small
                  isSelected={!searchSort}
                  onClick={() => {
                    const newParams = new URLSearchParams(searchParams)
                    newParams.delete('searchSort')
                    router.push(`?${newParams.toString()}`)
                  }}
                  role="radio"
                  ariaChecked={!searchSort}
                >
                  Avstand
                </ToggleButton>
                <ToggleButton
                  small
                  isSelected={searchSort === 'similarity'}
                  onClick={() => {
                    const newParams = new URLSearchParams(searchParams)
                    newParams.set('searchSort', 'similarity')
                    router.push(`?${newParams.toString()}`)
                  }}
                  role="radio"
                  ariaChecked={searchSort === 'similarity'}
                >
                  Likskap
                </ToggleButton>
              </div>
            )}
      </div>
    </section>
  )
}

