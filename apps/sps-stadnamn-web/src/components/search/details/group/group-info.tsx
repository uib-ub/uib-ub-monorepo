import ClientThumbnail from "@/components/doc/client-thumbnail";
import useGroupData from "@/state/hooks/group-data";
import Carousel from "../../nav/results/carousel";
import AudioExplorer from "@/components/doc/audio-explorer";

export default function GroupInfo() {
    const { groupData } = useGroupData()

    const prviewItems = groupData?.sources?.filter((source: any) => source.iiif || source.content?.html || source.content?.text)
    const audioItems = groupData?.sources?.flatMap((source: any) => source.recordings ?? []);

    
    return (
        <div className="w-full">
            {
                audioItems?.length > 0 && <AudioExplorer recordings={audioItems}/>
            }
            {
                prviewItems?.length > 0 && <Carousel items={prviewItems}/>
            }
            ANNET
            { false && JSON.stringify(groupData)}
        </div>
    );
}