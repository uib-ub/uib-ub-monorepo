import { fetchManifest } from "@/app/api/_utils/actions"
import ImageViewer from "./image-viewer";

export default async function IIIFPage({params}: {params: {manifestId: string}}) {
    const { manifestId } = params
    const manifest = await fetchManifest(manifestId)
    const isImage = manifest.items?.[0]?.items?.[0]?.items?.[0]?.body?.type === "Image";
    const isAudio = manifest.items?.[0]?.items?.[0]?.items?.[0]?.body?.type === "Sound";
    const audioUrl = isAudio ? manifest.items?.[0]?.items?.[0]?.items?.[0]?.body?.id : null;
    
    return (
        <div className="h-full w-full">
            <div className='flex flex-col !h-full !w-full lg:grid lg:grid-cols-5'>
                <div className='w-full lg:col-span-4 relative !min-h-[40svh] bg-neutral-200'>
                    {isImage ? (
                        <ImageViewer manifest={manifest} />
                    ) : isAudio ? (
                        <div className="flex items-center justify-center h-full">
                            <audio controls src={audioUrl} className="w-full max-w-md">
                                Your browser does not support the audio element.
                            </audio>
                        </div>
                    ) : (
                        <pre>{JSON.stringify(manifest, null, 2)}</pre>
                    )}
                </div>
                
                {manifest && (
                    <div className='space-y-2 text-sm text-gray-800 p-8 page-info bg-white break-words border-l-2 border-neutral-200'>
                        <h1>{manifest.label?.none?.[0] || manifest.label?.nb?.[0] || manifest.label?.nn?.[0]}</h1>
                        <ul className="text-base !px-0">
                            {manifest.metadata?.filter((item: Record<string, any>) => 
                                item.label?.no?.[0] != 'Skannede sedler'
                            ).map((item: Record<string, any>, index: number) => (
                                <li key={index} className='flex flex-col'>
                                    <span className='font-semibold'>
                                        {item.label?.none?.[0] || item.label?.no?.[0] || item.label?.nb?.[0]}
                                    </span>
                                    <span>{item.value?.none?.[0]}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
}
