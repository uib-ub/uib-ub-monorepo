import IIIFMetadataPanel from "./iiif-metadata-panel";
import { PiCaretLeft, PiCaretLineLeft, PiCaretLineRight, PiCaretRight } from "react-icons/pi";
import Link from "next/link";
import { resolveLanguage } from "./iiif-utils";
import IIIFExpandSummary from "./iiif-expand-summary";

export default function IIIFInfoSection({manifest, neighbours}: {manifest: any, neighbours: any}) {
    return <>

{manifest?.type == 'Collection' && neighbours.data && neighbours.total > 1 && (
                    <nav className="flex flex-col items-center justify-center w-full  border-b border-neutral-200 flex border-b border-neutral-200 bg-neutral-50 divide-y divide-neutral-200">                        
                        
                        <div className="flex items-center gap-2 w-full p-4">
                            {neighbours.data.first != manifest.uuid ? <Link href={`/iiif/${neighbours.data.first}`} className="btn btn-outline btn-compact !p-2">
                                <PiCaretLineLeft aria-hidden="true"/>
                            </Link> : <div className="btn btn-outline btn-compact !p-2 disabled">
                                <PiCaretLineLeft aria-hidden="true"/>
                            </div>}
                            {neighbours.data.previous ? <Link 
                                className={`btn btn-outline btn-compact hover:bg-white !p-2`} 
                                href={`/iiif/${neighbours.data.previous}`}
                                aria-label="Forrige"
                            >
                                <PiCaretLeft aria-hidden="true"/>
                            </Link> : <div className="btn btn-outline btn-compact !p-2 disabled">
                                <PiCaretLeft aria-hidden="true"/>
                            </div>}
                            <div className="flex-1 text-center px-3 py-1 rounded-sm border-neutral-400">
                                <span className="flex items-center justify-center gap-1">
                                    {manifest.order}/{neighbours.total}
                                </span>
                            </div>
                            {neighbours.data.next ? <Link 
                                className={`btn btn-outline btn-compact !p-2`} 
                                href={`/iiif/${neighbours.data.next}`}
                                aria-label="Neste"
                            >
                                <PiCaretRight aria-hidden="true"/>
                            </Link> : <div className="btn btn-outline btn-compact !p-2 disabled">
                                <PiCaretRight aria-hidden="true"/>
                            </div>}
                            {neighbours.data.last != manifest.uuid ? <Link href={`/iiif/${neighbours.data.last}`} className="btn btn-outline btn-compact !p-2">
                                <PiCaretLineRight aria-hidden="true"/>
                            </Link> : <div className="btn btn-outline btn-compact !p-2 disabled">
                                <PiCaretLineRight aria-hidden="true"/>
                            </div>}
                        </div>

                    </nav>
                    
                   
                )}

                    {
                        manifest ? <div className="flex flex-col gap-2 p-4 w-full bg-white">
                        <h1>{resolveLanguage(manifest.label)}</h1>
                        {manifest.summary && <div>{resolveLanguage(manifest.summary).slice(0, 100)}
                        {resolveLanguage(manifest.summary).length > 100 && <IIIFExpandSummary summary={resolveLanguage(manifest.summary)}/>}
                        </div>
                        }
                        </div> : <div className="flex flex-col gap-2 p-4 w-full bg-white">
                        <h1>Arkivressurser</h1>
                        <p>Digitalisert arkivmateriale som så langt det er mulig er delt inn og sortert i tråd med det fysiske materialet.</p>
                        <p>I tilfeller der vi har brukt mer enn én inndeling, vil de samme sedlene kunne finnes i to forskjellige underinndelinger.</p>
                        </div>
                        
                    }

                        
                        
                       
                <div className="p-4">
                <IIIFMetadataPanel manifest={manifest}/>
                </div>
    </>
}
