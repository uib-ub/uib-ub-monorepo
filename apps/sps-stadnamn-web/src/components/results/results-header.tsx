import { useContext } from "react"
import { GlobalContext } from "@/state/providers/global-provider"
import { useHideResultsOn, useInitParam } from "@/lib/param-hooks"
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
import useListData from "@/state/hooks/list-data"

export default function ResultsHeader() {
    const { isMobile } = useContext(GlobalContext)
    const hideResultsOn = useHideResultsOn()
    const qParam = useQParam()
    const group = useGroupParam()
    const { groupTotalHits, docTotalHits, searchLoading } = useSearchData()
    const { listLoading } = useListData()
    const sourceView = useSourceViewOn()
    const { showResults } = useOverlayParams()
    const init = useInitParam()

    return <>
        <Clickable
            aria-expanded={isMobile ? undefined : !hideResultsOn}
            aria-controls={isMobile ? undefined : "results-panel"}
            notClickable={isMobile}
            className="flex items-center gap-2 xl:px-1 "
            // When opening, use default results count. When closing, remove param.
            add={{ hideResults: showResults ? 'on': 'off' }}
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

            <div id={isMobile ? 'drawer-title' : 'right-title'} className={`text-sm xl:text-lg text-neutral-900 font-sans ${init ? 'py-1' : ''} ${isMobile ? 'w-full flex justify-end' : ''}`}>
                {sourceView
                    ? (init ? "Andre kjeldeoppslag" : (group ? "Underoppslag" : "Kjeldeoppslag"))
                    : (init ? "Andre namnegrupper" : "Namnegrupper")
                }
            </div>

                <>
                    {(searchLoading || listLoading) ? (
                        <Spinner status="Laster resultat" className="text-lg" />
                    ) : (
                        <TitleBadge
                            className={` text-sm bg-neutral-700 text-white`}
                            count={(sourceView ? docTotalHits?.value ?? 0 : groupTotalHits?.value ?? 0) - (init ? 1 : 0)}
                        />
                    )}
                </>
            
        </Clickable>


        <div className="ml-auto self-center">
            <GroupedResultsToggle />
        </div>

        

    </>
}