
import { fetchSNIDParent } from "@/app/api/_utils/actions"
import Link from "next/link"
import { PiArrowUpBold } from "react-icons/pi"

export default async function ParentButton({ uuid, dataset }: { uuid: string, dataset: string }) {
    
    const parentDoc = await fetchSNIDParent(uuid)
    return (
        parentDoc.fields?.snid?.[0] && 
          <Link href={`/view/search/doc/${parentDoc.fields.uuid[0]}?snid=${parentDoc.fields.snid[0]}&expanded=${parentDoc.fields.uuid[0]}`}
                className="no-underline inline whitespace-nowrap">
            <PiArrowUpBold aria-hidden="true" className='text-primary-600 inline mr-1'/>
            {dataset == 'search' ? 'Overordna stadnamnside' : 'Vis i overordna søk'}
            </Link> 
            
    )
}