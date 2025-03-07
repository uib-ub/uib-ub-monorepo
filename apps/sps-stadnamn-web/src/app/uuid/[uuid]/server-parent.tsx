import { fetchSNIDParent } from "@/app/api/_utils/actions"
import { datasetTitles } from "@/config/metadata-config"
import Link from "next/link"
import { PiCaretRight } from "react-icons/pi"


export default async function ServerParent({uuid}: {uuid: string}) {
    const parent = await fetchSNIDParent(uuid)

    if (!parent?.fields?.label) {
        return null
    }
    

    return <aside className="bg-neutral-50 shadow-md !text-neutral-950 px-4 pb-4 pt-0 rounded-md">
        <h2 className="!text-neutral-800 !uppercase !font-semibold !tracking-wider !text-sm !font-sans !m-0">Overordna søk</h2>
        <h3 className="!m-0 !p-0 font-serif !text-xl !font-normal flex items-center gap-2">
            {parent.fields.label}
        </h3>
        
        <div className="text-sm text-neutral-800">
            Basert på kjelder i desse datasetta:
            <ul>
                {parent.fields.datasets?.map((dataset: string, index: number) => {
                    return <li key={index}>{datasetTitles[dataset]}</li>
                })}
            </ul>
        </div>

        <div className="flex gap-2 mt-4 w-full">
            <Link href={"/uuid/" + parent.fields.uuid[0]} className="btn btn-outline">Opne</Link>
            <Link href={"/search?dataset=search&doc=" + parent.fields.uuid[0]} className="btn btn-outline">Vis i søket</Link>
            <Link href={"/info/search"} className="btn btn-outline">Les meir</Link>
        </div>
    </aside>


    }