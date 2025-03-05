import DocInfo from "./doc-info";
import { useState } from "react";
import { DocContext } from "@/app/doc-provider";
import { ChildrenContext } from "@/app/children-provider";
import { useContext } from "react";
import DocSkeleton from "./doc-skeleton";
import { useSearchParams } from "next/navigation";
import { useDataset } from "@/lib/search-params";
import Spinner from "@/components/svg/Spinner";
import { treeSettings } from "@/config/server-config";
import CadastralSubdivisions from "@/components/children/cadastral-subdivisions";
import SourceList from "../../children/source-list";
import Clickable from "@/components/ui/clickable/clickable";
import { PiArchiveFill, PiArrowLeft, PiBooksFill, PiCaretLeft, PiFilesFill, PiInfoFill, PiRows, PiTable, PiTableFill, PiTag, PiTagFill, PiTreeViewFill, PiX } from "react-icons/pi";
import { GlobalContext } from "@/app/global-provider";


export default function DocExplorer({hidden}: {hidden: boolean}) {
    const { docLoading, docData, parentData, parentLoading } = useContext(DocContext)
    const { childrenLoading } = useContext(ChildrenContext)
    const searchParams = useSearchParams()
    const doc = searchParams.get('doc')
    const dataset = useDataset()
    const parent = searchParams.get('parent')
    const mode = searchParams.get('mode') || 'map'
    const { isMobile } = useContext(GlobalContext)

    
    return <>
    
    {doc && !docLoading && docData?._source &&
    <div className={`${hidden ? 'hidden' : ''} instance-info ${doc != parent ? 'xl:!pt-4 xl:mt-2 pb-4' : ''} xl:px-4 flex flex-col gap-8`}>
        
        <div className="flex flex-col lg:flex-row gap-8">
        { docLoading && <div className="flex px-4 mt-4 mb-8"><DocSkeleton/></div>}
            {(!parent || doc != parent || mode != 'map') && !docLoading && <DocInfo/>}

            {parent ? 
                childrenLoading ? 
                    <div className="flex justify-center h-24 m-12"><Spinner status={treeSettings[dataset] ? 'Lastar garder' : 'Lastar kjelder'} className="w-full h-full m-2 self-center" /></div>
                :
                    <aside className={`flex flex-col gap-2 ml-auto border border-neutral-200 w-full border-t rounded-md`}>
                        { treeSettings[dataset] ?  
                            parentData?._id && <CadastralSubdivisions dataset={dataset} doc={doc} childrenData={docData?._source?.children} landingPage={false} /> 
                        :  dataset == 'search' && <>{parent && parent != doc && <h2 className="!text-base font-semibold uppercase !font-sans px-1">Andre kjelder</h2>}<SourceList/></>}
                    </aside>
                : null
            }
        </div>
        { !docLoading && !childrenLoading && !parentLoading &&
        <div className="flex flex-col lg:flex-row gap-1 xl:gap-2 py-4 w-full lg:w-auto text-neutral-950">
        {!parent && false && treeSettings[dataset] && docData?._source?.sosi == 'gard' && <Clickable link className="flex p-4 lg:p-2   gap-2 w-full lg:w-auto rounded-md bg-neutral-50 border border-neutral-200 h-full items-center no-underline" add={{parent: docData?._source?.uuid}}><PiTreeViewFill className="text-2xl text-primary-600"/>Underordna bruk</Clickable>}
        {false && !parent && docData?._source?.children?.length > 0 && <Clickable link className="flex p-4 lg:p-2 gap-2 w-full lg:w-auto rounded-md bg-neutral-50 border border-neutral-200 h-full items-center no-underline" add={{parent: docData?._source?.uuid}}><PiBooksFill className="text-2xl text-primary-600"/>Kjelder</Clickable>}
        {parent && !treeSettings[dataset] && doc != parent && <Clickable link className="flex p-4 lg:p-2 gap-2 w-full lg:w-auto rounded-md bg-neutral-50 border border-neutral-200 h-full items-center no-underline" remove={['parent']} add={{doc: parent, parent: parent}}><PiInfoFill className="text-2xl text-primary-600"/>Stadnamnoppslag</Clickable>}
        <Clickable link className="flex p-4 lg:p-2 gap-2 w-full lg:w-auto rounded-md bg-neutral-50 border border-neutral-200 h-full items-center no-underline" remove={['doc', 'parent']}>
           { mode == 'table' &&<><PiCaretLeft className="text-2xl text-primary-600"/>Vis trefftabellen</>}
           { mode == 'list' &&<><PiCaretLeft className="text-2xl text-primary-600"/>Vis trefflista</>}
           { mode == 'map' && <><PiX className="text-2xl text-primary-600"/>Lukk</>}
        </Clickable>
        
        </div>
    }
</div>
}
    </>
}
