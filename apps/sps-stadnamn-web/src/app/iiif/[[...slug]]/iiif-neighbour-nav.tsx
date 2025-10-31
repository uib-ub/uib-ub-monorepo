"use client"
import { PiArrowElbowLeftUpBold, PiCaretLeftBold, PiCaretLineLeftBold, PiCaretLineRightBold, PiCaretRightBold, PiDownloadSimpleBold, PiXBold } from "react-icons/pi";
import { RoundIconButton } from "@/components/ui/clickable/round-icon-button";
import IconLink from "@/components/ui/icon-link";
import { useState } from "react";
import dynamic from 'next/dynamic';
import { resolveLanguage } from '../iiif-utils';
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const IIIFDownloader = dynamic(() => import('@/components/download/iiif-downloader'), { ssr: false })

export default function IIIFNeighbourNav({manifest, isMobile, manifestDataset}: {manifest: any, isMobile: boolean, manifestDataset?: string}) {
    if (!manifest) return null

	const isCollection = manifest?.type === 'Collection'
    const [isDownloading, setIsDownloading] = useState(false)
    const [downloaderJob, setDownloaderJob] = useState<any | null>(null)

	const handleDownload = async (format: string) => {
        try {
            setIsDownloading(true)
			if (isCollection && (format === 'pdf' || format === 'multipdf' || format === 'jpgs')) {
                setDownloaderJob({
                    kind: 'collection',
                    collectionUuid: manifest.uuid,
                    format: format === 'pdf' ? 'pdf' : (format === 'multipdf' ? 'multipdf' : 'jpgs'),
                    filename: resolveLanguage(manifest.label) || manifest.uuid,
                })
			} else if (!isCollection && manifest.type === 'Manifest' && (format === 'jpg' || format === 'pdf')) {
                setDownloaderJob({
                    kind: 'viewer',
                    manifestId: manifest.uuid,
                    manifestDataset: manifestDataset || manifest.dataset || '',
                    images: manifest.images || [],
                    format: format,
                    filename: resolveLanguage(manifest.label) || manifest.uuid,
                })
            }
        } catch (error) {
			console.error('Error downloading:', error);
        } finally {
            // handled in onDone
		}
	};

    return (
        <>
        <nav className={`${isMobile ? 'fixed bottom-6 left-4 right-4 z-[4001]' : ''} flex items-center gap-2 ${manifest.type == 'Manifest' ? 'fixed top-14 left-[20svw] m-2' : ''}`}>
                {/* Collection link */}
                <RoundIconButton 
                    href={`/iiif${manifest.partOf ? `/${manifest.partOf}` : ''}`} 
                    label="Gå til overordna samling">
                    <PiArrowElbowLeftUpBold className="text-xl xl:text-base"/>
                </RoundIconButton>

                {(manifest.order && manifest.parentLength && manifest.partOf && manifest.parentLength > 1) ? (
                    <div className="flex h-full items-center font-semibold bg-neutral-950/70 text-white rounded-full backdrop-blur-sm px-2">
                        {/* First button */}
                        {manifest.parentLength > 3 && <IconLink
                            label="Første element i samlinga"
                            className="rounded-full p-1 xl:p-2"
                            href={`/iiif/${manifest.partOf}/1`}                        >
                            <PiCaretLineLeftBold className="text-xl xl:text-base"/>
                        </IconLink>}

                        {/* Previous button */}
                        <IconLink    
                            aria-current={manifest.order === 1 ? "page" : undefined}
                            className="rounded-full p-1 xl:p-2"
                            label="Forrige element i samlinga"
                            href={`/iiif/${manifest.partOf}/${Math.max(manifest.order - 1, 1)}`}
                        >
                            <PiCaretLeftBold className="text-xl xl:text-base"/>
                        </IconLink>

				{/* Counter */}
                        <div className="flex items-center p-1 xl:p-2">
                            {manifest.order}/{manifest.parentLength}
                        </div>

                        {/* Next button */}
                        <IconLink
                            aria-current={manifest.order === manifest.parentLength ? "page" : undefined}
                            label="Neste element i samlinga"
                            className="rounded-full p-1 xl:p-2"
                            href={`/iiif/${manifest.partOf}/${Math.min(manifest.order + 1, manifest.parentLength)}`}
                        >
                            <PiCaretRightBold className="text-xl xl:text-base"/>
                        </IconLink>

                        {/* Last button */}
                        {manifest.parentLength > 3 && <IconLink
                            aria-current={manifest.order === manifest.parentLength ? "page" : undefined}
                            className="rounded-full p-1 xl:p-2"
                            label="Siste element i samlinga"
                            href={`/iiif/${manifest.partOf}/${manifest.parentLength}`}
                        >
                            <PiCaretLineRightBold className="text-xl xl:text-base"/>
                        </IconLink>}
					</div>
                ) : null}

			{/* Download button */}
			{((isCollection ? (manifest.childCount?.images && manifest.length == manifest.childCount?.manifests) : true)) && <AlertDialog>
				<AlertDialogTrigger asChild>
					<RoundIconButton 
						label="Last ned">
						<PiDownloadSimpleBold className="text-xl xl:text-base" />
					</RoundIconButton>
				</AlertDialogTrigger>
                <AlertDialogContent>
					<AlertDialogCancel className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
						<PiXBold className="text-xl" aria-hidden="true"/>
						<span className="sr-only">Close</span>
					</AlertDialogCancel>
					<AlertDialogHeader>
						<AlertDialogTitle>Last ned</AlertDialogTitle>
						<AlertDialogDescription>
							Vel ønska format for nedlasting.
						</AlertDialogDescription>
					</AlertDialogHeader>
                        {isDownloading ? (
                            <div className="py-8 text-center">Laster ned…</div>
                        ) : (
            <AlertDialogFooter>
                                <div className="flex flex-row gap-2 justify-center w-full">
                                    <AlertDialogCancel className="btn btn-outline">Avbryt</AlertDialogCancel>
                                    {isCollection ? (
                                        <>
                                            <AlertDialogAction 
                                                className="btn btn-outline"
                                                onClick={() => handleDownload('pdf')}
                                            >
                                                PDF (ein fil)
                                            </AlertDialogAction>
                                            <AlertDialogAction 
                                                className="btn btn-outline"
                                                onClick={() => handleDownload('multipdf')}
                                            >
                                                PDF (fleire, zip)
                                            </AlertDialogAction>
                                            <AlertDialogAction 
                                                className="btn btn-outline"
                                                onClick={() => handleDownload('jpgs')}
                                            >
                                                JPG (zip)
                                            </AlertDialogAction>
                                        </>
                                    ) : (
                                        <>
                                            <AlertDialogAction 
                                                className="btn btn-outline"
                                                onClick={() => handleDownload('jpg')}
                                            >
                                                JPG
                                            </AlertDialogAction>
                                            <AlertDialogAction 
                                                className="btn btn-outline"
                                                onClick={() => handleDownload('pdf')}
                                            >
                                                PDF
                                            </AlertDialogAction>
                                        </>
                                    )}
                                </div>
            </AlertDialogFooter>
                        )}
				</AlertDialogContent>
			</AlertDialog>}

        </nav>
        {downloaderJob && 
            <IIIFDownloader
                job={downloaderJob}
                onDone={() => { setIsDownloading(false); setDownloaderJob(null) }}
            />
        }
        </>
    )
}