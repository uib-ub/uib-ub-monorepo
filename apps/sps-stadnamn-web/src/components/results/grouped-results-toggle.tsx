'use client'

import { useContext, useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { GlobalContext } from "@/state/providers/global-provider"
import { PiCaretLeftBold, PiCaretRightBold, PiX } from "react-icons/pi"
import Clickable from "@/components/ui/clickable/clickable"
import { useInitParam, useSourceViewOn, useGroupParam, useCenterParam, useZoomParam, useQParam, usePointParam } from "@/lib/param-hooks"
import ClickableIcon from "../ui/clickable/clickable-icon"
import { useSessionStore } from "@/state/zustand/session-store"
import DynamicClickable from "../ui/clickable/dynamic-clickable"

export default function GroupedResultsToggle() {
    const { scrollableContentRef } = useContext(GlobalContext)
    const router = useRouter()
    const searchParams = useSearchParams()
    const init = useInitParam()
    const group = useGroupParam()
    const sourceViewOn = useSourceViewOn()
    const center = useCenterParam()
    const zoom = useZoomParam()
    const q = useQParam()
    const point = usePointParam()
    const sourceViewResetUrl = useSessionStore((s) => s.sourceViewResetUrl)
    const clearSourceViewResetUrl = useSessionStore((s) => s.clearSourceViewResetUrl)
    // Track previous mode so we only scroll when it actually changes
    const previousNoGroupingRef = useRef(sourceViewOn)

    useEffect(() => {
        if (previousNoGroupingRef.current === sourceViewOn) {
            // First run or no change – just sync the value
            previousNoGroupingRef.current = sourceViewOn
            return
        }

        previousNoGroupingRef.current = sourceViewOn

        if (scrollableContentRef.current) {
            scrollableContentRef.current.scrollTo({
                top: 0,
                behavior: 'auto',
            })
        }
    }, [sourceViewOn, scrollableContentRef])

    

    const handleCloseGroup = () => {
        if (sourceViewResetUrl) {
            clearSourceViewResetUrl()
        }
    }

    return (
        <div className="flex items-center gap-2 text-sm text-neutral-900">
            {(group && sourceViewResetUrl) ? <Clickable className="flex items-center gap-2" href={sourceViewResetUrl} onClick={handleCloseGroup}>
                <PiCaretLeftBold aria-hidden="true" className="text-primary-700"/>
                Tilbake
            </Clickable> :  sourceViewOn ? <Clickable className="flex items-center gap-2" only={{ q, center, zoom, point, init: group}}>
            <PiCaretLeftBold aria-hidden="true" className="text-primary-700"/>{(group && group == init) ? 'Gruppe' : 'Gruppert søk'}
            
            </Clickable>
            :
            <Clickable className="flex items-center gap-2" add={{ sourceView: 'on'}}>
            Avansert søk <PiCaretRightBold aria-hidden="true" className="text-primary-700"/>
            </Clickable>

            }
        </div>
    )
}

