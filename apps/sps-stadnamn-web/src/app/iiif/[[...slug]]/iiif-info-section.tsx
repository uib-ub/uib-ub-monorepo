import IIIFMetadataPanel from "./iiif-metadata-panel";
import { PiCaretLeft, PiCaretLineLeft, PiCaretLineRight, PiCaretRight } from "react-icons/pi";
import Link from "next/link";
import { resolveLanguage } from "../iiif-utils";
import IIIFExpandSummary from "./iiif-expand-summary";
import { fetchIIIFStats } from "@/app/api/iiif/iiif-stats";
import IconLink from "@/components/ui/icon-link";

export default async function IIIFInfoSection({manifest, neighbours, manifestDataset}: {manifest: any, neighbours: any, manifestDataset: string}) {
    const stats = manifest ? null : await fetchIIIFStats()
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

                    {
                        manifest ? (
                            <div className="flex flex-col gap-2 p-4 w-full bg-white">
                                <h1>{resolveLanguage(manifest.label)}</h1>
                                {manifest.summary && (
                                    <div>
                                        {resolveLanguage(manifest.summary).slice(0, 100)}
                                        {resolveLanguage(manifest.summary).length > 100 && 
                                            <IIIFExpandSummary summary={resolveLanguage(manifest.summary)}/>
                                        }
                                    </div>
                                )}
                                
                                <IIIFMetadataPanel manifest={manifest} manifestDataset={manifestDataset}/>

                            </div>
                        ) : (
                            <>
                                <div className="flex flex-col gap-2 p-4 w-full bg-white">
                                    <h1>Arkivressurser</h1>
                                    <p>Digitalisert arkivmateriale som så langt det er mulig er delt inn og sortert i tråd med det fysiske materialet.</p>
                                    <p>I noen datasett har vi brukt mer enn én ordning av materialet, for eksempel med og uten gruppering av sedler på oppslagsord. De samme skannede sedlene kan derfor forekomme i to mappeer.</p>
                                </div>

                                {stats && (
                                    <ul className="text-base p-4">
                                        <li className='flex flex-col'>
                                            <span className='font-semibold text-neutral-800'>Elementer</span>
                                            <span className="flex items-center gap-1">
                                                {stats[0]?.aggregations?.total_manifests?.value?.toLocaleString('no-NO') || 0}
                                            </span>
                                        </li>
                                        <li className='flex flex-col'>
                                            <span className='font-semibold text-neutral-800'>Skannede sider</span>
                                            <span className="flex items-center gap-1">
                                                {stats[0]?.aggregations?.total_images_count?.value?.toLocaleString('no-NO') || 0}
                                            </span>
                                        </li>
                                        <li className='flex flex-col'>
                                            <span className='font-semibold text-neutral-800'>Lydopptak</span>
                                            <span className="flex items-center gap-1">
                                                {stats[0]?.aggregations?.total_audio?.value?.toLocaleString('no-NO') || 0}
                                            </span>
                                        </li>
                                    </ul>
                                )}
                            </>
                        )}

                        
                        
                       
                
    </>
}
