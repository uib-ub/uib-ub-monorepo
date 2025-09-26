import { useMode } from '@/lib/param-hooks';
import { PiArchiveFill, PiArchiveLight, PiCaretDown, PiCaretDownBold, PiCaretLeftBold, PiCaretUp, PiCaretUpBold, PiDatabaseFill, PiDatabaseLight, PiEye, PiEyeBold, PiEyeSlashBold, PiFunnelFill, PiFunnelLight, PiMinusBold, PiPlusBold, PiX } from "react-icons/pi";
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
import { useSessionStore } from '@/state/zustand/session-store';
import { useSearchQuery } from '@/lib/search-params';

export default function NavWindow() {
    const searchParams = useSearchParams()
    const mode = useMode()
    const nav = searchParams.get('nav')
    const datasetTag = searchParams.get('datasetTag')
    const [isPending, startTransition] = useTransition()
    const setDrawerContent = useSessionStore((s) => s.setDrawerContent)
    const { totalHits } = useSearchData()
    const { searchFilterParamsString } = useSearchQuery()

    if (!nav && !totalHits) return null

    const titles = {
        filters: 'Søkealternativ',
        results: mode == 'table' ? 'Tabellvisning' : 'Søkeresultat',
        datasets: 'Datasett',
    }



    return <div className={`xl:absolute left-2 top-[4rem] lg:w-[calc(25svw-1rem)] max-w-[40svw] !z-[3001] max-h-[calc(100svh-4.5rem)] flex flex-col`}>


        {nav && nav != 'results' &&
            <div className="flex flex-col w-full items-center gap-2 mb-2 scroll-container bg-white rounded-md shadow-lg max-h-[calc(100svh-8rem)]">
                <div className="flex border-b border-neutral-200 min-h-12 items-center px-2 w-full"><h2 className="text-xl px-1">{titles[nav as keyof typeof titles]}</h2>
                    <ClickableIcon label="Lukk" remove={["nav"]} onClick={() => setDrawerContent(null)} className="ml-auto">
                        <PiX className="text-3xl text-neutral-900" /></ClickableIcon>
                </div>
                <div className="flex flex-col items-center gap-2 w-full overflow-y-auto stable-scrollbar max-h-[calc(100svh-3.5rem)] xl:max-h-[calc(100svh-6rem)] px-2">
                {nav == 'datasets' && <DatasetFacet />}
                {nav == 'filters' && <FacetSection />}
            </div>
            </div>
        }


        {mode != 'table' && totalHits?.value > 0 && searchFilterParamsString &&
        <div className="flex flex-col items-center gap-2 w-full scroll-container bg-white rounded-md shadow-lg">

                <Clickable onClick={() => setDrawerContent(null)} add={{nav: nav == 'results' ? null : 'results'}} className="flex border-b border-neutral-200 min-h-12 items-center px-2 w-full">
                    
                    <h2 className="flex items-center gap-2 whitespace-nowrap">
                                                <span className="space-x-1">
                                                    <span className="uppercase tracking-wider font-semibold">Treff</span>
                                                    <span className="results-badge text-primary-700 bg-primary-200 font-bold left-8 rounded-full py-0.5 text-sm whitespace-nowrap px-1.5">
                                                        {formatNumber(totalHits.value)}</span></span>
                            </h2>

                        {nav == 'results' ? <PiCaretUp className="ml-auto text-xl text-primary-600" aria-hidden="true"/> 
                        : <PiCaretDown className="ml-auto text-xl text-primary-600" aria-hidden="true"/>}
                </Clickable>
                {nav == 'results' && <div className="w-full overflow-y-auto stable-scrollbar max-h-[calc(100svh-3.5rem)] xl:max-h-[calc(100svh-6rem)]"><SearchResults /></div>}
        </div>
        }



        {nav != 'filters' && mode == 'table' && <>
            <p className="px-1 pt-2">Tabellvisning viser søkeresultat utan gruppering</p>
            <TableOptions />

        </>

        }

    </div>

}


