'use client'
import { PiMapPin  } from 'react-icons/pi';
import CoordinateType from './coordinate-type';

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
    return (

        <div id="coordinate_info" className='space-y-6'>
            <div className="flex items-center space-x-2">
                <PiMapPin className="w-6 h-6" />
                <a className="font-semibold" 
                   href={`https://geohack.toolforge.org/geohack.php?pagename=Geohack&params=${source.location.coordinates[1]};${source.location.coordinates[0]}&language=no`}>
                    {convertDMS(source.location.coordinates[1], source.location.coordinates[0])}
                    </a>
            </div>
            {source.coordinateType && 
                <CoordinateType source={source}/> 
            }
            
            </div>
            
    );
}