
import Image from "next/image"
import { useEffect, useState } from "react"

export default function ClientThumbnail({ manifestId }: { manifestId: string }) {
    const [thumbnailUrl, setThumbnaiUrl] = useState<string | null>(null)

    useEffect(() => {

        fetch(`https://iiif.test.ubbe.no/iiif/manifest/${manifestId}.json`).then(res => res.json()).then(data => {
            setThumbnaiUrl(data?.thumbnail?.[0]?.id)
        }).catch(() => {
            fetch(`https://iiif.test.ubbe.no/iiif/manifest/stadnamn/NBAS/${manifestId}.json`).then(res => res.json()).then(data => {
                setThumbnaiUrl(data?.thumbnail?.[0]?.id)
            })
        })

    }, [manifestId])




    return thumbnailUrl && <Image width={200} height={200} src={thumbnailUrl} alt="Seddel" />

    }