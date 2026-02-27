'use client'

import { useSearchParams, useRouter } from "next/navigation"
import { stringToBase64Url } from "@/lib/param-utils"
import useGroupData from "@/state/hooks/group-data"
import ToggleButton from "@/components/ui/toggle-button"

export default function GroupedResultsToggle() {
    const searchParams = useSearchParams()
    const router = useRouter()

    const init = searchParams.get('init')
    const noGrouping = searchParams.get('noGrouping') === 'on'
    const isGrouped = !noGrouping

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
            <div className="inline-flex gap-2" role="radiogroup" aria-label="Visningsmodus for treff">
                <ToggleButton
                    isSelected={isGrouped}
                    role="radio"
                    ariaChecked={isGrouped}
                    onClick={() => handleToggle(true)}
                    small
                >
                    Namnegrupper
                </ToggleButton>
                <ToggleButton
                    isSelected={!isGrouped}
                    role="radio"
                    ariaChecked={!isGrouped}
                    onClick={() => handleToggle(false)}
                    small
                >
                    Kjeldeoppslag
                </ToggleButton>
            </div>
        </div>
    )
}

