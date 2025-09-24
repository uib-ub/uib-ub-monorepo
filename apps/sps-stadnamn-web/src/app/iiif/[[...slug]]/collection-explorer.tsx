'use client'
import Breadcrumbs from "@/components/layout/breadcrumbs"
import { PiMagnifyingGlass, PiX } from "react-icons/pi"
import { useState, useEffect, useRef, Fragment, useCallback, useContext } from "react"
import { resolveLanguage } from "../iiif-utils";
import Spinner from "@/components/svg/Spinner";
import FileCard from "./file-card";
import IIIFTypeCounts from "./iiif-type-counts";
import { GlobalContext } from "@/state/providers/global-provider";
import { useQuery } from "@tanstack/react-query";
import IconButton from "@/components/ui/icon-button";
import { PiInfo } from "react-icons/pi";
import { useSessionStore } from "@/state/zustand/session-store";

const iiifQuery = async (collectionUuid: string, searchQuery: string, size: number) => {
    const params = new URLSearchParams();
    
    if (collectionUuid) {
        params.set('collection', collectionUuid);
    }
    if (searchQuery) {
        params.set('q', searchQuery);
    }
    params.set('size', size.toString());

    const response = await fetch(`/api/iiif/search?${params.toString()}`);
    if (!response.ok) throw new Error('Failed to fetch results');
    return response.json();
};

export default function CollectionExplorer({manifest, manifestDataset, isCollection}: {manifest: any, manifestDataset: string, isCollection: boolean}) {
    const { inputValue } = useContext(GlobalContext);
    const [searchQuery, setSearchQuery] = useState('');
    const [size, setSize] = useState(50);
    const containerRef = useRef<HTMLDivElement>(null);
    const searchTimeout = useRef<ReturnType<typeof setTimeout>>();
    const { isMobile } = useContext(GlobalContext);

    const { data, isLoading, isFetching, error } = useQuery({
        queryKey: ['iiifSearch', manifest?.uuid, searchQuery, size],
        queryFn: () => iiifQuery(manifest?.uuid, searchQuery, size),
        enabled: isCollection,
    });

    // Extract data from the query result
    const results = data?.hits?.hits || [];
    const total = data?.hits?.total?.value || 0;
    const typeCounts = data?.aggregations?.types?.buckets || [];

    const handleScroll = useCallback(() => {
        if (!containerRef.current || isLoading || total <= size) return;
        
        const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
        if (scrollHeight - scrollTop <= clientHeight * 3) {
            setSize(prev => prev + 100);
        }
    }, [isLoading, total, size]);

    useEffect(() => {
        const container = containerRef.current;
        if (container) {
            container.addEventListener('scroll', handleScroll);
            return () => container.removeEventListener('scroll', handleScroll);
        }
    }, [handleScroll]);

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        inputValue.current = value;
        setSize(20);

        if (searchTimeout.current) {
            clearTimeout(searchTimeout.current);
        }
        
        searchTimeout.current = setTimeout(() => {
            setSearchQuery(value);
        }, 300);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            (e.target as HTMLInputElement).blur();
        }
    };




    return (
        <div ref={containerRef} className="flex-1 min-w-0 flex flex-col lg:gap-4 py-4 lg:p-4 pb-48 overflow-y-auto lg:overflow-y-auto stable-scrollbar">
            <div className="w-full z-[6000] flex flex-col xl:flex-row gap-2 border-b border-neutral-200 xl:border-b-0 sticky top-0 xl:top-auto">
            {/* Add fixed height and min-height to prevent squishing */}
            {manifest && !isMobile &&
                <div className=" flex items-center">
                    <Breadcrumbs
                        homeUrl="/iiif"
                        homeLabel="Arkivressurser"
                        parentUrl={manifest.collections?.slice().reverse().map((item: any) => item.uuid)} 
                        parentName={manifest.collections?.slice().reverse().map((item: any) => resolveLanguage(item.label))} 
                        currentName={resolveLanguage(manifest.label)} 
                    />
                </div>
            }

            {isCollection && <div className="flex flex-col lg:flex-row items-center gap-4 lg:ml-auto mr-2">
            

            <div className='flex w-full lg:w-80 items-center bg-white border-2 border-neutral-200 group px-2 rounded-md'>
                    <PiMagnifyingGlass className="text-2xl shrink-0 ml-2 text-neutral-400 group-focus-within:text-neutral-900" aria-hidden="true"/>
                    <label htmlFor="search-input" className="sr-only">Søk</label>
                    <input
                        id="search-input"
                        type="text"
                        name="query"
                        value={inputValue.current}
                        onChange={handleSearch}
                        onKeyDown={handleKeyDown}
                        className="bg-transparent px-4 focus:outline-none w-full p-2"
                    />
                    <div className="w-8 flex justify-center">
                        {inputValue.current && (
                            <button
                                onClick={() => {
                                    inputValue.current = '';
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
            </div>}
            

            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4 lg:p-0">
                { results.map((result: any, index: number) => {
                    const itemDataset = result._index.split('-')[2].split('_')[1]
                    return (
                        <Fragment key={index}>
                            <FileCard item={result._source} itemDataset={itemDataset}/>
                        </Fragment>
                    )})}
                {(!isLoading && results.length === 0) && (
                    <div className="col-span-full text-center text-neutral-600 py-8">
                        Ingen innhold å vise.
                    </div>
                )}
            </div>
            {(isLoading || isFetching) && (
                <div className="flex w-full justify-center items-center">
                    <Spinner status="Laster mer innhold..." className="w-12 h-12 my-12"/>
                </div>
            )}
        </div>
    )
}

