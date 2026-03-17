import AudioPlayerList from "@/components/audio/audio-player-list";
import Clickable from "@/components/ui/clickable/clickable";
import ClickableIcon from "@/components/ui/clickable/clickable-icon";
import type { ParamProps } from "@/components/ui/clickable/param-types";
import IconButton from "@/components/ui/icon-button";
import { datasetTitles } from "@/config/metadata-config";
import { treeSettings } from "@/config/server-config";
import { useActivePoint, useGroup } from "@/lib/param-hooks";
import { stringToBase64Url } from "@/lib/param-utils";
import { buildTreeParam } from "@/lib/tree-param";
import { getBnr, getGnr, getValueByPath, LG_BASE_MAX_RESULTS, SM_BASE_MAX_RESULTS } from "@/lib/utils";
import useGroupData from "@/state/hooks/group-data";
import { GlobalContext } from "@/state/providers/global-provider";
import { useSessionStore } from "@/state/zustand/session-store";
import { useSearchParams } from "next/navigation";
import { useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { PiCaretLeftBold, PiCaretRightBold, PiCheck, PiLinkSimple, PiMapPin, PiMapPinFill, PiX, PiXBold } from "react-icons/pi";
import Carousel from "../../nav/results/carousel";
import SourceTitle from "../shared/source-title";
import { TextTab } from "./text-tab";
import CoordinateTypeInfo from "../doc/coordinate-type-info";
import { GroupInfoSkeleton } from "../shared/group-header-skeleton";
import DistanceBadge from "../../distance-badge";

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
            <span className="text-neutral-700 px-1">|</span>
            <span className="inline-flex items-center gap-1 text-sm text-neutral-700">
                <span>{visibleSosiTypeKeys.map((typeKey) => sosiTypes[typeKey]).join(", ")}</span>
                {additionalSosiCount > 0 && (
                    <span className="inline-flex items-baseline py-0.5 rounded-full text-xs text-neutral-700 whitespace-nowrap">
                        + {additionalSosiCount}
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
            label="Gå til koordinatet"
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

function GroupBottomToolbarMulti({
    groupData,
    groupTotal,
}: {
    groupData: any;
    groupTotal?: number;
}) {
    const searchParams = useSearchParams();
    const sourceView = searchParams.get("sourceView") === "on";
    const { initValue } = useGroup();
    const { mapFunctionRef, isMobile } = useContext(GlobalContext);
    const snappedPosition = useSessionStore((s) => s.snappedPosition);
    const setSnappedPosition = useSessionStore((s) => s.setSnappedPosition);
    const activePointCoords = useActivePoint();
    const init = searchParams.get('init')
    
    if (!groupData || sourceView || !groupTotal || groupTotal === 1) {
        return null;
    }

    const activeGroupValue = groupData?.group?.id;
    const rawGroupCoordinates = groupData?.fields?.location?.coordinates;
    const groupLatLng: [number, number] | null = rawGroupCoordinates
        ? [Number(rawGroupCoordinates[1]), Number(rawGroupCoordinates[0])]
        : null;
    const activePointValue = rawGroupCoordinates
        ? `${rawGroupCoordinates[1]},${rawGroupCoordinates[0]}`
        : null;
    const isActivePoint =
        !!activePointCoords &&
        !!groupLatLng &&
        Math.abs(activePointCoords[0] - groupLatLng[0]) < 0.000001 &&
        Math.abs(activePointCoords[1] - groupLatLng[1]) < 0.000001;

    return (
        <div className="px-3 ml-auto mt-auto">
            <div className="flex flex-row items-center gap-2">
                {!groupLatLng ? (
                    <span className="text-sm text-neutral-700 px-2 whitespace-nowrap">
                        Utan koordinat
                    </span>
                ) : 
                    init ? null : <CoordinateButton
                        isActive={isActivePoint}
                        onClick={() => {
                            mapFunctionRef.current?.flyTo(groupLatLng, 15, {
                                duration: 0.25,
                                maxZoom: 18,
                                padding: [50, 50],
                            });
                            if (isMobile && snappedPosition !== "bottom") {
                                setSnappedPosition("bottom");
                            }
                        }}
                        remove={["group", "activePoint"]}
                        add={{
                            group:
                                initValue == activeGroupValue
                                    ? null
                                    : stringToBase64Url(groupData.id),
                            activePoint: activePointValue,
                        }}
                    />

                }
                    

                {groupTotal > 0 && (
                    <Clickable
                        className="btn btn-outline btn-compact rounded-full items-center gap-1 pr-2"
                        add={{
                            sourceView: "on",
                            group: stringToBase64Url(groupData.id),
                            maxResults: LG_BASE_MAX_RESULTS,
                            init
                        }}
                    >
                        {groupTotal} kjelder
                        <PiCaretRightBold
                            aria-hidden="true"
                            className="text-primary-700"
                        />
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
    const searchParams = useSearchParams();
    const init = searchParams.get('init')

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

    return (
        <div className="w-full px-3 mt-auto flex flex-col gap-2">
            <div className="flex items-center gap-2 flex-wrap">
                
                {isActivePoint && false && (
                    <span className="basis-full h-0" aria-hidden="true" />
                )}
                <div className={`ml-auto flex items-center gap-2 ${isActivePoint ? "mt-1" : ""}`}>
                    {groupLatLng && !init && (
                        <CoordinateButton
                            isActive={isActivePoint}
                            add={{ activePoint: `${groupLatLng[0]},${groupLatLng[1]}` }}
                            onClick={() => {
                                mapFunctionRef.current?.flyTo(groupLatLng, 15, {
                                    duration: 0.25,
                                    maxZoom: 18,
                                    padding: [50, 50],
                                });
                                if (isMobile && snappedPosition !== "bottom") {
                                    setSnappedPosition("bottom");
                                }
                            }}
                        />
                    )}
                    <IconButton
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
                    </IconButton>
                    <Clickable
                        link={true}
                        href={uuidUrl || ""}
                        disabled={!uuidUrl}
                        className="inline-flex items-center justify-center h-8 rounded-full border border-neutral-300 btn btn-outline shrink-0"
                    >
                        Opne infoside
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

export default function GroupInfo({
    id,
    overrideGroupCode,
    hasIiif,
    distanceMeters,
    mobilePreview,
}: {
    id: string;
    overrideGroupCode?: string;
    hasIiif?: boolean;
    distanceMeters?: number | null;
    mobilePreview?: boolean | undefined;
}) {
    const { groupData, groupLoading, groupTotal } = useGroupData(overrideGroupCode);
    const iiifItems = groupData?.iiifItems;
    const textItems = groupData?.textItems;
    const audioItems = groupData?.audioItems;
    const searchParams = useSearchParams();
    const { initValue } = useGroup();
    const scrollableContentRef = useRef<HTMLDivElement>(null);
    const { isMobile, sosiVocab } = useContext(GlobalContext);
    const snappedPosition = useSessionStore((s) => s.snappedPosition);
    const sourceView = searchParams.get("sourceView") === "on";
    const group = searchParams.get('group');
    const point = searchParams.get('point');
    

    const toText = (value: unknown): string => {
        if (Array.isArray(value)) return value.filter(Boolean).join(" | ");
        return typeof value === "string" ? value : "";
    };

    const fields = groupData?.fields || {};
    const datasets = groupData?.datasets;

    const dataset = Array.isArray(datasets) && datasets.length > 0 ? datasets[0] : undefined;
    const hasSingleSource = groupTotal === 1;
    // Use group fields as primary data source; docData is deprecated and no longer required.
    const source = undefined as any;
    const label =
        (groupData?.fields?.label?.[0] ??
            groupData?.fields?.["group.label"]?.[0] ??
            toText(fields.label)) ||
        toText(fields["group.label"]) ||
        (source ? (Array.isArray(source.label) ? source.label[0] : (source.label as string | undefined)) : "");

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

    const roundCoordString = (value: string, decimals: number) => {
        const n = Number(value)
        if (!Number.isFinite(n)) return value.trim()
        const fixed = n.toFixed(decimals)
        // Trim trailing zeros (and possible trailing dot) for nicer display
        return fixed.replace(/\.?0+$/, '')
    }

    const formatCoordText = (lat: string, lng: string) => {
        // Light rounding for readability (selection is by index, so no ambiguity)
        const d = 6
        return `N ${roundCoordString(lat, d)}°, Ø ${roundCoordString(lng, d)}°`
    }

    // Read activeYear and activeName from URL params
    const activeYear = searchParams.get('activeYear')
    const activeName = searchParams.get('activeName')
    const groupLabel = label
    const isInit = Boolean(!group && initValue && groupData?.id && initValue === groupData.id)
    // Scroll to top when init group changes (when clicking "vel" button)
    useEffect(() => {
        if (groupData?.group?.id && initValue === groupData.id && scrollableContentRef.current) {
            requestAnimationFrame(() => {
                scrollableContentRef.current?.scrollTo({
                    top: 0,
                    behavior: 'auto'
                });
            });
        }
    }, [initValue, groupData?.group?.id, scrollableContentRef]);

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
    const rawGroupCoordinates = groupData?.fields?.location?.coordinates;
    const groupLatLng: [number, number] | null = rawGroupCoordinates
        ? [Number(rawGroupCoordinates[1]), Number(rawGroupCoordinates[0])]
        : null;

    if (groupLoading) {
        return <GroupInfoSkeleton hasIiif={hasIiif} />;
    }

    if (!sourceView && !groupData?.["id"]) {
        console.log("Group ID not found");
        const props = {
            message: `Group ID not found: ${JSON.stringify(groupData)}}`,
        };

        fetch("/api/error", {
            method: "POST",
            body: JSON.stringify(props),
        });
        return (
            <div className="p-2">
                Kunne ikkje lasta inn gruppe {JSON.stringify(groupData)} {overrideGroupCode}
            </div>
        );
    }




    return (
        <div id={id} className={`relative flex min-w-0 flex-col  ${mobilePreview ? 'gap-1 flex-wrap mb-30' : 'gap-3 py-4'}`}>
            <div className={`min-w-0 w-full flex flex-col px-3 ${mobilePreview ? 'gap-1 flex-wrap' : 'gap-3'}`}>
                {datasets && datasets.length == 1 && <div className={`flex items-center gap-2 ${mobilePreview ? 'flex-wrap' : ''}`}>
                    {datasets && datasets.length == 1 && (
                        <span className={`uppercase tracking-wider text-neutral-700 ${mobilePreview ? 'text-xs' : 'text-sm'}`}>{datasetTitles[datasets[0]] || datasets[0]}</span>
                    )}
                    
                </div>}
                {isInit && (
                    <div className="absolute right-3 top-3">
                        <ClickableIcon
                            label="Lukk framheva gruppe"
                            remove={["group", "activePoint", "activeYear", "activeName", "init"]}
                            add={{ maxResults: SM_BASE_MAX_RESULTS }}

                            className="h-6 w-6 p-0 btn btn-outline rounded-full text-neutral-900"
                        >
                            <PiXBold aria-hidden="true" className="text-neutral-800" />
                        </ClickableIcon>
                    </div>
                )}
                {!isInit && point && typeof distanceMeters === "number" && Number.isFinite(distanceMeters) && (
                    <DistanceBadge className="absolute right-3 top-3" meters={distanceMeters} />
                )}

                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-3 flex-wrap">
                        <SourceTitle
                            label={label}
                            cadastrePrefix=""
                            mobilePreview={mobilePreview}
                            additionalLabels={groupData?.additionalLabels as string[] | undefined ?? []}
                        />
                    </div>

                    {groupAdmText && (groupTotal ?? 0) > 1 && (
                        <div className="text-sm text-neutral-800 flex items-center gap-1 flex-wrap">
                            <span>{groupAdmText}</span>
                        </div>
                    )}

                    {hasSingleSource && (
                        <>
                            {dataset && treeSettings[dataset] ? (
                                (() => {
                                    const isTreeDataset = !!treeSettings[dataset];
                                    // Build a minimal "hit" object from group fields for helpers.
                                    const cadastreHit: any = {
                                        fields,
                                    };

                                    const gnr = isTreeDataset ? getGnr(cadastreHit, dataset) : null;
                                    const bnr = isTreeDataset ? getBnr(cadastreHit, dataset) : null;

                                    const withinField = (fields as any)?.within?.[0];
                                    const uuidField = (fields as any)?.uuid?.[0] ?? (source as any)?.uuid;
                                    const isLeaf = isTreeDataset && !!withinField;
                                    const gardUuid = isLeaf ? withinField : (uuidField || null);

                                    const gardName = isTreeDataset
                                        ? (
                                            getValueByPath(fields, treeSettings[dataset]?.parentName) ||
                                            (source ? getValueByPath(source, treeSettings[dataset]?.parentName) : "") ||
                                            (!isLeaf ? label : null) ||
                                            null
                                        )
                                        : null;

                                    const hasAdm = Boolean(adm1 || gnr);

                                    return (hasAdm || (sourceView && rawSosi)) ? (
                                        <div className="text-sm text-neutral-800 flex items-center gap-1 flex-wrap">
                                            {adm1 && (
                                                <Clickable
                                                    link
                                                    className="breadcrumb-link"
                                                    only={{ tree: buildTreeParam({ dataset, adm1 }) }}
                                                    onClick={handleEnterTreeFromBreadcrumb}
                                                >
                                                    {adm1}
                                                </Clickable>
                                            )}
                                            {adm1 && adm2 && <span className="text-neutral-700">/</span>}
                                            {adm2 && (
                                                <Clickable
                                                    link
                                                    className="breadcrumb-link"
                                                    only={{ tree: buildTreeParam({ dataset, adm1, adm2 }) }}
                                                    onClick={handleEnterTreeFromBreadcrumb}
                                                >
                                                    {adm2}
                                                </Clickable>
                                            )}
                                            {gnr && gardUuid && (
                                                <>
                                                    <span className="text-neutral-700">/</span>
                                                    <Clickable
                                                        link
                                                        className="breadcrumb-link"
                                                        only={{ tree: buildTreeParam({ dataset, adm1, adm2, uuid: gardUuid }), doc: gardUuid }}
                                                        onClick={handleEnterTreeFromBreadcrumb}
                                                    >
                                                        {gnr}{gardName ? ` ${gardName}` : ''}
                                                    </Clickable>
                                                </>
                                            )}
                                            {isLeaf && bnr && (
                                                <>
                                                    <span className="text-neutral-700">/</span>
                                                    <Clickable
                                                        link
                                                        className="breadcrumb-link"
                                                        only={{ tree: buildTreeParam({ dataset, adm1, adm2, uuid: gardUuid }), doc: gardUuid }}
                                                        onClick={handleEnterTreeFromBreadcrumb}
                                                    >
                                                        {bnr}{label ? ` ${label}` : ''}
                                                    </Clickable>
                                                </>
                                            )}
                                            {sourceView && <SosiInline rawSosi={rawSosi} sosiVocab={sosiVocab as any} />}
                                        </div>
                                    ) : null;
                                })()
                            ) : (
                                admText && (
                                    <div className="text-sm text-neutral-800 flex items-center gap-1 flex-wrap">
                                        <span>{admText}</span>
                                        {sourceView && <SosiInline rawSosi={rawSosi} sosiVocab={sosiVocab as any} />}
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
                {Array.isArray(audioItems) && audioItems.length > 0 && (
                    <AudioPlayerList
                        recordings={audioItems}
                        showArchiveLink
                    />
                )}
                
                {textItems?.length > 0 && <TextTab textItems={textItems} />}

            

            {(false) && <div className="min-w-0 w-full flex flex-col">
                {/* Filtering / coordinate sticky headers */}
                {false && false && (
                    <div className="sticky top-0 z-10 w-full shrink-0 border-b border-neutral-100 bg-white px-3 pt-2 pb-2">
                        <div className="flex min-w-0 items-center justify-between gap-3 gap-y-2">
                            <div className="min-w-0 flex-1 flex items-center gap-2 text-base text-neutral-900">
                                <span className="font-semibold truncate">
                                    {groupLabel}
                                </span>
                                <span className="truncate text-neutral-900">
                                    {/* detailsRenderer removed */}
                                </span>
                            </div>
                            <Clickable
                                remove={['labelFilter', 'activeName', 'activeYear']}
                                aria-label="Tilbake"
                                className="inline-flex shrink-0 items-center gap-1.5 text-neutral-800 hover:text-neutral-900"
                            >
                                <PiCaretLeftBold className="text-base shrink-0" aria-hidden="true" />
                                <span className="whitespace-nowrap">Tilbake</span>
                            </Clickable>
                        </div>
                    </div>
                )}

                {false && (
                    <div className="w-full shrink-0 border-b border-neutral-100 bg-white px-3 py-3">
                        <div className="flex flex-col min-w-0 gap-y-3">
                            <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-2">
                                {null}
                            </div>
                        </div>
                    </div>
                )}

            </div>}

            {!mobilePreview && <>
                <GroupBottomToolbarMulti groupData={groupData} groupTotal={groupTotal} />
                <GroupBottomToolbarSingle groupData={groupData} isSingleSource={hasSingleSource} />
            </>}

        </div>
    );
}
