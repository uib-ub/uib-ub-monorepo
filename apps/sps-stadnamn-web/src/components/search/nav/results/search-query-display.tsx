'use client'
import ClickableIcon from "@/components/ui/clickable/clickable-icon"
import { useSessionStore } from "@/state/zustand/session-store"
import { useRouter, useSearchParams } from "next/navigation"
import { PiMagnifyingGlass, PiXBold } from "react-icons/pi"

export default function SearchQueryDisplay() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const searchQ = searchParams.get('q')
  const init = searchParams.get('init')
  const snappedPosition = useSessionStore((s) => s.snappedPosition)
  const setSnappedPosition = useSessionStore((s) => s.setSnappedPosition)

  const handleEdit = () => {
    const input = document.getElementById('search-input') as HTMLInputElement
    if (input) {
      input.focus()
      input.select()
    }

    // Change drawer position to bottom if it's middle
    if (snappedPosition === 'middle') {
      setSnappedPosition('bottom')
    }
  }

  // Check if query is single word (only letters) for fuzzy search toggle
  const isSingleWord = searchQ ? /^\p{L}+~?$/u.test(searchQ) : false
  const isFuzzy = searchQ?.includes('~') || false
  const queryWithoutTilde = searchQ?.replace(/~$/, '') || ''
  const fulltext = searchParams.get('fulltext')

  const handleFuzzyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newParams = new URLSearchParams(searchParams)
    if (e.target.checked) {
      newParams.set('q', queryWithoutTilde + '~')
    } else {
      newParams.set('q', queryWithoutTilde)
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
    <div className={`p-3 flex flex-col gap-2 border-t border-neutral-200 ${init ? 'bg-neutral-50' : ''}`}>
      <h2 className="flex items-center gap-2 text-neutral-950 text-xl cursor-pointer" onClick={handleEdit}>
        <PiMagnifyingGlass className="text-lg" aria-hidden="true" />
        <strong>{searchQ}</strong>
        <ClickableIcon label="Fjern søkeord" remove={['q']} className="ml-auto h-6 w-6 p-0 btn btn-outline rounded-full text-neutral-900">
          <PiXBold />
        </ClickableIcon>
      </h2>
      <div className="flex items-center gap-4 mt-1 text-sm">
        {isSingleWord && (
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={isFuzzy}
              onChange={handleFuzzyChange}
              className="h-3 w-3 xl:h-4 xl:w-4"
            />
            Omtrentleg
          </label>
        )}
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={!!fulltext}
            onChange={handleFulltextChange}
            className="h-3 w-3 xl:h-4 xl:w-4"
          />
          Fulltekst
        </label>
      </div>
    </div>
  )
}

