'use client'
import Breadcrumbs from "@/components/layout/breadcrumbs"
import { PiArchive, PiArchiveThin, PiArticleFill, PiHouse } from "react-icons/pi"
import { useState, useEffect, useRef } from "react"
import Link from "next/link";
import Thumbnail from "@/components/image-viewer/thumbnail";
import ClientThumbnail from "@/components/doc/client-thumbnail";
import Image from "next/image";
import { resolveLanguage } from "./iiif-utils";

export default function CollectionExplorer({partOf}: {partOf: string}) {
    const [results, setResults] = useState<any[]>([]);

    useEffect(() => {

        console.log("PARTOF", partOf);


        const params = new URLSearchParams();
        
        if (partOf) {
            params.set('collection', partOf);
        }

        // Single fetch call that returns all results
        fetch(`/api/search/iiif?${params.toString()}`)
            .then((response) => {
                if (!response.ok) throw new Error('Failed to fetch results');
                return response.json();
            })
            .then((data) => {
                // Get all results in a single array
                const allResults = data.hits?.hits?.map((hit: any) => hit._source) || [];
                setResults(allResults);
            });
    }, [partOf]);



    return (

            
            <div className="flex flex-col gap-4 h-full divide-y divide-neutral-200">
                {results.map((result, index) => (
                    <Link 
                        href={`/iiif/${result.uuid}`} 
                        key={index} 
                        aria-current={result.uuid === partOf ? "page" : undefined}
                        className="flex gap-2 items-center no-underline aria-[current=page]:bg-accent5"
                    >
                        
                                {result.type === 'Collection' ? <PiArchiveThin aria-hidden="true" className="text-3xl" /> : <PiArticleFill aria-hidden="true" className="text-3xl" />}
                                {resolveLanguage(result.label)}
              
                        
                
                    </Link>
                ))}
            </div>
    )
}