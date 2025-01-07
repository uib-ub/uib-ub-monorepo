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
import SourceList from "../results/source-list";
import ParamLink from "@/components/ui/param-link";
import { PiArrowLeft, PiCaretLeft, PiFilesFill, PiRows, PiTable, PiX } from "react-icons/pi";
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
    { docLoading && <div className="flex px-4 mt-4 mb-8"><DocSkeleton/></div>}
    {doc && !docLoading && docData?._source &&
    <div className={`${hidden ? 'hidden' : ''} instance-info ${doc != parent ? 'xl:!pt-4 xl:mt-2 pb-4' : ''} xl:px-4 gap-8 flex flex-col`}>
        {(!parent || doc != parent || mode != 'map') && <DocInfo/>}

        {parent ? 
            childrenLoading ? 
                <div className="flex justify-center h-24 m-12"><Spinner status={treeSettings[dataset] ? 'Laster garder' : 'Laster kilder'} className="w-full h-full m-2 self-center" /></div>
            :
        
                <div >

                { treeSettings[dataset] ?  
                    parentData?._id && <CadastralSubdivisions isMobile={true}/>
                :  dataset == 'search' && <>{parent && parent != doc && <h2 className="!text-base font-semibold uppercase !font-sans px-1">Andre kilder</h2>}<SourceList/></>}
                </div>
            

            : null
        }
            { !docLoading && !childrenLoading && !parentLoading &&
            <div className="flex flex-col lg:flex-row gap-1 xl:gap-2 py-4 w-full lg:w-auto text-neutral-950">
            {!parent && treeSettings[dataset] && docData?._source?.sosi == 'gard' && <ParamLink className="flex p-4 lg:p-2   gap-2 w-full lg:w-auto rounded-md bg-neutral-50 border border-neutral-200 h-full items-center no-underline" add={{parent: docData?._source?.uuid}}><PiFilesFill className="text-2xl text-primary-600"/>Underordna bruk</ParamLink>}
            {!parent && docData?._source?.children?.length > 0 && <ParamLink className="flex p-4 lg:p-2 gap-2 w-full lg:w-auto rounded-md bg-neutral-50 border border-neutral-200 h-full items-center no-underline" add={{parent: docData?._source?.uuid}}><PiFilesFill className="text-2xl text-primary-600"/>Kilder</ParamLink>}
            {parent && !treeSettings[dataset] && <ParamLink className="flex p-4 lg:p-2 gap-2 w-full lg:w-auto rounded-md bg-neutral-50 border border-neutral-200 h-full items-center no-underline" remove={['parent']} add={{doc: parent}}><PiArrowLeft className="text-2xl text-primary-600"/>Stedsnavnoppslag</ParamLink>}
            <ParamLink className="flex p-4 lg:p-2 gap-2 w-full lg:w-auto rounded-md bg-neutral-50 border border-neutral-200 h-full items-center no-underline" remove={['doc', 'parent']}>
               { mode == 'table' &&<><PiTable className="text-2xl text-primary-600"/>Vis tabellen</>}
               { mode == 'list' &&<><PiRows className="text-2xl text-primary-600"/>Vis trefflisten</>}
               { mode == 'map' && isMobile && <><PiX className="text-2xl text-primary-600"/>Lukk</>}
            </ParamLink>
            
            </div>
        }
    </div>
}
    </>
}
