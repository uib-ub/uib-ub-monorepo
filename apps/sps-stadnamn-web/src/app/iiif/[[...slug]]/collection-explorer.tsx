'use client'
import Breadcrumbs from "@/components/layout/breadcrumbs"
import { PiArchive, PiArchiveFill, PiArchiveThin, PiArticle, PiArticleFill, PiFileAudio, PiFileAudioThin, PiFileFill, PiHouse, PiMagnifyingGlass, PiSpeakerSlashThin, PiX } from "react-icons/pi"
import { useState, useEffect, useRef, Fragment } from "react"
import Link from "next/link";
import Thumbnail from "@/components/image-viewer/thumbnail";
import ClientThumbnail from "@/components/doc/client-thumbnail";
import Image from "next/image";
import { resolveLanguage } from "./iiif-utils";
import Spinner from "@/components/svg/Spinner";
import FileCard from "./file-card";


export default function CollectionExplorer({manifest}: {manifest: any}) {
    const [searchQuery, setSearchQuery] = useState('');
    const [inputValue, setInputValue] = useState('');
    const [results, setResults] = useState<any[]>([]);
    const [size, setSize] = useState(40);
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
        if (scrollHeight - scrollTop <= clientHeight * 3) {
            setSize(prev => prev + 100);
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
        <div ref={containerRef} className="flex flex-col gap-4 p-4 overflow-y-auto max-h-[calc(100vh-3rem)] stable-scrollbar">
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

            <div className="flex items-center gap-4 ml-auto">
                {typeCounts && <div className="flex items-center gap-2">
                    {typeCounts.map((type: any) => (
                        <div key={type.key} className="flex items-center gap-2 text-neutral-900 px-2 py-1 rounded-md">
                            {type.key == 'Collection' ? <PiArchiveFill aria-hidden="true" className="text-xl" /> : <PiFileFill aria-hidden="true" className="text-xl" />}
                            <span>{type.doc_count}</span>
                        </div>
                    ))}
                </div>}

                <div className='flex w-80 items-center bg-white border-2 border-neutral-200 group px-2 rounded-md'>
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
            

            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                { results.map((result, index) => {
                    const itemDataset = result._index.split('-')[2].split('_')[1]
                    return (
                        <Fragment key={index}>
                            <FileCard fields={result.fields} itemDataset={itemDataset}/>
                        </Fragment>
                    )})}
                
                
               
            </div>
            {loading && (
                <div className="flex w-full justify-center items-center">
                    {true && <Spinner status="Laster mer innhold..." className="w-12 h-12 my-12"/>}
                </div>
            )}
        </div>
    )
}