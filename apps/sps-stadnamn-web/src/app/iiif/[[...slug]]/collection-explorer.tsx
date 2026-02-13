'use client'
import Breadcrumbs from "@/components/layout/breadcrumbs";
import Spinner from "@/components/svg/Spinner";
import { GlobalContext } from "@/state/providers/global-provider";
import { useIIIFSessionStore } from "@/state/zustand/iiif-session-store";
import { useInfiniteQuery } from "@tanstack/react-query";
import Form from "next/form";
import { useSearchParams } from "next/navigation";
import { Fragment, useCallback, useContext, useEffect, useRef, useState } from "react";
import { PiMagnifyingGlass, PiX } from "react-icons/pi";
import { resolveLanguage } from "../iiif-utils";
import FileCard from "./file-card";
import dynamic from "next/dynamic"; 

const IIIFNeighbourNav = dynamic(() => import('./iiif-neighbour-nav'), { ssr: false })

const PAGE_SIZE = 50;

const iiifQuery = async (collectionUuid: string, searchQuery: string, from: number, size: number = PAGE_SIZE) => {
    const params = new URLSearchParams();

    if (collectionUuid) {
        params.set('collection', collectionUuid);
    }
    if (searchQuery) {
        params.set('q', searchQuery);
    }
    params.set('size', size.toString());
    params.set('from', from.toString());

    const response = await fetch(`/api/iiif/search?${params.toString()}`);
    if (!response.ok) throw new Error('Failed to fetch results');
    return response.json();
};

export default function CollectionExplorer({ manifest, isCollection, manifestDataset }: { manifest: any, isCollection: boolean, manifestDataset?: string }) {
    const { isMobile } = useContext(GlobalContext);
    const manifestUuid = manifest?.uuid as string | undefined;
    const searchParams = useSearchParams();
    const searchContext = useIIIFSessionStore((s) => s.searchContext);
    const setSearchContext = useIIIFSessionStore((s) => s.setSearchContext);

    // q in the URL is the source of truth for the current view
    const initialQuery = searchParams.get('q') || '';

    const [inputValue, setInputValue] = useState(initialQuery);
    const [searchQuery, setSearchQuery] = useState(initialQuery);

    const containerRef = useRef<HTMLDivElement>(null);

    const {
        data,
        isLoading,
        error,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
    } = useInfiniteQuery({
        queryKey: ['iiifSearch', manifest?.uuid, searchQuery],
        queryFn: ({ pageParam = 0 }) => iiifQuery(manifest?.uuid, searchQuery, Number(pageParam), PAGE_SIZE),
        enabled: isCollection,
        initialPageParam: 0,
        getNextPageParam: (lastPage, allPages) => {
            const lp: any = lastPage as any;
            const total = lp?.hits?.total?.value || 0;
            const loaded = (allPages as any[]).reduce((sum: number, p: any) => sum + (p?.hits?.hits?.length || 0), 0);
            if (loaded < total) {
                return loaded; // next offset
            }
            return undefined;
        },
        refetchOnWindowFocus: false,
        staleTime: 30_000,
    });

    // Extract data from the query result
    const pages: any[] = (data as any)?.pages || [];
    const results = pages.flatMap((p: any) => p?.hits?.hits || []);
    const total = pages?.[0]?.hits?.total?.value || 0;
    const typeCounts = pages?.[0]?.aggregations?.types?.buckets || [];

    const handleScroll = useCallback(() => {
        if (!containerRef.current || isLoading) return;

        const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
        if (scrollHeight - scrollTop <= clientHeight * 3) {
            if (hasNextPage && !isFetchingNextPage) {
                fetchNextPage();
            }
        }
    }, [isLoading, hasNextPage, isFetchingNextPage, fetchNextPage]);

    useEffect(() => {
        const container = containerRef.current;
        if (container) {
            container.addEventListener('scroll', handleScroll);
            return () => container.removeEventListener('scroll', handleScroll);
        }
    }, [handleScroll]);

    const submitSearch = () => {
        const trimmed = inputValue.trim();
        setSearchQuery(trimmed);

        // Store single search context for "back to search"
        const contextCollectionUuid = manifestUuid || null; // null represents top-level
        if (trimmed) {
            setSearchContext({ collectionUuid: contextCollectionUuid, query: trimmed });
        } else if (searchContext && searchContext.collectionUuid === contextCollectionUuid) {
            setSearchContext(null);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            submitSearch();
        }
    };

    if (!isCollection) {
        return <IIIFNeighbourNav manifest={manifest} isMobile={isMobile} manifestDataset={manifestDataset} />
    }




    return (
        <div ref={containerRef} className="flex-1 min-w-0 flex flex-col lg:gap-4 lg:p-4 pb-48 overflow-y-auto lg:overflow-y-auto stable-scrollbar bg-neutral-200">
            <div className="w-full z-[6000] flex flex-col gap-4">
                {/* Add fixed height and min-height to prevent squishing */}
                {manifest && !isMobile &&
                    <div className=" flex items-center px-2 pt-2 justify-between w-full">
                        <Breadcrumbs
                            homeUrl="/iiif"
                            homeLabel="Arkiv"
                            parentUrl={manifest.collections?.slice().reverse().map((item: any) => item.uuid)}
                            parentName={manifest.collections?.slice().reverse().map((item: any) => resolveLanguage(item.label))}
                            currentName={resolveLanguage(manifest.label)}
                        />

                    </div>
                }


                <div className={`flex flex-col lg:flex-row items-center gap-4 xl:mr-2`}>
                    <Form
                        action={manifestUuid ? `/iiif/${manifestUuid}` : "/iiif"}
                        onSubmitCapture={submitSearch}
                        className="flex w-full xl:w-80"
                    >
                        <div className='flex w-full pr-1 items-center bg-white group shadow-lg lg:rounded-md h-14 lg:h-12'>
                            <input
                                id={"search-input-" + manifestUuid}
                                type="text"
                                aria-label="Søk i arkivsamling"
                                name="q"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={handleKeyDown}
                                className="bg-transparent pr-2 px-4 focus:outline-none flex w-full shrink text-lg xl:text-base"
                            />
                            {inputValue && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setInputValue('');
                                        setSearchQuery('');
                                        const contextCollectionUuid = manifestUuid || null;
                                        if (searchContext && searchContext.collectionUuid === contextCollectionUuid) {
                                            setSearchContext(null);
                                        }
                                    }}
                                    className="m-1 p-1"
                                    aria-label="Tøm søk"
                                >
                                    <PiX className="text-3xl lg:text-2xl text-neutral-800" />
                                </button>
                            )}
                            <button
                                type="submit"
                                className="mr-1 p-1"
                                aria-label="Søk"
                            >
                                <PiMagnifyingGlass className="text-3xl lg:text-2xl shrink-0 text-neutral-800" aria-hidden="true" />
                            </button>
                        </div>
                    </Form>
                    <IIIFNeighbourNav manifest={manifest} isMobile={isMobile} />
                </div>



            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4 lg:p-0">
                {results.map((result: any, index: number) => {
                    const itemDataset = result._index.split('-')[2].split('_')[1]
                    return (
                        <Fragment key={result._id || index}>
                            <FileCard item={result._source} itemDataset={itemDataset} />
                        </Fragment>
                    )
                })}
                {(!isLoading && results.length === 0) && (
                    <div className="col-span-full text-center text-neutral-800 py-8">
                        {searchQuery ? 'Ingen treff' : 'Samlinga manglar innhald'}
                    </div>
                )}
            </div>
            {(isLoading || isFetchingNextPage) && (
                <div className="flex w-full justify-center items-center">
                    <Spinner status="Laster mer innhold..." className="w-12 h-12 my-12" />
                </div>
            )}
        </div>
    )
}

