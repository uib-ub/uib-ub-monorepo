import { fetchDoc, fetchIIFDocByIndex } from "@/app/api/_utils/actions";
import { fetchIIIFStats } from "@/app/api/_utils/stats";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { userAgent } from "next/server";
import { resolveLanguage } from "../iiif-utils";
import CollectionExplorer from "./collection-explorer";
import IIIFInfoSection from "./iiif-info-section";
import IIIFMobileDrawer from "./iiif-mobile-drawer";
import ImageViewer from "./image-viewer";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function maybeRedirectByIndex(slug?: string[]) {
    if (!slug?.[0] || slug.length < 2) return;

    const partOf = slug[0];
    const order = slug[1];

    // Only handle /iiif/<uuid>/<number>
    if (!UUID_RE.test(partOf) || !/^\d+$/.test(order)) return;

    const hit: any = await fetchIIFDocByIndex({ partOf, order });
    const resolvedUuid = hit?.fields?.uuid?.[0];

    if (!resolvedUuid || !UUID_RE.test(resolvedUuid)) {
        notFound();
    }

    redirect(`/iiif/${resolvedUuid}`);
}


export async function generateMetadata({ params }: { params: Promise<{ slug: string[] }> }) {
    const { slug } = await params

    // Ensure metadata for /iiif/<partOf>/<order> resolves to the correct item
    await maybeRedirectByIndex(slug)

    const manifestDoc = slug?.[0] ? await fetchDoc({ uuid: slug[0], dataset: 'iiif_*' }) : null
    const manifest = manifestDoc?._source
    const manifestDataset = manifestDoc?._index?.split('-')?.[2]?.split('_')?.[1]

    const headersList = await headers()
    const proto = headersList.get('x-forwarded-proto') || 'https'
    const host = headersList.get('x-forwarded-host') || headersList.get('host')
    const baseUrl = host ? `${proto}://${host}` : 'http://stadnamn.no'

    const isCollection = manifest?.type === 'Collection'
    const iiifType = isCollection ? 'collection' : 'manifest'
    const manifestUrl = slug?.[0] ? `${baseUrl}/iiif/${iiifType}/${slug[0]}` : undefined
    const firstImageUuid = manifest?.images?.[0]?.uuid
    const firstImageUrl = firstImageUuid && manifestDataset
        ? `https://iiif.spraksamlingane.no/iiif/image/stadnamn/${manifestDataset.toUpperCase()}/${firstImageUuid}/full/max/0/default.jpg`
        : undefined

    const label = manifest?.label ? resolveLanguage(manifest.label) : undefined
    const summary = manifest?.summary ? resolveLanguage(manifest.summary) : undefined

    // Title
    // - For manifests: only the manifest label
    // - For collections: include institution after the collection label when available
    const collections = manifest?.collections as any[] | undefined
    const institution = collections && collections.length > 0 ? collections[collections.length - 1] : undefined
    const institutionLabel = institution?.label ? resolveLanguage(institution.label) : undefined

    let title = label || undefined
    if (isCollection && label && institutionLabel) {
        title = `${label} | ${institutionLabel}`
    }

    // If there is a IIIF summary, use it as description
    // If no summary, try to get labels from seeAlso (alternativeManifests)
    // For top-level (no manifest), don't set description - let layout handle it
    // For items with manifest but no summary or seeAlso, set description to null to suppress meta tag
    const hasSummary = summary && typeof summary === 'string' && summary.trim().length > 0
    let description: string | null | undefined
    
    if (!manifest) {
        description = undefined // Let layout handle it
    } else if (hasSummary) {
        description = summary
    } else if (manifest.alternativeManifests && Array.isArray(manifest.alternativeManifests) && manifest.alternativeManifests.length > 0) {
        // Extract labels from seeAlso/alternativeManifests
        const labels = manifest.alternativeManifests
            .map((item: any) => item.label ? resolveLanguage(item.label) : null)
            .filter((label: string | null) => label && typeof label === 'string' && label.trim().length > 0)
        
        if (labels.length > 0) {
            description = labels.join(', ')
        } else {
            description = null
        }
    } else {
        description = null
    }

    const metadata: any = {
        title,
        alternates: manifestUrl ? {
            types: {
                'application/ld+json': manifestUrl
            }
        } : undefined,
        openGraph: {
            ...(title ? { title } : {}),
            ...(firstImageUrl ? { images: [firstImageUrl] } : {})
        },
    }

    // Only include description when manifest has summary
    // For top-level (no manifest), omit to use layout's default
    // For manifest without summary, set to null to suppress layout's default and prevent meta tag
    if (description !== undefined) {
        if (description !== null) {
            metadata.description = description
            metadata.openGraph.description = description
        } else {
            metadata.description = null
        }
    }

    return metadata
}


export default async function IIIFPage({ params }: { params: Promise<{ slug: string[] }> }) {
    const { slug } = await params

    // Handle pagination URLs like /iiif/<collectionUuid>/<order> without relying on proxy/middleware.
    await maybeRedirectByIndex(slug)

    const manifestDoc = slug?.[0] ? await fetchDoc({ uuid: slug[0], dataset: 'iiif_*' }) : null
    const manifest = manifestDoc?._source
    const manifestDataset = manifestDoc?._index?.split('-')?.[2]?.split('_')?.[1]
    const isImage = manifest?.type == "Manifest" && manifest?.images
    const isCollection = !slug?.[0] || manifest?.type === "Collection";

    // Server-side stats
    let stats: any = manifest?.resourceStats

    if (!slug?.[0]) {
        // Top-level overview
        stats = await fetchIIIFStats()
    }

    const headersList = await headers()
    const device = userAgent({ headers: headersList }).device
    const isMobile = device.type === 'mobile' || device.type === 'tablet'

    // Avoid heavy client-side viewers for bots (Googlebot/Bingbot/etc.). Bots still get og:image
    // from metadata and a plain <img> in the HTML for this page.
    const ua = headersList.get('user-agent') || ''
    const isBot = /bot|crawler|spider|slurp|googlebot|bingbot|duckduckbot|baiduspider|yandexbot/i.test(ua)
    const firstImageUuid = manifest?.images?.[0]?.uuid
    const botPreviewUrl = (isBot && firstImageUuid && manifestDataset)
        ? `https://iiif.spraksamlingane.no/iiif/image/stadnamn/${manifestDataset.toUpperCase()}/${firstImageUuid}/full/max/0/default.jpg`
        : undefined



    return <>



        <div className={`flex h-[calc(100svh-3.5rem)] min-h-0 w-full`}>
            <div className={`${isMobile ? 'hidden lg:block' : ''} h-full w-[20svw] page-info bg-white break-words border-l-2 border-r border-neutral-200 lg:overflow-y-auto overflow-y-auto`}>

                {!isMobile && <div className="flex flex-col min-h-full w-full bg-white">
                    <IIIFInfoSection manifest={manifest} manifestDataset={manifestDataset} stats={stats} />

                </div>}
            </div>




            {!isCollection && (isImage || manifest?.audio) && (
                <div className={`flex-1 min-w-0 bg-neutral-200 flex flex-col`}>
                    {isImage && (
                        <div className="relative flex-1">
                            {botPreviewUrl ? (
                                <img
                                    src={botPreviewUrl}
                                    alt={manifest?.label ? String(resolveLanguage(manifest.label) || '') : ''}
                                    className="w-full h-full object-contain"
                                    loading="eager"
                                />
                            ) : (
                                <ImageViewer images={manifest.images} manifestDataset={manifestDataset} manifestId={manifest.uuid} />
                            )}
                        </div>
                    )}
                    {manifest?.audio && <div className="flex flex-col gap-4 items-center justify-center h-full hidden lg:flex">
                        <h2 className="text-2xl text-neutral-900 font-semibold" id="audio-label">{resolveLanguage(manifest.audio.label)}</h2>

                        <audio aria-labelledby="audio-label" controls src={`https://iiif.spraksamlingane.no/iiif/audio/stadnamn/${manifestDataset.toUpperCase()}/${manifest.audio.uuid}.${manifest.audio.format}`} className="w-full max-w-md">
                            Your browser does not support the audio element.
                        </audio>
                    </div>}
                </div>
            )}
            <CollectionExplorer manifest={manifest} isCollection={isCollection} manifestDataset={manifestDataset} />

        </div>


        {/* Mobile preview drawer (persistent, not dismissable) */}
        {isMobile && <IIIFMobileDrawer manifest={manifest} manifestDataset={manifestDataset} stats={stats} />}








    </>
}
