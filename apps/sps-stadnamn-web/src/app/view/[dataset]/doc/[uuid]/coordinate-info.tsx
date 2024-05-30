

import { fetchDoc } from '@/app/api/_utils/actions'
import { PiMapPin } from 'react-icons/pi';

export default async function CoordinateInfo({ source }: { source: Record<string, any> }) {

    
    const coordinateData = await fetchDoc({dataset: 'vocab', uuid: source.coordinateType});


    return (
        <>
        
            <div className="flex items-center space-x-2">
                <PiMapPin className="w-6 h-6" />
                <p className="font-semibold">Lengdegrad: {source.location.coordinates[0]}, Breddegrad: {source.location.coordinates[1]}</p>
            </div>
            {coordinateData._source ?
            <div className="mt-2">
                <p className="font-semibold">Koordinattype: {coordinateData._source.label}</p>
                <p className="mt-1 text-gray-600">{coordinateData._source.definition}</p>
            </div>
            :
            <p className="font-semibold">Koordinattype: {source.coordinateType || 'Ikke oppgitt'}</p>
            }
        </>
    );
}