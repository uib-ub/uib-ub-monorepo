import ClickableIcon from "../ui/clickable/clickable-icon"
import { PiBookOpenLight, PiListBulletsLight, PiClockCounterClockwiseLight, PiX, PiCaretLeft, PiCaretRight, PiBinocularsLight } from "react-icons/pi"
import IconButton from "../ui/icon-button"
import Link from "next/link"
import DocInfo from "../search/details/doc-info"
import { useSearchParams } from "next/navigation"
import DocSkeleton from "../doc/doc-skeleton"
import { useContext } from "react"
import { DocContext } from "@/app/doc-provider"
import CopyLink from "../doc/copy-link"
import DetailsToolbar from "../doc/details-toolbar"
import { useMode } from "@/lib/search-params"

export default function DetailsWindow() {
    const searchParams = useSearchParams()
    const details = searchParams.get('details') || 'info'
    const doc = searchParams.get('doc')
    const { docLoading, docData } = useContext(DocContext)
    const mode = useMode()


    return <>
    <div className={`flex overflow-x-auto p-2 ${(details || mode == 'map') ? 'gap-1 p-2' : 'flex-col gap-4 py-4 px-2' }`}>
    <ClickableIcon
        label="Oppslag"
        remove={["details"]} 
        aria-selected={details == "info"}
        className="flex h-10 whitespace-nowrap rounded items-center basis-1 gap-1 no-underline w-full lg:w-auto p-1 px-2 text-neutral-900 aria-selected:bg-neutral-100 aria-selected:shadow-inner">
        <PiBookOpenLight className="text-3xl text-neutral-900" aria-hidden="true"/>
    </ClickableIcon>
    
    <ClickableIcon
        label="Liknande treff"
        remove={["details"]} 
        add={{details: "related"}}
        aria-selected={details == "related"}
        className="flex h-10 whitespace-nowrap rounded items-center basis-1 gap-1 no-underline w-full lg:w-auto p-1 px-2 text-neutral-950 aria-selected:bg-neutral-100 aria-selected:shadow-inner">
        <PiBinocularsLight className="text-3xl text-neutral-900" aria-hidden="true"/>
    </ClickableIcon>

    <ClickableIcon
        label="Tidslinje"
        remove={["details"]} 
        add={{details: "timeline"}}
        aria-selected={details == "timeline"}
        className="flex whitespace-nowrap rounded items-center basis-1 gap-1 no-underline w-full lg:w-auto p-1 px-2 text-neutral-950 aria-selected:bg-neutral-100 aria-selected:shadow-inner">
        <PiClockCounterClockwiseLight className="text-3xl text-neutral-900" aria-hidden="true"/>
    </ClickableIcon>
    <ClickableIcon
            label="Lukk"
            remove={["doc", "docDataset", "group"]} 
            className="ml-auto" >
            <PiX aria-hidden="true" className="text-3xl text-neutral-900"/>
    </ClickableIcon>
  </div>
  {details == "info" && doc && !docLoading && docData?._source && <div className="lg:overflow-y-auto stable-scrollbar lg:max-h-[calc(100svh-12rem)] p-4 pb-8 border-t border-neutral-200 ">

 
      <DocInfo/>
  </div>}


  {details == "related" && <div className="lg:overflow-y-auto stable-scrollbar lg:max-h-[calc(100svh-12rem)] p-4 pb-8 border-t border-neutral-200 "></div>}



  { docLoading && details == "info" && <div className="relative break-words p-4 overflow-y-auto stable-scrollbar"><DocSkeleton/></div> }

  {details == "info" && <div className="flex flex-wrap gap-2 justify-between border-t border-neutral-200 p-2 ">
    <div className="flex gap-2 h-10">    

       <IconButton label="Forrige" className="btn btn-outline btn-compact">
        <PiCaretLeft className="text-xl" aria-hidden="true"/>
      </IconButton>
      <span className="text-neutral-900 self-center w-10 text-center">1/2</span>
      <IconButton label="Neste" className="btn btn-outline btn-compact">
        <PiCaretRight className="text-xl" aria-hidden="true"/>
      </IconButton>
  </div>
  <div className="flex gap-2 h-10">
 
<CopyLink uuid={docData?._source?.uuid} className="btn btn-outline btn-compact"/> 

<Link href={"/uuid/" + docData?._source?.uuid} className="btn btn-outline btn-compact">
  Varig side <PiCaretRight className="text-xl" aria-hidden="true"/>
</Link>


    </div>
    </div>
}

</>
}







