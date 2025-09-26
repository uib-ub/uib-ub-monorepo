import Link from "next/link";
import { PiArchive, PiArrowElbowLeftUpBold, PiArrowElbowRightUp, PiArrowUp, PiArrowUpBold, PiCaretLeftBold, PiCaretLineLeftBold, PiCaretLineRightBold, PiCaretRightBold, PiHouse } from "react-icons/pi";
import { resolveLanguage } from "../iiif-utils";
import { RoundIconButton } from "@/components/ui/clickable/round-icon-button";

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
                    <div className="flex xl:gap-2 h-full">
                        {/* First button */}
                        <RoundIconButton
                            aria-current={manifest.order === 1 ? "page" : undefined}
                            label="Første element i samlinga"
                            className="rounded-r-none xl:rounded-full"
                            href={`/iiif/${manifest.partOf}/1`}                        >
                            <PiCaretLineLeftBold className="text-xl xl:text-base"/>
                        </RoundIconButton>

                        {/* Previous button */}
                        <RoundIconButton    
                            aria-current={manifest.order === 1 ? "page" : undefined}
                            className="rounded-none xl:rounded-full"
                            label="Forrige element i samlinga"
                            href={`/iiif/${manifest.partOf}/${Math.max(manifest.order - 1, 1)}`}
                        >
                            <PiCaretLeftBold className="text-xl xl:text-base"/>
                        </RoundIconButton>

                        {/* Counter */}
                        <div className="flex items-center p-2 px-4 font-semibold bg-neutral-950/70 text-white xl:rounded-full backdrop-blur-sm">
                            {manifest.order}/{manifest.parentLength}
                        </div>

                        {/* Next button */}
                        <RoundIconButton
                            aria-current={manifest.order === manifest.parentLength ? "page" : undefined}
                            label="Neste element i samlinga"
                            className="rounded-none xl:rounded-full"
                            href={`/iiif/${manifest.partOf}/${Math.min(manifest.order + 1, manifest.parentLength)}`}
                        >
                            <PiCaretRightBold className="text-xl xl:text-base"/>
                        </RoundIconButton>

                        {/* Last button */}
                        <RoundIconButton
                            aria-current={manifest.order === manifest.parentLength ? "page" : undefined}
                            className="rounded-l-none xl:rounded-full"
                            label="Siste element i samlinga"
                            href={`/iiif/${manifest.partOf}/${manifest.parentLength}`}
                        >
                            <PiCaretLineRightBold className="text-xl xl:text-base"/>
                        </RoundIconButton>
                    </div>
                ) : null}

        </nav>
    )
}