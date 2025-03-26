import { fetchDoc, fetchIIIFNeighbours, fetchManifest } from "@/app/api/_utils/actions"
import ImageViewer from "./image-viewer";
import { PiArchive, PiArchiveThin, PiCaretDoubleLeft, PiCaretDoubleRight, PiCaretLeft, PiCaretRight, PiCopyright, PiDatabase, PiInfo } from "react-icons/pi";
import CollectionExplorer from "./collection-explorer";
import IIIFMetadataPanel from "./iiif-metadata-panel";
import Link from "next/link";
import { resolveLanguage } from "./iiif-utils";
export default async function IIIFPage({params}: {params: Promise<{slug: string[]}>}) {
    const { slug } = await params
    //const manifest = await fetchManifest(manifestId)
    const manifestDoc = slug?.[0] ? await fetchDoc({uuid: slug[0], dataset: 'iiif_*'}) : null
    const manifest = manifestDoc?._source
    const neighbours = (manifest?.order && manifest?.partOf) ? await fetchIIIFNeighbours(manifest.order, manifest.partOf) : {data: null, total: 0}
    const manifestDataset = manifestDoc?._index?.split('-')?.[2]?.split('_')?.[1]
    const isImage = manifest?.type == "Manifest" && manifest?.canvases?.[0]?.image
    const isAudio = manifest?.items?.[0]?.items?.[0]?.items?.[0]?.body?.type === "Sound";
    const audioUrl = isAudio ? manifest.items?.[0]?.items?.[0]?.items?.[0]?.body?.id : null;
    const isCollection = !slug?.[0] || manifest?.type === "Collection";
    
    
    return (

            <div className='flex flex-col !h-full !w-full lg:grid lg:grid-cols-5'>   
                <div className='space-y-2 col-span-1 page-info bg-white break-words border-l-2 border-neutral-200 flex-1 overflow-y-auto max-h-[calc(100svh-3rem)] border-r border-neutral-200'>
            
                {neighbours.data && (
                    <nav className="flex flex-col items-center justify-center w-full  border-b border-neutral-200 flex border-b border-neutral-200 bg-neutral-50 divide-y divide-neutral-200">
                        { manifest.type != 'Collection' && <>

                        <Link href={`/iiif/${manifest.collections[0].uuid}`} className="flex items-center gap-1 no-underline w-full p-4">
                            <PiArchive aria-hidden="true"/> {resolveLanguage(manifest.collections[manifest.collections.length - 1].label)} – {resolveLanguage(manifest.collections[0].label)}
                        </Link>
                        </>
                        }
                        
                        
                        <div className="flex items-center gap-2 w-full p-4">
                            {neighbours.data.first != manifest.uuid ? <Link href={`/iiif/${neighbours.data.first}`} className="btn btn-outline btn-compact !p-2">
                                <PiCaretDoubleLeft aria-hidden="true"/>
                            </Link> : <div className="btn btn-outline btn-compact !p-2 disabled">
                                <PiCaretDoubleLeft aria-hidden="true"/>
                            </div>}
                            {neighbours.data.preceding ? <Link 
                                className={`btn btn-outline btn-compact hover:bg-white !p-2`} 
                                href={`/iiif/${neighbours.data.preceding}`}
                                aria-label="Forrige"
                            >
                                <PiCaretLeft aria-hidden="true"/>
                            </Link> : <div className="btn btn-outline btn-compact !p-2 disabled">
                                <PiCaretLeft aria-hidden="true"/>
                            </div>}
                            <div className="flex-1 text-center px-3 py-1 rounded-sm border-neutral-400">
                                {manifest.order}/{neighbours.total}
                            </div>
                            {neighbours.data.succeeding ? <Link 
                                className={`btn btn-outline btn-compact !p-2`} 
                                href={`/iiif/${neighbours.data.succeeding}`}
                                aria-label="Neste"
                            >
                                <PiCaretRight aria-hidden="true"/>
                            </Link> : <div className="btn btn-outline btn-compact !p-2 disabled">
                                <PiCaretRight aria-hidden="true"/>
                            </div>}
                            {neighbours.data.last != manifest.uuid ? <Link href={`/iiif/${neighbours.data.last}`} className="btn btn-outline btn-compact !p-2">
                                <PiCaretDoubleRight aria-hidden="true"/>
                            </Link> : <div className="btn btn-outline btn-compact !p-2 disabled">
                                <PiCaretDoubleRight aria-hidden="true"/>
                            </div>}
                        </div>

                    </nav>
                    
                   
                )}
                <div className="p-4">
                <IIIFMetadataPanel manifest={manifest}/>
                </div>
                
                
                </div>
            
                          
                <div className='w-full lg:col-span-4 relative !min-h-[40svh] bg-neutral-200'>
                    {isImage && <ImageViewer canvases={manifest.canvases} manifestDataset={manifestDataset} />}
                    {isAudio && <div className="flex items-center justify-center h-full">
                        <audio controls src={audioUrl} className="w-full max-w-md">
                            Your browser does not support the audio element.
                        </audio>
                    </div>}
                    {isCollection && <CollectionExplorer manifest={manifest} manifestDataset={manifestDataset} />}

                </div>
                
                
            </div>
    );
}
