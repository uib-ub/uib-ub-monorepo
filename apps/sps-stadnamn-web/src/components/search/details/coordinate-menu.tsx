import { DocContext } from "@/app/doc-provider";
import { GlobalContext } from "@/app/global-provider";
import Spinner from "@/components/svg/Spinner";
import Clickable from "@/components/ui/clickable/clickable";
import Link from "next/link";
import { useContext } from "react";
import { PiMapPinFill } from "react-icons/pi";

export default function CoordinateMenu() {
    const { coordinateVocab } = useContext(GlobalContext)
    const { docData, docLoading, docDataset } = useContext(DocContext)

    const coordinateType = docData?._source.coordinateType
    const coordinateMetadata = coordinateVocab[coordinateType]
    const isOriginal = !coordinateType || (docDataset && ["ssr2016", "ssr2020"].includes(docDataset)) || coordinateMetadata.creator === "ssr"


    return docData?._source.location ? (
            <Link href={`info/coordinate-types/${docData._source.coordinateType}`} className="btn btn-outline btn-compact flex items-center gap-2 h-10 pr-4">
              <div className="flex items-center gap-2 min-w-0">
                <PiMapPinFill className="text-xl text-neutral-600" aria-hidden="true"/>
                <span className="text-sm truncate block min-w-0">{docData._source.coordinateType ? coordinateVocab[docData._source.coordinateType].creator : 'Kjeldekoordinat'}{!isOriginal && <span className="text-neutral-700"> (berika)</span>}</span>
              </div>
              
              
            </Link>
          ) : docLoading ? <div className="h-10 w-20 bg-neutral-900/10 rounded animate-pulse"/> : 
          (
            <em className="text-sm text-neutral-500 flex items-center gap-2 p-2">
              Utan koordinater
            </em>
          )}