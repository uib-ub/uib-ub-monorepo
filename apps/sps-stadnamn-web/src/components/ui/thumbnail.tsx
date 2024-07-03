
import Image from "next/image"

export default async function Thumbnail({ manifestId, docDataset }: { manifestId: string, docDataset: string}) {

    async function fetchThumbnail() {
        'use server'
        const res = await fetch(docDataset == 'nbas' ? `https://iiif.test.ubbe.no/iiif/manifest/stadnamn/NBAS/${manifestId}.json`
        : `https://iiif.test.ubbe.no/iiif/manifest/${manifestId}.json`, {
            method: 'GET',
            headers: {
            'Content-Type': 'application/json',
            'Authorization': `ApiKey ${process.env.ES_TOKEN}`,
            }
        })
        const data = await res.json()
        return data.thumbnail[0].id
    
    }


    const thumbnail = await fetchThumbnail()

    return (
        //
        <>
           <Image width={200} height={200} src={thumbnail} alt="Seddel" />
        </>
        
    )
    }