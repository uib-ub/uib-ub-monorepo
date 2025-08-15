import { DocContext } from "@/app/doc-provider";
import { GlobalContext } from "@/app/global-provider";
import DynamicClickable from "@/components/ui/clickable/dynamic-clickable";
import { datasetTitles } from "@/config/metadata-config";
import Link from "next/link";
import { useContext } from "react";
import { PiMapPinFill } from "react-icons/pi";

export default function CoordinateMenu() {
    const { coordinateVocab, isMobile } = useContext(GlobalContext)
    const { docData, docLoading, docDataset } = useContext(DocContext)


    const coordinateType = docData?._source.coordinateType
    const coordinateMetadata = coordinateVocab[coordinateType]
    const isOriginal = !coordinateType || (docDataset && ["ssr2016", "ssr2020"].includes(docDataset)) || coordinateMetadata.creator === "ssr"


    return docData?._source.location ? (
            <DynamicClickable href={`info/coordinate-types/${docData._source.coordinateType}`} className={`btn btn-outline btn-compact flex items-center gap-2 h-10 ${!isMobile ? 'pr-4' : ''} min-w-0 shrink`}>
              <div className="flex items-center gap-2 min-w-0">
                <PiMapPinFill className="text-lg text-neutral-600 flex-shrink-0" aria-hidden="true"/>
                {!isMobile && <span className="text-sm truncate block min-w-0">{docData._source.coordinateType ? coordinateVocab[docData._source.coordinateType].creator : datasetTitles[docDataset as string]}{!isOriginal && <span className="text-neutral-700"> (berika)</span>}</span>}
              </div>
              
              
            </DynamicClickable>
          ) : docLoading ? <div className="h-10 w-20 bg-neutral-900/10 rounded animate-pulse"/> : 
          (
            <em className="text-sm text-neutral-500 flex items-center gap-2 p-2">
              Utan koordinater
            </em>
          )}