import { fetchSNIDParent } from "@/app/api/_utils/actions"
import { datasetTitles } from "@/config/metadata-config"
import Link from "next/link"
import { PiCaretRight } from "react-icons/pi"


export default async function ServerParent({uuid}: {uuid: string}) {
    const parent = await fetchSNIDParent(uuid)
    

    return <aside className="bg-neutral-50 px-4 pb-4 pt-0 rounded-md">
    <h2 className="!text-neutral-800 !uppercase !font-semibold !tracking-wider !text-sm !font-sans !m-0 pb-4">Overordna oppslag</h2>
    <h3 className="!text-neutral-800 !m-0 !p-0 font-serif !text-xl !font-normal flex items-center gap-2">
        
        <Link aria-label="Opne" href={"/uuid/" + parent.fields.uuid[0]} className="flex items-center gap-2 no-underline">{parent.fields.label}<PiCaretRight className="text-primary-600" aria-hidden="true" /></Link>
    </h3>
    
    
    Basert på kjelder i desse datasetta:
    <ul>
        {parent.fields.datasets?.map((dataset: string, index: number) => {
            return <li key={index}>{datasetTitles[dataset]}</li>
        })}
        
    </ul>
    <div className="flex gap-2 mt-4">
    
    <Link href={"/search?dataset=search&doc=" + parent.fields.uuid[0]} className="btn btn-outline">Vis i søket</Link>
    <Link href={"/info/search"} className="btn btn-outline">Les meir</Link>
    
    </div>
    
        
        
        

     
   </aside>


    }