import CadastralSubdivisions from "@/components/doc/cadastral-subdivisions"
import SearchLink from "@/components/ui/search-link"
import { treeSettings } from "@/config/server-config"
import { useDataset } from "@/lib/search-params"
import { usePathname, useSearchParams } from "next/navigation"
import { useQueryState } from "nuqs"
import { PiDatabase, PiList, PiMapTrifold, PiTable, PiTreeView } from "react-icons/pi"

export default function TableExplorer() {
    const mode = useQueryState('mode', { defaultValue: 'map' })[0]
    const pathname = usePathname()
    const dataset = useDataset()
    const searchParams = useSearchParams()
    const expanded = useQueryState('expanded')[0]
    const cadastralUnit = useQueryState('cadastralUnit')[0]

    return (
        <div className="">
        { cadastralUnit && 
            <div className="border border-neutral-200">
                <CadastralSubdivisions isMobile={true}/>
            </div>
            }
        </div>
    )
}