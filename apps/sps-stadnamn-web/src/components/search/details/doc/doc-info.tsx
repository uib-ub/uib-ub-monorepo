"use client";

import AudioPlayerList from "@/components/audio/audio-player-list";
import { datasetTitles } from "@/config/metadata-config";
import { defaultResultRenderer, resultRenderers } from "@/config/result-renderers";
import Link from "next/link";
import Carousel from "../../nav/results/carousel";
import { TextTab } from "../group/text-tab";

export default function DocInfo({
    id,
    docData,
}: {
    id: string;
    docData?: Record<string, any>;
}) {
    const source = docData?._source || docData;
    const dataset = docData?._index?.split("-")?.[2] ?? source?.dataset;

    if (!source || !dataset) {
        return null;
    }

    const titleRenderer = resultRenderers[dataset]?.title || defaultResultRenderer.title;
    const recordings = Array.isArray(source.recordings)
        ? source.recordings
        : source.audio
            ? [source.audio]
            : [];

    const iiifItems = source.iiif ? [{ ...source, dataset }] : [];
    const textItems = source.content?.html || source.content?.text
        ? [{ ...source, dataset, uuid: source.uuid || docData?._id || "doc" }]
        : [];

    return (
        <div id={id} className="relative flex min-w-0 flex-wrap items-center pb-4">
            {iiifItems.length > 0 && <Carousel items={iiifItems} />}

            <div className="flex flex-col gap-3 py-4 w-full">
                <span className="text-neutral-800 uppercase tracking-wider">
                    {datasetTitles[dataset] || dataset}
                </span>
                {source.uuid && (
                    <Link
                        className="no-underline flex items-center gap-1 hover:bg-neutral-100 rounded-md py-1 !px-3 btn btn-outline btn-compact text-lg text-neutral-950"
                        href={`/uuid/${source.uuid}`}
                    >
                        {titleRenderer(source, "grouped")}
                    </Link>
                )}
            </div>

            <AudioPlayerList recordings={recordings} showArchiveLink />
            {textItems.length > 0 && <TextTab textItems={textItems} />}
        </div>
    );
}
