import { useMode } from '@/lib/param-hooks';
import { PiArchiveFill, PiArchiveLight, PiDatabaseFill, PiDatabaseLight, PiFunnelFill, PiFunnelLight, PiX } from "react-icons/pi";
import { useTransition } from "react";
import FacetSection from "./facets/facet-section";
import SearchResults from "./results/search-results";
import { useSearchParams } from "next/navigation";
import Spinner from "../../svg/Spinner";
import { formatNumber } from "@/lib/utils";
import DatasetFacet from "./facets/dataset-facet";
import Clickable from "../../ui/clickable/clickable";
import TableOptions from "../table/table-options";
import useSearchData from "@/state/hooks/search-data";
import ClickableIcon from '@/components/ui/clickable/clickable-icon';

export default function NavWindow() {
    const { totalHits, searchLoading } = useSearchData()
    const searchParams = useSearchParams()
    const mode = useMode()
    const nav = searchParams.get('nav')
    const datasetTag = searchParams.get('datasetTag')
    const [isPending, startTransition] = useTransition()

    const titles = {
        filters: 'Filter og søkealternativ',
        results: mode == 'table' ? 'Tabellvisning' : 'Søkeresultat',
    }


    return <>

       <div className="flex p-2"><h2 className="text-xl px-1">{titles[nav as keyof typeof titles]}</h2>
                <ClickableIcon label="Lukk" remove={["nav"]} className="ml-auto">   
                    <PiX className="text-3xl text-neutral-900"/></ClickableIcon>
        </div>
        <div id="nav-window-content" className={`overflow-y-auto stable-scrollbar px-2 max-h-[calc(100svh-11rem)] xl:max-h-[calc(100svh-8.5rem)] pb-6 border-t border-neutral-200 ${(!nav || isPending) ? "hidden" : ""}`}>
                



        
        { nav == 'filters' &&

                <FacetSection/>
        }

        { nav == 'results' && mode != 'table' &&
            <SearchResults/>
        }



        { nav != 'filters' && mode == 'table' && <>
        <p className="px-1 pt-2">Tabellvisning viser søkeresultat utan gruppering</p>
        <TableOptions/>

        </>
          
        }
        
        </div>
        </>
    
}


