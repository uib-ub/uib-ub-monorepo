import { GlobalContext } from "@/app/global-provider"
import { GroupContext } from "@/app/group-provider"
import Clickable from "@/components/ui/clickable/clickable"
import IconButton from "@/components/ui/icon-button"
import { datasetTitles } from "@/config/metadata-config"
import { useSearchParams } from "next/navigation"
import { useContext } from "react"
import SourceItem from "@/components/children/source-item"

export default function GroupDetails() {
    const searchParams = useSearchParams()
    const { groupData, groupLoading } = useContext(GroupContext)

    // Group the data by dataset
    const groupedByDataset = groupData?.reduce((acc, group) => {
        const datasetId = group._index.split('-')[2]
        if (!acc[datasetId]) {
            acc[datasetId] = []
        }
        acc[datasetId].push(group)
        return acc
    }, {} as Record<string, typeof groupData>)

    return <div className={` ${groupLoading ? 'opacity-50' : ''}`}>
        <ul className="">
        {groupedByDataset && Object.entries(groupedByDataset).map(([datasetId, groups]) => (
            <li key={datasetId} className="mb-6">
                <div className="text-neutral-800 uppercase font-semibold tracking-wider text-sm">
                    {datasetTitles[datasetId]}
                </div>
                <ul className="flex flex-col divide-y divide-neutral-200 border-y border-neutral-200">
                    {(groups as typeof groupData)?.map((group) => (
                        <SourceItem key={group._id} hit={group} isMobile={false}/>
                    ))}
                </ul>
            </li>
        ))}
        </ul>
    </div>
}