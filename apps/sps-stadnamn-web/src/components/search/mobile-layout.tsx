'use client'
import { useContext, useEffect, useRef, useState } from "react"
import { PiBookOpen, PiCaretRightBold, PiGpsFix, PiStackPlus } from "react-icons/pi";
import SearchResults from "./nav/results/search-results";
import { useSearchQuery } from "@/lib/search-params";
import StatusSection from "./status-section";
import TableExplorer from "./table/table-explorer";
import { useSearchParams } from "next/navigation";
import ListExplorer from "./list/list-explorer";
import DocInfo from "./details/doc/doc-info";

import MapWrapper from "../map/map-wrapper";
import useSearchData from "@/state/hooks/search-data";
import { useMode } from "@/lib/param-hooks"
import TreeList from "./nav/tree-list";
import { datasetTitles } from "@/config/metadata-config";
import CadastreBreadcrumb from "./details/doc/cadastre-breadcrumb";
import ClickableIcon from "../ui/clickable/clickable-icon";
import { GlobalContext } from "@/state/providers/global-provider";
import { useSessionStore } from "@/state/zustand/session-store";
import { getMyLocation } from "@/lib/map-utils";
import MapSettings from "../map/map-settings";
import Drawer from "@/components/ui/drawer";
import { RoundButton, RoundIconButton } from "../ui/clickable/round-icon-button";
import ResultExplorer from "./nav/results/result-explorer";
import MapDrawer from "./overlay-interface";

export default function MobileLayout() {

    



    const setMyLocation = useSessionStore((s) => s.setMyLocation);

    const searchParams = useSearchParams()
    const { mapFunctionRef } = useContext(GlobalContext)

    const nav = searchParams.get('nav')

    const doc = searchParams.get('doc')
    const { totalHits, searchLoading } = useSearchData()
    const [facetIsLoading, setFacetIsLoading] = useState(false)
    const mode = useMode()



    return <>

        <div className="scroll-container">
            <MapDrawer />


            <div className={`absolute top-14 m-4 left-0 z-[1000] ${mode == 'map' ? '' : 'max-h-[calc(100svh-3rem)] overflow-auto bg-neutral-50 !m-0 h-full w-full stable-scrollbar'}`}>
                <StatusSection />
                {mode == 'table' && <TableExplorer />}
                {mode == 'list' && <ListExplorer />}
                {doc && mode == 'doc' && <DocInfo />}
            </div>

            {mode == 'map' && <div className="absolute right-0 bottom-0 top-14 max-h-[calc(100svh-3.5rem)] w-full bg-white rounded-md">
                <MapWrapper />

            </div>}

        </div>
    </>
}