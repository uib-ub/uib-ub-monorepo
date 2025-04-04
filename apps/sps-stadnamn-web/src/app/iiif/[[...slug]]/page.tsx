import { fetchDoc } from "@/app/api/_utils/actions"
import { fetchIIIFNeighbours } from "@/app/api/iiif/neighbours";
import ImageViewer from "./image-viewer";
import { PiCaretLeft, PiCaretLineLeft, PiCaretLineRight, PiCaretRight, PiFolder } from "react-icons/pi";
import CollectionExplorer from "./collection-explorer";
import Link from "next/link";
import { resolveLanguage } from "../iiif-utils";
import Breadcrumbs from "@/components/layout/breadcrumbs";
import FileCard from "./file-card";
import IIIFInfoSection from "./iiif-info-section";
import IconLink from "@/components/ui/icon-link";


export default async function IIIFPage({params}: {params: Promise<{slug: string[]}>}) {
    const { slug } = await params
    //const manifest = await fetchManifest(manifestId)
    const manifestDoc = slug?.[0] ? await fetchDoc({uuid: slug[0], dataset: 'iiif_*'}) : null
    const manifest = manifestDoc?._source
    const neighbours = (manifest?.order && manifest?.partOf) ? await fetchIIIFNeighbours(manifest.order, manifest.partOf) : {data: null, total: 0}
    const manifestDataset = manifestDoc?._index?.split('-')?.[2]?.split('_')?.[1]
    const isImage = manifest?.type == "Manifest" && manifest?.images
    const isCollection = !slug?.[0] || manifest?.type === "Collection";
    
    
    return (

       

            <div className='flex flex-col !h-full !w-full'>   
            <div className={`flex flex-col lg:grid lg:grid-cols-5 ${manifest?.type == 'Manifest' ? 'lg:min-h-[calc(100svh-20rem)]' : 'h-full'}`}>
                <div className={`col-span-1 ${manifest?.type == 'Manifest' ? 'hidden lg:block' : 'block'} page-info bg-white break-words border-l-2 border-neutral-200 border-r border-neutral-200 lg:overflow-y-auto ${manifest?.type == 'Manifest' ? 'lg:max-h-[calc(100svh-20rem)]' : 'lg:max-h-[calc(100svh-3rem)]'} overflow-y-auto`}>
            
                <IIIFInfoSection manifest={manifest} neighbours={neighbours} manifestDataset={manifestDataset} />
                
                
                </div>
            
                          
                <div className={`w-full lg:col-span-4 !min-h-[40svh] ${manifest?.type == 'Manifest' ? 'max-h-[60svh] lg:max-h-full' : 'lg:max-h-[calc(100svh-3rem)]'} bg-neutral-200`}>
                    {isImage && <ImageViewer images={manifest.images} manifestDataset={manifestDataset} manifestId={manifest.uuid}/>}
                    {manifest?.audio && <div className="flex flex-col gap-4 items-center justify-center h-full hidden lg:flex">
                        <h2 className="text-2xl text-neutral-900 font-semibold">{resolveLanguage(manifest.audio.label)}</h2>
                        
                       <audio controls src={`https://iiif.test.ubbe.no/iiif/audio/stadnamn/${manifestDataset.toUpperCase()}/${manifest.audio.uuid}.${manifest.audio.format}`} className="w-full max-w-md">
                            Your browser does not support the audio element.
                        </audio>
                    </div>}
                    
                    {isCollection && <CollectionExplorer manifest={manifest}/>}

                </div>
                
                </div>
                {manifest?.type == 'Manifest' && <div className="p-4 lg:hidden bg-white">
                        <IIIFInfoSection manifest={manifest} neighbours={neighbours} manifestDataset={manifestDataset} />
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
                    <Link href={`/iiif/${manifest.collections?.[0].uuid}`} className=" w-full lg:w-auto flex gap-2 items-center text-accent-800 no-underline text-xl lg:text-base p-2 lg:p-0">
                        {resolveLanguage(manifest.collections?.[0].label)}
                    </Link>
                    
                
                {neighbours.data && neighbours.total > 1 && <div className="flex items-center gap-2 lg:ml-auto p-6 lg:p-0">
                        <IconLink label="Første element" href={`/iiif/${neighbours.data.first}`} className="flex items-center justify-center p-2 rounded hover:bg-neutral-100 text-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed">
                            <PiCaretLineLeft className="w-5 h-5" />
                        </IconLink>
                        <IconLink label="Forrige element" href={`/iiif/${neighbours.data.previous || neighbours.data.last}`} className="flex items-center justify-center p-2 rounded hover:bg-neutral-100 text-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed">
                            <PiCaretLeft className="w-5 h-5" />
                        </IconLink>
                        <span className="text-neutral-700">{manifest.order} av {neighbours.total}</span>
                        <IconLink label="Neste element" href={`/iiif/${neighbours.data.next || neighbours.data.first}`} className="flex items-center justify-center p-2 rounded hover:bg-neutral-100 text-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed">
                            <PiCaretRight className="w-5 h-5" />
                        </IconLink>
                         <IconLink label="Siste element" href={`/iiif/${neighbours.data.last}`} className="flex items-center justify-center p-2 rounded hover:bg-neutral-100 text-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed">
                            <PiCaretLineRight className="w-5 h-5" />
                        </IconLink>
                    </div>}
                    </div>

                
            
                
                

                {neighbours.data && neighbours.total > 1 && 
                <nav className="grid grid-cols-2 lg:flex items-center gap-2 w-full px-4">
                    {neighbours.data.neighbours.map((neighbour: any, index: number) => (
                            <div key={index} className="flex-1">
                                <FileCard item={neighbour._source} itemDataset={manifestDataset} currentItem={manifest?.uuid}/>
                            </div>
                    ))}
                </nav>
                }
                </div>
                }
            </div>







    );
}
