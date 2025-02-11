'use client'
import { useContext } from "react";
import { PiBookOpen, PiBookOpenFill, PiHouse, PiHouseFill, PiTag, PiTagFill, PiTrashFill, PiTreeView, PiX, PiXBold } from "react-icons/pi";
import { useSearchParams } from "next/navigation";
import { treeSettings } from "@/config/server-config";
import { getValueByPath } from "@/lib/utils";
import { ChildrenContext } from "@/app/children-provider";import { DocContext } from "@/app/doc-provider";
import { useDataset } from "@/lib/search-params";
import Clickable from "../ui/clickable/clickable";
import ClickableIcon from "../ui/clickable/clickable-icon";
import CadastralSubdivisions from "./cadastral-subdivisions";
import SourceList from "./source-list";
import { GlobalContext } from "@/app/global-provider";



export default function ChildrenWindow() {
    const { parentData, docView } = useContext(DocContext)
    const dataset = useDataset()
    const { childrenData, childrenLoading, childrenCount, shownChildrenCount } = useContext(ChildrenContext)
    const searchParams = useSearchParams()
    const doc = searchParams.get('doc')
    const parent = searchParams.get('parent')
    const sourceLabel = searchParams.get('sourceLabel')
    const sourceDataset = searchParams.get('sourceDataset')
    const { isMobile, preferredTabs } = useContext(GlobalContext)
    const mode = searchParams.get('mode') || 'map'

    return <>
    <div className="flex flex-col h-full">
        <div className={`flex w-full items-center p-1 lg:p-0 shadow-md`}>
                    
    <h2 className="flex items-center gap-1 p-1 px-2 !text-base !font-sans">
        
            <Clickable
                link
                aria-current={doc == parent ? 'page' : undefined}
                className="group p-1 flex gap-1 no-underline items-center rounded-full"
                add={{doc: parent}}>
                <div className="group-hover:bg-neutral-100 p-1 rounded-full group-aria-[current='page']:border-accent-800 border-2 border-transparent">
                    <PiBookOpen className="text-primary-600 group-aria-[current='page']:text-accent-800" />
                </div>
                <div className="max-w-[20svw] lg:!max-w-[10svw] truncate font-semibold">
                    {treeSettings[dataset] && ((getValueByPath(parentData._source, treeSettings[dataset]?.subunit) || parentData?._source?.cadastre?.[0]?.gnr?.join(",")) + " ")}
                    {parentData?._source.label}
                </div>
            </Clickable>
        
            <div className="flex flex-nowrap gap-1 bg-neutral-100 rounded-full px-2">
                
                
                { (childrenCount && childrenCount == childrenData?.length) ?
                <div className="!h-6 ">
                {childrenCount != shownChildrenCount ? `${shownChildrenCount}/${childrenCount}` : childrenCount}
                </div> : null
            }
            {treeSettings[dataset] ? 'bruk' : 'kjelder'}
            </div>
           
        </h2>
        {(sourceLabel || sourceDataset) && <ClickableIcon label="Fjern filtrering" remove={["sourceDataset", "sourceLabel"]}><PiTrashFill className="text-neutral-800 text-2xl"/></ClickableIcon>}
        
        
        {parent && !childrenLoading && 
            <ClickableIcon 
                label="Tilbake" 
                remove={["parent", "sourceDataset", "sourceLabel", ...(mode == 'doc' ? ["mode"] : [])]} 
                add={{...docView?.current ? docView.current : {},
                ...(mode == 'doc' ? {mode: preferredTabs[dataset] || undefined} : {})}}
                className="text-neutral-800 text-2xl p-2 ml-auto"
            >
                {isMobile ? <PiX className="text-neutral-800"/> : <PiXBold/>}
            </ClickableIcon>
        }
        
    </div>
    {parentData && 
                <div className={`h-full  overflow-y-auto stable-scrollbar px-2 ${isMobile ? 'pb-[30svh]' : 'pb-8'}`}>
                    {treeSettings[dataset] && <CadastralSubdivisions/>}
                    {dataset == 'search' && <SourceList/>}
                </div>
            }

    </div>
    </>
}
