import ClientThumbnail from "@/components/doc/client-thumbnail";
import useGroupData from "@/state/hooks/group-data";
import Carousel from "../../nav/results/carousel";
import {  useMemo, useState } from "react";
import { datasetTitles } from "@/config/metadata-config";
import { formatHtml } from "@/lib/text-utils";


export default function GroupInfo({overrideGroupCode}: {overrideGroupCode?: string}) {
    const { groupData } = useGroupData(overrideGroupCode)

    const { iiifItems, textItems, audioItems, datasets, timelineItems } = useMemo(() => {
        const iiifItems: any[] = []
        const textItems: any[] = []
        const audioItems: any[] = []
        const datasets: Record<string, any[]> = {}
        const timelineItems: any[] = []




        groupData?.sources?.forEach((source: any) => {
            if (source.iiif) {
                iiifItems.push(source)
            }
            if (source.content?.html) {
                textItems.push(source)
            }
            if (source.recordings) {
                audioItems.push(source)
            }
            datasets[source.dataset] = datasets[source.dataset] || []
            datasets[source.dataset].push(source)
        })

        return { iiifItems, textItems, audioItems, datasets, timelineItems }
    }, [groupData])


    
    return (
        <div className="w-full flex flex-col">
            {
                audioItems?.map((audioItem) => (
                    <div key={audioItem.uuid + 'audio'}>JSON.stringify(audioItem)</div>
                ))
            }
            {
                textItems?.map((textItem) => (
                    <div className="p-2" key={textItem.uuid + 'text'}>
                        <strong>{datasetTitles[textItem.dataset]}</strong> | {formatHtml(textItem.content.html)}
                    </div>
                ))
            }

            { iiifItems?.length > 0 && <>
               <Carousel items={iiifItems}/>
                </>
            }

            <div className="p-1 px-2">
            { Object.entries(datasets).map(([dataset, sources]) => (
                <div key={dataset + 'dataset'}>
                    <h3>{datasetTitles[dataset]}</h3>
                    {sources.map((source: any) => (
                        <div key={source.uuid + 'source'}>{source.label}</div>
                    ))}
                </div>
            ))}
            </div>

        </div>
    );
}