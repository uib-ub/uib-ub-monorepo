
import MapExplorer from '@/components/Map/MapExplorer'
import { useSearchParams } from 'next/navigation'
import { useState, useEffect } from "react"

function renderData(data: any, prefix = ''): any {
  return Object.keys(data).map((key) => {
    const value = data[key];
    const newKey = prefix ? `${prefix}.${key}` : key;

    if (typeof value === 'object' && value !== null) {
      return renderData(value, newKey);
    } else {
      return (
        <li key={newKey}>
          <strong>{newKey}:</strong> {value}
        </li>
      );
    }
  });
}

export default function ContentViewer({ mapBounds }: { mapBounds: [number, number][] }) {

    const searchParams = useSearchParams()
    const doc_uuid = searchParams.get('document')
    const [doc, setDoc] = useState<any>(null)

    useEffect(() => {
        if (doc_uuid) {
            fetch('/api/doc?dataset=hord&doc=' + doc_uuid).then(response => response.json()).then(es_data => {
                setDoc(es_data._source)
            })
        }
    }, [doc_uuid])

    

    return (
      <>
      <div className=" md:m-1 h-[75%]">
      <MapExplorer mapBounds={mapBounds} doc={doc}/>
      </div>
      <div className="mx-2 p-2 h-[25%] md:overflow-y-auto">
        { doc ?
        <>
        <h2 className='mb-3 font-semibold text-lg'>
          {doc.label}</h2>
          {doc.audio ? <audio controls src={'https://iiif.test.ubbe.no/iiif/audio/hord/' + doc.audio.file}></audio> : null}
        <ul className="grid grid-cols-3 gap-x-4 list-none p-0">
          {renderData(doc.rawData)}
          
        </ul>
        </>
        :
          <>
          <h2 className='mb-3 font-semibold'>Info</h2>
        List with text:
        <ul>
          <li>- Info about dataset if no place name selected </li>
          <li>- Switch to showing image in map card</li>
        </ul>
        </>
        }
        
      </div>
    </>

    )



}