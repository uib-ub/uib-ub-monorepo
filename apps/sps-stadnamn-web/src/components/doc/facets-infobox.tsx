'use client'
import Link from "next/link";
import { PiFunnel, PiMagnifyingGlass } from "react-icons/pi";
import { facetConfig } from "@/config/search-config";
import { getValueByPath } from "@/lib/utils";
import { createSerializer, parseAsString } from "nuqs";
import { useDataset } from "@/lib/search-params";
import Clickable from "../ui/clickable/clickable";
import { datasetTitles } from "@/config/metadata-config";

export default function FacetsInfobox({ source, docDataset, filteredFacets }: { source: Record<string,any>, docDataset: string | null, filteredFacets: any[] }) {
  const dataset = useDataset()
  if (!docDataset) return null;

  const serialize = createSerializer({
    dataset: parseAsString,
    nav: parseAsString,
    ...Object.fromEntries(facetConfig[docDataset].map((facet) => [facet.key, parseAsString]))
  })
  

    const items = filteredFacets.map((facet) => {
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
    

    const subitemRenderer = (item: any) => {
      if (dataset == docDataset) {
        return (
          <Link className="no-underline flex items-center gap-1" 
                href={item.hrefParams ? buildHref(item.hrefParams) : item.href || serialize({dataset,  [item.key]: item.value, nav: 'results'})}>
                      {item.value}
                      <PiMagnifyingGlass aria-hidden={true} className="inline text-primary-600"/>
          </Link>
        )
      }
      else {
        // No link if not same dataset
        return item.value
      }
    }


    const buildHref = (params: Record<string, string>) => {
      // Add parameter if value isn't null or empty string
      const newParams = Object.fromEntries(Object.entries(params).filter(([key, value]) => value !== null && value !== ''));
      return serialize({dataset, nav: 'results', ...newParams})
    }
    return <div className="flex flex-col gap-4 p-4 inner-slate">
            <div className="flex flex-col sm:flex-row flex-wrap gap-8">
            {items.map((item: Record<string,any> , index: number) => (
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
          {dataset !== docDataset && dataset !== 'all' && (
            <Clickable
              link 
              only={{dataset: docDataset, doc: source.uuid}}
              className="no-underline flex items-center gap-2"
            >
              <PiFunnel aria-hidden={true} className="inline text-primary-600"/>
              Filtrer i søkevisning for {datasetTitles[docDataset]}
            </Clickable>
          )}
        </div>
  
  
  }