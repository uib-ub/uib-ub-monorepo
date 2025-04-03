import { fetchDoc, fetchIIIFNeighbours } from "@/app/api/_utils/actions"
import ImageViewer from "./image-viewer";
import { PiArchive, PiArchiveFill, PiCaretLeft, PiCaretLineLeft, PiCaretLineRight, PiCaretRight, PiFolder } from "react-icons/pi";
import CollectionExplorer from "./collection-explorer";
import IIIFMetadataPanel from "./iiif-metadata-panel";
import Link from "next/link";
import { resolveLanguage } from "./iiif-utils";
import Breadcrumbs from "@/components/layout/breadcrumbs";
import FileCard from "./file-card";
import { Fragment } from "react";
import IIIFExpandSummary from "./iiif-expand-summary";
import IIIFInfoSection from "./iiif-info-section";


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
            <div className={`flex flex-col lg:grid lg:grid-cols-5 ${manifest?.type == 'Manifest' ? 'lg:min-h-[calc(100svh-20rem)]' : 'h-full'}`}>
                <div className={`col-span-1 ${manifest?.type == 'Manifest' ? 'hidden lg:block' : 'block'} page-info bg-white break-words border-l-2 border-neutral-200 border-r border-neutral-200 lg:overflow-y-auto ${manifest?.type == 'Manifest' ? 'lg:max-h-[calc(100svh-20rem)]' : 'lg:max-h-[calc(100svh-3rem)]'} overflow-y-auto`}>
            
                <IIIFInfoSection manifest={manifest} neighbours={neighbours} />
                
                
                </div>
            
                          
                <div className={`w-full lg:col-span-4 !min-h-[40svh] ${manifest?.type == 'Manifest' ? 'max-h-[60svh] lg:max-h-full' : 'lg:max-h-[calc(100svh-3rem)]'} bg-neutral-200`}>
                    {isImage && <ImageViewer canvases={manifest.canvases} manifestDataset={manifestDataset} manifestId={manifest.uuid}/>}
                    {manifest?.audio && <div className="flex flex-col gap-4 items-center justify-center h-full hidden lg:flex">
                        <h2 className="text-2xl text-neutral-900 font-semibold">{resolveLanguage(manifest.audio.label)}</h2>
                        
                       {true && <audio controls src={`https://iiif.test.ubbe.no/iiif/audio/stadnamn/${manifestDataset.toUpperCase()}/${manifest.audio.audioFilename}`} className="w-full max-w-md">
                            Your browser does not support the audio element.
                        </audio>}
                    </div>}
                    
                    {isCollection && <CollectionExplorer manifest={manifest}/>}

                </div>
                
                </div>
                {manifest?.type == 'Manifest' && <div className="p-4 lg:hidden bg-white">
                        <IIIFInfoSection manifest={manifest} neighbours={neighbours} />
                </div>}
                
                
                {manifest && manifest?.type != 'Collection' &&
                <div className="p-2 w-full col-span-5 flex flex-col gap-2 min-h-[calc(240px + 12rem)]">
                
                <div className="flex flex-col lg:flex-row items-center gap-2 px-4 pb-4 lg:pb-0">
                    <Breadcrumbs 
                        homeUrl="/iiif"
                        homeLabel="Arkivressurser"
                        parentUrl={manifest.collections?.slice().reverse().slice(0, -1).map((item: any) => item.uuid)} 
                        parentName={manifest.collections?.slice().reverse().slice(0, -1).map((item: any) => resolveLanguage(item.label))} 
                    />
                    <Link href={`/iiif/${manifest.collections?.[0].uuid}`} className="text-accent-900 w-full flex gap-2 items-center lg:w-auto font-semibold bg-accent-100 px-4 py-2 lg:px-2 text-lg lg:text-base lg:py-1 rounded-md no-underline"><PiArchiveFill className="w-4 h-4 text-2xl lg:text-xl text-accent-900" />{resolveLanguage(manifest.collections?.[0].label)}</Link>
                    
                
                {neighbours.data && neighbours.total > 1 && <div className="flex items-center gap-2 lg:ml-auto p-6 lg:p-0">
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
                        <span className="text-neutral-700">{manifest.order} av {neighbours.total}</span>
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
                <nav className="grid grid-cols-2 lg:flex items-center gap-2 w-full px-4">
                    {neighbours.data.neighbours.map((neighbour: any, index: number) => (
                            <div key={index} className="flex-1">
                                <FileCard fields={neighbour.fields} itemDataset={manifestDataset} currentItem={manifest?.uuid}/>
                            </div>
                    ))}
                </nav>
                }
                </div>
                }
            </div>







    );
}
