'use client'
import { useState } from 'react';
import { PiCaretDown, PiCaretUp } from 'react-icons/pi';
export default function OriginalData(rawData: any) {
    const [expanded, setExpanded] = useState(false);
    function renderData(data: any, prefix = ''): any {
        return Object.keys(data).map((key) => {
          const value = data[key];
          const newKey = prefix ? `${prefix}.${key}` : key;
      
          if (Array.isArray(value)) {
            return (
              <>
              
                  {value.map((item, index) => (
                    <li key={newKey + index} className='text-nowrap !py-0'>
                <strong>{key}:</strong>
                      {typeof item === 'object' ? 
                        <ul className="ml-4 !pt-0">
                        {renderData(item, newKey)}
                        </ul>
                         : 
                        <span className='text-nowrap'> {item}</span>}
      
                  </li>
                  ))}
                  </>
      
      
            );
          }
          else if (typeof value === 'object' && value !== null) {
            return (
            <li key={newKey} className="list !py-0">
              <strong>{key}:</strong>
              <ul className="pl-5 !py-0 className='text-nowrap">
                {renderData(value, newKey)}
              </ul>
              </li> 
              )
              
            } else {
            return (
              <li key={newKey} className='text-nowrap !py-0'>
                <strong>{key}:</strong> {value}
              </li>
            );
          }
        });
      }


    return (
        <>
       
        <button onClick={() => setExpanded(currentValue => !currentValue)} className="hover:cursor-pointer text-lg" aria-controls="original_data_list" aria-expanded={expanded}>
            { expanded ? <PiCaretUp className="text2xl inline"/> : <PiCaretDown className="text2xl inline"/>} Rådata </button>
        <div id="original_data_list">
        {expanded &&
            <ul id="original_data_list" className="flex flex-col gap-x-4 list-none p-0 my-2">
                {renderData(rawData)}
            </ul>
        }
        </div>
        </>
    )

    

}