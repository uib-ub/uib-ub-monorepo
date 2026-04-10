import AudioPlayerList from "@/components/audio/audio-player-list";
import AudioPreviewButtons from "@/components/audio/audio-preview-buttons";
import Clickable from "@/components/ui/clickable/clickable";
import ClickableIcon from "@/components/ui/clickable/clickable-icon";
import type { ParamProps } from "@/components/ui/clickable/param-types";
import IconButton from "@/components/ui/icon-button";
import { datasetTitles } from "@/config/metadata-config";
import { useActivePoint, useCenterParam, useGroupParam, useInitDecoded, useInitParam, usePoint, useSourceViewOn, useZoomParam } from "@/lib/param-hooks";
import { stringToBase64Url } from "@/lib/param-utils";
import { panPointIntoView } from "@/lib/map-utils";
import { buildTreeParam } from "@/lib/tree-param";
import { getBnr, getGnr } from "@/lib/utils";
import useResultCardData from "@/state/hooks/result-card-data";
import { GlobalContext } from "@/state/providers/global-provider";
import { useSessionStore } from "@/state/zustand/session-store";
import { useContext, useState } from "react";
import { PiCaretRightBold, PiCheck, PiLinkSimple, PiMapPin, PiMapPinFill, PiX, PiXBold } from "react-icons/pi";
import Carousel from "@/components/results/carousel";
import ResultCardTitle from "@/components/results/card/result-card-title";
import { TextItemsSection } from "@/components/results/card/text-items-section";
import { LinkItemsSection } from "@/components/results/card/link-items-section";
import CoordinateTypeInfo from "@/components/results/card/coordinate-type-info";
import { ResultCardSkeleton } from "@/components/results/result-skeletons";
import DistanceBadge from "@/components/results/distance-badge";
import { Badge, TitleBadge } from "@/components/ui/badge";

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
            className={`inline-flex items-center justify-center w-8 h-8 rounded-full border btn btn-outline shrink-0 ${
                isActive ? "border-accent-800 bg-accent-800 text-white" : "border-neutral-300"
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

function GroupBottomToolbarMulti({
    groupData,
    groupTotal,
}: {
    groupData: any;
    groupTotal?: number;
}) {
    const sourceViewOn = useSourceViewOn();
    const { mapFunctionRef, isMobile, currentUrl } = useContext(GlobalContext);
    const snappedPosition = useSessionStore((s) => s.snappedPosition);
    const setSnappedPosition = useSessionStore((s) => s.setSnappedPosition);
    const activePoint = useActivePoint();
    const init = useInitParam()
    const center = useCenterParam()
    const zoom = useZoomParam()
    const setSourceViewResetUrl = useSessionStore((s) => s.setSourceViewResetUrl)
    if (!groupData || sourceViewOn || !groupTotal || groupTotal === 1) {
        return null;
    }

    const rawGroupCoordinates = groupData?.fields?.location?.coordinates;
    const groupLatLng: [number, number] | null = rawGroupCoordinates
        ? [Number(rawGroupCoordinates[1]), Number(rawGroupCoordinates[0])]
        : null;
    const activePointValue = rawGroupCoordinates
        ? `${rawGroupCoordinates[1]},${rawGroupCoordinates[0]}`
        : null;
    const isActivePoint =
        !!activePoint &&
        !!groupLatLng &&
        Math.abs(activePoint[0] - groupLatLng[0]) < 0.000001 &&
        Math.abs(activePoint[1] - groupLatLng[1]) < 0.000001;

    return (
        <div className={`px-0 ml-auto mt-auto ${isMobile ? 'px-3' : 'px-2'}`}>
            <div className="flex flex-row items-center gap-2">
                {!groupLatLng ? (
                    <span className="text-sm text-neutral-700 px-2 whitespace-nowrap">
                        Utan koordinat
                    </span>
                ) : 
                    <CoordinateButton
                        isActive={isActivePoint}
                        onClick={() => {
                            focusPointWithoutZoomOut(mapFunctionRef.current, groupLatLng, isMobile, snappedPosition);
                            if (isMobile && snappedPosition !== "bottom") {
                                setSnappedPosition("bottom");
                            }
                        }}
                        remove={["activePoint"]}
                        add={{ init: groupData.id, point: activePointValue }}
                    />
                }


                
                    

                {groupTotal > 0 && (
                    <Clickable
                        className="btn btn-outline btn-compact rounded-full items-center gap-2 !pr-1 flex"
                        only={{
                            sourceView: "on",
                            group: stringToBase64Url(groupData.id),
                            center,
                            zoom
                        }}
                        onClick={() => {
                            if (!currentUrl.current) return
                            setSourceViewResetUrl(currentUrl.current)
                        }}
                    >
                        <span className="text-sm">Underoppslag</span><Badge count={groupTotal} className="bg-primary-700 text-white" />
                    </Clickable>
                )}
            </div>
        </div>
    );
}

function GroupBottomToolbarSingle({
    groupData,
    isSingleSource,
}: {
    groupData: any;
    isSingleSource: boolean;
}) {
    const { mapFunctionRef, isMobile } = useContext(GlobalContext);
    const snappedPosition = useSessionStore((s) => s.snappedPosition);
    const setSnappedPosition = useSessionStore((s) => s.setSnappedPosition);
    const activePointCoords = useActivePoint();
    const [linkCopied, setLinkCopied] = useState(false);
    const init = useInitParam()

    if (!groupData || !isSingleSource) {
        return null;
    }

    const fields = groupData.fields || {};
    const datasets = groupData.datasets as string[] | undefined;
    const dataset = Array.isArray(datasets) && datasets.length > 0 ? datasets[0] : undefined;

    const rawGroupCoordinates = fields?.location?.coordinates;
    const groupLatLng: [number, number] | null = rawGroupCoordinates
        ? [Number(rawGroupCoordinates[1]), Number(rawGroupCoordinates[0])]
        : null;

    const isActivePoint =
        !!activePointCoords &&
        !!groupLatLng &&
        Math.abs(activePointCoords[0] - groupLatLng[0]) < 0.000001 &&
        Math.abs(activePointCoords[1] - groupLatLng[1]) < 0.000001;

    const coordinateType = Array.isArray((fields as any)["coordinateType"])
        ? (fields as any)["coordinateType"]?.[0]
        : (fields as any)?.coordinateType;

    const docUuid = (groupData as any)?.fields?.uuid?.[0] ?? null;
    const uuidUrl = (() => {
        if (!docUuid) return null;
        const token = String(docUuid).trim();
        const base = process.env.NODE_ENV == "development" ? "" : "https://stadnamn.no";
        if (token.startsWith("http://") || token.startsWith("https://")) return token;
        if (token.startsWith("/uuid/")) return `${base}${token}`;
        return `${base}/uuid/${token}`;
    })();

    const activePointValue = groupLatLng ? `${groupLatLng[0]},${groupLatLng[1]}` : null;

    return (
        <div className="w-full px-3 mt-auto flex flex-col gap-2">
            <div className="flex items-center gap-2 flex-wrap">
                
                {isActivePoint && false && (
                    <span className="basis-full h-0" aria-hidden="true" />
                )}
                <div className={`ml-auto flex items-center gap-2 ${isActivePoint ? "mt-1" : ""}`}>
                    {groupLatLng && (
                        <CoordinateButton
                            isActive={isActivePoint}
                            add={{ init: groupData.id, point: activePointValue }}
                            onClick={() => {
                                focusPointWithoutZoomOut(mapFunctionRef.current, groupLatLng, isMobile, snappedPosition);
                                if (isMobile && snappedPosition !== "bottom") {
                                    setSnappedPosition("bottom");
                                }
                            }}
                        />
                    )}
                    {false &&<IconButton
                        label={linkCopied ? "Lenke kopiert" : "Kopier lenke"}
                        onClick={async () => {
                            if (!uuidUrl || !navigator?.clipboard) return;
                            await navigator.clipboard.writeText(uuidUrl);
                            setLinkCopied(true);
                            setTimeout(() => setLinkCopied(false), 2000);
                        }}
                        disabled={!uuidUrl}
                        className={`inline-flex items-center justify-center w-8 h-8 rounded-full border btn btn-outline shrink-0 ${
                            linkCopied
                                ? "border-accent-800 bg-accent-800 text-white"
                                : "border-neutral-300"
                        }`}
                    >
                        {linkCopied ? (
                            <PiCheck aria-hidden="true" className="text-lg" />
                        ) : (
                            <PiLinkSimple aria-hidden="true" className="text-lg" />
                        )}
                    </IconButton>}
                    <Clickable
                        link={true}
                        href={uuidUrl || ""}
                        disabled={!uuidUrl}
                        className="inline-flex pr-2 items-center justify-center h-8 rounded-full border border-neutral-300 btn btn-outline shrink-0"
                    >
                        Detaljar
                        <PiCaretRightBold
                            aria-hidden="true"
                            className="text-primary-700"
                        />
                    </Clickable>
                </div>
            </div>
            {isActivePoint && (
                <div className="flex items-center gap-2">
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
                    <ClickableIcon label="Lukk koordinatinformasjon" remove={["activePoint"]} className="h-6 w-6 p-1 btn btn-outline rounded-full text-neutral-900" >
                    <PiX className="text-sm" />
                  </ClickableIcon>
                  </div>
                )}            
        </div>
    );
}

export default function ResultCard({
    itemId,
    hasIiif,
    distanceMeters,
    mobilePreview,
    highlight,
}: {
    itemId: string | null;
    hasIiif?: boolean;
    distanceMeters?: number | null;
    mobilePreview?: boolean | undefined;
    highlight?: any;
}) {
    const { resultCardData, resultCardLoading, resultCardTotal } = useResultCardData(itemId);
    const iiifItems = resultCardData?.iiifItems;
    const textItems = resultCardData?.textItems;
    const linkItems = resultCardData?.linkItems;
    const audioItems = resultCardData?.audioItems;
    const { sosiVocab } = useContext(GlobalContext);
    const snappedPosition = useSessionStore((s) => s.snappedPosition);
    const setSnappedPosition = useSessionStore((s) => s.setSnappedPosition);
    const sourceViewOn = useSourceViewOn();
    const group = useGroupParam();
    const point = usePoint();
    const initDecoded = useInitDecoded();
    const { isMobile } = useContext(GlobalContext);

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


    const isInit = Boolean(initDecoded && itemId === initDecoded)

    
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
    const rawGroupCoordinates = resultCardData?.fields?.location?.coordinates;
    const groupLatLng: [number, number] | null = rawGroupCoordinates
        ? [Number(rawGroupCoordinates[1]), Number(rawGroupCoordinates[0])]
        : null;
    const activePointValue = groupLatLng ? `${groupLatLng[0]},${groupLatLng[1]}` : null;

    if (resultCardLoading) {
        return <ResultCardSkeleton hasIiif={hasIiif} />;
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
        <div className={`relative flex min-w-0 flex-col  ${mobilePreview ? 'gap-1 flex-wrap pb-8 pt-3' : 'gap-3 py-4'}`}>
            <div className={`min-w-0 w-full flex flex-col px-3 ${mobilePreview ? 'gap-1 flex-wrap' : 'gap-3'}`}>
                {datasets && datasets.length == 1 && <div className={`flex items-center gap-2 ${mobilePreview ? 'flex-wrap' : ''}`}>
                    {datasets && datasets.length == 1 && (
                        <span className={`uppercase tracking-wider text-neutral-700 ${mobilePreview ? 'text-xs' : 'text-sm'}`}>{datasetTitles[datasets[0]] || datasets[0]}</span>
                    )}
                    
                </div>}
                {isInit && (
                    <div className={`absolute flex items-end gap-2 ${isMobile ? 'top-3 right-3 flex-col items-end' : 'gap-2 items-center right-2 top-2'}`}>
                                                <ClickableIcon
                            label="Lukk framheva gruppe"
                            remove={["group", "activePoint", "activeYear", "activeName", "init", "resultLimit"]}
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
                                                activePoint: activePointValue,
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

            {!mobilePreview && <>
                <GroupBottomToolbarMulti groupData={resultCardData} groupTotal={resultCardTotal} />
                <GroupBottomToolbarSingle groupData={resultCardData} isSingleSource={hasSingleSource} />
            </>}

        </div>
    );
}
