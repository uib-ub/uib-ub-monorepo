import { fetchDoc, fetchManifest } from "@/app/api/_utils/actions"
import ImageViewer from "./image-viewer";
import { PiArchive, PiArchiveThin, PiCopyright, PiInfo } from "react-icons/pi";
import IconLink from "@/components/ui/icon-link";
import IIIFToolbar from "./iiif-toolbar";
import Thumbnail from "@/components/image-viewer/thumbnail";
import Link from "next/link";
import CollectionExplorer from "./collection-explorer";

export default async function IIIFPage({params}: {params: Promise<{slug: string[]}>}) {
    const { slug } = await params
    //const manifest = await fetchManifest(manifestId)
    const manifestDoc = slug?.[0] ? await fetchDoc({uuid: slug[0], dataset: 'iiif_*'}) : null
    const manifest = manifestDoc?._source
    const manifestDataset = manifestDoc?._index?.split('-')?.[2]?.split('_')?.[1]
    const isImage = manifest?.type == "Manifest" && manifest?.canvases?.[0]?.image
    const isAudio = manifest?.items?.[0]?.items?.[0]?.items?.[0]?.body?.type === "Sound";
    const audioUrl = isAudio ? manifest.items?.[0]?.items?.[0]?.items?.[0]?.body?.id : null;
    const isCollection = !slug?.[0] || manifest?.type === "Collection";
    
    
    return (
        <div className="h-full w-full">            
            <div className='flex flex-col !h-full !w-full lg:grid lg:grid-cols-5'>                
                <IIIFToolbar manifest={manifest}/>
                <div className='w-full lg:col-span-4 relative !min-h-[40svh] bg-neutral-200'>
                    {isImage && <ImageViewer canvases={manifest.canvases} />}
                    {isAudio && <div className="flex items-center justify-center h-full">
                        <audio controls src={audioUrl} className="w-full max-w-md">
                            Your browser does not support the audio element.
                        </audio>
                    </div>}
                    {isCollection && <CollectionExplorer manifest={manifest} />}

                </div>
                
                
            </div>
        </div>
    );
}
