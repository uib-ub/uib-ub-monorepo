import AudioPlayerList from "@/components/audio/audio-player-list";
import AudioPreviewButtons from "@/components/audio/audio-preview-buttons";
import Clickable from "@/components/ui/clickable/clickable";
import ClickableIcon from "@/components/ui/clickable/clickable-icon";
import type { ParamProps } from "@/components/ui/clickable/param-types";
import IconButton from "@/components/ui/icon-button";
import { datasetTitles } from "@/config/metadata-config";
import { useActivePoint, useCenterParam, useGroupParam, useHighlightPoint, useInitParam, usePoint, useSourceViewOn, useZoomParam } from "@/lib/param-hooks";
import { stringToBase64Url } from "@/lib/param-utils";
import { panPointIntoView } from "@/lib/map-utils";
import { buildTreeParam } from "@/lib/tree-param";
import { getBnr, getGnr } from "@/lib/utils";
import useResultCardData from "@/state/hooks/result-card-data";
import { GlobalContext } from "@/state/providers/global-provider";
import { useSessionStore } from "@/state/zustand/session-store";
import { useSearchParams } from "next/navigation";
import { useState, useContext, useEffect } from "react";
import { PiCaretRightBold, PiCheck, PiLinkSimple, PiMagnifyingGlass, PiMapPin, PiMapPinFill, PiMicroscope, PiPushPin, PiX, PiXBold } from "react-icons/pi";
import Carousel from "@/components/results/carousel";
import ResultCardTitle from "@/components/results/card/result-card-title";
import { TextItemsSection } from "@/components/results/card/text-items-section";
import { LinkItemsSection } from "@/components/results/card/link-items-section";
import CoordinateTypeInfo from "@/components/results/card/coordinate-type-info";
import { ResultCardSkeleton } from "@/components/results/result-skeletons";
import DistanceBadge from "@/components/results/distance-badge";
import { Badge, TitleBadge } from "@/components/ui/badge";
import { replaceScrollParamInHistory } from "@/components/results/scroll-hooks";

function getLatLngFromLocationField(locationField: unknown): [number, number] | null {
    // Search hits use `fields.location[0].coordinates` (like `ResultItem`).
    // Group/doc lookups have historically used `fields.location.coordinates`.
    const coords =
        Array.isArray(locationField)
            ? (locationField as any)?.[0]?.coordinates
            : (locationField as any)?.coordinates;

    if (
        !Array.isArray(coords) ||
        coords.length !== 2 ||
        !Number.isFinite(Number(coords[0])) ||
        !Number.isFinite(Number(coords[1]))
    ) {
        return null;
    }

    // Stored as [lon, lat]; map expects [lat, lon].
    return [Number(coords[1]), Number(coords[0])];
}

function SosiInline({
    rawSosi,
    sosiVocab,
}: {
    rawSosi: unknown;
    sosiVocab: Record<string, { label?: string }>;
}) {
    const sosiArray = Array.isArray(rawSosi) ? rawSosi : rawSosi ? [rawSosi] : [];
    const sosiTypes = sosiArray.reduce((acc: Record<string, string>, item: string) => {
        const key = String(item);
        acc[key] = sosiVocab[key]?.label || key;
        return acc;
    }, {});
    const sosiTypeKeys = Object.keys(sosiTypes);
    if (!sosiTypeKeys.length) return null;

    const showAllSosi = sosiTypeKeys.length <= 3;
    const visibleSosiTypeKeys = showAllSosi ? sosiTypeKeys : sosiTypeKeys.slice(0, 2);
    const additionalSosiCount = showAllSosi ? 0 : sosiTypeKeys.length - visibleSosiTypeKeys.length;

    return (
        <>
            <span className="text-neutral-700">|</span>
            <span className="inline-flex items-center gap-1 text-sm text-neutral-700">
                <span>{visibleSosiTypeKeys.map((typeKey) => sosiTypes[typeKey]).join(", ")}</span>
                {additionalSosiCount > 0 && (
                    <span className="inline-flex items-baseline py-0.5 rounded-full text-xs text-neutral-700 whitespace-nowrap">
                    &nbsp;+&nbsp;{additionalSosiCount}
                    </span>
                )}
            </span>
        </>
    );
}

type CoordinateButtonProps = {
    isActive: boolean;
} & Omit<ParamProps, "children" | "label">;

function CoordinateButton({ isActive, className, ...rest }: CoordinateButtonProps) {
    return (
        <ClickableIcon
            label="Vis i kartet"
            className={`btn btn-outline btn-compact rounded-full w-10 h-10 flex items-center justify-center shrink-0 border-neutral-200 bg-white shadow-none ${
                isActive ? "border-accent-800 bg-accent-800 text-white" : "text-neutral-900"
            } ${className ?? ""}`}
            {...rest}
        >
            {isActive ? (
                <PiMapPinFill
                    aria-hidden="true"
                    className="text-xl text-white"
                />
            ) : (
                <PiMapPin
                    aria-hidden="true"
                    className="text-xl text-neutral-800"
                />
            )}
        </ClickableIcon>
    );
}

function focusPointWithoutZoomOut(
    map: any,
    point: [number, number],
    isMobile: boolean,
    snappedPosition: "bottom" | "middle" | "top",
) {
    if (!map) return;

    const currentZoom = typeof map.getZoom === "function" ? (map.getZoom() as number) : undefined;
    const targetZoom = Math.max(currentZoom ?? 15, 15);

    // If the user is zoomed out, zoom in to a useful level without ever zooming out.
    if (currentZoom === undefined || currentZoom < 15) {
        map.flyTo?.(point, targetZoom, {
            duration: 0.25,
            maxZoom: 18,
            padding: [50, 50],
        });
        return;
    }

    // Otherwise only pan when the point is outside the padded viewport.
    const maxDrawer = snappedPosition !== "bottom";
    panPointIntoView(map, point, isMobile, maxDrawer);
}

function GroupBottomToolbar({
    groupData,
    groupTotal,
    variant,
    scrollIndex,
}: {
    groupData: any;
    groupTotal?: number;
    variant: "single" | "multi";
    scrollIndex?: number;
}) {
    const searchParams = useSearchParams();
    const sourceViewOn = useSourceViewOn();
    const { mapFunctionRef, isMobile } = useContext(GlobalContext);
    const snappedPosition = useSessionStore((s) => s.snappedPosition);
    const setSnappedPosition = useSessionStore((s) => s.setSnappedPosition);
    const highlightPoint = useHighlightPoint();
    const center = useCenterParam();
    const zoom = useZoomParam();
    const group = useGroupParam();
    const init = useInitParam();
    const setSourceViewResetUrl = useSessionStore((s) => s.setSourceViewResetUrl);

    if (!groupData) return null;
    const scrollValue = typeof scrollIndex === "number" ? scrollIndex : null;

    const isMulti = variant === "multi";

    // Keep the previous visibility rules.
    if (isMulti) {
        if (sourceViewOn) return null;
        if (!groupTotal || groupTotal === 1) return null;
    }

    const fields = groupData.fields || {};

    const groupLatLng = getLatLngFromLocationField((fields as any)?.location);

    const isActivePoint =
        !!highlightPoint &&
        !!groupLatLng &&
        Math.abs(highlightPoint[0] - groupLatLng[0]) < 0.000001 &&
        Math.abs(highlightPoint[1] - groupLatLng[1]) < 0.000001;

    const pointValue = groupLatLng ? `${groupLatLng[0]},${groupLatLng[1]}` : null;

    const coordinateType = Array.isArray((fields as any)["coordinateType"])
        ? (fields as any)["coordinateType"]?.[0]
        : (fields as any)?.coordinateType;

    const datasets = groupData.datasets as string[] | undefined;
    const dataset = Array.isArray(datasets) && datasets.length > 0 ? datasets[0] : undefined;

    const docUuid = (groupData as any)?.fields?.uuid?.[0] ?? null;
    const uuidUrl = (() => {
        if (!docUuid) return null;
        const token = String(docUuid).trim();
        const base = process.env.NODE_ENV == "development" ? "" : "https://stadnamn.no";
        if (token.startsWith("http://") || token.startsWith("https://")) return token;
        if (token.startsWith("/uuid/")) return `${base}${token}`;
        return `${base}/uuid/${token}`;
    })();

    const groupInitParamValue = isMulti ? stringToBase64Url(groupData.id) : groupData.id;
    const isInit = Boolean(init && init === groupInitParamValue);

    const coordinateClick = () => {
        if (!groupLatLng) return;
        focusPointWithoutZoomOut(mapFunctionRef.current, groupLatLng, isMobile, snappedPosition);
        if (isMobile && snappedPosition == "top") setSnappedPosition("middle");

    };

    const toolbarItems = (
        <>
            {!groupLatLng ? (
                <span className="text-sm text-neutral-700 px-2 whitespace-nowrap">
                    Utan koordinat
                </span>
            ) : (
                <>
                    {!init && (
                        <CoordinateButton
                            isActive={isActivePoint}
                            onClick={coordinateClick}
                            add={{ activePoint: pointValue, scroll: scrollValue }}
                        />
                    )}
                    {!group && !isInit &&  (
                        <ClickableIcon
                            label="Vel som startpunkt"
                            add={{ init: groupInitParamValue, point: pointValue, scroll: scrollValue }}
                            remove={["activePoint"]}
                            className="btn text-neutral-900 btn-outline btn-compact rounded-full w-10 h-10 flex items-center justify-center border-neutral-200 bg-white shadow-none"
                        >
                            <PiPushPin aria-hidden="true" className="text-base" />
                        </ClickableIcon>
                    )}
                </>
            )}
        </>
    );

    if (isMulti) {
        return (
            <div className={`px-0 ml-auto mt-auto ${isMobile ? "px-3" : "px-2"}`}>
                <div className="flex flex-row items-center gap-2">
                    {toolbarItems}
                    {(groupTotal ?? 0) > 0 && (
                        <Clickable
                            className="btn btn-outline btn-compact rounded-full items-center gap-2 !pr-2 flex h-10 pl-4 shadow-none"
                            // IMPORTANT: scroll should not be transferred to the sourceView URL
                            only={{
                                sourceView: "on",
                                group: stringToBase64Url(groupData.id),
                                center,
                                zoom,
                            }}
                            onClick={() => {
                                // Keep the current list URL (reset target) synced with the clicked card.
                                // But do NOT include `scroll` in the URL we navigate to (sourceView).
                                const nextCurrent = new URLSearchParams(searchParams);
                                if (scrollValue != null) {
                                    nextCurrent.set("scroll", String(scrollValue));
                                } else {
                                    nextCurrent.delete("scroll");
                                }
                                const resetUrl = nextCurrent.toString() ? `/search?${nextCurrent.toString()}` : "/search";
                                setSourceViewResetUrl(resetUrl);
                                replaceScrollParamInHistory({
                                    scrollIndex: scrollValue,
                                    basePathname: "/search",
                                    searchParams: nextCurrent,
                                });
                            }}
                        >
                            Underpostar
                            <Badge count={groupTotal ?? 0} className="bg-neutral-200 text-black px-2 py-0.5" />
                        </Clickable>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="w-full px-3 mt-auto flex flex-col gap-2">
            <div className="flex items-center gap-2 flex-wrap">
                <div className={`ml-auto flex items-center gap-3 ${isActivePoint ? "mt-1" : ""}`}>
                    {toolbarItems}
                    <Clickable
                        link={true}
                        href={uuidUrl || ""}
                        disabled={!uuidUrl}
                        onClick={() => {
                            // Ensure the current /search history entry remembers which card we came from,
                            // without leaking `scroll` into the uuid route URL.
                            replaceScrollParamInHistory({ scrollIndex: scrollValue });
                        }}
                        className="btn btn-outline btn-compact rounded-full items-center gap-2 !pr-2 flex h-10 pl-4 shrink-0 border-neutral-200 bg-white shadow-none"
                    >
                        Detaljar
                        <PiCaretRightBold aria-hidden="true" className="text-primary-700" />
                    </Clickable>
                </div>
            </div>
            {isActivePoint && sourceViewOn && (!group || init) &&(
                <div className="min-w-0 flex-1 rounded-md border border-neutral-200 bg-neutral-50 px-2 py-1">
                    {coordinateType ? (
                        <CoordinateTypeInfo coordinateType={coordinateType} />
                    ) : (
                        <span className="text-sm text-neutral-700">
                            Opphavleg koordinat i{" "}
                            {dataset ? datasetTitles[dataset] || dataset : "kjelde"}
                        </span>
                    )}
                </div>
            )}
        </div>
    );
}

export default function ResultCard({
    itemId,
    scrollIndex,
    hasIiif,
    distanceMeters,
    mobilePreview,
    highlight,
    onLoadingChange,
}: {
    itemId: string | null;
    scrollIndex?: number;
    hasIiif?: boolean;
    distanceMeters?: number | null;
    mobilePreview?: boolean | undefined;
    highlight?: any;
    onLoadingChange?: (loading: boolean) => void;
}) {
    const { resultCardData, resultCardLoading, resultCardTotal } = useResultCardData(itemId);
    const iiifItems = resultCardData?.iiifItems;
    const textItems = resultCardData?.textItems;
    const linkItems = resultCardData?.linkItems;
    const audioItems = resultCardData?.audioItems;
    const { sosiVocab } = useContext(GlobalContext);
    const setSnappedPosition = useSessionStore((s) => s.setSnappedPosition);
    const sourceViewOn = useSourceViewOn();
    const group = useGroupParam();
    const point = usePoint();
    const { isMobile } = useContext(GlobalContext);
    const init = useInitParam();

    useEffect(() => {
        if (!onLoadingChange) return;
        onLoadingChange(Boolean(resultCardLoading));
    }, [onLoadingChange, resultCardLoading]);

    const toText = (value: unknown): string => {
        if (Array.isArray(value)) return value.filter(Boolean).join(" | ");
        return typeof value === "string" ? value : "";
    };

    const fields = resultCardData?.fields || {};
    const datasets = resultCardData?.datasets;

    const dataset = Array.isArray(datasets) && datasets.length > 0 ? datasets[0] : undefined;
    const hasSingleSource = resultCardTotal === 1;
    // Use group fields as primary data source; docData is deprecated and no longer required.
    const source = undefined as any;
    const label = resultCardData?.label
    // Group-level adm* (for header when there are multiple sources)
    const groupAdm1 = toText(fields["group.adm1"]);
    const groupAdm2 = toText(fields["group.adm2"]);
    const groupAdm3 = toText(fields["group.adm3"]);

    const groupAdmPrimary = groupAdm1 || groupAdm2 || groupAdm3 || "";
    const groupAdmText =
        groupAdmPrimary &&
        `${groupAdm2 && groupAdm1 && groupAdm2 !== groupAdm1 ? `${groupAdm2}, ` : ""}${groupAdmPrimary}`.trim();

    // For breadcrumbs: always use the item's own adm*, not group.*
    const plainAdm1 = toText(fields.adm1);
    const plainAdm2 = toText(fields.adm2);

    const adm1 = plainAdm1 || (source ? toText((source as any).adm1) : "");
    const adm2 = plainAdm2 || (source ? toText((source as any).adm2) : "");
    const admText = `${adm2 && adm1 && adm2 !== adm1 ? `${adm2}, ` : ""}${adm1}`.trim();

    const rawSosi = source?.sosi ?? fields.sosi;
    const treeCadastreHit: any = { fields };
    const cadastre = {
        within: toText((fields as any)?.within).split(" | ")[0].trim(),
        gnr: (toText((fields as any)?.gnr) || toText(getGnr(treeCadastreHit))).split(" | ")[0].trim(),
        bnr: (toText((fields as any)?.bnr) || toText(getBnr(treeCadastreHit))).split(" | ")[0].trim(),
        mnr: toText((fields as any)?.mnr).split(" | ")[0].trim(),
        lnr: toText((fields as any)?.lnr).split(" | ")[0].trim(),
        knr: toText((fields as any)?.knr).split(" | ")[0].trim(),
        parentLabel: toText((fields as any)?.parentLabel).split(" | ")[0].trim(),
    };
    const hasWithin = Boolean(cadastre.within);
    const parentNumber = cadastre.gnr || cadastre.mnr;
    const brukNumber = cadastre.bnr || cadastre.lnr;
    const isBruk = Boolean(brukNumber);
    const gardSegment = [parentNumber, cadastre.parentLabel].filter(Boolean).join(" ").trim();
    const finalCadastreSegment = [isBruk ? brukNumber : parentNumber, label].filter(Boolean).join(" ").trim() || (isBruk ? "Bruk" : "Gard");
    const docUuid = toText((fields as any)?.uuid).split(" | ")[0].trim();
    const noWithinSubtitle = [adm2, adm1].filter(Boolean).join(", ");
    const titleLabel = label || "Utan namn";
    const flatSingleSubtitle = noWithinSubtitle || admText;
    const hasGnrCadastre = Boolean(cadastre.gnr);
    const primaryCadastreNumber = cadastre.gnr || cadastre.mnr;
    const secondaryCadastreNumber = cadastre.bnr || cadastre.lnr;
    const primaryCadastreLabel = hasGnrCadastre ? "Gardsnr" : "Matrikkelnr";
    const secondaryCadastreLabel = hasGnrCadastre ? "Bruksnr" : "Løpenr";
    const cadastreDisplayText = !primaryCadastreNumber
        ? ""
        : secondaryCadastreNumber && cadastre.parentLabel
            ? `${primaryCadastreLabel}: ${primaryCadastreNumber} | ${secondaryCadastreNumber} ${cadastre.parentLabel}`
            : secondaryCadastreNumber
                ? `${primaryCadastreLabel}: ${primaryCadastreNumber} | ${secondaryCadastreLabel}: ${secondaryCadastreNumber}`
                : `${primaryCadastreLabel}: ${primaryCadastreNumber}`;
    const rawSosiArray = Array.isArray(rawSosi) ? rawSosi : rawSosi ? [rawSosi] : [];
    const sosiLabels = rawSosiArray.map((item) => {
        const key = String(item);
        return (sosiVocab as any)?.[key]?.label || key;
    });
    const hasSosi = sosiLabels.length > 0;
    const normalizedSosiLabels = sosiLabels.map((value) => value.trim().toLowerCase());
    const hasSosiGard = normalizedSosiLabels.includes("gard");
    const hasSosiBruk = normalizedSosiLabels.includes("bruk");
    const replaceSosiWithCadastre = Boolean(cadastreDisplayText) && (hasSosiGard || (hasSosiBruk && Boolean(secondaryCadastreNumber)));


    const isInit = Boolean(itemId && init && init === stringToBase64Url(itemId));

    
    // Scroll to top when init group changes (when clicking "vel" button)


    const treeSavedQuery = useSessionStore((s) => s.treeSavedQuery)
    const setTreeSavedQuery = useSessionStore((s) => s.setTreeSavedQuery)

    const handleEnterTreeFromBreadcrumb = () => {
        if (treeSavedQuery) return
        if (typeof window === "undefined") return
        const currentSearch = window.location.search || ""
        if (!currentSearch) return
        setTreeSavedQuery(currentSearch)
    }





    // Group coordinates are stored as [lon, lat]; convert to [lat, lon] for the map.
    const groupLatLng = getLatLngFromLocationField((resultCardData?.fields as any)?.location);
    const activePointValue = groupLatLng ? `${groupLatLng[0]},${groupLatLng[1]}` : null;

    if (resultCardLoading) {
        return <ResultCardSkeleton hasIiif={hasIiif} />
    }

    if (!sourceViewOn && !resultCardData?.["id"]) {
        console.log("Group ID not found");
        const props = {
            message: `Group ID not found: ${JSON.stringify(resultCardData)} ${itemId}`,
        };

        fetch("/api/error", {
            method: "POST",
            body: JSON.stringify(props),
        });
        return (
            <div className="p-2">
                Kunne ikkje lasta inn gruppe {JSON.stringify(resultCardData)} {itemId}
            </div>
        );
    }





    return (
        <div
            className={`relative flex min-w-0 flex-col  ${mobilePreview ? 'gap-1 flex-wrap pb-8 pt-3' : 'gap-3 py-4'}`}
        >
            <div className={`min-w-0 w-full flex flex-col px-3 ${mobilePreview ? 'gap-1 flex-wrap' : 'gap-3'}`}>
                {datasets && datasets.length == 1 && <div className={`flex items-center gap-2 ${mobilePreview ? 'flex-wrap' : ''}`}>
                    {datasets && datasets.length == 1 && (
                        <span className={`uppercase tracking-wider text-neutral-700 ${mobilePreview ? 'text-xs' : 'text-sm'}`}>{datasetTitles[datasets[0]] || datasets[0]}</span>
                    )}
                    
                </div>}
                {isInit && !(init && group) && (
                    <div className={`absolute flex items-end gap-2 ${isMobile ? 'top-3 right-3 flex-col items-end' : 'gap-2 items-center right-2 top-2'}`}>
                        <ClickableIcon
                            label="Lukk framheva gruppe"
                            remove={["activePoint", "activeYear", "activeName", "init", "resultLimit"]}
                            onClick={() => {
                               setSnappedPosition("bottom");
                            }}
                            className={`btn btn-outline rounded-full text-neutral-900 p-2`}
                        >
                            <PiXBold aria-hidden="true" className={`${'text-lg'} text-neutral-800`} />
                        </ClickableIcon>
                    </div>
                )}
                {!isInit && point && typeof distanceMeters === "number" && Number.isFinite(distanceMeters) && (
                    <DistanceBadge className="absolute right-3 top-3" meters={distanceMeters} />
                )}

                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-3 flex-wrap">
                        <ResultCardTitle
                            isInit={isInit}
                            label={titleLabel}
                            cadastrePrefix=""
                            mobilePreview={mobilePreview}
                            additionalLabels={resultCardData?.additionalLabels as string[] | undefined ?? []}
                            audioItems={audioItems}
                        />
                    </div>
                    

                    {groupAdmText && (resultCardTotal ?? 0) > 1 && (
                        <div className="text-sm text-neutral-800 flex items-center gap-1 flex-wrap">
                            <span>{groupAdmText}</span>
                            {sourceViewOn && (
                                replaceSosiWithCadastre ? (
                                    <>
                                        <span className="text-neutral-700">|</span>
                                        <span>{cadastreDisplayText}</span>
                                    </>
                                ) : (
                                    <>
                                        <SosiInline rawSosi={rawSosi} sosiVocab={sosiVocab as any} />
                                        {cadastreDisplayText && (
                                            <>
                                                <span className="text-neutral-700">{hasSosi ? "-" : "|"}</span>
                                                <span>{cadastreDisplayText}</span>
                                            </>
                                        )}
                                    </>
                                )
                            )}
                        </div>
                    )}

                    {hasSingleSource && (
                        <>
                            {hasWithin ? (
                                <div className="text-sm text-neutral-800 flex items-center gap-1 flex-wrap">
                                    {adm1 && dataset ? (
                                        <Clickable
                                            link
                                            className="breadcrumb-link"
                                            only={{ tree: buildTreeParam({ dataset, adm1 }) }}
                                            onClick={handleEnterTreeFromBreadcrumb}
                                        >
                                            {adm1}
                                        </Clickable>
                                    ) : (
                                        adm1 && <span>{adm1}</span>
                                    )}
                                    {adm1 && <span className="text-neutral-700">/</span>}
                                    {adm2 && dataset ? (
                                        <Clickable
                                            link
                                            className="breadcrumb-link"
                                            only={{ tree: buildTreeParam({ dataset, adm1, adm2 }) }}
                                            onClick={handleEnterTreeFromBreadcrumb}
                                        >
                                            {adm2}
                                        </Clickable>
                                    ) : (
                                        adm2 && <span>{adm2}</span>
                                    )}
                                    {(adm1 || adm2) && (isBruk ? gardSegment : finalCadastreSegment) && <span className="text-neutral-700">/</span>}
                                    {isBruk && gardSegment && dataset ? (
                                        <Clickable
                                            link
                                            className="breadcrumb-link"
                                            only={{ tree: buildTreeParam({ dataset, adm1, adm2, uuid: cadastre.within }), doc: cadastre.within }}
                                            onClick={handleEnterTreeFromBreadcrumb}
                                        >
                                            {gardSegment}
                                        </Clickable>
                                    ) : (
                                        isBruk && gardSegment && <span>{gardSegment}</span>
                                    )}
                                    {isBruk && gardSegment && <span className="text-neutral-700">/</span>}
                                    {dataset && docUuid ? (
                                        <Clickable
                                            link
                                            className="breadcrumb-link"
                                            only={{
                                                tree: buildTreeParam({
                                                    dataset,
                                                    adm1,
                                                    adm2,
                                                    uuid: isBruk ? cadastre.within : docUuid,
                                                }),
                                                doc: docUuid,
                                                point: activePointValue,
                                            }}
                                            onClick={handleEnterTreeFromBreadcrumb}
                                        >
                                            {finalCadastreSegment}
                                        </Clickable>
                                    ) : (
                                        <span>{finalCadastreSegment}</span>
                                    )}
                                </div>
                            ) : (
                                flatSingleSubtitle && (
                                    <div className="text-sm text-neutral-800 flex items-center gap-1 flex-wrap">
                                        <span>{flatSingleSubtitle}</span>
                                        {sourceViewOn && (
                                            replaceSosiWithCadastre ? (
                                                <>
                                                    <span className="text-neutral-700">|</span>
                                                    <span>{cadastreDisplayText}</span>
                                                </>
                                            ) : (
                                                <>
                                                    <SosiInline rawSosi={rawSosi} sosiVocab={sosiVocab as any} />
                                                    {cadastreDisplayText && (
                                                        <>
                                                            <span className="text-neutral-700">{hasSosi ? "-" : "|"}</span>
                                                            <span>{cadastreDisplayText}</span>
                                                        </>
                                                    )}
                                                </>
                                            )
                                        )}
                                    </div>
                                )
                            )}
                        </>
                    )}
                </div>
                
            </div>
            

            {iiifItems?.length > 0 && <>
                    <Carousel items={iiifItems} />
                </>
            }
            {!mobilePreview && Array.isArray(audioItems) && audioItems.length > 0 && (
                <AudioPlayerList
                    recordings={audioItems}
                    showArchiveLink
                />
            )}                
            {textItems?.length > 0 ? (
                <TextItemsSection textItems={textItems} highlight={highlight} />
            ) : (
                linkItems?.length > 0 && <LinkItemsSection linkItems={linkItems} />
            )}

            {!mobilePreview && (
                <>
                    <GroupBottomToolbar scrollIndex={scrollIndex} groupData={resultCardData} groupTotal={resultCardTotal} variant="multi" />
                    {hasSingleSource && <GroupBottomToolbar scrollIndex={scrollIndex} groupData={resultCardData} variant="single" />}
                </>
            )}

        </div>
    );
}
