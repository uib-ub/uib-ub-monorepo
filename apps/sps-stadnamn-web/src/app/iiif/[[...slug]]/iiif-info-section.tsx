'use client'
import IIIFMetadataPanel from "./iiif-metadata-panel";
import { PiArticle, PiCaretLeft, PiCaretLineLeft, PiCaretLineRight, PiCaretRight, PiFile, PiSpeakerHigh, PiCaretDownBold, PiCaretUpBold, PiQuestionMark, PiQuestionMarkBold, PiQuestionMarkLight, PiQuestionMarkFill } from "react-icons/pi";
import { resolveLanguage } from "../iiif-utils";
import IIIFExpandSummary from "./iiif-expand-summary";
import IconLink from "@/components/ui/icon-link";
import { useContext, useState, useEffect } from "react";
import { GlobalContext } from "@/app/global-provider";

export default function IIIFInfoSection({manifest, neighbours, manifestDataset}: {manifest: any, neighbours: any, manifestDataset: string}) {
    const { isMobile, inputValue } = useContext(GlobalContext);
    const [stats, setStats] = useState(manifest?.childCount);
    const [statsLoading, setStatsLoading] = useState(false);

    // Hide the info section on mobile when there's a search query
    const shouldHideOnMobile = isMobile && inputValue.current.trim().length > 0;

    useEffect(() => {
        // Only fetch stats if we don't have childCount and we haven't loaded stats yet
        // This matches the original server logic: manifest?.childCount || await fetchIIIFStats(manifest?.uuid)
        if (!manifest?.childCount && !stats && !statsLoading) {
            console.log('Fetching stats for manifest:', manifest?.uuid || 'overall');
            setStatsLoading(true);
            
            // Always call the API - it will handle both cases (with and without manifestUuid)
            const url = manifest?.uuid 
                ? `/api/iiif/stats?manifestUuid=${manifest.uuid}`
                : `/api/iiif/stats`;
                
            fetch(url)
                .then(response => {
                    console.log('Stats response status:', response.status);
                    return response.json();
                })
                .then(fetchedStats => {
                    console.log('Fetched stats:', fetchedStats);
                    setStats(fetchedStats);
                    setStatsLoading(false);
                })
                .catch((error) => {
                    console.error('Error fetching stats:', error);
                    setStatsLoading(false);
                });
        }
    }, [manifest?.uuid, manifest?.childCount, stats, statsLoading]);


    return <>
        {manifest?.type == 'Collection' && neighbours.data && neighbours.total > 1 && (
            <nav className="flex flex-col items-center justify-center w-full  border-b border-neutral-200 flex border-b border-neutral-200 bg-neutral-50 divide-y divide-neutral-200">                        
                <div className="flex items-center gap-2 w-full p-4">
                    {neighbours.data.first != manifest.uuid ? <IconLink label="Første mappe" href={`/iiif/${neighbours.data.first}`} className="btn btn-outline btn-compact !p-2">
                        <PiCaretLineLeft aria-hidden="true"/>
                    </IconLink> : <div className="btn btn-outline btn-compact !p-2 disabled">
                        <PiCaretLineLeft aria-hidden="true"/>
                    </div>}
                    {neighbours.data.previous ? <IconLink label="Forrige mappe" href={`/iiif/${neighbours.data.previous}`} className="btn btn-outline btn-compact hover:bg-white !p-2">
                        <PiCaretLeft aria-hidden="true"/>
                    </IconLink> : <div className="btn btn-outline btn-compact !p-2 disabled">
                        <PiCaretLeft aria-hidden="true"/>
                    </div>}
                    <div className="flex-1 text-center px-3 py-1 rounded-sm border-neutral-400">
                        <span className="flex items-center justify-center gap-1">
                            {manifest.order}/{neighbours.total}
                        </span>
                    </div>
                    {neighbours.data.next ? <IconLink label="Neste mappe" href={`/iiif/${neighbours.data.next}`} className="btn btn-outline btn-compact !p-2">
                        <PiCaretRight aria-hidden="true"/>
                    </IconLink> : <div className="btn btn-outline btn-compact !p-2 disabled">
                        <PiCaretRight aria-hidden="true"/>
                    </div>}
                    {neighbours.data.last != manifest.uuid ? <IconLink label="Siste mappe" href={`/iiif/${neighbours.data.last}`} className="btn btn-outline btn-compact !p-2">
                        <PiCaretLineRight aria-hidden="true"/>
                    </IconLink> : <div className="btn btn-outline btn-compact !p-2 disabled">
                        <PiCaretLineRight aria-hidden="true"/>
                    </div>}
                </div>
            </nav>
        )}

        <div className={`flex flex-col gap-2 p-4 w-full bg-white ${shouldHideOnMobile ? 'hidden' : ''}`}>

                <h1>{manifest ? resolveLanguage(manifest.label) : 'Arkivressurser'}</h1>
            
            
            <div id="iiif-info-collapsible">
                {manifest?.summary && 
                    <div>
                        {resolveLanguage(manifest.summary).length > 150 ?
                        <>
                            {resolveLanguage(manifest.summary).split(' ').slice(0, 20).join(' ')}
                            <IIIFExpandSummary summary={resolveLanguage(manifest.summary)}/>
                        </>
                        :
                            resolveLanguage(manifest.summary)
                        }
                    </div>
                }
                {!manifest && <p>Digitalisert arkivmateriale ordna etter opphavsinstitusjon. Ordninga gjeld det digitaliserte materialet, eksempelvis med mappestrukturer frå dokumentasjonsprosjektet, men vi har så langt det er mogleg lenka til metadata for det fysiske materialet i arkivportalen.</p>}
                
                <IIIFMetadataPanel manifest={manifest} manifestDataset={manifestDataset}/>

                {/* Show stats for collections or when there's no manifest (top level) */}
                {(stats || manifest?.childCount) && (manifest?.type != 'Manifest' || !manifest) && (
                    <ul className="text-base !p-0">
                        <li className='flex flex-col'>
                            <span className='font-semibold text-neutral-800'>Elementer</span>
                            <span className="flex items-center gap-1">
                                <PiFile aria-hidden="true"/>
                                {stats?.manifests?.toLocaleString('no-NO') || 0}
                            </span>
                        </li>
                        {(stats?.images || stats?.reusedImages) ? <li className='flex flex-col'>
                            <span className='font-semibold text-neutral-800'>Skannede sider</span>
                            <span className="flex items-center gap-1">
                                <PiArticle aria-hidden="true"/>
                                {stats?.images ? stats?.images?.toLocaleString('no-NO') : <>{stats?.reusedImages?.toLocaleString('no-NO')} (gjenbrukte)</>}
                            </span>
                        </li> : null}
                        
                        {stats?.audio ? <li className='flex flex-col'>
                            <span className='font-semibold text-neutral-800'>Lydopptak</span>
                            <span className="flex items-center gap-1">
                                <PiSpeakerHigh aria-hidden="true"/>
                                {stats?.audio?.toLocaleString('no-NO') || 0}
                            </span>
                        </li> : null}
                    </ul>
                )}
                
                {statsLoading && (
                    <div className="text-sm text-neutral-600">Laster statistikk...</div>
                )}
            </div>
        </div>
    </>
}
