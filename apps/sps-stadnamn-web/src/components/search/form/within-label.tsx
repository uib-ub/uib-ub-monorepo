import { DocContext } from "@/app/doc-provider"
import { fieldConfig } from "@/config/search-config"
import { treeSettings } from "@/config/server-config"
import { useDataset } from "@/lib/search-params"
import { getValueByPath } from "@/lib/utils"
import { useParams } from "next/navigation"
import { useContext, useEffect } from "react"


export default function WithinLabel({within}: {within: string}) {
    const dataset = useDataset()

    const { parentData } = useContext(DocContext)

    const source = parentData?._source


    return <>{source && getValueByPath(source, treeSettings[dataset]?.subunit || 'cadastre.gnr')} {source?.label}</>

}