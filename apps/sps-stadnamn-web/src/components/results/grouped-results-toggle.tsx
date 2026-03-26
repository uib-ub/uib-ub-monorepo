'use client'

import { useContext, useEffect, useRef } from "react"
import { GlobalContext } from "@/state/providers/global-provider"
import { PiArrowElbowLeftUpBold, PiCaretLeftBold, PiCaretRightBold, PiX } from "react-icons/pi"
import Clickable from "@/components/ui/clickable/clickable"
import { useInitParam, useSourceViewOn, useGroupParam, useCenterParam, useZoomParam, useQParam, usePointParam, useFulltextOn, useNoGeoOn } from "@/lib/param-hooks"
import ClickableIcon from "../ui/clickable/clickable-icon"
import { useSessionStore } from "@/state/zustand/session-store"

export default function GroupedResultsToggle() {
    const { scrollableContentRef } = useContext(GlobalContext)
    const init = useInitParam()
    const group = useGroupParam()
    const sourceViewOn = useSourceViewOn()
    const center = useCenterParam()
    const zoom = useZoomParam()
    const q = useQParam()
    const point = usePointParam()
    const fulltextOn = useFulltextOn()
    const noGeoOn = useNoGeoOn()
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

    const inGroupMode = !!group
    const roundedIconButtonClassName = "btn btn-neutral text-white rounded-md p-2 h-9 w-9"

    return (
        <div className="relative flex items-center gap-2 text-sm">
            {(group && sourceViewResetUrl) ? (
                <ClickableIcon
                    className={`absolute right-0 top-1/2 -translate-y-1/2 ${roundedIconButtonClassName}`}
                    href={sourceViewResetUrl}
                    onClick={handleCloseGroup}
                    label="Tilbake til gruppert søk"
                >
                    <PiArrowElbowLeftUpBold aria-hidden="true" className="text-2xl" />
                </ClickableIcon>
            ) : sourceViewOn ? (
                inGroupMode ? (
                    <ClickableIcon
                        className={`absolute right-0 top-1/2 -translate-y-1/2 ${roundedIconButtonClassName}`}
                        label="Tilbake til gruppert søk"
                        only={{ q, center, zoom, point, init: group, fulltext: fulltextOn ? 'on' : null, noGeo: noGeoOn ? 'on' : null }}
                    >
                        <PiArrowElbowLeftUpBold aria-hidden="true" className="text-xl" />
                    </ClickableIcon>
                ) : (
                    <Clickable className="flex items-center gap-2" only={{ q, center, zoom, point, init: group, noGeo: noGeoOn ? 'on' : null }}>
                        <PiCaretLeftBold aria-hidden="true" className="text-primary-700" />
                        Gruppert søk
                    </Clickable>
                )
            )
            :
            <Clickable className="flex items-center gap-2" add={{ sourceView: 'on'}}>
            Avansert søk <PiCaretRightBold aria-hidden="true" className="text-primary-700"/>
            </Clickable>

            }
        </div>
    )
}

