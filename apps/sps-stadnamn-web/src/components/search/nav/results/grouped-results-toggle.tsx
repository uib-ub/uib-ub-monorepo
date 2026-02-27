'use client'

import { useContext, useEffect, useRef } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { stringToBase64Url } from "@/lib/param-utils"
import useGroupData from "@/state/hooks/group-data"
import ToggleButton from "@/components/ui/toggle-button"
import { GlobalContext } from "@/state/providers/global-provider"
import { PiBookOpen, PiSignpost, PiTreeView } from "react-icons/pi"

export default function GroupedResultsToggle() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const { scrollableContentRef, isMobile } = useContext(GlobalContext)

    const init = searchParams.get('init')
    const noGrouping = searchParams.get('noGrouping') === 'on'
    const isGrouped = !noGrouping


    // Track previous mode so we only scroll when it actually changes
    const previousNoGroupingRef = useRef(noGrouping)

    useEffect(() => {
        if (previousNoGroupingRef.current === noGrouping) {
            // First run or no change – just sync the value
            previousNoGroupingRef.current = noGrouping
            return
        }

        previousNoGroupingRef.current = noGrouping

        if (scrollableContentRef.current) {
            scrollableContentRef.current.scrollTo({
                top: 0,
                behavior: 'auto',
            })
        }
    }, [noGrouping, scrollableContentRef])

    // Reuse the same init-based group lookup logic that the rest of the UI uses.
    const { groupData: initGroupData } = useGroupData(init)

    const handleToggle = (enableGrouping: boolean) => {
        const newParams = new URLSearchParams(searchParams.toString())

        if (enableGrouping) {
            // Enable grouped view ("Namnegrupper")
            newParams.delete('noGrouping')
            if (init && initGroupData?.group?.id) {
                newParams.set('init', stringToBase64Url(initGroupData.group.id))
            }
        } else {
            // Disable grouped view ("Kjeldeoppslag")
            newParams.set('noGrouping', 'on')
            const initUuid = initGroupData?.fields?.["uuid"]?.[0]
            if (init && initUuid) {
                newParams.set('init', initUuid)
            }
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
                    onClick={() => handleToggle(true)}
                    small
                >
                    <span className={!isMobile ? "sr-only 2xl:not-sr-only" : ""}>Namnegrupper</span>{!isMobile && <PiSignpost className="2xl:hidden" aria-hidden="true" />}
                </ToggleButton>
                <ToggleButton
                    isSelected={!isGrouped}
                    role="radio"
                    ariaChecked={!isGrouped}
                    onClick={() => handleToggle(false)}
                    small
                >
                    <span className={!isMobile ? "sr-only 2xl:not-sr-only" : ""}>Kjeldeoppslag</span>{!isMobile && <PiBookOpen className="2xl:hidden" aria-hidden="true" />}
                </ToggleButton>
            </div>
        </div>
    )
}

