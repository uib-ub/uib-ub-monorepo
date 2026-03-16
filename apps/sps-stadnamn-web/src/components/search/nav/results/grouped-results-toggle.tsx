'use client'

import { useContext, useEffect, useRef } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { stringToBase64Url } from "@/lib/param-utils"
import ToggleButton from "@/components/ui/toggle-button"
import { GlobalContext } from "@/state/providers/global-provider"
import { PiBookOpen, PiCaretLeft, PiCaretLeftBold, PiCaretRightBold, PiSignpost } from "react-icons/pi"
import Clickable from "@/components/ui/clickable/clickable"
import { defaultMaxResultsParam } from "@/config/max-results"

export default function GroupedResultsToggle() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const { scrollableContentRef, isMobile } = useContext(GlobalContext)
    const maxResults = searchParams.get('maxResults')

    const init = searchParams.get('init')
    const group = searchParams.get('group')
    const sourceView = searchParams.get('sourceView') === 'on'
    const isGrouped = !sourceView
    const center = searchParams.get('center')
    const zoom = searchParams.get('zoom')
    const q = searchParams.get('q')
    const point = searchParams.get('point')
    // Track previous mode so we only scroll when it actually changes
    const previousNoGroupingRef = useRef(sourceView)

    useEffect(() => {
        if (previousNoGroupingRef.current === sourceView) {
            // First run or no change – just sync the value
            previousNoGroupingRef.current = sourceView
            return
        }

        previousNoGroupingRef.current = sourceView

        if (scrollableContentRef.current) {
            scrollableContentRef.current.scrollTo({
                top: 0,
                behavior: 'auto',
            })
        }
    }, [sourceView, scrollableContentRef])



    const toggleGrouping = (enableGrouping: boolean) => {
        const newParams = new URLSearchParams(searchParams.toString())
        newParams.delete('init')
        newParams.delete('activePoint')

        if (enableGrouping) {
            // Enable grouped view ("Namnegrupper")
            newParams.delete('sourceView')
        } else {
            // Disable grouped view ("Kjeldeoppslag")
            newParams.set('sourceView', 'on')

        }

        router.push(`?${newParams.toString()}`)
    }
    

    return (
        <div className="flex items-center gap-2 text-sm text-neutral-900">
            { sourceView ? <Clickable className="flex items-center gap-2" only={{ q, center, zoom, group: null, maxResults, init, point}}>
            <PiCaretLeftBold aria-hidden="true" className="text-primary-700"/>{(group && group == init) ? 'Gruppe' : 'Gruppert søk'}
            
            </Clickable>
            :
<Clickable className="flex items-center gap-2" add={{ sourceView: 'on', maxResults: defaultMaxResultsParam }}>
Avansert søk <PiCaretRightBold aria-hidden="true" className="text-primary-700"/>
</Clickable>

            }
        </div>
    )
}

