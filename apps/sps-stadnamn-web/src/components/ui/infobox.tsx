import Link from "next/link";
import { PiMagnifyingGlass } from "react-icons/pi";
import PlaceType from "./place-type";

export default async function InfoBox({ items: items, dataset }: { items: Record<string,any>[], dataset: string }) {
    const filteredItems = items.filter(item =>  item.value?.length || (item.items?.length && item.items[0].value?.length));


    const subitemRenderer = (item: any) => {
      return (
        (item.hrefParams || item.href) &&
        <Link className="no-underline flex items-center gap-1" 
                        href={item.hrefParams ? buildHref(item.hrefParams) : item.href }>
                    {item.value}
                    <PiMagnifyingGlass aria-hidden={true} className="inline text-primary-600"/>
                  </Link>
        ||
        (item.sosi && <PlaceType sosiCode={item.value}/>)
        ||
        item.value
      )
    }


    const buildHref = (params: Record<string, string>) => {
      // Add parameter if value isn't null or empty string
      const searchParams = new URLSearchParams();
      Object.keys(params).forEach(key => {
        if (params[key]) {
          searchParams.append(key, params[key]);
        }
      });
      return `/view/${dataset}?${searchParams.toString()}`;
    }

    return (
      <div className="flex flex-col sm:flex-row flex-wrap gap-8">
        {filteredItems.map((item: Record<string,any> , index: number) => (
            <div key={index} className="flex flex-col">
                <strong className="text-neutral-900">{item.title}</strong>
                <p>
                {item.items?.length == 1 && subitemRenderer(item.items[0])}
                {item.items?.length > 1 && <ul> 
                  {item.items.map((subItem: any, subIndex: number) => (
                    <li key={subIndex}> {subitemRenderer(subItem)} </li>
                  ))}
                </ul> }
                {!item.items &&  subitemRenderer(item)}
        
                </p>

            </div>
        ))}
            
     </div>
  
    )
  
  
  }