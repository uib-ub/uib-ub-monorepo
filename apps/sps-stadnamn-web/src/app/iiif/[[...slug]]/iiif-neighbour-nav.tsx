import Link from "next/link";
import { PiArchive, PiArrowElbowLeftUpBold, PiArrowElbowRightUp, PiArrowUp, PiArrowUpBold, PiCaretLeftBold, PiCaretLineLeftBold, PiCaretLineRightBold, PiCaretRightBold, PiHouse } from "react-icons/pi";
import { resolveLanguage } from "../iiif-utils";
import { RoundIconButton } from "@/components/ui/clickable/round-icon-button";
import IconButton from "@/components/ui/icon-button";
import IconLink from "@/components/ui/icon-link";

export default function IIIFNeighbourNav({manifest, isMobile}: {manifest: any, isMobile: boolean}) {
    if (!manifest) return null

    return (
        <nav className={`${isMobile ? 'fixed bottom-6 left-4 right-4' : ''} flex items-center gap-2`}>
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

        </nav>
    )
}