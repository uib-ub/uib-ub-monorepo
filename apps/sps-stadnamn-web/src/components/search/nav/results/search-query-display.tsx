'use client'
import ClickableIcon from "@/components/ui/clickable/clickable-icon"
import ToggleButton from "@/components/ui/toggle-button"
import { stringToBase64Url } from "@/lib/param-utils"
import useGroupData from "@/state/hooks/group-data"
import { useSessionStore } from "@/state/zustand/session-store"
import { useRouter, useSearchParams } from "next/navigation"
import { PiCaretRightBold, PiMagnifyingGlass, PiXBold } from "react-icons/pi"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import Clickable from "@/components/ui/clickable/clickable"
import { defaultMaxResultsParam } from "@/config/max-results"

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

  const initSearchLabel = initGroupData?.group?.label
  const expandedMaxResultsParam = searchParams.get('maxResults') || defaultMaxResultsParam

  return (
    <section id="search-settings" className={`p-3 flex flex-wrap gap-x-6 gap-y-3 items-center border-b border-neutral-200 bg-neutral-50`} aria-labelledby="search-query-title">
      <div className="flex items-center gap-3 text-sm flex-wrap">
        {isSingleWord && (
          <div className="flex items-center gap-2 p-1">
            <input
              id="fuzzy-toggle"
              type="checkbox"
              checked={isFuzzy}
              onChange={(e) => {
                const checked = e.target.checked;
                const newParams = new URLSearchParams(searchParams)
                if (checked) {
                  newParams.set('fuzzy', 'on')
                } else {
                  newParams.delete('fuzzy')
                }
                router.push(`?${newParams.toString()}`)
              }}
              className="form-checkbox h-4 w-4 accent-accent-700"
            />
            <Label htmlFor="fuzzy-toggle">Omtrentleg</Label>
          </div>
        )}
        <div className="flex items-center gap-2 p-1">
          <input
            id="fulltext-toggle"
            type="checkbox"
            checked={!!fulltext}
            onChange={(e) => {
              const checked = e.target.checked;
              const newParams = new URLSearchParams(searchParams)
              if (checked) {
                newParams.set('fulltext', 'on')
              } else {
                newParams.delete('fulltext')
              }
              router.push(`?${newParams.toString()}`)
            }}
            className="form-checkbox h-4 w-4 accent-accent-700"
          />
          <Label htmlFor="fulltext-toggle">Fulltekst</Label>
        </div>
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
          
          {qParam != initSearchLabel && init && (
            <Clickable
              link
              add={{ q: initSearchLabel, maxResults: expandedMaxResultsParam }}
              className="ml-auto rounded-md flex items-center gap-1 cursor-pointer no-underline max-w-full min-w-0"
            >
              <PiMagnifyingGlass aria-hidden="true" className="flex-shrink-0" />
              <span className="ml-1 truncate flex-1 min-w-0">
                {initSearchLabel}
              </span>

            </Clickable>
          )}
        
    </section>
  )
}

