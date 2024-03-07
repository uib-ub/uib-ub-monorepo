
import DatasetInfoView from "@/components/DatasetInfo/DatasetInfoView"
export default function Subpage( { params }: { params: { dataset: string, subpage: string } }) {
    console.log(params)
    return (
        <DatasetInfoView dataset={ params.dataset }/>
    )
}