import Link from "next/link";
import { PiMagnifyingGlass } from "react-icons/pi";
import { facetConfig } from "@/config/search-config";
import { getValueByPath } from "@/lib/utils";

export default function FacetsInfobox({ dataset, source }: { dataset: string, source: Record<string,any> }) {

    const items = facetConfig[dataset].filter(item => 
      !['sosi', 'datasets'].includes(item.key) // Skip fields displayed in dedicated component
    ).map((facet) => {
        const value = getValueByPath(source, facet.key);
        return {
          title: facet.label,
          items: Array.isArray(value) ? value.map((item: any) => ({value: item, 
                                                                   href: `/view/${dataset}?${facet.key}=${encodeURIComponent(item)}`,
                                                                  ...facet.additionalParams ?  {hrefParams: facet.additionalParams.map((param: string) => ({[param]: getValueByPath(source, param)}))} : {}

          })) : [{value: value,
            
            //hrefParams: {adm1: "test", adm2: "hello"}
            ...facet.additionalParams?.length ? {hrefParams: [facet.key, ...facet.additionalParams || []].reduce((acc, param) => ({
              ...acc,
              [param]: getValueByPath(source, param)
            }), {})
          } :  {}
                
          }]
        }
      }
    )

    

    const filteredItems = items.filter(item =>  (item.items?.length && item.items[0].value?.length));

    const subitemRenderer = (item: any) => {
      return (
        ((item.hrefParams || item.href) &&
        <Link className="no-underline flex items-center gap-1" 
                        href={item.hrefParams ? buildHref(item.hrefParams) : item.href }>
                    {item.value}
                    <PiMagnifyingGlass aria-hidden={true} className="inline text-primary-600"/>
                  </Link> )
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
      <div className="flex flex-col sm:flex-row flex-wrap gap-8 p-4 bg-neutral-50">
        {filteredItems.map((item: Record<string,any> , index: number) => (
            <div key={index} className="flex flex-col">
                <strong className="text-neutral-900">{item.title}</strong>
                {item.items?.length == 1 && <p>{subitemRenderer(item.items[0])}</p>}                
                {item.items?.length > 1 && <ul className="!list-none flex flex-wrap gap-x-4 !mx-0 !px-0"> 
                  {item.items.map((subItem: any, subIndex: number) => (
                    <li key={subIndex}> {subitemRenderer(subItem)} </li>
                  ))}
                </ul> }
                {!item.items &&  <p>{subitemRenderer(item)}</p>}

            </div>
        ))}
            
     </div>
  
    )
  
  
  }