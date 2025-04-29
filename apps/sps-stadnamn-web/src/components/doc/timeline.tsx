import { useSearchParams } from "next/navigation";
import Clickable from "../ui/clickable/clickable";
import { GlobalContext } from "@/app/global-provider";
import { useContext } from "react";
import { useMode } from "@/lib/search-params";

export default function Timeline({arr, parent}: {arr: { label: string; year: string }[], parent: string}) {
  const grouped: Record<string,string[]> = {};
  const searchParams = useSearchParams()
  const sourceLabel = searchParams.get('sourceLabel')
  const mode = useMode()
  const { isMobile } = useContext(GlobalContext)

  arr?.forEach(item => {
      if (grouped[item.year]) {
          grouped[item.year].push(item.label);
      } else {
          grouped[item.year] = [item.label];
      }
  });

  const timelineData: Record<string, string[]>[] = Object.keys(grouped).map(year => {
      return { [year]: grouped[year] };
    });


return (
  <ul className='relative !mx-2 !px-0 p-2'>
    {timelineData.map((item, index) => {
      const [year, labels] = Object.entries(item)[0];

      return (
        <li key={index} className='flex items-center !pb-4 !pt-0 relative'>
        
        <div className={`bg-primary-300 absolute w-1 left-0 top-1 ${index === timelineData.length -1 ? 'h-2' : 'h-full'} ${index === 0 && 'mt-2'}`}></div>
        <div className={`w-4 h-4 rounded-full bg-primary-500 absolute -left-1.5 top-2`}></div>
        
        <div className={`ml-6 flex gap-1`}>
        <span className='mr-2 my-1'>{year}</span>
        <div className="flex flex-wrap gap-1 whitespace-nowrap">
              {labels.map((label, i) => { 
                const isActive = sourceLabel === label && (mode == 'map' || mode == 'doc');
                return (
                  <span key={i}>
                    <Clickable 
                      add={{sourceLabel: label, 
                            parent: parent, 
                            doc: parent,
                            ...(mode != 'map' && !isMobile ? {mode: 'doc'} : {})
                          }} 
                      remove={["sourceLabel", "sourceDataset"]} 
                      className={`no-underline border rounded-md px-3 py-1 max-w-[50svw] xl:max-w-[15svw] truncate
                        ${isActive ? '!bg-accent-700 text-white border-accent-700' : 'bg-white border-neutral-200'}`}
                      aria-current={isActive ? 'page' : undefined}
                      link={isMobile || mode != 'list' ? undefined : true}
                    >
                      {label}
                    </Clickable>
                  </span>
                );
              })}
        </div>
        </div>
      </li>
      );
    }
    )}
  </ul>
);
}