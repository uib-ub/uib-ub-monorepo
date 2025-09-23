import { fetchDoc } from "@/app/api/_utils/actions"
import ImageViewer from "./image-viewer";
import IIIFThumbnailNav from "./iiif-thumbnail-nav";
import CollectionExplorer from "./collection-explorer";
import { resolveLanguage } from "../iiif-utils";
import IIIFMobileDrawer from "./iiif-mobile-drawer";
import { headers } from "next/headers";
import { userAgent } from "next/server";
import IIIFInfoSection from "./iiif-info-section";
import { fetchIIIFStats } from "@/app/api/_utils/stats";


export default async function IIIFPage({params}: {params: Promise<{slug: string[]}>}) {
    const { slug } = await params

    //const manifest = await fetchManifest(manifestId)
    const manifestDoc = slug?.[0] ? await fetchDoc({uuid: slug[0], dataset: 'iiif_*'}) : null
    const manifest = manifestDoc?._source
    const manifestDataset = manifestDoc?._index?.split('-')?.[2]?.split('_')?.[1]
    const isImage = manifest?.type == "Manifest" && manifest?.images
    const isCollection = !slug?.[0] || manifest?.type === "Collection";

    // Server-side stats
    let stats: any = null
    if (!slug?.[0]) {
        // Top-level overview
        stats = await fetchIIIFStats()
    } else if (isCollection) {
        // Collection page: use childCount if present, otherwise fetch aggregated stats for this collection
        stats = manifest?.childCount ?? await fetchIIIFStats(manifest.uuid)
    } else {
        // Item page (Manifest): use childCount if present, otherwise fetch stats scoped to its collection UUID
        stats = manifest?.childCount ?? await fetchIIIFStats(manifest.uuid)
    }

    const headersList = await headers()
    const device = userAgent({headers: headersList}).device
    const isMobile = device.type === 'mobile'
    
    
    
    return <>

       

<div className={`flex h-[calc(100svh-3.5rem)] min-h-0 w-full`}>
                <div className={`hidden lg:block h-full w-[20svw] page-info bg-white break-words border-l-2 border-neutral-200 border-r border-neutral-200 lg:overflow-y-auto overflow-y-auto`}>
            
               {!isMobile && <IIIFInfoSection manifest={manifest} manifestDataset={manifestDataset} stats={stats} />}
                
                
                </div>

                {isCollection && (
                <CollectionExplorer manifest={manifest} isCollection={isCollection} manifestDataset={manifestDataset}/>
                )}
                {!isCollection && (isImage || manifest?.audio) && (
                <div className={`flex-1 min-w-0 bg-neutral-200 flex flex-col`}>
                    <IIIFThumbnailNav manifest={manifest} manifestDataset={manifestDataset}/>
                    {isImage && <div className="relative flex-1"><ImageViewer images={manifest.images} manifestDataset={manifestDataset} manifestId={manifest.uuid}/></div>}
                    {manifest?.audio && <div className="flex flex-col gap-4 items-center justify-center h-full hidden lg:flex">
                        <h2 className="text-2xl text-neutral-900 font-semibold">{resolveLanguage(manifest.audio.label)}</h2>
                        
                       <audio controls src={`https://iiif.test.ubbe.no/iiif/audio/stadnamn/${manifestDataset.toUpperCase()}/${manifest.audio.uuid}.${manifest.audio.format}`} className="w-full max-w-md">
                            Your browser does not support the audio element.
                        </audio>
                    </div>}
                </div>
                )}
                
                </div>
                

                {/* Mobile preview drawer (persistent, not dismissable) */}
                {isMobile && <IIIFMobileDrawer manifest={manifest} manifestDataset={manifestDataset} stats={stats} />}

                
                
                
                



    </>
}
