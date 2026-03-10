'use client'

import { useContext, useEffect, useRef } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { stringToBase64Url } from "@/lib/param-utils"
import useInitData from "@/state/hooks/init-data"
import ToggleButton from "@/components/ui/toggle-button"
import { GlobalContext } from "@/state/providers/global-provider"
import { PiBookOpen, PiSignpost } from "react-icons/pi"

export default function GroupedResultsToggle() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const { scrollableContentRef, isMobile } = useContext(GlobalContext)

    const init = searchParams.get('init')
    const sourceView = searchParams.get('sourceView') === 'on'
    const isGrouped = !sourceView


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

    const { groupedInitId, sourceViewInitUuid } = useInitData()

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
        <div className="flex items-center gap-2 text-xs xl:text-sm text-neutral-900">
            <span className="sr-only">Visningsmodus for treff</span>
            <div className="flex-wrap inline-flex gap-2" role="radiogroup" aria-label="Visningsmodus for treff">
                <ToggleButton
                    isSelected={isGrouped}
                    role="radio"
                    ariaChecked={isGrouped}
                    onClick={() => toggleGrouping(true)}
                    small
                >
                    <span className={!isMobile ? "sr-only 2xl:not-sr-only" : ""}>Namnegrupper</span>{!isMobile && <PiSignpost className="2xl:hidden" aria-hidden="true" />}
                </ToggleButton>
                <ToggleButton
                    isSelected={!isGrouped}
                    role="radio"
                    ariaChecked={!isGrouped}
                    onClick={() => toggleGrouping(false)}
                    small
                >
                    <span className={!isMobile ? "sr-only 2xl:not-sr-only" : ""}>Kjeldeoppslag</span>{!isMobile && <PiBookOpen className="2xl:hidden" aria-hidden="true" />}
                </ToggleButton>
            </div>
        </div>
    )
}

