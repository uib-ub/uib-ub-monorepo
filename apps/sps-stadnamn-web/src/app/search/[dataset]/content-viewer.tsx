
import MapExplorer from '@/components/Map/MapExplorer'
import MapView from '@/components/Map/MapView'
import { useSearchParams, useParams } from 'next/navigation'
import { useState, useEffect } from "react"

function renderData(data: any, prefix = ''): any {
  return Object.keys(data).map((key) => {
    const value = data[key];
    const newKey = prefix ? `${prefix}.${key}` : key;

    if (Array.isArray(value)) {
      return (
        <>
        
            {value.map((item, index) => (
              <li key={newKey + index} className='text-nowrap'>
          <strong>{key}:</strong>
                {typeof item === 'object' ? 
                  <ul className="ml-4">
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
      <li key={newKey} className="list">
        <strong>{key}:</strong>
        <ul className="pl-5 className='text-nowrap">
          {renderData(value, newKey)}
        </ul>
        </li> 
        )
        
      } else {
      return (
        <li key={newKey} className='text-nowrap'>
          <strong>{key}:</strong> {value}
        </li>
      );
    }
  });
}
export default function ContentViewer({ mapBounds }: { mapBounds: [number, number][] }) {

    const searchParams = useSearchParams()
    const params = useParams()
    const doc_uuid = searchParams.get('document')
    const view = searchParams.get('view')
    const [doc, setDoc] = useState<any>(null)

    useEffect(() => {
        if (doc_uuid) {
            fetch(`/api/doc?dataset=${params.dataset}&doc=${doc_uuid}`).then(response => response.json()).then(es_data => {
                setDoc(es_data._source)
            })
        }
    }, [doc_uuid, params.dataset])

    

    return (
      <>
      
        { doc && view === 'info' ?
      <div className="mx-2 p-2 lg:overflow-y-auto">
        {doc.location && <div className='lg:float-right'>
        <MapView doc={doc}/>
        </div>}
        <h2 className='mb-3 font-semibold text-lg'>
          {doc.label}</h2>
          {doc.audio ? <audio controls src={`https://iiif.test.ubbe.no/iiif/audio/${params.dataset}/${doc.audio.file}`}></audio> : null}
        {doc.rawData ? <><h3>Opprinnelige data</h3><ul className="flex flex-col gap-x-4 list-none p-0">
          {renderData(doc.rawData)}
          
        </ul>
        </>
        : null}
        
        </div>
        :
        <div className="h-full p-1 card">
      <MapExplorer mapBounds={mapBounds} doc={doc}/>
      </div>
        }

      </>
    )
  }
        

