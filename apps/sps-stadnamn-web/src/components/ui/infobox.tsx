import Link from "next/link";
import { PiLink, PiMagnifyingGlass } from "react-icons/pi";
import { fetchSOSI } from '@/app/api/_utils/actions'

export default async function InfoBox({ items: items, dataset, sosi }: { items: Record<string,any>[], dataset: string, sosi?: string }) {
    const filteredItems = items.filter(item =>  item.value?.length || (item.items?.length && item.items[0].value?.length));

    const sosiData = sosi ? await fetchSOSI(sosi) : null;

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
                {item.items?.map((subItem: any, subIndex: number) => (
                  <Link key={subIndex} className="no-underline flex items-center gap-1" 
                        href={subItem.hrefParams ? buildHref(subItem.hrefParams) : subItem.href}>
                    {subItem.value}
                    <PiMagnifyingGlass aria-hidden={true} className="inline text-primary-600"/>
                  </Link>
                ))

                ||
                ( item.sosi && sosiData?.id ? 

                  <Link className="no-underline flex items-center gap-1" 
                        href={sosiData.id}
                        target="_blank"
                        >
                    {sosiData.label}
                    <PiLink aria-hidden={true} className="inline text-primary-600"/>
                  </Link>
                  :  item.value )
                }

                </p>

            </div>
        ))}
            
     </div>
  
    )
  
  
  }