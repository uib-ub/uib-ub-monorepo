"use client"
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
import { RoundIconButton } from "@/components/ui/clickable/round-icon-button";
import IconLink from "@/components/ui/icon-link";
import { useIIIFSessionStore } from '@/state/zustand/iiif-session-store';
import dynamic from 'next/dynamic';
import { useRouter } from "next/navigation";
import { useState } from "react";
import { PiArrowElbowLeftUpBold, PiCaretLeftBold, PiCaretLineLeftBold, PiCaretLineRightBold, PiCaretRightBold, PiDotsThreeBold, PiDownloadSimpleBold, PiX, PiXBold } from "react-icons/pi";
import { resolveLanguage } from '../iiif-utils';

const IIIFDownloader = dynamic(() => import('@/components/download/iiif-downloader'), { ssr: false })

export default function IIIFNeighbourNav({ manifest, isMobile, manifestDataset }: { manifest: any, isMobile: boolean, manifestDataset?: string }) {


    const isCollection = manifest?.type === 'Collection'
    const [isDownloading, setIsDownloading] = useState(false)
    const [downloaderJob, setDownloaderJob] = useState<any | null>(null)
    const [isNavigating, setIsNavigating] = useState(false)
    const navOpen = useIIIFSessionStore((s) => s.navOpen)
    const setNavOpen = useIIIFSessionStore((s) => s.setNavOpen)
    const searchContext = useIIIFSessionStore((s) => s.searchContext)
    const setReturnFocusUuid = useIIIFSessionStore((s) => s.setReturnFocusUuid)
    const router = useRouter()

    if (!manifest) return null

    const currentCollectionUuid = isCollection ? (manifest.uuid as string | undefined) : (manifest.partOf as string | undefined)
    const hasSearch = !!searchContext && !!searchContext.query
    const searchCollectionUuid = searchContext?.collectionUuid ?? null
    const currentKey = currentCollectionUuid ?? null

    // Show back-to-search when:
    // - there is a stored search, and
    // - we are in a different collection than where the search was done, or in a non-collection view
    const showBackToSearch =
        hasSearch &&
        (!!searchContext?.query) &&
        (!isCollection || searchCollectionUuid !== currentKey)

    const backToSearchHref = !hasSearch
        ? undefined
        : (searchCollectionUuid
            ? `/iiif/${searchCollectionUuid}?q=${encodeURIComponent(searchContext!.query)}`
            : `/iiif?q=${encodeURIComponent(searchContext!.query)}`)

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

    const handleNeighbourNav = async (e: React.MouseEvent, order: number) => {
        // Keep the link semantics (href) but do client-side navigation without a server redirect,
        // so the explorer doesn't hard-reload.
        e.preventDefault()
        if (isNavigating) return
        if (!manifest?.partOf) return

        try {
            setIsNavigating(true)
            const res = await fetch(`/api/iiif/redirect-by-index?partOf=${encodeURIComponent(manifest.partOf)}&order=${encodeURIComponent(String(order))}`)
            if (!res.ok) return
            const data = await res.json()
            if (data?.uuid) {
                router.push(`/iiif/${data.uuid}`)
            }
        } finally {
            setIsNavigating(false)
        }
    }

    return (
        <>
            <nav className={`flex items-center gap-2 w-full ${manifest.type == 'Manifest' ? `absolute top-14 ${isMobile ? 'left-0' : 'left-[20svw]'} m-2` : ''}`}>
                {/* Collection link (hidden on mobile when neighbour nav is open) */}
                {(!isMobile || !navOpen || isCollection) && (
                    <RoundIconButton
                        href={`/iiif${manifest.partOf ? `/${manifest.partOf}` : ''}`}
                        label="Gå til overordna samling">
                        <PiArrowElbowLeftUpBold className="text-xl xl:text-base" />
                    </RoundIconButton>
                )}

                {(manifest.order && manifest.parentLength && manifest.partOf && manifest.parentLength > 1) ? (
                    <>
                        {(!isMobile || navOpen || isCollection) && (
                            <div
                                id="iiif-neighbour-nav-bar"
                                className={`${isMobile && navOpen ? 'h-10 px-2 shadow-lg' : 'h-full px-2'} flex items-center font-semibold bg-neutral-950/70 text-white rounded-full backdrop-blur-sm`}
                            >
                                {/* First button */}
                                {manifest.parentLength > 3 && <IconLink
                                    label="Første element i samlinga"
                                    className="rounded-full p-1 xl:p-2"
                                    href={`/iiif/${manifest.partOf}/1`}
                                    prefetch={false}
                                    onClick={(e: React.MouseEvent) => handleNeighbourNav(e, 1)}
                                >
                                    <PiCaretLineLeftBold className="text-xl xl:text-base" />
                                </IconLink>}

                                {/* Previous button */}
                                <IconLink
                                    aria-current={manifest.order === 1 ? "page" : undefined}
                                    className="rounded-full p-1 xl:p-2"
                                    label="Forrige element i samlinga"
                                    href={`/iiif/${manifest.partOf}/${Math.max(manifest.order - 1, 1)}`}
                                    prefetch={false}
                                    onClick={(e: React.MouseEvent) => handleNeighbourNav(e, Math.max(manifest.order - 1, 1))}
                                >
                                    <PiCaretLeftBold className="text-xl xl:text-base" />
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
                                    prefetch={false}
                                    onClick={(e: React.MouseEvent) => handleNeighbourNav(e, Math.min(manifest.order + 1, manifest.parentLength))}
                                >
                                    <PiCaretRightBold className="text-xl xl:text-base" />
                                </IconLink>

                                {/* Last button */}
                                {manifest.parentLength > 3 && <IconLink
                                    aria-current={manifest.order === manifest.parentLength ? "page" : undefined}
                                    className="rounded-full p-1 xl:p-2"
                                    label="Siste element i samlinga"
                                    href={`/iiif/${manifest.partOf}/${manifest.parentLength}`}
                                    prefetch={false}
                                    onClick={(e: React.MouseEvent) => handleNeighbourNav(e, manifest.parentLength)}
                                >
                                    <PiCaretLineRightBold className="text-xl xl:text-base" />
                                </IconLink>}
                            </div>
                        )}
                    </>
                ) : null}

                {/* Download button (hidden on mobile when neighbour nav is open) */}
                {(!isMobile || !navOpen || isCollection) && ((isCollection ? (manifest.childCount?.images && manifest.length == manifest.childCount?.manifests) : true)) && <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <RoundIconButton
                            label="Last ned">
                            <PiDownloadSimpleBold className="text-xl xl:text-base" />
                        </RoundIconButton>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogCancel className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
                            <PiXBold className="text-xl" aria-hidden="true" />
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

                {showBackToSearch && backToSearchHref && (
                    <RoundIconButton
                        className=""
                        href={backToSearchHref}
                        onClick={() => {
                            // Works for both Manifest and Collection detail pages.
                            // We always want to focus the opened result card when returning.
                            if (manifest?.uuid) {
                                setReturnFocusUuid(manifest.uuid)
                            }
                        }}
                        label="Tilbake til søk"
                    >
                        <PiCaretLeftBold className="text-xl xl:text-base" />
                    </RoundIconButton>
                )}

                {/* Mobile toggle on the right side */}
                {isMobile && !isCollection && (
                    <RoundIconButton
                        onClick={() => setNavOpen(!navOpen)}
                        aria-expanded={navOpen}
                        aria-controls="iiif-neighbour-nav-bar"
                        label={navOpen ? "Skjul navigasjon" : "Vis navigasjon"}
                    >
                        {navOpen ? (
                            <PiX className="text-xl xl:text-base" />
                        ) : (
                            <PiDotsThreeBold className="text-xl xl:text-base" />
                        )}
                    </RoundIconButton>
                )}

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