"use client";

import AudioPlayerList from "@/components/audio/audio-player-list";
import ClickableIcon from "@/components/ui/clickable/clickable-icon";
import IconButton from "@/components/ui/icon-button";
import { datasetTitles } from "@/config/metadata-config";
import { treeSettings } from "@/config/server-config";
import { useActivePoint, useGroup } from "@/lib/param-hooks";
import { buildTreeParam } from "@/lib/tree-param";
import { getBnr, getGnr, getValueByPath } from "@/lib/utils";
import { GlobalContext } from "@/state/providers/global-provider";
import { useContext, useMemo, useState } from "react";
import { PiBookOpen, PiCheck, PiGps, PiLinkSimple, PiMapPin, PiMapPinFill, PiPerson, PiPersonSimple, PiX } from "react-icons/pi";
import CoordinateTypeInfo from "./coordinate-type-info";
import SourceTitle from "../shared/source-title";
import Carousel from "../../nav/results/carousel";
import { TextTab } from "../group/text-tab";
import { useSearchParams } from "next/navigation";
import Clickable from "@/components/ui/clickable/clickable";
import DistanceBadge from "@/components/search/distance-badge";

export default function DocInfo({
    id,
    docData,
}: {
    id: string;
    docData?: Record<string, any>;
}) {
    const { mapFunctionRef, sosiVocab } = useContext(GlobalContext);
    const activePoint = useActivePoint();
    const source = docData?._source || docData;
    const dataset = docData?._index?.split("-")?.[2] ?? source?.dataset;
    const searchParams = useSearchParams();
    const { initValue } = useGroup();
    const [linkCopied, setLinkCopied] = useState(false);

    if (!source || !dataset) {
        return null;
    }

    const toText = (value: unknown): string => {
        if (Array.isArray(value)) return value.filter(Boolean).join(" | ");
        return typeof value === "string" ? value : "";
    };
    const label = toText(source.label) || toText(source.title) || toText(source.name);
    const sosiTypes = (Array.isArray(source.sosi) ? source.sosi : source.sosi ? [source.sosi] : [])
        .map((item: unknown) => (typeof item === "string" ? sosiVocab[item]?.label || item : ""))
        .filter(Boolean);
    const isTreeDataset = !!treeSettings[dataset];
    const cadastrePrefix = (() => {
        if (isTreeDataset) return "";
        const firstCadastre = Array.isArray(source.cadastre) ? source.cadastre[0] : source.cadastre;
        const gnr = firstCadastre?.gnr;
        if (gnr == null) return "";
        const gnrText = Array.isArray(gnr) ? gnr.join(",") : String(gnr);
        return gnrText && gnrText !== "0" ? `${gnrText} ` : "";
    })();
    const adm1 = toText(source.adm1);
    const adm2 = toText(source.adm2);
    const adm3 = toText(source.adm3);
    const admText = `${adm3}${adm3 ? " - " : ""}${adm2 && adm1 && adm2 !== adm1 ? `${adm2}, ` : ""}${adm1}`.trim();
    const gnr = isTreeDataset ? getGnr(docData, dataset) : null;
    const bnr = isTreeDataset ? getBnr(docData, dataset) : null;
    const isLeaf = isTreeDataset && !!source.within;
    const gardUuid = isLeaf ? source.within : (source.uuid || null);
    const gardName = isTreeDataset
        ? (getValueByPath(source, treeSettings[dataset]?.parentName) || (!isLeaf ? label : null) || null)
        : null;
    const recordings = Array.isArray(source.recordings)
        ? source.recordings
        : source.audio
            ? [source.audio]
            : [];

    const iiifItems = source.iiif ? [{ ...source, dataset }] : [];
    const textItems = source.content?.html || source.content?.text
        ? [{ ...source, dataset, uuid: source.uuid || docData?._id || "doc" }]
        : [];
    const markerCoords = source?.location?.coordinates ?? docData?.fields?.location?.[0]?.coordinates;
    const docMarkerPosition: [number, number] | null =
        Array.isArray(markerCoords) && markerCoords.length >= 2
            ? (() => {
                  const lat = Number(markerCoords[1]);
                  const lng = Number(markerCoords[0]);
                  return Number.isFinite(lat) && Number.isFinite(lng) ? [lat, lng] : null;
              })()
            : null;
    const isActivePoint =
        !!activePoint &&
        !!docMarkerPosition &&
        Math.abs(activePoint[0] - docMarkerPosition[0]) < 0.000001 &&
        Math.abs(activePoint[1] - docMarkerPosition[1]) < 0.000001;
    const coordinateType = Array.isArray(source.coordinateType)
        ? source.coordinateType[0]
        : source.coordinateType;
    const docUuid = source.uuid || docData?._id || null;
    const initTarget = docUuid;
    const isInit = Boolean(initValue && initTarget && initValue === initTarget);
    const nextInitParam = isInit ? null : initTarget;
    const uuidUrl = useMemo(() => {
        if (!source.uuid) return null;
        const token = String(source.uuid).trim();
        const base = process.env.NODE_ENV == "development" ? "" : "https://stadnamn.no";
        if (token.startsWith("http://") || token.startsWith("https://")) return token;
        if (token.startsWith("/uuid/")) return `${base}${token}`;
        return `${base}/uuid/${token}`;
    }, [source.uuid]);
    const distanceMeters = typeof docData?.distance === "number" ? docData.distance : null;

    return (
        <div id={id} className="relative flex min-w-0 flex-wrap items-center pb-4">
            <div className="absolute right-3 top-3 z-10 flex items-center gap-2">
                {!isInit && typeof distanceMeters === "number" && (
                    <DistanceBadge meters={distanceMeters} />
                )}
                {isInit && (
                    <ClickableIcon
                        label="Fjern som utgangspunkt"
                        remove={["group", "point", "activePoint", "activeYear", "activeName"]}
                        add={{
                            init: null,
                            point: null,
                        }}
                        className="inline-flex items-center justify-center w-8 h-8 rounded-full border border-neutral-300 btn btn-outline shrink-0"
                    >
                        <PiX aria-hidden="true" className="text-lg text-neutral-800" />
                    </ClickableIcon>
                )}
            </div>
            <div className="min-w-0 w-full flex flex-col px-3 py-4">
                {(!searchParams.get('dataset') || searchParams.getAll('dataset')?.length > 1) && <span className="text-neutral-800 uppercase tracking-wider">
                    {datasetTitles[dataset] || dataset}
                </span>}
                {iiifItems.length > 0 && <Carousel items={iiifItems} />}
                <div className="mt-3">
                    <SourceTitle
                        label={label}
                        cadastrePrefix={cadastrePrefix}
                        sosiTypes={sosiTypes}
                        labelClassName="text-lg truncate"
                        sosiClassName="text-lg truncate"
                    />

                    {isTreeDataset ? (
                        (adm1 || gnr) && (
                            <div className="text-sm text-neutral-700 flex items-center gap-1 flex-wrap">
                                {adm1 && (
                                    <Clickable link className="breadcrumb-link" add={{ tree: buildTreeParam({ dataset, adm1 }) }}>
                                        {adm1}
                                    </Clickable>
                                )}
                                {adm1 && adm2 && <span className="text-neutral-400">/</span>}
                                {adm2 && (
                                    <Clickable link className="breadcrumb-link" add={{ tree: buildTreeParam({ dataset, adm1, adm2 }) }}>
                                        {adm2}
                                    </Clickable>
                                )}
                                {gnr && gardUuid && (
                                    <>
                                        <span className="text-neutral-400">/</span>
                                        <Clickable
                                            link
                                            className="breadcrumb-link"
                                            add={{ tree: buildTreeParam({ dataset, adm1, adm2, uuid: gardUuid }), doc: isLeaf ? source.within : undefined }}
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
                                            add={{ tree: buildTreeParam({ dataset, adm1, adm2, uuid: source.within }) }}
                                        >
                                            {bnr}{label ? ` ${label}` : ''}
                                        </Clickable>
                                    </>
                                )}
                            </div>
                        )
                    ) : (
                        admText && <div className="text-sm text-neutral-700">{admText}</div>
                    )}
                </div>
            </div>

            

            <AudioPlayerList recordings={recordings} showArchiveLink />
            
            {textItems?.length > 0 && <TextTab textItems={textItems} />}

            { (
                <div className="w-full px-3 mt-auto">
                    <div className="flex items-center gap-2 flex-wrap">
                        {isActivePoint && (
                            <div className="min-w-0 flex-1 rounded-md border border-neutral-200 bg-neutral-50 px-2 py-1">
                                {coordinateType ? (
                                    <CoordinateTypeInfo coordinateType={coordinateType} />
                                ) : (
                                    <span className="text-sm text-neutral-700">
                                        Opphavleg koordinat i {datasetTitles[dataset] || dataset}
                                    </span>
                                )}
                            </div>
                        )}
                        {isActivePoint && false && <span className="basis-full h-0" aria-hidden="true" />}
                        <div className={`ml-auto flex items-center gap-2 ${isActivePoint ? "mt-1" : ""}`}>
                            {!isInit && docMarkerPosition && false && (
                                <ClickableIcon
                                    label="Bruk som utgangspunkt"
                                    remove={["group", "point", "activePoint", "activeYear", "activeName"]}
                                    add={{
                                        init: nextInitParam,
                                        point: docMarkerPosition
                                            ? `${docMarkerPosition?.[0]},${docMarkerPosition?.[1]}`
                                            : null,
                                    }}
                                    onClick={() => {
                                        if (docMarkerPosition) {
                                            mapFunctionRef.current?.flyTo(docMarkerPosition, 15, {
                                                duration: 0.25,
                                                maxZoom: 18,
                                                padding: [50, 50],
                                            });
                                        }
                                    }}
                                    className="inline-flex items-center justify-center w-8 h-8 rounded-full border border-neutral-300 btn btn-outline shrink-0"
                                >
                                    <PiPerson aria-hidden="true" className="text-lg text-neutral-800" />
                                </ClickableIcon>
                            )}
                            {docMarkerPosition && <ClickableIcon
                                label="Gå til koordinatet"
                                add={{ activePoint: `${docMarkerPosition[0]},${docMarkerPosition[1]}` }}
                                onClick={() => {
                                    mapFunctionRef.current?.flyTo(docMarkerPosition, 15, {
                                        duration: 0.25,
                                        maxZoom: 18,
                                        padding: [50, 50],
                                    });
                                }}
                                className={`inline-flex items-center justify-center w-8 h-8 rounded-full border btn btn-outline shrink-0 ${
                                    isActivePoint
                                        ? "border-accent-800 bg-accent-800 text-white"
                                        : "border-neutral-300"
                                }`}
                            >
                                {isActivePoint ? (
                                    <PiMapPinFill aria-hidden="true" className="text-xl text-white" />
                                ) : (
                                    <PiMapPin aria-hidden="true" className="text-xl text-neutral-800" />
                                )}
                            </ClickableIcon>}
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
                                    linkCopied ? "border-accent-800 bg-accent-800 text-white" : "border-neutral-300"
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
                                href={uuidUrl || ''}
                                disabled={!uuidUrl}
                                className="inline-flex items-center justify-center h-8 rounded-full border border-neutral-300 btn btn-outline shrink-0"
                            >
                                Opne infoside
                            </Clickable>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
