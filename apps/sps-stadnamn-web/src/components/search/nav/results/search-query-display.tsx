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
import { Badge, FacetBadge, TitleBadge } from "@/components/ui/badge"

export default function SearchQueryDisplay({
  showNoLocationToggle = false,
  noLocationGroupCount = 0,
}: {
  showNoLocationToggle?: boolean
  noLocationGroupCount?: number
}) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const searchQ = searchParams.get('q')
  const init = searchParams.get('init')
  const { groupData: initGroupData } = useGroupData(init)
  const qParam = searchParams.get('q')
  const initHasCoordinates = initGroupData?.fields?.location?.coordinates?.length >= 2
  const searchSort = searchParams.get('searchSort')


  // Check if query is single word (only letters) for fuzzy search toggle
  const isSingleWord = searchQ ? /^\p{L}+$/u.test(searchQ) : false
  const isFuzzy = searchParams.get('fuzzy') === 'on'
  const fulltext = searchParams.get('fulltext')
  const showNoLocation = searchParams.get('showNoLocation') === 'on'

  const initSearchLabel = initGroupData?.label
  const expandedMaxResultsParam = searchParams.get('maxResults') || defaultMaxResultsParam

  return (
    <>
      {isSingleWord && (
        <div className="flex items-center gap-2 text-sm h-9 px-3 rounded-md border border-neutral-200 bg-transparent">
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

      <div className="flex items-center gap-2 text-sm h-9 px-3 rounded-md border border-neutral-200 bg-transparent">
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

      {showNoLocationToggle && (
        <div className="flex items-center gap-2 text-sm h-9 px-3 rounded-md border border-neutral-200 bg-transparent">
          <input
            id="no-location-toggle"
            type="checkbox"
            checked={showNoLocation}
            onChange={(e) => {
              const checked = e.target.checked
              const newParams = new URLSearchParams(searchParams)
              if (checked) {
                newParams.set('showNoLocation', 'on')
              } else {
                newParams.delete('showNoLocation')
              }
              router.push(`?${newParams.toString()}`)
            }}
            className="form-checkbox h-4 w-4 accent-accent-700"
          />
          <Label htmlFor="no-location-toggle">
            Utan koordinatar <TitleBadge count={noLocationGroupCount} className={`${showNoLocation ? 'bg-neutral-700 text-white p-0.5 px-1 rounded-full' : 'text-white bg-primary-700 p-0.5 px-1 rounded-full'}`} />
          </Label>
        </div>
      )}

      {qParam && initHasCoordinates && init && isFuzzy && (
        <div
          className="flex items-center gap-2 ml-auto flex-wrap text-sm"
          role="radiogroup"
          aria-label="Sorter treff"
        >
          <ToggleButton
            small
            isSelected={!searchSort}
            onClick={() => {
              const newParams = new URLSearchParams(searchParams)
              newParams.set('maxResults', defaultMaxResultsParam)
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
              newParams.set('maxResults', defaultMaxResultsParam)
              router.push(`?${newParams.toString()}`)
            }}
            role="radio"
            ariaChecked={searchSort === 'similarity'}
          >
            Likskap
          </ToggleButton>
        </div>
      )}
    </>
  )
}

