import { useContext } from "react"
import { GlobalContext } from "@/state/providers/global-provider"
import { useHideResultsOn } from "@/lib/param-hooks"
import { useQParam } from "@/lib/param-hooks"
import { useGroupParam } from "@/lib/param-hooks"
import useSearchData from "@/state/hooks/search-data"
import { useSourceViewOn } from "@/lib/param-hooks"
import { useOverlayParams } from "@/lib/param-hooks"
import Clickable from "@/components/ui/clickable/clickable"
import { PiCaretUpBold } from "react-icons/pi"
import { PiCaretDownBold } from "react-icons/pi"
import { TitleBadge } from "@/components/ui/badge"
import Spinner from "@/components/svg/Spinner"
import GroupedResultsToggle from "./grouped-results-toggle"

export default function ResultsHeader() {
    const { isMobile } = useContext(GlobalContext)
    const hideResultsOn = useHideResultsOn()
    const qParam = useQParam()
    const group = useGroupParam()
    const { totalHits, docTotalHits, searchLoading } = useSearchData()
    const sourceView = useSourceViewOn()
    const { showResults } = useOverlayParams()

    return <>
        <Clickable
            aria-expanded={isMobile ? undefined : !hideResultsOn}
            aria-controls={isMobile ? undefined : "results-panel"}
            notClickable={isMobile}
            className="flex items-center gap-1 xl:px-1"
            // When opening, use default results count. When closing, remove param.
            add={{ hideResults: hideResultsOn ? (qParam ? null : 'off') : 'on' }}
            remove={[...(isMobile ? ['options'] : [])]}
        >
            {!isMobile && (
                <span className="flex w-6 justify-center">
                    {showResults ? (
                        <PiCaretUpBold className="text-lg" />
                    ) : (
                        <PiCaretDownBold className="text-lg" />
                    )}
                </span>
            )}

            <div id={isMobile ? 'drawer-title' : 'right-title'} className={`text-sm xl:text-lg text-neutral-900 font-sans ${isMobile ? 'w-full flex justify-end' : ''}`}>
                {group ? 'Kjelder' : 'Treff'}
            </div>

                <>
                    {searchLoading ? (
                        <Spinner status="Laster resultat" className="text-lg" />
                    ) : (
                        <TitleBadge
                            className={` text-sm xl:text-base ${showResults ? 'bg-accent-100 text-accent-900 ' : 'bg-primary-700 text-white '}`}
                            count={sourceView ? docTotalHits?.value ?? 0 : totalHits?.value ?? 0}
                        />
                    )}
                </>
            
        </Clickable>


        <div className="ml-auto">
            <GroupedResultsToggle />
        </div>

        

    </>
}