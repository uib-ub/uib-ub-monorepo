import CadastralSubdivisions from "@/components/doc/cadastral-subdivisions"
import { useQueryState } from "nuqs"

export default function TableExplorer() {
    const cadastralUnit = useQueryState('cadastralUnit')[0]
    const nav = useQueryState('nav')[0]

    return (
        <div className="">
        { nav == 'tree' &&
            <div className="border border-neutral-200">
                <CadastralSubdivisions isMobile={true}/>
            </div>
            }
        </div>
    )
}