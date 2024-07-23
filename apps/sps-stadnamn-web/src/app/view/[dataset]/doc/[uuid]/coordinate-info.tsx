

'use client'
import { useEffect } from 'react';
import { PiMapPin, PiCaretDown, PiCaretUp  } from 'react-icons/pi';
import { useState } from 'react';

function convertDMS(lat: number, lon: number): string {
    function toDMS(degree: number, direction: string[]): string {
        const absolute = Math.abs(degree);
        const degrees = Math.floor(absolute);
        const minutesNotTruncated = (absolute - degrees) * 60;
        const minutes = Math.floor(minutesNotTruncated);
        const seconds = (minutesNotTruncated - minutes) * 60; // Keep the decimal part
        return `${degrees}° ${minutes}′ ${seconds.toFixed(2)}″${degree >= 0 ? direction[0] : direction[1]}`;
      }
  
    const latitude = toDMS(lat, ['N', 'S']);
    const longitude = toDMS(lon, ['Ø', 'V']);
    return `${latitude} ${longitude}`;
  }



export default function CoordinateInfo({source}: {source: Record<string, any>}) {

    

    const [expanded, setExpanded] = useState(false)
    const [coordinateData, setCoordinateData] = useState<Record<string, any>>({});


    useEffect(() => {
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



    return (
        <>
        
            <div className="flex items-center space-x-2">
                <PiMapPin className="w-6 h-6" />
                <a className="font-semibold" href={`https://geohack.toolforge.org/geohack.php?pagename=Geohack&params=${source.location.coordinates[1]};${source.location.coordinates[0]}&language=no`}>{convertDMS(source.location.coordinates[1], source.location.coordinates[0])}</a>
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