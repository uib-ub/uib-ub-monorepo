'use client'
import { useState } from 'react';
import { PiCaretDown, PiCaretDownBold, PiCaretUp, PiCaretUpBold, PiWarningFill } from 'react-icons/pi';
export default function OriginalData({rawData}: {rawData: Record<string, any>}) {
    const [expanded, setExpanded] = useState(false);


    return (
        <>
       <h2 className="!m-0 !p-0">
        <button className="flex items-center gap-1" onClick={() => setExpanded(currentValue => !currentValue)} aria-controls="original_data_list" aria-expanded={expanded}>
            Grunnlagsdata { expanded ? <PiCaretUpBold className="text2xl inline text-primary-700"/> : <PiCaretDownBold className="text2xl text-primary-700"/>} </button>
      </h2>
        <div id="original_data_list">
        {expanded &&
        <div className='bg-neutral-50'><div className="flex text-base gap-2 items-center px-4 py-2"><PiWarningFill className='text-xl' aria-label="Advarsel"/>Kan inneholde feil som ikke vil bli rettet</div>
          <ul id="original_data_list" className="flex flex-col gap-x-4 !list-none p-0">
              <pre className="p-4 overflow-x-auto">
                {JSON.stringify(rawData, null, 2)}
              </pre>
          </ul>
         </div>
        }
        </div>
        </>
    )

    

}