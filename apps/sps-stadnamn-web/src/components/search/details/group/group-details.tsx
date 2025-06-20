import { GroupContext } from "@/app/group-provider"
import { base64UrlToString } from "@/lib/utils"
import { useSearchParams } from "next/navigation"
import { useContext } from "react"



export default function GroupDetails() {
    const { groupData, groupTotal } = useContext(GroupContext)
    const searchParams = useSearchParams()
    const group = searchParams.get('group')
    const [groupType, groupId, groupLabel] = base64UrlToString(group || '').split('_') || []


    return <div>
        <h2 className="text-xl font-serif">{groupLabel} <span className="text-sm rounded-full bg-neutral-100 text-neutral-950 text-sm px-2.5 py-1 font-sans">{groupTotal?.value}</span></h2>
        <ul className="flex flex-col gap-2">
            {groupData?.map((doc) => (
                <li key={doc._id} className="flex flex-col gap-1">
                    <span className="">{doc._index.split('-')[2]}</span>
                </li>
            ))}
        </ul>
        {JSON.stringify(groupData)}
    </div>
}