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
import IIIFThumbnailNav from "./iiif-thumbnail-nav";


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
            <div className={`flex flex-col lg:grid lg:grid-cols-5 ${manifest?.type == 'Manifest' ? 'lg:min-h-[calc(100svh-7rem)]' : 'h-full'}`}>
                <div className={`col-span-1 ${manifest?.type == 'Manifest' ? 'hidden lg:block' : 'block'} page-info bg-white break-words border-l-2 border-neutral-200 border-r border-neutral-200 lg:overflow-y-auto ${manifest?.type == 'Manifest' ? 'lg:max-h-[calc(100svh-7rem)]' : 'lg:max-h-[calc(100svh-3rem)]'} overflow-y-auto`}>
            
               <IIIFInfoSection manifest={manifest} neighbours={neighbours} manifestDataset={manifestDataset} />
                
                
                </div>
            
                          
                <div className={`w-full lg:col-span-4 bg-neutral-200`}>
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
                { manifest?.type == 'Manifest' && <div className="p-4 lg:hidden bg-white">
                        <IIIFInfoSection manifest={manifest} neighbours={neighbours} manifestDataset={manifestDataset} />
                </div>}
                
                
                {manifest && manifest?.type != 'Collection' &&
                <IIIFThumbnailNav manifest={manifest} neighbours={neighbours} manifestDataset={manifestDataset}/>
                }
            </div>







    );
}
