'use client'
import { datasetTitles } from "@/config/metadata-config";
import TreeList from "./tree-list";
import { useSearchParams } from "next/navigation";
import ClickableIcon from "@/components/ui/clickable/clickable-icon";
import { PiArrowElbowLeftUp, PiArrowUp, PiCaretUp, PiCaretUpBold, PiX } from "react-icons/pi";
import DatasetFacet from "./facets/dataset-facet";
import { useSessionStore } from "@/state/zustand/session-store";

export default function TreeWindow() {
    const searchParams = useSearchParams()
    const adm2 = searchParams.get('adm2')
    const adm1 = searchParams.get('adm1')
    const dataset = searchParams.get('dataset')

    return (<>
        <div className="flex p-2 border-b border-neutral-200">
            <h2 className="text-black text-xl mr-auto mx-1">
                {adm2 ? adm2 : adm1 ? adm1 : dataset ? datasetTitles[dataset || ''] : 'Matriklar'}
            </h2>
            <ClickableIcon label="lukk" remove={['nav']}>
                <PiX className="text-3xl text-neutral-900"/>
            </ClickableIcon>
        </div>
        <div className="overflow-y-auto stable-scrollbar max-h-[calc(100svh-7rem)] 2xl:max-h-[calc(100svh-8.5rem)]">
            {dataset ? <TreeList/> : <DatasetFacet/>}
        </div>
    </>)
}