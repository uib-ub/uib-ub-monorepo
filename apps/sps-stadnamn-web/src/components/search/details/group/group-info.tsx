import AudioPlayerList from "@/components/audio/audio-player-list";
import Clickable from "@/components/ui/clickable/clickable";
import ClickableIcon from "@/components/ui/clickable/clickable-icon";
import { treeSettings } from "@/config/server-config";
import { useGroup } from "@/lib/param-hooks";
import { stringToBase64Url } from "@/lib/param-utils";
import { buildTreeParam } from "@/lib/tree-param";
import { getBnr, getGnr, getValueByPath } from "@/lib/utils";
import useGroupData from "@/state/hooks/group-data";
import { GlobalContext } from "@/state/providers/global-provider";
import { useSessionStore } from "@/state/zustand/session-store";
import { useSearchParams } from "next/navigation";
import { useContext, useEffect, useRef, type ReactNode } from "react";
import { PiCaretLeftBold, PiCaretRightBold, PiMapPinFill, PiX, PiXBold } from "react-icons/pi";
import Carousel from "../../nav/results/carousel";
import SourceTitle from "../shared/source-title";
import { TextTab } from "./text-tab";
import { DatasetSummary } from "../../dataset-summary";

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
            <span className="text-neutral-400 px-1">|</span>
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

export default function GroupInfo({
    id,
    overrideGroupCode,
}: {
    id: string;
    overrideGroupCode?: string;
}) {
    const { groupData, groupLoading, groupTotal } = useGroupData(overrideGroupCode)
    const iiifItems = groupData?.iiifItems
    const textItems = groupData?.textItems
    const audioItems = groupData?.audioItems
    const uniqueCoordinates = groupData?.uniqueCoordinates
    const searchParams = useSearchParams()
    const { initValue } = useGroup()
    const scrollableContentRef = useRef<HTMLDivElement>(null)
    const { mapFunctionRef, isMobile, sosiVocab } = useContext(GlobalContext)
    const snappedPosition = useSessionStore((s) => s.snappedPosition)
    const setSnappedPosition = useSessionStore((s) => s.setSnappedPosition)
    const activePoint = searchParams.get('activePoint')
    const sourceView = searchParams.get('sourceView') === 'on'
    const isGrouped = !sourceView
    const mobilePreview = snappedPosition == 'bottom' && initValue

    const activeGroupValue = groupData?.group?.id

    const toText = (value: unknown): string => {
        if (Array.isArray(value)) return value.filter(Boolean).join(" | ");
        return typeof value === "string" ? value : "";
    };

    const fields = groupData?.fields || {};
    const datasets = groupData?.datasets;

    const dataset = Array.isArray(datasets) && datasets.length > 0
        ? datasets[0]
        : undefined;
    // Use group fields as primary data source; docData is deprecated and no longer required.
    const source = undefined as any;
    const label =
        (groupData?.fields?.label?.[0] ??
            groupData?.fields?.["group.label"]?.[0] ??
            toText(fields.label)) ||
        toText(fields["group.label"]) ||
        (source ? (Array.isArray(source.label) ? source.label[0] : (source.label as string | undefined)) : "");

    // Prefer group.* for grouped header, fall back to plain adm* fields
    const groupAdm1 = toText(fields["group.adm1"]);
    const groupAdm2 = toText(fields["group.adm2"]);
    const groupAdm3 = toText(fields["group.adm3"]);
    const plainAdm1 = toText(fields.adm1);
    const plainAdm2 = toText(fields.adm2);
    const plainAdm3 = toText(fields.adm3);

    const adm1 = groupAdm1 || plainAdm1 || plainAdm3 || groupAdm3 || (source ? toText((source as any).adm1) : "");
    const adm2 = groupAdm2 || plainAdm2 || (source ? toText((source as any).adm2) : "");
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
    const isInit = Boolean(initValue && groupData?.id && initValue === groupData.id)
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
    const rawGroupCoordinates = groupData?.fields?.location?.coordinates
    const groupLatLng: [number, number] | null = rawGroupCoordinates ? [Number(rawGroupCoordinates[1]), Number(rawGroupCoordinates[0])] : null
    const activePointValue = rawGroupCoordinates ? `${rawGroupCoordinates[1]},${rawGroupCoordinates[0]}` : null

    if (!sourceView) {
        if (groupLoading) return (
            <div className="h-14 flex flex-col mx-2 flex-grow justify-center gap-1 divide-y divide-neutral-300">
          <div className="bg-neutral-900/10 rounded-full h-4 animate-pulse" style={{ width: `10rem` }}></div>
          <div className="bg-neutral-900/10 rounded-full h-4 animate-pulse" style={{ width: `16rem` }}></div>
        </div>
        )

        if (!groupData?.["id"]) {
            console.log("Group ID not found")
            const props = {
                message: `Group ID not found: ${JSON.stringify(groupData)}}`
            }

            fetch('/api/error', {
                method: 'POST',
                body: JSON.stringify(props)
            })
            return <div className="p-2">Kunne ikkje lasta inn gruppe {JSON.stringify(groupData)} {overrideGroupCode}</div>
        }
    }




    return (
        <div id={id} className={`relative flex min-w-0 flex-col  ${mobilePreview ? 'gap-1 flex-wrap' : 'gap-3 pt-2 pb-4'}`}>
            <div className={`min-w-0 w-full flex flex-col px-3  ${mobilePreview ? 'gap-1 flex-wrap' : 'gap-3'}`}>
                <div className={`flex items-center gap-2 ${mobilePreview ? 'flex-wrap' : ''}`}>
                    {datasets && datasets.length > 0 && (
                        <DatasetSummary datasetKeys={datasets} className={`uppercase tracking-[0.12em] text-neutral-700 ${mobilePreview ? 'text-xs' : 'text-sm'}`} />
                    )}
                    {isInit && (
                        <div className="ml-auto flex items-center gap-2">
                            <ClickableIcon
                                label="Fjern som utgangspunkt"
                                remove={["group", "point", "activePoint", "activeYear", "activeName"]}
                                add={{ init: null, point: null }}
                                className="inline-flex items-center justify-center w-8 h-8 rounded-full border border-neutral-300 btn btn-outline shrink-0"
                            >
                                <PiXBold aria-hidden="true" className="text-base text-neutral-800" />
                            </ClickableIcon>
                        </div>
                    )}
                </div>

                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-3">
                        <SourceTitle
                            label={label}
                            cadastrePrefix=""
                            labelClassName={` truncate ${mobilePreview ? 'text-base' : 'text-xl'}`}
                        />
                        {groupData?.additionalLabels?.map((l: string) => (
                            <em key={l} className="text-neutral-700">{l}</em>
                        ))}
                    </div>

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
                            <div className="text-sm text-neutral-700 flex items-center gap-1 flex-wrap">
                                {adm1 && (
                                    <Clickable
                                        link
                                        className="breadcrumb-link"
                                        add={{ tree: buildTreeParam({ dataset, adm1 }) }}
                                        onClick={handleEnterTreeFromBreadcrumb}
                                    >
                                        {adm1}
                                    </Clickable>
                                )}
                                {adm1 && adm2 && <span className="text-neutral-400">/</span>}
                                {adm2 && (
                                    <Clickable
                                        link
                                        className="breadcrumb-link"
                                        add={{ tree: buildTreeParam({ dataset, adm1, adm2 }) }}
                                        onClick={handleEnterTreeFromBreadcrumb}
                                    >
                                        {adm2}
                                    </Clickable>
                                )}
                                {gnr && gardUuid && (
                                    <>
                                        <span className="text-neutral-400">/</span>
                                        <Clickable
                                            link
                                            className="breadcrumb-link"
                                            add={{ tree: buildTreeParam({ dataset, adm1, adm2, uuid: gardUuid }) }}
                                            onClick={handleEnterTreeFromBreadcrumb}
                                        >
                                            {gnr}{gardName ? ` ${gardName}` : ''}
                                        </Clickable>
                                    </>
                                )}
                                {isLeaf && bnr && (
                                    <>
                                        <span className="text-neutral-400">/</span>
                                        <Clickable
                                            link
                                            className="breadcrumb-link"
                                            add={{ tree: buildTreeParam({ dataset, adm1, adm2, uuid: gardUuid }) }}
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
                        <div className="text-sm text-neutral-700 flex items-center gap-1 flex-wrap">
                            <span>{admText}</span>
                            {sourceView && <SosiInline rawSosi={rawSosi} sosiVocab={sosiVocab as any} />}
                        </div>
                    )
                )}
                </div>
                
            </div>
            

            {iiifItems?.length > 0 && <>
                    <Carousel items={iiifItems} />
                </>
                }


                {
                    audioItems?.map((audioItem: any) => (
                        <AudioPlayerList
                            key={audioItem.uuid + "-audio"}
                            recordings={Array.isArray(audioItem.recordings) ? audioItem.recordings : []}
                            showArchiveLink
                        />
                    ))
                }
                
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
                                {(() => {
                                    const total = uniqueCoordinates.length
                                    const activeIndexRaw = uniqueCoordinates.findIndex((c: string) => c === activePoint)
                                    const activeIndex = activeIndexRaw >= 0 ? activeIndexRaw : 0
                                    const coord = uniqueCoordinates[activeIndex]
                                    const [latStr, lngStr] = coord ? coord.split(',') : ['', '']
                                    const coordText = coord ? formatCoordText(latStr, lngStr) : 'koordinater'

                                    const NavBtn = ({
                                        label,
                                        targetIndex,
                                        disabled,
                                        children
                                    }: {
                                        label: string
                                        targetIndex: number
                                        disabled: boolean
                                        children: ReactNode
                                    }) => {
                                        const c = uniqueCoordinates[targetIndex]
                                        const [lat, lng] = c.split(',').map(parseFloat)
                                        return (
                                            <Clickable
                                                add={{ activePoint: c }}
                                                disabled={disabled}
                                                onClick={() => {
                                                    if (disabled) return
                                                    setTimeout(() => {
                                                        mapFunctionRef.current?.flyTo([lat, lng], 15, { duration: 0.25, maxZoom: 18, padding: [50, 50] })
                                                    }, 0)
                                                }}
                                                className={`h-9 w-9 shrink-0 inline-flex items-center justify-center rounded-md text-sm transition-colors border border-neutral-200 ${disabled
                                                    ? 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
                                                    : 'bg-white text-neutral-900 hover:bg-neutral-200'
                                                    }`}
                                                aria-label={label}
                                                title={label}
                                            >
                                                {children}
                                            </Clickable>
                                        )
                                    }

                                    return (
                                        <>
                                            <span className="min-w-0 flex-1 truncate text-base text-neutral-900" title={coordText}>
                                                {coordText}
                                            </span>
                                            {total > 1 && <div className="flex shrink-0 items-center gap-1.5">
                                                <NavBtn label="Førre koordinat" targetIndex={Math.max(0, activeIndex - 1)} disabled={activeIndex === 0}>
                                                    <PiCaretLeftBold aria-hidden="true" />
                                                </NavBtn>
                                                <span className="text-neutral-700 text-sm tabular-nums text-center px-2" aria-hidden="true">
                                                    {activeIndex + 1} av {total}
                                                </span>
                                                <NavBtn label="Neste koordinat" targetIndex={Math.min(total - 1, activeIndex + 1)} disabled={activeIndex === total - 1}>
                                                    <PiCaretRightBold aria-hidden="true" />
                                                </NavBtn>
                                            </div>}
                                        </>
                                    )
                                })()}
                            </div>
                        </div>
                    </div>
                )}

            </div>}

            {!sourceView && <div className="px-3 ml-auto mt-auto">
                <div className="flex flex-row items-center gap-2">


                    {!groupLatLng ?
                        <span className="text-sm text-neutral-700 px-2 whitespace-nowrap">
                            Utan koordinat
                        </span>
                        :

                        <ClickableIcon
                            label="Gå til koordinat"
                            onClick={() => {
                                mapFunctionRef.current?.flyTo(
                                    groupLatLng,
                                    15,
                                    { duration: 0.25, maxZoom: 18, padding: [50, 50] }
                                );
                                if (isMobile && snappedPosition !== 'bottom') {
                                    setSnappedPosition('bottom');
                                }
                            }}
                            remove={['group', 'activePoint']}
                            add={{ group: initValue == activeGroupValue ? null : stringToBase64Url(groupData.id), activePoint: activePointValue }}
                            className="inline-flex items-center justify-center w-8 h-8 rounded-full border border-neutral-300 btn btn-outline"
                        >
                            <PiMapPinFill aria-hidden="true" className="text-xl text-neutral-800" />

                        </ClickableIcon>
                    }

                    
                    {groupTotal > 0 && <Clickable className="btn btn-outline btn-compact rounded-full items-center gap-1 pr-2" add={{ activePoint: activePointValue, sourceView: 'on', group: stringToBase64Url(groupData.id)}}>
                    {groupTotal} oppslag<PiCaretRightBold aria-hidden="true" className="text-primary-700" />
                </Clickable>}

                </div>
            </div>}

        </div>
    );
}
