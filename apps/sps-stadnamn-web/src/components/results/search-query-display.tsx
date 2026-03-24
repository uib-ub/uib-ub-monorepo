'use client'
import ToggleButton from "@/components/ui/toggle-button"
import useResultCardData from "@/state/hooks/result-card-data"
import { useRouter, useSearchParams } from "next/navigation"
import { Label } from "@/components/ui/label"
import { TitleBadge } from "@/components/ui/badge"
import { useFulltextOn, useFuzzyOn, useInitParam, useNoGeoOn, useQParam, useSearchSortParam, useSourceViewOn, useMode } from "@/lib/param-hooks"

export default function SearchQueryDisplay({
  showNoLocationToggle = false,
  noGeoGroupCount = 0,
}: {
  showNoLocationToggle?: boolean
  noGeoGroupCount?: number
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const init = useInitParam()
  const { resultCardData: initResultCardData } = useResultCardData(init)
  const qParam = useQParam()
  const initHasCoordinates = initResultCardData?.fields?.location?.coordinates?.length >= 2
  const searchSort = useSearchSortParam()


  // Check if query is single word (only letters) for fuzzy search toggle
  const isSingleWord = qParam ? /^\p{L}+$/u.test(qParam) : false
  const fuzzyOn = useFuzzyOn()
  const fulltextOn = useFulltextOn()
  const noGeoOn = useNoGeoOn()
  const sourceViewOn = useSourceViewOn()
  const mode = useMode()

  return (
    <>
      {isSingleWord && (sourceViewOn || mode == 'table') && (
        <div className="flex items-center gap-2 text-sm h-9 px-3 rounded-md border border-neutral-200 bg-transparent">
          <input
            id="fuzzy-toggle"
            type="checkbox"
            checked={fuzzyOn}
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
          checked={fulltextOn}
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
            checked={noGeoOn}
            onChange={(e) => {
              const checked = e.target.checked
              const newParams = new URLSearchParams(searchParams)
              if (checked) {
                newParams.set('noGeo', 'on')
              } else {
                newParams.delete('noGeo')
              }
              router.push(`?${newParams.toString()}`)
            }}
            className="form-checkbox h-4 w-4 accent-accent-700"
          />
          <Label htmlFor="no-location-toggle">
            Utan koordinatar <TitleBadge count={noGeoGroupCount} className={`text-white bg-neutral-700 p-0.5 px-1 rounded-full`} />
          </Label>
        </div>
      )}

      {qParam && initHasCoordinates && init && fuzzyOn && !noGeoOn && (
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
    </>
  )
}

