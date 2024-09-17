

'use client'
import { useEffect } from 'react';
import { useState } from 'react';

export default function CoordinateType({source}: {source: Record<string, any>}) {
    const [expanded, setExpanded] = useState(false)
    const [coordinateData, setCoordinateData] = useState<Record<string, any>>({});

    useEffect(() => {
        console.log(`/api/vocab/${source.coordinateType}`)
        const fetchData = async () => {
         if (source.coordinateType) {
            const res = await fetch(`/api/vocab/${source.coordinateType}`);
          const data = await res.json();
          setCoordinateData(data);
         }
         else {
            setCoordinateData({});
         }
        };
      
        fetchData();
      }, [source]);



    return ( coordinateData._source &&
            <div className="mt-2">
            <button onClick={() => setExpanded(currentValue => !currentValue)} className="hover:cursor-pointer text-lg" aria-controls="original_data_list" aria-expanded={expanded}>
            Koordinattype: {coordinateData._source?.label}</button>
            <div id="original_data_list">
            <p className="mt-1 text-gray-600">{coordinateData._source?.definition}</p>
            
            </div>
            

            
            </div>
    );
}