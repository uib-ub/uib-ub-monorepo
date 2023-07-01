import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import * as jsonld from 'jsonld'
import Subjects from './subject';
import ManifestViewer from '@/components/shared/iiif/manifest-viewer.client';
import { InternationalLabel } from '@/components/shared/international-label.client';

const url = "https://sparql.ub.uib.no/sparql/query?query="

async function getData(id: string) {
  const res = await fetch(`http://localhost:3009/id/${id}`, { next: { revalidate: 10000 } });

  if (!res.ok) {
    throw new Error('Failed to fetch data')
  }

  return res.json()
}

export default async function ItemRoute({
  params
}: {
  params: { locale: string, id: string }
}) {
  const t = await getTranslations('Item');
  const data = await getData(params.id)
  if (!data) {
    notFound();
  }

  return (
    <>
      <div>
        <InternationalLabel label={data.label} lang={params.locale} />
        {data.subjectOfManifest ? <ManifestViewer
          id={data.subjectOfManifest}
          options={{
            canvasBackgroundColor: '#222',
            canvasHeight: '70vh',
            renderAbout: true,
            showIIIFBadge: true,
            showTitle: false,
            showInformationToggle: true,
            openSeadragon: {
              gestureSettingsMouse: {
                scrollToZoom: false,
              },
            },
          }}
        /> : null}
        <div className='flex flex-col gap-2 my-5'>
          <Subjects data={data.subject} />
        </div>
      </div>
    </>
  );
}