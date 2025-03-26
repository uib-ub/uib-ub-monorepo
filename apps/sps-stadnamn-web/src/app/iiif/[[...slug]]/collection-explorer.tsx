'use client'
import Breadcrumbs from "@/components/layout/breadcrumbs"
import { PiArchive, PiArchiveFill, PiArchiveThin, PiArticle, PiArticleFill, PiHouse, PiMagnifyingGlass, PiX } from "react-icons/pi"
import { useState, useEffect, useRef } from "react"
import Link from "next/link";
import Thumbnail from "@/components/image-viewer/thumbnail";
import ClientThumbnail from "@/components/doc/client-thumbnail";
import Image from "next/image";
import { resolveLanguage } from "./iiif-utils";
import Spinner from "@/components/svg/Spinner";

export default function CollectionExplorer({manifest}: {manifest: any}) {
    const [searchQuery, setSearchQuery] = useState('');
    const [inputValue, setInputValue] = useState('');
    const [results, setResults] = useState<any[]>([]);
    const [size, setSize] = useState(20);
    const [loading, setLoading] = useState(false);
    const [typeCounts, setTypeCounts] = useState<any>([]);
    const [total, setTotal] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);
    // Store the original collections data to use for breadcrumbs
    const height = 240
    const searchTimeout = useRef<ReturnType<typeof setTimeout>>();

    useEffect(() => {
        const params = new URLSearchParams();
        
        if (manifest?.uuid) {
            params.set('collection', manifest.uuid);
        }
        if (searchQuery) {
            params.set('q', searchQuery);
        }
        params.set('size', size.toString());

        // Single fetch call that returns all results
        fetch(`/api/search/iiif?${params.toString()}`)
            .then((response) => {
                if (!response.ok) throw new Error('Failed to fetch results');
                return response.json();
            })
            .then((data) => {
                // Get all results in a single array
                const results = data.hits?.hits || [];
                setResults(results);
                setTotal(data.hits?.total?.value);
                setTypeCounts(data.aggregations?.types?.buckets);
                setLoading(false);
            });
    }, [manifest?.uuid, searchQuery, size]);

    const handleScroll = () => {
        if (!containerRef.current || loading || total <= size) return;
        
        const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
        if (scrollHeight - scrollTop <= clientHeight * 1.5) {
            setSize(prev => prev + 40);
            setLoading(true);
        }
    };

    useEffect(() => {
        const container = containerRef.current;
        if (container) {
            container.addEventListener('scroll', handleScroll);
            return () => container.removeEventListener('scroll', handleScroll);
        }
    }, [loading, total]);

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setInputValue(value);
        setSize(20);
        setResults([]);

        if (searchTimeout.current) {
            clearTimeout(searchTimeout.current);
        }
        
        searchTimeout.current = setTimeout(() => {
            setSearchQuery(value);
        }, 300);
    };

    return (
        <div ref={containerRef} className="flex flex-col gap-4 p-4 overflow-y-auto max-h-[calc(100vh-3rem)]">
            <div className="flex gap-2">
            {/* Add fixed height and min-height to prevent squishing */}
            {manifest && 
                <div className="w-full min-h-[40px]">
                    <Breadcrumbs 
                        homeUrl="/iiif"
                        homeLabel="Arkivressurser"
                        parentUrl={manifest.collections?.slice().reverse().map((item: any) => item.uuid)} 
                        parentName={manifest.collections?.slice().reverse().map((item: any) => resolveLanguage(item.label))} 
                        currentName={resolveLanguage(manifest.label)} 
                    />
                </div>
            }

            {typeCounts && <div className="flex items-center gap-2">
                {typeCounts?.map((type: any) => (
                    <div key={type.key} className="flex items-center gap-2 text-neutral-900 px-2 py-1 rounded-md">
                        {type.key == 'Collection' ? <PiArchiveFill aria-hidden="true" className="text-xl" /> : <PiArticleFill aria-hidden="true" className="text-xl" />}
                        <span>{type.doc_count}</span>
                    </div>
                ))}


            </div>}
            
                <div className='flex max-w-md items-center bg-white border-2 border-neutral-200 group px-2 rounded-md'>
                    <PiMagnifyingGlass className="text-2xl shrink-0 ml-2 text-neutral-400 group-focus-within:text-neutral-900" aria-hidden="true"/>
                    <label htmlFor="search-input" className="sr-only">Søk</label>
                    <input
                        id="search-input"
                        type="text"
                        name="query"
                        value={inputValue}
                        onChange={handleSearch}
                        className="bg-transparent px-4 focus:outline-none w-full p-2"
                    />
                    <div className="w-8 flex justify-center">
                        {inputValue && (
                            <button
                                onClick={() => {
                                    setInputValue('');
                                    setSearchQuery('');
                                }}
                                className="hover:bg-neutral-100 rounded-full p-1"
                                aria-label="Tøm søk"
                            >
                                <PiX className="text-lg"/>
                            </button>
                        )}
                    </div>
                </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                { results.map((result, index) => {
                    const data = result._source
                    const itemDataset = result._index.split('-')[2].split('_')[1]
                    return (
                    <Link 
                        href={`/iiif/${data.uuid}`} 
                        key={index} 
                        className="flex flex-col items-center gap-2 no-underline bg-white shadow-md hover:bg-neutral-50 p-2 pt-4 rounded-md overflow-auto"
                    >
                        {data.type === 'Collection' && (
                            <>
                                <PiArchiveThin aria-hidden="true" className="text-6xl" />
                                {resolveLanguage(data.label)}
                            </>
                        )}
                        {data.type == 'Manifest' && (
                            <>
                                <Image 
                                    className="bg-neutral-800 border border-neutral-200 object-cover object-center"
                                    src={`https://iiif.test.ubbe.no/iiif/image/stadnamn/${itemDataset.toUpperCase()}/${data.canvases[0].image}/full/${Math.round((data.canvases[0].width / data.canvases[0].height) * 240)},${240}/0/default.jpg`} 
                                    alt={resolveLanguage(data.label)} 
                                    width={Math.round((data.canvases[0].width / data.canvases[0].height) * height)}
                                    height={height}
                                />
                                <span aria-hidden="true">{resolveLanguage(data.label)}</span>
                            </>
                        )}
                  
                    </Link>
                )})}
                
                {loading && (
                    <div className="col-span-full text-center py-4">
                        <Spinner status="Laster mer innhold..." className="w-10 h-10" />
                    </div>
                )}
            </div>
        </div>
    )
}