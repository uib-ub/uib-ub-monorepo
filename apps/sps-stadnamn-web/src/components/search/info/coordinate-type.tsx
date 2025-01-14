

'use client'
import { useEffect } from 'react';
import { useState } from 'react';

export default function CoordinateType({source}: {source: Record<string, any>}) {
    const [coordinateData, setCoordinateData] = useState<Record<string, any>>({});

    useEffect(() => {
        console.log(`/api/vocab/${source.coordinateType}`)
        const fetchData = async () => {
         if (source.coordinateType) {
            const res = await fetch(`/api/vocab/${source.coordinateType}`, {cache: 'force-cache'});
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
            <div>
            <h4>
            Koordinattype: {coordinateData._source?.label}</h4>
            <p className="text-gray-600">{coordinateData._source?.definition}</p>
            </div>
    );
}