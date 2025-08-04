import { DocContext } from "@/app/doc-provider"
import { fieldConfig } from "@/config/search-config"
import { treeSettings } from "@/config/server-config"
import { usePerspective } from "@/lib/search-params"
import { getValueByPath } from "@/lib/utils"
import { useParams } from "next/navigation"
import { useContext } from "react"


export default function WithinLabel() {
    const perspective = usePerspective()

    const { parentData } = useContext(DocContext)

    const source = parentData?._source


    return <>{source && getValueByPath(source, treeSettings[perspective]?.subunit || 'cadastre.gnr')} {source?.label}</>

}