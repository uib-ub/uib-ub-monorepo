import type { Metadata } from 'next';

import Breadcrumbs from '@/components/layout/breadcrumbs';
import DatasetBrowser from './dataset-browser';

export const metadata: Metadata = {
  title: 'Datasett',
  description: 'Finn søkevisningar tilpassa dei einskilde datasetta',
}


export default function Datasets() {
  return (
    <>
      <Breadcrumbs parentUrl="/info" parentName="Informasjon" currentName="Datasett" />
      <h1 className="mt-4">Datasett</h1>
      <div className='flex flex-col gap-y-4 xl:grid xl:grid-cols-1 xl:grid-cols-4 xl:gap-x-8'>
        <DatasetBrowser />
      </div>

    </>
  );
}