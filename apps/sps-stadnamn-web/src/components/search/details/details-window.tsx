import ClickableIcon from "../../ui/clickable/clickable-icon"
import { PiCaretLeftBold, PiX } from "react-icons/pi"
import DocInfo from "./doc/doc-info"
import { useRouter, useSearchParams } from "next/navigation"
import DocSkeleton from "../../doc/doc-skeleton"
import { useContext, useEffect, useState, useRef } from "react"
import { useDocIndex, useGroup, useMode } from "@/lib/param-hooks"
import GroupDetails from "./group/group-details"
import HitNavigation from "./hit-navigation"
import DetailsFooter from "./details-footer"
import DetailsTabs from "./details-tabs"
import DocToolbar from "./doc/doc-toolbar"
import useDocData from "@/state/hooks/doc-data"
import { GlobalContext } from "@/app/global-provider"
import useGroupData from "@/state/hooks/group-data"
import Clickable from "@/components/ui/clickable/clickable"



export default function DetailsWindow() {
    const searchParams = useSearchParams()
    const details = searchParams.get('details') || 'doc'
    const namesNav = searchParams.get('namesNav')
    
    const mode = useMode()
    const { groupData, groupLoading, groupTotal } = useGroupData()
    const router = useRouter()
    const docIndex = useDocIndex()
    const { groupCode } = useGroup()
    const [docUpdated, setDocUpdated] = useState(false)
    const { docLoading, docData, docDataset } = useDocData()
    const doc = searchParams.get('doc')

    console.log("RENDERING")


    useEffect(() => {
        setDocUpdated(true);
        const timeout = setTimeout(() => setDocUpdated(false), 300);
        return () => clearTimeout(timeout);
        
    }, [docIndex, groupCode]);

    useEffect(() => {
        const timeout = setTimeout(() => setDocUpdated(false), 100);
        return () => clearTimeout(timeout);
    }, [docData, groupData]);

    useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
          // Check if the active element is a text input or textarea
          const activeElement = document.activeElement;
          if (activeElement?.tagName === 'INPUT' || 
              activeElement?.tagName === 'TEXTAREA' || 
              activeElement?.getAttribute('contenteditable') === 'true') {
              return;
          }

          
          
          if (!e.shiftKey) return;
          
          if (e.key === 'ArrowLeft') {
              if (docIndex <= 0) return;
              e.preventDefault();
              const params = new URLSearchParams(searchParams);
              params.set('docIndex', docIndex - 1 + '');
              router.push(`?${params.toString()}`);
          }
          
          if (e.key === 'ArrowRight') {
              e.preventDefault();
              if (docIndex >= (groupTotal?.value || 0) - 1) return;
              const params = new URLSearchParams(searchParams);
              params.set('docIndex', docIndex + 1 + '');
              router.push(`?${params.toString()}`);
          }
          if (e.key === 'ArrowUp') {
              e.preventDefault();
              const params = new URLSearchParams(searchParams);
              if (namesNav === 'list') {
                  params.set('namesNav', 'timeline');
                  router.push(`?${params.toString()}`);
              }
              else if (namesNav === 'timeline') {
                params.delete('namesNav');
                params.set('details', 'doc');
                router.push(`?${params.toString()}`);
                  
              }
              else if (details === 'group') {
                  params.set('details', 'doc');
                  router.push(`?${params.toString()}`);
              }
          }
          if (e.key === 'ArrowDown') {
              e.preventDefault();
              const params = new URLSearchParams(searchParams);
              
              if (!namesNav && details === 'doc' && groupTotal?.value && groupTotal.value > 1) {
                  params.set('details', 'group');
              }
              else if (!namesNav) {
                  params.set('namesNav', 'timeline');
                  params.delete('details')
                  params.delete('doc')

              }
              else if (namesNav === 'timeline') {
                  params.set("namesNav", "list")
                  
              }
              router.push(`?${params.toString()}`);
          }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
  }, [groupData, docIndex]);
    

    return <>
    <div className={`flex tabs p-2 border-b border-neutral-200 ${(details || mode == 'map') ? 'gap-2 p-2' : 'flex-col gap-4 py-4 px-2' }`}>

        {details == "doc" && <>

    


    {(groupTotal?.value || (!namesNav && docData)) ?
    
    <div className={`flex gap-2 transition-opacity duration-200 ${docLoading || groupLoading || docUpdated ? 'opacity-50' : 'opacity-100'}`}>

<DocToolbar docData={docData}/>{!doc && <HitNavigation/>}
   
      
  </div>
  : <div className="flex gap-2 justify-between p-2">
  {/* Navigation buttons skeleton */}
  <div className="flex gap-2 h-10">
      <div className="h-10 w-10 bg-neutral-900/10 rounded animate-pulse"></div>
      <div className="h-10 w-10 bg-neutral-900/10 rounded animate-pulse"></div>
      <div className="h-10 w-24 bg-neutral-900/10 rounded animate-pulse"></div>
  </div>
</div>
  
  }
  </>
}   

    
    <div className="flex gap-2 ml-auto">
    
             
    <ClickableIcon
            label="Lukk"
            remove={["doc"]}

            className="h-10 flex items-center p-1 pl-2" >
            <PiX aria-hidden="true" className="text-3xl text-neutral-900"/>
    </ClickableIcon>
  </div>
  </div>

  

  



  {(details == "doc" || groupTotal?.value == 1) && (
  <div className={`overflow-y-auto stable-scrollbar max-h-[calc(100svh-14.5rem)] lg:max-h-[calc(100svh-15.5rem)] border-neutral-200 transition-opacity duration-200 ${docLoading || groupLoading || docUpdated ? 'opacity-50' : 'opacity-100'}`}>
      <DocInfo/>
  </div>
)}
{ (groupLoading || docLoading) && details == "doc" && !docData?._source && <div className="relative break-words p-4 overflow-y-auto stable-scrollbar"><DocSkeleton/></div> }


  


  {details == "group" && <div className="overflow-y-auto stable-scrollbar max-h-[calc(100svh-10rem)] xl:max-h-[calc(100svh-12rem)] p-4 pb-8 border-y border-neutral-200 ">
    <GroupDetails/>
    </div>}



    


  {!docDataset?.endsWith("_g") && details == 'doc' && <DetailsFooter/>}

  
</>
}







