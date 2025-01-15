
'use client'
import { useContext, useEffect, useState } from 'react';
import DatasetInfo from '../info/dataset-info';
import DatasetSelector from './dataset-selector';
import { useDataset } from '@/lib/search-params';
import { PiCaretDown, PiCaretUp } from 'react-icons/pi';
import { GlobalContext } from '@/app/global-provider';


export default function DatasetDrawer() {
  const [datasetSelectorOpen, setDatasetSelectorOpen] = useState(false);
  const dataset = useDataset()
  const { isMobile } = useContext(GlobalContext)

  useEffect(() => {
      setDatasetSelectorOpen(false)
  }
  , [dataset])


  return (    
        <section className="flex gap-2 flex-col">
          <DatasetInfo/>
          { isMobile ?
          <h3 className="text-xl px-2 mt-4" >
            Velg søkeperspektiv
          </h3>
          :
          <h3 className="text-lg px-2 mt-4" >
              <button aria-controls="dataset_selector" 
                      className="flex gap-2 items-center"
                      onClick={() => setDatasetSelectorOpen(!datasetSelectorOpen)}
                      aria-expanded={datasetSelectorOpen}>
                        {datasetSelectorOpen ? <PiCaretUp aria-hidden="true" className="text-primary-600"/> : <PiCaretDown aria-hidden="true" className="text-primary-600"/>}
                        Velg søkeperspektiv</button></h3>
          }
          <div id="dataset_selector">
          {(datasetSelectorOpen || isMobile) && <DatasetSelector/>   }
          </div> 
      </section>
  );
}