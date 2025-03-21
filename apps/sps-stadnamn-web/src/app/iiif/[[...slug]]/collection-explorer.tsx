'use client'
import Breadcrumbs from "@/components/layout/breadcrumbs"
import { PiArchive, PiArchiveThin, PiHouse } from "react-icons/pi"
import { useState, useEffect, useRef } from "react"
import Link from "next/link";
import Thumbnail from "@/components/image-viewer/thumbnail";
import ClientThumbnail from "@/components/doc/client-thumbnail";
import Image from "next/image";

export default function CollectionExplorer({manifest}: {manifest: any}) {
    const [searchQuery, setSearchQuery] = useState('');
    const [results, setResults] = useState<any[]>([]);
    // Store the original collections data to use for breadcrumbs

    useEffect(() => {
        const params = new URLSearchParams();
        
        if (manifest?.uuid) {
            params.set('collection', manifest.uuid);
        }
        if (searchQuery) {
            params.set('q', searchQuery);
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
    }, [manifest?.uuid, searchQuery]);

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
    };

    return (
        <div className="flex flex-col gap-4 p-4 overflow-y-auto max-h-[calc(100vh-3rem)]">
            <div className="flex">
            {/* Add fixed height and min-height to prevent squishing */}
            {manifest && 
                <div className="w-full min-h-[40px]">
                    <Breadcrumbs 
                        homeUrl="/iiif"
                        homeLabel="Arkivressurser"
                        parentUrl={manifest.collections?.slice().reverse().map((item: any) => item.uuid)} 
                        parentName={manifest.collections?.slice().reverse().map((item: any) => item.label)} 
                        currentName={manifest.label} 
                    />
                </div>
            }
            
                <input
                    onChange={handleSearch}
                    type="text"
                    name="query"
                    placeholder="Search in this collection..."
                    className="flex-grow p-2 border rounded-l"
                />
                <button 
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-r"
                >
                    Search
                </button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {results.map((result, index) => (
                    <Link 
                        href={`/iiif/${result.uuid}`} 
                        key={index} 
                        className="flex flex-col items-center gap-2 no-underline bg-white shadow-md hover:bg-neutral-50 p-2 rounded-md overflow-auto"
                    >
                        {result.type === 'Collection' ? (
                            <>
                                <PiArchiveThin aria-hidden="true" className="text-6xl" />
                                {result.label}
                            </>
                        ) : (
                            <>
                                <Image 
                                    src={`https://iiif.test.ubbe.no/iiif/image/${result.canvases[0].image}/full/${result.canvases[0].width},${result.canvases[0].height}/0/default.jpg`} 
                                    alt={result.label} 
                                    width={result.canvases[0].width} 
                                    height={result.canvases[0].height} 
                                />
                                <span aria-hidden="true">{result.label}</span>
                            </>
                        )}
                    </Link>
                ))}
            </div>
        </div>
    )
}