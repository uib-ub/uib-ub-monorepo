import { fetchDoc, fetchIIIFNeighbours } from "@/app/api/_utils/actions"
import ImageViewer from "./image-viewer";
import { PiArchive, PiCaretLeft, PiCaretLineLeft, PiCaretLineRight, PiCaretRight, PiFolder } from "react-icons/pi";
import CollectionExplorer from "./collection-explorer";
import IIIFMetadataPanel from "./iiif-metadata-panel";
import Link from "next/link";
import { resolveLanguage } from "./iiif-utils";
import Breadcrumbs from "@/components/layout/breadcrumbs";
import FileCard from "./file-card";
import { Fragment } from "react";


export default async function IIIFPage({params}: {params: Promise<{slug: string[]}>}) {
    const { slug } = await params
    //const manifest = await fetchManifest(manifestId)
    const manifestDoc = slug?.[0] ? await fetchDoc({uuid: slug[0], dataset: 'iiif_*'}) : null
    const manifest = manifestDoc?._source
    const neighbours = (manifest?.order && manifest?.partOf) ? await fetchIIIFNeighbours(manifest.order, manifest.partOf) : {data: null, total: 0}
    const manifestDataset = manifestDoc?._index?.split('-')?.[2]?.split('_')?.[1]
    const isImage = manifest?.type == "Manifest" && manifest?.canvases?.[0]?.image
    const isCollection = !slug?.[0] || manifest?.type === "Collection";
    
    
    return (

       

            <div className='flex flex-col !h-full !w-full'>   
            <div className={`grid grid-cols-5 ${manifest?.type == 'Manifest' ? 'min-h-[calc(100svh-20rem)]' : 'h-full'}`}>
                <div className={`col-span-1 page-info bg-white break-words border-l-2 border-neutral-200 border-r border-neutral-200 overflow-y-auto ${manifest?.type == 'Manifest' ? 'max-h-[calc(100svh-20rem)]' : 'max-h-[calc(100svh-3rem)]'} overflow-y-auto`}>
            
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
                        {manifest.summary && <p>{resolveLanguage(manifest.summary)}</p>}
                        </div> : <div className="flex flex-col gap-2 p-4 w-full bg-white">
                        <h1>Arkivressurser</h1>
                        <p>Digitalisert arkivmateriale som så langt det er mulig er delt inn og sortert i tråd med det fysiske materialet.</p>
                        <p>I tilfeller der vi har brukt mer enn én inndeling, vil de samme sedlene kunne finnes i to forskjellige underinndelinger.</p>
                        </div>
                        
                    }

                        
                        
                       
                <div className="p-4">
                <IIIFMetadataPanel manifest={manifest}/>
                </div>
                
                
                </div>
            
                          
                <div className='w-full lg:col-span-4 relative !min-h-[40svh] bg-neutral-200'>
                    {isImage && <ImageViewer canvases={manifest.canvases} manifestDataset={manifestDataset} />}
                    {manifest?.audio && <div className="flex flex-col gap-4 items-center justify-center h-full">
                        <h2 className="text-2xl text-neutral-900 font-semibold">{resolveLanguage(manifest.audio.label)}</h2>
                        
                       {true && <audio controls src={`https://iiif.test.ubbe.no/iiif/audio/stadnamn/${manifestDataset.toUpperCase()}/${manifest.audio.audioFilename}`} className="w-full max-w-md">
                            Your browser does not support the audio element.
                        </audio>}
                    </div>}
                    {isCollection && <CollectionExplorer manifest={manifest}/>}

                </div>
                </div>
                
                {manifest && manifest?.type != 'Collection' &&
                <div className="p-2 w-full col-span-5 flex flex-col gap-2 min-h-[calc(240px + 12rem)]">
                
                <div className="flex items-center gap-2 px-4">
                    <Breadcrumbs 
                        homeUrl="/iiif"
                        homeLabel="Arkivressurser"
                        parentUrl={manifest.collections?.slice().reverse().map((item: any) => item.uuid)} 
                        parentName={manifest.collections?.slice().reverse().map((item: any) => resolveLanguage(item.label))} 
                        currentName={resolveLanguage(manifest.label)} 
                    />
                
                {neighbours.data && neighbours.total > 1 && <div className="flex items-center gap-2 ml-auto">
                        <Link
                            href={`/iiif/${neighbours.data.first}`}
                            className="flex items-center justify-center p-2 rounded hover:bg-neutral-100 text-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            aria-label="First page"
                        >
                            <PiCaretLineLeft className="w-5 h-5" />
                        </Link>
                        <Link
                            href={`/iiif/${neighbours.data.previous || neighbours.data.last}`}
                            className="flex items-center justify-center p-2 rounded hover:bg-neutral-100 text-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            aria-label="Previous page"
                        >
                            <PiCaretLeft className="w-5 h-5" />
                        </Link>
                        <Link
                            href={`/iiif/${neighbours.data.next || neighbours.data.first}`}
                            className="flex items-center justify-center p-2 rounded hover:bg-neutral-100 text-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            aria-label="Next page"
                        >
                            <PiCaretRight className="w-5 h-5" />
                        </Link>
                         <Link
                            href={`/iiif/${neighbours.data.last}`}
                            className="flex items-center justify-center p-2 rounded hover:bg-neutral-100 text-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            aria-label="Last page"
                        >
                            <PiCaretLineRight className="w-5 h-5" />
                        </Link>
                    </div>}
                    </div>
            
                
                

                {neighbours.data && neighbours.total > 1 && 
                <nav className="flex items-center gap-2 w-full px-4">
                    {neighbours.data.neighbours.map((neighbour: any, index: number) => (
                        <Fragment key={index}>
                            <FileCard fields={neighbour.fields} itemDataset={manifestDataset} currentItem={manifest?.uuid}/>
                        </Fragment>
                    ))}

                    
                </nav>
                }
                </div>
                }
            </div>







    );
}
