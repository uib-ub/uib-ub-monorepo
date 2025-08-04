
'use client'
import { useEffect, useState } from 'react';
import DatasetSelector from './dataset-selector';
import { usePerspective } from '@/lib/search-params';


export default function DatasetDrawer() {

  const perspective = usePerspective()

 


  return (    
        <section className="flex gap-2 flex-col">


          <h3 className="text-xl px-2 mt-4" >
            Andre søkevisningar
          </h3>
  
      </section>
  );
}