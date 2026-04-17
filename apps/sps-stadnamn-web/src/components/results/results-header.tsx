import { useContext } from "react"
import { GlobalContext } from "@/state/providers/global-provider"
import { useHideResultsOn, useInitParam } from "@/lib/param-hooks"
import { useQParam } from "@/lib/param-hooks"
import { useGroupParam } from "@/lib/param-hooks"
import useSearchData from "@/state/hooks/search-data"
import { useSourceViewOn } from "@/lib/param-hooks"
import { useOverlayParams } from "@/lib/param-hooks"
import Clickable from "@/components/ui/clickable/clickable"
import useResultCardData from "@/state/hooks/result-card-data"
import { PiCaretUpBold } from "react-icons/pi"
import { PiCaretDownBold } from "react-icons/pi"
import { TitleBadge } from "@/components/ui/badge"
import Spinner from "@/components/svg/Spinner"
import GroupedResultsToggle from "./grouped-results-toggle"
import useListData from "@/state/hooks/list-data"
import ClickableIcon from "@/components/ui/clickable/clickable-icon"
import { PiXBold } from "react-icons/pi"

export default function ResultsHeader({ sameCoordinateCount }: { sameCoordinateCount?: number | null }) {
    const { isMobile } = useContext(GlobalContext)
    const hideResultsOn = useHideResultsOn()
    const qParam = useQParam()
    const group = useGroupParam()
    const { groupTotalHits, docTotalHits, searchLoading } = useSearchData()
    const { listLoading } = useListData()
    const sourceView = useSourceViewOn()
    const { showResults } = useOverlayParams()
    const init = useInitParam()

    const showGroupClose = Boolean(sourceView && group && !init)
    const { resultCardData: groupCardData } = useResultCardData(group, { forceGroupLookup: true })

    const groupFields = groupCardData?.fields || {}
    const toText = (value: unknown): string => {
        if (Array.isArray(value)) return value.filter(Boolean).join(" | ")
        return typeof value === "string" ? value : ""
    }
    const groupTitle = typeof groupCardData?.label === "string" ? groupCardData.label : ""
    const groupAdm1 = toText((groupFields as any).adm1)
    const groupAdm2 = toText((groupFields as any).adm2)
    const groupAdmText = [groupAdm2, groupAdm1].filter(Boolean).join(", ")

    const title = sourceView
        ? (init
            ? (group ? "Same koordinat" : "Andre kjeldeoppslag")
            : (group ? "Underpostar" : "Kjeldeoppslag"))
        : (init ? "Andre namnegrupper" : "Namnegrupper")

    const showGroupInfo = showGroupClose && (groupTitle || groupAdmText)
    const showGroupAsTitleDesktop = Boolean(!isMobile && sourceView && group && !init && (groupTitle || groupAdmText))
    const showGroupInfoInlineDesktop = showGroupInfo && !isMobile && !showGroupAsTitleDesktop

    const isSameCoordinateMode = Boolean(sourceView && init && group)
    const badgeCount = isSameCoordinateMode && typeof sameCoordinateCount === "number"
        ? sameCoordinateCount
        : (sourceView ? docTotalHits?.value ?? 0 : groupTotalHits?.value ?? 0) - (init ? 1 : 0)

    // In "Same koordinat" mode, hide the entire header line if there are no matching items.
    // (The init item is rendered separately, so 0 means nothing to show/expand.)
    if (
        isSameCoordinateMode &&
        typeof sameCoordinateCount === "number" &&
        sameCoordinateCount <= 0 &&
        !(searchLoading || listLoading)
    ) {
        return null
    }

    return (
        <div className="w-full">
            <div className="flex items-center w-full">
                <Clickable
                    aria-expanded={isMobile ? undefined : !hideResultsOn}
                    aria-controls={isMobile ? undefined : "results-panel"}
                    notClickable={isMobile}
                    className="flex items-center gap-2 xl:px-1 flex-1 min-w-0"
                    // When opening, use default results count. When closing, remove param.
                    add={{ hideResults: showResults ? 'on' : 'off' }}
                    remove={[...(isMobile ? ['options'] : [])]}
                >
                    {!isMobile && (
                        <span className="flex w-6 justify-center lg:rotate-180">
                            {showResults ? (
                                <PiCaretDownBold className="text-base" />
                            ) : (
                                <PiCaretUpBold className="text-base" />
                            )}
                        </span>
                    )}

                    <div className={`flex items-center gap-2 flex-1 min-w-0 ${isMobile ? "justify-start" : ""}`}>
                        <div
                            id={isMobile ? 'drawer-title' : 'right-title'}
                            className={`text-sm xl:text-base text-neutral-900 font-sans font-semibold ${init ? 'py-1' : ''} truncate`}
                        >
                            {showGroupAsTitleDesktop ? (
                                <span className="min-w-0 truncate">
                                    {groupTitle ? <span className="font-semibold">{groupTitle}</span> : null}
                                    {groupAdmText ? (
                                        <span className="text-neutral-700 font-normal">
                                            {groupTitle ? " " : ""}
                                            {groupAdmText}
                                        </span>
                                    ) : null}
                                </span>
                            ) : (
                                title
                            )}
                        </div>

                        {(searchLoading || listLoading) ? (
                            <Spinner status="Laster resultat" className="text-lg" />
                        ) : (
                            <TitleBadge
                                className="text-sm bg-neutral-700 text-white"
                                count={badgeCount}
                            />
                        )}
                    </div>
                </Clickable>

                <div className="ml-auto min-w-0 flex items-center gap-2 pr-3 xl:pr-2">
                    {showGroupInfoInlineDesktop && (
                        <div className="min-w-0 flex items-center gap-2 text-sm xl:text-base">
                            {groupTitle ? <span className="font-semibold truncate min-w-0">{groupTitle}</span> : null}
                            {groupAdmText ? <span className="text-neutral-700 truncate min-w-0 flex-1">{groupAdmText}</span> : null}
                        </div>
                    )}

                    <GroupedResultsToggle />
                    {showGroupClose && (
                        <ClickableIcon
                            label="Lukk underoppslag"
                            remove={["group", "sourceView"]}
                            className="btn btn-outline rounded-full text-neutral-900 p-2"
                        >
                            <PiXBold aria-hidden="true" className="text-lg text-neutral-800" />
                        </ClickableIcon>
                    )}
                </div>
            </div>

            {showGroupInfo && isMobile && (
                <div className="min-w-0 flex items-center gap-2 text-sm xl:text-base pt-1">
                    {groupTitle ? <span className="font-semibold truncate min-w-0">{groupTitle}</span> : null}
                    {groupAdmText ? <span className="text-neutral-700 truncate min-w-0 flex-1">{groupAdmText}</span> : null}
                </div>
            )}
        </div>
    )
}