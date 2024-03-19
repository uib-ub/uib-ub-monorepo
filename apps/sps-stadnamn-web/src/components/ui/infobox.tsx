import Link from "next/link";
import { PiMagnifyingGlass } from "react-icons/pi";

export default function InfoBox({ items: items, dataset }: { items: Record<string,any>[], dataset: string}) {
    const filteredItems = items.filter(item => item.value !== undefined && item.value !== null && item.value !== '');
    return (
      <div className="flex flex-wrap gap-8">
        {filteredItems.map((item: Record<string,any> , index: number) => (
            <div key={index} className="flex flex-col">
                <strong className="text-neutral-900">{item.title}</strong>
                <p>{item.searchFields && Object.values(item.searchFields).every(value => typeof value === 'string') ?
                  
                  <Link className="no-underline flex items-center gap-1" 
                        href={`/view/${dataset}?${Object.entries(item.searchFields).map(([key, value]) => `${key}=${encodeURIComponent(value as string)}`).join('&')}`}>
                          {item.value}
                          <PiMagnifyingGlass aria-hidden={true} className="inline text-primary-600"/>
                  </Link>
                  : item.value}</p>

            </div>
        ))}
            
     </div>
  
    )
  
  
  }