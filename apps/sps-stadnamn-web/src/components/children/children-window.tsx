'use client'
import { useContext } from "react";
import { PiHouseFill, PiTrashFill, PiXBold } from "react-icons/pi";
import { useSearchParams } from "next/navigation";
import { treeSettings } from "@/config/server-config";
import { getValueByPath } from "@/lib/utils";
import { ChildrenContext } from "@/app/children-provider";import { DocContext } from "@/app/doc-provider";
import { useDataset } from "@/lib/search-params";
import Clickable from "../ui/clickable/clickable";
import ClickableIcon from "../ui/clickable/clickable-icon";
import CadastralSubdivisions from "./cadastral-subdivisions";
import SourceList from "./source-list";



export default function ChildrenWindow() {
    const { parentData, docView } = useContext(DocContext)
    const dataset = useDataset()
    const { childrenData, childrenLoading, childrenCount, shownChildrenCount } = useContext(ChildrenContext)
    const searchParams = useSearchParams()
    const doc = searchParams.get('doc')
    const parent = searchParams.get('parent')
    const sourceLabel = searchParams.get('sourceLabel')
    const sourceDataset = searchParams.get('sourceDataset')

    return <>
    <div className={`flex w-full items-center shadow-md`}>
                    
    <h2 className="flex items-center gap-1 p-1 px-2">
        
            <ClickableIcon
                link
                label={dataset == 'search' ? "Vis stadnamnoppslag" : "Vis gard"}
                aria-current={doc == parent ? 'page' : undefined}
                className="group p-1 hover:bg-neutral-100 rounded-full border-2 border-transparent aria-[current='page']:border-accent-800"
                add={{doc: parent}}>
                <PiHouseFill className={`text-primary-600 group-aria-[current='page']:text-accent-800 text-xl`} />
            </ClickableIcon>
        
            <div className="text-xl flex items-center gap-1 flex-col lg:flex-row">
                <div className="max-w-[20svw] lg:!max-w-[10svw] truncate sr-only lg:not-sr-only">
                    {treeSettings[dataset] && ((getValueByPath(parentData._source, treeSettings[dataset]?.subunit) || parentData?._source?.cadastre?.[0]?.gnr?.join(",")) + " ")}
                    {parentData?._source.label}
                </div> 
                <span className="sr-only lg:not-sr-only"> | </span>{treeSettings[dataset] ? 'Underordna bruk' : 'Kjelder'}
            </div>
            { (childrenCount && childrenCount == childrenData?.length) ?
                <div className="!h-6 self-center text-base flex items-center font-bold bg-neutral-50 border border-neutral-200 text-neutral-950 rounded-full px-2 !font-sans">
                {childrenCount != shownChildrenCount ? `${shownChildrenCount}/${childrenCount}` : childrenCount}
                </div> : null
            }
        </h2>
        {(sourceLabel || sourceDataset) && <ClickableIcon label="Fjern filtrering" remove={["sourceDataset", "sourceLabel"]}><PiTrashFill className="text-neutral-800 text-2xl"/></ClickableIcon>}
        
        
        {parent && !childrenLoading && <Clickable link remove={["parent", "sourceDataset", "sourceLabel"]} add={docView?.current ? docView.current : {}} className="text-neutral-800 text-2xl p-2 ml-auto"><PiXBold/></Clickable>}

        
    </div>
    {parentData && 
                <div className="h-full  overflow-y-auto stable-scrollbar px-2">
                    {treeSettings[dataset] && <CadastralSubdivisions/>}
                    {dataset == 'search' && <SourceList/>}
                </div>
            }

    </>
}
