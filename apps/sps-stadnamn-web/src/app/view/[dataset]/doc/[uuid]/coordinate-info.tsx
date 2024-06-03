

'use client'
import { useEffect } from 'react';
import { PiMapPin, PiCaretDown, PiCaretUp  } from 'react-icons/pi';
import { useState } from 'react';



export default function CoordinateInfo({source}: {source: Record<string, any>}) {

    

    const [expanded, setExpanded] = useState(false)
    const [coordinateData, setCoordinateData] = useState<Record<string, any>>({});


    useEffect(() => {
        const fetchData = async () => {
          const res = await fetch(`/api/vocab/${source.coordinateType}`);
          const data = await res.json();
          setCoordinateData(data);
          console.log(data)
        };
      
        fetchData();
      }, [source.coordinateType]);






    return (
        <>
        
            <div className="flex items-center space-x-2">
                <PiMapPin className="w-6 h-6" />
                <p className="font-semibold">Lengdegrad: {source.location.coordinates[0]}, Breddegrad: {source.location.coordinates[1]}</p>
            </div>
            {coordinateData._source &&
            source.coordinateType && 
            <div className="mt-2">
            <button onClick={() => setExpanded(currentValue => !currentValue)} className="hover:cursor-pointer text-lg" aria-controls="original_data_list" aria-expanded={expanded}>
            { expanded ? <PiCaretUp className="text2xl inline"/> : <PiCaretDown className="text2xl inline"/>} Koordinattype: {coordinateData._source.label}</button>
            <div id="original_data_list">
            {expanded &&
            <p className="mt-1 text-gray-600">{coordinateData._source.definition}</p>
            
            }
            </div>
            

            
            </div>

            }
        </>
    );
}