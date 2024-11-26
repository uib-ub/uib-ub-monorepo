'use client'
import Link from "next/link";
import { PiMagnifyingGlass } from "react-icons/pi";
import { facetConfig } from "@/config/search-config";
import { getValueByPath } from "@/lib/utils";
import { createSerializer, parseAsString } from "nuqs";

export default function FacetsInfobox({ dataset, source }: { dataset: string, source: Record<string,any> }) {
  const serialize = createSerializer({
    dataset: parseAsString,
    expanded: parseAsString,
    ...Object.fromEntries(facetConfig[dataset].map((facet) => [facet.key, parseAsString]))
  })
  

    const items = facetConfig[dataset].filter(item => 
      item.key && !['sosi', 'datasets'].includes(item.key) // Skip fields displayed in dedicated component
    ).map((facet) => {
        const value = getValueByPath(source, facet.key);
        return {
          title: facet.label,
          items: Array.isArray(value) ? value.map((item: any) => ({value: item, 
                                                                  key: facet.key,
                                                                  ...facet.additionalParams ?  {hrefParams: facet.additionalParams.map((param: string) => ({[param]: getValueByPath(source, param)}))} : {}

          })) : [{value: value,
            key: facet.key,
            
            //hrefParams: {adm1: "test", adm2: "hello"}
            ...facet.additionalParams?.length ? {hrefParams: [facet.key, ...facet.additionalParams || []].reduce((acc, param) => ({
              ...acc,
              [param as string]: getValueByPath(source, param)
            }), {})
          } :  {}
                
          }]
        }
      }
    )
    

    const filteredItems = items.filter(item =>  (item.items?.length && item.items[0].value?.length));

    const subitemRenderer = (item: any) => {
      return (
        
        <Link className="no-underline flex items-center gap-1" 
                        href={item.hrefParams ? buildHref(item.hrefParams) : item.href || serialize({dataset,  [item.key]: item.value, expanded: 'results'})}>
                    {item.value}
                    <PiMagnifyingGlass aria-hidden={true} className="inline text-primary-600"/>
                  </Link>
      )
    }


    const buildHref = (params: Record<string, string>) => {
      // Add parameter if value isn't null or empty string
      const newParams = Object.fromEntries(Object.entries(params).filter(([key, value]) => value !== null && value !== ''));
      return serialize({dataset, expanded: 'results', ...newParams})
    }

    return (
      <div className="flex flex-col sm:flex-row flex-wrap gap-8 p-4 bg-neutral-50 border border-neutral-200">
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