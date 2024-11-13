
import Image from "next/image"

export default async function Thumbnail({ manifestId }: { manifestId: string }) {

    async function fetchThumbnail() {
        'use server'

        // TODO: create api route that generates manifest from elasticsearch index  
        let res 
        try {
            res = await fetch( `https://iiif.test.ubbe.no/iiif/manifest/${manifestId}.json`);
            if (res.status === 404) {
                throw new Error("Not found")
            }
        }
        catch {
            res = await fetch(`https://iiif.test.ubbe.no/iiif/manifest/stadnamn/NBAS/${manifestId}.json`);
        }


        const data = res.ok ? await res.json() : null




        return data?.thumbnail?.[0]?.id
    
    }


    const thumbnail = await fetchThumbnail()

    return <Image width={200} height={200} src={thumbnail} alt="Seddel" />

    }