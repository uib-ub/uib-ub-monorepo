import { useState } from 'react';
import { PiCaretDown, PiCaretUp } from 'react-icons/pi';

export default function AdmFacet({ facet }: { facet: any }) {
  const [sortMethod, setSortMethod] = useState('doc_count');
  const [filter, setFilter] = useState('');
  const [expanded, setExpanded] = useState(false);

  const sortBuckets = (buckets: any) => {
    return [...buckets].sort((a, b) => {
      if (sortMethod === 'doc_count') {
        return b.doc_count - a.doc_count;
      } else {
        return a.key.localeCompare(b.key, 'nb');
      }
    });
  };

  return (
    <div className='flex flex-col w-full gap-2'>
    <h2 className='text-lg'>
      <button onClick={() => setExpanded(!expanded)} className='flex w-full items-center justify-between'>Områdefilter { expanded ? <PiCaretUp/> : <PiCaretDown/>}</button>
    </h2>
    { expanded && 
    <>
    <div className='flex gap-2 flex-wrap'>
      <input onChange={(e) => setFilter(e.target.value.toLowerCase())} className="bg-neutral-50 border rounded-sm border-neutral-300 grow"></input>
    <select onChange={(e) => setSortMethod(e.target.value)}>
        <option value="doc_count">antall treff</option>
        <option value="alphabetical">alfabetisk</option>
    </select>
    </div>

    <ul className='w-full'>
      {sortBuckets(facet.buckets).filter(item => item.key.toLowerCase().includes(filter) || item.adm2.buckets.some(subitem => subitem.key.toLowerCase().includes(filter))).map((item, index) => (
        <li key={index} className='w-full mb-2'>
          <label>
            <input type="checkbox" name="adm1" value={item.key} className='mr-2'/>
            {item.key} ({item.doc_count})
            
            <ul>
              {sortBuckets(item.adm2.buckets).filter(subitem => subitem.key.toLowerCase().includes(filter)).map((subitem, subindex) => (
                <li key={subindex} className="ml-4 mt-1 my-1 w-full">
                  <label>
                    <input type="checkbox" name="adm2" value={subitem.key} className='mr-2' />
                    {subitem.key} ({subitem.doc_count})
                    
                  </label>
                </li>
              ))}
            </ul>
          </label>
        </li>
      ))}

    </ul>
    </>}

    </div>
  )

}