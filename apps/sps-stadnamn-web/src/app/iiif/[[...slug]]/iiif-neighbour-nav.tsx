import Link from "next/link";
import { PiArchive, PiArrowElbowRightUp, PiArrowUp, PiArrowUpBold, PiCaretLeftBold, PiCaretLineLeftBold, PiCaretLineRightBold, PiCaretRightBold } from "react-icons/pi";
import { resolveLanguage } from "../iiif-utils";

export default function IIIFNeighbourNav({manifest}: {manifest: any}) {
    if (!manifest) return null
    return (
        <nav className="sticky bottom-3 xl:bottom-0 left-3 xl:left-0 right-3 xl:right-0 w-full mt-auto xl:bg-neutral-50 xl:border-t border-neutral-200">
            <div className="flex flex-row items-center gap-2 p-2">
                {/* Collection link */}
                <Link 
                    href={`/iiif${manifest.partOf ? `/${manifest.partOf}` : ''}`} 
                    className="flex h-10 items-center gap-2 pr-2 bg-neutral-50 rounded-full border-neutral-200 border no-underline min-w-0 flex-shrink" 
                    aria-label="Gå til overordna samling"
                >
                    <div className="bg-white rounded-full p-2 flex-shrink-0">
                        <PiArrowUpBold className="text-xl" />
                    </div>
                    <span className="truncate pr-2 min-w-0">{manifest?.collections?.length > 0 ? resolveLanguage(manifest.collections[0].label) : 'Arkiv'}</span>
                </Link>

                {/* Navigation controls */}
                {manifest.order && manifest.parentLength && manifest.partOf && manifest.parentLength > 1 && (
                    <div className="flex items-center xl:gap-2 divide-x divide-x-neutral-300 bg-neutral-50 h-10 rounded-full xl:ml-auto border-neutral-200 border flex-shrink-0">
                        {/* First button */}
                        <Link 
                            aria-current={manifest.order === 1 ? "page" : undefined} 
                            aria-label="Første element" 
                            href={`/iiif/${manifest.partOf}/1`} 
                            className="flex items-center justify-center bg-white border border-white rounded-l-full xl:rounded-full p-2"
                        >
                            <PiCaretLineLeftBold className="text-xl" />
                        </Link>

                        {/* Previous button */}
                        <Link
                            aria-current={manifest.order === 1 ? "page" : undefined}
                            aria-label="Forrige element"
                            href={`/iiif/${manifest.partOf}/${Math.max(manifest.order - 1, 1)}`}
                            className="flex items-center justify-center bg-white border border-white xl:rounded-full p-2"
                        >
                            <PiCaretLeftBold className="text-xl" />
                        </Link>
                        
                        {/* Counter */}
                        <span className="p-2 font-semibold">
                            {manifest.order}/{manifest.parentLength}
                        </span>

                        {/* Next button */}
                        <Link 
                            aria-current={manifest.order === manifest.parentLength ? "page" : undefined} 
                            aria-label="Neste element" 
                            href={`/iiif/${manifest.partOf}/${Math.min(manifest.order + 1, manifest.parentLength)}`} 
                            className="flex items-center justify-center bg-white xl:rounded-full p-2"
                        >
                            <PiCaretRightBold className="text-xl" />
                        </Link>

                        {/* Last button */}
                        <Link 
                            aria-current={manifest.order === manifest.parentLength ? "page" : undefined} 
                            aria-label="Siste element" 
                            href={`/iiif/${manifest.partOf}/${manifest.parentLength}`} 
                            className="flex items-center justify-center bg-white rounded-r-full xl:rounded-full p-2"
                        >
                            <PiCaretLineRightBold className="text-xl" />
                        </Link>
                    </div>
                )}
            </div>
        </nav>
    )
}