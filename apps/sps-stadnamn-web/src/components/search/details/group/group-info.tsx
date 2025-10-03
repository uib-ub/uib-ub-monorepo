import ClientThumbnail from "@/components/doc/client-thumbnail";
import useGroupData from "@/state/hooks/group-data";
import Carousel from "../../nav/results/carousel";
import AudioExplorer from "@/components/doc/audio-explorer";
import { useState } from "react";
import { datasetTitles } from "@/config/metadata-config";

export default function GroupInfo() {
    const { groupData } = useGroupData()

    const [expandedSection, setExpandedSection] = useState<string | null>(null)

    const iiifItems: any[] = []
    const textItems: any[] = []
    const audioItems: any[] = []




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
    })



    
    return (
        <div className="w-full flex flex-col">
            {
                audioItems?.map((audioItem) => (
                    <>JSON.stringify(audioItem)</>
                ))
            }

            { iiifItems?.length > 0 && <>
               <Carousel items={iiifItems}/>
                </>
            }
            { false && JSON.stringify(groupData)}
        </div>
    );
}