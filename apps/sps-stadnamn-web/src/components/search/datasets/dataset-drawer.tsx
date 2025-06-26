
'use client'
import { useContext, useEffect, useState } from 'react';
import DatasetInfo from '../details/dataset-info';
import DatasetSelector from './dataset-selector';
import { useDataset } from '@/lib/search-params';
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

          <h3 className="text-xl px-2 mt-4" >
            Andre søkevisningar
          </h3>
          <DatasetSelector/>  
      </section>
  );
}