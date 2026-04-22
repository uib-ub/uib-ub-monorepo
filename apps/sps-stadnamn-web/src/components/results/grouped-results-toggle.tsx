'use client'

import { useContext, useEffect, useRef } from "react"
import { GlobalContext } from "@/state/providers/global-provider"
import { PiArrowLeftBold, PiArrowRightBold, PiCaretLeftBold, PiCaretRightBold } from "react-icons/pi"
import Clickable from "@/components/ui/clickable/clickable"
import { useInitParam, useSourceViewOn, useGroupParam, useCenterParam, useZoomParam, useQParam, usePointParam, useFulltextOn, useNoGeoOn } from "@/lib/param-hooks"
import useResultCardData from "@/state/hooks/result-card-data"
import { stringToBase64Url } from "@/lib/param-utils"

export default function GroupedResultsToggle() {
    const { scrollableContentRef } = useContext(GlobalContext)
    const init = useInitParam()
    const { resultCardData: initResultCardData } = useResultCardData(init)
    const group = useGroupParam()
    const sourceViewOn = useSourceViewOn()
    const center = useCenterParam()
    const zoom = useZoomParam()
    const q = useQParam()
    const point = usePointParam()
    const fulltextOn = useFulltextOn()
    const noGeoOn = useNoGeoOn()
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

    

    const inGroupMode = !!group

    return (
        <div className="relative flex items-center gap-2 text-sm">
            {sourceViewOn ? (
                inGroupMode ? null : (
                    <Clickable className="flex items-center gap-2" only={{ q, center, zoom, point, noGeo: noGeoOn ? 'on' : null }}>
                        <PiArrowLeftBold aria-hidden="true" className="text-primary-700" />
                        Gruppert søk
                    </Clickable>
                    
                )
            )
            :
            <Clickable className="flex items-center gap-2" add={{ sourceView: 'on'}}>
            Avansert søk <PiArrowRightBold aria-hidden="true" className="text-primary-700"/>
            </Clickable>

            }
        </div>
    )
}

