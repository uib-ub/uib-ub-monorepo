import IIIFMetadataPanel from "./iiif-metadata-panel";
import { PiArticle, PiCaretLeft, PiCaretLineLeft, PiCaretLineRight, PiCaretRight, PiFile, PiSpeakerHigh } from "react-icons/pi";
import { resolveLanguage } from "../iiif-utils";
import IIIFExpandSummary from "./iiif-expand-summary";
import { fetchIIIFStats } from "@/app/api/iiif/iiif-stats";
import IconLink from "@/components/ui/icon-link";

export default async function IIIFInfoSection({manifest, neighbours, manifestDataset}: {manifest: any, neighbours: any, manifestDataset: string}) {
    const stats = manifest?.childCount || await fetchIIIFStats(manifest?.uuid)
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

                            <div className="flex flex-col gap-2 p-4 w-full bg-white">
                                <h1>{manifest ? resolveLanguage(manifest.label) : 'Arkivressurser'}</h1>
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


                                {(stats || manifest?.childCount) && manifest?.type != 'Manifest' && (
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

                            </div>
                        

                        
                        
                       
                
    </>
}
