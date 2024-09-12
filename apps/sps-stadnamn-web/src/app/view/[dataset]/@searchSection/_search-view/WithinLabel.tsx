import { contentSettings } from "@/config/server-config"
import { getValueByPath } from "@/lib/utils"
import { useParams } from "next/navigation"
import { useEffect, useState } from "react"


export default function WithinLabel({within}: {within: string}) {
    const params = useParams()

    const [source, setSource] = useState<any>(null)

    useEffect(() => {
        fetch(`/api/docs?dataset=${params.dataset}&docs=${within}`).then(response => response.json()).then(data => setSource(data.hits?.hits[0]?._source))

    }, [params.dataset, within])

    //return JSON.stringify(parentDoc)

    return <>Under {getValueByPath(source, contentSettings[params.dataset as string].tree?.subunit || 'cadastre.gnr')} {source?.label}</>

}