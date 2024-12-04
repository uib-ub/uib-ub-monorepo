
'use client'
import { useEffect, useState } from 'react';
import DatasetInfo from '../info/dataset-info';
import DatasetSelector from './dataset-selector';
import { useDataset } from '@/lib/search-params';
import { PiCaretDown, PiCaretUp } from 'react-icons/pi';


export default function DatasetDrawer() {
  const [datasetSelectorOpen, setDatasetSelectorOpen] = useState(false);
  const dataset = useDataset()

  useEffect(() => {
    setDatasetSelectorOpen(false)
  }
  , [dataset])

  return (    
        <section className="flex gap-2 flex-col mobile-padding">
          <h2 className="text-xl font-serif px-2">Datasett</h2>
          <DatasetInfo/>
          <h3 className="text-lg small-caps px-2 mt-4" >
              <button aria-controls="dataset_selector" 
                      className="flex gap-2 items-center"
                      onClick={() => setDatasetSelectorOpen(!datasetSelectorOpen)}
                      aria-expanded={datasetSelectorOpen}>
                        {datasetSelectorOpen ? <PiCaretUp aria-hidden="true" className="text-primary-600"/> : <PiCaretDown aria-hidden="true" className="text-primary-600"/>}
                        Velg datasett</button></h3>
          <div id="dataset_selector">
          {datasetSelectorOpen && <DatasetSelector/>   }
          </div> 
      </section>
  );
}