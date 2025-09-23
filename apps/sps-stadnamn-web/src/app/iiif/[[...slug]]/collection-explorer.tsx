'use client'
import Breadcrumbs from "@/components/layout/breadcrumbs"
import { PiMagnifyingGlass, PiX } from "react-icons/pi"
import { useState, useEffect, useRef, Fragment, useCallback, useContext } from "react"
import { resolveLanguage } from "../iiif-utils";
import Spinner from "@/components/svg/Spinner";
import FileCard from "./file-card";
import IIIFTypeCounts from "./iiif-type-counts";
import IIIIFMobileInfoWrapper from "./iiiif-mobile-info-wrapper";
import { useQuery } from "@tanstack/react-query";

function useSessionSyncedState(key: string, initialValue: string) {
	const [value, setValue] = useState<string>(() => {
		if (typeof window === 'undefined') return initialValue;
		try {
			const saved = sessionStorage.getItem(key);
			return saved !== null ? saved : initialValue;
		} catch {
			return initialValue;
		}
	});

	useEffect(() => {
		if (typeof window === 'undefined') return;
		try {
			sessionStorage.setItem(key, value);
		} catch {}
	}, [key, value]);

	return [value, setValue] as const;
}

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

export default function CollectionExplorer({manifest, neighbours, manifestDataset}: {manifest: any, neighbours: any, manifestDataset: string}) {
    const [searchQuery, setSearchQuery] = useSessionSyncedState(manifest?.uuid ? `iiif:q:${manifest.uuid}` : 'iiif:q', '');
    const [size, setSize] = useState(50);
    const containerRef = useRef<HTMLDivElement>(null);
    const searchTimeout = useRef<ReturnType<typeof setTimeout>>();

    const { data, isLoading, isFetching, error } = useQuery({
        queryKey: ['iiifSearch', manifest?.uuid, searchQuery, size],
        queryFn: () => iiifQuery(manifest?.uuid, searchQuery, size),
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
        <div ref={containerRef} className="flex flex-col lg:gap-4 py-4 lg:p-4 lg:overflow-y-auto lg:h-[calc(100svh-3.5rem)] stable-scrollbar">
            <div className="flex flex-col lg:flex-row gap-2 px-4 pb-4 lg:px-0 lg:pb-0 border-b border-neutral-200 lg:border-b-0">
            {/* Add fixed height and min-height to prevent squishing */}
            {manifest && 
                <div className="w-full flex items-center">
                    <Breadcrumbs
                        homeUrl="/iiif"
                        homeLabel="Arkivressurser"
                        parentUrl={manifest.collections?.slice().reverse().map((item: any) => item.uuid)} 
                        parentName={manifest.collections?.slice().reverse().map((item: any) => resolveLanguage(item.label))} 
                        currentName={resolveLanguage(manifest.label)} 
                    />
                </div>
            }

            <div className="flex flex-col lg:flex-row items-center gap-4 lg:ml-auto">
            {typeCounts && <div className="hidden lg:block"><IIIFTypeCounts typeCounts={typeCounts}/></div>}

                <div className='flex w-full lg:w-80 items-center bg-white border-2 border-neutral-200 group px-2 rounded-md'>
                    <PiMagnifyingGlass className="text-2xl shrink-0 ml-2 text-neutral-400 group-focus-within:text-neutral-900" aria-hidden="true"/>
                    <label htmlFor="search-input" className="sr-only">Søk</label>
                    <input
                        id="search-input"
                        type="text"
                        name="query"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="bg-transparent px-4 focus:outline-none w-full p-2"
                    />
                    <div className="w-8 flex justify-center">
                        {searchQuery && (
                            <button
                                onClick={() => {
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
            {typeCounts && <div className="block lg:hidden"><IIIFTypeCounts typeCounts={typeCounts}/></div>}
            

            </div>
            <IIIIFMobileInfoWrapper manifest={manifest} neighbours={neighbours} manifestDataset={manifestDataset} showOnMobile={true} />
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4 lg:p-0">
                { results.map((result: any, index: number) => {
                    const itemDataset = result._index.split('-')[2].split('_')[1]
                    return (
                        <Fragment key={index}>
                            <FileCard item={result._source} itemDataset={itemDataset}/>
                        </Fragment>
                    )})}
                
                
               
            </div>
            {(isLoading || isFetching) && (
                <div className="flex w-full justify-center items-center">
                    <Spinner status="Laster mer innhold..." className="w-12 h-12 my-12"/>
                </div>
            )}
        </div>
    )
}