import useTableData from "@/state/hooks/table-data"
import { useQuery } from "@tanstack/react-query"
import { useSearchParams } from "next/navigation"
import Clickable from "../../ui/clickable/clickable"
import { formatNumber } from "@/lib/utils"
import { treeSettings } from "@/config/server-config"
import { datasetTitles } from '@/config/metadata-config'

const getTreeData = async (dataset: string, adm1?: string, adm2?: string) => {
    const params = new URLSearchParams()
    if (adm1) params.set('adm1', adm1)
    if (adm2) params.set('adm2', adm2)
    params.set('dataset', dataset)

    const res = await fetch(`/api/tree?${params.toString()}`)
    const data = await res.json()
    return data
}

export default function TreeWindow() {
    const searchParams = useSearchParams()
    const adm1 = searchParams.get('adm1')
    const adm2 = searchParams.get('adm2')
    const dataset = searchParams.get('dataset')
    
    const { data: treeData } = useQuery({
        queryKey: ['treeData', dataset, adm1, adm2],
        queryFn: () => getTreeData(dataset, adm1, adm2),
        enabled: !!dataset
    })

    if (!dataset || !treeData?.hits?.hits) {
        return <div className="p-4 text-neutral-600">Laster...</div>
    }

    const settings = treeSettings[dataset]

    return (
        <>
            <div className="flex p-2 border-b border-neutral-200">
                <h2 className="text-neutral-900 text-xl px-2">
                    {adm2 ? adm2 : adm1 ? adm1 : datasetTitles[dataset]}
                </h2>
            </div>
            <div className="overflow-y-auto stable-scrollbar max-h-[calc(100svh-7rem)] 2xl:max-h-[calc(100svh-8.5rem)]">
                <ul className="list-none divide-y divide-neutral-200">
                    {treeData.hits.hits.map((item: any) => {
                        const fields = item.fields

                        // If we're at adm2 level, show the farm names with gnr
                        if (adm2) {
                            const gnr = fields[settings.subunit.replace('__', '.')]?.[0]
                            const farmName = fields[settings.parentName]?.[0]
                            return (
                                <li key={item._id}>
                                    <Clickable
                                        link
                                        add={{ doc: fields.within?.[0] }}
                                        className="flex items-center justify-between p-3 hover:bg-neutral-50 focus:bg-neutral-50 transition-colors no-underline w-full"
                                    >
                                        <span className="flex-1 text-neutral-900">
                                            {farmName} {gnr && `(${gnr})`}
                                        </span>
                                    </Clickable>
                                </li>
                            )
                        }

                        // If we're at adm1 level, show municipality numbers and farm names
                        if (adm1) {
                            const municipalityNumber = fields[settings.aggSort]?.[0]
                            const farmName = fields[settings.parentName]?.[0]
                            return (
                                <li key={item._id}>
                                    <Clickable
                                        link
                                        add={{ adm2: fields.adm2?.[0] }}
                                        className="flex items-center justify-between p-3 hover:bg-neutral-50 focus:bg-neutral-50 transition-colors no-underline w-full"
                                    >
                                        <span className="flex-1 text-neutral-900">
                                            {settings.showNumber ? `${municipalityNumber} ` : ''}{farmName}
                                        </span>
                                    </Clickable>
                                </li>
                            )
                        }

                        // At dataset level, show counties with their numbers
                        const countyName = fields.adm1?.[0]
                        const municipalityNumber = fields[settings.aggSort]?.[0]
                        const countyNumber = municipalityNumber?.substring(0, 2)
                        
                        return (
                            <li key={item._id}>
                                <Clickable
                                    link
                                    add={{ adm1: countyName }}
                                    className="flex items-center justify-between p-3 hover:bg-neutral-50 focus:bg-neutral-50 transition-colors no-underline w-full"
                                >
                                    <span className="flex-1 text-neutral-900">
                                        {settings.showNumber ? `${countyNumber} ` : ''}{countyName}
                                    </span>
                                </Clickable>
                            </li>
                        )
                    })}
                </ul>
            </div>
        </>
    )
}