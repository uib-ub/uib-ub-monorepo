'use client'

import { useSearchParams, useRouter } from "next/navigation"
import { ChangeEvent } from "react"
import { stringToBase64Url } from "@/lib/param-utils"
import useGroupData from "@/state/hooks/group-data"

export default function GroupedResultsToggle() {
    const searchParams = useSearchParams()
    const router = useRouter()

    const init = searchParams.get('init')
    const noGrouping = searchParams.get('noGrouping') === 'on'

    // Reuse the same init-based group lookup logic that the rest of the UI uses.
    const { groupData: initGroupData } = useGroupData(init)

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const checked = e.target.checked
        const newParams = new URLSearchParams(searchParams.toString())

        if (checked) {
            // Enable grouped view
            newParams.delete('noGrouping')
            if (init && initGroupData?.group?.id) {
                newParams.set('init', stringToBase64Url(initGroupData.group.id))
            }
        } else {
            // Disable grouped view (flat kjeldeoppslag)
            newParams.set('noGrouping', 'on')
            const initUuid = initGroupData?.fields?.["uuid"]?.[0]
            if (init && initUuid) {
                newParams.set('init', initUuid)
            }
        }

        router.push(`?${newParams.toString()}`)
    }

    return (
        <label className="inline-flex items-center gap-2 text-xs xl:text-sm text-neutral-900">
            <input
                type="checkbox"
                className="h-3 w-3 xl:h-4 xl:w-4"
                checked={!noGrouping}
                onChange={handleChange}
            />
            <span>Grupperte treff</span>
        </label>
    )
}

