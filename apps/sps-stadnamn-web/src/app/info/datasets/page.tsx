import type { Metadata } from 'next'

import DatasetBrowser from './dataset-browser';
import Breadcrumbs from '@/components/layout/breadcrumbs';

export const metadata: Metadata = {
    title: 'Datasett',
    description: 'Finn søkevisninger tilpassa dei einskilde datasetta',
  }


export default function Datasets() {
  return (    
    <>
     <Breadcrumbs parentUrl="/info" parentName="Informasjon" currentName="Datasett"/>
        <h1 className="mt-4">Datasett</h1>
        <div className='grid grid-cols-1 xl:grid-cols-4 gap-8 h-full'>
        <DatasetBrowser isMobile={true}/>
        </div>
    
    </>
  );
}