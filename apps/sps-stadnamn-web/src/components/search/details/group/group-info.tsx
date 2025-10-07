import ClientThumbnail from "@/components/doc/client-thumbnail";
import useGroupData from "@/state/hooks/group-data";
import Carousel from "../../nav/results/carousel";
import {  useState } from "react";


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
                    <div key={audioItem.uuid + 'audio'}>JSON.stringify(audioItem)</div>
                ))
            }
            {
                textItems?.map((textItem) => (
                    <div key={textItem.uuid + 'text'}>



                    </div>
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