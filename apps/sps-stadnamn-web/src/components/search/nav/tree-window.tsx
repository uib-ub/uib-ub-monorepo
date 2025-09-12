'use client'
import { datasetTitles } from "@/config/metadata-config";
import TreeList from "./tree-list";
import { useSearchParams } from "next/navigation";
import ClickableIcon from "@/components/ui/clickable/clickable-icon";
import { PiX } from "react-icons/pi";

export default function TreeWindow() {
    const searchParams = useSearchParams()
    const adm2 = searchParams.get('adm2')
    const adm1 = searchParams.get('adm1')
    const dataset = searchParams.get('dataset')

    return (<>
        <div className="flex p-2 border-b border-neutral-200">
            <h2 className="text-neutral-900 text-xl px-2">
                {adm2 ? adm2 : adm1 ? adm1 : datasetTitles[dataset || '']}
            </h2>
            <ClickableIcon label="lukk" remove={['dataset', 'datasetTag']} add={{details: 'group'}} className="ml-auto">
                <PiX className="text-3xl text-neutral-900"/>
            </ClickableIcon>
        </div>
        <div className="overflow-y-auto stable-scrollbar max-h-[calc(100svh-7rem)] 2xl:max-h-[calc(100svh-8.5rem)]">
            <TreeList/>
        </div>
    </>)
}