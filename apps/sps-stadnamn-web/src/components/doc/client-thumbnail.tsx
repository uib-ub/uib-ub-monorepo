
import Image from "next/image"
import { useEffect, useState } from "react"

export default function ClientThumbnail({ manifestId }: { manifestId: string }) {
    const [thumbnailUrl, setThumbnaiUrl] = useState<string | null>(null)
    const [width, setWidth] = useState<number | null>(null)
    const height = 120

    useEffect(() => {

        fetch(`https://iiif.test.ubbe.no/iiif/manifest/${manifestId}.json`).then(res => res.json()).then(data => {
            const [, originalWidth, originalHeight] = data?.thumbnail?.[0]?.id.match(/\/full\/(\d+),(\d+)\//) || [];
            setWidth(originalWidth ? Math.round((parseInt(originalWidth, 10) * height) / parseInt(originalHeight, 10)) : null);
            setThumbnaiUrl(data?.thumbnail?.[0]?.id)
            
        }).catch(() => {
            fetch(`https://iiif.test.ubbe.no/iiif/manifest/stadnamn/NBAS/${manifestId}.json`).then(res => res.json()).then(data => {
                const [, originalWidth, originalHeight] = data?.thumbnail?.[0]?.id.match(/\/full\/(\d+),(\d+)\//) || [];
                setWidth(originalWidth ? Math.round((parseInt(originalWidth, 10) * height) / parseInt(originalHeight, 10)) : null);
                setThumbnaiUrl(data?.thumbnail?.[0]?.id)
                
                
            })
        })

    }, [manifestId, width])


    return thumbnailUrl && width && height && <Image width={width} height={height} src={thumbnailUrl} alt="Seddel" />

    }