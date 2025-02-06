import { fetchSNIDParent } from "@/app/api/_utils/actions"
import { datasetTitles } from "@/config/metadata-config"
import Link from "next/link"


export default async function ServerParent({uuid}: {uuid: string}) {
    const parent = await fetchSNIDParent(uuid)
    

    return <aside className="bg-neutral-50 px-4 pb-4 pt-0 rounded-md">
    <h2 className="!text-neutral-800 !uppercase !font-semibold !tracking-wider !text-sm !font-sans !m-0 pb-4">Overordna oppslag</h2>
    <h3 className="!text-neutral-800 !m-0 !p-0 font-serif !text-xl !font-normal">{parent.fields.label}</h3>
    
    Basert på kjelder i desse datasetta:
    <ul>
        {parent.fields.datasets?.map((dataset: string, index: number) => {
            return <li key={index}>{datasetTitles[dataset]}</li>
        })}
        
    </ul>
    <div className="flex flex-col gap-2 mt-4 w-full">
    <Link href={"/uuid/" + parent.fields.uuid[0]} className="btn btn-primary w-full">Opne</Link>
    <Link href={"/search?dataset=search&doc=" + parent.fields.uuid[0]} className="btn btn-outline">Vis i søket</Link>
    <Link href={"/info/search"} className="btn btn-outline">Les meir</Link>
    
    </div>
    
        
        
        

     
   </aside>


    }