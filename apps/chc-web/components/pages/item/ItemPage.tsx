import { IIIFMetadata } from 'components/shared/IIIF/IIIFMetadata.client';
import ManifestViewer from 'components/shared/IIIF/ManifestViewer.client';
import { InternationalLabel } from 'components/shared/InternationalLabel.client';

async function getData(manifest: string) {
  const res = await fetch(manifest);
  // The return value is *not* serialized
  // You can return Date, Map, Set, etc.

  // Recommendation: handle errors
  if (!res.ok) {
    // This will activate the closest `error.js` Error Boundary
    throw new Error('Failed to fetch data');
  }

  return res.json();
}

export async function ItemPage({
  data,
  locale
}: {
  data: any,
  locale: string
}) {
  const manifest = await getData(data.subjectOfManifest)

  return (
    <div>
      <InternationalLabel label={data.label} lang={locale} />
      <ManifestViewer
        id={data.subjectOfManifest}
        options={{
          canvasHeight: '70vh',
          /* renderAbout: false,
          showIIIFBadge: false,
          showTitle: false,
          showInformationToggle: false, */
        }}
      />

      <IIIFMetadata label={manifest.label} summary={manifest.summary} metadata={manifest.metadata} lang={locale} />

      {/* <pre className='text-xs'>{JSON.stringify(data, null, 2)}</pre> */}
    </div>
  )
}