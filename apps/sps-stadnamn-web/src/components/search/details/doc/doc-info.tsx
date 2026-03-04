"use client";

import AudioPlayerList from "@/components/audio/audio-player-list";
import ClickableIcon from "@/components/ui/clickable/clickable-icon";
import IconButton from "@/components/ui/icon-button";
import { datasetTitles } from "@/config/metadata-config";
import { useActivePoint, useGroup } from "@/lib/param-hooks";
import { GlobalContext } from "@/state/providers/global-provider";
import { useContext, useMemo, useState } from "react";
import { PiBookOpen, PiCheck, PiGps, PiLinkSimple, PiMapPin, PiMapPinFill, PiPerson, PiPersonSimple, PiX } from "react-icons/pi";
import CoordinateTypeInfo from "./coordinate-type-info";
import SourceTitle from "../shared/source-title";
import Carousel from "../../nav/results/carousel";
import { TextTab } from "../group/text-tab";
import { useSearchParams } from "next/navigation";
import Clickable from "@/components/ui/clickable/clickable";

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
        if (Array.isArray(value)) return value.filter(Boolean).join("/");
        return typeof value === "string" ? value : "";
    };
    const label = toText(source.label) || toText(source.title) || toText(source.name);
    const sosiTypes = (Array.isArray(source.sosi) ? source.sosi : source.sosi ? [source.sosi] : [])
        .map((item: unknown) => (typeof item === "string" ? sosiVocab[item]?.label || item : ""))
        .filter(Boolean);
    const cadastrePrefix = (() => {
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
    const uuidToken = useMemo(() => source.uuid || docData?._id || null, [docData?._id, source.uuid]);
    const uuidUrl = useMemo(() => {
        if (!uuidToken) return null;
        const token = String(uuidToken).trim();
        const base = process.env.NODE_ENV == "development" ? "" : "https://stadnamn.no";
        if (token.startsWith("http://") || token.startsWith("https://")) return token;
        if (token.startsWith("/uuid/")) return `${base}${token}`;
        return `${base}/uuid/${token}`;
    }, [uuidToken]);

    return (
        <div id={id} className="relative flex min-w-0 flex-wrap items-center pb-4">
            <div className="absolute right-3 top-3 z-10 flex items-center gap-2">
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
                
                <ClickableIcon
                    label={isInit ? "Fjern som utgangspunkt" : "Gå hit"}
                    remove={["group", "point", "activePoint", "activeYear", "activeName"]}
                    add={{
                        init: nextInitParam,
                        point: !isInit && docMarkerPosition
                            ? `${docMarkerPosition[0]},${docMarkerPosition[1]}`
                            : null,
                    }}
                    onClick={() => {
                        if (!isInit && docMarkerPosition) {
                            mapFunctionRef.current?.flyTo(docMarkerPosition, 15, {
                                duration: 0.25,
                                maxZoom: 18,
                                padding: [50, 50],
                            });
                        }       
                    }}
                    className="inline-flex items-center justify-center w-8 h-8 rounded-full border border-neutral-300 btn btn-outline shrink-0"
                >
                    {isInit ? (
                        <PiX aria-hidden="true" className="text-lg text-neutral-800" />
                    ) : (
                        <PiPerson aria-hidden="true" className="text-lg text-neutral-800" />
                    )}
                </ClickableIcon>
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
                    {admText && <div className="text-sm text-neutral-700">{admText}</div>}
                </div>
            </div>

            

            <AudioPlayerList recordings={recordings} showArchiveLink />
            
            {textItems.length > 0 && <TextTab textItems={textItems} />}

            {docMarkerPosition && (
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
                        <ClickableIcon
                            label="Koordinat"
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
                        </ClickableIcon>
                        {isActivePoint && <span className="basis-full h-0" aria-hidden="true" />}
                        <Clickable
                            link={true}
                            href={uuidUrl || ''}
                            disabled={!uuidUrl}
                            className={`inline-flex items-center justify-center h-8 rounded-full border border-neutral-300 btn btn-outline shrink-0 ml-auto ${
                                isActivePoint ? "mt-1" : ""
                            }`}
                >
                    Opne infoside
                </Clickable>
                    </div>
                </div>
            )}
        </div>
    );
}
