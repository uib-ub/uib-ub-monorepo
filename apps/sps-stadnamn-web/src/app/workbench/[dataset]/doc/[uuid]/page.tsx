
import EmbeddedMap from '@/components/Map/EmbeddedMap'

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


export default async function DocumentView({ params }: { params: { dataset: string, uuid: string }}) { 

  async function fetchDoc() {
    'use server'
    const res = await fetch(`https://search.testdu.uib.no/search/stadnamn-${params.dataset}-demo/_doc/${params.uuid}`, {
        method: 'GET',
        headers: {
        'Content-Type': 'application/json',
        'Authorization': `ApiKey ${process.env.ES_TOKEN}`,
        }
    })
  const data = await res.json()
  return data

  }



  if (Array.isArray(params.dataset)) {
      throw new Error('Expected "dataset" to be a string, but received an array');
    }

    const doc = await fetchDoc()
    return (
      
      <div className="mx-2 p-2 lg:overflow-y-auto">
        { doc && <>
      {doc._source.location && <div className='lg:float-right'>
      <EmbeddedMap doc={doc._source}/>
      </div>}
      <h2 className='mb-3 font-semibold text-lg'>
        {doc._source.label}</h2>
        {doc._source.audio ? <audio controls src={`https://iiif.test.ubbe.no/iiif/audio/${params.dataset}/${doc._source.audio.file}`}></audio> : null}
      {doc._source.rawData ? <><h3>Opprinnelige data</h3><ul className="flex flex-col gap-x-4 list-none p-0">
        {renderData(doc._source.rawData)}
        
      </ul>
      </>
      : null}
      </>}
      </div>
    )

  }

