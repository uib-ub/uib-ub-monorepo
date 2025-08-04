import DocInfo from "./doc-info";
import { DocContext } from "@/app/doc-provider";
import { useContext } from "react";
import DocSkeleton from "../../../doc/doc-skeleton";
import { useSearchParams } from "next/navigation";
import { useMode } from "@/lib/search-params";
import Clickable from "@/components/ui/clickable/clickable";
import { PiCaretLeft, PiX } from "react-icons/pi";


export default function DocExplorer({hidden}: {hidden: boolean}) {
    const { docLoading, docData } = useContext(DocContext)
    const searchParams = useSearchParams()
    const doc = searchParams.get('doc')
    const mode = useMode()

    
    return <>
    
    {doc && !docLoading && docData?._source &&
    <div className={`${hidden ? 'hidden' : ''} instance-info xl:px-4 flex flex-col gap-8`}>
        
        <div className="flex flex-col lg:flex-row gap-8">
        { docLoading && <div className="flex px-4 mt-4 mb-8"><DocSkeleton/></div>}
            {(mode != 'map') && !docLoading && <DocInfo/>}
        
        </div>
        { !docLoading &&
        <div className="flex flex-col lg:flex-row gap-1 xl:gap-2 py-4 w-full lg:w-auto text-neutral-950">
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
