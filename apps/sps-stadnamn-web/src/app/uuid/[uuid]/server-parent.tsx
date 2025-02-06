import { fetchSNIDParent } from "@/app/api/_utils/actions"
import { datasetTitles } from "@/config/metadata-config"
import Link from "next/link"
import { PiCaretRight } from "react-icons/pi"


export default async function ServerParent({uuid}: {uuid: string}) {
    const parent = await fetchSNIDParent(uuid)
    

    return <aside className="bg-neutral-800 text-white px-4 pb-4 pt-0 rounded-md">
        <h2 className="!text-neutral-50 !uppercase !font-semibold !tracking-wider !text-sm !font-sans !m-0">Overordna oppslag</h2>
        <h3 className="!text-white !m-0 !p-0 font-serif !text-xl !font-normal flex items-center gap-2">
            <Link aria-label="Opne" href={"/uuid/" + parent.fields.uuid[0]} className="flex items-center gap-2 no-underline text-white">{parent.fields.label}<PiCaretRight className="text-primary-300" aria-hidden="true" /></Link>
        </h3>
        
        <div className="text-sm text-neutral-50">
            Basert på kjelder i desse datasetta:
            <ul>
                {parent.fields.datasets?.map((dataset: string, index: number) => {
                    return <li key={index}>{datasetTitles[dataset]}</li>
                })}
            </ul>
        </div>

        <div className="flex justify-stretch gap-2 mt-4 w-full">
            <Link href={"/search?dataset=search&doc=" + parent.fields.uuid[0]} className="btn btn-dark-outline">Vis i søket</Link>
            <Link href={"/info/search"} className="btn btn-dark-outline">Les meir</Link>
        </div>
    </aside>


    }